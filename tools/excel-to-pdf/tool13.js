AOS.init();

const input = document.getElementById("excelInput");
const filePicker = document.querySelector(".file-picker");
const filePickerText = document.getElementById("filePickerText");
const fileSizeText = document.getElementById("fileSizeText");
const startButton = document.getElementById("startButton");
const downloadButton = document.getElementById("downloadButton");
const clearButton = document.getElementById("clearButton");
const progressBar = document.getElementById("progressBar");
const loadingBar = document.getElementById("loadingBar");
const downloadMessage = document.getElementById("downloadMessage");

let excelFile = null;
let pdfDoc = null;

function resetTool() {
  excelFile = null;
  pdfDoc = null;
  filePickerText.textContent = "Drag & Drop your Excel file here or click to upload";
  fileSizeText.classList.add("d-none");
  fileSizeText.textContent = "";
  startButton.disabled = true;
  downloadButton.disabled = true;
  downloadMessage.classList.add("d-none");
  progressBar.style.width = "0%";
  loadingBar.classList.add("d-none");
  input.value = "";
}

filePicker.addEventListener("dragover", (e) => {
  e.preventDefault();
  filePicker.classList.add("dragover");
});

filePicker.addEventListener("dragleave", (e) => {
  e.preventDefault();
  filePicker.classList.remove("dragover");
});

filePicker.addEventListener("drop", (e) => {
  e.preventDefault();
  filePicker.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".xlsx")) {
    excelFile = file;
    filePickerText.textContent = `Selected File: ${file.name}`;
    fileSizeText.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove("d-none");
    startButton.disabled = false;
  } else {
    filePickerText.textContent = "Please drop a valid .xlsx file!";
  }
});

filePicker.addEventListener("click", () => input.click());

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file && file.name.endsWith(".xlsx")) {
    excelFile = file;
    filePickerText.textContent = `Selected File: ${file.name}`;
    fileSizeText.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
    fileSizeText.classList.remove("d-none");
    startButton.disabled = false;
  } else {
    filePickerText.textContent = "Invalid file selected.";
  }
});

clearButton.addEventListener("click", resetTool);

startButton.addEventListener("click", () => {
  if (!excelFile) return;

  loadingBar.classList.remove("d-none");
  progressBar.style.width = "0%";
  startButton.disabled = true;

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      convertExcelToPDF();
    }
  }, 200);
});

function convertExcelToPDF() {
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const html = XLSX.utils.sheet_to_html(ws);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;
    tempDiv.querySelectorAll("tr").forEach((row) => {
      const line = Array.from(row.cells).map(cell => cell.innerText).join(" | ");
      doc.text(line, 10, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    pdfDoc = doc;
    downloadButton.disabled = false;
    downloadMessage.classList.remove("d-none");
  };
  reader.readAsArrayBuffer(excelFile);
}

downloadButton.addEventListener("click", () => {
  if (pdfDoc) {
    pdfDoc.save("converted_excel.pdf");
    resetTool();
  }
});
v