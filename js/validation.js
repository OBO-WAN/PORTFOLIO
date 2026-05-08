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
      policyRequired: "Please accept the privacy policy.",
    },

    es: {
      nameRequired: "Tu nombre es obligatorio",
      nameShort: "El nombre debe tener al menos 2 caracteres",
      nameInvalid: "Por favor, usa solo letras",
      emailRequired: "Tu correo electrónico es obligatorio",
      emailInvalid: "Introduce un correo electrónico válido",
      messageRequired: "Tu mensaje es obligatorio",
      messageShort: "El mensaje debe tener al menos 10 caracteres",
      policyRequired: "Acepta la política de privacidad.",
    },

    de: {
      nameRequired: "Dein Name ist erforderlich",
      nameShort: "Der Name muss mindestens 2 Zeichen haben",
      nameInvalid: "Bitte verwende nur Buchstaben",
      emailRequired: "Deine E-Mail ist erforderlich",
      emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein",
      messageRequired: "Deine Nachricht ist erforderlich",
      messageShort: "Die Nachricht muss mindestens 10 Zeichen haben",
      policyRequired: "Bitte akzeptiere die Datenschutzerklärung.",
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
  const classes = getFormClasses(formSelector);
  const privacyLabel = getPrivacyLabel(checkbox);

  prepareFields(fields);
  preparePrivacy(checkbox, privacyLabel);
  bindFieldEvents(fields, classes, checkbox, button);
  bindCheckboxEvents(checkbox, privacyLabel, fields, button, classes);
  bindSubmitEvent(form, fields, checkbox, privacyLabel, button, classes);
  bindResetEvent(form, fields, checkbox, privacyLabel, button, classes);

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

function getPrivacyLabel(checkbox) {
  return checkbox.closest("label");
}

function preparePrivacy(checkbox, privacyLabel) {
  checkbox.setAttribute("aria-invalid", "false");

  if (privacyLabel) {
    privacyLabel.removeAttribute("data-error-message");
  }
}

function getFormClasses(formSelector) {
  const isDesktop = formSelector === ".contact__form";

  return {
    inputError: isDesktop
      ? "contact__input--error"
      : "contactMobile__input--error",
    textareaError: isDesktop
      ? "contact__textarea--error"
      : "contactMobile__textarea--error",
    inputValid: isDesktop
      ? "contact__input--valid"
      : "contactMobile__input--valid",
    textareaValid: isDesktop
      ? "contact__textarea--valid"
      : "contactMobile__textarea--valid",
    privacyError: isDesktop
      ? "contact__privacy--error"
      : "contactMobile__privacy--error",
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
  return field.tagName === "TEXTAREA"
    ? classes.textareaError
    : classes.inputError;
}

function getValidClass(field, classes) {
  return field.tagName === "TEXTAREA"
    ? classes.textareaValid
    : classes.inputValid;
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

function removeFieldStateClasses(field, classes) {
  field.classList.remove(
    classes.inputError,
    classes.textareaError,
    classes.inputValid,
    classes.textareaValid
  );
}

function setFieldError(field, message, classes) {
  const currentValue = getFieldValidationValue(field);

  removeFieldStateClasses(field, classes);
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

function clearFieldState(field, classes) {
  removeFieldStateClasses(field, classes);
  delete field.dataset.errorMessage;
  delete field.dataset.userValue;
  delete field.dataset.isShowingError;
  field.setAttribute("aria-invalid", "false");
  restorePlaceholder(field);
}

function setFieldValid(field, classes) {
  removeFieldStateClasses(field, classes);
  field.classList.add(getValidClass(field, classes));
  field.setAttribute("aria-invalid", "false");
  restorePlaceholder(field);
}

function validateField(field, classes) {
  const validator = getValidator(field.name);
  const value = getFieldValidationValue(field);
  const message = validator ? validator(value) : "";

  if (!message) {
    if (value.trim()) {
      setFieldValid(field, classes);
    } else {
      clearFieldState(field, classes);
    }

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

function setPrivacyError(checkbox, privacyLabel, classes) {
  const messages = getMessages();

  checkbox.setAttribute("aria-invalid", "true");

  if (privacyLabel) {
    privacyLabel.classList.add(classes.privacyError);
    privacyLabel.dataset.errorMessage = messages.policyRequired;
  }
}

function clearPrivacyError(checkbox, privacyLabel, classes) {
  checkbox.setAttribute("aria-invalid", "false");

  if (privacyLabel) {
    privacyLabel.classList.remove(classes.privacyError);
    privacyLabel.removeAttribute("data-error-message");
  }
}

function validatePrivacy(checkbox, privacyLabel, classes) {
  if (isPolicyAccepted(checkbox)) {
    clearPrivacyError(checkbox, privacyLabel, classes);
    return true;
  }

  setPrivacyError(checkbox, privacyLabel, classes);
  return false;
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

  clearFieldState(field, classes);
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

function bindCheckboxEvents(checkbox, privacyLabel, fields, button, classes) {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      clearPrivacyError(checkbox, privacyLabel, classes);
    } else {
      validatePrivacy(checkbox, privacyLabel, classes);
    }

    updateButtonState(fields, checkbox, button);
  });

  checkbox.addEventListener("blur", () => {
    validatePrivacy(checkbox, privacyLabel, classes);
    updateButtonState(fields, checkbox, button);
  });
}

function bindSubmitEvent(
  form,
  fields,
  checkbox,
  privacyLabel,
  button,
  classes
) {
  form.addEventListener("submit", (event) => {
    const fieldsAreValid = validateAllFields(fields, classes);
    const policyAccepted = validatePrivacy(checkbox, privacyLabel, classes);

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

function bindResetEvent(form, fields, checkbox, privacyLabel, button, classes) {
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      fields.forEach((field) => {
        clearFieldState(field, classes);
      });

      clearPrivacyError(checkbox, privacyLabel, classes);
      updateButtonState(fields, checkbox, button);
    }, 0);
  });
}