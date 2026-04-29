document.addEventListener("DOMContentLoaded", () => {
  const languageLinks = document.querySelectorAll("[data-lang-link]");
  const sectionIds = ["home", "why-me", "skills", "my-work", "contact"];

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function getCurrentSectionId() {
    let currentSection = "home";
    let smallestDistance = Infinity;

    sectionIds.forEach((sectionId) => {
      const section = document.getElementById(sectionId);

      if (!section) return;

      const rect = section.getBoundingClientRect();

      const sectionCenter = isMobileView()
        ? rect.top + rect.height / 2
        : rect.left + rect.width / 2;

      const viewportCenter = isMobileView()
        ? window.innerHeight / 2
        : window.innerWidth / 2;

      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        currentSection = sectionId;
      }
    });

    return currentSection;
  }

  function scrollToHashSection() {
    if (!window.location.hash) return;

    const target = document.querySelector(window.location.hash);

    if (!target) return;

    setTimeout(() => {
      target.scrollIntoView({
        behavior: "auto",
        block: "start",
        inline: "start",
      });
    }, 50);
  }

  languageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const targetUrl = new URL(link.getAttribute("href"), window.location.href);
      const currentSectionId = getCurrentSectionId();

      targetUrl.hash = currentSectionId;
      window.location.href = targetUrl.toString();
    });
  });

  scrollToHashSection();
});