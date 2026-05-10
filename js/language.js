function getVisibleAnchorForLanguageSwitch() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const mobileContact = document.querySelector("#contact-mobile-start");

    if (mobileContact) {
      const rect = mobileContact.getBoundingClientRect();
      const isContactVisible =
        rect.top < window.innerHeight * 0.65 && rect.bottom > 0;

      if (isContactVisible) {
        return "#contact-mobile-start";
      }
    }

    const sections = [...document.querySelectorAll("main > section[id]")];
    let bestSection = null;
    let bestDistance = Infinity;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const distance = Math.abs(rect.top - 104);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestSection = section;
      }
    });

    return bestSection ? `#${bestSection.id}` : "";
  }

  const main = document.querySelector("main");
  const mainLeft = main ? main.getBoundingClientRect().left : 0;
  const sections = [...document.querySelectorAll("main > section[id]")];
  let bestSection = null;
  let bestDistance = Infinity;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.left - mainLeft);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestSection = section;
    }
  });

  if (bestSection && bestSection.id === "contact") {
    const desktopForm = document.querySelector("#contact-form-desktop");

    if (desktopForm) {
      const formRect = desktopForm.getBoundingClientRect();
      const sectionRect = bestSection.getBoundingClientRect();
      const formIsCloser =
        Math.abs(formRect.left - mainLeft) <
        Math.abs(sectionRect.left - mainLeft);

      if (formIsCloser) {
        return "#contact";
      }
    }
  }

  return bestSection ? `#${bestSection.id}` : "";
}

function setupLanguageAnchorPreservation() {
  const languageLinks = document.querySelectorAll("[data-lang-link]");

  languageLinks.forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        const href = link.getAttribute("href");
        if (!href) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const anchor = getVisibleAnchorForLanguageSwitch();
        const nextUrl = new URL(href, window.location.href);

        if (anchor) {
          nextUrl.hash = anchor;
        }

        window.location.href = nextUrl.toString();
      },
      true
    );
  });
}

document.addEventListener("DOMContentLoaded", setupLanguageAnchorPreservation);