import React, { useState } from 'react';
import { Check, Edit3, Trash2, Plus, Play, AlertTriangle, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { saveQuizToStorage } from '../utils/storage';

export default function QuestionReview({ quizData, onStartTest, onBack }) {
  const [questions, setQuestions] = useState(quizData.questions || []);
  const [quizTitle, setQuizTitle] = useState(quizData.title || 'MCQ Mock Test');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const missingAnswersCount = questions.filter(q => q.needsAnswerReview).length;

  const handleStartEditing = (q) => {
    setEditingId(q.id);
    setEditForm({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.explanation || '',
    });
  };

  const handleSaveEdit = (id) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          ...editForm,
          needsAnswerReview: false,
        };
      }
      return q;
    }));
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSetAnswer = (qId, answerKey) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          correctAnswer: answerKey,
          needsAnswerReview: false,
        };
      }
      return q;
    }));
  };

  const handleAddNewQuestion = () => {
    const newQ = {
      id: 'custom_' + Date.now(),
      index: questions.length + 1,
      question: 'New Question Title',
      options: [
        { key: 'A', text: 'Option A' },
        { key: 'B', text: 'Option B' },
        { key: 'C', text: 'Option C' },
        { key: 'D', text: 'Option D' }
      ],
      correctAnswer: 'A',
      explanation: '',
      needsAnswerReview: false
    };
    setQuestions([...questions, newQ]);
    handleStartEditing(newQ);
  };

  const handleProceed = () => {
    const finalQuiz = {
      id: quizData.id || ('quiz_' + Date.now()),
      title: quizTitle,
      questions: questions.map((q, idx) => ({ ...q, index: idx + 1 })),
      createdAt: new Date().toISOString()
    };
    saveQuizToStorage(finalQuiz);
    onStartTest(finalQuiz);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      title: quizTitle,
      questions
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${quizTitle.toLowerCase().replace(/\s+/g, '_')}_questions.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Another PDF</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleAddNewQuestion}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Question</span>
          </button>

          <button
            onClick={handleProceed}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Configure & Start Test</span>
          </button>
        </div>
      </div>

      {/* Title & Stats Card */}
      <div className="glass-panel p-6 rounded-2xl mb-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full text-xl sm:text-2xl font-bold bg-transparent text-white border-b border-slate-700 focus:border-indigo-500 focus:outline-none pb-1 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="block text-xl font-bold text-white">{questions.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Questions Found</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="block text-xl font-bold text-emerald-400">
                {questions.length - missingAnswersCount}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Answers Verified</span>
            </div>
          </div>
        </div>

        {missingAnswersCount > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center space-x-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>{missingAnswersCount} questions</strong> have default or unconfirmed answer keys. Click the correct option below on each question to confirm it.
            </span>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div 
            key={q.id}
            className={`glass-panel rounded-xl p-5 border transition-all ${
              q.needsAnswerReview 
                ? 'border-amber-500/30 bg-amber-500/5' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {editingId === q.id ? (
              /* Inline Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Question #{idx + 1}
                  </label>
                  <textarea
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editForm.options.map((opt, oIdx) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                        {opt.key}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...editForm.options];
                          newOpts[oIdx].text = e.target.value;
                          setEditForm({ ...editForm, options: newOpts });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-400">Correct Answer:</span>
                    <div className="flex space-x-1.5">
                      {editForm.options.map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, correctAnswer: opt.key })}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            editForm.correctAnswer === opt.key
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(q.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleStartEditing(q)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 ml-10">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctAnswer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSetAnswer(q.id, opt.key)}
                        className={`p-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-between cursor-pointer border transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <span className="flex items-center text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 ml-10 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-6 mt-8 p-4 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl flex items-center justify-between backdrop-blur-xl">
        <div className="text-xs sm:text-sm text-slate-400">
          Ready with <strong className="text-white">{questions.length}</strong> questions
        </div>
        <button
          onClick={handleProceed}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Revision / Mock Test</span>
        </button>
      </div>
    </div>
  );
}
