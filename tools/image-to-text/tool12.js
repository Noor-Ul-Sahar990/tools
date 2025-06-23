AOS.init();

const imageInput = document.getElementById("imageInput");
const outputText = document.getElementById("outputText");
const extractBtn = document.getElementById("extractBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const filePicker = document.querySelector(".file-picker");
const filePickerText = document.getElementById("filePickerText");

filePicker.addEventListener("click", () => imageInput.click());

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
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    imageInput.files = files;
    filePickerText.textContent = "Image selected: " + files[0].name;
  }
});

imageInput.addEventListener("change", () => {
  if (imageInput.files.length > 0) {
    filePickerText.textContent = "Image selected: " + imageInput.files[0].name;
  }
});

extractBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please upload an image.");
    return;
  }
  outputText.innerHTML = "<em>Extracting text, please wait...</em>";
  const reader = new FileReader();
  reader.onload = () => {
    Tesseract.recognize(reader.result, 'eng', {
      logger: m => console.log(m)
    })
    .then(({ data: { text } }) => {
      outputText.textContent = text.trim();
    })
    .catch(err => {
      outputText.innerHTML = "<span class='text-danger'>Failed to extract text.</span>";
      console.error(err);
    });
  };
  reader.readAsDataURL(file);
});

clearBtn.addEventListener("click", () => {
  imageInput.value = "";
  outputText.textContent = "";
  filePickerText.textContent = "Click here or drop an image to upload";
});

copyBtn.addEventListener("click", () => {
  const text = outputText.textContent;
  if (!text) return alert("No text to copy.");
  navigator.clipboard.writeText(text).then(() => alert("Text copied!"));
});
