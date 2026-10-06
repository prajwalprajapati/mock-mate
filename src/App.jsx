import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FileUploader from './components/FileUploader';
import QuestionReview from './components/QuestionReview';
import TestConfigModal from './components/TestConfigModal';
import ExamMode from './components/ExamMode';
import PracticeMode from './components/PracticeMode';
import FlashcardMode from './components/FlashcardMode';
import TestSummary from './components/TestSummary';
import HistoryModal from './components/HistoryModal';
import { SAMPLE_DATASETS } from './utils/sampleData';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-red-500/30">
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-400 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Reset & Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('upload'); // 'upload' | 'review' | 'exam' | 'practice' | 'flashcards' | 'summary'
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [activeTestData, setActiveTestData] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. When questions are loaded from PDF, Paste, or Sample
  const handleQuestionsLoaded = (quizData) => {
    setCurrentQuiz(quizData);
    setCurrentScreen('review');
  };

  // 2. Start config modal
  const handleOpenConfig = (quizData) => {
    setCurrentQuiz(quizData);
    setIsConfigOpen(true);
  };

  // 3. Launch the selected test mode
  const handleLaunchTest = (config) => {
    setIsConfigOpen(false);
    setActiveTestData(config);
    if (config.mode === 'exam') {
      setCurrentScreen('exam');
    } else if (config.mode === 'practice') {
      setCurrentScreen('practice');
    } else if (config.mode === 'flashcards') {
      setCurrentScreen('flashcards');
    }
  };

  // 4. Test submission (from Exam or Practice)
  const handleSubmitTest = (result) => {
    setTestResult(result);
    setCurrentScreen('summary');
  };

  // 5. Retake test
  const handleRetake = () => {
    if (currentQuiz) {
      setIsConfigOpen(true);
    } else {
      setCurrentScreen('upload');
    }
  };

  // 6. Practice weak / incorrect questions
  const handlePracticeWeak = (weakQuestions) => {
    const weakQuiz = {
      title: `${currentQuiz?.title || 'Quiz'} - Weak Questions Review`,
      questions: weakQuestions,
      mode: 'practice'
    };
    setActiveTestData(weakQuiz);
    setCurrentScreen('practice');
  };

  // 7. Reset to Upload screen
  const handleReset = () => {
    setCurrentScreen('upload');
    setCurrentQuiz(null);
    setActiveTestData(null);
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Show Navbar on non-exam screens */}
      {currentScreen !== 'exam' && currentScreen !== 'practice' && currentScreen !== 'flashcards' && (
        <Navbar
          onReset={handleReset}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onSelectSample={() => handleQuestionsLoaded(SAMPLE_DATASETS[0])}
        />
      )}

      {/* Main Screen Router */}
      <main className="flex-1">
        {currentScreen === 'upload' && (
          <FileUploader onQuestionsLoaded={handleQuestionsLoaded} />
        )}

        {currentScreen === 'review' && currentQuiz && (
          <QuestionReview
            quizData={currentQuiz}
            onStartTest={handleOpenConfig}
            onBack={() => setCurrentScreen('upload')}
          />
        )}

        {currentScreen === 'exam' && activeTestData && (
          <ExamMode
            testData={activeTestData}
            onSubmitTest={handleSubmitTest}
            onExit={handleReset}
          />
        )}

        {currentScreen === 'practice' && activeTestData && (
          <PracticeMode
            testData={activeTestData}
            onSubmitTest={handleSubmitTest}
            onExit={handleReset}
          />
        )}

        {currentScreen === 'flashcards' && activeTestData && (
          <FlashcardMode
            testData={activeTestData}
            onExit={handleReset}
            onFinish={() => setCurrentScreen('review')}
          />
        )}

        {currentScreen === 'summary' && testResult && (
          <TestSummary
            resultData={testResult}
            onRetake={handleRetake}
            onPracticeWeak={handlePracticeWeak}
            onNewTest={handleReset}
          />
        )}
      </main>

      {/* Modals */}
      {isConfigOpen && currentQuiz && (
        <TestConfigModal
          quizData={currentQuiz}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onLaunchTest={handleLaunchTest}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectQuiz={(quiz) => {
            setCurrentQuiz(quiz);
            setCurrentScreen('review');
          }}
        />
      )}

      {/* Footer on public pages */}
      {currentScreen !== 'exam' && currentScreen !== 'practice' && currentScreen !== 'flashcards' && (
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>Built with React, Vite & PDF.js • 100% Client-Side Private</p>
            <p>CREATED BY PRAJWAL</p>
            <p>
              Hosted on <a href="https://github.com/prajwalprajapati/mock-mate" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">GitHub</a>
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}