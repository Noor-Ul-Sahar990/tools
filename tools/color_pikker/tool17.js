const imageInput = document.getElementById("imageInput");
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d");
    const colorInfo = document.getElementById("colorInfo");
    const colorPreview = document.getElementById("colorPreview");
    const hexValue = document.getElementById("hexValue");
    const rgbValue = document.getElementById("rgbValue");
    const dropZone = document.getElementById("dropZone");
    const copyMsg = document.getElementById("copyMsg");

    // Click to select
    dropZone.addEventListener("click", () => imageInput.click());

    // Drag styling
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("bg-info-subtle");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("bg-info-subtle");
    });

    // Drop image
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("bg-info-subtle");
      const file = e.dataTransfer.files[0];
      if (file) handleImage(file);
    });

    // File selected
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleImage(file);
    });

    function handleImage(file) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.add("hidden");
      colorInfo.classList.add("hidden");
      colorPreview.style.backgroundColor = "transparent";
      hexValue.textContent = "";
      rgbValue.textContent = "";
      copyMsg.style.display = "none";

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          canvas.classList.remove("hidden");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // Color Picker Logic
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      const hex = "#" + [pixel[0], pixel[1], pixel[2]]
        .map(x => x.toString(16).padStart(2, '0'))
        .join("");

      colorPreview.style.backgroundColor = hex;
      rgbValue.textContent = rgb;
      hexValue.textContent = hex;
      colorInfo.classList.remove("hidden");

      // Copy HEX
      navigator.clipboard.writeText(hex).then(() => {
        copyMsg.style.display = "block";
        setTimeout(() => copyMsg.style.display = "none", 2000);
      });
    });
    // Copy HEX on click
hexValue.addEventListener("click", () => {
  const text = hexValue.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`HEX color ${text} copied to clipboard!`);
    });
  }
});

// Copy RGB on click
rgbValue.addEventListener("click", () => {
  const text = rgbValue.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`RGB color ${text} copied to clipboard!`);
    });
  }
});
