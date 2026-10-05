import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Check, X, Sparkles, Layers, BookOpen } from 'lucide-react';

export default function FlashcardMode({ testData, onExit, onFinish }) {
  const { title, questions } = testData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownQuestions, setKnownQuestions] = useState(new Set());
  const [learningQuestions, setLearningQuestions] = useState(new Set());

  const currentQ = questions[currentIndex];
  const correctOption = currentQ.options.find(o => o.key === currentQ.correctAnswer);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMark = (isKnown) => {
    if (isKnown) {
      setKnownQuestions(prev => new Set(prev).add(currentQ.id));
      setLearningQuestions(prev => {
        const next = new Set(prev);
        next.delete(currentQ.id);
        return next;
      });
    } else {
      setLearningQuestions(prev => new Set(prev).add(currentQ.id));
      setKnownQuestions(prev => {
        const next = new Set(prev);
        next.delete(currentQ.id);
        return next;
      });
    }

    // Move next after marking
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const masteryPercent = Math.round((knownQuestions.size / questions.length) * 100);

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
            <span className="hidden sm:inline">Exit Flashcards</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <span className="font-bold text-sm text-white truncate max-w-[200px]">
            {title}
          </span>
        </div>

        {/* Mastery meter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Mastered:</span>
            <span className="font-bold text-emerald-400">{knownQuestions.size}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Needs Review:</span>
            <span className="font-bold text-amber-400">{learningQuestions.size}</span>
          </div>

          <button
            onClick={onFinish}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5">
        <div 
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard View */}
      <div className="max-w-2xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-center items-center">
        
        <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
          <span>Card {currentIndex + 1} of {questions.length}</span>
          <span>Click card or button to flip</span>
        </div>

        {/* 3D Flashcard Container */}
        <div
          onClick={handleFlip}
          className="w-full min-h-[380px] sm:min-h-[420px] rounded-3xl cursor-pointer perspective-1000 group select-none"
        >
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}>
            
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 flex flex-col justify-between backface-hidden shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Question
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 text-xs">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip to see Answer</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-medium text-white leading-relaxed mb-6">
                  {currentQ.question}
                </h3>

                <div className="space-y-2">
                  {currentQ.options.map(opt => (
                    <div
                      key={opt.key}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 text-xs sm:text-sm flex items-center space-x-2.5"
                    >
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-800/60 text-xs text-indigo-400 font-semibold flex items-center justify-center space-x-1">
                <span>Click anywhere to reveal answer</span>
                <RotateCw className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 w-full h-full glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/40 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Correct Answer
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 text-xs">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip back</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow">
                      {currentQ.correctAnswer}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-emerald-300">
                      {correctOption ? correctOption.text : `Option ${currentQ.correctAnswer}`}
                    </span>
                  </div>
                </div>

                {currentQ.explanation ? (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300">
                    <span className="font-bold text-indigo-400 block mb-1">Key Explanation:</span>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    No extra explanation provided in document.
                  </div>
                )}
              </div>

              {/* Assessment Actions on Back */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleMark(false)}
                  className="py-2.5 px-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Need Practice</span>
                </button>

                <button
                  onClick={() => handleMark(true)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>I Know This</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation bottom */}
        <div className="flex items-center justify-between w-full mt-6 px-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Flip Card</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
