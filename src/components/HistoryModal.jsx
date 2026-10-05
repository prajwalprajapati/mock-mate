import React, { useState, useEffect } from 'react';
import { X, History, Trash2, Play, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { getSavedQuizzes, deleteQuizFromStorage, getTestHistory } from '../utils/storage';

export default function HistoryModal({ isOpen, onClose, onSelectQuiz }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'history'
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [testHistory, setTestHistory] = useState([]);

  useEffect(() => {
    setSavedQuizzes(getSavedQuizzes());
    setTestHistory(getTestHistory());
  }, [isOpen]);

  const handleDeleteQuiz = (id, e) => {
    e.stopPropagation();
    const updated = deleteQuizFromStorage(id);
    setSavedQuizzes(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Library & Test History</h2>
              <p className="text-xs text-slate-400">Stored privately in your browser storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Saved Question Papers ({savedQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past Test Scores ({testHistory.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-3">
          
          {/* TAB 1: Saved Quizzes */}
          {activeTab === 'saved' && (
            savedQuizzes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No saved question papers yet.</p>
                <p className="text-xs mt-1">Upload a PDF or choose a sample to get started!</p>
              </div>
            ) : (
              savedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => {
                    onSelectQuiz(quiz);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {quiz.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{quiz.questions.length} Questions</span>
                      {quiz.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 2: Past Test History */}
          {activeTab === 'history' && (
            testHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No completed tests recorded yet.</p>
                <p className="text-xs mt-1">Take a mock test to see your score history here!</p>
              </div>
            ) : (
              testHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-400">
                        {item.mode}
                      </span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-base font-bold ${
                      item.percent >= 75 ? 'text-emerald-400' : item.percent >= 45 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {item.score} / {item.total} ({item.percent}%)
                    </div>
                  </div>
                </div>
              ))
            )
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
