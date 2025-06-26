const htmlInput = document.getElementById('htmlInput');
const filePickerText = document.getElementById('filePickerText');
const fileSizeText = document.getElementById('fileSizeText');
const convertButton = document.getElementById('convertButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const output = document.getElementById('output');
const downloadMessage = document.getElementById('downloadMessage');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const filePicker = document.getElementById('filePicker');

let selectedFile = null;

filePicker.addEventListener('click', () => htmlInput.click());

htmlInput.addEventListener('change', () => {
  const file = htmlInput.files[0];
  if (!file || !file.name.endsWith('.html') && !file.name.endsWith('.htm')) return;
  selectedFile = file;
  filePickerText.textContent = `Selected File: ${file.name}`;
  fileSizeText.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
  fileSizeText.classList.remove('d-none');
  convertButton.disabled = false;
});

clearButton.addEventListener('click', () => {
  selectedFile = null;
  htmlInput.value = '';
  filePickerText.textContent = 'Drag & Drop your HTML file here or click to upload';
  fileSizeText.classList.add('d-none');
  convertButton.disabled = true;
  output.classList.add('d-none');
  output.innerHTML = '';
  downloadButton.classList.add('d-none');
  downloadMessage.classList.add('d-none');
});

convertButton.addEventListener('click', async () => {
  if (!selectedFile) return;
  convertButton.disabled = true;
  loadingBar.classList.remove('d-none');
  progressBar.style.width = '50%';

  const reader = new FileReader();
  reader.readAsText(selectedFile);
  reader.onload = async function () {
    output.innerHTML = reader.result;
    output.classList.remove('d-none');

    await new Promise(resolve => setTimeout(resolve, 500));

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');

    await html2canvas(output).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    downloadButton.href = url;
    downloadButton.classList.remove('d-none');
    downloadMessage.classList.remove('d-none');
    loadingBar.classList.add('d-none');
    progressBar.style.width = '100%';
  };
});