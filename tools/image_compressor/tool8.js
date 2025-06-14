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
const fileList = document.getElementById('fileList');
const clearButton = document.getElementById('clearButton');
const compressButton = document.getElementById('compressButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBar = document.getElementById('loadingBar');
const progressBar = document.getElementById('progressBar');
const downloadMessage = document.getElementById('downloadMessage');

let imageFiles = [];
let compressedImages = [];
let compressedZipBlob = null;

// Function to dynamically load scripts
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

// Load required libraries
async function loadLibraries() {
  try {
    console.log('Loading libraries...');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/compressorjs/1.2.1/compressor.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    console.log('All libraries loaded successfully.');
  } catch (error) {
    console.error('Error loading libraries:', error);
    filePickerText.textContent = 'Error loading required libraries. Please refresh the page and try again.';
    throw error;
  }
}

// Function to reset the tool
function resetTool() {
  imageFiles = [];
  compressedImages = [];
  compressedZipBlob = null;
  filePickerText.textContent = 'Drag & Drop your images here or click to upload (Multiple files allowed)';
  fileList.classList.add('d-none');
  fileList.innerHTML = '';
  compressButton.disabled = true;
  downloadButton.disabled = true;
  loadingBar.classList.add('d-none');
  progressBar.style.width = '0%';
  downloadMessage.classList.add('d-none');
  imageInput.value = '';
  filePicker.classList.remove('dragover');
}

// Function to update file list UI
function updateFileList() {
  fileList.innerHTML = '';
  if (imageFiles.length > 0) {
    fileList.classList.remove('d-none');
    imageFiles.forEach((file, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item';
      listItem.innerHTML = `
        ${file.name} (${(file.size / 1024).toFixed(2)} KB)
        <button class="remove-file-btn" data-index="${index}">Remove</button>
      `;
      fileList.appendChild(listItem);
    });
    compressButton.disabled = false;
  } else {
    fileList.classList.add('d-none');
    compressButton.disabled = true;
  }

  document.querySelectorAll('.remove-file-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      imageFiles.splice(index, 1);
      updateFileList();
    });
  });
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
  const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
  if (files.length > 0) {
    imageFiles = imageFiles.concat(files);
    filePickerText.textContent = `${imageFiles.length} image(s) selected`;
    updateFileList();
  } else {
    filePickerText.textContent = 'Please drop valid image files!';
  }
});

filePicker.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
  if (files.length > 0) {
    imageFiles = imageFiles.concat(files);
    filePickerText.textContent = `${imageFiles.length} image(s) selected`;
    updateFileList();
  } else {
    filePickerText.textContent = 'Please select valid image files!';
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Compress Images
compressButton.addEventListener('click', async () => {
  if (imageFiles.length === 0) {
    filePickerText.textContent = 'Please upload at least 1 image to compress.';
    return;
  }

  compressButton.disabled = true;
  loadingBar.classList.remove('d-none');
  downloadButton.disabled = true;

  try {
    await loadLibraries();
  } catch (error) {
    compressButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    return;
  }

  let progress = 0;
  const totalFiles = imageFiles.length;
  compressedImages = [];

  const compressNextImage = async (index) => {
    if (index >= totalFiles) {
      await createZipFile();
      return;
    }

    const file = imageFiles[index];
    console.log(`Compressing image ${index + 1}/${totalFiles}: ${file.name}`);

    try {
      const compressedFile = await new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.8, // High quality compression
          maxWidth: 1920,
          maxHeight: 1080,
          mimeType: file.type,
          success(result) {
            resolve(result);
          },
          error(err) {
            reject(err);
          },
        });
      });

      compressedImages.push({
        name: `compressed_${file.name}`,
        blob: compressedFile,
      });

      progress = ((index + 1) / totalFiles) * 100;
      progressBar.style.width = `${progress}%`;

      setTimeout(() => compressNextImage(index + 1), 100);
    } catch (error) {
      console.error(`Error compressing ${file.name}:`, error);
      filePickerText.textContent = `Error compressing ${file.name}. Skipping to next image.`;
      progress = ((index + 1) / totalFiles) * 100;
      progressBar.style.width = `${progress}%`;
      setTimeout(() => compressNextImage(index + 1), 100);
    }
  };

  compressNextImage(0);
});

// Function to create ZIP file
async function createZipFile() {
  try {
    if (!JSZip) {
      throw new Error('JSZip library not loaded.');
    }

    const zip = new JSZip();
    compressedImages.forEach(image => {
      zip.file(image.name, image.blob);
    });

    console.log('Generating ZIP file...');
    compressedZipBlob = await zip.generateAsync({ type: 'blob' });

    if (!compressedZipBlob) {
      throw new Error('Failed to generate ZIP file.');
    }

    console.log('ZIP file generated successfully:', compressedZipBlob);
    downloadButton.disabled = false;
    downloadMessage.classList.remove('d-none');
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    filePickerText.textContent = `Error: ${error.message || 'Failed to create ZIP file. Please try again.'}`;
    compressButton.disabled = false;
    loadingBar.classList.add('d-none');
    progressBar.style.width = '0%';
    downloadMessage.classList.add('d-none');
  }
}

// Download Compressed Images
downloadButton.addEventListener('click', () => {
  if (compressedZipBlob) {
    try {
      console.log('Initiating download...');
      const url = window.URL.createObjectURL(compressedZipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Download completed successfully.');
      resetTool();
    } catch (error) {
      console.error('Error downloading compressed images:', error);
      filePickerText.textContent = 'Error downloading compressed images. Please try again.';
    }
  } else {
    filePickerText.textContent = 'No compressed images available to download. Please compress again.';
  }
});