const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const transcribedText = document.getElementById("transcribedText");
const colorInfo = document.getElementById("colorInfo");
const copyMsg = document.getElementById("copyMsg");

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';

  recognition.onresult = function (event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript + ' ';
    }
    transcribedText.textContent = transcript.trim();
    colorInfo.classList.remove("hidden");

    navigator.clipboard.writeText(transcript).then(() => {
      copyMsg.style.display = "block";
      setTimeout(() => copyMsg.style.display = "none", 2000);
    });
  };

  recognition.onerror = function (event) {
    alert('Speech recognition error: ' + event.error);
  };
} else {
  alert("Speech Recognition is not supported in your browser.");
}

startBtn.addEventListener("click", () => {
  if (!isRecording && recognition) {
    recognition.start();
    isRecording = true;
    transcribedText.textContent = "";
    colorInfo.classList.add("hidden");
    copyMsg.style.display = "none";
    startBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");
  }
});

stopBtn.addEventListener("click", () => {
  if (isRecording && recognition) {
    recognition.stop();
    isRecording = false;
    stopBtn.classList.add("hidden");
    startBtn.classList.remove("hidden");
  }
});
