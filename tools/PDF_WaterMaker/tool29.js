let processedPdfBytes = null;

async function addWatermark() {
  const fileInput = document.getElementById("pdfInput");
  const watermarkText = document.getElementById("watermarkText").value.trim();
  const position = document.getElementById("position").value;

  if (!fileInput.files.length || !watermarkText) {
    alert("Please select a PDF and enter watermark text.");
    return;
  }

  const file = fileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
  const fontSize = 30;
  const color = PDFLib.rgb(0.5, 0.5, 0.5);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    let x = width / 2, y = height / 2;

    switch (position) {
      case "top-left":
        x = 50; y = height - 50;
        break;
      case "top-right":
        x = width - 200; y = height - 50;
        break;
      case "bottom-left":
        x = 50; y = 50;
        break;
      case "bottom-right":
        x = width - 200; y = 50;
        break;
    }

    page.drawText(watermarkText, {
      x, y,
      size: fontSize,
      font,
      color,
      rotate: position === "center" ? PDFLib.degrees(45) : undefined,
      opacity: 0.5
    });
  });

  processedPdfBytes = await pdfDoc.save();
  document.getElementById("downloadBtn").disabled = false;
  document.getElementById("downloadMessage").innerText = "Watermark added! Click download.";
}

function downloadPDF() {
  if (!processedPdfBytes) return;
  const blob = new Blob([processedPdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "watermarked.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  document.getElementById("pdfInput").value = "";
  document.getElementById("watermarkText").value = "";
  document.getElementById("position").selectedIndex = 0;
  document.getElementById("downloadBtn").disabled = true;
  document.getElementById("downloadMessage").innerText = "";
  processedPdfBytes = null;
}
