// DOM
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

const countButton = document.getElementById('countButton');
const clearAllButton = document.getElementById('clearAllButton');

const copyOutputButton = document.getElementById('copyOutputButton');
const clearOutputButton = document.getElementById('clearOutputButton');

const wordsCount = document.getElementById('wordsCount');
const charsCount = document.getElementById('charsCount');
const sentencesCount = document.getElementById('sentencesCount');

// Helpers
function countWords(text) {
  // Split on any whitespace; filter empty
  const words = text.trim().split(/\s+/).filter(Boolean);
  return text.trim().length ? words.length : 0;
}

function countChars(text) {
  // Characters including spaces and punctuation
  return text.length;
}

function countSentences(text) {
  // Split by ., !, ? (handles multiple punctuation). Filters empty segments.
  const sentences = text
    .replace(/(\r\n|\n|\r)/g, ' ')
    .split(/[.!?]+/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return sentences.length;
}

function buildSummary(w, c, s) {
  return `Words: ${w}\nCharacters: ${c}\nSentences: ${s}`;
}

// Actions
function doCount() {
  const text = inputText.value || '';
  const w = countWords(text);
  const c = countChars(text);
  const s = countSentences(text);

  wordsCount.textContent = w;
  charsCount.textContent = c;
  sentencesCount.textContent = s;

  outputText.value = buildSummary(w, c, s);
}

// Events
countButton.addEventListener('click', doCount);

clearAllButton.addEventListener('click', () => {
  inputText.value = '';
  wordsCount.textContent = '0';
  charsCount.textContent = '0';
  sentencesCount.textContent = '0';
  outputText.value = '';
});

clearOutputButton.addEventListener('click', () => {
  outputText.value = '';
});

copyOutputButton.addEventListener('click', async () => {
  try {
    if (outputText.value.trim() !== '') {
      // Clipboard API (requires HTTPS or localhost)
      await navigator.clipboard.writeText(outputText.value);
      alert('Copied to clipboard!');
    }
  } catch (err) {
    console.error('Copy failed:', err);
  }
});
