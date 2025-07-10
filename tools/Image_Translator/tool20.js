document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

  const imageInput = document.getElementById("imageInput");
  const filePicker = document.querySelector(".file-picker");
  const filePickerText = document.getElementById("filePickerText");
  const fileSizeText = document.getElementById("fileSizeText");
  const clearButton = document.getElementById("clearButton");
  const startButton = document.getElementById("startButton");
  const langSelect = document.getElementById("langSelect");
  const loadingBar = document.getElementById("loadingBar");
  const progressBar = document.getElementById("progressBar");
  const extractedText = document.getElementById("extractedText");
  const translatedText = document.getElementById("translatedText");
  const translatedMessage = document.getElementById("translatedMessage");

  let imageFile = null;

  filePicker.addEventListener("click", () => imageInput.click());
  filePicker.addEventListener("dragover", e => {
    e.preventDefault();
    filePicker.classList.add("dragover");
  });
  filePicker.addEventListener("dragleave", e => {
    e.preventDefault();
    filePicker.classList.remove("dragover");
  });
  filePicker.addEventListener("drop", e => {
    e.preventDefault();
    filePicker.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length && files[0].type.startsWith("image")) {
      imageFile = files[0];
      filePickerText.textContent = `Selected: ${imageFile.name}`;
      fileSizeText.textContent = `Size: ${(imageFile.size / 1024).toFixed(2)} KB`;
      fileSizeText.classList.remove("d-none");
    } else {
      filePickerText.textContent = "Please drop a valid image file!";
      fileSizeText.classList.add("d-none");
    }
  });

  imageInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      imageFile = file;
      filePickerText.textContent = `Selected: ${imageFile.name}`;
      fileSizeText.textContent = `Size: ${(imageFile.size / 1024).toFixed(2)} KB`;
      fileSizeText.classList.remove("d-none");
    } else {
      filePickerText.textContent = "Invalid file selected.";
      fileSizeText.classList.add("d-none");
    }
  });

  clearButton.addEventListener("click", () => {
    imageFile = null;
    filePickerText.textContent = "Drag & Drop your Image here or click to upload";
    fileSizeText.textContent = "";
    fileSizeText.classList.add("d-none");
    extractedText.value = "";
    translatedText.value = "";
    translatedMessage.classList.add("d-none");
    progressBar.style.width = "0%";
    loadingBar.classList.add("d-none");
  });

  startButton.addEventListener("click", async () => {
    if (!imageFile) return alert("Please select an image first.");

    loadingBar.classList.remove("d-none");
    progressBar.style.width = "20%";
    extractedText.value = "Extracting text...";

    try {
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: m => console.log(m)
        }
      );

      if (!result || !result.data || !result.data.text) {
        throw new Error("No text extracted.");
      }

      const text = result.data.text.trim();
      extractedText.value = text || "(No text found)";
      progressBar.style.width = "60%";

      const response = await fetch("https://api.allorigins.win/raw?url=https://translate.argosopentech.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: "auto",
          target: langSelect.value,
          format: "text"
        })
      });

      const data = await response.json();
      translatedText.value = data.translatedText || "(Translation failed)";
      translatedMessage.classList.remove("d-none");
      progressBar.style.width = "100%";
    } catch (error) {
      console.error("Error:", error);
      extractedText.value = "OCR failed: " + (error.message || "Unknown error");
      translatedText.value = "Translation failed";
    }
  });
});