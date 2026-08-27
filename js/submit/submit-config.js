(() => {
  const contactEndpoint = getContactEndpoint();
  const isLocalDevelopment = isLocalHost();

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

  const SUBMIT_MESSAGES = {
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

  window.PortfolioSubmitConfig = {
    forms,
    contactEndpoint,
    isLocalDevelopment,
    getMessages,
  };

  /** Builds the contact endpoint URL. */
  function getContactEndpoint() {
    return "https://naranjo.io/contact_form_mail.php";
  }

  /** Checks local development hostnames. */
  function isLocalHost() {
    return (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    );
  }

  /** Gets the current language key. */
  function getLanguageKey() {
    const language = document.documentElement.lang || "en";

    return language.slice(0, 2).toLowerCase();
  }

  /** Gets localized submit messages. */
  function getMessages() {
    const language = getLanguageKey();

    return SUBMIT_MESSAGES[language] || SUBMIT_MESSAGES.en;
  }
})();