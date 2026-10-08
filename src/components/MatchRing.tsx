import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface MatchRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchRing: React.FC<MatchRingProps> = ({ score, size = 'md', showLabel = true }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Dimension settings
  const dimensions = {
    sm: { diameter: 48, stroke: 4, fontSize: 'text-xs', labelSize: 'text-[9px]' },
    md: { diameter: 64, stroke: 5, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    lg: { diameter: 88, stroke: 6, fontSize: 'text-xl', labelSize: 'text-xs' },
  }[size];

  const radius = (dimensions.diameter - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedScore(score);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 40);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Color selection based on match tier
  const strokeColor = score >= 85 ? '#09090D' : score >= 75 ? '#5f5888' : '#78767b';
  const trackColor = 'rgba(120, 118, 123, 0.15)';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setShowTooltip((prev) => !prev);
    } else if (e.key === 'Escape') {
      setShowTooltip(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <div
        className="relative cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] rounded-full"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${score}% match. Click or hover to view calculation rationale.`}
        aria-expanded={showTooltip}
      >
        <svg
          width={dimensions.diameter}
          height={dimensions.diameter}
          className="transform -rotate-90 block"
        >
          {/* Background track */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={dimensions.stroke}
          />
          {/* Progress ring with smooth stroke animation */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-bold tabular-nums leading-none tracking-tight text-[#09090D] ${dimensions.fontSize}`}>
            {score}%
          </span>
          {showLabel && (
            <span className={`font-semibold tracking-wider text-[#5f5888] uppercase mt-0.5 ${dimensions.labelSize}`}>
              MATCH
            </span>
          )}
        </div>
      </div>

      {/* Tooltip explanation */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute z-30 bottom-full mb-2 w-64 p-2.5 text-xs text-[#E3E0F2] bg-[#09090D] border border-[#252332] rounded-lg shadow-xl nexora-modal-dialog pointer-events-none"
        >
          <div className="flex items-start gap-1.5 mb-1 text-[#C7BFEA] font-medium">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#7568D8]" />
            <span>Why {score}% match?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#c8c5cb]">
            Calculated from your CGPA, branch, active backlogs and matching skills.
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-[#252332] text-[10px] text-[#968DC8]">
            Recalculated dynamically from your academic profile.
          </div>
        </div>
      )}
    </div>
  );
};
