const pdfInput = document.getElementById('pdfInput');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const convertButton = document.getElementById('convertButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const output = document.getElementById('output');
const downloadMessage = document.getElementById('downloadMessage');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');

let selectedFile = null;

document.querySelector('.file-picker').addEventListener('click', () => pdfInput.click());

pdfInput.addEventListener('change', () => {
  const file = pdfInput.files[0];
  if (!file || file.type !== 'application/pdf') return;

  selectedFile = file;
  filePickerText.textContent = `Selected File: ${file.name}`;
  fileSizeText.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
  fileSizeText.classList.remove('d-none');
  convertButton.disabled = false;
});

clearButton.addEventListener('click', () => {
  selectedFile = null;
  pdfInput.value = '';
  filePickerText.textContent = 'Drag & Drop your PDF here or click to upload';
  fileSizeText.classList.add('d-none');
  convertButton.disabled = true;
  output.classList.add('d-none');
  output.textContent = '';
  downloadButton.classList.add('d-none');
  downloadMessage.classList.add('d-none');
});

convertButton.addEventListener('click', async () => {
  if (!selectedFile) return;
  convertButton.disabled = true;
  loadingBar.classList.remove('d-none');
  progressBar.style.width = '50%';

  const reader = new FileReader();
  reader.readAsArrayBuffer(selectedFile);

  reader.onload = async function () {
    const typedarray = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let html = '';
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      html += `<h3>Page ${i + 1}</h3><p>${pageText}</p><hr/>`;
    }

    output.innerHTML = html;
    output.classList.remove('d-none');
    loadingBar.classList.add('d-none');
    progressBar.style.width = '100%';

    const blob = new Blob([html], { type: 'text/html' });
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.classList.remove('d-none');
    downloadMessage.classList.remove('d-none');
  };
});
