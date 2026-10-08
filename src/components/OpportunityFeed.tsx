import React, { useState, useMemo } from 'react';
import { Search, Building2, AlertCircle } from 'lucide-react';
import { Opportunity } from '../types';
import { OpportunityCard } from './OpportunityCard';

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onPrepareOpportunity: (opp: Opportunity) => void;
  onApplyOpportunity?: (opp: Opportunity) => void;
  onSearchCompanies?: () => void;
  isLoading?: boolean;
}

export const OpportunityFeed: React.FC<OpportunityFeedProps> = ({
  opportunities,
  onSelectOpportunity,
  onPrepareOpportunity,
  onApplyOpportunity,
  onSearchCompanies,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'closing_soon' | 'internship' | 'fulltime'>('all');

  const filteredOpportunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return opportunities.filter((opp) => {
      // Search matching
      const matchesSearch =
        !q ||
        opp.company.toLowerCase().includes(q) ||
        opp.role.toLowerCase().includes(q) ||
        opp.skills.some((s) => s.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Filter category
      if (filterType === 'eligible') {
        return opp.eligibility.status === 'eligible';
      }
      if (filterType === 'closing_soon') {
        return opp.deadlineDays <= 3;
      }
      if (filterType === 'internship') {
        return opp.type.toLowerCase().includes('intern');
      }
      if (filterType === 'fulltime') {
        return opp.type === 'Full-time';
      }
      return true;
    });
  }, [opportunities, searchQuery, filterType]);

  const eligibleCount = opportunities.filter((o) => o.eligibility.status === 'eligible').length;

  return (
    <section className="py-8 sm:py-12 bg-[#fcf8ff] nexora-page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#5f5888] uppercase tracking-wider">
                Live Placement Drive
              </span>
              <span className="text-xs text-[#78767b]">·</span>
              <span className="text-xs font-semibold text-[#170065] bg-[#e5deff] px-2 py-0.5 rounded-full">
                {eligibleCount} of {opportunities.length} Eligible
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#09090D] tracking-tight">
              Opportunities matching your profile
            </h2>
            <p className="text-sm text-[#47464b] mt-1">
              Cutoffs, eligibility and deadline countdown calculated in real time.
            </p>
          </div>

          {onSearchCompanies && (
            <button
              type="button"
              onClick={onSearchCompanies}
              className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg nexora-btn-press shadow-xs transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#7568D8]" />
              <span>Search All Companies & Cutoffs</span>
            </button>
          )}
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
              placeholder="Search company (e.g. Microsoft), role, or skill (e.g. Python, SQL)..."
              className="w-full pl-10 pr-16 py-2 text-xs font-medium bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all placeholder:text-[#78767b]"
              aria-label="Filter opportunities by keyword"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5f5888] hover:text-[#09090D] px-2 py-0.5 rounded hover:bg-[#e5deff] transition-colors"
                aria-label="Clear search filter"
              >
                Clear
              </button>
            )}
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0" role="tablist" aria-label="Opportunity filters">
            <button
              role="tab"
              aria-selected={filterType === 'all'}
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterType === 'all'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              role="tab"
              aria-selected={filterType === 'eligible'}
              onClick={() => setFilterType('eligible')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterType === 'eligible'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              ✓ Eligible ({eligibleCount})
            </button>
            <button
              role="tab"
              aria-selected={filterType === 'closing_soon'}
              onClick={() => setFilterType('closing_soon')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterType === 'closing_soon'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              Closing Soon (≤3d)
            </button>
            <button
              role="tab"
              aria-selected={filterType === 'internship'}
              onClick={() => setFilterType('internship')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterType === 'internship'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              Internships
            </button>
            <button
              role="tab"
              aria-selected={filterType === 'fulltime'}
              onClick={() => setFilterType('fulltime')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                filterType === 'fulltime'
                  ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                  : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
              }`}
            >
              Full-time
            </button>
          </div>
        </div>

        {/* Loading State: Skeleton Loaders */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div
                key={sk}
                className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-3/4">
                    <div className="h-3 w-20 bg-[#d1c8ff] rounded" />
                    <div className="h-5 w-44 bg-[#c8c0f7] rounded" />
                    <div className="h-3 w-32 bg-[#d1c8ff] rounded" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#d1c8ff]" />
                </div>
                <div className="h-7 w-28 bg-[#d1c8ff] rounded" />
                <div className="h-3 w-40 bg-[#d1c8ff] rounded" />
                <div className="h-3 w-full bg-[#d1c8ff] rounded" />
                <div className="h-8 w-full bg-[#c8c0f7] rounded pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Loaded Cards Grid */}
        {!isLoading && filteredOpportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSelect={onSelectOpportunity}
                onPrepare={onPrepareOpportunity}
                onApply={onApplyOpportunity}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOpportunities.length === 0 && (
          <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs nexora-modal-dialog">
            <div className="w-12 h-12 rounded-full bg-[#e5deff] text-[#170065] mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#09090D]">
              {searchQuery ? 'No opportunities match your filter' : 'No opportunities found'}
            </h3>
            <p className="text-xs sm:text-sm text-[#47464b] mt-1.5 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `We couldn't find matches for "${searchQuery}". Clear your search or reset filters.`
                : 'Explore recruiting companies in the Company Directory to view openings.'}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg shadow-xs nexora-btn-press transition-colors"
                >
                  Clear all filters
                </button>
              ) : onSearchCompanies ? (
                <button
                  type="button"
                  onClick={onSearchCompanies}
                  className="px-5 py-2.5 text-xs font-bold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg inline-flex items-center gap-2 shadow-xs nexora-btn-press transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[#7568D8]" />
                  <span>Browse Companies</span>
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
