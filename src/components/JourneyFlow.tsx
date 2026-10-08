import React from 'react';
import { Compass, CheckCircle2, ShieldAlert, Send, LineChart, Award } from 'lucide-react';
import { NavTab } from './Navbar';
import { ProgressSubTab } from './ProgressPage';

interface JourneyFlowProps {
  onNavigate: (tab: NavTab, subTab?: ProgressSubTab) => void;
}

export const JourneyFlow: React.FC<JourneyFlowProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Discover',
      desc: 'Browse verified campus openings',
      icon: Compass,
      action: () => onNavigate('opportunities'),
      actionLabel: 'View Feed',
    },
    {
      num: '02',
      title: 'Check Eligibility',
      desc: 'Direct search by company & cutoff',
      icon: CheckCircle2,
      action: () => onNavigate('companies'),
      actionLabel: 'Search Companies',
    },
    {
      num: '03',
      title: 'Prepare',
      desc: '3 resume gaps & MCQ drills',
      icon: ShieldAlert,
      action: () => onNavigate('prepare'),
      actionLabel: 'Resume Grill',
    },
    {
      num: '04',
      title: 'Apply',
      desc: 'Apply with verified eligibility',
      icon: Send,
      action: () => onNavigate('opportunities'),
      actionLabel: 'Open Roles',
    },
    {
      num: '05',
      title: 'Track Result',
      desc: 'Clickable pipeline: apps to offers',
      icon: Award,
      action: () => onNavigate('progress', 'applications'),
      actionLabel: 'View Applications',
    },
    {
      num: '06',
      title: 'Learn',
      desc: 'Rejection autopsy & patterns',
      icon: LineChart,
      action: () => onNavigate('progress', 'rejections'),
      actionLabel: 'Autopsy',
    },
  ];

  return (
    <div className="w-full bg-[#f1ebff] border-y border-[#e5e0f4] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
          <div>
            <span className="text-xs font-bold text-[#5f5888] uppercase tracking-wider">
              The Nexora Loop
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#09090D] tracking-tight">
              From company search to offer letter in 6 clear steps
            </h2>
          </div>
          <span className="text-xs text-[#78767b] font-medium hidden md:inline">
            Designed for Indian campus placement drives
          </span>
        </div>

        {/* 6-step flow cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                role="button"
                tabIndex={0}
                onClick={step.action}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    step.action();
                  }
                }}
                className="group relative bg-[#fcf8ff] hover:bg-white border border-[#e5e0f4] hover:border-[#6257A5] rounded-xl p-3.5 flex flex-col justify-between transition-all nexora-card-lift cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] shadow-xs"
                aria-label={`Step ${step.num}: ${step.title}. ${step.desc}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono-code font-bold text-[#5f5888]">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#170065] group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-sm font-bold text-[#09090D] leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-[#47464b] mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-3 w-full text-left text-[11px] font-semibold text-[#170065] group-hover:text-[#09090D] inline-flex items-center gap-1 group-hover:underline pt-2 border-t border-[#f1ebff]">
                  <span>{step.actionLabel}</span>
                  <span aria-hidden="true">→</span>
                </div>

                {/* Subtle arrow divider for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#c8c5cb] pointer-events-none">
                    ›
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
