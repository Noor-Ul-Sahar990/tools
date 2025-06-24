
let pdfFile = null;
let excelData = [];
const input = document.getElementById("pdfInput");
const filePickerText = document.getElementById("filePickerText");
const startButton = document.getElementById("startButton");
const downloadButton = document.getElementById("downloadButton");
const clearButton = document.getElementById("clearButton");
const loadingBar = document.getElementById("loadingBar");
const progressBar = document.getElementById("progressBar");
const downloadMessage = document.getElementById("downloadMessage");

function resetTool() {
  pdfFile = null;
  excelData = [];
  input.value = "";
  filePickerText.textContent = "Drag & Drop your PDF file here or click to upload";
  startButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add("d-none");
  progressBar.style.width = "0%";
  downloadMessage.classList.add("d-none");
}

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file && file.name.endsWith(".pdf")) {
    pdfFile = file;
    filePickerText.textContent = `Selected File: ${file.name}`;
    startButton.disabled = false;
  } else {
    alert("Please select a valid PDF file.");
  }
});

startButton.addEventListener("click", () => {
  if (!pdfFile) return;
  loadingBar.classList.remove("d-none");
  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(reader.result);
    pdfjsLib.getDocument(typedarray).promise.then(async pdf => {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str).join(" ");
        excelData.push([`Page ${i}`, strings]);
        progressBar.style.width = `${(i / pdf.numPages) * 100}%`;
      }
      downloadButton.disabled = false;
      downloadMessage.classList.remove("d-none");
    });
  };
  reader.readAsArrayBuffer(pdfFile);
});

downloadButton.addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, "PDF Data");
  XLSX.writeFile(wb, "converted_pdf.xlsx");
  resetTool();
});

clearButton.addEventListener("click", resetTool);
