/**
 * Dynamic loader for PDF.js to prevent any bundler crashes or top-level worker failure.
 */
async function loadPdfJs() {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    return window.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('pdfjs-cdn-script');
    if (existing) {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      existing.addEventListener('load', () => resolve(window.pdfjsLib));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = 'pdfjs-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to initialize from CDN'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF library script.'));
    document.head.appendChild(script);
  });
}

/**
 * Extract raw text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(file, onProgress) {
  const pdfjsLib = await loadPdfJs();
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
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 6) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    let lastY;
    let pageString = '';
    
    for (const item of items) {
      if (lastY === undefined || Math.abs(item.transform[5] - lastY) > 6) {
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
 * Enhanced MCQ Parser that handles table columns, isolated numbers, code snippets, and page breaks.
 */
export function parseMCQText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Extract answer key map if present at the end
  let answerKeyMap = {};
  const answerKeyMatch = text.match(/(?:(?:ANSWER\s*KEY|ANSWERS|KEYS?|SOLUTIONS?)[\s\S]*$)/i);
  if (answerKeyMatch) {
    const keySection = answerKeyMatch[0];
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

  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Filter document title / header lines
  const lines = rawLines.filter(l => {
    if (/^MCQ\s+Practice\s+sheet$/i.test(l)) return false;
    if (/^Page\s+\d+(\s+of\s+\d+)?$/i.test(l)) return false;
    return true;
  });

  const questions = [];
  let currentQ = null;
  let qCounter = 0;

  // Patterns
  const isolatedNumRegex = /^(\d{1,4})$/;
  const standardQRegex = /^(?:Q(?:uestion|ue)?\.?\s*)?(\d{1,4})(?:[\.\:\)\-]\s*|\s+)([A-Za-z<#{\s].*)$/i;
  const optionRegex = /^(?:[a-dA-D1-4][\.\)]\s*)?[\(\[]?([A-Da-d1-4])[\)\]\.\:\-]\s*(.*)$/;
  const inlineAnsRegex = /(?:Ans(?:wer)?|Correct(?:\s*Option)?|Key)[\:\s\-\=\[\(]+([A-Da-d1-4])[\\)\\]]?/i;
  const expRegex = /^(?:Explanation|Solution|Expln|Note)[\:\-\s]+(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for inline answer
    const ansMatch = line.match(inlineAnsRegex);
    if (ansMatch && currentQ) {
      currentQ.correctAnswer = normalizeOptionChar(ansMatch[1]);
      continue;
    }

    // Check for explanation
    const expMatch = line.match(expRegex);
    if (expMatch && currentQ) {
      currentQ.explanation = expMatch[1];
      continue;
    }

    // Check for isolated question number (from 2-column table grid cell)
    const isoMatch = line.match(isolatedNumRegex);
    if (isoMatch) {
      const qNum = parseInt(isoMatch[1], 10);
      if (qNum > 0 && qNum <= 500) {
        if (currentQ && currentQ.options.length >= 2) {
          finalizeQuestion(currentQ, answerKeyMap);
          questions.push(currentQ);
        }
        qCounter++;
        currentQ = {
          id: 'q_' + qCounter + '_' + Date.now(),
          originalNumber: qNum,
          question: '',
          options: [],
          correctAnswer: '',
          explanation: '',
          needsAnswerReview: true,
        };
        continue;
      }
    }

    // Check for option line (A), B., a., etc.
    const optMatch = line.match(optionRegex);
    const isOptionLine = optMatch && (
      (currentQ && currentQ.options.length > 0) || 
      /^[A-Da-d1-4][\.\)]\s*/.test(line) ||
      /^[A-Da-d1-4]\)\s*/.test(line) ||
      /^[A-Da-d1-4]\.\s*/.test(line) ||
      /^\([A-Da-d1-4]\)/.test(line)
    );

    if (isOptionLine && currentQ) {
      const optKey = normalizeOptionChar(optMatch[1]);
      let optText = optMatch[2].trim();

      const optAns = optText.match(inlineAnsRegex);
      if (optAns) {
        optText = optText.replace(inlineAnsRegex, '').trim();
        currentQ.correctAnswer = normalizeOptionChar(optAns[1]);
      }

      currentQ.options.push({
        key: optKey,
        text: optText || `Option ${optKey}`,
      });
      continue;
    }

    // Check for numbered question: "1 Design a...", "2 Determine the...", "10 Consider an..."
    const stdQMatch = line.match(standardQRegex);
    if (stdQMatch && !isOptionLine) {
      if (currentQ && currentQ.options.length >= 2) {
        finalizeQuestion(currentQ, answerKeyMap);
        questions.push(currentQ);
      }
      
      qCounter++;
      const numFromText = parseInt(stdQMatch[1], 10);
      currentQ = {
        id: 'q_' + qCounter + '_' + Date.now(),
        originalNumber: !isNaN(numFromText) ? numFromText : qCounter,
        question: stdQMatch[2] || '',
        options: [],
        correctAnswer: '',
        explanation: '',
        needsAnswerReview: true,
      };
      continue;
    }

    // Check for unnumbered question following a completed question
    if (currentQ && currentQ.options.length >= 2 && !isOptionLine) {
      const upcomingLines = lines.slice(i + 1, i + 8);
      const hasUpcomingOptions = upcomingLines.some(nextL => /^[A-Da-d1-4][\)\.]\s*/.test(nextL));
      
      if (hasUpcomingOptions && (line.length > 15 || line.includes('struct') || line.includes('C++') || line.includes('Which') || line.includes('Determine') || line.includes('Create'))) {
        finalizeQuestion(currentQ, answerKeyMap);
        questions.push(currentQ);

        qCounter++;
        currentQ = {
          id: 'q_' + qCounter + '_' + Date.now(),
          originalNumber: qCounter,
          question: line,
          options: [],
          correctAnswer: '',
          explanation: '',
          needsAnswerReview: true,
        };
        continue;
      }
    }

    // Append to question text (including C++ code blocks) or option text
    if (currentQ) {
      if (currentQ.options.length === 0) {
        currentQ.question += (currentQ.question ? '\n' : '') + line;
      } else {
        const lastOpt = currentQ.options[currentQ.options.length - 1];
        lastOpt.text += ' ' + line;
      }
    }
  }

  // Push final question
  if (currentQ && currentQ.options.length >= 2) {
    finalizeQuestion(currentQ, answerKeyMap);
    questions.push(currentQ);
  }

  return cleanQuestions(questions);
}

function finalizeQuestion(q, answerKeyMap) {
  const standardKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
  q.options = q.options.map((opt, idx) => ({
    key: standardKeys[idx] || opt.key || String.fromCharCode(65 + idx),
    text: opt.text.trim()
  }));

  if (!q.correctAnswer && answerKeyMap[q.originalNumber]) {
    q.correctAnswer = answerKeyMap[q.originalNumber];
    q.needsAnswerReview = false;
  }

  if (!q.correctAnswer && q.options.length > 0) {
    q.correctAnswer = 'A'; // default placeholder
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