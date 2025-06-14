// Initialize AOS for animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// DOM Elements
const jpgInput = document.getElementById('jpgInput');
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

let jpgFile = null;
let convertedPdfUrl = null;

// Function to reset the tool
function resetTool() {
  jpgFile = null;
  convertedPdfUrl = null;
  filePickerText.textContent = 'Drag & Drop your JPG here or click to upload';
  fileSizeText.textContent = '';
  fileSizeText.classList.add('d-none');
  imagePreview.classList.add('d-none');
  imagePreview.src = '';
  startButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  jpgInput.value = '';
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
  if (files.length > 0 && (files[0].type === 'image/jpeg' || files[0].type === 'image/jpg')) {
    jpgFile = files[0];
    filePickerText.textContent = `Selected File: ${jpgFile.name}`;
    fileSizeText.textContent = `Size: ${(jpgFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    // Show image preview
    imagePreview.src = URL.createObjectURL(jpgFile);
    imagePreview.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please drop a valid JPG file!';
    fileSizeText.classList.add('d-none');
    imagePreview.classList.add('d-none');
  }
});

filePicker.addEventListener('click', () => {
  jpgInput.click();
});

jpgInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0 && (files[0].type === 'image/jpeg' || files[0].type === 'image/jpg')) {
    jpgFile = files[0];
    filePickerText.textContent = `Selected File: ${jpgFile.name}`;
    fileSizeText.textContent = `Size: ${(jpgFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    // Show image preview
    imagePreview.src = URL.createObjectURL(jpgFile);
    imagePreview.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please select a valid JPG file!';
    fileSizeText.classList.add('d-none');
    imagePreview.classList.add('d-none');
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Start Conversion
startButton.addEventListener('click', async () => {
  if (!jpgFile) return;

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
      convertJPGToPDF();
    }
  }, 500);
});

// Convert JPG to PDF
async function convertJPGToPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Load the image
    const img = new Image();
    img.src = URL.createObjectURL(jpgFile);
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Calculate dimensions to fit on A4 page
    const imgWidth = img.width;
    const imgHeight = img.height;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    // Add image to PDF
    pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Generate PDF URL
    convertedPdfUrl = pdf.output('datauristring');
    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error converting JPG to PDF:', error);
    filePickerText.textContent = 'Error converting JPG. Please try again with a valid JPG.';
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
  }
});