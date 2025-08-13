// Make sure to include pdf-lib via CDN in your HTML head or before this script:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>

const pdfInput = document.getElementById('pdfInput');
const filePicker = document.getElementById('filePicker');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const rotateSelect = document.getElementById('rotateSelect');
const rotateBtn = document.getElementById('rotateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadLink = document.getElementById('downloadLink');
const downloadMessage = document.getElementById('downloadMessage');

let pdfBytes = null;

function resetUI() {
  filePickerText.textContent = 'Drag & Drop your PDF here or click to upload';
  fileSizeText.classList.add('d-none');
  fileSizeText.textContent = '';
  rotateBtn.disabled = true;
  clearBtn.disabled = true;
  downloadLink.classList.add('d-none');
  downloadMessage.classList.add('d-none');
  pdfBytes = null;
  pdfInput.value = '';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Click on filePicker triggers hidden file input
filePicker.addEventListener('click', () => pdfInput.click());

// Drag & drop styling and events
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
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// File input change event
pdfInput.addEventListener('change', () => {
  if (pdfInput.files.length > 0) {
    handleFile(pdfInput.files[0]);
  }
});

function handleFile(file) {
  if (file.type !== 'application/pdf') {
    alert('Please upload a valid PDF file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    pdfBytes = new Uint8Array(e.target.result);
    filePickerText.textContent = `Selected: ${file.name}`;
    fileSizeText.textContent = `Size: ${formatBytes(file.size)}`;
    fileSizeText.classList.remove('d-none');
    rotateBtn.disabled = false;
    clearBtn.disabled = false;
    downloadLink.classList.add('d-none');
    downloadMessage.classList.add('d-none');
  };
  reader.readAsArrayBuffer(file);
}

rotateBtn.addEventListener('click', async () => {
  if (!pdfBytes) return;

  rotateBtn.disabled = true;
  rotateBtn.textContent = 'Rotating...';

  try {
    const angle = parseInt(rotateSelect.value);
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    pages.forEach(page => {
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angle) % 360;
      page.setRotation(newRotation);
    });

    const rotatedPdfBytes = await pdfDoc.save();

    // Create blob and set download link
    const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;

    downloadLink.classList.remove('d-none');
    downloadMessage.classList.remove('d-none');
  } catch (err) {
    alert('Error rotating PDF: ' + err.message);
  } finally {
    rotateBtn.textContent = 'Rotate PDF';
    rotateBtn.disabled = false;
  }
});

clearBtn.addEventListener('click', () => {
  resetUI();
});

// Initialize UI on page load
resetUI();