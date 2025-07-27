// DOM Elements
const imageInput = document.getElementById('imageInput');
const filePicker = document.getElementById('filePicker');
const filePickerText = document.getElementById('filePickerText');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const resizeButton = document.getElementById('resizeButton');
const downloadResizeButton = document.getElementById('downloadResizeButton');
const clearResizeButton = document.getElementById('clearResizeButton');

let originalImageFile = null;
let resizedImageURL = null;

// Reset tool state
function resetTool() {
  originalImageFile = null;
  resizedImageURL && URL.revokeObjectURL(resizedImageURL);
  resizedImageURL = null;

  filePickerText.textContent = 'Drag & Drop or Click to upload an image';
  widthInput.value = '';
  heightInput.value = '';
  downloadResizeButton.disabled = true;
  imageInput.value = '';
}

// Handle file selection
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    filePickerText.textContent = 'Please select a valid image file!';
    return;
  }
  originalImageFile = file;
  filePickerText.textContent = `${file.name} selected`;
}

// Drag & Drop handlers
filePicker.addEventListener('dragover', (e) => {
  e.preventDefault();
  filePicker.classList.add('dragover');
});

filePicker.addEventListener('dragleave', (e) => {
  e.preventDefault();
  filePicker.classList.remove('dragover');
});

filePicker.addEventListener('drop', (e) => {
  e.preventDefault();
  filePicker.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Click file picker to open file dialog
filePicker.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

// Resize image function
resizeButton.addEventListener('click', () => {
  if (!originalImageFile) {
    filePickerText.textContent = 'Please upload an image first.';
    return;
  }

  const width = parseInt(widthInput.value);
  const height = parseInt(heightInput.value);

  if (!width || !height || width <= 0 || height <= 0) {
    filePickerText.textContent = 'Please enter valid width and height.';
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(originalImageFile);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (resizedImageURL) {
        URL.revokeObjectURL(resizedImageURL);
      }
      resizedImageURL = URL.createObjectURL(blob);
      downloadResizeButton.disabled = false;
      filePickerText.textContent = 'Image resized! Click download to save.';
    }, originalImageFile.type || 'image/png');
  };

  img.onerror = () => {
    filePickerText.textContent = 'Error loading the image file.';
  };
});

// Download resized image
downloadResizeButton.addEventListener('click', () => {
  if (!resizedImageURL) {
    filePickerText.textContent = 'No resized image to download.';
    return;
  }

  const link = document.createElement('a');
  link.href = resizedImageURL;
  // Change extension based on original file type or use PNG by default
  let ext = originalImageFile?.name?.split('.').pop() || 'png';
  link.download = `resized-image.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Clear/reset tool
clearResizeButton.addEventListener('click', () => {
  resetTool();
});
