import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Bookmark, ArrowLeft, ArrowRight, Flag, RotateCcw, Send, AlertCircle, Grid, X } from 'lucide-react';

export default function ExamMode({ testData, onSubmitTest, onExit }) {
  const { title, questions, timeLimitSeconds } = testData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: 'A' }
  const [reviewFlags, setReviewFlags] = useState({}); // { [qId]: true }
  const [visited, setVisited] = useState({ [questions[0]?.id]: true });
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds || 600);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  const currentQ = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Keyboard shortcut support (1-4 or A-D to select options)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmitModalOpen) return;
      const key = e.key.toUpperCase();
      const optionMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D' };
      if (optionMap[key] && currentQ?.options.some(o => o.key === optionMap[key])) {
        handleSelectOption(optionMap[key]);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQ, isSubmitModalOpen]);

  const handleSelectOption = (key) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: key }));
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setReviewFlags(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const goToQuestion = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
      setVisited(prev => ({ ...prev, [questions[idx].id]: true }));
      setShowPaletteMobile(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const handleFinalSubmit = () => {
    const timeSpentSeconds = (timeLimitSeconds || 600) - timeLeft;
    onSubmitTest({
      title,
      mode: 'exam',
      questions,
      answers,
      reviewFlags,
      timeSpentSeconds,
      totalTimeSeconds: timeLimitSeconds,
      submittedAt: new Date().toISOString()
    });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(reviewFlags).filter(Boolean).length;
  const isTimeCritical = timeLeft < 120; // < 2 mins

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 pb-20 lg:pb-0">
      
      {/* Top CBT Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-3 sm:px-4 py-2.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <h1 className="font-bold text-xs sm:text-base text-white truncate max-w-[130px] sm:max-w-md">
            {title}
          </h1>
        </div>

        {/* Live Countdown & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-mono text-xs sm:text-sm font-bold border ${
            isTimeCritical 
              ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse' 
              : 'bg-slate-800 border-slate-700 text-indigo-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowPaletteMobile(true)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 text-xs flex items-center space-x-1"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
            <span>{currentIndex + 1}/{questions.length}</span>
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Main Examination Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Left / Center: Question & Options View */}
        <div className="lg:col-span-3 flex flex-col justify-between glass-panel p-4 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            
            {/* Question Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs sm:text-sm">
                  Q {currentIndex + 1} of {questions.length}
                </span>
                {reviewFlags[currentQ.id] && (
                  <span className="flex items-center space-x-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    <Flag className="w-3 h-3 fill-amber-400" />
                    <span>Review</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] sm:text-xs text-slate-400">
                Marks: <strong className="text-emerald-400">+1.0</strong>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-6 whitespace-pre-line select-text font-sans">
              {currentQ.question}
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`p-3 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 active:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm leading-snug">{opt.text}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
                      [{opt.key}]
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Bottom Action Controls */}
          <div className="hidden lg:flex pt-6 border-t border-slate-800 items-center justify-between gap-3 mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleClearResponse}
                disabled={!answers[currentQ.id]}
                className="px-3 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 disabled:opacity-40 text-xs sm:text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleFlag}
                className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-all ${
                  reviewFlags[currentQ.id]
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Flag className={`w-4 h-4 ${reviewFlags[currentQ.id] ? 'fill-amber-400' : ''}`} />
                <span>{reviewFlags[currentQ.id] ? 'Unmark' : 'Mark for Review'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20 transition-all"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Desktop Question Palette */}
        <div className="hidden lg:flex glass-panel p-5 rounded-2xl border border-slate-800 flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2 pb-3 border-b border-slate-800 mb-3">
              <Grid className="w-4 h-4 text-indigo-400" />
              <span>Question Palette</span>
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Ans ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Review ({flaggedCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-purple-600" />
                <span>Ans+Review</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                <span>Unvisited</span>
              </div>
            </div>

            {/* Question Buttons Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = !!reviewFlags[q.id];
                const isCurrent = currentIndex === idx;
                const isItemVisited = !!visited[q.id];

                let bgClass = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isAnswered && isFlagged) {
                  bgClass = 'bg-purple-600 text-white font-bold border-purple-500';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold border-emerald-500';
                } else if (isFlagged) {
                  bgClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isItemVisited) {
                  bgClass = 'bg-slate-800 text-slate-200 border-slate-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105' : 'hover:opacity-80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all"
            >
              Submit Test
            </button>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM CONTROLS */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-800 p-2.5 flex items-center justify-between gap-2 z-20 backdrop-blur-xl">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30"
          title="Previous Question"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleFlag}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border ${
            reviewFlags[currentQ.id]
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Flag className={`w-3.5 h-3.5 ${reviewFlags[currentQ.id] ? 'fill-amber-400' : ''}`} />
          <span>{reviewFlags[currentQ.id] ? 'Marked' : 'Mark'}</span>
        </button>

        <button
          onClick={handleClearResponse}
          disabled={!answers[currentQ.id]}
          className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 disabled:opacity-30"
        >
          Clear
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-md shadow-indigo-600/20"
        >
          <span>Save & Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MOBILE QUESTION PALETTE SLIDE-UP DRAWER */}
      {showPaletteMobile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end lg:hidden">
          <div className="glass-panel bg-slate-950 border-t border-slate-700 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Grid className="w-4 h-4 text-indigo-400" />
                <span>Question Palette ({questions.length})</span>
              </h3>
              <button
                onClick={() => setShowPaletteMobile(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 mb-4">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Review ({flaggedCount})</span>
              </div>
            </div>

            {/* Mobile Palette Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pb-4">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = !!reviewFlags[q.id];
                const isCurrent = currentIndex === idx;
                const isItemVisited = !!visited[q.id];

                let bgClass = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isAnswered && isFlagged) {
                  bgClass = 'bg-purple-600 text-white font-bold border-purple-500';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold border-emerald-500';
                } else if (isFlagged) {
                  bgClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isItemVisited) {
                  bgClass = 'bg-slate-800 text-slate-200 border-slate-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-lg text-xs font-semibold border flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-400' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowPaletteMobile(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider mt-2 shadow-lg shadow-emerald-600/20"
            >
              Submit Test ({answeredCount}/{questions.length})
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 sm:p-6 border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 mx-auto">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-1">
              Submit Your Exam?
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 text-center mb-4">
              Answers cannot be changed after final submission.
            </p>

            <div className="bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-800 space-y-1.5 mb-5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <strong className="text-white">{questions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <strong className="text-emerald-400">{answeredCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <strong className="text-amber-400">{questions.length - answeredCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Time Left:</span>
                <strong className="text-indigo-400">{formatTime(timeLeft)}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}