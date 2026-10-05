const QUIZ_STORAGE_KEY = 'mcqmaker_saved_quizzes';
const HISTORY_STORAGE_KEY = 'mcqmaker_test_history';

export function saveQuizToStorage(quiz) {
  try {
    const existing = getSavedQuizzes();
    const filtered = existing.filter(q => q.id !== quiz.id);
    const updated = [quiz, ...filtered].slice(0, 20); // Keep last 20
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save quiz to storage', err);
    return false;
  }
}

export function getSavedQuizzes() {
  try {
    const data = localStorage.getItem(QUIZ_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to get saved quizzes', err);
    return [];
  }
}

export function deleteQuizFromStorage(id) {
  try {
    const existing = getSavedQuizzes();
    const updated = existing.filter(q => q.id !== id);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete quiz', err);
    return [];
  }
}

export function saveTestResult(result) {
  try {
    const existing = getTestHistory();
    const updated = [result, ...existing].slice(0, 30);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save test result', err);
  }
}

export function getTestHistory() {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}
