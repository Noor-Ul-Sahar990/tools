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
const qualitySelect = document.getElementById('qualitySelect');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let pdfFile = null;
let convertedImageUrl = null;

// Function to reset the tool
function resetTool() {
  pdfFile = null;
  convertedImageUrl = null;
  filePickerText.textContent = 'Drag & Drop your PDF here or click to upload';
  fileSizeText.textContent = '';
  fileSizeText.classList.add('d-none');
  qualitySelect.value = '1.0'; // Reset to medium quality
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
      convertPDFToPNG();
    }
  }, 500);
});

// Convert PDF to PNG
async function convertPDFToPNG() {
  try {
    const pdfData = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1); // Convert first page
    const scale = parseFloat(qualitySelect.value);
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    convertedImageUrl = canvas.toDataURL('image/png');
    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
    filePickerText.textContent = 'Error converting PDF. Please try again with a valid PDF.';
    fileSizeText.classList.add('d-none');
    startButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Converted PNG
downloadButton.addEventListener('click', () => {
  if (convertedImageUrl) {
    const link = document.createElement('a');
    link.href = convertedImageUrl;
    link.download = 'converted_image.png';
    link.click();
    // Reset the tool after download
    resetTool();
  } else {
    filePickerText.textContent = 'No PNG available to download. Please convert again.';
  }
});