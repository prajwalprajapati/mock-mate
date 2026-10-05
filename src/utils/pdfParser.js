import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use CDN for reliable client-side execution on any static host
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extract raw text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(pageNum, numPages);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Sort items vertically then horizontally to maintain natural reading order
    const items = textContent.items.filter(item => item.str && item.str.trim().length > 0);
    
    let lastY;
    let pageString = '';
    
    for (const item of items) {
      if (lastY === undefined || Math.abs(item.transform[5] - lastY) > 5) {
        pageString += '\n';
        lastY = item.transform[5];
      } else {
        pageString += ' ';
      }
      pageString += item.str;
    }
    
    fullText += pageString + '\n\n';
  }
  
  return fullText;
}

/**
 * Parses raw text extracted from PDF or pasted by user into structured MCQ objects
 */
export function parseMCQText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Normalize line endings and whitespace
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Look for end-of-document answer key section (e.g. "Answer Key", "Answers:", "Key:")
  let answerKeyMap = {};
  const answerKeyMatch = text.match(/(?:(?:ANSWER\s*KEY|ANSWERS|KEYS?|SOLUTIONS?)[\s\S]*$)/i);
  if (answerKeyMatch) {
    const keySection = answerKeyMatch[0];
    // Match pairs like "1. A", "1-B", "1(C)", "1 : D", "1. (b)", "Q1: A"
    const pairRegex = /(?:Q\.?\s*)?(\d+)[\.\s\:\-\)\(\]]*([A-Da-d1-4])\b/g;
    let pair;
    while ((pair = pairRegex.exec(keySection)) !== null) {
      const qNum = parseInt(pair[1], 10);
      const ansChar = normalizeOptionChar(pair[2]);
      if (qNum && ansChar) {
        answerKeyMap[qNum] = ansChar;
      }
    }
  }

  // Split lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = [];
  let currentQ = null;
  let qCounter = 0;

  // Question starter regex: e.g., "1.", "1)", "Q1.", "Q.1", "Question 1:", "1 - "
  const questionRegex = /^(?:Q(?:uestion|ue)?\.?\s*)?(\d{1,4})[\.\:\)\-]\s*(.*)$/i;
  
  // Option starter regex: e.g., "(A)", "[A]", "A.", "A)", "a.", "a)", "1.", "1)"
  const optionRegex = /^(?:[\(\[]?([A-Da-d1-4])[\)\]\.\:\-]\s*)(.*)$/;
  
  // Inline answer regex: e.g., "Ans: A", "Answer: B", "Correct: (C)", "[Ans: D]"
  const inlineAnsRegex = /(?:Ans(?:wer)?|Correct(?:\s*Option)?|Key)[\:\s\-\=\[\(]+([A-Da-d1-4])[\)\]]?/i;
  
  // Explanation regex: e.g., "Explanation: ...", "Solution: ..."
  const expRegex = /^(?:Explanation|Solution|Expln|Note)[\:\-\s]+(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for inline answer
    const ansMatch = line.match(inlineAnsRegex);
    if (ansMatch && currentQ) {
      currentQ.correctAnswer = normalizeOptionChar(ansMatch[1]);
      // Remove answer line from question text or option if it was attached
      continue;
    }

    // Check for explanation
    const expMatch = line.match(expRegex);
    if (expMatch && currentQ) {
      currentQ.explanation = expMatch[1];
      continue;
    }

    // Check for new question
    const qMatch = line.match(questionRegex);
    // Extra validation: line shouldn't look like an option (e.g. "1. Option A" could be option if within a Q)
    const isOptionFormat = line.match(/^[\(\[]?[A-Da-d][\)\]\.]/);
    
    if (qMatch && !isOptionFormat) {
      // If we already had a question with options, save it
      if (currentQ && currentQ.options.length >= 2) {
        finalizeQuestion(currentQ, answerKeyMap);
        questions.push(currentQ);
      }
      
      qCounter++;
      const numFromText = parseInt(qMatch[1], 10);
      
      currentQ = {
        id: 'q_' + qCounter + '_' + Date.now(),
        originalNumber: !isNaN(numFromText) ? numFromText : qCounter,
        question: qMatch[2] || '',
        options: [],
        correctAnswer: '',
        explanation: '',
        userAnswer: null,
      };
      continue;
    }

    // Check for option inside current question
    const optMatch = line.match(optionRegex);
    if (optMatch && currentQ) {
      const optKey = normalizeOptionChar(optMatch[1]);
      const optText = optMatch[2].trim();
      
      // Check if this option line also contains inline answer
      const optAns = optText.match(inlineAnsRegex);
      let cleanOptText = optText;
      if (optAns) {
        cleanOptText = optText.replace(inlineAnsRegex, '').trim();
        currentQ.correctAnswer = normalizeOptionChar(optAns[1]);
      }

      currentQ.options.push({
        key: optKey,
        text: cleanOptText || `Option ${optKey}`,
      });
      continue;
    }

    // Also handle inline multiple options in a single line (e.g. "(A) Apple (B) Banana (C) Cherry (D) Date")
    if (currentQ && (line.includes('(A)') || line.includes('(a)') || line.includes('A)') || line.includes('A.'))) {
      const multiOptRegex = /[\(\[]?([A-Da-d1-4])[\)\]\.\:]\s*([^\(\[A-Da-d1-4\n]+)/g;
      let m;
      let matchedAny = false;
      const tempOpts = [];
      while ((m = multiOptRegex.exec(line)) !== null) {
        matchedAny = true;
        tempOpts.push({
          key: normalizeOptionChar(m[1]),
          text: m[2].trim(),
        });
      }
      if (matchedAny && tempOpts.length >= 2) {
        currentQ.options.push(...tempOpts);
        continue;
      }
    }

    // If continuation of current question text or explanation
    if (currentQ) {
      if (currentQ.options.length === 0) {
        currentQ.question += (currentQ.question ? ' ' : '') + line;
      } else {
        // Continuation of last option
        const lastOpt = currentQ.options[currentQ.options.length - 1];
        lastOpt.text += ' ' + line;
      }
    }
  }

  // Push last question
  if (currentQ && currentQ.options.length >= 2) {
    finalizeQuestion(currentQ, answerKeyMap);
    questions.push(currentQ);
  }

  // If questions are still empty, try flexible block-by-block heuristic fallback
  if (questions.length === 0) {
    return parseFallbackBlocks(text);
  }

  return cleanQuestions(questions);
}

function finalizeQuestion(q, answerKeyMap) {
  // Ensure options have clean standard keys (A, B, C, D)
  const standardKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  q.options = q.options.map((opt, idx) => ({
    key: standardKeys[idx] || opt.key || String.fromCharCode(65 + idx),
    text: opt.text.trim()
  }));

  // Check if answer was in answerKeyMap
  if (!q.correctAnswer && answerKeyMap[q.originalNumber]) {
    q.correctAnswer = answerKeyMap[q.originalNumber];
  }

  // Default to 'A' if undetected so the mock test can still run seamlessly
  if (!q.correctAnswer && q.options.length > 0) {
    q.correctAnswer = 'A';
    q.needsAnswerReview = true;
  }
}

function normalizeOptionChar(char) {
  if (!char) return 'A';
  const c = char.toUpperCase().trim();
  if (c === '1') return 'A';
  if (c === '2') return 'B';
  if (c === '3') return 'C';
  if (c === '4') return 'D';
  if (['A', 'B', 'C', 'D', 'E', 'F'].includes(c)) return c;
  return 'A';
}

function cleanQuestions(questions) {
  return questions.map((q, idx) => ({
    ...q,
    id: q.id || `q_${idx + 1}_${Date.now()}`,
    index: idx + 1,
    question: q.question.trim(),
    options: q.options.filter(o => o.text && o.text.trim().length > 0),
    correctAnswer: q.correctAnswer || 'A',
  })).filter(q => q.question.length > 0 && q.options.length >= 2);
}

function parseFallbackBlocks(text) {
  const blocks = text.split(/\n\s*\n+/).filter(b => b.trim().length > 10);
  const questions = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length >= 3) {
      const qText = lines[0].replace(/^(?:\d+[\.\)]|Q\.?\s*\d+[\.\:]?)\s*/i, '');
      const optLines = lines.slice(1);
      const options = [];
      
      optLines.forEach((optLine, oIdx) => {
        const key = ['A', 'B', 'C', 'D', 'E'][oIdx] || 'A';
        const cleanOpt = optLine.replace(/^[\(\[]?[A-Da-d1-4][\)\]\.\:\-]\s*/, '');
        options.push({
          key,
          text: cleanOpt || optLine,
        });
      });

      if (options.length >= 2) {
        questions.push({
          id: `fallback_${idx + 1}_${Date.now()}`,
          index: idx + 1,
          originalNumber: idx + 1,
          question: qText,
          options,
          correctAnswer: 'A',
          explanation: '',
          needsAnswerReview: true,
        });
      }
    }
  });

  return questions;
}
