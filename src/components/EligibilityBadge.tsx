import React from 'react';
import { EligibilityDetail } from '../types';

interface EligibilityBadgeProps {
  eligibility: EligibilityDetail;
  showDetails?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  eligibility,
  showDetails = true,
}) => {
  const { status, reasons, minCgpa, userCgpa, backlogsAllowed, hasActiveBacklogs } = eligibility;

  if (status === 'eligible') {
    return (
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#170065] bg-[#e5deff] border border-[#c8c0f7] px-2.5 py-1 rounded-md w-fit">
          <span className="font-bold">✓</span>
          <span>Eligible</span>
        </div>
      </div>
    );
  }

  if (status === 'borderline') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#585281] bg-[#f1ebff] border border-[#d1c8ff] px-2.5 py-1 rounded-md w-fit">
          <span className="font-bold">⚠</span>
          <span>Borderline</span>
        </div>
        {showDetails && (
          <p className="text-[12px] text-[#5f5888] leading-tight font-medium">
            CGPA near cutoff ({userCgpa} vs min {minCgpa}). Apply early.
          </p>
        )}
      </div>
    );
  }

  // Not eligible - ONLY show actual failed reasons
  return (
    <div className="flex flex-col gap-1.5">
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#93000a] bg-[#ffdad6] border border-[#ba1a1a]/20 px-2.5 py-1 rounded-md w-fit">
        <span className="font-bold">✕</span>
        <span>Not eligible</span>
      </div>
      {showDetails && (
        <div className="text-[12px] text-[#93000a] bg-[#fff5f5] border-l-2 border-[#ba1a1a] px-2 py-1 rounded-r-md leading-snug space-y-0.5">
          {reasons && reasons.length > 0 ? (
            reasons.map((reason, i) => (
              <div key={i} className="font-medium">
                {reason}
              </div>
            ))
          ) : (
            <div className="font-medium">
              ✕ CGPA: {userCgpa} &lt; {minCgpa} (Minimum {minCgpa} required)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
