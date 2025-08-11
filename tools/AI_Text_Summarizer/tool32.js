  AOS.init();

    const inputTextarea = document.getElementById('inputText');
    const summaryOutput = document.getElementById('summaryOutput');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtnInput = document.getElementById('clearBtnInput');
    const clearBtnOutput = document.getElementById('clearBtnOutput');
    const copyBtn = document.getElementById('copyBtn');

    function toggleCopyButton() {
      if (summaryOutput.value.trim() !== '') {
        copyBtn.style.display = 'flex';
        copyBtn.disabled = false;
      } else {
        copyBtn.style.display = 'none';
        copyBtn.disabled = true;
      }
    }

    function summarizeText(text) {
      if (!text.trim()) return '';

      // Simple sentence splitting for demo
      const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
      const summarySentences = sentences.slice(0, 3);

      return summarySentences.join(' ').trim();
    }

    generateBtn.addEventListener('click', () => {
      const text = inputTextarea.value.trim();
      if (text === '') {
        summaryOutput.value = '';
        toggleCopyButton();
        alert('Please enter some text to summarize.');
        return;
      }

      summaryOutput.value = 'Summarizing...';

      setTimeout(() => {
        const summary = summarizeText(text);
        summaryOutput.value = summary;
        toggleCopyButton();
      }, 500);
    });

    clearBtnInput.addEventListener('click', () => {
      inputTextarea.value = '';
      toggleCopyButton();
    });

    clearBtnOutput.addEventListener('click', () => {
      summaryOutput.value = '';
      toggleCopyButton();
    });

    copyBtn.addEventListener('click', () => {
      if (summaryOutput.value.trim() === '') return;
      navigator.clipboard.writeText(summaryOutput.value).then(() => {
        copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="bi bi-copy"></i>';
        }, 2000);
      });
    });

    // Initialize copy button visibility on load
    toggleCopyButton();