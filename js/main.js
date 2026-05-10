const mobileToggle = document.querySelector(".mobileBar__toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileMenuLinks = document.querySelectorAll(".mobileMenu__link");

function isMenuOpen() {
  return document.body.classList.contains("menu-open");
}

function setMenuState(open) {
  document.body.classList.toggle("menu-open", open);

  if (mobileToggle) {
    mobileToggle.setAttribute("aria-expanded", String(open));
  }
}

function closeMenu() {
  setMenuState(false);
}

function toggleMenu() {
  setMenuState(!isMenuOpen());
}

function handleToggleClick(event) {
  event.stopPropagation();
  toggleMenu();
}

function handleOutsideClick(event) {
  if (!isMenuOpen()) return;
  if (mobileMenu && mobileMenu.contains(event.target)) return;
  if (mobileToggle && mobileToggle.contains(event.target)) return;

  closeMenu();
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

function initMobileMenu() {
  if (!mobileToggle || !mobileMenu) return;

  mobileToggle.addEventListener("click", handleToggleClick);

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
}

function initDesktopWheelScroll() {
  const main = document.querySelector("main");
  if (!main) return;

  const WHEEL_SCROLL_SPEED = 8;

  window.addEventListener(
    "wheel",
    (event) => {
      if (window.innerWidth <= 768) return;
      if (event.ctrlKey || event.metaKey) return;
      if (main.scrollWidth <= main.clientWidth) return;

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (!delta) return;

      event.preventDefault();

      main.scrollBy({
        left: delta * WHEEL_SCROLL_SPEED,
        top: 0,
        behavior: "auto",
      });
    },
    { passive: false },
  );
}

function initWorkCardToggles() {
  const toggleButtons = document.querySelectorAll(".workCard__toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".workCard");
      if (!card) return;

      const isOpen = card.classList.toggle("workCard--open");

      button.setAttribute("aria-expanded", String(isOpen));

      button.innerHTML = isOpen
        ? 'Show less <span class="workCard__toggleIcon" aria-hidden="true">▼</span>'
        : 'Show me more <span class="workCard__toggleIcon" aria-hidden="true">▼</span>';
    });
  });
}

function setupMobileContactCarousel() {
  const carousel = document.querySelector(".contactMobile__track");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".contactMobile__card")];
  const buttons = [...document.querySelectorAll(".contactMobile__dot")];

  if (!slides.length || slides.length !== buttons.length) return;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setActiveButton(activeIndex) {
    buttons.forEach((button, index) => {
      const isActive = index === activeIndex;

      button.classList.toggle("contactMobile__dot--active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function getSlideStep() {
    if (slides.length === 1) {
      return slides[0].getBoundingClientRect().width;
    }

    const first = slides[0].getBoundingClientRect();
    const second = slides[1].getBoundingClientRect();

    return second.left - first.left;
  }

  function getActiveSlideIndex() {
    const step = getSlideStep();
    if (!step) return 0;

    const index = Math.round(carousel.scrollLeft / step);

    return clamp(index, 0, slides.length - 1);
  }

  function scrollToSlide(index) {
    const slide = slides[index];
    if (!slide) return;

    slide.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });

    setActiveButton(index);
  }

  function bindButtonEvents() {
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        scrollToSlide(index);
      });
    });
  }

  function bindCarouselEvents() {
    carousel.addEventListener("scroll", () => {
      requestAnimationFrame(() => {
        setActiveButton(getActiveSlideIndex());
      });
    });

    window.addEventListener("resize", () => {
      setActiveButton(getActiveSlideIndex());
    });
  }

  bindButtonEvents();
  bindCarouselEvents();
  setActiveButton(0);
}

function getContactFormSelector() {
  return window.innerWidth <= 768
    ? "#contact-form-mobile"
    : "#contact-form-desktop";
}

function getAnchorTarget(href) {
  if (href === "#contact" || href === "#contact-form") {
    return (
      document.querySelector(getContactFormSelector()) ||
      document.querySelector("#contact")
    );
  }

  try {
    return document.querySelector(href);
  } catch (error) {
    return null;
  }
}

function getMainScroller() {
  return document.querySelector("main");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMainScrollLeftForTarget(main, target) {
  const mainRect = main.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const rawLeft = main.scrollLeft + targetRect.left - mainRect.left;
  const maxLeft = main.scrollWidth - main.clientWidth;

  return clamp(rawLeft, 0, maxLeft);
}

let restoreMainSnapTimer = null;

function temporarilyDisableMainSnap(main, behavior) {
  if (!main) return;

  window.clearTimeout(restoreMainSnapTimer);
  main.style.scrollSnapType = "none";

  const restoreDelay = behavior === "smooth" ? 700 : 0;
  restoreMainSnapTimer = window.setTimeout(() => {
    main.style.scrollSnapType = "";
  }, restoreDelay);
}

function isMainSnapTarget(main, target) {
  return target.parentElement === main;
}

function scrollToDesktopAnchorTarget(target, behavior) {
  const main = getMainScroller();
  if (!main) return false;

  const left = getMainScrollLeftForTarget(main, target);

  if (!isMainSnapTarget(main, target)) {
    temporarilyDisableMainSnap(main, behavior);
  }

  main.scrollTo({
    left,
    top: 0,
    behavior,
  });

  return true;
}

function scrollToAnchorTarget(href, behavior = "smooth") {
  if (!href || href === "#") return false;

  const target = getAnchorTarget(href);
  if (!target) return false;

  if (window.innerWidth <= 768) {
    target.scrollIntoView({
      behavior,
      block: "start",
      inline: "nearest",
    });

    return true;
  }

  return scrollToDesktopAnchorTarget(target, behavior);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function shouldUseNativeMobileAnchor(link, href) {
  return (
    isMobileViewport() &&
    link.classList.contains("mobileMenu__link") &&
    href !== "#contact" &&
    href !== "#contact-form"
  );
}

function setupSectionAnchorScrolling() {
  const main = document.querySelector("main");
  const sectionLinks = document.querySelectorAll('a[href^="#"]');

  if (!main || !sectionLinks.length) return;

  sectionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (shouldUseNativeMobileAnchor(link, href)) {
        closeMenu();
        return;
      }

      if (!scrollToAnchorTarget(href)) return;

      event.preventDefault();
      history.pushState(null, "", href);
      closeMenu();
    });
  });
}

function setupInitialHashScrolling() {
  const href = window.location.hash;
  if (!href) return;

  requestAnimationFrame(() => {
    scrollToAnchorTarget(href, "auto");
  });

  window.addEventListener(
    "load",
    () => {
      scrollToAnchorTarget(href, "auto");
    },
    { once: true },
  );
}

function setupHashChangeScrolling() {
  window.addEventListener("hashchange", () => {
    scrollToAnchorTarget(window.location.hash, "smooth");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initDesktopWheelScroll();
  initWorkCardToggles();
  setupMobileContactCarousel();
  setupSectionAnchorScrolling();
  setupInitialHashScrolling();
  setupHashChangeScrolling();

  setupFormValidation(".contact__form", "#contactPolicy", ".contact__submit");

  setupFormValidation(
    "#contact-form-mobile",
    "#contactMobilePolicy",
    ".contactMobile__submit",
  );
});