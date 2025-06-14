// Initialize AOS for animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// DOM Elements
const docxInput = document.getElementById('docxInput');
const filePicker = document.querySelector('.file-picker');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const clearButton = document.getElementById('clearButton');
const startButton = document.getElementById('startButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let docxFile = null;
let convertedPdfBlob = null;

// Function to reset the tool
function resetTool() {
  docxFile = null;
  convertedPdfBlob = null;
  filePickerText.textContent = 'Drag & Drop your Word file here or click to upload';
  fileSizeText.textContent = '';
  fileSizeText.classList.add('d-none');
  startButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  docxInput.value = '';
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
  if (files.length > 0 && files[0].name.endsWith('.docx')) {
    docxFile = files[0];
    filePickerText.textContent = `Selected File: ${docxFile.name}`;
    fileSizeText.textContent = `Size: ${(docxFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please drop a valid Word (.docx) file!';
    fileSizeText.classList.add('d-none');
    startButton.disabled = true;
  }
});

filePicker.addEventListener('click', () => {
  docxInput.click();
});

docxInput.addEventListener('change', (e) => {
  const files = e.target.files;
  if (files.length > 0 && files[0].name.endsWith('.docx')) {
    docxFile = files[0];
    filePickerText.textContent = `Selected File: ${docxFile.name}`;
    fileSizeText.textContent = `Size: ${(docxFile.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove('d-none');
    startButton.disabled = false;
  } else {
    filePickerText.textContent = 'Please select a valid Word (.docx) file!';
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
  if (!docxFile) {
    filePickerText.textContent = 'No Word file selected. Please upload a valid DOCX.';
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
      convertWordToPDF();
    }
  }, 500);
});

// Convert Word to PDF
async function convertWordToPDF() {
  try {
    // Check if mammoth is loaded
    if (!mammoth) {
      throw new Error('mammoth.js library not loaded.');
    }

    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    const htmlContent = result.value;

    // Check if jsPDF and html2canvas are loaded
    if (!window.jspdf) {
      throw new Error('jsPDF library not loaded.');
    }
    if (!html2canvas) {
      throw new Error('html2canvas library not loaded.');
    }

    // Create a temporary container for rendering HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '10mm';
    tempContainer.innerHTML = htmlContent;
    document.body.appendChild(tempContainer);

    // Render HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 190; // A4 width minus margins (210mm - 10mm left - 10mm right)
    const pageHeight = 297; // A4 height in mm
    const topMargin = 20; // 20mm top margin as requested
    const bottomMargin = 20; // 20mm bottom margin as requested
    const usablePageHeight = pageHeight - topMargin - bottomMargin; // 297mm - 20mm - 20mm = 257mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Height of the image in mm
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 10, topMargin + position, imgWidth, imgHeight);
    heightLeft -= usablePageHeight;

    // Add additional pages if content exceeds one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, topMargin + position, imgWidth, imgHeight);
      heightLeft -= usablePageHeight;
    }

    // Generate PDF Blob
    convertedPdfBlob = pdf.output('blob');
    if (!convertedPdfBlob) {
      throw new Error('Failed to generate PDF blob.');
    }

    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    filePickerText.textContent = `Error: ${error.message || 'Failed to convert Word file. Please try again with a valid DOCX.'}`;
    fileSizeText.classList.add('d-none');
    startButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Converted PDF
downloadButton.addEventListener('click', () => {
  if (convertedPdfBlob) {
    try {
      // Fallback for older browsers (e.g., IE)
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(convertedPdfBlob, 'converted_document.pdf');
      } else {
        const url = window.URL.createObjectURL(convertedPdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted_document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      // Reset the tool after download
      resetTool();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      filePickerText.textContent = 'Error downloading PDF. Please try again.';
    }
  } else {
    filePickerText.textContent = 'No PDF available to download. Please convert again.';
  }
});