import React from 'react';
import { DailyGoal, PracticeTopic } from '../types';
import { CheckCircle2, Circle, ArrowUpRight, Flame, Target, Calendar } from 'lucide-react';
import { NavTab } from './Navbar';
import { ProgressSubTab } from './ProgressPage';

interface TodaysPlacementProps {
  goals: DailyGoal[];
  onToggleGoal: (id: string) => void;
  onNavigate: (tab: NavTab, subTab?: ProgressSubTab, practiceTopic?: PracticeTopic) => void;
  onResetGoals?: () => void;
}

export const TodaysPlacement: React.FC<TodaysPlacementProps> = ({
  goals,
  onToggleGoal,
  onNavigate,
  onResetGoals,
}) => {
  const completedCount = goals.filter((g) => g.completed || g.current >= g.target).length;
  const totalCount = goals.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Format today's date cleanly
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="bg-white border border-[#d1c8ff] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
      {/* Subtle background accent badge */}
      <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-[#f1ebff] rounded-full pointer-events-none opacity-60" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e5e0f4]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#170065] bg-[#f1ebff] rounded-md border border-[#d1c8ff]">
              <Calendar className="w-3.5 h-3.5 text-[#7568D8]" />
              {todayFormatted}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#09090D] bg-[#fcf8ff] px-2 py-1 rounded-md border border-[#e5e0f4]">
              <Flame className="w-3.5 h-3.5 text-[#ff5722]" />
              Day Streak: 5 Days
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#09090D] tracking-tight mt-2 flex items-center gap-2">
            TODAY'S PLACEMENT
          </h2>
          <p className="text-xs sm:text-sm text-[#47464b] mt-0.5 font-medium">
            Your 3 most important placement actions today.
          </p>
        </div>

        {/* Progress summary widget */}
        <div className="flex items-center gap-4 bg-[#fcf8ff] border border-[#d1c8ff] rounded-2xl p-3.5 px-5 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-[#5f5888] uppercase tracking-wider">
              Today's Progress — {percentComplete}%
            </div>
            <div className="text-lg font-mono-code font-black text-[#09090D] tabular-nums">
              {completedCount} / {totalCount} Goals Complete
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#e5e0f4] flex items-center justify-center font-mono-code text-xs font-black text-[#170065] bg-white relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#7568D8] transition-all duration-500"
                strokeWidth="4"
                strokeDasharray={`${percentComplete}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span>{percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {goals.map((goal) => {
          const isDone = goal.completed || goal.current >= goal.target;
          return (
            <div
              key={goal.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between nexora-card-lift ${
                isDone
                  ? 'bg-[#f1ebff]/50 border-[#d1c8ff]'
                  : 'bg-[#fcf8ff] border-[#e5e0f4] hover:border-[#c8c0f7]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl" role="img" aria-label="Goal category">
                    {goal.icon}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleGoal(goal.id)}
                    className="text-xs font-semibold inline-flex items-center gap-1.5 p-1 rounded-md text-[#5f5888] hover:text-[#09090D] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7568D8]"
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#c8c5cb] hover:text-[#7568D8]" />
                    )}
                  </button>
                </div>

                <h3 className={`text-sm font-bold mt-2 ${isDone ? 'line-through text-[#78767b]' : 'text-[#09090D]'}`}>
                  {goal.title}
                </h3>
                <p className="text-xs text-[#5f5888] mt-1">{goal.subtitle}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#e5e0f4]/80 flex items-center justify-between">
                <div className="text-xs font-mono-code font-bold text-[#09090D]">
                  <span className={isDone ? 'text-[#10b981]' : 'text-[#170065]'}>{goal.current}</span> / {goal.target}{' '}
                  <span className="text-[11px] text-[#78767b] font-normal">{goal.unit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate(goal.targetTab as NavTab, goal.targetSubTab as ProgressSubTab, goal.practiceTopic)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#170065] hover:text-[#09090D] group nexora-btn-press"
                >
                  <span>Start</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer controls: Reset for New Day */}
      {onResetGoals && (
        <div className="mt-5 pt-4 border-t border-[#e5e0f4] flex items-center justify-between text-xs text-[#5f5888]">
          <span className="font-medium">
            🎯 Complete your daily placements every 24 hours to keep your 5-day streak active.
          </span>
          <button
            type="button"
            onClick={onResetGoals}
            className="text-xs font-semibold text-[#170065] hover:text-[#09090D] bg-[#f1ebff] hover:bg-[#ebe5fa] border border-[#d1c8ff] px-3 py-1.5 rounded-lg transition-colors nexora-btn-press"
          >
            Reset for New Day
          </button>
        </div>
      )}
    </section>
  );
};
