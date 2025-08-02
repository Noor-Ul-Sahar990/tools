 AOS.init({ duration: 800 });

  const videoInput = document.getElementById('videoInput');
  const videoPreview = document.getElementById('videoPreview');
  const startButton = document.getElementById('startButton');
  const clearButton = document.getElementById('clearButton');
  const downloadButton = document.getElementById('downloadButton');
  const progress = document.querySelector('.progress');
  const progressBar = document.getElementById('progressBar');

  let gifBlob;

  videoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoPreview.src = url;
      videoPreview.classList.remove('d-none');
      startButton.disabled = false;
    }
  });

  clearButton.addEventListener('click', () => {
    videoInput.value = '';
    videoPreview.src = '';
    videoPreview.classList.add('d-none');
    startButton.disabled = true;
    downloadButton.disabled = true;
    progress.classList.add('d-none');
    progressBar.style.width = '0%';
  });

  startButton.addEventListener('click', () => {
    progress.classList.remove('d-none');
    progressBar.style.width = '10%';
    gifBlob = null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: 'https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.worker.js'
    });

    videoPreview.addEventListener('loadeddata', () => {
      const interval = 0.3;
      const totalFrames = Math.min(Math.floor(videoPreview.duration / interval), 30);
      let currentFrame = 0;

      canvas.width = videoPreview.videoWidth / 2;
      canvas.height = videoPreview.videoHeight / 2;

      const capture = () => {
        if (currentFrame >= totalFrames) {
          gif.render();
          return;
        }

        videoPreview.currentTime = currentFrame * interval;
        videoPreview.onseeked = () => {
          ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx, { copy: true, delay: 200 });
          currentFrame++;
          progressBar.style.width = `${(currentFrame / totalFrames) * 100}%`;
          capture();
        };
      };

      capture();
    });

    gif.on('finished', function (blob) {
      gifBlob = blob;
      downloadButton.disabled = false;
      progressBar.style.width = '100%';
    });

    videoPreview.load();
  });

  downloadButton.addEventListener('click', () => {
    if (gifBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(gifBlob);
      link.download = 'converted.gif';
      link.click();
    }
  });