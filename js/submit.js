(() => {
  const scriptUrl = document.currentScript?.src || "";
  const contactEndpoint = scriptUrl
    ? new URL("../contact_form_mail.php", scriptUrl).href
    : "contact_form_mail.php";

  const isLocalDevelopment =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost";

  let formOverlayTimeoutId = null;

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
        overlayTitle: "Message sent!",
        overlayText:
          "Thank you for your message. I will get back to you as soon as possible.",
        overlayClose: "Close confirmation",
      },
      de: {
        sending: "Wird gesendet...",
        sent: "Gesendet!",
        error: "Fehler",
        overlayTitle: "Nachricht gesendet!",
        overlayText:
          "Vielen Dank für deine Nachricht. Ich melde mich so schnell wie möglich zurück.",
        overlayClose: "Bestätigung schließen",
      },
      es: {
        sending: "Enviando...",
        sent: "¡Enviado!",
        error: "Error",
        overlayTitle: "¡Mensaje enviado!",
        overlayText:
          "Gracias por tu mensaje. Me pondré en contacto contigo lo antes posible.",
        overlayClose: "Cerrar confirmación",
      },
    };

    return messages[shortLanguage] || messages.en;
  }

  function getOverlayElements() {
    const overlay = document.getElementById("formOverlay");

    if (!overlay) {
      return null;
    }

    return {
      overlay,
      title: overlay.querySelector("#formOverlayTitle"),
      text: overlay.querySelector(".formOverlay__text"),
      closeButton:
        overlay.querySelector("#formOverlayClose") ||
        overlay.querySelector(".formOverlay__close"),
    };
  }

  function updateOverlayLanguage() {
    const elements = getOverlayElements();

    if (!elements) return;

    const messages = getMessages();

    if (elements.title) {
      elements.title.textContent = messages.overlayTitle;
    }

    if (elements.text) {
      elements.text.textContent = messages.overlayText;
    }

    if (elements.closeButton) {
      elements.closeButton.setAttribute("aria-label", messages.overlayClose);
    }
  }

  function openFormOverlay() {
    const elements = getOverlayElements();

    if (!elements) {
      console.warn("Form overlay markup was not found in the HTML.");
      return;
    }

    updateOverlayLanguage();

    elements.overlay.classList.add("formOverlay--active");
    elements.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("body--noScroll");

    if (formOverlayTimeoutId) {
      window.clearTimeout(formOverlayTimeoutId);
    }

    formOverlayTimeoutId = window.setTimeout(() => {
      closeFormOverlay();
    }, 1500);
  }

  function closeFormOverlay() {
    const elements = getOverlayElements();

    if (!elements) return;

    if (formOverlayTimeoutId) {
      window.clearTimeout(formOverlayTimeoutId);
      formOverlayTimeoutId = null;
    }

    elements.overlay.classList.remove("formOverlay--active");
    elements.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("body--noScroll");
  }

  function bindOverlayEvents() {
    const elements = getOverlayElements();

    if (!elements || elements.overlay.dataset.bound === "true") {
      return;
    }

    elements.overlay.dataset.bound = "true";

    elements.overlay.addEventListener("click", (event) => {
      const clickedBackdrop = event.target === elements.overlay;
      const clickedCloseButton =
        event.target.closest("#formOverlayClose") ||
        event.target.closest(".formOverlay__close");

      if (clickedBackdrop || clickedCloseButton) {
        closeFormOverlay();
      }
    });
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
    const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;

    return (
      name.length >= 2 &&
      nameRegex.test(name) &&
      emailRegex.test(email) &&
      message.length >= 10
    );
  }

  async function sendSubmission(submission) {
    if (isLocalDevelopment) {
      console.info("Local development mode: PHP mail request skipped.", submission);

      await new Promise((resolve) => window.setTimeout(resolve, 400));

      return {
        success: true,
        message: "Local development confirmation simulated.",
      };
    }

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

  function setupContactForm({
    formSelector,
    checkboxSelector,
    buttonSelector,
    source,
  }) {
    const form = document.querySelector(formSelector);
    const checkbox = document.querySelector(checkboxSelector);
    const button = document.querySelector(buttonSelector);

    if (!form || !checkbox || !button) return;

    const messages = getMessages();
    const defaultButtonText = getDefaultButtonText(button);

    button.disabled = !checkbox.checked;

    checkbox.addEventListener("change", () => {
      button.disabled = !checkbox.checked;
    });

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
        openFormOverlay();
      } catch (error) {
        console.error("Error sending message:", error);
        setButtonText(button, messages.error);
      } finally {
        window.setTimeout(() => {
          setButtonText(button, defaultButtonText);
          button.disabled = !checkbox.checked;
        }, 2000);
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFormOverlay();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    bindOverlayEvents();
    updateOverlayLanguage();
    forms.forEach(setupContactForm);
  });
})();