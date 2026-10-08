import React, { useMemo } from 'react';
import { Opportunity, StudentProfile, PracticeTopic } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, Target, Zap, ShieldAlert, Award } from 'lucide-react';

interface WhyThisCompanyProps {
  opportunity: Opportunity;
  student: StudentProfile;
  onFixGap: (topic: PracticeTopic) => void;
}

interface SkillBreakdown {
  label: string;
  topic: PracticeTopic;
  status: 'strong' | 'good' | 'needs_improvement' | 'weak';
  text: string;
}

export const WhyThisCompany: React.FC<WhyThisCompanyProps> = ({
  opportunity,
  student,
  onFixGap,
}) => {
  // Dynamically calculate readiness and skill strengths/gaps based on opportunity requirements & student profile
  const analysis = useMemo(() => {
    const isEligible = opportunity.eligibility.status === 'eligible';
    const isBorderline = opportunity.eligibility.status === 'borderline';
    
    // Check student skills against required skills
    const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
    const roleLower = opportunity.role.toLowerCase();
    const compName = opportunity.company.toLowerCase();

    // Core skill matches in student profile
    const hasDsa = studentSkillsLower.some((s) => s.includes('dsa') || s.includes('data structures') || s.includes('algorithm') || s.includes('c++') || s.includes('java'));
    const hasSqlOrDbms = studentSkillsLower.some((s) => s.includes('sql') || s.includes('dbms') || s.includes('database') || s.includes('postgres'));
    const hasOop = studentSkillsLower.some((s) => s.includes('oop') || s.includes('object oriented') || s.includes('java') || s.includes('c++'));
    const hasFrontend = studentSkillsLower.some((s) => s.includes('react') || s.includes('javascript') || s.includes('html') || s.includes('css') || s.includes('frontend'));
    const hasPython = studentSkillsLower.some((s) => s.includes('python') || s.includes('fastapi'));
    const hasData = studentSkillsLower.some((s) => s.includes('python') || s.includes('pandas') || s.includes('sql') || s.includes('machine learning'));
    const hasDevOps = studentSkillsLower.some((s) => s.includes('docker') || s.includes('kubernetes') || s.includes('linux') || s.includes('ci/cd'));

    let readinessScore = isEligible ? 88 : isBorderline ? 74 : 58;

    let checklist: SkillBreakdown[] = [];
    let biggestGapTopic: PracticeTopic = 'OOP';
    let whatToImprove = 'Practice 10 OOP MCQs + revise inheritance, dynamic dispatch, and polymorphism.';

    if (roleLower.includes('frontend')) {
      readinessScore = isEligible ? (hasFrontend ? 92 : 76) : 62;
      checklist = [
        {
          label: 'HTML & CSS / Web Standards',
          topic: 'JavaScript',
          status: hasFrontend ? 'strong' : 'needs_improvement',
          text: hasFrontend ? 'Strong (Box model & Flexbox verified)' : 'Needs improvement',
        },
        {
          label: 'JavaScript Internals & DOM',
          topic: 'JavaScript',
          status: hasFrontend ? 'good' : 'needs_improvement',
          text: hasFrontend ? 'Good (Event loop & Closures)' : 'Needs improvement',
        },
        {
          label: 'React & Component Architecture',
          topic: 'JavaScript',
          status: hasFrontend ? 'strong' : 'weak',
          text: hasFrontend ? 'Strong (State management & Hooks)' : 'Weak',
        },
        {
          label: 'Frontend DSA & Problem Solving',
          topic: 'DSA',
          status: hasDsa ? 'strong' : 'needs_improvement',
          text: hasDsa ? 'Strong' : 'Needs improvement',
        },
      ];
      biggestGapTopic = 'JavaScript';
      whatToImprove = 'Master JavaScript Event Loop, Promise chaining microtasks, and React Fiber reconciliation internals.';
    } else if (roleLower.includes('data analyst') || roleLower.includes('data scientist') || roleLower.includes('data platform')) {
      readinessScore = isEligible ? (hasData ? 89 : 72) : 58;
      checklist = [
        {
          label: 'SQL & Query Optimization',
          topic: 'SQL',
          status: hasSqlOrDbms ? 'strong' : 'needs_improvement',
          text: hasSqlOrDbms ? 'Strong (Window functions & Aggregations)' : 'Needs improvement',
        },
        {
          label: 'Python (Pandas / NumPy)',
          topic: 'Python',
          status: hasPython ? 'strong' : 'needs_improvement',
          text: hasPython ? 'Strong (Vectorized math & Dataframes)' : 'Needs improvement',
        },
        {
          label: 'Statistical Modeling & Math',
          topic: 'Aptitude',
          status: 'good',
          text: 'Good (Probability & Distributions)',
        },
        {
          label: 'DBMS Storage & Schema Design',
          topic: 'DBMS',
          status: hasSqlOrDbms ? 'needs_improvement' : 'weak',
          text: hasSqlOrDbms ? 'Needs improvement (OLAP vs OLTP)' : 'Weak',
        },
      ];
      biggestGapTopic = 'SQL';
      whatToImprove = 'Practice advanced SQL window functions (RANK, DENSE_RANK, LEAD/LAG) and GROUP BY rollups.';
    } else if (roleLower.includes('devops') || roleLower.includes('site reliability') || roleLower.includes('sre')) {
      readinessScore = isEligible ? (hasDevOps ? 88 : 70) : 56;
      checklist = [
        {
          label: 'Linux & Operating System Internals',
          topic: 'Operating Systems',
          status: 'needs_improvement',
          text: 'Needs improvement (Process signals & File I/O)',
        },
        {
          label: 'Networking & TCP/IP Protocols',
          topic: 'Computer Networks',
          status: 'good',
          text: 'Good (HTTP/2, DNS, Subnets)',
        },
        {
          label: 'Docker & Containerization',
          topic: 'Software Engineering',
          status: hasDevOps ? 'strong' : 'weak',
          text: hasDevOps ? 'Strong' : 'Weak (Cgroups & Namespaces)',
        },
        {
          label: 'CI/CD & Scripting Automation',
          topic: 'Python',
          status: hasPython ? 'strong' : 'needs_improvement',
          text: hasPython ? 'Strong (Python scripting)' : 'Needs improvement',
        },
      ];
      biggestGapTopic = 'Operating Systems';
      whatToImprove = 'Review Linux process management, file descriptors, system calls (fork/exec), and TCP state machines.';
    } else {
      // General Software Engineer / Backend / Full Stack
      readinessScore = isEligible ? (hasDsa && hasSqlOrDbms ? 91 : 82) : 65;
      checklist = [
        {
          label: 'DSA & Algorithms',
          topic: 'DSA',
          status: hasDsa ? 'strong' : 'needs_improvement',
          text: hasDsa ? 'Strong (Trees & Sliding window verified)' : 'Needs improvement',
        },
        {
          label: 'DBMS & Database Indexing',
          topic: 'DBMS',
          status: hasSqlOrDbms ? 'needs_improvement' : 'weak',
          text: hasSqlOrDbms ? 'Needs improvement (B-Trees & ACID isolation)' : 'Weak',
        },
        {
          label: 'OOP & System Architecture',
          topic: 'OOP',
          status: hasOop ? 'needs_improvement' : 'weak',
          text: hasOop ? 'Needs improvement (Design patterns)' : 'Weak (Inheritance & Polymorphism)',
        },
        {
          label: 'Operating Systems & Concurrency',
          topic: 'Operating Systems',
          status: 'good',
          text: 'Good (Mutexes & Virtual Memory)',
        },
      ];
      biggestGapTopic = hasSqlOrDbms ? 'OOP' : 'DBMS';
      whatToImprove = hasSqlOrDbms
        ? 'Practice 10 OOP MCQs + revise inheritance, dynamic dispatch, and polymorphism.'
        : 'Revise Database Indexing (B-Trees) and ACID isolation levels for payment switch questions.';
    }

    return {
      readinessScore,
      checklist,
      biggestGapTopic,
      whatToImprove,
      eligibilityStatusText: isEligible
        ? 'Eligible (Meets all campus cutoffs)'
        : isBorderline
        ? 'Borderline (Close to CGPA cutoff line)'
        : 'Cutoff Gap (CGPA / Branch restriction)',
    };
  }, [opportunity, student]);

  return (
    <div className="bg-[#fcf8ff] border border-[#d1c8ff] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Company Readiness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e0f4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#e5deff] text-[#170065] text-xs font-bold font-mono-code mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
            <span>AI PLACEMENT DIAGNOSIS</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#09090D] tracking-tight">
            Why this company?
          </h3>
          <p className="text-xs text-[#5f5888] mt-0.5">
            Personalized alignment for {student.name.split(' ')[0]} ({student.cgpa} CGPA · {student.branch})
          </p>
        </div>

        {/* Company Readiness Score Tile */}
        <div className="bg-white p-3.5 rounded-xl border border-[#d1c8ff] text-right shrink-0 shadow-2xs">
          <div className="text-[11px] font-bold text-[#5f5888] uppercase tracking-wider">
            Company Readiness
          </div>
          <div className="text-2xl font-mono-code font-black text-[#170065]">
            {opportunity.company} — {analysis.readinessScore}% Ready
          </div>
          <div className="w-full bg-[#f1ebff] h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-[#7568D8] h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.readinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skills & Eligibility Readiness Checklist */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-[#09090D] uppercase tracking-wider">
          Readiness Breakdown:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Eligibility Item */}
          <div className="p-3 bg-white rounded-xl border border-[#e5e0f4] flex items-center justify-between">
            <span className="font-bold text-[#09090D]">Eligibility</span>
            <div className="flex items-center gap-1.5">
              {opportunity.eligibility.status === 'eligible' ? (
                <span className="text-[#10b981] font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Eligible
                </span>
              ) : opportunity.eligibility.status === 'borderline' ? (
                <span className="text-[#f59e0b] font-bold inline-flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Borderline
                </span>
              ) : (
                <span className="text-[#ef4444] font-bold inline-flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Not Eligible
                </span>
              )}
            </div>
          </div>

          {/* Technical Skills Checklist */}
          {analysis.checklist.map((item) => (
            <div
              key={item.label}
              className="p-3 bg-white rounded-xl border border-[#e5e0f4] flex items-center justify-between"
            >
              <span className="font-bold text-[#09090D]">{item.label}</span>
              <div>
                {item.status === 'strong' && (
                  <span className="text-[#10b981] font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strong
                  </span>
                )}
                {item.status === 'good' && (
                  <span className="text-[#170065] font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Good
                  </span>
                )}
                {item.status === 'needs_improvement' && (
                  <span className="text-[#f59e0b] font-bold inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Needs improvement
                  </span>
                )}
                {item.status === 'weak' && (
                  <span className="text-[#ef4444] font-bold inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Weak
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biggest Gap & What to Improve Box */}
      <div className="bg-[#fffbfe] border border-[#ffd8e4] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#b3261e] block">
              Your Biggest Gap
            </span>
            <span className="text-base font-black text-[#09090D]">
              {analysis.biggestGapTopic}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onFixGap(analysis.biggestGapTopic)}
            className="px-4 py-2 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-xl nexora-btn-press inline-flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <span>Fix This Gap ({analysis.biggestGapTopic})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C7BFEA]" />
          </button>
        </div>

        <div className="pt-2 border-t border-[#ffd8e4] text-xs text-[#47464b]">
          <strong className="text-[#09090D]">What to improve: </strong>
          <span>{analysis.whatToImprove}</span>
        </div>
      </div>
    </div>
  );
};
