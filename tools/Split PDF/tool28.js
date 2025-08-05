    AOS.init();
    
    const pdfInput = document.getElementById("pdfInput");
    const dropZone = document.getElementById("dropZone");
    const filePickerText = document.getElementById("filePickerText");
    const fileSizeText = document.getElementById("fileSizeText");
    const startButton = document.getElementById("startButton");
    const clearButton = document.getElementById("clearButton");
    const downloadButton = document.getElementById("downloadButton");
    const loadingBar = document.getElementById("loadingBar");
    const progressBar = document.getElementById("progressBar");
    const downloadMessage = document.getElementById("downloadMessage");

    let splitPdfFiles = [];

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
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        pdfInput.files = e.dataTransfer.files;
        filePickerText.innerHTML = `<p><strong>${file.name}</strong></p>`;
        fileSizeText.textContent = `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        fileSizeText.classList.remove("d-none");
      }
    });

    pdfInput.addEventListener("change", () => {
      const file = pdfInput.files[0];
      if (file) {
        filePickerText.innerHTML = `<p><strong>${file.name}</strong></p>`;
        fileSizeText.textContent = `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        fileSizeText.classList.remove("d-none");
      }
    });

    clearButton.addEventListener("click", () => {
      pdfInput.value = "";
      filePickerText.innerHTML = `<p>Drag & Drop your PDF here or click to upload</p>`;
      fileSizeText.classList.add("d-none");
      progressBar.style.width = "0%";
      loadingBar.classList.add("d-none");
      downloadButton.disabled = true;
      downloadMessage.classList.add("d-none");
    });

    startButton.addEventListener("click", async () => {
      const file = pdfInput.files[0];
      if (!file) return alert("Please upload a PDF file first.");

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

      const totalPages = pdfDoc.getPageCount();
      splitPdfFiles = [];

      loadingBar.classList.remove("d-none");
      progressBar.style.width = "0%";

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFLib.PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        splitPdfFiles.push(blob);

        const progress = ((i + 1) / totalPages) * 100;
        progressBar.style.width = `${progress}%`;
      }

      downloadMessage.classList.remove("d-none");
      downloadButton.disabled = false;
    });

    downloadButton.addEventListener("click", () => {
      splitPdfFiles.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `page-${index + 1}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });