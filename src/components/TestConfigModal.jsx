import React, { useState } from 'react';
import { X, Clock, HelpCircle, Shuffle, Sparkles, Zap, Layers, Play } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-950">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configure Test & Revision</h2>
              <p className="text-xs text-slate-400">{quizData.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Select Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Exam Mode */}
              <div
                onClick={() => setMode('exam')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'exam'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Exam Mode</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Timed test, question palette, score review at end.
                </p>
              </div>

              {/* Practice Mode */}
              <div
                onClick={() => setMode('practice')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'practice'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Practice Mode</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Instant green/red feedback & explanations for revising.
                </p>
              </div>

              {/* Flashcards */}
              <div
                onClick={() => setMode('flashcards')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'flashcards'
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Flashcards</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Flip-cards for rapid memory recall & quick check.
                </p>
              </div>

            </div>
          </div>

          {/* Question Count & Time Limits */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Number of Questions:</span>
                <span className="text-indigo-400 font-bold">{questionCount} of {totalQuestions}</span>
              </div>
              <input
                type="range"
                min="1"
                max={totalQuestions}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {mode === 'exam' && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Time Limit:</span>
                  <span className="text-indigo-400 font-bold">{totalTimeMinutes} Minutes ({timePerQuestionSec}s/que)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  step="10"
                  value={timePerQuestionSec}
                  onChange={(e) => setTimePerQuestionSec(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Randomization toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-300">Shuffle Question Order</span>
              </div>
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-4 h-4 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-300">Shuffle Option Choices (A/B/C/D)</span>
              </div>
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 accent-indigo-500"
              />
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Test ({mode.toUpperCase()})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
