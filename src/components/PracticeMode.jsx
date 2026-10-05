import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Bookmark, Sparkles, HelpCircle, RotateCcw, Lightbulb, Trophy } from 'lucide-react';

export default function PracticeMode({ testData, onSubmitTest, onExit }) {
  const { title, questions } = testData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: 'A' }
  const [bookmarked, setBookmarked] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentQ.id];
  const isAnswered = !!selectedAnswer;
  const isCorrect = isAnswered && selectedAnswer === currentQ.correctAnswer;

  const handleSelectOption = (key) => {
    if (isAnswered) return; // locked once clicked
    setAnswers(prev => ({ ...prev, [currentQ.id]: key }));
    setShowExplanation(true);
  };

  const handleToggleBookmark = () => {
    setBookmarked(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(!!answers[questions[currentIndex + 1].id]);
    } else {
      // Completed all questions in practice mode
      handleFinishPractice();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(!!answers[questions[currentIndex - 1].id]);
    }
  };

  const handleResetCurrent = () => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
    setShowExplanation(false);
  };

  const handleFinishPractice = () => {
    onSubmitTest({
      title,
      mode: 'practice',
      questions,
      answers,
      reviewFlags: bookmarked,
      timeSpentSeconds: 0,
      totalTimeSeconds: 0,
      submittedAt: new Date().toISOString()
    });
  };

  // Stats
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([qId, ans]) => {
    const q = questions.find(item => item.id === qId);
    return q && q.correctAnswer === ans;
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Revision</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">
              Revision Mode
            </span>
            <h1 className="font-bold text-sm text-white truncate max-w-[150px] sm:max-w-xs">
              {title}
            </h1>
          </div>
        </div>

        {/* Progress & Live Score */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Score:</span>
            <span className="font-bold text-emerald-400">{correctCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{answeredCount}</span>
          </div>

          <button
            onClick={handleFinishPractice}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            View Summary
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Practice Container */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-between">
        
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Question Indicator & Bookmarks */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors ${
                  bookmarked[currentQ.id]
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Bookmark for later"
              >
                <Bookmark className={`w-4 h-4 ${bookmarked[currentQ.id] ? 'fill-amber-400' : ''}`} />
                <span className="hidden sm:inline">Bookmark</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-6">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isThisSelected = selectedAnswer === opt.key;
              const isThisCorrect = opt.key === currentQ.correctAnswer;

              let style = 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-850';
              
              if (isAnswered) {
                if (isThisCorrect) {
                  // Always highlight correct answer in green
                  style = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
                } else if (isThisSelected) {
                  // User chose this and it was wrong
                  style = 'bg-red-500/15 border-red-500 text-red-200 font-semibold shadow-md shadow-red-500/10';
                } else {
                  style = 'bg-slate-900/30 border-slate-850 text-slate-500 opacity-60';
                }
              }

              return (
                <div
                  key={opt.key}
                  onClick={() => handleSelectOption(opt.key)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                      isAnswered && isThisCorrect
                        ? 'bg-emerald-500 text-white'
                        : isAnswered && isThisSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-sm sm:text-base">{opt.text}</span>
                  </div>

                  {isAnswered && (
                    <div>
                      {isThisCorrect && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 uppercase">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Correct</span>
                        </span>
                      )}
                      {isThisSelected && !isThisCorrect && (
                        <span className="flex items-center space-x-1 text-xs font-bold text-red-400 uppercase">
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Incorrect</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback & Solution Banner */}
          {isAnswered && (
            <div className={`mt-6 p-4 rounded-xl border animate-fade-in ${
              isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center space-x-2 mb-1.5">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <h4 className={`font-bold text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCorrect ? 'Great Job! That is the correct answer.' : `Incorrect. The correct answer is option (${currentQ.correctAnswer}).`}
                </h4>
              </div>

              {currentQ.explanation && (
                <div className="mt-2 text-xs text-slate-300 pl-7 flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Explanation: </span>
                    <span>{currentQ.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {isAnswered && (
              <button
                onClick={handleResetCurrent}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Revision' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
