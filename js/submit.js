// js/submit.js
import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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

forms.forEach(({ formSelector, checkboxSelector, buttonSelector, source }) => {
  const form = document.querySelector(formSelector);
  const checkbox = document.querySelector(checkboxSelector);
  const button = document.querySelector(buttonSelector);

  if (!form || !checkbox || !button) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const submission = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      source,
      createdAt: serverTimestamp(),
    };

    if (!isValidSubmission(submission) || !checkbox.checked) {
      return;
    }

    try {
      button.disabled = true;
      button.textContent = "Sending...";

      await addDoc(collection(db, "contacts"), submission);

      form.reset();
      checkbox.checked = false;
      button.textContent = "Sent!";
    } catch (error) {
      console.error("Error sending message:", error);
      button.textContent = "Error";
    } finally {
      setTimeout(() => {
        button.textContent = "Send";
        button.disabled = true;
      }, 2000);
    }
  });
});

function isValidSubmission({ name, email, message }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return (
    name.length >= 2 &&
    /^[a-zA-ZÀ-ÿ' -]+$/.test(name) &&
    emailRegex.test(email) &&
    message.length >= 10
  );
}