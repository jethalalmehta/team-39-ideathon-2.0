import React, { useState, useEffect, useRef } from 'react';
import { ProgressSummary, RejectionRecord, ApplicationRecord, ApplicationStatus } from '../types';
import { initialRejections, initialProgress, initialApplications } from '../data/mockData';
import { HeartHandshake, Target, Plus, CheckCircle2, ArrowRight, Calendar, MapPin, ChevronRight, X, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

export type ProgressSubTab = 'dashboard' | 'applications' | 'interviews' | 'offers' | 'rejections';

interface ProgressPageProps {
  onPrepareForCompany?: (companyName: string) => void;
  initialSubTab?: ProgressSubTab;
  onSubTabChange?: (tab: ProgressSubTab) => void;
  applications?: ApplicationRecord[];
  onUpdateApplications?: React.Dispatch<React.SetStateAction<ApplicationRecord[]>>;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  onPrepareForCompany,
  initialSubTab = 'dashboard',
  onSubTabChange,
  applications: controlledApplications,
  onUpdateApplications,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProgressSubTab>(initialSubTab);
  const [localApplications, setLocalApplications] = useState<ApplicationRecord[]>(initialApplications);
  const applications = controlledApplications || localApplications;
  const setApplications = onUpdateApplications || setLocalApplications;

  const [rejections, setRejections] = useState<RejectionRecord[]>(initialRejections);
  const [progress, setProgress] = useState<ProgressSummary>(initialProgress);

  const handleUpdateAppStatus = (appId: string, nextStatus: ApplicationStatus) => {
    setApplications((prev) => {
      const updated = prev.map((app) => {
        if (app.id === appId) {
          let stage = app.currentStage;
          if (nextStatus === 'Selected') stage = 'Offer Received & Selected';
          else if (nextStatus === 'Interview') stage = 'Technical Interview Scheduled';
          else if (nextStatus === 'Rejected') stage = 'Online Assessment / Interview Cutoff';
          else if (nextStatus === 'Applied') stage = 'Application Submitted on Portal';
          
          return {
            ...app,
            status: nextStatus,
            currentStage: stage,
          };
        }
        return app;
      });
      try {
        localStorage.setItem('nexora_applications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // Sync initialSubTab if changed externally
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSelectSubTab = (tab: ProgressSubTab) => {
    setActiveSubTab(tab);
    onSubTabChange?.(tab);
  };

  // Filtering within applications view
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<string>('All');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);

  // Selected rejection modal/sheet
  const [selectedRejection, setSelectedRejection] = useState<RejectionRecord | null>(null);

  // Log new outcome modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newStage, setNewStage] = useState<'Aptitude / Online Test' | 'Technical Round 1' | 'Technical Round 2' | 'HR Round'>('Aptitude / Online Test');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedNotification, setLoggedNotification] = useState(false);

  // Ref for modal close focus
  const appModalCloseRef = useRef<HTMLButtonElement>(null);
  const rejModalCloseRef = useRef<HTMLButtonElement>(null);
  const logModalCloseRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock and Escape key listener for open modals
  useEffect(() => {
    const isAnyModalOpen = selectedApplication !== null || selectedRejection !== null || showLogModal;

    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (selectedApplication) setSelectedApplication(null);
          if (selectedRejection) setSelectedRejection(null);
          if (showLogModal) setShowLogModal(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedApplication, selectedRejection, showLogModal]);

  // Derived application subsets
  const interviewsList = applications.filter((app) => app.status === 'Interview');
  const offersList = applications.filter((app) => app.status === 'Selected');
  const rejectedList = applications.filter((app) => app.status === 'Rejected');

  const filteredApplications = applications.filter((app) => {
    if (applicationStatusFilter === 'All') return true;
    return app.status === applicationStatusFilter;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedCompany = newCompany.trim();
    if (!trimmedCompany) return;

    setIsSubmitting(true);

    const newRecord: RejectionRecord = {
      id: `rej-${Date.now()}`,
      company: trimmedCompany,
      role: 'Graduate Software Engineer',
      stage: newStage,
      date: 'Just now',
      primaryCause: newNote.trim() || 'Speed on timed assessment questions',
      takeaway: 'Focus practice on speed under pressure.',
    };

    const newAppRecord: ApplicationRecord = {
      id: `app-rej-${Date.now()}`,
      company: trimmedCompany,
      role: 'Graduate Software Engineer',
      ctc: '₹18 LPA',
      location: 'Bengaluru',
      appliedDate: 'Just now',
      status: 'Rejected',
      currentStage: newStage,
      rejectionStage: newStage,
      rejectionReason: newNote.trim() || 'Assessment cutoffs not cleared',
      rejectionTakeaway: 'Focus practice on the specific bottleneck round.',
    };

    setRejections((prev) => [newRecord, ...prev]);
    setApplications((prev) => [newAppRecord, ...prev]);
    setProgress((prev) => ({
      ...prev,
      rejections: prev.rejections + 1,
      applications: prev.applications + 1,
    }));

    setNewCompany('');
    setNewNote('');
    setShowLogModal(false);
    setIsSubmitting(false);

    setLoggedNotification(true);
    setTimeout(() => setLoggedNotification(false), 3000);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-2 py-0.5 rounded-md">
            ✓ Selected (Offer)
          </span>
        );
      case 'Interview':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#170065] bg-[#e5deff] border border-[#c8c0f7] px-2 py-0.5 rounded-md">
            ● Interview Scheduled
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] bg-[#e0f2fe] border border-[#bae6fd] px-2 py-0.5 rounded-md">
            In Progress
          </span>
        );
      case 'Applied':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5f5888] bg-[#f1ebff] border border-[#d1c8ff] px-2 py-0.5 rounded-md">
            Applied
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#93000a] bg-[#ffdad6] border border-[#ba1a1a]/20 px-2 py-0.5 rounded-md">
            ✕ Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-[#fcf8ff] nexora-page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e5deff] border border-[#c8c0f7] rounded-full text-xs font-semibold text-[#170065] mb-2">
              <span>Placement Tracker</span>
              <span className="text-[#8174e5]">·</span>
              <span>Interactive Pipeline</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#09090D] tracking-tight">
              Progress & Applications
            </h1>
            <p className="text-sm sm:text-base text-[#47464b] mt-1 max-w-xl">
              Track your active campus drives, view interview dates, and examine diagnostic rejection autopsy data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg nexora-btn-press transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#7568D8]" />
              <span>Log Drive Outcome</span>
            </button>
          </div>
        </div>

        {loggedNotification && (
          <div className="mb-6 p-3 bg-[#e5deff] border border-[#c8c0f7] rounded-xl text-xs text-[#170065] font-semibold flex items-center justify-between nexora-toast-enter shadow-xs">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              Drive outcome logged successfully. All statistics updated!
            </span>
          </div>
        )}

        {/* 5. INTERACTIVE DASHBOARD STATISTICS CARDS (FULLY CLICKABLE) */}
        <div className="mb-8">
          <span className="text-[11px] font-bold text-[#5f5888] uppercase tracking-wider block mb-2">
            Click any metric to open its detailed breakdown:
          </span>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Applications */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSelectSubTab('applications');
                setApplicationStatusFilter('All');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSubTab('applications');
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer nexora-card-lift text-left select-none relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] ${
                activeSubTab === 'applications'
                  ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                  : 'bg-[#f1ebff] hover:bg-[#ebe5fa] border-[#d1c8ff] hover:border-[#6257A5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeSubTab === 'applications' ? 'text-[#C7BFEA]' : 'text-[#5f5888]'}`}>
                  Applications
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeSubTab === 'applications' ? 'text-[#C7BFEA]' : 'text-[#78767b]'}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-black font-mono-code tabular-nums ${activeSubTab === 'applications' ? 'text-white' : 'text-[#09090D]'}`}>
                {applications.length}
              </div>
              <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${activeSubTab === 'applications' ? 'text-[#c8c5cb]' : 'text-[#5f5888]'}`}>
                <span>View all records</span>
                <span className="font-bold underline decoration-dotted">Open →</span>
              </div>
            </div>

            {/* Card 2: Interviews */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelectSubTab('interviews')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSubTab('interviews');
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer nexora-card-lift text-left select-none relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] ${
                activeSubTab === 'interviews'
                  ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                  : 'bg-[#f1ebff] hover:bg-[#ebe5fa] border-[#d1c8ff] hover:border-[#6257A5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeSubTab === 'interviews' ? 'text-[#C7BFEA]' : 'text-[#170065]'}`}>
                  Interviews
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeSubTab === 'interviews' ? 'text-[#C7BFEA]' : 'text-[#78767b]'}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-black font-mono-code tabular-nums ${activeSubTab === 'interviews' ? 'text-white' : 'text-[#170065]'}`}>
                {interviewsList.length}
              </div>
              <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${activeSubTab === 'interviews' ? 'text-[#c8c5cb]' : 'text-[#5f5888]'}`}>
                <span>{interviewsList.length} scheduled</span>
                <span className="font-bold underline decoration-dotted">Open →</span>
              </div>
            </div>

            {/* Card 3: Offers */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelectSubTab('offers')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSubTab('offers');
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer nexora-card-lift text-left select-none relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] ${
                activeSubTab === 'offers'
                  ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                  : 'bg-[#f1ebff] hover:bg-[#ebe5fa] border-[#c8c0f7] hover:border-[#10b981]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#10b981]">
                  Offers
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeSubTab === 'offers' ? 'text-[#C7BFEA]' : 'text-[#78767b]'}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-black font-mono-code tabular-nums ${activeSubTab === 'offers' ? 'text-white' : 'text-[#09090D]'}`}>
                {offersList.length}
              </div>
              <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${activeSubTab === 'offers' ? 'text-[#c8c5cb]' : 'text-[#5f5888]'}`}>
                <span>{offersList.length > 0 ? offersList[0].company : '0 offers'}</span>
                <span className="font-bold underline decoration-dotted">Open →</span>
              </div>
            </div>

            {/* Card 4: Rejections */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelectSubTab('rejections')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectSubTab('rejections');
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer nexora-card-lift text-left select-none relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] ${
                activeSubTab === 'rejections'
                  ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                  : 'bg-[#f1ebff] hover:bg-[#ebe5fa] border-[#d1c8ff] hover:border-[#ba1a1a]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeSubTab === 'rejections' ? 'text-[#ffdad6]' : 'text-[#93000a]'}`}>
                  Rejections
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeSubTab === 'rejections' ? 'text-[#C7BFEA]' : 'text-[#78767b]'}`} />
              </div>
              <div className={`text-3xl sm:text-4xl font-black font-mono-code tabular-nums ${activeSubTab === 'rejections' ? 'text-white' : 'text-[#47464b]'}`}>
                {rejectedList.length}
              </div>
              <div className={`mt-2 text-[11px] font-medium flex items-center justify-between ${activeSubTab === 'rejections' ? 'text-[#c8c5cb]' : 'text-[#5f5888]'}`}>
                <span>Diagnostic autopsy</span>
                <span className="font-bold underline decoration-dotted">Open →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab View Segment Selector */}
        <div className="border-b border-[#e5e0f4] mb-8 flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Progress views">
          <button
            role="tab"
            aria-selected={activeSubTab === 'dashboard'}
            onClick={() => handleSelectSubTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
              activeSubTab === 'dashboard'
                ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#f1ebff]'
            }`}
          >
            Overview & Trends
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'applications'}
            onClick={() => handleSelectSubTab('applications')}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
              activeSubTab === 'applications'
                ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#f1ebff]'
            }`}
          >
            All Applications ({applications.length})
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'interviews'}
            onClick={() => handleSelectSubTab('interviews')}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
              activeSubTab === 'interviews'
                ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#f1ebff]'
            }`}
          >
            Interviews ({interviewsList.length})
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'offers'}
            onClick={() => handleSelectSubTab('offers')}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
              activeSubTab === 'offers'
                ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#f1ebff]'
            }`}
          >
            Selected / Offers ({offersList.length})
          </button>
          <button
            role="tab"
            aria-selected={activeSubTab === 'rejections'}
            onClick={() => handleSelectSubTab('rejections')}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
              activeSubTab === 'rejections'
                ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                : 'text-[#47464b] hover:text-[#09090D] hover:bg-[#f1ebff]'
            }`}
          >
            Rejection Autopsy ({rejectedList.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: DASHBOARD OVERVIEW & AUTOPSY SUMMARY */}
        {/* ========================================================= */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-8 nexora-page-transition">
            {/* Emotionally Friendly Rejection Autopsy Card */}
            <div className="bg-[#09090D] text-[#E3E0F2] rounded-2xl p-6 sm:p-8 border border-[#252332] shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-[#C7BFEA]">
                <HeartHandshake className="w-5 h-5 text-[#7568D8]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Diagnostic Autopsy · Emotionally Supportive Insights
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left: Your Biggest Pattern */}
                <div className="space-y-3">
                  <span className="text-xs font-mono-code font-bold text-[#968DC8] uppercase tracking-wider">
                    {progress.biggestPattern.headline}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    "{progress.biggestPattern.description}"
                  </h2>
                  <p className="text-xs sm:text-sm text-[#c8c5cb] leading-relaxed">
                    This is encouraging: your core programming and resume consistently clear shortlists. You are losing out on timed aptitude test speed, which is easily strengthened with repetitive timed drills.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectSubTab('rejections')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C7BFEA] hover:text-white underline pt-1 nexora-btn-press"
                  >
                    <span>View all {rejections.length} rejected drive autopsy details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: What to do next */}
                <div className="bg-[#15151C] border border-[#252332] rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-[#7568D8] uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>{progress.nextFocus.title}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    "{progress.nextFocus.action}"
                  </h3>
                  <p className="text-xs text-[#c8c5cb]">
                    {progress.nextFocus.suggestedDrill}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onPrepareForCompany?.('Razorpay')}
                      className="w-full py-2.5 px-4 bg-[#E3E0F2] hover:bg-white text-[#09090D] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 nexora-btn-press shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-[#7568D8]" />
                      <span>Launch Interview MCQ Drill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Exact Visual Trend Breakdown */}
              <div className="mt-8 pt-6 border-t border-[#252332]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono-code text-[#968DC8] uppercase tracking-wider block">
                    Where your rejections occurred:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectSubTab('rejections')}
                    className="text-[11px] font-mono-code text-[#C7BFEA] hover:text-white underline"
                  >
                    View All Diagnostics →
                  </button>
                </div>
                <div className="space-y-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectSubTab('rejections')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectSubTab('rejections');
                      }
                    }}
                    className="h-4 w-full bg-[#15151C] rounded-full overflow-hidden flex cursor-pointer hover:ring-2 hover:ring-[#7568D8] transition-all"
                    title="Click to view detailed rejection autopsies"
                  >
                    <div
                      className="bg-[#7568D8] h-full transition-all hover:opacity-90"
                      style={{ width: '60%' }}
                      title="Aptitude (60%)"
                    />
                    <div
                      className="bg-[#5f5888] h-full transition-all hover:opacity-90"
                      style={{ width: '20%' }}
                      title="Tech Round 1 (20%)"
                    />
                    <div
                      className="bg-[#3A364E] h-full transition-all hover:opacity-90"
                      style={{ width: '20%' }}
                      title="Tech Round 2 (20%)"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#c8c5cb] pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectSubTab('rejections')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7568D8]" />
                      <span>Aptitude / Online Tests: <strong>3 drives (60%)</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSubTab('rejections')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5f5888]" />
                      <span>Technical Round 1: <strong>1 drive (20%)</strong></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSubTab('rejections')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3A364E]" />
                      <span>Technical Round 2: <strong>1 drive (20%)</strong></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Next Interviews Snapshot */}
            <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#09090D]">
                    Next Scheduled Interviews ({interviewsList.length})
                  </h3>
                  <p className="text-xs text-[#5f5888]">
                    Prepare role-specific technical and system architecture MCQs before each interview date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectSubTab('interviews')}
                  className="text-xs font-bold text-[#170065] hover:underline"
                >
                  View full schedule →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interviewsList.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplication(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedApplication(item);
                      }
                    }}
                    className="p-4 bg-white rounded-xl border border-[#d1c8ff] flex items-start justify-between gap-3 cursor-pointer nexora-card-lift hover:border-[#6257A5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#09090D]">{item.company}</span>
                        <span className="text-xs font-mono-code text-[#170065] font-bold">{item.ctc}</span>
                      </div>
                      <p className="text-xs font-medium text-[#47464b] mt-0.5">{item.currentStage}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#78767b] font-mono-code mt-2">
                        <Calendar className="w-3.5 h-3.5 text-[#5f5888]" />
                        <span>{item.interviewDate}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#78767b] shrink-0 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: ALL APPLICATIONS (HIGHLY CLICKABLE CARDS) */}
        {/* ========================================================= */}
        {activeSubTab === 'applications' && (
          <div className="space-y-6 nexora-page-transition">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f1ebff] p-3 rounded-xl border border-[#d1c8ff] shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Filter applications">
                {['All', 'Interview', 'In Progress', 'Applied', 'Selected', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    role="tab"
                    aria-selected={applicationStatusFilter === status}
                    onClick={() => setApplicationStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors nexora-btn-press ${
                      applicationStatusFilter === status
                        ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                        : 'bg-white text-[#47464b] hover:text-[#09090D] border border-[#c8c5cb]'
                    }`}
                  >
                    {status}
                    <span className="ml-1 opacity-70">
                      ({status === 'All' ? applications.length : applications.filter((a) => a.status === status).length})
                    </span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#5f5888] font-mono-code hidden sm:inline">
                {filteredApplications.length} of {applications.length} applications
              </span>
            </div>

            {/* Application List */}
            {filteredApplications.length > 0 ? (
              <div className="space-y-3">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplication(app)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedApplication(app);
                      }
                    }}
                    className="bg-[#f1ebff] hover:bg-[#ebe5fa] border border-[#d1c8ff] hover:border-[#6257A5] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer nexora-card-lift select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-bold text-[#09090D]">{app.company}</h3>
                        <span className="text-xs font-mono-code font-bold text-[#170065] bg-white px-2 py-0.5 rounded border border-[#d1c8ff]">
                          {app.ctc}
                        </span>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#47464b]">
                        <span className="font-semibold text-[#09090D]">{app.role}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-[#78767b]">
                          <MapPin className="w-3 h-3" />
                          {app.location}
                        </span>
                        <span>·</span>
                        <span className="text-[#78767b] font-mono-code">Applied: {app.appliedDate}</span>
                      </div>

                      <div className="pt-1 text-xs">
                        <strong className="text-[#09090D]">Current Stage: </strong>
                        <span className="text-[#5f5888]">{app.currentStage}</span>
                        {app.interviewDate && (
                          <span className="ml-2 font-mono-code text-[#170065] font-semibold">
                            ({app.interviewDate})
                          </span>
                        )}
                      </div>

                      {/* Status Update Quick Switcher */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[#78767b] font-medium mr-1">Update Status:</span>
                        {(['Applied', 'Interview', 'Selected', 'Rejected'] as ApplicationStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateAppStatus(app.id, st)}
                            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                              app.status === st
                                ? 'bg-[#09090D] text-[#E3E0F2]'
                                : 'bg-white hover:bg-[#ebe5fa] text-[#47464b] border border-[#d1c8ff]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                      {app.applicationUrl && (
                        <a
                          href={app.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-[#170065] hover:bg-[#1f057e] text-white text-xs font-bold rounded-lg nexora-btn-press inline-flex items-center gap-1.5 shadow-xs"
                          title="Open official career / application portal"
                        >
                          <span>Open Application</span>
                          <ExternalLink className="w-3 h-3 text-[#C7BFEA]" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrepareForCompany?.(app.company);
                        }}
                        className="px-3.5 py-1.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg nexora-btn-press inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-[#7568D8]" />
                        <span>Grill Prep</span>
                      </button>

                      <ChevronRight className="w-5 h-5 text-[#78767b]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state for filtered applications */
              <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs nexora-modal-dialog">
                <div className="w-12 h-12 rounded-full bg-[#e5deff] text-[#170065] mx-auto flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#09090D]">
                  No {applicationStatusFilter} applications found
                </h3>
                <p className="text-xs sm:text-sm text-[#47464b] mt-1.5 leading-relaxed">
                  You don't currently have any drives marked as "{applicationStatusFilter}".
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setApplicationStatusFilter('All')}
                    className="px-4 py-2 text-xs font-semibold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg nexora-btn-press transition-colors shadow-xs"
                  >
                    View All Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: INTERVIEW OFFERS & UPCOMING INTERVIEWS */}
        {/* ========================================================= */}
        {activeSubTab === 'interviews' && (
          <div className="space-y-6 nexora-page-transition">
            <div className="bg-[#f1ebff] p-4 rounded-xl border border-[#d1c8ff] shadow-xs">
              <h2 className="text-lg font-black text-[#09090D]">
                Upcoming Interviews & Drive Rounds ({interviewsList.length})
              </h2>
              <p className="text-xs text-[#5f5888] mt-0.5">
                Every interview card is clickable to review stage expectations, scheduled dates, and recommended preparation topics.
              </p>
            </div>

            {interviewsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewsList.map((interview) => (
                  <div
                    key={interview.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplication(interview)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedApplication(interview);
                      }
                    }}
                    className="bg-white border border-[#d1c8ff] hover:border-[#6257A5] rounded-2xl p-5 shadow-xs transition-all cursor-pointer nexora-card-lift flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5f5888]">
                            {interview.company}
                          </span>
                          <h3 className="text-xl font-bold text-[#09090D] mt-0.5">
                            {interview.role}
                          </h3>
                        </div>
                        <span className="text-xs font-mono-code font-bold text-[#170065] bg-[#e5deff] px-2.5 py-1 rounded-md shrink-0">
                          {interview.ctc}
                        </span>
                      </div>

                      {/* Interview Date & Stage Badge */}
                      <div className="mt-4 p-3 bg-[#fcf8ff] rounded-xl border border-[#e5e0f4] space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-[#170065]">
                          <Calendar className="w-4 h-4 text-[#7568D8] shrink-0" />
                          <span>{interview.interviewDate}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-semibold text-[#09090D]">Stage: </span>
                          <span className="text-[#5f5888]">{interview.currentStage}</span>
                        </div>
                      </div>

                      {/* Next Step / Prep Focus */}
                      <div className="mt-3 text-xs text-[#47464b]">
                        <strong className="text-[#09090D]">Prep Focus: </strong>
                        <span>{interview.nextStep}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#e5e0f4] flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#170065] underline">
                        Click to view round details
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrepareForCompany?.(interview.company);
                        }}
                        className="px-4 py-2 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 nexora-btn-press"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
                        <span>Prepare in Grill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
                <p className="text-sm text-[#47464b]">No upcoming interviews currently scheduled.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: OFFERS & SELECTED APPS */}
        {/* ========================================================= */}
        {activeSubTab === 'offers' && (
          <div className="space-y-6 nexora-page-transition">
            <div className="bg-[#f1ebff] p-4 rounded-xl border border-[#d1c8ff] shadow-xs">
              <h2 className="text-lg font-black text-[#09090D]">
                Offers & Selection Letters ({offersList.length})
              </h2>
              <p className="text-xs text-[#5f5888] mt-0.5">
                Confirmed campus placement offers received.
              </p>
            </div>

            {offersList.length > 0 ? (
              <div className="space-y-4">
                {offersList.map((offer) => (
                  <div
                    key={offer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplication(offer)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedApplication(offer);
                      }
                    }}
                    className="bg-white border-2 border-[#10b981]/40 rounded-2xl p-6 shadow-sm cursor-pointer nexora-card-lift hover:border-[#10b981] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-md mb-2">
                          <span>✓ Campus Offer Accepted</span>
                        </div>
                        <h3 className="text-2xl font-black text-[#09090D]">
                          {offer.company}
                        </h3>
                        <p className="text-sm font-semibold text-[#47464b] mt-0.5">
                          {offer.role} · {offer.location}
                        </p>
                      </div>

                      <div className="text-right sm:self-auto self-start bg-[#f1ebff] p-3 rounded-xl border border-[#d1c8ff]">
                        <span className="text-[11px] text-[#78767b] font-mono-code block">Annual CTC</span>
                        <span className="text-2xl font-black text-[#170065] font-mono-code">{offer.ctc}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#e5e0f4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <strong className="text-[#09090D]">Status: </strong>
                        <span className="text-[#5f5888]">{offer.currentStage}</span>
                      </div>
                      <span className="text-[#10b981] font-semibold">{offer.nextStep}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
                <p className="text-sm text-[#47464b]">No offers recorded yet. Keep practicing!</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: REJECTION AUTOPSY (CLICKABLE REJECTED CARDS) */}
        {/* ========================================================= */}
        {activeSubTab === 'rejections' && (
          <div className="space-y-6 nexora-page-transition">
            <div className="bg-[#f1ebff] p-4 rounded-xl border border-[#d1c8ff] shadow-xs">
              <h2 className="text-lg font-black text-[#09090D]">
                Rejection Autopsy & Drive Takeaways ({rejections.length})
              </h2>
              <p className="text-xs text-[#5f5888] mt-0.5">
                Every rejected drive is a diagnostic data point. Click any card to inspect the exact failure stage and lessons learned.
              </p>
            </div>

            <div className="space-y-3">
              {rejections.map((rej) => (
                <div
                  key={rej.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRejection(rej)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedRejection(rej);
                    }
                  }}
                  className="bg-[#f1ebff] hover:bg-[#ebe5fa] border border-[#d1c8ff] hover:border-[#6257A5] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer nexora-card-lift select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[#09090D]">{rej.company}</span>
                      <span className="text-xs text-[#78767b]">·</span>
                      <span className="text-xs text-[#47464b] font-medium">{rej.role}</span>
                      <span className="text-xs text-[#78767b]">·</span>
                      <span className="text-xs font-mono-code font-bold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded border border-[#ba1a1a]/20">
                        {rej.stage}
                      </span>
                    </div>

                    <p className="text-xs text-[#47464b]">
                      <strong className="text-[#09090D]">Root Bottleneck: </strong>
                      {rej.primaryCause}
                    </p>

                    <p className="text-xs text-[#170065] font-semibold">
                      ✓ Takeaway: {rej.takeaway}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <span className="text-xs text-[#78767b] font-mono-code">{rej.date}</span>
                    <ChevronRight className="w-5 h-5 text-[#78767b]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATION DETAIL MODAL */}
        {selectedApplication && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/65 backdrop-blur-xs nexora-modal-backdrop"
            onClick={() => setSelectedApplication(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-company"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#fcf8ff] rounded-2xl border border-[#c8c0f7] p-6 shadow-2xl space-y-4 nexora-modal-dialog"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span id="app-modal-company" className="text-xs font-bold uppercase tracking-wider text-[#5f5888]">
                    {selectedApplication.company}
                  </span>
                  <h3 className="text-xl font-black text-[#09090D] mt-0.5">
                    {selectedApplication.role}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#47464b]">
                    <span className="font-bold text-[#170065] font-mono-code">{selectedApplication.ctc}</span>
                    <span>·</span>
                    <span>{selectedApplication.location}</span>
                  </div>
                </div>
                <button
                  ref={appModalCloseRef}
                  onClick={() => setSelectedApplication(null)}
                  className="p-1.5 text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  aria-label="Close application dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#f1ebff] rounded-xl border border-[#d1c8ff] space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#78767b]">Status</span>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/* Status Updater */}
                <div className="flex justify-between items-center pt-2 border-t border-[#d1c8ff]/60">
                  <span className="text-[#78767b]">Change Status</span>
                  <div className="flex flex-wrap gap-1">
                    {(['Applied', 'Interview', 'Selected', 'Rejected'] as ApplicationStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateAppStatus(selectedApplication.id, st)}
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors ${
                          selectedApplication.status === st
                            ? 'bg-[#09090D] text-[#E3E0F2]'
                            : 'bg-white hover:bg-[#ebe5fa] text-[#47464b] border border-[#d1c8ff]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#d1c8ff]/60">
                  <span className="text-[#78767b]">Current Stage</span>
                  <span className="font-bold text-[#09090D]">{selectedApplication.currentStage}</span>
                </div>
                {selectedApplication.interviewDate && (
                  <div className="flex justify-between items-center pt-2 border-t border-[#d1c8ff]/60">
                    <span className="text-[#78767b]">Interview Date</span>
                    <span className="font-bold font-mono-code text-[#170065]">{selectedApplication.interviewDate}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#d1c8ff]/60">
                  <span className="text-[#78767b]">Applied On</span>
                  <span className="font-mono-code">{selectedApplication.appliedDate}</span>
                </div>

                {selectedApplication.applicationUrl && (
                  <div className="pt-2 border-t border-[#d1c8ff]/60 flex justify-between items-center">
                    <span className="text-[#78767b]">Official Portal</span>
                    <a
                      href={selectedApplication.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[#170065] hover:underline"
                    >
                      <span>Open Application Page</span>
                      <ExternalLink className="w-3 h-3 text-[#7568D8]" />
                    </a>
                  </div>
                )}
              </div>

              {selectedApplication.nextStep && (
                <div className="text-xs">
                  <strong className="text-[#09090D] block mb-1">Recommended Action / Next Step:</strong>
                  <p className="text-[#47464b] bg-white p-3 rounded-lg border border-[#e5e0f4]">
                    {selectedApplication.nextStep}
                  </p>
                </div>
              )}

              {selectedApplication.rejectionReason && (
                <div className="text-xs">
                  <strong className="text-[#93000a] block mb-1">Rejection Root Cause:</strong>
                  <p className="text-[#93000a] bg-[#ffdad6]/40 p-3 rounded-lg border border-[#ba1a1a]/20">
                    {selectedApplication.rejectionReason}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {selectedApplication.status === 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApplication(null);
                        handleSelectSubTab('rejections');
                      }}
                      className="text-xs font-bold text-[#93000a] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View in Rejection Autopsy →</span>
                    </button>
                  )}
                  {selectedApplication.status === 'Interview' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApplication(null);
                        handleSelectSubTab('interviews');
                      }}
                      className="text-xs font-bold text-[#170065] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View in Interview Schedule →</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const comp = selectedApplication.company;
                      setSelectedApplication(null);
                      onPrepareForCompany?.(comp);
                    }}
                    className="px-5 py-2.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 nexora-btn-press shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
                    <span>Prepare in Grill</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION DETAIL MODAL */}
        {selectedRejection && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/65 backdrop-blur-xs nexora-modal-backdrop"
            onClick={() => setSelectedRejection(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rej-modal-company"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#fcf8ff] rounded-2xl border border-[#c8c0f7] p-6 shadow-2xl space-y-4 nexora-modal-dialog"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5f5888]">
                    Rejection Diagnosis
                  </span>
                  <h3 id="rej-modal-company" className="text-xl font-black text-[#09090D] mt-0.5">
                    {selectedRejection.company} · {selectedRejection.role}
                  </h3>
                  <span className="text-xs font-mono-code text-[#78767b]">
                    Drive Date: {selectedRejection.date}
                  </span>
                </div>
                <button
                  ref={rejModalCloseRef}
                  onClick={() => setSelectedRejection(null)}
                  className="p-1.5 text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  aria-label="Close rejection diagnosis"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#ffdad6]/30 border border-[#ba1a1a]/20 rounded-xl space-y-2 text-xs">
                <div>
                  <span className="font-bold text-[#93000a]">Stage Eliminated: </span>
                  <span className="text-[#93000a] font-semibold">{selectedRejection.stage}</span>
                </div>
                <div className="pt-2 border-t border-[#ba1a1a]/20">
                  <span className="font-bold text-[#09090D]">Root Bottleneck: </span>
                  <p className="mt-1 text-[#47464b] leading-relaxed">{selectedRejection.primaryCause}</p>
                </div>
              </div>

              <div className="p-4 bg-[#e5deff]/60 border border-[#c8c0f7] rounded-xl text-xs space-y-1">
                <span className="font-bold text-[#170065]">Actionable Takeaway:</span>
                <p className="text-[#1c1a28]">{selectedRejection.takeaway}</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRejection(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const comp = selectedRejection.company;
                    setSelectedRejection(null);
                    onPrepareForCompany?.(comp);
                  }}
                  className="px-5 py-2.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 nexora-btn-press shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7568D8]" />
                  <span>Practice in Resume Grill</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOG OUTCOME MODAL */}
        {showLogModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090D]/65 backdrop-blur-xs nexora-modal-backdrop"
            onClick={() => setShowLogModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-outcome-title"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#fcf8ff] rounded-2xl border border-[#c8c0f7] p-6 shadow-2xl space-y-4 nexora-modal-dialog"
            >
              <div className="flex items-center justify-between">
                <h3 id="log-outcome-title" className="text-lg font-black text-[#09090D]">
                  Log an Outcome
                </h3>
                <button
                  ref={logModalCloseRef}
                  onClick={() => setShowLogModal(false)}
                  className="p-1.5 text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8]"
                  aria-label="Close log outcome dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[#5f5888]">
                Add any test or interview you did not clear so Nexora can update your improvement focus.
              </p>

              <form onSubmit={handleAddLog} className="space-y-3">
                <div>
                  <label htmlFor="company-name" className="block text-xs font-bold text-[#09090D] mb-1">
                    Company Name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Swiggy, Goldman Sachs, TCS"
                    className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] rounded-lg outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="eliminated-stage" className="block text-xs font-bold text-[#09090D] mb-1">
                    Stage eliminated
                  </label>
                  <select
                    id="eliminated-stage"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] rounded-lg outline-none cursor-pointer"
                  >
                    <option value="Aptitude / Online Test">Aptitude / Online Test</option>
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="Technical Round 2">Technical Round 2</option>
                    <option value="HR Round">HR Round</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="what-happened-notes" className="block text-xs font-bold text-[#09090D] mb-1">
                    What felt difficult? (Optional)
                  </label>
                  <input
                    id="what-happened-notes"
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g. Ran out of time on quant section"
                    className="w-full p-2.5 text-xs bg-white border border-[#c8c5cb] focus:border-[#09090D] rounded-lg outline-none transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#47464b] hover:text-[#09090D] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] rounded-lg shadow-xs nexora-btn-press transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
