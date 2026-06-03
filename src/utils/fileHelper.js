import { segmentChineseText, isChinese } from './chineseUtils';

/**
 * Reads a text file object and returns a promise resolving to its text contents.
 * @param {File} file - File object from input
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Calculates learning metrics for a block of Chinese text.
 * Returns word count, character count, estimated reading time, and HSK level statistics.
 * 
 * @param {string} text - Chinese text content
 * @returns {object} - Analyzed statistics
 */
export function analyzeChineseText(text) {
  if (!text) {
    return {
      wordCount: 0,
      charCount: 0,
      readTimeMins: 0,
      hskDistribution: { hsk1: 0, hsk2: 0, hsk3: 0, unknown: 0 }
    };
  }

  // Count Chinese characters
  let charCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (isChinese(text[i])) {
      charCount++;
    }
  }

  // Segment text into tokens
  const tokens = segmentChineseText(text);
  const words = tokens.filter(t => t.isWord);
  const wordCount = words.length;

  // HSK distribution counts
  let hsk1Count = 0;
  let hsk2Count = 0;
  let hsk3Count = 0;
  let unknownCount = 0;

  words.forEach(w => {
    if (w.isFallback) {
      unknownCount++;
    } else if (w.hsk === 1) {
      hsk1Count++;
    } else if (w.hsk === 2) {
      hsk2Count++;
    } else if (w.hsk === 3) {
      hsk3Count++;
    } else {
      unknownCount++;
    }
  });

  const totalWords = wordCount || 1;
  const hskDistribution = {
    hsk1: Math.round((hsk1Count / totalWords) * 100),
    hsk2: Math.round((hsk2Count / totalWords) * 100),
    hsk3: Math.round((hsk3Count / totalWords) * 100),
    unknown: Math.round((unknownCount / totalWords) * 100)
  };

  // Average reading speed for Chinese language learners is around 100 characters per minute
  const readTimeMins = Math.max(1, Math.ceil(charCount / 100));

  return {
    wordCount,
    charCount,
    readTimeMins,
    hskDistribution
  };
}
