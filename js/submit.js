// js/submit.js
(() => {
  const scriptUrl = document.currentScript?.src || "";
  const contactEndpoint = scriptUrl
    ? new URL("../contact_form_mail.php", scriptUrl).href
    : "contact_form_mail.php";

  const forms = [
    {
      formSelector: ".contact__form",
      checkboxSelector: "#contactPolicy",
      buttonSelector: ".contact__submit",
      source: "desktop-contact-form",
    },
    {
      formSelector: "#contact-form-mobile",
      checkboxSelector: "#contactMobilePolicy",
      buttonSelector: ".contactMobile__submit",
      source: "mobile-contact-form",
    },
  ];

  function getMessages() {
    const language = document.documentElement.lang || "en";
    const shortLanguage = language.slice(0, 2).toLowerCase();

    const messages = {
      en: {
        sending: "Sending...",
        sent: "Sent!",
        error: "Error",
      },
      de: {
        sending: "Wird gesendet...",
        sent: "Gesendet!",
        error: "Fehler",
      },
      es: {
        sending: "Enviando...",
        sent: "¡Enviado!",
        error: "Error",
      },
    };

    return messages[shortLanguage] || messages.en;
  }

  function getDefaultButtonText(button) {
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent.trim() || "Send";
    }

    return button.dataset.defaultText;
  }

  function setButtonText(button, text) {
    button.textContent = text;
  }

  function getSubmission(form, source) {
    const formData = new FormData(form);

    return {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      source,
    };
  }

  function isValidSubmission({ name, email, message }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return (
      name.length >= 2 &&
      /^[a-zA-ZÀ-ÿ' -]+$/.test(name) &&
      emailRegex.test(email) &&
      message.length >= 10
    );
  }

  async function sendSubmission(submission) {
    const response = await fetch(contactEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Contact form request failed");
    }

    return result;
  }

  function setupContactForm({ formSelector, checkboxSelector, buttonSelector, source }) {
    const form = document.querySelector(formSelector);
    const checkbox = document.querySelector(checkboxSelector);
    const button = document.querySelector(buttonSelector);

    if (!form || !checkbox || !button) return;

    const messages = getMessages();
    const defaultButtonText = getDefaultButtonText(button);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submission = getSubmission(form, source);

      if (!isValidSubmission(submission) || !checkbox.checked) {
        return;
      }

      try {
        button.disabled = true;
        setButtonText(button, messages.sending);

        await sendSubmission(submission);

        form.reset();
        checkbox.checked = false;
        setButtonText(button, messages.sent);
      } catch (error) {
        console.error("Error sending message:", error);
        setButtonText(button, messages.error);
      } finally {
        window.setTimeout(() => {
          setButtonText(button, defaultButtonText);
          button.disabled = true;
        }, 2000);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    forms.forEach(setupContactForm);
  });
})();
