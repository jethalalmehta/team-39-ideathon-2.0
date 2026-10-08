import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { initialOpportunities, initialStudentProfile, initialApplications, initialDailyGoals } from './data/mockData';
import { Opportunity, StudentProfile, ApplicationRecord, DailyGoal, PracticeTopic } from './types';
import { evaluateEligibility } from './utils/eligibility';
import { Navbar, NavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { JourneyFlow } from './components/JourneyFlow';
import { TodaysPlacement } from './components/TodaysPlacement';
import { PracticeSection } from './components/PracticeSection';
import { OnboardingModal } from './components/OnboardingModal';
import { OpportunityFeed } from './components/OpportunityFeed';
import { OpportunityModal } from './components/OpportunityModal';
import { CompanySearchPage } from './components/CompanySearchPage';
import { ResumeGrill } from './components/ResumeGrill';
import { ProgressPage, ProgressSubTab } from './components/ProgressPage';
import { StudentProfileModal } from './components/StudentProfileModal';
import { CursorGlow } from './components/CursorGlow';
import { Footer } from './components/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('opportunities');
  const [progressSubTab, setProgressSubTab] = useState<ProgressSubTab>('dashboard');
  
  // Initialize student profile from localStorage if available
  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('nexora_student_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialStudentProfile;
  });

  // Onboarding wizard state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('nexora_onboarded');
    } catch {
      return false;
    }
  });

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_daily_goals');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialDailyGoals;
  });

  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<PracticeTopic | undefined>(undefined);

  const [rawOpportunities, setRawOpportunities] = useState<Opportunity[]>(initialOpportunities);
  
  // Initialize applications state from localStorage if present
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nexora_applications');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialApplications;
  });
  
  const [selectedOpportunityModal, setSelectedOpportunityModal] = useState<Opportunity | null>(null);
  const [grillTargetOpportunity, setGrillTargetOpportunity] = useState<Opportunity | null>(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  // Sync route from URL Hash on mount and on popstate/hashchange
  const parseRouteFromHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (!hash) return;

    // Handle direct shorthand routes: #applications, #interviews, #rejections, #offers, #autopsy, #practice
    if (hash === 'applications' || hash === 'interviews' || hash === 'offers' || hash === 'rejections' || hash === 'autopsy') {
      setActiveTab('progress');
      setProgressSubTab(hash === 'autopsy' ? 'rejections' : (hash as ProgressSubTab));
      return;
    }

    if (hash === 'practice') {
      setActiveTab('practice');
      return;
    }

    const [mainRoute, subParam] = hash.split('/');

    if (mainRoute === 'opportunities' || mainRoute === 'practice' || mainRoute === 'companies' || mainRoute === 'prepare' || mainRoute === 'progress') {
      setActiveTab(mainRoute as NavTab);
    }

    if (mainRoute === 'progress' && subParam) {
      if (['dashboard', 'applications', 'interviews', 'offers', 'rejections'].includes(subParam)) {
        setProgressSubTab(subParam as ProgressSubTab);
      }
    }
  }, []);

  useEffect(() => {
    parseRouteFromHash();

    const handleHashOrPop = () => {
      parseRouteFromHash();
    };

    window.addEventListener('hashchange', handleHashOrPop);
    window.addEventListener('popstate', handleHashOrPop);

    return () => {
      window.removeEventListener('hashchange', handleHashOrPop);
      window.removeEventListener('popstate', handleHashOrPop);
    };
  }, [parseRouteFromHash]);

  // Navigate and update browser history
  const handleNavigate = (tab: NavTab, subTab?: ProgressSubTab, practiceTopic?: PracticeTopic) => {
    if (practiceTopic) {
      setSelectedPracticeTopic(practiceTopic);
    }
    setActiveTab(tab);
    if (tab === 'progress' && subTab) {
      setProgressSubTab(subTab);
      window.location.hash = `#/${tab}/${subTab}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3600);
  };

  // Toggle daily goal completion status
  const handleToggleGoal = (id: string) => {
    setDailyGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id === id) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            current: nextCompleted ? g.target : Math.max(0, g.target - 1),
          };
        }
        return g;
      });
      try {
        localStorage.setItem('nexora_daily_goals', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Complete onboarding wizard
  const handleCompleteOnboarding = (updatedProfile: StudentProfile) => {
    setStudent(updatedProfile);
    try {
      localStorage.setItem('nexora_student_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('nexora_onboarded', 'true');
    } catch {
      // ignore
    }
    setIsOnboardingOpen(false);
    triggerToast(`Welcome ${updatedProfile.name.split(' ')[0]}! Cutoffs customized for ${updatedProfile.branch}.`);
  };

  // Dynamically calculate eligibility and match score against current student profile
  const opportunities = useMemo(() => {
    return rawOpportunities.map((opp) => {
      const evalResult = evaluateEligibility(opp.eligibility, student);

      return {
        ...opp,
        matchScore: evalResult.matchScore,
        eligibility: {
          ...opp.eligibility,
          status: evalResult.status,
          reasons: evalResult.reasons,
          userCgpa: student.cgpa,
          userBranch: student.branch,
          hasActiveBacklogs: student.activeBacklogs > 0,
        },
      };
    });
  }, [rawOpportunities, student]);

  const eligibleCount = useMemo(() => {
    return opportunities.filter((o) => o.eligibility.status === 'eligible').length;
  }, [opportunities]);

  // DIRECT "APPLY NOW" ACTION (Opens official URL + records in Nexora as Applied)
  const handleApplyOpportunity = (opp: Opportunity) => {
    const applyUrl = opp.applyUrl || `https://${opp.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers`;
    
    // Open verified application URL in a new window/tab
    if (typeof window !== 'undefined') {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    }

    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Mark as Applied in raw opportunities state
    setRawOpportunities((prev) =>
      prev.map((o) => {
        if (o.id === opp.id || o.company.toLowerCase() === opp.company.toLowerCase()) {
          return {
            ...o,
            applied: true,
            applicationDate: 'Applied today',
            applyUrl,
          };
        }
        return o;
      })
    );

    // Record / Upsert into Applications tracker
    setApplications((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.company.toLowerCase() === opp.company.toLowerCase()
      );

      let updatedList: ApplicationRecord[];

      if (existingIdx >= 0) {
        updatedList = [...prev];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          status: 'Applied',
          appliedDate: todayFormatted,
          applicationUrl: applyUrl,
          currentStage: 'Applied on Official Portal',
          nextStep: 'Awaiting shortlist response & online assessment link',
        };
      } else {
        const newApp: ApplicationRecord = {
          id: `app-${opp.id}-${Date.now()}`,
          company: opp.company,
          role: opp.role,
          ctc: opp.ctc,
          location: opp.location,
          appliedDate: todayFormatted,
          status: 'Applied',
          applicationUrl: applyUrl,
          currentStage: 'Applied on Official Portal',
          nextStep: 'Awaiting shortlist response & online assessment link',
        };
        updatedList = [newApp, ...prev];
      }

      try {
        localStorage.setItem('nexora_applications', JSON.stringify(updatedList));
      } catch {
        // ignore
      }

      return updatedList;
    });

    // Increment daily goal for applications
    setDailyGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.targetTab === 'opportunities' || g.unit === 'applications' || g.unit === 'companies') {
          const nextCurrent = Math.min(g.target, g.current + 1);
          return {
            ...g,
            current: nextCurrent,
            completed: nextCurrent >= g.target,
          };
        }
        return g;
      });
      try {
        localStorage.setItem('nexora_daily_goals', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Update open modal if relevant
    if (selectedOpportunityModal && (selectedOpportunityModal.id === opp.id || selectedOpportunityModal.company === opp.company)) {
      setSelectedOpportunityModal((prev) =>
        prev
          ? {
              ...prev,
              applied: true,
              applicationDate: 'Applied today',
              applyUrl,
            }
          : null
      );
    }

    triggerToast(`Redirecting to ${opp.company} career portal. Application recorded in your Applications!`);
  };

  // Toggle application status manually
  const handleToggleApplied = (oppId: string) => {
    const targetOpp = opportunities.find((o) => o.id === oppId);
    if (!targetOpp) return;

    const nextApplied = !targetOpp.applied;

    setRawOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === oppId) {
          return {
            ...opp,
            applied: nextApplied,
            applicationDate: nextApplied ? 'Applied just now' : undefined,
          };
        }
        return opp;
      })
    );

    // Keep applications in ProgressPage synchronized
    setApplications((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.company.toLowerCase() === targetOpp.company.toLowerCase()
      );

      let updatedList: ApplicationRecord[];

      if (nextApplied) {
        if (existingIdx >= 0) {
          updatedList = [...prev];
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            status: 'Applied',
            appliedDate: 'Just now',
            currentStage: 'Application Submitted on Portal',
          };
        } else {
          const newApp: ApplicationRecord = {
            id: `app-${targetOpp.id}-${Date.now()}`,
            company: targetOpp.company,
            role: targetOpp.role,
            ctc: targetOpp.ctc,
            location: targetOpp.location,
            appliedDate: 'Just now',
            status: 'Applied',
            applicationUrl: targetOpp.applyUrl,
            currentStage: 'Application Submitted on Portal',
            nextStep: 'Awaiting shortlist response from placement cell',
          };
          updatedList = [newApp, ...prev];
        }
      } else {
        if (existingIdx >= 0 && prev[existingIdx].id.startsWith(`app-${targetOpp.id}`)) {
          updatedList = prev.filter((_, idx) => idx !== existingIdx);
        } else {
          updatedList = prev;
        }
      }

      try {
        localStorage.setItem('nexora_applications', JSON.stringify(updatedList));
      } catch {
        // ignore
      }

      return updatedList;
    });

    triggerToast(
      nextApplied
        ? `Marked ${targetOpp.company} as Applied! Track it in Progress.`
        : `Removed applied status for ${targetOpp.company}.`
    );

    if (selectedOpportunityModal && selectedOpportunityModal.id === oppId) {
      setSelectedOpportunityModal((prev) =>
        prev
          ? {
              ...prev,
              applied: nextApplied,
              applicationDate: nextApplied ? 'Applied just now' : undefined,
            }
          : null
      );
    }
  };

  // Launch Resume Grill with selected job
  const handlePrepareOpportunity = (opp: Opportunity) => {
    setGrillTargetOpportunity(opp);
    handleNavigate('prepare');
  };

  // Prepare for company by name (from Progress/Interviews/Rejections)
  const handlePrepareForCompany = (companyName: string) => {
    const matched = opportunities.find((o) =>
      o.company.toLowerCase().includes(companyName.toLowerCase())
    ) || opportunities[0];
    setGrillTargetOpportunity(matched);
    handleNavigate('prepare');
  };

  const handleScrollToFeed = () => {
    setActiveTab('opportunities');
    window.location.hash = '#/opportunities';
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoToCompanies = () => {
    handleNavigate('companies');
  };

  return (
    <div className="min-h-screen bg-[#fcf8ff] text-[#1c1a28] flex flex-col relative selection:bg-[#d1c8ff] selection:text-[#170065]">
      {/* Subtle cursor-following glow */}
      <CursorGlow />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#09090D] text-[#E3E0F2] border border-[#252332] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold nexora-toast-enter"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Predictable Minimal Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onOpenProfile={() => setIsProfileOpen(true)}
        student={student}
      />

      {/* Main Content Area with Page Transition */}
      <main className="flex-1">
        {activeTab === 'opportunities' && (
          <div key="tab-opportunities">
            {/* Nexora Editorial Hero */}
            <HeroSection
              onFindMatches={handleScrollToFeed}
              onSearchCompanies={handleGoToCompanies}
              onSelectSampleOpportunity={() => {
                const sampleOpp = opportunities.find((o) => o.company.toLowerCase().includes('microsoft')) || opportunities[0];
                setSelectedOpportunityModal(sampleOpp);
              }}
              onPrepareSample={() => {
                const sampleOpp = opportunities.find((o) => o.company.toLowerCase().includes('microsoft')) || opportunities[0];
                handlePrepareOpportunity(sampleOpp);
              }}
              eligibleCount={eligibleCount}
              totalCount={opportunities.length}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Feature 3: TODAY'S PLACEMENT Daily Goals */}
              <TodaysPlacement
                goals={dailyGoals}
                onToggleGoal={handleToggleGoal}
                onNavigate={(tab, subTab, topic) => handleNavigate(tab, subTab, topic)}
                onResetGoals={() => {
                  setDailyGoals(initialDailyGoals);
                  try {
                    localStorage.setItem('nexora_daily_goals', JSON.stringify(initialDailyGoals));
                  } catch {
                    // ignore
                  }
                  triggerToast('Daily placement goals reset for a new productive day!');
                }}
              />
            </div>

            {/* 6-Step Obvious Journey Flow */}
            <JourneyFlow
              onNavigate={(tab, subTab) => handleNavigate(tab, subTab)}
            />

            {/* Opportunity Feed */}
            <div ref={feedRef}>
              <OpportunityFeed
                opportunities={opportunities}
                onSelectOpportunity={(opp) => setSelectedOpportunityModal(opp)}
                onPrepareOpportunity={handlePrepareOpportunity}
                onApplyOpportunity={handleApplyOpportunity}
                onSearchCompanies={handleGoToCompanies}
              />
            </div>
          </div>
        )}

        {/* Feature 2: PRACTICE QUESTIONS SECTION */}
        {activeTab === 'practice' && (
          <div key="tab-practice">
            <PracticeSection
              initialTopic={selectedPracticeTopic}
              onNavigateToCompany={handleGoToCompanies}
            />
          </div>
        )}

        {activeTab === 'companies' && (
          <div key="tab-companies">
            <CompanySearchPage
              student={student}
              onPrepareRole={handlePrepareOpportunity}
              onSelectRoleModal={(opp) => setSelectedOpportunityModal(opp)}
              onApplyRole={handleApplyOpportunity}
              onFixGap={(topic) => {
                setSelectedPracticeTopic(topic);
                handleNavigate('practice', undefined, topic);
              }}
            />
          </div>
        )}

        {activeTab === 'prepare' && (
          <div key="tab-prepare">
            <ResumeGrill
              opportunities={opportunities}
              selectedOpportunity={grillTargetOpportunity}
              onSelectOpportunity={(opp) => setGrillTargetOpportunity(opp)}
              student={student}
              onNavigateProgress={(subtab) => handleNavigate('progress', subtab)}
            />
          </div>
        )}

        {activeTab === 'progress' && (
          <div key="tab-progress">
            <ProgressPage
              onPrepareForCompany={handlePrepareForCompany}
              initialSubTab={progressSubTab}
              onSubTabChange={(sub) => {
                setProgressSubTab(sub);
                window.location.hash = `#/progress/${sub}`;
              }}
              applications={applications}
              onUpdateApplications={setApplications}
            />
          </div>
        )}
      </main>

      {/* Feature 1: NEW USER ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={student}
        onComplete={handleCompleteOnboarding}
        onClose={() => {
          setIsOnboardingOpen(false);
          try {
            localStorage.setItem('nexora_onboarded', 'true');
          } catch {
            // ignore
          }
        }}
      />

      {/* Modals & Drawers */}
      <OpportunityModal
        opportunity={selectedOpportunityModal}
        student={student}
        onClose={() => setSelectedOpportunityModal(null)}
        onPrepare={handlePrepareOpportunity}
        onToggleApplied={handleToggleApplied}
        onApply={handleApplyOpportunity}
        onFixGap={(topic) => {
          setSelectedOpportunityModal(null);
          setSelectedPracticeTopic(topic);
          handleNavigate('practice', undefined, topic);
        }}
      />

      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        student={student}
        onUpdateStudent={(updated) => {
          setStudent(updated);
          try {
            localStorage.setItem('nexora_student_profile', JSON.stringify(updated));
          } catch {
            // ignore
          }
          triggerToast(`Profile updated: ${updated.cgpa} CGPA. All cutoffs recalculated!`);
        }}
      />

      {/* Editorial Footer */}
      <Footer
        onSelectTab={(tab, subTab) => handleNavigate(tab, subTab)}
      />
    </div>
  );
}
