AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

const passwordText = document.getElementById('passwordText');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const includeUppercase = document.getElementById('includeUppercase');
const includeLowercase = document.getElementById('includeLowercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const generateButton = document.getElementById('generateButton');
const clearButton = document.getElementById('clearButton');

function generatePassword() {
  const length = parseInt(lengthRange.value);
  const hasUppercase = includeUppercase.checked;
  const hasLowercase = includeLowercase.checked;
  const hasNumbers = includeNumbers.checked;
  const hasSymbols = includeSymbols.checked;

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';

  let charPool = '';
  if (hasUppercase) charPool += uppercaseChars;
  if (hasLowercase) charPool += lowercaseChars;
  if (hasNumbers) charPool += numberChars;
  if (hasSymbols) charPool += symbolChars;

  if (charPool.length === 0) {
    passwordText.textContent = 'Please select at least one character type!';
    return;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charPool.length);
    password += charPool[index];
  }
  passwordText.textContent = password;
}

lengthRange.addEventListener('input', () => {
  lengthValue.textContent = lengthRange.value;
});

generateButton.addEventListener('click', generatePassword);

clearButton.addEventListener('click', () => {
  passwordText.textContent = 'Your password will appear here';
  lengthRange.value = 16;
  lengthValue.textContent = 16;
  includeUppercase.checked = true;
  includeLowercase.checked = true;
  includeNumbers.checked = true;
  includeSymbols.checked = true;
});
