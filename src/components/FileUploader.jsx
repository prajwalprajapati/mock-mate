import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle2, ClipboardPaste } from 'lucide-react';
import { extractTextFromPDF, parseMCQText } from '../utils/pdfParser';
import { SAMPLE_DATASETS } from '../utils/sampleData';

export default function FileUploader({ onQuestionsLoaded }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'samples'
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setProgressMsg('Extracting text from PDF...');

    try {
      const text = await extractTextFromPDF(file, (curr, total) => {
        setProgressMsg(`Reading page ${curr} of ${total}...`);
      });

      setProgressMsg('Parsing MCQs and answer keys...');
      const questions = parseMCQText(text);

      if (questions.length === 0) {
        setError('No clear multiple choice questions could be found in this PDF. Try pasting the text directly or verify the PDF format.');
        setIsLoading(false);
        return;
      }

      onQuestionsLoaded({
        title: file.name.replace(/\.pdf$/i, ''),
        questions,
        source: 'pdf'
      });
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from this PDF. Please check if the PDF is scanned / image-only or password protected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setError('Please paste your questions and options first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const questions = parseMCQText(pastedText);
      if (questions.length === 0) {
        setError('Could not identify MCQ questions. Make sure questions have numbered format (1., Q1.) and options (A, B, C, D).');
        setIsLoading(false);
        return;
      }
      onQuestionsLoaded({
        title: 'Custom Pasted Quiz',
        questions,
        source: 'pasted'
      });
    } catch (err) {
      setError('Error parsing text: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    onQuestionsLoaded({
      title: sample.title,
      questions: sample.questions,
      source: 'sample'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Revision & Practice Generator</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Turn Any <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MCQ PDF</span> Into An Interactive Mock Test
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Upload question papers, competitive exam sheets, or study materials. Automatically extract questions, take timed exams, and revise with instant feedback.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'upload'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>

          <button
            onClick={() => { setActiveTab('paste'); setError(null); }}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'paste'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Text</span>
          </button>

          <button
            onClick={() => { setActiveTab('samples'); setError(null); }}
            className={`flex-1 py-4 px-4 text-center font-medium text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'samples'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Sample Quizzes</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          
          {/* Error Notification */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-200">Unable to process questions</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* TAB 1: PDF Upload */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-900/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  accept=".pdf"
                  className="hidden"
                />

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">{progressMsg}</p>
                      <p className="text-sm text-slate-400 mt-1">Extracting question structures and answers...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        Drop your MCQ PDF here, or <span className="text-indigo-400 underline">browse files</span>
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Supports Question Papers, GATE/NEET/UPSC sheets, College Exams, and Custom MCQs
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>100% Client-Side Private</span>
                      </span>
                      <span>•</span>
                      <span>Auto Option & Answer Detection</span>
                      <span>•</span>
                      <span>Instant Mock Test</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Paste Raw Text */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste your questions, options, and answer key:
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={10}
                  placeholder={`Example format:\n\n1. What is the capital of France?\n(A) Berlin\n(B) Madrid\n(C) Paris\n(D) Rome\nAns: C\n\n2. Which planet is known as the Red Planet?\nA. Venus\nB. Mars\nC. Jupiter\nD. Saturn\nAnswer: B`}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-slate-200 placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isLoading || !pastedText.trim()}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Parse & Generate Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Pre-loaded Samples */}
          {activeTab === 'samples' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                Don't have a PDF ready? Pick one of our pre-configured quiz sets to test out the features immediately:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_DATASETS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                        {sample.questions.length} Questions
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-base group-hover:text-indigo-400 transition-colors">
                      {sample.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {sample.description}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Start with this quiz</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Feature highlights below upload card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center sm:text-left">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">Timed Exam Simulation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full-fledged CBT exam with countdown timer, question palette, flagging, and detailed score analysis.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">Active Revision Mode</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instant green/red verification, step-by-step solutions, and bookmarking for difficult questions.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm mb-1">Flashcard Recall</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Flip-card interface to rapidly test memory retention and key concepts before test day.
          </p>
        </div>
      </div>
    </div>
  );
}
