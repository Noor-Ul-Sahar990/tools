// Elements
const dropZone = document.getElementById("dropZone");
const pdfInput = document.getElementById("pdfFile");
const processBtn = document.getElementById("processBtn");
const headerText = document.getElementById("headerText");
const footerText = document.getElementById("footerText");
const addPageNumbers = document.getElementById("addPageNumbers");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress");
const downloadLink = document.getElementById("downloadLink");

let selectedFile = null;

// Drag and Drop
dropZone.addEventListener("click", () => pdfInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].type === "application/pdf") {
    selectedFile = e.dataTransfer.files[0];
    dropZone.innerHTML = `<p><strong>${selectedFile.name}</strong></p>`;
  } else {
    alert("Please upload a valid PDF file.");
  }
});
pdfInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0 && e.target.files[0].type === "application/pdf") {
    selectedFile = e.target.files[0];
    dropZone.innerHTML = `<p><strong>${selectedFile.name}</strong></p>`;
  } else {
    alert("Please upload a valid PDF file.");
  }
});

// Process PDF
processBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    alert("Please select a PDF file first.");
    return;
  }

  processBtn.disabled = true;
  progressContainer.classList.remove("d-none");
  progressBar.style.width = "0%";

  const arrayBuffer = await selectedFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  const pages = pdfDoc.getPages();
  const header = headerText.value.trim();
  const footer = footerText.value.trim();

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    if (header) {
      page.drawText(header, {
        x: 50,
        y: height - 30,
        size: 12
      });
    }
    if (footer) {
      page.drawText(footer, {
        x: 50,
        y: 20,
        size: 12
      });
    }
    if (addPageNumbers.checked) {
      page.drawText(`Page ${idx + 1} of ${pages.length}`, {
        x: width - 120,
        y: 20,
        size: 12
      });
    }
  });

  // Simulate progress
  for (let p = 0; p <= 100; p += 20) {
    await new Promise(r => setTimeout(r, 200));
    progressBar.style.width = `${p}%`;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  downloadLink.href = url;
  downloadLink.classList.remove("d-none");
  processBtn.disabled = false;
});