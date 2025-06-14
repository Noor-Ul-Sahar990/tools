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
const filePickerContainer = document.getElementById('filePickerContainer');
const imageContainer = document.getElementById('imageContainer');
const originalImage = document.getElementById('originalImage');
const enhancedImage = document.getElementById('enhancedImage');
const clearButton = document.getElementById('clearButton');
const convertButton = document.getElementById('convertButton');
const downloadButton = document.getElementById('downloadButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

let imageFile = null;
let enhancedImageUrl = null;



// Function to reset the tool
function resetTool() {
  imageFile = null;
  enhancedImageUrl = null;
  filePickerText.textContent = 'Drag & Drop your image here or click to upload';
  filePickerContainer.classList.remove('d-none');
  imageContainer.classList.add('d-none');
  progressContainer.classList.add('d-none');
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  progressBar.setAttribute('aria-valuenow', 0);
  downloadButton.disabled = true;
  imageInput.value = '';
  filePicker.classList.remove('dragover');
  originalImage.src = '';
  enhancedImage.src = '';
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
  if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
    imageFile = file;
    filePickerText.textContent = `${imageFile.name} selected`;
  } else {
    filePickerText.textContent = 'Please drop a valid image file (JPG/PNG)!';
  }
});

filePicker.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
    imageFile = file;
    filePickerText.textContent = `${imageFile.name} selected`;
  } else {
    filePickerText.textContent = 'Please select a valid image file (JPG/PNG)!';
  }
});

// Clear Button
clearButton.addEventListener('click', () => {
  resetTool();
});

// Enhance Image with PicsArt API
convertButton.addEventListener('click', async () => {
  if (!imageFile) {
    filePickerText.textContent = 'Please choose a file to enhance.';
    return;
  }

  downloadButton.disabled = true;
  progressContainer.classList.remove('d-none');
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  progressBar.setAttribute('aria-valuenow', 0);

  try {
    const form = new FormData();
    form.append('upscale_factor', '2');
    form.append('format', 'JPG');

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'X-Picsart-API-Key': 'eyJraWQiOiI5NzIxYmUzNi1iMjcwLTQ5ZDUtOTc1Ni05ZDU5N2M4NmIwNTEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhdXRoLXNlcnZpY2UtMzZiOGZiOTgtOWRiNC00ZjAxLTg3MmUtMmJhNDFmNWJkMWJjIiwiYXVkIjoiNDMyNzcyNDY1MDM4MTAxIiwibmJmIjoxNzQ2NTUzNjc2LCJzY29wZSI6WyJiMmItYXBpLmdlbl9haSIsImIyYi1hcGkuaW1hZ2VfYXBpIl0sImlzcyI6Imh0dHBzOi8vYXBpLnBpY3NhcnQuY29tL3Rva2VuLXNlcnZpY2UiLCJvd25lcklkIjoiNDMyNzcyNDY1MDM4MTAxIiwiaWF0IjoxNzQ2NTUzNjc2LCJqdGkiOiI5YTk5NjkzYS00NTUzLTQ3Y2QtYjQ1ZC1kYTBkZWRiNjliYjQifQ.cqBQShe-F26sHJev4iX5V7r2p4HHmlV9cExa_I_zaLhKwurD-h11TuWzD-33fvWpPq5EP7asr3kGB0Q62BKgUCnNprI70XS-f9wF7RIUkOwYcy2g6DfwRiiv_WjzkEnTNuyz0TgmkT6XD8fAzt8hdYO6yiMmFv8Ki1oZj9P6sTc4F8B5HyaHuM1ciwveArp904Wr5ip7iDCz6MmoYxOkPZ-ZOJuJ-OWxxqchVjf7bcm2zREUJ_YP65Vk32bhR1SJ0xi88fHTha6kCJzAuzZjfXs6T6BYilfoPnjwx0Ol8OhPHhfL3H5jWT7rCkCTBQUiJ45PtPVfBhBb-Dcd5F7g_Q'
      }
    };

    options.body = form;


    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress > 90) progress = 90;
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }, 200);

    const response = await fetch('https://api.picsart.io/tools/1.0/upscale', options);

    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText || 'Unknown error'} (Status: ${response.status})`);
    }

    const data = await response.json();

    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    progressBar.textContent = '100%';
    progressBar.setAttribute('aria-valuenow', 100);

    // Debug API response
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Handle different response structures
    let url = null;
    if (data.url) {
      url = data.url;
    } else if (data.data && data.data.url) {
      url = data.data.url;
    } else if (data.result && data.result.url) {
      url = data.result.url;
    } else if (data.output && data.output.url) {
      url = data.output.url;
    } else if (data.status === 'success' && data.image) {
      url = data.image;
    } else if (data.error) {
      throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
    } else {
      throw new Error('No valid image URL found in API response. Full response logged in console.');
    }

    enhancedImageUrl = url;
    filePickerContainer.classList.add('d-none');
    imageContainer.classList.remove('d-none');
    originalImage.src = URL.createObjectURL(imageFile);
    enhancedImage.src = enhancedImageUrl;
    originalImage.style.width = '100%';
    enhancedImage.style.width = '100%';
    downloadButton.disabled = false;
    filePickerText.textContent = 'Enhancement completed! Download your enhanced image.';
  } catch (error) {
    console.error('Error enhancing image:', error);
    filePickerText.textContent = `Error enhancing image: ${error.message}. Check console for details.`;
    progressContainer.classList.add('d-none');
  }
});

// Download Button
downloadButton.addEventListener('click', () => {
  if (enhancedImageUrl) {
    const link = document.createElement('a');
    link.href = enhancedImageUrl;
    link.download = imageFile.name.replace(/\.(jpg|jpeg|png)$/i, '_enhanced.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    filePickerText.textContent = 'No enhanced image available to download.';
  }
});
