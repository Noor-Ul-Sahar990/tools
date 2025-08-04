const formContainer = document.getElementById("formContainer");
const htmlOutput = document.getElementById("htmlOutput");

function addField(type) {
  let input = document.createElement("input");
  input.className = "form-control";
  input.style.marginBottom = "10px";

  switch (type) {
    case "text":
      input.type = "text";
      input.placeholder = "Enter text";
      break;
    case "email":
      input.type = "email";
      input.placeholder = "Enter email";
      break;
    case "number":
      input.type = "number";
      input.placeholder = "Enter number";
      break;
    case "password":
      input.type = "password";
      input.placeholder = "Enter password";
      break;
    case "submit":
      input.type = "submit";
      input.className = "btn btn-primary mt-2";
      input.value = "Submit";
      break;
  }

  formContainer.appendChild(input);
}

function clearForm() {
  formContainer.innerHTML = "";
  htmlOutput.value = "";
}

function exportForm() {
  htmlOutput.value = formContainer.innerHTML;
}
