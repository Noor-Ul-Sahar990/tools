// Initialize AOS for animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// DOM Elements
const pdfInput = document.getElementById('pdfInput');
const filePicker = document.querySelector('.file-picker');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let pdfFile = null;
let convertedDocxBlob = null;

// Function to reset the tool
function resetTool() {
  pdfFile = null;
  convertedDocxBlob = null;
  filePickerText.textContent = 'Drag & Drop your PDF here or click to upload';
  fileSizeText.textContent = '';
  fileSizeText.classList.add('d-none');
  startButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  pdfInput.value = '';
  filePicker.classList.remove('dragover');
}

// File Picker - Drag and Drop
filePicker.addEventListener('dragover', (e) => {
  e.preventDefault();
  filePicker.classList.add('dragover');
});

filePicker.addEventListener('dragleave', (e) => {
  e.preventDefault();
  filePicker.classList.remove('dragover');
});

filePicker.addEventListener('drop', (e) => {
  e.preventDefault();
  filePicker.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type === 'application/pdf') {
    pdfFile = files[0];
    filePickerText.textContent = `Selected File: ${pdfFile.name}`;
    fileSizeText.textContent = `Size: ${(pdfFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please drop a valid PDF file!';
    fileSizeText.classList.add('d-none');
    startButton.disabled = true;
  }
});

filePicker.addEventListener('click', () => {
  pdfInput.click();
});

pdfInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0 && files[0].type === 'application/pdf') {
    pdfFile = files[0];
    filePickerText.textContent = `Selected File: ${pdfFile.name}`;
    fileSizeText.textContent = `Size: ${(pdfFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please select a valid PDF file!';
    fileSizeText.classList.add('d-none');
    startButton.disabled = true;
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Start Conversion
startButton.addEventListener('click', async () => {
  if (!pdfFile) {
    filePickerText.textContent = 'No PDF file selected. Please upload a valid PDF.';
    return;
  }

  // Disable start button and show loading bar
  startButton.disabled = true;
  loadingBar.classList.remove('d-none');
  downloadButton.disabled = true;

  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      convertPDFToWord();
    }
  }, 500);
});

// Convert PDF to Word
async function convertPDFToWord() {
  try {
    // Check if pdfjsLib is loaded
    if (!pdfjsLib) {
      throw new Error('pdf.js library not loaded.');
    }

    const pdfData = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    // Check if docx is loaded
    if (!docx) {
      throw new Error('docx.js library not loaded.');
    }

    // Create a new DOCX document
    const { Document, Packer, Paragraph, TextRun } = docx;
    const doc = new Document({
      sections: [{
        properties: {},
        children: fullText.split('\n').map(line => {
          return new Paragraph({
            children: [new TextRun(line)],
          });
        }),
      }],
    });

    // Generate DOCX file
    convertedDocxBlob = await Packer.toBlob(doc);
    if (!convertedDocxBlob) {
      throw new Error('Failed to generate DOCX blob.');
    }

    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error converting PDF to Word:', error);
    filePickerText.textContent = `Error: ${error.message || 'Failed to convert PDF. Please try again with a valid PDF.'}`;
    fileSizeText.classList.add('d-none');
    startButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Converted Word Document
downloadButton.addEventListener('click', () => {
  if (convertedDocxBlob) {
    try {
      // Create a URL for the Blob and trigger download
      const url = window.URL.createObjectURL(convertedDocxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_document.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      // Reset the tool after download
      resetTool();
    } catch (error) {
      console.error('Error downloading Word document:', error);
      filePickerText.textContent = 'Error downloading Word document. Please try again.';
    }
  } else {
    filePickerText.textContent = 'No Word document available to download. Please convert again.';
  }
});