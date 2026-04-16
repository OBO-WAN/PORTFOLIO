function getMessages() {
  const language = document.documentElement.lang || "en";
  const shortLanguage = language.slice(0, 2).toLowerCase();

  const messages = {
    en: {
      nameRequired: "Please enter your name",
      nameShort: "Name must have 2+ characters",
      nameInvalid: "Please use letters only",
      emailRequired: "Please enter your e-mail",
      emailInvalid: "Please enter a valid e-mail",
      messageRequired: "Please enter your message",
      messageShort: "Message must have 10+ characters",
      policyRequired: "Please agree to the privacy policy",
    },

    es: {
      nameRequired: "Por favor, escribe tu nombre",
      nameShort: "El nombre debe tener al menos 2 caracteres",
      nameInvalid: "Por favor, usa solo letras",
      emailRequired: "Por favor, escribe tu correo electrónico",
      emailInvalid: "Por favor, escribe un correo electrónico válido",
      messageRequired: "Por favor, escribe tu mensaje",
      messageShort: "El mensaje debe tener al menos 10 caracteres",
      policyRequired: "Por favor, acepta la política de privacidad",
    },

    de: {
      nameRequired: "Bitte gib deinen Namen ein",
      nameShort: "Der Name muss mindestens 2 Zeichen haben",
      nameInvalid: "Bitte verwende nur Buchstaben",
      emailRequired: "Bitte gib deine E-Mail-Adresse ein",
      emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein",
      messageRequired: "Bitte gib deine Nachricht ein",
      messageShort: "Die Nachricht muss mindestens 10 Zeichen haben",
      policyRequired: "Bitte akzeptiere die Datenschutzerklärung",
    },
  };

  return messages[shortLanguage] || messages.en;
}


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
  const messages = getMessages();

  if (!text) return messages.nameRequired;
  if (text.length < 2) return messages.nameShort;
  if (!/^[a-zA-ZÀ-ÿ' -]+$/.test(text)) return messages.nameInvalid;

  return "";
}

function validateEmail(value) {
  const text = value.trim();
  const messages = getMessages();

  if (!text) return messages.emailRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
    return messages.emailInvalid;
  }

  return "";
}

function validateMessage(value) {
  const text = value.trim();
  const messages = getMessages();

  if (!text) return messages.messageRequired;
  if (text.length < 10) return messages.messageShort;

  return "";
}

function getPolicyMessage() {
  const messages = getMessages();
  return messages.policyRequired;
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