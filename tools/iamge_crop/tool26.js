const imageInput = document.getElementById('imageInput');
const image = document.getElementById('image');
const filePicker = document.getElementById('filePicker');
const filePickerText = document.getElementById('filePickerText');
const cropButton = document.getElementById('cropButton');
const downloadButton = document.getElementById('downloadButton');
const clearButton = document.getElementById('clearButton');

let cropper;
let croppedBlob = null;

// Reset tool
function resetTool() {
  image.src = '';
  image.classList.add('d-none');
  cropButton.classList.add('d-none');
  downloadButton.classList.add('d-none');
  filePickerText.textContent = 'Drag & Drop or Click to upload an image';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  croppedBlob = null;
}

// Handle file selection
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    filePickerText.textContent = 'Please select a valid image file!';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    image.src = e.target.result;
    image.classList.remove('d-none');
    cropButton.classList.remove('d-none');

    if (cropper) cropper.destroy();
    cropper = new Cropper(image, {
      viewMode: 1,
      aspectRatio: NaN,
      responsive: true
    });
  };
  reader.readAsDataURL(file);
}

// Drag & Drop events
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

// Click to open file picker
filePicker.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

// Crop button
cropButton.addEventListener('click', () => {
  if (cropper) {
    cropper.getCroppedCanvas().toBlob((blob) => {
      croppedBlob = blob;
      const url = URL.createObjectURL(blob);
      downloadButton.href = url;
      downloadButton.classList.remove('d-none');
      filePickerText.textContent = 'Image cropped! Click download.';
    }, 'image/png');
  }
});

// Clear/reset
clearButton.addEventListener('click', resetTool);