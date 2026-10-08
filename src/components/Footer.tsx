import React from 'react';
import { NavTab } from './Navbar';
import { ProgressSubTab } from './ProgressPage';

interface FooterProps {
  onSelectTab: (tab: NavTab, subTab?: ProgressSubTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-[#e5e0f4] bg-[#fcf8ff] py-12 text-xs text-[#5f5888]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#e5e0f4]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#09090D] tracking-tight">NEXORA</span>
              <span className="font-serif-display italic text-[#5f5888]">campus placements</span>
            </div>
            <p className="text-xs text-[#47464b] mt-1 max-w-sm">
              Discover verified campus opportunities, check eligibility before you apply, and prepare for interviews.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#1c1a28]" aria-label="Footer navigation">
            <button
              type="button"
              onClick={() => onSelectTab('opportunities')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Opportunities
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('practice')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Practice
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('companies')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Companies
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('prepare')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Prepare (Grill)
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('progress', 'applications')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Applications
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('progress', 'interviews')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Interviews
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('progress', 'rejections')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Rejection Autopsy
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('progress', 'offers')}
              className="hover:text-[#170065] transition-colors nexora-btn-press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8] rounded px-1"
            >
              Offers
            </button>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#78767b]">
          <p>© 2026 Nexora. Designed for engineering campus placements.</p>
          <p>Cutoffs and branch eligibility checked against verified university criteria.</p>
        </div>
      </div>
    </footer>
  );
};
