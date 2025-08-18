const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const caseButtons = document.querySelectorAll('.case-btn[data-case]');
const copyButton = document.getElementById('copyOutputButton');
const clearButton = document.getElementById('clearOutputButton');

// Case Conversion
caseButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const text = inputText.value;
    if (!text) return;

    let converted = '';
    switch(btn.dataset.case){
      case 'uppercase':
        converted = text.toUpperCase();
        break;
      case 'lowercase':
        converted = text.toLowerCase();
        break;
      case 'titlecase':
        converted = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        break;
    }
    outputText.value = converted;
  });
});

// Copy Output
copyButton.addEventListener('click', async () => {
  if (outputText.value.trim() !== '') {
    try {
      await navigator.clipboard.writeText(outputText.value);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
});

// Clear Output
clearButton.addEventListener('click', () => {
  outputText.value = '';
});