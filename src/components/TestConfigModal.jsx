import React, { useState } from 'react';
import { X, Clock, HelpCircle, Shuffle, Sparkles, Zap, Layers, Play, Check } from 'lucide-react';

export default function TestConfigModal({ quizData, isOpen, onClose, onLaunchTest }) {
  if (!isOpen) return null;

  const totalQuestions = quizData.questions.length;
  const [mode, setMode] = useState('exam'); // 'exam' | 'practice' | 'flashcards'
  const [questionCount, setQuestionCount] = useState(totalQuestions);
  const [timePerQuestionSec, setTimePerQuestionSec] = useState(60); // seconds
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const totalTimeMinutes = Math.max(1, Math.round((questionCount * timePerQuestionSec) / 60));

  const handleLaunch = () => {
    let pool = [...quizData.questions];
    if (shuffleQuestions) {
      pool.sort(() => Math.random() - 0.5);
    }
    pool = pool.slice(0, questionCount);

    if (shuffleOptions) {
      pool = pool.map(q => {
        const correctOpt = q.options.find(o => o.key === q.correctAnswer);
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        const standardKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        let newCorrectKey = 'A';
        const newOptions = shuffled.map((opt, idx) => {
          const key = standardKeys[idx];
          if (correctOpt && opt.text === correctOpt.text) {
            newCorrectKey = key;
          }
          return { ...opt, key };
        });

        return {
          ...q,
          options: newOptions,
          correctAnswer: newCorrectKey
        };
      });
    }

    onLaunchTest({
      title: quizData.title,
      mode,
      questions: pool,
      timeLimitSeconds: mode === 'exam' ? totalTimeMinutes * 60 : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80">
      <div className="bg-slate-950 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Configure Test & Mode</h2>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">{quizData.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Smooth Scrollable */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Mode Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              1. Choose Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Exam Mode */}
              <div
                onClick={() => setMode('exam')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 ${
                  mode === 'exam'
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Exam Mode</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Timed test with palette & final scorecard.
                  </p>
                </div>
              </div>

              {/* Practice Mode */}
              <div
                onClick={() => setMode('practice')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 ${
                  mode === 'practice'
                    ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Practice Mode</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Instant green/red answer check & solution.
                  </p>
                </div>
              </div>

              {/* Flashcards */}
              <div
                onClick={() => setMode('flashcards')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 ${
                  mode === 'flashcards'
                    ? 'border-purple-500 bg-purple-500/15 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Flashcards</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    3D flip cards to test recall and memory.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>Question Count:</span>
              <span className="text-indigo-400 font-bold text-sm">{questionCount} of {totalQuestions}</span>
            </div>

            {/* Quick preset buttons for instant phone selection */}
            <div className="flex items-center space-x-2">
              {[Math.min(10, totalQuestions), Math.min(25, totalQuestions), totalQuestions]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      questionCount === count
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {count === totalQuestions ? 'All' : `${count} Qs`}
                  </button>
                ))}
            </div>

            <input
              type="range"
              min="1"
              max={totalQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-1"
            />
          </div>

          {/* Time Limit for Exam Mode */}
          {mode === 'exam' && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span>Timer Limit:</span>
                <span className="text-indigo-400 font-bold text-sm">{totalTimeMinutes} Minutes ({timePerQuestionSec}s/Q)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimePerQuestionSec(sec)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      timePerQuestionSec === sec
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="20"
                max="180"
                step="10"
                value={timePerQuestionSec}
                onChange={(e) => setTimePerQuestionSec(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-1"
              />
            </div>
          )}

          {/* Randomization Toggles */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">Shuffle Question Order</span>
              </div>
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 accent-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">Shuffle Choices (A/B/C/D)</span>
              </div>
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end space-x-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch ({mode.toUpperCase()})</span>
          </button>
        </div>

      </div>
    </div>
  );
}