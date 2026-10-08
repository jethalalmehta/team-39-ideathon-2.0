import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Opportunity, StudentProfile, ResumeGap, InterviewMCQ } from '../types';
import { sampleGapsForRole, getMcqsForOpportunity } from '../data/mockData';
import { FileText, ShieldAlert, Sparkles, ChevronDown, CheckCircle2, XCircle, ArrowRight, RefreshCw, Award, AlertTriangle, RotateCcw, LineChart, Timer } from 'lucide-react';

interface ResumeGrillProps {
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  onSelectOpportunity: (opp: Opportunity) => void;
  student: StudentProfile;
  onNavigateProgress?: (subtab?: 'applications' | 'interviews' | 'offers' | 'rejections') => void;
}

export const ResumeGrill: React.FC<ResumeGrillProps> = ({
  opportunities,
  selectedOpportunity,
  onSelectOpportunity,
  student,
  onNavigateProgress,
}) => {
  const currentOpp = selectedOpportunity || opportunities[0];

  const mcqs: InterviewMCQ[] = useMemo(() => {
    return getMcqsForOpportunity(currentOpp, student);
  }, [currentOpp, student]);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isDrillCompleted, setIsDrillCompleted] = useState(false);
  const [isSimulatingAnalysis, setIsSimulatingAnalysis] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionArenaRef = useRef<HTMLDivElement>(null);

  // Reset question state when selected opportunity changes
  useEffect(() => {
    setActiveQuestionIdx(0);
    setSelectedAnswers({});
    setIsDrillCompleted(false);
    setElapsedSeconds(0);
  }, [currentOpp.id]);

  useEffect(() => {
    if (!isDrillCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDrillCompleted]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem < 10 ? '0' : ''}${rem}s`;
  };

  const gaps: ResumeGap[] = sampleGapsForRole.default;
  const activeQuestion = mcqs[activeQuestionIdx] || mcqs[0];
  const userAnswerForActive = selectedAnswers[activeQuestion.id];
  const isAnswered = userAnswerForActive !== undefined;

  // Calculate live score
  const scoreStats = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    const mistakes: { mcq: InterviewMCQ; selected: 'A' | 'B' | 'C' | 'D' }[] = [];

    mcqs.forEach((q) => {
      const userAns = selectedAnswers[q.id];
      if (userAns !== undefined) {
        attempted++;
        if (userAns === q.correctAnswer) {
          correct++;
        } else {
          mistakes.push({ mcq: q, selected: userAns });
        }
      }
    });

    const total = mcqs.length;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return {
      correct,
      attempted,
      total,
      accuracy,
      mistakes,
    };
  }, [mcqs, selectedAnswers]);

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionKey,
    }));
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < mcqs.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      setIsDrillCompleted(true);
    }
  };

  // Keyboard navigation for MCQ: 1/2/3/4 or A/B/C/D to answer, Enter for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (!isDrillCompleted) {
        if (!isAnswered) {
          if (e.key === 'a' || e.key === 'A' || e.key === '1') {
            e.preventDefault();
            handleSelectOption('A');
          } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
            e.preventDefault();
            handleSelectOption('B');
          } else if (e.key === 'c' || e.key === 'C' || e.key === '3') {
            e.preventDefault();
            handleSelectOption('C');
          } else if (e.key === 'd' || e.key === 'D' || e.key === '4') {
            e.preventDefault();
            handleSelectOption('D');
          }
        } else {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrillCompleted, isAnswered, activeQuestionIdx, mcqs.length]);

  const handleRestartDrill = () => {
    setSelectedAnswers({});
    setActiveQuestionIdx(0);
    setIsDrillCompleted(false);
  };

  const handleSimulateResumeReanalysis = () => {
    if (isSimulatingAnalysis) return;
    setIsSimulatingAnalysis(true);
    setTimeout(() => {
      setIsSimulatingAnalysis(false);
    }, 600);
  };

  const handleSelectQuestion = (idx: number) => {
    setActiveQuestionIdx(idx);
    if (window.innerWidth < 1024) {
      questionArenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-[#fcf8ff] nexora-page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e5deff] border border-[#c8c0f7] rounded-full text-xs font-semibold text-[#170065] mb-2">
            <span>Interview Prep</span>
            <span className="text-[#8174e5]">·</span>
            <span>MCQ Drill Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#09090D] tracking-tight">
            Prepare for this job.
          </h1>
          <p className="text-sm sm:text-base text-[#47464b] mt-1 max-w-2xl">
            Tailored 4-option technical MCQs testing the exact concepts {currentOpp.company} evaluates for {currentOpp.role}, mapped against your resume stack.
          </p>
        </div>

        {/* 4-Step Journey Header */}
        <div className="bg-[#f1ebff] p-3 rounded-xl border border-[#d1c8ff] mb-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold text-[#5f5888] shadow-xs">
          <div className="flex items-center gap-2 text-[#09090D]">
            <span className="w-5 h-5 rounded-full bg-[#09090D] text-[#E3E0F2] flex items-center justify-center text-[10px]">1</span>
            <span>Select target job</span>
          </div>
          <div className="flex items-center gap-2 text-[#09090D]">
            <span className="w-5 h-5 rounded-full bg-[#09090D] text-[#E3E0F2] flex items-center justify-center text-[10px]">2</span>
            <span>Resume loaded</span>
          </div>
          <div className="flex items-center gap-2 text-[#09090D]">
            <span className="w-5 h-5 rounded-full bg-[#09090D] text-[#E3E0F2] flex items-center justify-center text-[10px]">3</span>
            <span>3 Biggest gaps</span>
          </div>
          <div className="flex items-center gap-2 text-[#170065] font-bold">
            <span className="w-5 h-5 rounded-full bg-[#170065] text-[#E3E0F2] flex items-center justify-center text-[10px]">4</span>
            <span>4-Option MCQ Drill</span>
          </div>
        </div>

        {/* Top Controls: Job Picker & Resume Status */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          {/* Target Job Selector (Spans 7) */}
          <div className="md:col-span-7 bg-[#f1ebff] p-4 rounded-2xl border border-[#d1c8ff] flex flex-col justify-between shadow-xs">
            <div>
              <label htmlFor="job-selector" className="block text-[11px] font-bold uppercase tracking-wider text-[#5f5888] mb-1">
                Target Opportunity
              </label>
              <div className="relative">
                <select
                  id="job-selector"
                  value={currentOpp.id}
                  onChange={(e) => {
                    const match = opportunities.find((o) => o.id === e.target.value);
                    if (match) onSelectOpportunity(match);
                  }}
                  className="w-full bg-white border border-[#c8c5cb] rounded-xl px-4 py-2.5 text-xs font-bold text-[#09090D] appearance-none cursor-pointer focus:border-[#09090D] focus:ring-1 focus:ring-[#09090D] outline-none transition-all"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.company} — {opp.role} ({opp.ctc})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#78767b] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#d1c8ff]/60 flex items-center justify-between text-xs text-[#5f5888]">
              <span className="font-mono-code">
                {currentOpp.ctc} · {currentOpp.type}
              </span>
              <span className="font-semibold text-[#170065]">
                {currentOpp.matchScore}% Profile Match
              </span>
            </div>
          </div>

          {/* Student Active Resume (Spans 5) */}
          <div className="md:col-span-5 bg-[#f1ebff] p-4 rounded-2xl border border-[#d1c8ff] flex flex-col justify-between shadow-xs">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#5f5888] mb-1">
                Active Resume Profile
              </span>
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#e5e0f4]">
                <FileText className="w-5 h-5 text-[#170065] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#09090D] truncate">
                    {student.resumeFileName}
                  </div>
                  <div className="text-[11px] text-[#78767b] font-mono-code">
                    {student.branch} · {student.cgpa} CGPA
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#d1c8ff]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#78767b]">
                {mcqs.length} tailored MCQs generated
              </span>
              <button
                type="button"
                onClick={handleSimulateResumeReanalysis}
                disabled={isSimulatingAnalysis}
                className="text-[11px] font-semibold text-[#170065] hover:underline inline-flex items-center gap-1 nexora-btn-press"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulatingAnalysis ? 'animate-spin' : ''}`} />
                <span>Refresh MCQs</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: THE 3 BIGGEST GAPS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#09090D] tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#ba1a1a]" />
                <span>Your 3 Biggest Resume Gaps for {currentOpp.company}</span>
              </h2>
              <p className="text-xs text-[#5f5888] mt-0.5">
                Identified from the job requirements vs your listed projects. Fix these before your interview.
              </p>
            </div>
            <span className="text-xs font-mono-code font-bold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-1 rounded-md hidden sm:inline">
              3 Gaps Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gaps.map((gap, idx) => (
              <div
                key={gap.id}
                className="bg-[#f1ebff] border border-[#d1c8ff] rounded-2xl p-5 flex flex-col justify-between nexora-card-lift shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono-code font-bold text-[#5f5888]">
                      Gap 0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        gap.severity === 'high'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#fff0c2] text-[#855300]'
                      }`}
                    >
                      {gap.severity} priority
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#09090D] mb-2">
                    {gap.area}
                  </h3>

                  <p className="text-xs text-[#47464b] leading-relaxed mb-3">
                    {gap.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#d1c8ff]/60 bg-white/70 p-3 rounded-xl border border-[#e5e0f4]">
                  <span className="text-[10px] font-bold text-[#170065] uppercase tracking-wider block mb-1">
                    Recommended Fix
                  </span>
                  <p className="text-xs font-medium text-[#1c1a28] leading-snug">
                    {gap.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: 4-OPTION MCQ DRILL ENGINE */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#09090D] tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7568D8]" />
                <span>MCQ Technical Drill for {currentOpp.company}</span>
              </h2>
              <p className="text-xs text-[#5f5888] mt-0.5">
                Every question features 4 options (A/B/C/D) with instant correct/incorrect feedback and 1–2 line explanations. Use keys 1-4 or A-D to answer quickly.
              </p>
            </div>

            {/* Live Score Tracker */}
            <div className="inline-flex items-center gap-3 bg-[#f1ebff] px-3.5 py-1.5 rounded-xl border border-[#d1c8ff] self-start sm:self-auto shadow-xs">
              <div className="text-xs">
                <span className="text-[#78767b]">Score: </span>
                <strong className="text-[#09090D] font-mono-code font-bold">
                  {scoreStats.correct} / {mcqs.length}
                </strong>
              </div>
              <span className="text-[#d1c8ff]">|</span>
              <div className="text-xs font-mono-code font-bold text-[#170065]">
                {scoreStats.accuracy}% Accuracy
              </div>
            </div>
          </div>

          {!isDrillCompleted ? (
            /* ACTIVE MCQ QUESTION VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Question Navigator (Spans 4) */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[11px] font-bold text-[#5f5888] uppercase tracking-wider block mb-1">
                  Questions ({mcqs.length})
                </span>

                {mcqs.map((q, idx) => {
                  const isActive = activeQuestionIdx === idx;
                  const answeredVal = selectedAnswers[q.id];
                  const hasAnsweredThis = answeredVal !== undefined;
                  const isCorrectThis = hasAnsweredThis && answeredVal === q.correctAnswer;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 nexora-card-lift ${
                        isActive
                          ? 'bg-[#09090D] text-[#E3E0F2] border-[#252332] shadow-md ring-2 ring-[#7568D8]'
                          : 'bg-[#f1ebff] hover:bg-[#ebe5fa] text-[#1c1a28] border-[#d1c8ff]'
                      }`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-mono-code uppercase font-bold px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-[#252332] text-[#C7BFEA]' : 'bg-white text-[#5f5888]'
                            }`}
                          >
                            {q.topic}
                          </span>
                          {hasAnsweredThis && (
                            <span
                              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                                isCorrectThis ? 'text-[#10b981]' : 'text-[#ba1a1a]'
                              }`}
                            >
                              {isCorrectThis ? '✓ Correct' : '✕ Missed'}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[#09090D]'}`}>
                          {q.question}
                        </p>
                      </div>

                      <span className="text-xs opacity-60 font-mono-code">
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Question Interactive Arena (Spans 8) */}
              <div
                ref={questionArenaRef}
                className="lg:col-span-8 bg-[#09090D] rounded-2xl p-6 sm:p-7 text-[#E3E0F2] border border-[#252332] shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#252332] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#15151C] text-[#C7BFEA] border border-[#252332] font-mono-code font-bold">
                        {activeQuestion.topic}
                      </span>
                      <span className="text-[#968DC8]">
                        Question {activeQuestionIdx + 1} of {mcqs.length}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono-code text-[#7568D8] bg-[#15151C] px-2 py-0.5 rounded border border-[#252332]">
                      {activeQuestion.category}
                    </span>
                  </div>

                  {/* Why relevant context */}
                  <div className="mt-3 p-2.5 rounded-lg bg-[#15151C] border border-[#252332] text-xs text-[#c8c5cb]">
                    <span className="text-[#C7BFEA] font-semibold block mb-0.5">
                      Why asked for {currentOpp.company}:
                    </span>
                    <p>{activeQuestion.whyRelevantToJob}</p>
                  </div>

                  {/* Question Prompt */}
                  <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {activeQuestion.question}
                    </h3>
                  </div>

                  {/* 4 Options (A, B, C, D) */}
                  <div className="mt-5 space-y-2.5">
                    {activeQuestion.options.map((option) => {
                      const isSelected = userAnswerForActive === option.key;
                      const isOptionCorrect = option.key === activeQuestion.correctAnswer;

                      let optionStyle = 'bg-[#15151C] hover:bg-[#1f1f29] border-[#252332] text-[#E3E0F2]';
                      let badgeStyle = 'bg-[#252332] text-[#C7BFEA]';

                      if (isAnswered) {
                        if (isOptionCorrect) {
                          optionStyle = 'bg-[#10b981]/15 border-[#10b981] text-white';
                          badgeStyle = 'bg-[#10b981] text-black font-bold';
                        } else if (isSelected && !isOptionCorrect) {
                          optionStyle = 'bg-[#ba1a1a]/20 border-[#ba1a1a] text-[#ffdad6]';
                          badgeStyle = 'bg-[#ba1a1a] text-white font-bold';
                        } else {
                          optionStyle = 'bg-[#15151C]/60 border-[#252332] text-[#78767b] opacity-60';
                          badgeStyle = 'bg-[#252332] text-[#78767b]';
                        }
                      }

                      return (
                        <button
                          key={option.key}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(option.key)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7568D8] ${optionStyle} ${
                            !isAnswered ? 'cursor-pointer nexora-card-lift' : 'cursor-default'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono-code font-bold shrink-0 transition-colors ${badgeStyle}`}
                          >
                            {option.key}
                          </span>

                          <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                            {option.text}
                          </span>

                          {/* Instant Indicator when answered */}
                          {isAnswered && (
                            <span className="shrink-0 text-xs font-bold">
                              {isOptionCorrect && (
                                <span className="text-[#10b981] flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Correct
                                </span>
                              )}
                              {isSelected && !isOptionCorrect && (
                                <span className="text-[#ffdad6] flex items-center gap-1">
                                  <XCircle className="w-4 h-4 text-[#ba1a1a]" /> Incorrect
                                </span>
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation Banner */}
                  {isAnswered && (
                    <div
                      className={`mt-5 p-4 rounded-xl border nexora-modal-dialog ${
                        userAnswerForActive === activeQuestion.correctAnswer
                          ? 'bg-[#10b981]/10 border-[#10b981]/40'
                          : 'bg-[#ffdad6]/10 border-[#ba1a1a]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {userAnswerForActive === activeQuestion.correctAnswer ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ba1a1a]" />
                        )}
                        <span className="text-xs font-mono-code font-bold uppercase tracking-wider">
                          {userAnswerForActive === activeQuestion.correctAnswer
                            ? 'Correct Choice!'
                            : `Incorrect · Correct Answer is (${activeQuestion.correctAnswer})`}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#E3E0F2] leading-relaxed">
                        {activeQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Toolbar */}
                <div className="mt-6 pt-4 border-t border-[#252332] flex items-center justify-between text-xs">
                  <div className="text-[#968DC8] font-mono-code">
                    {scoreStats.attempted} of {mcqs.length} answered
                  </div>

                  <div className="flex items-center gap-2">
                    {isAnswered ? (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 bg-[#E3E0F2] hover:bg-white text-[#09090D] font-bold rounded-lg nexora-btn-press inline-flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <span>
                          {activeQuestionIdx < mcqs.length - 1 ? 'Next question' : 'Finish drill & see accuracy'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-[#968DC8] italic">
                        Select an option (A, B, C, or D) to reveal answer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* DRILL COMPLETED / SCORE & ACCURACY SUMMARY */
            <div className="bg-[#09090D] rounded-2xl p-6 sm:p-8 text-[#E3E0F2] border border-[#252332] shadow-2xl nexora-modal-dialog">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#252332]">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono-code text-[#7568D8] mb-1 font-bold">
                    <Award className="w-4 h-4" />
                    <span>DRILL COMPLETE · {currentOpp.company} ({currentOpp.role})</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Your Score: {scoreStats.correct} / {scoreStats.total}
                  </h3>
                  <p className="text-xs text-[#c8c5cb] mt-1">
                    Based on {currentOpp.company} technical benchmark requirements.
                  </p>
                </div>

                {/* Accuracy Badge */}
                <div className="bg-[#15151C] p-4 rounded-xl border border-[#252332] text-center min-w-[140px] shadow-xs">
                  <span className="text-[11px] font-mono-code text-[#968DC8] uppercase block">
                    Accuracy
                  </span>
                  <span className="text-3xl font-black text-[#E3E0F2] font-mono-code tabular-nums">
                    {scoreStats.accuracy}%
                  </span>
                  <span className="text-[10px] text-[#10b981] font-semibold block mt-0.5">
                    {scoreStats.accuracy >= 75 ? 'Ready for Tech Screen' : 'Needs Reinforcement'}
                  </span>
                </div>
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div className="bg-[#15151C] p-3.5 rounded-xl border border-[#252332]">
                  <span className="text-[11px] text-[#968DC8] font-bold block">Total Questions</span>
                  <span className="text-xl font-mono-code font-black text-white mt-0.5 block">{scoreStats.total}</span>
                </div>
                <div className="bg-[#15151C] p-3.5 rounded-xl border border-[#252332]">
                  <span className="text-[11px] text-[#10b981] font-bold block">Correct Answers</span>
                  <span className="text-xl font-mono-code font-black text-[#10b981] mt-0.5 block">{scoreStats.correct}</span>
                </div>
                <div className="bg-[#15151C] p-3.5 rounded-xl border border-[#252332]">
                  <span className="text-[11px] text-[#ef4444] font-bold block">Incorrect Answers</span>
                  <span className="text-xl font-mono-code font-black text-[#ef4444] mt-0.5 block">{scoreStats.mistakes.length}</span>
                </div>
                <div className="bg-[#15151C] p-3.5 rounded-xl border border-[#252332]">
                  <span className="text-[11px] text-[#C7BFEA] font-bold block">Time Taken</span>
                  <span className="text-xl font-mono-code font-black text-[#C7BFEA] mt-0.5 block">{formatTime(elapsedSeconds)}</span>
                </div>
              </div>

              {/* Topics Where Mistakes Occurred */}
              <div className="py-4 border-t border-[#252332]">
                <h4 className="text-xs font-mono-code font-bold text-[#C7BFEA] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                  <span>
                    {scoreStats.mistakes.length > 0
                      ? `Topics where you made mistakes (${scoreStats.mistakes.length}):`
                      : 'Zero mistakes! All technical topics answered correctly.'}
                  </span>
                </h4>

                {scoreStats.mistakes.length > 0 ? (
                  <div className="space-y-3">
                    {scoreStats.mistakes.map(({ mcq, selected }) => (
                      <div
                        key={mcq.id}
                        className="p-4 bg-[#15151C] border border-[#252332] rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono-code font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">
                            {mcq.topic}
                          </span>
                          <span className="text-[#968DC8]">
                            Selected: ({selected}) · Correct: ({mcq.correctAnswer})
                          </span>
                        </div>
                        <p className="text-xs font-medium text-white">
                          "{mcq.question}"
                        </p>
                        <p className="text-xs text-[#c8c5cb] border-t border-[#252332] pt-2">
                          <strong>Key Takeaway:</strong> {mcq.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-xs text-[#10b981] font-medium">
                    ✓ Outstanding performance. You demonstrated mastery across concurrency, algorithms, and system design questions.
                  </div>
                )}
              </div>

              {/* Journey Action Buttons */}
              <div className="pt-4 border-t border-[#252332] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestartDrill}
                    className="px-4 py-2.5 bg-[#15151C] hover:bg-[#252332] text-[#E3E0F2] text-xs font-bold rounded-lg border border-[#252332] inline-flex items-center gap-2 transition-colors nexora-btn-press"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake MCQ drill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextOpp = opportunities.find((o) => o.id !== currentOpp.id);
                      if (nextOpp) onSelectOpportunity(nextOpp);
                    }}
                    className="px-4 py-2.5 bg-[#252332] hover:bg-[#3A364E] text-[#E3E0F2] text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 nexora-btn-press"
                  >
                    <span>Practice next company</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {onNavigateProgress && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateProgress('applications')}
                      className="px-5 py-2.5 bg-[#E3E0F2] hover:bg-white text-[#09090D] text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm nexora-btn-press"
                    >
                      <span>Track in Applications & Progress</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateProgress('rejections')}
                      className="px-3 py-2.5 bg-[#15151C] hover:bg-[#252332] text-[#C7BFEA] text-xs font-bold rounded-lg border border-[#252332] transition-colors inline-flex items-center gap-1.5 nexora-btn-press"
                      title="View diagnostic rejection patterns"
                    >
                      <LineChart className="w-3.5 h-3.5 text-[#7568D8]" />
                      <span>Autopsy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
