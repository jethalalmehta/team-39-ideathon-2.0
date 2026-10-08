export type EligibilityStatus = 'eligible' | 'borderline' | 'not_eligible';

export type ApplicationStatus = 'Applied' | 'In Progress' | 'Interview' | 'Rejected' | 'Selected';

export interface ApplicationRecord {
  id: string;
  company: string;
  role: string;
  ctc: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  currentStage: string;
  applicationUrl?: string;
  nextStep?: string;
  interviewDate?: string;
  rejectionReason?: string;
  rejectionStage?: string;
  rejectionTakeaway?: string;
}

export interface EligibilityDetail {
  status: EligibilityStatus;
  reasons: string[];
  minCgpa: number;
  userCgpa: number;
  allowedBranches: string[];
  userBranch: string;
  backlogsAllowed: boolean;
  hasActiveBacklogs: boolean;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  type: 'Full-time' | 'Internship' | '6M Internship + PPO';
  ctc: string; // e.g. "₹18 LPA" or "₹60,000 / month"
  location: string;
  deadline: string; // e.g. "Closes in 3 days"
  deadlineDays: number;
  matchScore: number; // e.g. 94
  eligibility: EligibilityDetail;
  skills: string[];
  rounds: string[];
  description: string;
  noticeRawText?: string;
  applied?: boolean;
  applicationDate?: string;
  applyUrl?: string;
  source: 'TPO Notice' | 'Campus Portal' | 'Parsed Circular';
}

export interface StudentProfile {
  name: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  skills: string[];
  resumeFileName: string;
  targetRole?: string;
}

export type PracticeTopic =
  | 'DSA'
  | 'DBMS'
  | 'Operating Systems'
  | 'Computer Networks'
  | 'OOP'
  | 'Aptitude'
  | 'SQL'
  | 'JavaScript'
  | 'Java'
  | 'Python'
  | 'System Design Basics'
  | 'Software Engineering'
  | 'Computer Architecture'
  | 'Logical Reasoning';
export type PracticeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type PracticeQuestionType = 'Practice' | 'PYQ';

export interface PracticeMCQ {
  id: string;
  question: string;
  topic: PracticeTopic;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  companyTag?: string; // Verified real company or drive source for PYQs
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface DailyGoal {
  id: string;
  icon: string; // e.g. '🧠', '📚', '🎯'
  title: string;
  subtitle: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
  targetTab: 'practice' | 'companies' | 'prepare' | 'progress';
  targetSubTab?: string;
  practiceTopic?: PracticeTopic;
}

export interface ResumeGap {
  id: string;
  area: string;
  severity: 'high' | 'medium';
  description: string;
  recommendation: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'Technical' | 'DSA / System' | 'Behavioral' | 'Project Defense';
  whyAsked: string;
  keyPointsToCover: string[];
}

export interface InterviewMCQ {
  id: string;
  question: string;
  topic: string;
  category: 'Technical' | 'DSA / System' | 'Project Defense' | 'Core CS';
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  whyRelevantToJob: string;
}

export interface CompanyListing {
  id: string;
  name: string;
  category: string;
  headquarters: string;
  tier: string;
  overview: string;
  roles: Opportunity[];
}

export interface RejectionRecord {
  id: string;
  company: string;
  role: string;
  stage: 'Aptitude / Online Test' | 'Technical Round 1' | 'Technical Round 2' | 'HR Round';
  date: string;
  primaryCause: string;
  takeaway: string;
}

export interface ProgressSummary {
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
  biggestPattern: {
    headline: string;
    description: string;
    highlightCount: string;
  };
  nextFocus: {
    title: string;
    action: string;
    suggestedDrill: string;
  };
}

