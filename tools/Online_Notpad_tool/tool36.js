const notepad = document.getElementById('notepad');
const saveBtn = document.getElementById('saveNote');
const copyBtn = document.getElementById('copyNote');
const clearBtn = document.getElementById('clearNote');

// Load saved note on page load
window.onload = () => {
  const savedNote = localStorage.getItem('onlineNotepad');
  if (savedNote) notepad.value = savedNote;
};

// Save note
saveBtn.addEventListener('click', () => {
  localStorage.setItem('onlineNotepad', notepad.value);
  alert('✅ Note saved successfully!');
});

// Copy note
copyBtn.addEventListener('click', () => {
  if (!notepad.value) {
    alert("⚠️ Nothing to copy!");
    return;
  }
  navigator.clipboard.writeText(notepad.value)
    .then(() => alert("📋 Note copied to clipboard!"));
});

// Clear note
clearBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the note?")) {
    notepad.value = '';
    localStorage.removeItem('onlineNotepad');
  }
});