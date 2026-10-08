import React from 'react';
import { ArrowRight, Sparkles, Check, Building2 } from 'lucide-react';
import { MatchRing } from './MatchRing';

interface HeroSectionProps {
  onFindMatches: () => void;
  onSearchCompanies: () => void;
  onSelectSampleOpportunity?: () => void;
  onPrepareSample?: () => void;
  eligibleCount: number;
  totalCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFindMatches,
  onSearchCompanies,
  onSelectSampleOpportunity,
  onPrepareSample,
  eligibleCount,
  totalCount,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-[#fcf8ff] nexora-page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clear Value Proposition (Spans 6) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Announcement / Focus indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f1ebff] border border-[#d1c8ff] rounded-full text-xs font-semibold text-[#170065] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7568D8] animate-pulse" />
              <span>Campus Placements 2026</span>
              <span className="text-[#968DC8]">·</span>
              <span className="text-[#5f5888]">Zero guesswork</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#09090D] leading-[1.08] text-balance">
                PLACEMENT JOBS YOU ACTUALLY QUALIFY FOR.
              </h1>
              <p className="font-serif-display italic text-2xl sm:text-3xl text-[#5f5888] font-normal">
                Check cutoffs in seconds. Prepare before day zero.
              </p>
            </div>

            {/* Microcopy: WHAT, WHO, WHY in plain human language */}
            <p className="text-base sm:text-lg text-[#47464b] leading-relaxed max-w-xl">
              Built for college students tired of missed deadlines and mysterious rejections. Search recruiting companies, verify branch and CGPA cutoffs instantly from your profile, and practice technical MCQs before Day 0.
            </p>

            {/* Primary Action Zone */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onFindMatches}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] font-bold text-sm rounded-full nexora-btn-press shadow-md hover:shadow-lg transition-all group"
              >
                <span>Find my matches</span>
                <ArrowRight className="w-4 h-4 text-[#C7BFEA] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onSearchCompanies}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#f1ebff] hover:bg-[#ebe5fa] text-[#09090D] border border-[#d1c8ff] font-semibold text-sm rounded-full nexora-btn-press transition-colors shadow-xs"
              >
                <Building2 className="w-4 h-4 text-[#5f5888]" />
                <span>Search companies & cutoffs</span>
              </button>
            </div>

            {/* Fast reassurance metrics */}
            <div className="flex items-center gap-6 pt-2 text-xs text-[#5f5888]">
              <div className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[#170065]" />
                <span>{eligibleCount} verified matches today</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[#170065]" />
                <span>Zero spam, strict cutoffs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Monolithic Dark Editorial Hero Console (Spans 6) */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-md lg:max-w-none bg-[#09090D] rounded-2xl p-6 sm:p-7 text-[#E3E0F2] border border-[#252332] shadow-2xl">
              {/* Console top header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#252332]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-mono-code text-[#968DC8] ml-2 font-medium">
                    live_evaluation.preview
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#C7BFEA] bg-[#15151C] px-2.5 py-0.5 rounded border border-[#252332]">
                  Aman · CSE 2026
                </span>
              </div>

              {/* Sample Live Job Card Simulation (Clickable) */}
              <div className="mt-5 space-y-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={onSelectSampleOpportunity || onFindMatches}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (onSelectSampleOpportunity || onFindMatches)();
                    }
                  }}
                  className="bg-[#15151C] hover:bg-[#1a1924] border border-[#252332] hover:border-[#7568D8] rounded-xl p-4 sm:p-5 relative overflow-hidden cursor-pointer transition-all duration-150 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  aria-label="Preview Microsoft India Software Engineer Intern job details"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#968DC8] tracking-wider uppercase">
                        Microsoft India
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-[#C7BFEA] transition-colors">
                        Software Engineer Intern
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#c8c5cb] mt-1 font-mono-code">
                        <span>₹1,25,000 / mo</span>
                        <span>·</span>
                        <span>Closes in 3 days</span>
                      </div>
                    </div>

                    {/* Circular Match Ring */}
                    <div className="p-1 bg-[#09090D] rounded-full border border-[#252332]">
                      <MatchRing score={94} size="md" />
                    </div>
                  </div>

                  {/* Immediate Eligibility Callout */}
                  <div className="mt-4 pt-3 border-t border-[#252332]/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#e5deff] font-semibold bg-[#170065]/60 px-2 py-0.5 rounded border border-[#8174e5]/30">
                      <span>✓</span>
                      <span>Eligible: 7.8 CGPA (Min 7.5 required)</span>
                    </div>
                    <span className="text-[#968DC8] font-mono-code text-[11px]">
                      Python · DSA
                    </span>
                  </div>
                </div>

                {/* Instant Gaps / Action Trigger (Clickable) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={onPrepareSample || onFindMatches}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (onPrepareSample || onFindMatches)();
                    }
                  }}
                  className="bg-[#15151C] hover:bg-[#1a1924] border border-[#252332] hover:border-[#7568D8] rounded-xl p-4 cursor-pointer transition-all duration-150 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  aria-label="Open Interview MCQ Drill for flagged gaps"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#E3E0F2] group-hover:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
                      Interview Prep Gaps
                    </span>
                    <span className="text-[11px] text-[#C7BFEA] underline font-mono-code group-hover:text-white">
                      Launch MCQ Drill →
                    </span>
                  </div>
                  <p className="text-xs text-[#c8c5cb] leading-relaxed">
                    Resume bullet 2 lacks concrete latency numbers. Interviewer is likely to drill down into your async FastAPI connection pooling.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Button */}
              <div className="mt-5 pt-4 border-t border-[#252332] flex items-center justify-between">
                <span className="text-xs text-[#968DC8]">
                  {totalCount} verified campus opportunities loaded
                </span>
                <button
                  type="button"
                  onClick={onFindMatches}
                  className="text-xs font-bold text-[#E3E0F2] hover:text-white bg-[#252332] hover:bg-[#3A364E] px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 nexora-btn-press"
                >
                  <span>Open Feed</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
