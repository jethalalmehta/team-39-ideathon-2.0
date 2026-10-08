import { EligibilityDetail, EligibilityStatus, StudentProfile, Opportunity } from '../types';

export interface EligibilityEvaluationResult {
  status: EligibilityStatus;
  reasons: string[];
  cgpaPassed: boolean;
  backlogsPassed: boolean;
  branchPassed: boolean;
  matchScore: number;
}

/**
 * Single source of truth for eligibility calculation across Nexora.
 * 
 * Rules:
 * CGPA:
 *   - Eligible / Borderline when studentCGPA >= requiredCGPA (Borderline if within 0.25 margin)
 *   - Not eligible when studentCGPA < requiredCGPA
 * 
 * Backlogs:
 *   - Eligible when studentBacklogs <= allowedBacklogs (e.g. if allowed = 0 and student = 0, eligible)
 *   - Not eligible when studentBacklogs > allowedBacklogs
 * 
 * Branch:
 *   - Eligible if allowedBranches includes studentBranch or 'CSE' / 'All'
 * 
 * Reasons list ONLY contains failed criteria (e.g. "✕ CGPA: 6.8 < 7.5") for genuinely ineligible cases,
 * never satisfied requirements.
 */
export function evaluateEligibility(
  opportunityEligibility: EligibilityDetail,
  student: StudentProfile
): EligibilityEvaluationResult {
  const minCgpa = opportunityEligibility.minCgpa;
  const userCgpa = student.cgpa;
  
  // CGPA rule: Eligible when studentCGPA >= requiredCGPA, Not eligible when studentCGPA < requiredCGPA
  const cgpaPassed = userCgpa >= minCgpa;
  
  // Backlog rule: If backlogsAllowed is true (or max > 0), allowed is >0. If backlogsAllowed is false, allowed = 0.
  // Student with 0 backlogs is ALWAYS eligible when allowed = 0 or allowed > 0.
  const studentBacklogs = student.activeBacklogs || 0;
  const backlogsPassed = opportunityEligibility.backlogsAllowed ? true : studentBacklogs === 0;

  // Branch rule
  const studentBranchClean = (student.branch || '').toLowerCase();
  const branchPassed = (opportunityEligibility.allowedBranches || []).some(
    (b) =>
      b.toLowerCase() === 'all' ||
      studentBranchClean.includes(b.toLowerCase()) ||
      b.toLowerCase().includes(studentBranchClean) ||
      b === 'CSE'
  );

  const reasons: string[] = [];

  if (!cgpaPassed) {
    reasons.push(`✕ CGPA: ${userCgpa} < ${minCgpa} (Minimum ${minCgpa} required)`);
  }

  if (!backlogsPassed) {
    reasons.push(`✕ Backlogs: ${studentBacklogs} active backlogs (0 allowed for this drive)`);
  }

  if (!branchPassed) {
    reasons.push(`✕ Branch: ${student.branch} not in allowed branches (${opportunityEligibility.allowedBranches.join(', ')})`);
  }

  let status: EligibilityStatus = 'eligible';
  if (!cgpaPassed || !backlogsPassed || !branchPassed) {
    status = 'not_eligible';
  } else if (userCgpa - minCgpa < 0.25) {
    status = 'borderline';
  } else {
    status = 'eligible';
  }

  // Calculate match score
  let matchScore = 80;
  if (status === 'eligible') {
    matchScore = Math.min(97, Math.max(78, 85 + Math.round((userCgpa - minCgpa) * 8)));
  } else if (status === 'borderline') {
    matchScore = 78;
  } else {
    matchScore = Math.max(45, Math.round(70 - (minCgpa - userCgpa) * 15));
  }

  return {
    status,
    reasons,
    cgpaPassed,
    backlogsPassed,
    branchPassed,
    matchScore,
  };
}
