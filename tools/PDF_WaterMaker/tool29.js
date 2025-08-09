  let processedPdfBytes = null;

    const filePicker = document.getElementById("filePicker");
    const pdfInput = document.getElementById("pdfInput");
    const addWatermarkBtn = document.getElementById("addWatermarkBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const clearBtn = document.getElementById("clearBtn");
    const downloadMessage = document.getElementById("downloadMessage");

    // Clicking on file picker triggers file input click
    filePicker.addEventListener("click", () => pdfInput.click());

    // Drag & Drop handlers
    filePicker.addEventListener("dragover", (e) => {
      e.preventDefault();
      filePicker.classList.add("dragover");
    });

    filePicker.addEventListener("dragleave", () => {
      filePicker.classList.remove("dragover");
    });

    filePicker.addEventListener("drop", (e) => {
      e.preventDefault();
      filePicker.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/pdf") {
          pdfInput.files = e.dataTransfer.files;
        } else {
          alert("Please drop a PDF file.");
        }
      }
    });

    pdfInput.addEventListener("change", () => {
      processedPdfBytes = null;
      downloadBtn.disabled = true;
      downloadMessage.innerText = "";
    });

    addWatermarkBtn.addEventListener("click", async () => {
      const watermarkText = document.getElementById("watermarkText").value.trim();
      const position = document.getElementById("position").value;

      if (!pdfInput.files.length || !watermarkText) {
        alert("Please select a PDF and enter watermark text.");
        return;
      }

      const file = pdfInput.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontSize = 30;
      const color = PDFLib.rgb(0.5, 0.5, 0.5);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        let x = width / 2,
          y = height / 2;

        switch (position) {
          case "top-left":
            x = 50;
            y = height - 50;
            break;
          case "top-right":
            x = width - 200;
            y = height - 50;
            break;
          case "bottom-left":
            x = 50;
            y = 50;
            break;
          case "bottom-right":
            x = width - 200;
            y = 50;
            break;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color,
          rotate: position === "center" ? PDFLib.degrees(45) : undefined,
          opacity: 0.5,
        });
      });

      processedPdfBytes = await pdfDoc.save();
      downloadBtn.disabled = false;
      downloadMessage.innerText = "Watermark added! Click download.";
    });

    downloadBtn.addEventListener("click", () => {
      if (!processedPdfBytes) return;
      const blob = new Blob([processedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermarked.pdf";
      a.click();
      URL.revokeObjectURL(url);
    });

    clearBtn.addEventListener("click", () => {
      pdfInput.value = "";
      document.getElementById("watermarkText").value = "";
      document.getElementById("position").selectedIndex = 0;
      downloadBtn.disabled = true;
      downloadMessage.innerText = "";
      processedPdfBytes = null;
    });