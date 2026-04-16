function setupFormValidation(formSelector, checkboxSelector, buttonSelector) {
  const form = document.querySelector(formSelector);
  const checkbox = document.querySelector(checkboxSelector);
  const button = document.querySelector(buttonSelector);

  if (!form || !checkbox || !button) return;

  const fields = getFormFields(form);
  const classes = getErrorClasses(formSelector);
  saveDefaultPlaceholders(fields);

  bindFieldEvents(fields, form, classes, button, checkbox);
  bindCheckboxEvents(checkbox, fields, button);
  bindSubmitEvent(form, fields, checkbox, button, classes);
  updateButtonState(fields, checkbox, button);
}

function getFormFields(form) {
  return [...form.querySelectorAll("input[name], textarea[name]")];
}

function getErrorClasses(formSelector) {
  const isDesktop = formSelector === ".contact__form";

  return {
    input: isDesktop ? "contact__input--error" : "contactMobile__input--error",
    textarea: isDesktop
      ? "contact__textarea--error"
      : "contactMobile__textarea--error",
  };
}

function saveDefaultPlaceholders(fields) {
  fields.forEach((field) => {
    if (!field.dataset.defaultPlaceholder) {
      field.dataset.defaultPlaceholder = field.placeholder || "";
    }
  });
}

function getValidator(name) {
  const validators = {
    name: validateName,
    email: validateEmail,
    message: validateMessage,
  };

  return validators[name];
}

function validateName(value) {
  const text = value.trim();

  if (!text) return "Please enter your name";
  if (text.length < 2) return "Name must have 2+ characters";
  if (!/^[a-zA-ZÀ-ÿ' -]+$/.test(text)) return "Please use letters only";

  return "";
}

function validateEmail(value) {
  const text = value.trim();

  if (!text) return "Please enter your e-mail";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
    return "Please enter a valid e-mail";
  }

  return "";
}

function validateMessage(value) {
  const text = value.trim();

  if (!text) return "Please enter your message";
  if (text.length < 10) return "Message must have 10+ characters";

  return "";
}

function getErrorClass(field, classes) {
  return field.tagName === "TEXTAREA" ? classes.textarea : classes.input;
}

function showFieldError(field, message, classes) {
  field.classList.add(getErrorClass(field, classes));
  field.value = "";
  field.placeholder = message;
}

function clearFieldError(field, classes) {
  field.classList.remove(classes.input, classes.textarea);
  field.placeholder = field.dataset.defaultPlaceholder || "";
}

function validateField(field, classes, mode = "live") {
  const validator = getValidator(field.name);
  const message = validator ? validator(field.value) : "";

  if (!message) {
    clearFieldError(field, classes);
    return true;
  }

  if (mode === "blur" || mode === "submit") {
    showFieldError(field, message, classes);
  }

  return false;
}

function isPolicyAccepted(checkbox) {
  return checkbox.checked;
}

function updateButtonState(fields, checkbox, button) {
  const fieldsAreValid = fields.every((field) => {
    const validator = getValidator(field.name);
    return validator ? !validator(field.value) : true;
  });

  button.disabled = !(fieldsAreValid && isPolicyAccepted(checkbox));
}

function handleFieldFocus(field, classes) {
  clearFieldError(field, classes);
}

function handleFieldInput(field, fields, checkbox, button, classes) {
  clearFieldError(field, classes);
  updateButtonState(fields, checkbox, button);
}

function handleFieldBlur(field, fields, checkbox, button, classes) {
  validateField(field, classes, "blur");
  updateButtonState(fields, checkbox, button);
}

function bindFieldEvents(fields, form, classes, button, checkbox) {
  fields.forEach((field) => {
    field.addEventListener("focus", () => {
      handleFieldFocus(field, classes);
    });

    field.addEventListener("input", () => {
      handleFieldInput(field, fields, checkbox, button, classes);
    });

    field.addEventListener("blur", () => {
      handleFieldBlur(field, fields, checkbox, button, classes);
    });
  });
}

function bindCheckboxEvents(checkbox, fields, button) {
  checkbox.addEventListener("change", () => {
    updateButtonState(fields, checkbox, button);
  });
}

function bindSubmitEvent(form, fields, checkbox, button, classes) {
  form.addEventListener("submit", (event) => {
    const fieldsAreValid = fields.every((field) => {
      return validateField(field, classes, "submit");
    });

    if (!fieldsAreValid || !isPolicyAccepted(checkbox)) {
      event.preventDefault();
    }

    updateButtonState(fields, checkbox, button);
  });
}