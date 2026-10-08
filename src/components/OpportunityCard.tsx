import React from 'react';
import { Clock, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { Opportunity } from '../types';
import { MatchRing } from './MatchRing';
import { EligibilityBadge } from './EligibilityBadge';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opp: Opportunity) => void;
  onPrepare: (opp: Opportunity) => void;
  onApply?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onPrepare,
  onApply,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(opportunity);
    }
  };

  const isEligibleOrBorderline = opportunity.eligibility.status === 'eligible' || opportunity.eligibility.status === 'borderline';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(opportunity)}
      onKeyDown={handleKeyDown}
      aria-label={`${opportunity.role} at ${opportunity.company}. ${opportunity.matchScore}% match.`}
      className="group relative bg-[#f1ebff] hover:bg-[#ebe5fa] border border-[#d1c8ff] hover:border-[#6257A5] rounded-2xl p-5 sm:p-6 transition-all duration-200 nexora-card-lift cursor-pointer flex flex-col justify-between select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
    >
      <div>
        {/* Top Header: Company + Circular Match Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Hierarchy Level 1: Company */}
            <span className="text-xs font-bold uppercase tracking-wider text-[#5f5888] block truncate">
              {opportunity.company}
            </span>

            {/* Hierarchy Level 2: Job title */}
            <h3 className="text-lg sm:text-xl font-bold text-[#09090D] group-hover:text-[#170065] transition-colors leading-tight mt-1 truncate">
              {opportunity.role}
            </h3>

            {/* Sub-meta: Compensation & Type */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#47464b] font-medium font-mono-code">
              <span className="text-[#09090D] font-bold">{opportunity.ctc}</span>
              <span>·</span>
              <span>{opportunity.type}</span>
              <span>·</span>
              <span>{opportunity.location}</span>
            </div>
          </div>

          {/* Hierarchy Level 3: Match percentage with circular progress ring */}
          <div className="shrink-0 bg-white/70 p-1.5 rounded-full border border-[#d1c8ff]/60 shadow-xs">
            <MatchRing score={opportunity.matchScore} size="md" />
          </div>
        </div>

        {/* Hierarchy Level 4: Eligibility */}
        <div className="mt-4 pt-3 border-t border-[#d1c8ff]/60">
          <EligibilityBadge eligibility={opportunity.eligibility} showDetails={true} />
        </div>

        {/* Hierarchy Level 5: Deadline */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5f5888] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#5f5888] shrink-0" />
          <span className={opportunity.deadlineDays <= 2 ? 'font-bold text-[#ba1a1a]' : ''}>
            {opportunity.deadline}
          </span>
          {opportunity.applied && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#170065] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                Applied
              </span>
            </>
          )}
        </div>

        {/* Hierarchy Level 6: Important requirements */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-[#78767b] uppercase tracking-wider mb-1">
            Requirements
          </div>
          <div className="text-xs font-medium text-[#1c1a28] flex flex-wrap items-center gap-x-2 gap-y-1">
            {opportunity.skills.map((skill, idx) => (
              <React.Fragment key={skill}>
                <span className="font-mono-code text-[12px] text-[#23212E]">{skill}</span>
                {idx < opportunity.skills.length - 1 && (
                  <span className="text-[#968DC8]" aria-hidden="true">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Hierarchy Level 7: Primary Action */}
      <div className="mt-5 pt-4 border-t border-[#d1c8ff]/60 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(opportunity);
          }}
          className="text-xs font-bold text-[#09090D] group-hover:text-[#170065] inline-flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="flex items-center gap-1.5">
          {onApply && isEligibleOrBorderline && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApply(opportunity);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#170065] hover:bg-[#1f057e] text-white nexora-btn-press transition-colors shadow-xs inline-flex items-center gap-1"
              title="Open official application portal and record as Applied"
            >
              <span>{opportunity.applied ? 'Re-apply' : 'APPLY NOW'}</span>
              <ExternalLink className="w-3 h-3 text-[#C7BFEA]" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrepare(opportunity);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#09090D] text-[#E3E0F2] hover:bg-[#1b1b1f] nexora-btn-press transition-colors shadow-xs"
          >
            Grill Prep
          </button>
        </div>
      </div>
    </div>
  );
};
