import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Building2, ChevronRight, MapPin, Clock, ArrowRight, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { Opportunity, StudentProfile, PracticeTopic } from '../types';
import { companyListings } from '../data/mockData';
import { EligibilityBadge } from './EligibilityBadge';
import { MatchRing } from './MatchRing';
import { WhyThisCompany } from './WhyThisCompany';
import { evaluateEligibility } from '../utils/eligibility';

interface CompanySearchPageProps {
  student: StudentProfile;
  onPrepareRole: (opp: Opportunity) => void;
  onSelectRoleModal?: (opp: Opportunity) => void;
  onApplyRole?: (opp: Opportunity) => void;
  onFixGap?: (topic: PracticeTopic) => void;
}

export const CompanySearchPage: React.FC<CompanySearchPageProps> = ({
  student,
  onPrepareRole,
  onSelectRoleModal,
  onApplyRole,
  onFixGap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp-microsoft');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'eligible_only' | 'big_tech' | 'fintech'>('all');
  
  const detailRef = useRef<HTMLDivElement>(null);

  // Dynamically evaluate each company's roles against student profile using centralized eligibility logic
  const companiesWithEvaluatedRoles = useMemo(() => {
    return companyListings.map((company) => {
      const evaluatedRoles = company.roles.map((role) => {
        const evalResult = evaluateEligibility(role.eligibility, student);

        return {
          ...role,
          matchScore: evalResult.matchScore,
          eligibility: {
            ...role.eligibility,
            status: evalResult.status,
            reasons: evalResult.reasons,
            userCgpa: student.cgpa,
            userBranch: student.branch,
            hasActiveBacklogs: student.activeBacklogs > 0,
          },
        };
      });

      const hasEligibleRole = evaluatedRoles.some((r) => r.eligibility.status === 'eligible');

      return {
        ...company,
        roles: evaluatedRoles,
        hasEligibleRole,
      };
    });
  }, [student]);

  // Filter companies based on search query and category
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return companiesWithEvaluatedRoles.filter((comp) => {
      const matchesSearch =
        !q ||
        comp.name.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q) ||
        comp.roles.some((r) =>
          r.role.toLowerCase().includes(q) ||
          r.skills.some((s) => s.toLowerCase().includes(q))
        );

      if (!matchesSearch) return false;

      if (filterCategory === 'eligible_only') {
        return comp.hasEligibleRole;
      }
      if (filterCategory === 'big_tech') {
        return comp.category.toLowerCase().includes('big tech') || comp.category.toLowerCase().includes('cloud');
      }
      if (filterCategory === 'fintech') {
        return comp.category.toLowerCase().includes('fintech') || comp.category.toLowerCase().includes('payment') || comp.category.toLowerCase().includes('banking');
      }

      return true;
    });
  }, [companiesWithEvaluatedRoles, searchQuery, filterCategory]);

  // Keep selectedCompanyId synchronized with filtered companies
  useEffect(() => {
    if (filteredCompanies.length > 0 && !filteredCompanies.some((c) => c.id === selectedCompanyId)) {
      setSelectedCompanyId(filteredCompanies[0].id);
    }
  }, [filteredCompanies, selectedCompanyId]);

  const activeCompany = useMemo(() => {
    return (
      filteredCompanies.find((c) => c.id === selectedCompanyId) ||
      filteredCompanies[0] ||
      companiesWithEvaluatedRoles[0]
    );
  }, [filteredCompanies, selectedCompanyId, companiesWithEvaluatedRoles]);

  // Sync selected role when active company changes
  useEffect(() => {
    if (activeCompany && activeCompany.roles.length > 0) {
      if (!activeCompany.roles.some((r) => r.id === selectedRoleId)) {
        setSelectedRoleId(activeCompany.roles[0].id);
      }
    }
  }, [activeCompany, selectedRoleId]);

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    const comp = companiesWithEvaluatedRoles.find((c) => c.id === id);
    if (comp && comp.roles.length > 0) {
      setSelectedRoleId(comp.roles[0].id);
    }
    // On small screens, scroll smoothly to the detail panel
    if (window.innerWidth < 1024) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeSelectedRole = useMemo(() => {
    if (!activeCompany) return null;
    return activeCompany.roles.find((r) => r.id === selectedRoleId) || activeCompany.roles[0] || null;
  }, [activeCompany, selectedRoleId]);

  return (
    <section className="py-8 sm:py-12 bg-[#fcf8ff] nexora-page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e5deff] border border-[#c8c0f7] rounded-full text-xs font-semibold text-[#170065] mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Company Directory</span>
            <span className="text-[#8174e5]">·</span>
            <span>Instant Cutoff Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#09090D] tracking-tight">
            Search Companies & Check Eligibility
          </h1>
          <p className="text-sm sm:text-base text-[#47464b] mt-1 max-w-2xl">
            Explore company openings without pasting circulars. Eligibility is calculated directly from your saved profile ({student.cgpa} CGPA, {student.branch}).
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-[#f1ebff] p-3 sm:p-4 rounded-xl border border-[#e5e0f4] mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78767b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any company by name (e.g. Microsoft, Razorpay, Google, Amazon, PhonePe)..."
              className="w-full pl-10 pr-16 py-2.5 text-xs font-medium bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all placeholder:text-[#78767b]"
              aria-label="Search recruiting companies"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5f5888] hover:text-[#09090D] px-2 py-0.5 rounded hover:bg-[#e5deff] transition-colors"
                aria-label="Clear search query"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Category Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" role="tablist" aria-label="Filter company by category">
            <button
              role="tab"
              aria-selected={filterCategory === 'all'}
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterCategory === 'all'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              All ({companiesWithEvaluatedRoles.length})
            </button>
            <button
              role="tab"
              aria-selected={filterCategory === 'eligible_only'}
              onClick={() => setFilterCategory('eligible_only')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterCategory === 'eligible_only'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              ✓ Has Eligible Roles
            </button>
            <button
              role="tab"
              aria-selected={filterCategory === 'big_tech'}
              onClick={() => setFilterCategory('big_tech')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterCategory === 'big_tech'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              Big Tech
            </button>
            <button
              role="tab"
              aria-selected={filterCategory === 'fintech'}
              onClick={() => setFilterCategory('fintech')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterCategory === 'fintech'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              Fintech
            </button>
          </div>
        </div>

        {/* Master-Detail Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Company List (Spans 4) */}
            <div className="lg:col-span-4 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-[#5f5888] uppercase tracking-wider block mb-1">
                Select Company ({filteredCompanies.length})
              </span>

              {filteredCompanies.map((comp) => {
                const isSelected = activeCompany && activeCompany.id === comp.id;
                const eligibleRolesCount = comp.roles.filter((r) => r.eligibility.status === 'eligible').length;

                return (
                  <button
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 nexora-card-lift ${
                      isSelected
                        ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                        : 'bg-[#f1ebff] hover:bg-[#ebe5fa] text-[#1c1a28] border-[#d1c8ff]'
                    }`}
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-mono-code font-bold uppercase tracking-wider ${
                            isSelected ? 'text-[#C7BFEA]' : 'text-[#5f5888]'
                          }`}
                        >
                          {comp.tier}
                        </span>
                        {eligibleRolesCount > 0 && (
                          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-1.5 py-0.5 rounded">
                            {eligibleRolesCount} Eligible
                          </span>
                        )}
                      </div>

                      <h3 className={`text-base font-bold truncate ${isSelected ? 'text-white' : 'text-[#09090D]'}`}>
                        {comp.name}
                      </h3>

                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-[#c8c5cb]' : 'text-[#47464b]'}`}>
                        {comp.category}
                      </p>

                      <div className="mt-2 text-[11px] font-medium opacity-80">
                        <span>{comp.roles.length} available {comp.roles.length === 1 ? 'opening' : 'openings'}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${isSelected ? 'text-[#C7BFEA] translate-x-1' : 'text-[#78767b]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Company Deep Dive & Roles (Spans 8) */}
            <div ref={detailRef} className="lg:col-span-8 space-y-6">
              {activeCompany && (
                <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-6 shadow-xs">
                  {/* Company Overview Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#d1c8ff]/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-code font-bold text-[#170065] bg-[#e5deff] px-2 py-0.5 rounded">
                          {activeCompany.tier}
                        </span>
                        <span className="text-xs text-[#5f5888] font-medium">
                          {activeCompany.category}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight mt-1">
                        {activeCompany.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-[#78767b] mt-1 font-mono-code">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{activeCompany.headquarters}</span>
                      </div>
                    </div>

                    <div className="text-right sm:self-auto self-start bg-white/80 p-3 rounded-xl border border-[#d1c8ff]/60 shadow-xs">
                      <span className="text-[11px] text-[#78767b] block font-mono-code">
                        Openings evaluated
                      </span>
                      <span className="text-xl font-black text-[#09090D] font-mono-code">
                        {activeCompany.roles.length} Roles
                      </span>
                    </div>
                  </div>

                  {/* Company Description */}
                  <p className="text-xs sm:text-sm text-[#47464b] leading-relaxed my-4">
                    {activeCompany.overview}
                  </p>

                  {/* Role Selection Interactive Tabs */}
                  <div className="bg-white p-4 rounded-xl border border-[#d1c8ff] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#170065] flex items-center gap-1.5">
                        <span>🎯 Select Job Role ({activeCompany.roles.length} Available)</span>
                      </span>
                      {activeSelectedRole && (
                        <span className="text-[11px] font-mono-code font-bold text-[#5f5888]">
                          Active: {activeSelectedRole.role}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select company job role">
                      {activeCompany.roles.map((role) => {
                        const isRoleSelected = activeSelectedRole && activeSelectedRole.id === role.id;
                        const isRoleEligible = role.eligibility.status === 'eligible';

                        return (
                          <button
                            key={role.id}
                            type="button"
                            role="tab"
                            aria-selected={isRoleSelected}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all inline-flex items-center gap-2 nexora-btn-press ${
                              isRoleSelected
                                ? 'bg-[#09090D] text-white border-[#09090D] shadow-sm ring-2 ring-[#7568D8]'
                                : 'bg-[#f1ebff] hover:bg-[#ebe5fa] text-[#1c1a28] border-[#d1c8ff]'
                            }`}
                          >
                            <span>{role.role}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono-code ${
                                isRoleSelected
                                  ? 'bg-white/20 text-white'
                                  : isRoleEligible
                                  ? 'bg-[#10b981]/15 text-[#10b981] font-bold'
                                  : 'bg-[#ffdad6] text-[#93000a]'
                              }`}
                            >
                              {role.ctc.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Open Roles Listing */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5f5888] block">
                      Role Details & Readiness Diagnosis:
                    </span>

                    {(activeSelectedRole ? [activeSelectedRole] : activeCompany.roles).map((role) => (
                      <div
                        key={role.id}
                        className="bg-white rounded-xl border border-[#d1c8ff] p-5 shadow-xs transition-all hover:border-[#6257A5] space-y-4 nexora-card-lift"
                      >
                        {/* Role Header & Compensation */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5888]">
                              {role.type}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-[#09090D] mt-0.5">
                              {role.role}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#47464b] font-mono-code">
                              <span className="font-bold text-[#170065] text-sm">
                                {role.ctc}
                              </span>
                              <span>·</span>
                              <span>{role.location}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#5f5888]" />
                                {role.deadline}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 bg-[#f1ebff] p-1.5 rounded-full border border-[#d1c8ff] self-start sm:self-auto">
                            <MatchRing score={role.matchScore} size="md" />
                          </div>
                        </div>

                        {/* Immediate Eligibility Breakdown */}
                        <div className="bg-[#fcf8ff] p-3.5 rounded-lg border border-[#e5e0f4]">
                          <span className="text-[11px] font-bold text-[#5f5888] uppercase tracking-wider block mb-1.5">
                            Eligibility for {student.name.split(' ')[0]} ({student.cgpa} CGPA · {student.branch})
                          </span>
                          <EligibilityBadge eligibility={role.eligibility} showDetails={true} />
                        </div>

                        {/* Why This Company Diagnosis */}
                        {onFixGap && (
                          <WhyThisCompany
                            opportunity={role}
                            student={student}
                            onFixGap={onFixGap}
                          />
                        )}

                        {/* Selection Process Rounds */}
                        <div>
                          <span className="text-[11px] font-bold text-[#78767b] uppercase tracking-wider block mb-1">
                            Selection Process ({role.rounds.length} rounds)
                          </span>
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {role.rounds.map((round, rIdx) => (
                              <span
                                key={rIdx}
                                className="bg-[#f1ebff] border border-[#d1c8ff] text-[#1c1a28] px-2.5 py-1 rounded-md text-[11px] font-medium"
                              >
                                <strong className="font-mono-code text-[#170065]">{rIdx + 1}.</strong> {round}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Required Skills */}
                        <div>
                          <span className="text-[11px] font-bold text-[#78767b] uppercase tracking-wider block mb-1">
                            Required Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5 text-xs font-mono-code">
                            {role.skills.map((skill) => (
                              <span
                                key={skill}
                                className="bg-white border border-[#c8c5cb] text-[#09090D] px-2 py-0.5 rounded text-[11px]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Role Action Buttons */}
                        <div className="pt-2 border-t border-[#e5e0f4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          <span className="text-[11px] text-[#78767b]">
                            {role.eligibility.status === 'eligible'
                              ? '✓ You meet all academic cutoffs. Recommended to drill interview questions.'
                              : role.eligibility.status === 'borderline'
                              ? '⚠ Close to cutoff line. Practice to maximize OA score.'
                              : '✕ Cutoff not met for this specific role.'}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            {onApplyRole && (role.eligibility.status === 'eligible' || role.eligibility.status === 'borderline') && (
                              <button
                                type="button"
                                onClick={() => onApplyRole(role)}
                                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#170065] hover:bg-[#1f057e] text-white nexora-btn-press transition-colors shadow-xs inline-flex items-center gap-1.5"
                                title="Open official career page & record as Applied"
                              >
                                <span>APPLY NOW</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#C7BFEA]" />
                              </button>
                            )}

                            {onSelectRoleModal && (
                              <button
                                type="button"
                                onClick={() => onSelectRoleModal(role)}
                                className="px-3.5 py-2 text-xs font-semibold text-[#09090D] hover:text-[#170065] bg-[#f1ebff] hover:bg-[#ebe5fa] border border-[#d1c8ff] rounded-lg transition-colors nexora-btn-press"
                              >
                                View Details
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onPrepareRole(role)}
                              className="px-4 py-2 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] font-bold text-xs rounded-lg nexora-btn-press shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
                              <span>Grill Prep</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty search state */
          <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs nexora-modal-dialog">
            <div className="w-12 h-12 rounded-full bg-[#e5deff] text-[#170065] mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#09090D]">
              No company found for "{searchQuery}"
            </h3>
            <p className="text-xs sm:text-sm text-[#47464b] mt-1.5 leading-relaxed">
              We couldn't find a matching recruiting company. Try searching for Microsoft, Razorpay, Google, Amazon, Atlassian, or PhonePe.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg nexora-btn-press transition-colors shadow-xs"
              >
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
