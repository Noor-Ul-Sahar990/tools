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
const fileList = document.getElementById('fileList');
const clearButton = document.getElementById('clearButton');
const mergeButton = document.getElementById('mergeButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let pdfFiles = [];
let mergedPdfBlob = null;

// Function to dynamically load scripts
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

// Load all required libraries
async function loadLibraries() {
  try {
    console.log('Loading libraries...');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    console.log('All libraries loaded successfully.');
  } catch (error) {
    console.error('Error loading libraries:', error);
    filePickerText.textContent = 'Error loading required libraries. Please refresh the page and try again.';
    throw error;
  }
}

// Function to reset the tool
function resetTool() {
  pdfFiles = [];
  mergedPdfBlob = null;
  filePickerText.textContent = 'Drag & Drop your PDF files here or click to upload (Multiple files allowed)';
  fileList.classList.add('d-none');
  fileList.innerHTML = '';
  mergeButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  pdfInput.value = '';
  filePicker.classList.remove('dragover');
}

// Function to update file list UI
function updateFileList() {
  fileList.innerHTML = '';
  if (pdfFiles.length > 0) {
    fileList.classList.remove('d-none');
    pdfFiles.forEach((file, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item';
      listItem.innerHTML = `
        ${file.name} (${(file.size / 1024).toFixed(2)} KB)
        <button class="remove-file-btn" data-index="${index}">Remove</button>
      `;
      fileList.appendChild(listItem);
    });
    // Enable merge button if at least 2 files are selected
    mergeButton.disabled = pdfFiles.length < 2;
  } else {
    fileList.classList.add('d-none');
    mergeButton.disabled = true;
  }

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-file-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      pdfFiles.splice(index, 1);
      updateFileList();
    });
  });
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
  const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
  if (files.length > 0) {
    pdfFiles = pdfFiles.concat(files);
    filePickerText.textContent = `${pdfFiles.length} PDF file(s) selected`;
    updateFileList();
  } else {
    filePickerText.textContent = 'Please drop valid PDF files!';
  }
});

filePicker.addEventListener('click', () => {
  pdfInput.click();
});

pdfInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
  if (files.length > 0) {
    pdfFiles = pdfFiles.concat(files);
    filePickerText.textContent = `${pdfFiles.length} PDF file(s) selected`;
    updateFileList();
  } else {
    filePickerText.textContent = 'Please select valid PDF files!';
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Merge PDFs
mergeButton.addEventListener('click', async () => {
  if (pdfFiles.length < 2) {
    filePickerText.textContent = 'Please upload at least 2 PDF files to merge.';
    return;
  }

  // Disable merge button and show loading bar
  mergeButton.disabled = true;
  loadingBar.classList.remove('d-none');
  downloadButton.disabled = true;

  // Load libraries before proceeding
  try {
    await loadLibraries();
  } catch (error) {
    mergeButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    return;
  }

  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      mergePDFs();
    }
  }, 500);
});

// Function to merge PDFs
async function mergePDFs() {
  try {
    // Check if libraries are loaded (redundant check, but safe)
    if (!PDFLib || !pdfjsLib || !html2canvas || !window.jspdf) {
      throw new Error('Required libraries (PDFLib, pdfjsLib, html2canvas, or jsPDF) not loaded.');
    }

    console.log('Starting PDF merge process...');
    const mergedPdf = await PDFLib.PDFDocument.create();

    // Loop through each PDF file and append its pages
    for (const pdfFile of pdfFiles) {
      console.log(`Processing file: ${pdfFile.name}`);
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Save the merged PDF as a temporary Blob
    console.log('Saving temporary merged PDF...');
    const mergedPdfBytes = await mergedPdf.save();
    const mergedPdfBlobTemp = new Blob([mergedPdfBytes], { type: 'application/pdf' });

    // Configure pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    const pdfDataUri = URL.createObjectURL(mergedPdfBlobTemp);
    const pdfDoc = await pdfjsLib.getDocument(pdfDataUri).promise;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const topMargin = 20; // 20mm top margin
    const bottomMargin = 20; // 20mm bottom margin
    const leftMargin = 10; // 10mm left margin
    const rightMargin = 10; // 10mm right margin
    const pageHeight = 297; // A4 height in mm
    const pageWidth = 210; // A4 width in mm
    const usablePageHeight = pageHeight - topMargin - bottomMargin; // 257mm
    const usablePageWidth = pageWidth - leftMargin - rightMargin; // 190mm

    // Render each page with margins
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      console.log(`Rendering page ${pageNum}...`);
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      // Calculate aspect ratio and scaling
      const originalWidth = viewport.width;
      const originalHeight = viewport.height;
      const aspectRatio = originalWidth / originalHeight;

      let scaledWidth = usablePageWidth;
      let scaledHeight = scaledWidth / aspectRatio;

      // If the scaled height exceeds the usable height, adjust the scaling
      if (scaledHeight > usablePageHeight) {
        scaledHeight = usablePageHeight;
        scaledWidth = scaledHeight * aspectRatio;
      }

      // Calculate position to center the content
      const xPosition = leftMargin + (usablePageWidth - scaledWidth) / 2; // Center horizontally
      const yPosition = topMargin + (usablePageHeight - scaledHeight) / 2; // Center vertically

      // Create a canvas to render the PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imgData = canvas.toDataURL('image/png');

      if (pageNum > 1) {
        pdf.addPage();
      }

      // Add the page with margins and centered
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, scaledWidth, scaledHeight);
    }

    URL.revokeObjectURL(pdfDataUri);

    // Generate final PDF Blob with margins
    console.log('Generating final PDF with margins...');
    mergedPdfBlob = pdf.output('blob');
    if (!mergedPdfBlob) {
      throw new Error('Failed to generate merged PDF blob.');
    }

    console.log('Merged PDF Blob generated successfully:', mergedPdfBlob);
    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error merging PDFs:', error);
    filePickerText.textContent = `Error: ${error.message || 'Failed to merge PDFs. Please try again with valid PDFs.'}`;
    mergeButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Merged PDF
downloadButton.addEventListener('click', () => {
  if (mergedPdfBlob) {
    try {
      console.log('Initiating download...');
      // Fallback for older browsers (e.g., IE)
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(mergedPdfBlob, 'merged_document.pdf');
      } else {
        const url = window.URL.createObjectURL(mergedPdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged_document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      console.log('Download completed successfully.');
      // Reset the tool after download
      resetTool();
    } catch (error) {
      console.error('Error downloading merged PDF:', error);
      filePickerText.textContent = 'Error downloading merged PDF. Please try again.';
    }
  } else {
    filePickerText.textContent = 'No merged PDF available to download. Please merge again.';
  }
});