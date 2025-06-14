// Initialize AOS for animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// DOM Elements
const imageInput = document.getElementById('imageInput');
const filePicker = document.querySelector('.file-picker');
const filePickerText = document.getElementById('filePickerText');
const clearButton = document.getElementById('clearButton');
const convertButton = document.getElementById('convertButton');
const downloadButton = document.getElementById('downloadButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

let imageFile = null;
let convertedImage = null;

// Function to reset the tool
function resetTool() {
  imageFile = null;
  convertedImage = null;
  filePickerText.textContent = 'Drag & Drop your JPG here or click to upload';
  progressContainer.classList.add('d-none');
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  progressBar.setAttribute('aria-valuenow', 0);
  downloadButton.disabled = true;
  imageInput.value = '';
  filePicker.classList.remove('dragover');
}

// File Picker - Drag and Drop
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
  if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
    imageFile = file;
    filePickerText.textContent = `${imageFile.name} selected`;
  } else {
    filePickerText.textContent = 'Please drop a valid JPG file!';
  }
});

filePicker.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
    imageFile = file;
    filePickerText.textContent = `${imageFile.name} selected`;
  } else {
    filePickerText.textContent = 'Please select a valid JPG file!';
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Convert JPG to PNG
convertButton.addEventListener('click', async () => {
  if (!imageFile) {
    filePickerText.textContent = 'Please choose a file to convert.';
    return;
  }

  downloadButton.disabled = true;
  progressContainer.classList.remove('d-none');
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  progressBar.setAttribute('aria-valuenow', 0);

  try {
    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress > 90) progress = 90; // Keep it at 90% until conversion is done
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }, 200);

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const pngDataUrl = canvas.toDataURL('image/png');
    const pngBlob = await fetch(pngDataUrl).then(res => res.blob());

    convertedImage = {
      name: imageFile.name.replace(/\.(jpg|jpeg)$/i, '.png'),
      url: URL.createObjectURL(pngBlob),
    };

    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    progressBar.textContent = '100%';
    progressBar.setAttribute('aria-valuenow', 100);

    downloadButton.disabled = false;
    filePickerText.textContent = 'Conversion completed! Click Download to get your PNG.';
  } catch (error) {
    console.error(`Error converting ${imageFile.name}:`, error);
    filePickerText.textContent = `Error converting ${imageFile.name}.`;
    progressContainer.classList.add('d-none');
  }
});

// Download Button
downloadButton.addEventListener('click', () => {
  if (convertedImage) {
    const link = document.createElement('a');
    link.href = convertedImage.url;
    link.download = convertedImage.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    filePickerText.textContent = 'No image available to download. Please convert again.';
  }
});