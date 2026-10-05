import React, { useState, useRef } from 'react';
import { Check, Edit3, Trash2, Plus, Play, AlertTriangle, ArrowLeft, Download, CheckCircle2, Key, Upload, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { saveQuizToStorage } from '../utils/storage';
import { parseAnswerKeyInput } from '../utils/answerMatcher';
import { extractTextFromPDF } from '../utils/pdfParser';

export default function QuestionReview({ quizData, onStartTest, onBack }) {
  const [questions, setQuestions] = useState(quizData.questions || []);
  const [quizTitle, setQuizTitle] = useState(quizData.title || 'MCQ Mock Test');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  
  // Answer key section state
  const [showAnswerKeyBox, setShowAnswerKeyBox] = useState(false);
  const [rawAnswerInput, setRawAnswerInput] = useState('');
  const [answerKeyStatusMsg, setAnswerKeyStatusMsg] = useState(null);
  const [isParsingAnsPdf, setIsParsingAnsPdf] = useState(false);
  const ansFileInputRef = useRef(null);

  const missingAnswersCount = questions.filter(q => q.needsAnswerReview).length;

  const handleApplyAnswerKey = (inputText) => {
    const textToParse = inputText || rawAnswerInput;
    if (!textToParse.trim()) {
      setAnswerKeyStatusMsg({ type: 'error', text: 'Please enter or paste the answer key text.' });
      return;
    }

    const answerMap = parseAnswerKeyInput(textToParse, questions.length);
    const matchedKeys = Object.keys(answerMap);

    if (matchedKeys.length === 0) {
      setAnswerKeyStatusMsg({ 
        type: 'error', 
        text: 'Could not detect answers. Example formats: "1. A, 2. B, 3. C" or "A B C D A B C D".' 
      });
      return;
    }

    let appliedCount = 0;
    setQuestions(prev => prev.map((q, idx) => {
      // Check match by question's originalNumber or index (1-based)
      const keyForQ = answerMap[q.originalNumber] || answerMap[idx + 1];
      if (keyForQ) {
        appliedCount++;
        return {
          ...q,
          correctAnswer: keyForQ,
          needsAnswerReview: false,
        };
      }
      return q;
    }));

    setAnswerKeyStatusMsg({
      type: 'success',
      text: `Successfully applied answers to ${appliedCount} out of ${questions.length} questions!`
    });
  };

  const handleAnswerKeyPdfUpload = async (file) => {
    if (!file) return;
    setIsParsingAnsPdf(true);
    setAnswerKeyStatusMsg(null);
    try {
      const text = await extractTextFromPDF(file);
      setRawAnswerInput(text);
      handleApplyAnswerKey(text);
    } catch (err) {
      setAnswerKeyStatusMsg({ type: 'error', text: 'Failed to extract text from Answer Key PDF.' });
    } finally {
      setIsParsingAnsPdf(false);
    }
  };

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
      originalNumber: questions.length + 1,
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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-28 sm:pb-24">
      
      {/* Mobile-Friendly Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-xs sm:text-sm font-medium self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Another PDF</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAnswerKeyBox(!showAnswerKeyBox)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
              showAnswerKeyBox
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{showAnswerKeyBox ? 'Hide Answer Key' : '⚡ Auto-Apply Answers'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleAddNewQuestion}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* DEDICATED ANSWER KEY SECTION */}
      {showAnswerKeyBox && (
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-indigo-950/70 to-slate-900/80 border-2 border-indigo-500/40 shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Auto-Apply Answer Key for all Questions</h3>
                <p className="text-xs text-slate-400">
                  Paste the answers below or upload an Answer Sheet PDF/Text file.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => ansFileInputRef.current?.click()}
              disabled={isParsingAnsPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex-shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isParsingAnsPdf ? 'Extracting...' : 'Upload Answer PDF'}</span>
            </button>
            <input
              type="file"
              ref={ansFileInputRef}
              onChange={(e) => e.target.files && handleAnswerKeyPdfUpload(e.target.files[0])}
              accept=".pdf,.txt"
              className="hidden"
            />
          </div>

          <textarea
            value={rawAnswerInput}
            onChange={(e) => setRawAnswerInput(e.target.value)}
            rows={3}
            placeholder="Paste answer key here, e.g.:&#10;1. A, 2. B, 3. C, 4. D, 5. A...&#10;OR just letters: A B C D A C B D D A..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3"
          />

          {answerKeyStatusMsg && (
            <div className={`p-3 rounded-xl mb-3 text-xs font-semibold flex items-center space-x-2 ${
              answerKeyStatusMsg.type === 'success' 
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}>
              {answerKeyStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{answerKeyStatusMsg.text}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Supports pairs (`1-A, 2-C`) or raw letter series (`A B C D...`)
            </span>
            <button
              onClick={() => handleApplyAnswerKey()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Answers to All Questions</span>
            </button>
          </div>
        </div>
      )}

      {/* Title & Mobile-Friendly Stats */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl mb-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full text-lg sm:text-2xl font-bold bg-transparent text-white border-b border-slate-700 focus:border-indigo-500 focus:outline-none pb-1 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-3">
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="block text-lg sm:text-xl font-bold text-white">{questions.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">Questions</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="block text-lg sm:text-xl font-bold text-emerald-400">
                {questions.length - missingAnswersCount}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Verified</span>
            </div>
          </div>
        </div>

        {missingAnswersCount > 0 && !showAnswerKeyBox && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>{missingAnswersCount} questions</strong> have default answer keys.
              </span>
            </div>
            <button
              onClick={() => setShowAnswerKeyBox(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 font-bold hover:bg-amber-500/30 transition-colors flex-shrink-0"
            >
              Paste Answer Key
            </button>
          </div>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div 
            key={q.id}
            className={`glass-panel rounded-xl p-4 sm:p-5 border transition-all ${
              q.needsAnswerReview 
                ? 'border-amber-500/30 bg-amber-500/5' 
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {editingId === q.id ? (
              /* Inline Edit Mode */
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Question #{idx + 1}
                  </label>
                  <textarea
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editForm.options.map((opt, oIdx) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
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
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
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

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(q.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-white text-xs sm:text-base font-medium leading-relaxed whitespace-pre-line select-text">
                      {q.question}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleStartEditing(q)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit Question"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 sm:ml-9">
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
                          <span className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <span className="flex items-center text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex-shrink-0 ml-1">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />
                            Ans
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-2.5 sm:ml-9 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed Bottom Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 glass-panel border-t border-slate-700/80 shadow-2xl flex items-center justify-between backdrop-blur-xl z-30">
        <div className="text-xs text-slate-400 hidden sm:block">
          Ready with <strong className="text-white">{questions.length}</strong> questions
        </div>
        <div className="text-xs text-slate-400 sm:hidden">
          <strong className="text-white">{questions.length}</strong> Qs ({questions.length - missingAnswersCount} verified)
        </div>

        <button
          onClick={handleProceed}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Revision / Mock Test</span>
        </button>
      </div>

    </div>
  );
}