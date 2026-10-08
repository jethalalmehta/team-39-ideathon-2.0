import React, { useEffect, useRef } from 'react';
import { X, Clock, MapPin, CheckCircle, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { Opportunity, StudentProfile, PracticeTopic } from '../types';
import { MatchRing } from './MatchRing';
import { EligibilityBadge } from './EligibilityBadge';
import { WhyThisCompany } from './WhyThisCompany';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  student?: StudentProfile;
  onClose: () => void;
  onPrepare: (opp: Opportunity) => void;
  onToggleApplied: (oppId: string) => void;
  onApply?: (opp: Opportunity) => void;
  onFixGap?: (topic: PracticeTopic) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({
  opportunity,
  student,
  onClose,
  onPrepare,
  onToggleApplied,
  onApply,
  onFixGap,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!opportunity) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-focus close button for keyboard users
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [opportunity, onClose]);

  if (!opportunity) return null;

  const isEligibleOrBorderline = opportunity.eligibility.status === 'eligible' || opportunity.eligibility.status === 'borderline';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/65 backdrop-blur-xs nexora-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-job-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#fcf8ff] rounded-2xl border border-[#c8c0f7] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col nexora-modal-dialog"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0f4] bg-[#f1ebff]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5f5888]">
              {opportunity.source}
            </span>
            <span className="text-[#968DC8]">·</span>
            <span className="text-xs text-[#78767b] font-mono-code font-medium">
              {opportunity.type}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1.5 text-[#47464b] hover:text-[#09090D] hover:bg-[#ebe5fa] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Job Title & Match Banner */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#5f5888] uppercase tracking-wider block">
                {opportunity.company}
              </span>
              <h2
                id="modal-job-title"
                className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight mt-0.5"
              >
                {opportunity.role}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-[#47464b]">
                <span className="font-bold text-[#170065] text-sm font-mono-code bg-[#e5deff] px-2 py-0.5 rounded">
                  {opportunity.ctc}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5f5888] shrink-0" />
                  {opportunity.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#5f5888] shrink-0" />
                  {opportunity.deadline}
                </span>
              </div>
            </div>

            <div className="shrink-0 bg-white p-2 rounded-2xl border border-[#d1c8ff] shadow-xs">
              <MatchRing score={opportunity.matchScore} size="lg" />
            </div>
          </div>

          {/* Eligibility Section (Always visible, unambiguous) */}
          <div className="bg-[#f1ebff] p-4 rounded-xl border border-[#d1c8ff]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5f5888] mb-2">
              Eligibility Verification
            </div>
            <EligibilityBadge eligibility={opportunity.eligibility} showDetails={true} />
            <div className="mt-3 pt-3 border-t border-[#d1c8ff]/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[#78767b] block text-[11px]">Required CGPA</span>
                <span className="font-bold text-[#09090D] font-mono-code">{opportunity.eligibility.minCgpa} minimum</span>
              </div>
              <div>
                <span className="text-[#78767b] block text-[11px]">Eligible Branches</span>
                <span className="font-bold text-[#09090D]">{opportunity.eligibility.allowedBranches.join(', ')}</span>
              </div>
              <div>
                <span className="text-[#78767b] block text-[11px]">Active Backlogs</span>
                <span className="font-bold text-[#09090D]">{opportunity.eligibility.backlogsAllowed ? 'Allowed' : 'Strictly 0'}</span>
              </div>
            </div>
          </div>

          {/* Why This Company & Skills Gap Diagnostic */}
          {student && onFixGap && (
            <WhyThisCompany
              opportunity={opportunity}
              student={student}
              onFixGap={(topic) => {
                onClose();
                onFixGap(topic);
              }}
            />
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#5f5888] uppercase tracking-wider mb-1.5">
              Role Overview
            </h4>
            <p className="text-sm text-[#23212E] leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {/* Selection Rounds */}
          <div>
            <h4 className="text-xs font-bold text-[#5f5888] uppercase tracking-wider mb-2">
              Selection Rounds (TPO Structure)
            </h4>
            <div className="space-y-2">
              {opportunity.rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-[#e5e0f4] text-xs font-medium text-[#1c1a28]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#09090D] text-[#E3E0F2] flex items-center justify-center font-mono-code text-[11px] shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span>{round}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <h4 className="text-xs font-bold text-[#5f5888] uppercase tracking-wider mb-1.5">
              Core Skills Tested
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono-code">
              {opportunity.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-white border border-[#c8c0f7] text-[#09090D] px-2.5 py-1 rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Apply Now & Prepare Actions */}
        <div className="p-4 sm:p-5 border-t border-[#e5e0f4] bg-[#f1ebff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onApply && isEligibleOrBorderline && (
              <button
                type="button"
                onClick={() => onApply(opportunity)}
                className="px-5 py-2.5 bg-[#170065] hover:bg-[#1f057e] text-white text-xs font-black rounded-lg nexora-btn-press shadow-md transition-all inline-flex items-center justify-center gap-2"
                title="Opens official company portal and tracks in your Applications"
              >
                <span>APPLY NOW</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C7BFEA]" />
              </button>
            )}

            <button
              onClick={() => onToggleApplied(opportunity.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 nexora-btn-press ${
                opportunity.applied
                  ? 'bg-[#e5deff] text-[#170065] border-[#c8c0f7]'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border-[#c8c5cb]'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-[#10b981]" />
              <span>{opportunity.applied ? 'Applied (Tracked)' : 'Mark as Applied'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onPrepare(opportunity);
            }}
            className="px-5 py-2.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg nexora-btn-press shadow-md transition-colors inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#7568D8]" />
            <span>Prepare in Grill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
