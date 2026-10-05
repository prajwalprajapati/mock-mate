import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Bookmark, RotateCcw, Download, Sparkles, ArrowRight, Printer, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveTestResult } from '../utils/storage';

export default function TestSummary({ resultData, onRetake, onPracticeWeak, onNewTest }) {
  const { title, mode, questions, answers, reviewFlags, timeSpentSeconds } = resultData;
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'unanswered'

  // Calculate statistics
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const analyzedQuestions = questions.map((q, idx) => {
    const userAns = answers[q.id];
    const isUnanswered = !userAns;
    const isCorrect = !isUnanswered && userAns === q.correctAnswer;
    const isIncorrect = !isUnanswered && !isCorrect;

    if (isCorrect) correctCount++;
    else if (isIncorrect) incorrectCount++;
    else unansweredCount++;

    return {
      ...q,
      idx: idx + 1,
      userAns,
      isCorrect,
      isIncorrect,
      isUnanswered,
      isFlagged: !!reviewFlags?.[q.id]
    };
  });

  const totalQuestions = questions.length;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) : 0;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  var answeredCount = correctCount + incorrectCount;

  // Fire confetti on high score
  useEffect(() => {
    if (scorePercent >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save to storage
    saveTestResult({
      title,
      mode,
      score: correctCount,
      total: totalQuestions,
      percent: scorePercent,
      date: new Date().toLocaleDateString(),
      timeSpent: timeSpentSeconds
    });
  }, []);

  const filteredList = analyzedQuestions.filter(q => {
    if (filter === 'incorrect') return q.isIncorrect;
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'unanswered') return q.isUnanswered;
    if (filter === 'bookmarked') return q.isFlagged;
    return true;
  });

  const formatTime = (secs) => {
    if (!secs) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  const weakQuestions = analyzedQuestions.filter(q => q.isIncorrect || q.isUnanswered);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Result Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Test Completed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Performance & Score Summary
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">{title}</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        
        {/* Score Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Score</span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-400">
            {correctCount} <span className="text-sm font-normal text-slate-500">/ {totalQuestions}</span>
          </div>
          <span className="text-xs font-bold text-indigo-300 mt-1 block">
            {scorePercent}% Marks
          </span>
        </div>

        {/* Accuracy Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Accuracy</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">
            {accuracyPercent}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {correctCount} of {answeredCount} correct
          </span>
        </div>

        {/* Time Spent */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Time Spent</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatTime(timeSpentSeconds)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {timeSpentSeconds && answeredCount ? `~${Math.round(timeSpentSeconds / Math.max(1, answeredCount))}s / que` : 'Self-paced'}
          </span>
        </div>

        {/* Result Status */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Verdict</span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${
            scorePercent >= 75 ? 'text-emerald-400' : scorePercent >= 45 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {scorePercent >= 75 ? 'Excellent' : scorePercent >= 45 ? 'Passed' : 'Needs Work'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {scorePercent >= 75 ? 'Ready for Exam!' : 'Revise weak topics'}
          </span>
        </div>

      </div>

      {/* Action Buttons Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {weakQuestions.length > 0 && (
            <button
              onClick={() => onPracticeWeak(weakQuestions)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs sm:text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Revise Weak Questions ({weakQuestions.length})</span>
            </button>
          )}

          <button
            onClick={onRetake}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Full Test</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>

          <button
            onClick={onNewTest}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>Upload New PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detailed Question Review Section */}
      <div className="space-y-4">
        
        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <h3 className="font-bold text-lg text-white">Question-by-Question Analysis</h3>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'incorrect' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'correct' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'unanswered' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Skipped ({unansweredCount})
            </button>
          </div>
        </div>

        {/* Question Cards */}
        {filteredList.map((q) => (
          <div
            key={q.id}
            className={`glass-panel p-5 rounded-2xl border transition-all ${
              q.isCorrect 
                ? 'border-emerald-500/20 bg-emerald-500/5' 
                : q.isIncorrect 
                ? 'border-red-500/20 bg-red-500/5' 
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  q.isCorrect 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : q.isIncorrect 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {q.idx}
                </span>
                <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                  {q.question}
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {q.isCorrect && (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>+1.0</span>
                  </span>
                )}
                {q.isIncorrect && (
                  <span className="flex items-center space-x-1 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>0.0</span>
                  </span>
                )}
                {q.isUnanswered && (
                  <span className="flex items-center space-x-1 text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Skipped</span>
                  </span>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
              {q.options.map(opt => {
                const isUserChosen = q.userAns === opt.key;
                const isRealCorrect = q.correctAnswer === opt.key;

                let optStyle = 'bg-slate-900/40 border-slate-800 text-slate-400';
                if (isRealCorrect) {
                  optStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold';
                } else if (isUserChosen && !isRealCorrect) {
                  optStyle = 'bg-red-500/15 border-red-500/50 text-red-300 line-through';
                }

                return (
                  <div
                    key={opt.key}
                    className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${optStyle}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center ${
                        isRealCorrect ? 'bg-emerald-500 text-white' : isUserChosen ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {isRealCorrect && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Correct Answer
                      </span>
                    )}
                    {isUserChosen && !isRealCorrect && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                        Your Choice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation if any */}
            {q.explanation && (
              <div className="mt-3 ml-10 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                <strong className="text-indigo-400">Explanation: </strong>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
