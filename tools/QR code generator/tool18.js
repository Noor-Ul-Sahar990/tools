function generateQRCode() {
  const qrText = document.getElementById("qrText").value.trim();
  const qrBox = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("downloadBtn");

  if (!qrText) return alert("Please enter some text or a URL");

  // Clear old QR
  qrBox.innerHTML = "";

  // Generate new QR
  const qr = new QRCode(qrBox, {
    text: qrText,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // Wait for image to render
  setTimeout(() => {
    const img = qrBox.querySelector("img");
    if (img) {
      downloadBtn.href = img.src;
      downloadBtn.classList.remove("hidden");
    }
  }, 300);
}
