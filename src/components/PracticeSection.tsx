import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PracticeMCQ, PracticeTopic, PracticeDifficulty, PracticeQuestionType } from '../types';
import { practiceQuestionBank } from '../data/mockData';
import {
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Building2,
  HelpCircle,
  Filter,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Timer,
  Award,
  BookOpen,
  Check,
  Flame,
} from 'lucide-react';

interface PracticeSectionProps {
  initialTopic?: PracticeTopic;
  onNavigateToCompany?: () => void;
}

const TOPICS: PracticeTopic[] = [
  'DSA',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'Aptitude',
  'SQL',
  'JavaScript',
  'Java',
  'Python',
  'System Design Basics',
  'Software Engineering',
  'Computer Architecture',
  'Logical Reasoning',
];

const DIFFICULTIES: PracticeDifficulty[] = ['Easy', 'Medium', 'Hard'];
const QUESTION_TYPES: PracticeQuestionType[] = ['Practice', 'PYQ'];

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  initialTopic,
  onNavigateToCompany,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | 'All'>(initialTopic || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty | 'All'>('All');
  const [selectedType, setSelectedType] = useState<PracticeQuestionType | 'All'>('All');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When initialTopic prop changes from outside (e.g. from Today's Placement click)
  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
      setCurrentIndex(0);
      setIsQuizSubmitted(false);
      setUserAnswers({});
      setRevealed({});
      setElapsedSeconds(0);
      setIsTimerRunning(true);
    }
  }, [initialTopic]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && !isQuizSubmitted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isQuizSubmitted]);

  // Format time (mm:ss)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  // Filter question bank based on selected Topic, Difficulty, and Type
  const filteredQuestions = useMemo(() => {
    return practiceQuestionBank.filter((q) => {
      const matchTopic = selectedTopic === 'All' || q.topic === selectedTopic;
      const matchDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      const matchType = selectedType === 'All' || q.questionType === selectedType;
      return matchTopic && matchDiff && matchType;
    });
  }, [selectedTopic, selectedDifficulty, selectedType]);

  const currentQuestion: PracticeMCQ | undefined = filteredQuestions[currentIndex];

  // Calculate detailed quiz statistics
  const quizResults = useMemo(() => {
    const total = filteredQuestions.length;
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;
    const mistakesList: {
      question: PracticeMCQ;
      userAnswer: 'A' | 'B' | 'C' | 'D' | undefined;
      isAttempted: boolean;
    }[] = [];
    const weakTopicsMap: Record<string, number> = {};

    filteredQuestions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans !== undefined) {
        attempted += 1;
        if (ans === q.correctAnswer) {
          correct += 1;
        } else {
          incorrect += 1;
          mistakesList.push({
            question: q,
            userAnswer: ans,
            isAttempted: true,
          });
          weakTopicsMap[q.topic] = (weakTopicsMap[q.topic] || 0) + 1;
        }
      } else {
        // Unanswered in quiz
        mistakesList.push({
          question: q,
          userAnswer: undefined,
          isAttempted: false,
        });
      }
    });

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const score = correct;

    const weakTopics = Object.entries(weakTopicsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({ topic, mistakes: count }));

    return {
      total,
      correct,
      incorrect,
      attempted,
      accuracy,
      score,
      mistakesList,
      weakTopics,
    };
  }, [filteredQuestions, userAnswers]);

  // Handle option selection
  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    if (userAnswers[currentQuestion.id]) return; // already answered

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
    setRevealed((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    setIsQuizSubmitted(true);
    setIsTimerRunning(false);
    try {
      const practiceHistoryRecord = {
        date: new Date().toISOString(),
        score: quizResults.score,
        total: quizResults.total,
        accuracy: quizResults.accuracy,
        correct: quizResults.correct,
        incorrect: quizResults.incorrect,
        timeTaken: formatTime(elapsedSeconds),
        weakTopics: quizResults.weakTopics,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
      };
      localStorage.setItem('nexora_last_practice_result', JSON.stringify(practiceHistoryRecord));
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setRevealed({});
    setCurrentIndex(0);
    setIsQuizSubmitted(false);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#f1ebff] border border-[#d1c8ff] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#c8c0f7] rounded-full text-xs font-bold text-[#170065] mb-3 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#7568D8]" />
            <span>High-Yield Placement MCQ Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#09090D] tracking-tight">
            Practice & Company PYQ Drills
          </h1>
          <p className="text-xs sm:text-sm text-[#47464b] mt-2 leading-relaxed">
            14 core technical topics, verified previous-year questions (PYQs) from Google, Microsoft, Amazon, Oracle, TCS, and Qualcomm, with full performance diagnosis.
          </p>
        </div>

        {/* Real-time stats & controls bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[#e5e0f4]">
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d1c8ff]">
            <span className="text-[11px] font-bold text-[#5f5888] uppercase block">Attempted</span>
            <span className="text-lg sm:text-xl font-mono-code font-black text-[#09090D]">
              {quizResults.attempted} / {filteredQuestions.length}
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d1c8ff]">
            <span className="text-[11px] font-bold text-[#5f5888] uppercase block">Score</span>
            <span className="text-lg sm:text-xl font-mono-code font-black text-[#170065]">
              {quizResults.correct} pts
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d1c8ff]">
            <span className="text-[11px] font-bold text-[#5f5888] uppercase block">Accuracy</span>
            <span className="text-lg sm:text-xl font-mono-code font-black text-[#10b981]">
              {quizResults.accuracy}%
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d1c8ff]">
            <span className="text-[11px] font-bold text-[#5f5888] uppercase block flex items-center gap-1">
              <Timer className="w-3 h-3 text-[#7568D8]" /> Time
            </span>
            <span className="text-lg sm:text-xl font-mono-code font-black text-[#09090D]">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-[#d1c8ff] flex items-center justify-between col-span-2 sm:col-span-1">
            {!isQuizSubmitted ? (
              <button
                type="button"
                onClick={handleFinishQuiz}
                disabled={quizResults.attempted === 0}
                className="w-full py-2 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none nexora-btn-press text-center shadow-xs"
              >
                Finish Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetryQuiz}
                className="w-full py-2 bg-[#170065] hover:bg-[#1f057e] text-white text-xs font-bold rounded-xl transition-all nexora-btn-press text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: RESULTS PAGE (When Quiz is Finished/Submitted) */}
      {isQuizSubmitted ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Main Results Card */}
          <div className="bg-[#09090D] text-[#E3E0F2] border border-[#252332] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#252332]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#15151C] text-[#C7BFEA] border border-[#252332] rounded-full text-xs font-mono-code font-bold mb-2">
                  <Award className="w-3.5 h-3.5 text-[#7568D8]" />
                  <span>QUIZ ASSESSMENT SUMMARY · {selectedTopic}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Your Score: {quizResults.correct} / {quizResults.total}
                </h2>
                <p className="text-xs sm:text-sm text-[#c8c5cb] mt-1">
                  Completed in {formatTime(elapsedSeconds)} · Tested against campus hiring benchmark.
                </p>
              </div>

              {/* Accuracy Badge */}
              <div className="bg-[#15151C] p-5 rounded-2xl border border-[#252332] text-center min-w-[160px]">
                <span className="text-xs font-mono-code text-[#968DC8] uppercase block font-bold">
                  Overall Accuracy
                </span>
                <span className="text-4xl font-black text-[#E3E0F2] font-mono-code tabular-nums my-1 block">
                  {quizResults.accuracy}%
                </span>
                <span
                  className={`text-xs font-bold inline-block px-2 py-0.5 rounded ${
                    quizResults.accuracy >= 75
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : quizResults.accuracy >= 50
                      ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                      : 'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}
                >
                  {quizResults.accuracy >= 75
                    ? 'Placement Ready'
                    : quizResults.accuracy >= 50
                    ? 'Borderline Cutoff'
                    : 'Needs Revision'}
                </span>
              </div>
            </div>

            {/* 4 Score Metrics Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
              <div className="bg-[#15151C] p-4 rounded-2xl border border-[#252332]">
                <span className="text-xs text-[#968DC8] font-bold block">Total Questions</span>
                <span className="text-2xl font-mono-code font-black text-white mt-1 block">
                  {quizResults.total}
                </span>
              </div>

              <div className="bg-[#15151C] p-4 rounded-2xl border border-[#252332]">
                <span className="text-xs text-[#10b981] font-bold block">Correct Answers</span>
                <span className="text-2xl font-mono-code font-black text-[#10b981] mt-1 block">
                  {quizResults.correct}
                </span>
              </div>

              <div className="bg-[#15151C] p-4 rounded-2xl border border-[#252332]">
                <span className="text-xs text-[#ef4444] font-bold block">Incorrect Answers</span>
                <span className="text-2xl font-mono-code font-black text-[#ef4444] mt-1 block">
                  {quizResults.incorrect}
                </span>
              </div>

              <div className="bg-[#15151C] p-4 rounded-2xl border border-[#252332]">
                <span className="text-xs text-[#C7BFEA] font-bold block">Time Taken</span>
                <span className="text-2xl font-mono-code font-black text-[#C7BFEA] mt-1 block">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Weak Topics Section */}
            <div className="pt-6 border-t border-[#252332]">
              <h3 className="text-xs font-mono-code font-bold text-[#C7BFEA] uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                <span>
                  {quizResults.weakTopics.length > 0
                    ? `Weak Topics Identified (${quizResults.weakTopics.length}):`
                    : 'Zero weak topics identified! Flawless conceptual mastery.'}
                </span>
              </h3>

              {quizResults.weakTopics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quizResults.weakTopics.map(({ topic, mistakes }) => (
                    <div
                      key={topic}
                      className="p-3.5 bg-[#15151C] border border-[#252332] rounded-xl flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-white">{topic}</span>
                      <span className="text-xs font-mono-code font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">
                        {mistakes} mistake{mistakes > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-xs text-[#10b981] font-medium">
                  ✓ Outstanding performance. You answered all questions correctly in this drill session.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-8 mt-8 border-t border-[#252332] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRetryQuiz}
                className="px-6 py-3 bg-white hover:bg-[#f1ebff] text-[#09090D] text-xs font-black rounded-xl inline-flex items-center gap-2 transition-all nexora-btn-press shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('All');
                    handleRetryQuiz();
                  }}
                  className="px-4 py-3 bg-[#15151C] hover:bg-[#252332] text-[#E3E0F2] text-xs font-bold rounded-xl border border-[#252332] transition-colors"
                >
                  Practice All Topics
                </button>
              </div>
            </div>
          </div>

          {/* List of Incorrectly Answered Questions Review */}
          <div className="bg-white border border-[#e5e0f4] rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg sm:text-xl font-black text-[#09090D] tracking-tight mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#7568D8]" />
              <span>Detailed Question Review & Explanations</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#47464b] mb-6">
              Review correct solutions, options selected, and detailed rationales for every question in this drill.
            </p>

            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                const isAnswered = userAns !== undefined;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      !isAnswered
                        ? 'bg-[#fcf8ff] border-[#e5e0f4]'
                        : isCorrect
                        ? 'bg-[#f0fdf4] border-[#86efac]'
                        : 'bg-[#fef2f2] border-[#fca5a5]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e5e0f4]/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-white text-[#09090D] border border-[#d1c8ff]">
                          Q{idx + 1} · {q.topic}
                        </span>
                        <span className="text-[11px] font-semibold text-[#5f5888]">
                          {q.difficulty}
                        </span>
                        {q.companyTag && (
                          <span className="text-[11px] font-bold text-[#170065] bg-[#f1ebff] px-2 py-0.5 rounded border border-[#d1c8ff]">
                            {q.companyTag}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {isCorrect ? (
                          <span className="text-[#16a34a] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct (Option {q.correctAnswer})
                          </span>
                        ) : isAnswered ? (
                          <span className="text-[#dc2626] flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Missed (Selected: {userAns} · Correct: {q.correctAnswer})
                          </span>
                        ) : (
                          <span className="text-[#78767b]">Not Attempted</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-[#09090D] mt-3 mb-3">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt) => {
                        const isThisCorrect = opt.key === q.correctAnswer;
                        const isThisSelected = userAns === opt.key;

                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                              isThisCorrect
                                ? 'bg-[#dcfce7] border-[#86efac] font-bold text-[#14532d]'
                                : isThisSelected && !isThisCorrect
                                ? 'bg-[#fee2e2] border-[#fca5a5] font-bold text-[#991b1b]'
                                : 'bg-white border-[#e5e0f4] text-[#47464b]'
                            }`}
                          >
                            <span className="font-mono-code font-bold">({opt.key})</span>
                            <span className="flex-1">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#e5e0f4]/80 text-xs text-[#374151]">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: ACTIVE QUIZ PRACTICE ARENA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#e5e0f4] rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e0f4]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#7568D8]" />
                  <span className="text-sm font-black text-[#09090D] uppercase tracking-wide">
                    Topic Filter
                  </span>
                </div>
                <span className="text-xs font-mono-code text-[#78767b]">
                  {filteredQuestions.length} Questions
                </span>
              </div>

              {/* 14 Technical Topics Filter */}
              <div>
                <label className="block text-xs font-bold text-[#09090D] uppercase tracking-wider mb-2.5">
                  Technical Topic ({TOPICS.length})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopic('All');
                      setCurrentIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTopic === 'All'
                        ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                        : 'bg-[#fcf8ff] text-[#47464b] border border-[#e5e0f4] hover:bg-[#f1ebff]'
                    }`}
                  >
                    All Topics
                  </button>
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(topic);
                        setCurrentIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedTopic === topic
                          ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                          : 'bg-[#fcf8ff] text-[#47464b] border border-[#e5e0f4] hover:bg-[#f1ebff]'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs font-bold text-[#09090D] uppercase tracking-wider mb-2.5">
                  Difficulty
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setCurrentIndex(0);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                        selectedDifficulty === diff
                          ? 'bg-[#09090D] text-[#E3E0F2] shadow-xs'
                          : 'bg-[#fcf8ff] text-[#47464b] border border-[#e5e0f4] hover:bg-[#f1ebff]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type Filter */}
              <div>
                <label className="block text-xs font-bold text-[#09090D] uppercase tracking-wider mb-2.5">
                  Question Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['All', 'Practice', 'PYQ'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        setCurrentIndex(0);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                        selectedType === type
                          ? 'bg-[#170065] text-white shadow-xs'
                          : 'bg-[#fcf8ff] text-[#47464b] border border-[#e5e0f4] hover:bg-[#f1ebff]'
                      }`}
                    >
                      {type === 'PYQ' ? '⭐ PYQ' : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Submit Quiz Action Widget */}
            <div className="bg-[#fcf8ff] border border-[#d1c8ff] rounded-3xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#170065]">Quiz Progress</span>
                <span className="text-xs font-mono-code font-bold text-[#09090D]">
                  {quizResults.attempted} / {filteredQuestions.length} answered
                </span>
              </div>
              <button
                type="button"
                onClick={handleFinishQuiz}
                disabled={quizResults.attempted === 0}
                className="w-full py-3 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none nexora-btn-press text-center shadow-md flex items-center justify-center gap-2"
              >
                <span>Submit & View Results Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Question Arena */}
          <div className="lg:col-span-8">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-[#e5e0f4] rounded-3xl p-12 text-center shadow-xs">
                <HelpCircle className="w-12 h-12 text-[#c8c0f7] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#09090D]">No questions match this filter</h3>
                <p className="text-xs text-[#5f5888] mt-1 mb-4">
                  Try selecting "All" topics or different difficulty levels.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('All');
                    setSelectedDifficulty('All');
                    setSelectedType('All');
                  }}
                  className="px-5 py-2.5 bg-[#09090D] text-[#E3E0F2] text-xs font-bold rounded-xl nexora-btn-press"
                >
                  Reset All Filters
                </button>
              </div>
            ) : currentQuestion ? (
              <div className="bg-white border border-[#d1c8ff] rounded-3xl p-6 sm:p-8 shadow-sm relative flex flex-col justify-between min-h-[480px]">
                <div>
                  {/* Question Header Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-[#e5e0f4]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-[#f1ebff] text-[#170065] text-xs font-bold rounded-lg border border-[#d1c8ff]">
                        {currentQuestion.topic}
                      </span>

                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          currentQuestion.difficulty === 'Easy'
                            ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                            : currentQuestion.difficulty === 'Medium'
                            ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                            : 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]'
                        }`}
                      >
                        {currentQuestion.difficulty}
                      </span>

                      {currentQuestion.questionType === 'PYQ' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#170065] text-[#E3E0F2] text-xs font-bold rounded-lg shadow-2xs">
                          <Building2 className="w-3.5 h-3.5 text-[#C7BFEA]" />
                          <span>{currentQuestion.companyTag || 'Verified PYQ'}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono-code font-bold text-[#5f5888]">
                      Question {currentIndex + 1} of {filteredQuestions.length}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="py-6">
                    <h2 className="text-base sm:text-xl font-bold text-[#09090D] leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* 4 Options (A, B, C, D) */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = userAnswers[currentQuestion.id] === option.key;
                      const isCorrect = currentQuestion.correctAnswer === option.key;
                      const hasAnswered = !!userAnswers[currentQuestion.id];

                      let optionStyle = 'bg-[#fcf8ff] border-[#e5e0f4] hover:border-[#c8c0f7] text-[#1c1a28]';
                      let badgeStyle = 'bg-white border-[#d1c8ff] text-[#09090D]';

                      if (hasAnswered) {
                        if (isCorrect) {
                          optionStyle = 'bg-[#ecfdf5] border-[#10b981] text-[#065f46] font-semibold';
                          badgeStyle = 'bg-[#10b981] text-white border-[#10b981]';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'bg-[#fef2f2] border-[#ef4444] text-[#991b1b] font-semibold';
                          badgeStyle = 'bg-[#ef4444] text-white border-[#ef4444]';
                        } else {
                          optionStyle = 'bg-[#fcf8ff]/60 border-[#e5e0f4] text-[#78767b] opacity-60';
                        }
                      }

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleSelectOption(option.key)}
                          disabled={hasAnswered}
                          className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 nexora-card-lift ${optionStyle}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono-code font-bold text-xs shrink-0 border ${badgeStyle}`}
                          >
                            {option.key}
                          </span>
                          <span className="flex-1 mt-0.5 leading-relaxed">{option.text}</span>
                          {hasAnswered && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                          )}
                          {hasAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation Banner */}
                  {revealed[currentQuestion.id] && (
                    <div
                      className={`mt-6 p-5 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                        userAnswers[currentQuestion.id] === currentQuestion.correctAnswer
                          ? 'bg-[#f0fdf4] border-[#86efac] text-[#14532d]'
                          : 'bg-[#fef2f2] border-[#fca5a5] text-[#7f1d1d]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1.5">
                        {userAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                            <span>Correct! Option {currentQuestion.correctAnswer}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-[#dc2626]" />
                            <span>Incorrect. Correct answer is Option {currentQuestion.correctAnswer}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-[#374151] font-medium">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Question Controls */}
                <div className="pt-6 mt-6 border-t border-[#e5e0f4] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 text-xs font-semibold text-[#47464b] hover:text-[#09090D] bg-[#fcf8ff] border border-[#e5e0f4] rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentIndex < filteredQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#09090D] hover:bg-[#1b1b1f] text-[#E3E0F2] text-xs font-bold rounded-xl nexora-btn-press transition-all shadow-sm"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishQuiz}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#170065] hover:bg-[#1f057e] text-white text-xs font-bold rounded-xl nexora-btn-press shadow-sm"
                      >
                        <span>Finish Quiz & See Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
