import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Check, User, GraduationCap, Award, AlertCircle, Briefcase, Code } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: StudentProfile) => void;
  onClose: () => void;
  initialProfile: StudentProfile;
}

const POPULAR_SKILLS = [
  'Python', 'Java', 'C++', 'Data Structures & Algorithms',
  'SQL', 'React', 'Node.js', 'FastAPI', 'Docker',
  'DBMS', 'Operating Systems', 'Computer Networks'
];

const TARGET_ROLES = [
  'Software Development Engineer (SDE)',
  'Backend Engineer',
  'Frontend Engineer',
  'Full Stack Developer',
  'Data Engineer / Analyst',
  'Systems & Infrastructure Engineer'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialProfile,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialProfile.name || '');
  const [college, setCollege] = useState(initialProfile.college || 'National Institute of Technology, Jalandhar');
  const [branch, setBranch] = useState(initialProfile.branch || 'Computer Science & Engineering');
  const [cgpa, setCgpa] = useState<number>(initialProfile.cgpa || 7.8);
  const [backlogs, setBacklogs] = useState<number>(initialProfile.activeBacklogs || 0);
  const [skills, setSkills] = useState<string[]>(initialProfile.skills || ['Python', 'Data Structures & Algorithms', 'React', 'SQL']);
  const [customSkill, setCustomSkill] = useState('');
  const [targetRole, setTargetRole] = useState(initialProfile.targetRole || 'Software Development Engineer (SDE)');
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your full name to personalize your placement drive feed.');
        return;
      }
    } else if (step === 3) {
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        setError('CGPA must be a valid number between 0.00 and 10.00.');
        return;
      }
    } else if (step === 4) {
      if (isNaN(backlogs) || backlogs < 0) {
        setError('Active backlogs cannot be negative.');
        return;
      }
    } else if (step === 5) {
      if (skills.length === 0) {
        setError('Please select or add at least 1 technical skill.');
        return;
      }
    }

    if (step < 6) {
      setStep((prev) => prev + 1);
    } else {
      // Complete Onboarding
      const updatedProfile: StudentProfile = {
        ...initialProfile,
        name: name.trim(),
        college: college.trim(),
        branch,
        cgpa: Number(cgpa),
        activeBacklogs: Number(backlogs),
        skills,
        targetRole,
      };
      onComplete(updatedProfile);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/70 backdrop-blur-xs nexora-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-[#fcf8ff] border border-[#c8c0f7] rounded-3xl shadow-2xl overflow-hidden flex flex-col nexora-modal-dialog"
      >
        {/* Header with Step Tracker */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#e5e0f4] bg-[#f1ebff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7568D8] animate-pulse" />
            <span className="text-xs font-bold text-[#170065] uppercase tracking-wider">
              Nexora Copilot Setup
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-[#09090D]'
                    : s < step
                    ? 'w-2 bg-[#7568D8]'
                    : 'w-2 bg-[#d1c8ff]'
                }`}
                title={`Step ${s}`}
              />
            ))}
            <span className="text-xs font-mono-code font-bold text-[#5f5888] ml-2">
              0{step}/06
            </span>
          </div>
        </div>

        {/* Step Content Arena */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 min-h-[320px] flex flex-col justify-between">
          <div>
            {/* STEP 1: NAME & COLLEGE */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <User className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 1: Your Profile</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  What should we call you?
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  We use your name and academic profile to evaluate live campus cutoffs without guesswork.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="ob-name" className="block text-xs font-bold text-[#09090D] mb-1">
                      Full Name
                    </label>
                    <input
                      id="ob-name"
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="w-full px-4 py-3 text-sm font-medium bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-xl outline-none transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>

                  <div>
                    <label htmlFor="ob-college" className="block text-xs font-bold text-[#09090D] mb-1">
                      College / University
                    </label>
                    <input
                      id="ob-college"
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. National Institute of Technology, Jalandhar"
                      className="w-full px-4 py-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BRANCH */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <GraduationCap className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 2: Academic Discipline</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  Select your branch
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  Different company drives restrict eligibility to specific departments (e.g. CSE, IT, ECE).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {[
                    'Computer Science & Engineering',
                    'Information Technology',
                    'Electronics & Communication (ECE)',
                    'Electrical Engineering (EE)',
                    'Mechanical Engineering',
                    'Other Engineering Discipline'
                  ].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBranch(b)}
                      className={`p-3.5 text-left rounded-xl border text-xs font-bold transition-all flex items-center justify-between nexora-card-lift ${
                        branch === b
                          ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-sm'
                          : 'bg-white hover:bg-[#f1ebff] text-[#09090D] border-[#d1c8ff]'
                      }`}
                    >
                      <span>{b}</span>
                      {branch === b && <Check className="w-4 h-4 text-[#10b981]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: CGPA */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <Award className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 3: Academic Standing</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  What is your current CGPA?
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  We check your CGPA against strict Day-0 company cutoffs (e.g. Google 8.5, Microsoft 7.5, Razorpay 7.0).
                </p>

                <div className="pt-3 max-w-sm">
                  <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#5f5888] font-bold uppercase block">Current CGPA (out of 10)</span>
                      <span className="text-xs text-[#78767b]">Recalculates match score</span>
                    </div>
                    <input
                      type="number"
                      autoFocus
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 text-xl font-black font-mono-code text-right bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-xl outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BACKLOGS */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <AlertCircle className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 4: Active Backlogs</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  Any active backlogs?
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  Tier-1 product companies strictly mandate 0 active standing backlogs during on-campus recruitment.
                </p>

                <div className="flex items-center gap-3 pt-3">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBacklogs(num)}
                      className={`flex-1 py-4 px-3 rounded-2xl border text-center transition-all nexora-card-lift ${
                        backlogs === num
                          ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-sm'
                          : 'bg-white hover:bg-[#f1ebff] text-[#09090D] border-[#d1c8ff]'
                      }`}
                    >
                      <span className="text-2xl font-black font-mono-code block">{num}</span>
                      <span className="text-[11px] opacity-80 font-medium">
                        {num === 0 ? 'Zero Backlogs' : `${num} Active`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: SKILLS */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <Code className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 5: Technical Stack</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  What are your top skills?
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  Select your strongest languages and tools for role-specific interview MCQs and gap analysis.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 text-xs font-mono-code font-bold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332]'
                            : 'bg-white hover:bg-[#f1ebff] text-[#47464b] border-[#d1c8ff]'
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill (e.g. Go, Kubernetes, Kafka)..."
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-xl outline-none"
                    onKeyDown={addCustomSkill}
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-4 py-2 bg-[#f1ebff] hover:bg-[#ebe5fa] text-[#09090D] text-xs font-bold border border-[#d1c8ff] rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: TARGET ROLE */}
            {step === 6 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f5888]">
                  <Briefcase className="w-4 h-4 text-[#7568D8]" />
                  <span>Step 6: Placement Target</span>
                </div>
                <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
                  What role are you targeting?
                </h2>
                <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed">
                  We customize your daily placement drills and company suggestions around this target.
                </p>

                <div className="space-y-2 pt-2">
                  {TARGET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`w-full p-3 text-left rounded-xl border text-xs font-bold transition-all flex items-center justify-between nexora-card-lift ${
                        targetRole === role
                          ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-sm'
                          : 'bg-white hover:bg-[#f1ebff] text-[#09090D] border-[#d1c8ff]'
                      }`}
                    >
                      <span>{role}</span>
                      {targetRole === role && <Check className="w-4 h-4 text-[#10b981]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-xl text-xs font-semibold text-[#93000a] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-6 border-t border-[#e5e0f4] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#47464b] hover:text-[#09090D] bg-white hover:bg-[#f1ebff] border border-[#d1c8ff] rounded-xl transition-colors nexora-btn-press"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#78767b] hover:text-[#09090D] underline"
              >
                Skip setup
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-xl nexora-btn-press shadow-md transition-all group"
            >
              <span>{step === 6 ? 'Launch My Copilot' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4 text-[#C7BFEA] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
