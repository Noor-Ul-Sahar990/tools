const pdfInput = document.getElementById("pdfInput");
  const preview = document.getElementById("pdf-preview");
  const deleteBtn = document.getElementById("deletePagesBtn");
  const downloadSection = document.getElementById("downloadSection");
  const downloadBtn = document.getElementById("downloadPdfBtn");

  let pdfDoc = null;
  let pagesToDelete = new Set();

  pdfInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    preview.innerHTML = "";
    pagesToDelete.clear();

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const div = document.createElement("div");
      div.className = "page-item";
      div.innerHTML = `<span>Page ${i + 1}</span><input type='checkbox' data-page='${i}' />`;
      preview.appendChild(div);
    }

    deleteBtn.disabled = false;
  });

  deleteBtn.addEventListener("click", async () => {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const pagesToRemove = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.getAttribute("data-page")))
      .sort((a, b) => b - a);

    if (pagesToRemove.length === 0) return alert("Please select pages to delete.");

    const newPdfDoc = await PDFLib.PDFDocument.create();
    const totalPages = pdfDoc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      if (!pagesToRemove.includes(i)) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
    }

    const newPdfBytes = await newPdfDoc.save();
    const blob = new Blob([newPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    downloadBtn.href = url;
    downloadSection.style.display = "block";
  });