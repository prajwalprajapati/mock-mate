/**
 * Smart Answer Key Parser:
 * Supports multiple formats:
 * 1. Numbered pairs: "1. A, 2. B, 3-C, 4: D" or "Q1: A, Q2: C"
 * 2. Sequential letters: "A B C D A C B D" or "A, B, C, D, A"
 * 3. Line by line: "1 A\n2 B\n3 C"
 * 4. Key-value style: "1=A, 2=B, 3=C"
 */
export function parseAnswerKeyInput(inputText, questionsCount = 50) {
  if (!inputText || typeof inputText !== 'string') return {};

  const clean = inputText.trim();
  const answerMap = {}; // { [originalNumber or index]: 'A' }

  // 1. Try matching explicit numbered pairs: "1. A", "1-A", "1:A", "1) A", "Q1 A", "1 = A"
  const pairRegex = /(?:Q(?:uestion|ue)?\.?\s*)?(\d{1,4})[\.\s\:\-\=\)\(\]]{1,3}([A-Da-d1-4])\b/g;
  let match;
  let hasNumberedMatches = false;

  while ((match = pairRegex.exec(clean)) !== null) {
    const qNum = parseInt(match[1], 10);
    const ans = normalizeKey(match[2]);
    if (qNum > 0 && ans) {
      answerMap[qNum] = ans;
      hasNumberedMatches = true;
    }
  }

  // 2. If numbered matches were found and cover questions, return
  if (hasNumberedMatches && Object.keys(answerMap).length >= 2) {
    return answerMap;
  }

  // 3. Fallback: Sequential raw letters (e.g. "A B C D A B C D" or "A, B, C, D, A" or "a b c d")
  const tokens = clean.split(/[\s,;\n\r\t]+/).map(t => t.trim().toUpperCase()).filter(Boolean);
  const letterTokens = tokens.filter(t => /^[A-D1-4]$/.test(t));

  if (letterTokens.length >= 2) {
    letterTokens.forEach((token, idx) => {
      const qNum = idx + 1;
      if (qNum <= questionsCount) {
        answerMap[qNum] = normalizeKey(token);
      }
    });
    return answerMap;
  }

  return answerMap;
}

function normalizeKey(char) {
  if (!char) return 'A';
  const c = char.toUpperCase().trim();
  if (c === '1') return 'A';
  if (c === '2') return 'B';
  if (c === '3') return 'C';
  if (c === '4') return 'D';
  if (['A', 'B', 'C', 'D', 'E', 'F'].includes(c)) return c;
  return 'A';
}