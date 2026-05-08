function getMessages() {
  const language = document.documentElement.lang || "en";
  const shortLanguage = language.slice(0, 2).toLowerCase();

  const messages = {
    en: {
      nameRequired: "Your name is required",
      nameShort: "Name must have 2+ characters",
      nameInvalid: "Please use letters only",
      emailRequired: "Your e-mail is required",
      emailInvalid: "Please enter a valid e-mail",
      messageRequired: "Your message is required",
      messageShort: "Message must have 10+ characters",
      policyRequired: "Please agree to the privacy policy",
    },

    es: {
      nameRequired: "Tu nombre es obligatorio",
      nameShort: "El nombre debe tener al menos 2 caracteres",
      nameInvalid: "Por favor, usa solo letras",
      emailRequired: "Tu correo electrónico es obligatorio",
      emailInvalid: "Introduce un correo electrónico válido",
      messageRequired: "Tu mensaje es obligatorio",
      messageShort: "El mensaje debe tener al menos 10 caracteres",
      policyRequired: "Acepta la política de privacidad",
    },

    de: {
      nameRequired: "Dein Name ist erforderlich",
      nameShort: "Der Name muss mindestens 2 Zeichen haben",
      nameInvalid: "Bitte verwende nur Buchstaben",
      emailRequired: "Deine E-Mail ist erforderlich",
      emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein",
      messageRequired: "Deine Nachricht ist erforderlich",
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

  form.setAttribute("novalidate", "");

  const fields = getFormFields(form);
  const classes = getErrorClasses(formSelector);

  prepareFields(fields);
  bindFieldEvents(fields, classes, checkbox, button);
  bindCheckboxEvents(checkbox, fields, button);
  bindSubmitEvent(form, fields, checkbox, button, classes);

  updateButtonState(fields, checkbox, button);
}

function getFormFields(form) {
  return [...form.querySelectorAll("input[name], textarea[name]")];
}

function prepareFields(fields) {
  fields.forEach((field) => {
    field.dataset.defaultPlaceholder = field.getAttribute("placeholder") || "";
    field.setAttribute("aria-invalid", "false");
  });
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

function getErrorClass(field, classes) {
  return field.tagName === "TEXTAREA" ? classes.textarea : classes.input;
}

function restorePlaceholder(field) {
  field.setAttribute("placeholder", field.dataset.defaultPlaceholder || "");
}

function getFieldValidationValue(field) {
  if (
    field.dataset.isShowingError === "true" &&
    typeof field.dataset.userValue === "string"
  ) {
    return field.dataset.userValue;
  }

  return field.value;
}

function setFieldError(field, message, classes) {
  const currentValue = getFieldValidationValue(field);

  field.classList.add(getErrorClass(field, classes));
  field.dataset.errorMessage = message;
  field.setAttribute("aria-invalid", "true");

  if (currentValue.trim()) {
    if (field.dataset.isShowingError !== "true") {
      field.dataset.userValue = field.value;
    }

    field.dataset.isShowingError = "true";
    field.value = message;
    restorePlaceholder(field);
    return;
  }

  field.value = "";
  delete field.dataset.userValue;
  delete field.dataset.isShowingError;
  field.setAttribute("placeholder", message);
}

function clearFieldError(field, classes) {
  field.classList.remove(classes.input, classes.textarea);
  delete field.dataset.errorMessage;
  delete field.dataset.userValue;
  delete field.dataset.isShowingError;
  field.setAttribute("aria-invalid", "false");
  restorePlaceholder(field);
}

function validateField(field, classes) {
  const validator = getValidator(field.name);
  const value = getFieldValidationValue(field);
  const message = validator ? validator(value) : "";

  if (!message) {
    clearFieldError(field, classes);
    return true;
  }

  setFieldError(field, message, classes);
  return false;
}

function validateAllFields(fields, classes) {
  let allValid = true;

  fields.forEach((field) => {
    const fieldIsValid = validateField(field, classes);

    if (!fieldIsValid) {
      allValid = false;
    }
  });

  return allValid;
}

function isPolicyAccepted(checkbox) {
  return checkbox.checked;
}

function areFieldsValid(fields) {
  return fields.every((field) => {
    const validator = getValidator(field.name);
    const value = getFieldValidationValue(field);

    return validator ? !validator(value) : true;
  });
}

function updateButtonState(fields, checkbox, button) {
  button.disabled = !(areFieldsValid(fields) && isPolicyAccepted(checkbox));
}

function handleFieldFocus(field, classes) {
  if (
    field.dataset.isShowingError === "true" &&
    typeof field.dataset.userValue === "string"
  ) {
    field.value = field.dataset.userValue;
  }

  clearFieldError(field, classes);
}

function handleFieldInput(fields, checkbox, button) {
  updateButtonState(fields, checkbox, button);
}

function handleFieldBlur(field, fields, checkbox, button, classes) {
  validateField(field, classes);
  updateButtonState(fields, checkbox, button);
}

function bindFieldEvents(fields, classes, checkbox, button) {
  fields.forEach((field) => {
    field.addEventListener("focus", () => {
      handleFieldFocus(field, classes);
    });

    field.addEventListener("input", () => {
      handleFieldInput(fields, checkbox, button);
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
    const fieldsAreValid = validateAllFields(fields, classes);
    const policyAccepted = isPolicyAccepted(checkbox);

    if (!fieldsAreValid || !policyAccepted) {
      event.preventDefault();

      const firstInvalidField = fields.find((field) => {
        const validator = getValidator(field.name);
        const value = getFieldValidationValue(field);

        return validator ? validator(value) : false;
      });

      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else if (!policyAccepted) {
        checkbox.focus();
      }
    }

    updateButtonState(fields, checkbox, button);
  });
}