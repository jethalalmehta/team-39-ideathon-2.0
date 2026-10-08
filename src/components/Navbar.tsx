import React, { useState, useEffect } from 'react';
import { Menu, X, UserCheck, Search } from 'lucide-react';
import { StudentProfile } from '../types';

export type NavTab = 'opportunities' | 'practice' | 'companies' | 'prepare' | 'progress';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
  student: StudentProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfile,
  student,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'practice', label: 'Practice' },
    { id: 'companies', label: 'Companies' },
    { id: 'prepare', label: 'Prepare' },
    { id: 'progress', label: 'Progress' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fcf8ff]/95 backdrop-blur-md border-b border-[#e5e0f4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('opportunities')}
            className="flex items-baseline gap-1.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] rounded nexora-btn-press"
          >
            <span className="text-2xl font-black tracking-tight text-[#09090D] group-hover:text-[#5f5888] transition-colors">
              NEXORA
            </span>
            <span className="font-serif-display italic text-sm text-[#5f5888] font-normal hidden sm:inline">
              placements
            </span>
          </button>
        </div>

        {/* Navigation Zone (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f1ebff] p-1 rounded-xl border border-[#e5e0f4] shadow-xs" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap nexora-btn-press ${
                  isActive
                    ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                    : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#e5e0f4]/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Zone (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab('companies')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-150 shadow-xs nexora-btn-press ${
              activeTab === 'companies'
                ? 'bg-[#170065] text-white border-[#170065] ring-2 ring-[#7568D8]/40 shadow-sm'
                : 'bg-[#f1ebff] hover:bg-[#e6dcfa] text-[#170065] hover:text-[#09090D] border-[#c8c0f7] hover:border-[#7568D8]'
            }`}
            title="Search all campus recruiting companies and check instant cutoffs"
          >
            <Search className="w-4 h-4 text-[#7568D8] shrink-0 stroke-[2.5]" />
            <span className="tracking-tight whitespace-nowrap">Search Companies</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1c1a28] bg-white border border-[#c8c5cb] hover:border-[#78767b] rounded-xl nexora-btn-press shadow-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#5f5888]" />
            <span className="font-semibold text-[#09090D]">{student.name.split(' ')[0]}</span>
            <span className="text-[#78767b] font-mono-code tabular-nums text-[11px]">
              {student.cgpa} CGPA
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('companies')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#170065] bg-[#f1ebff] rounded-lg border border-[#c8c0f7] nexora-btn-press"
            aria-label="Search companies"
          >
            <Search className="w-3.5 h-3.5 text-[#7568D8]" />
            <span className="text-[11px]">Companies</span>
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            className="p-1.5 text-xs font-semibold text-[#09090D] bg-[#f1ebff] rounded-lg border border-[#d1c8ff] nexora-btn-press"
            aria-label="Student profile"
          >
            <UserCheck className="w-4 h-4 text-[#5f5888]" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1c1a28] hover:bg-[#f1ebff] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] nexora-btn-press"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e5e0f4] bg-[#fcf8ff] px-4 pt-2 pb-4 space-y-3 shadow-lg nexora-modal-dialog">
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#f1ebff] rounded-lg">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 text-xs font-semibold rounded-md text-center transition-colors nexora-btn-press ${
                    isActive
                      ? 'bg-[#09090D] text-[#E3E0F2]'
                      : 'text-[#47464b] hover:text-[#09090D]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectTab('companies');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-[#170065] bg-[#f1ebff] hover:bg-[#e6dcfa] border border-[#c8c0f7] rounded-lg nexora-btn-press"
            >
              <Search className="w-4 h-4 text-[#7568D8]" />
              <span>Search Companies & Check Eligibility</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-medium text-[#1c1a28] bg-white border border-[#c8c5cb] rounded-lg nexora-btn-press"
            >
              <span className="font-semibold">{student.name} ({student.branch})</span>
              <span className="text-[#5f5888] font-mono-code font-bold">{student.cgpa} CGPA</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
