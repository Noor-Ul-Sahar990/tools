 const imageInput = document.getElementById("imageInput");
    const preview = document.getElementById("preview");
    const removeBtn = document.getElementById("removeBgBtn");
    const resultImage = document.getElementById("resultImage");
    const output = document.getElementById("output-image");
    const downloadBtn = document.getElementById("downloadBtn");
    const buttonText = removeBtn.querySelector(".button-text");
    const spinner = removeBtn.querySelector(".spinner-border");

    let selectedFile;

    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Preview Image" />`;
        };
        reader.readAsDataURL(file);
        removeBtn.disabled = false;
        output.style.display = "none";
      }
    });

    removeBtn.addEventListener("click", async function () {
      if (!selectedFile) return;
      buttonText.classList.add("d-none");
      spinner.classList.remove("d-none");
      removeBtn.disabled = true;

      const formData = new FormData();
      formData.append("image_file", selectedFile);
      formData.append("size", "auto");

      try {
        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": "xWsWbt3MCx92GKd4QwBY12JU"
          },
          body: formData
        });

        if (!response.ok) {
          alert("Error: " + response.statusText);
          return;
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        resultImage.src = imageUrl;
        downloadBtn.href = imageUrl;
        output.style.display = "block";
      } catch (err) {
        alert("An error occurred while removing background.");
      } finally {
        buttonText.classList.remove("d-none");
        spinner.classList.add("d-none");
        removeBtn.disabled = false;
      }
    });