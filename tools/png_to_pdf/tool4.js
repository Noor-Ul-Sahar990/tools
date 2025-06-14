// Initialize AOS for animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// DOM Elements
const pngInput = document.getElementById('pngInput');
const filePicker = document.querySelector('.file-picker');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const imagePreview = document.getElementById('imagePreview');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let pngFile = null;
let convertedPdfUrl = null;

// Function to reset the tool
function resetTool() {
  pngFile = null;
  convertedPdfUrl = null;
  filePickerText.textContent = 'Drag & Drop your PNG here or click to upload';
  fileSizeText.textContent = '';
  fileSizeText.classList.add('d-none');
  imagePreview.classList.add('d-none');
  imagePreview.src = '';
  startButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  pngInput.value = '';
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
  if (files.length > 0 && files[0].type === 'image/png') {
    pngFile = files[0];
    filePickerText.textContent = `Selected File: ${pngFile.name}`;
    fileSizeText.textContent = `Size: ${(pngFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    // Show image preview
    imagePreview.src = URL.createObjectURL(pngFile);
    imagePreview.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please drop a valid PNG file!';
    fileSizeText.classList.add('d-none');
    imagePreview.classList.add('d-none');
    startButton.disabled = true;
  }
});

filePicker.addEventListener('click', () => {
  pngInput.click();
});

pngInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0 && files[0].type === 'image/png') {
    pngFile = files[0];
    filePickerText.textContent = `Selected File: ${pngFile.name}`;
    fileSizeText.textContent = `Size: ${(pngFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    // Show image preview
    imagePreview.src = URL.createObjectURL(pngFile);
    imagePreview.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please select a valid PNG file!';
    fileSizeText.classList.add('d-none');
    imagePreview.classList.add('d-none');
    startButton.disabled = true;
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Start Conversion
startButton.addEventListener('click', async () => {
  if (!pngFile) {
    filePickerText.textContent = 'No PNG file selected. Please upload a valid PNG.';
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
      convertPNGToPDF();
    }
  }, 500);
});

// Convert PNG to PDF with Autofill
async function convertPNGToPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size: 210mm x 297mm

    // Load the image
    const img = new Image();
    img.src = URL.createObjectURL(pngFile);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load PNG image.'));
    });

    // Autofill: Stretch image to fit entire A4 page (210mm x 297mm)
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Add image to PDF, stretching to fill the page
    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Generate PDF URL
    convertedPdfUrl = pdf.output('datauristring');
    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error converting PNG to PDF:', error);
    filePickerText.textContent = 'Error converting PNG. Please try again with a valid PNG.';
    fileSizeText.classList.add('d-none');
    imagePreview.classList.add('d-none');
    startButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Converted PDF
downloadButton.addEventListener('click', () => {
  if (convertedPdfUrl) {
    const link = document.createElement('a');
    link.href = convertedPdfUrl;
    link.download = 'converted_document.pdf';
    link.click();
    // Reset the tool after download
    resetTool();
  } else {
    filePickerText.textContent = 'No PDF available to download. Please convert again.';
  }
});