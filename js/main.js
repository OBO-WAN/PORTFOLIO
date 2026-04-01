// Menu toggle for mobile

const mobileToggle = document.querySelector(".mobileBar__toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileMenuLinks = document.querySelectorAll(".mobileMenu__link");

function isMenuOpen() {
  return document.body.classList.contains("menu-open");
}

function setMenuState(open) {
  document.body.classList.toggle("menu-open", open);
  mobileToggle.setAttribute("aria-expanded", String(open));
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
  if (mobileMenu.contains(event.target)) return;
  if (mobileToggle.contains(event.target)) return;
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
  mobileMenuLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
}

initMobileMenu();

// Scroll horizontally on desktop when using mouse wheel

const main = document.querySelector("main");

if (window.innerWidth > 768) {
  window.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        main.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    { passive: false },
  );
}

// Toggle work card details

document.querySelectorAll(".workCard__toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".workCard");
    const isOpen = card.classList.toggle("workCard--open");

    button.setAttribute("aria-expanded", String(isOpen));
    button.innerHTML = isOpen
      ? 'Show less <span class="workCard__toggleIcon" aria-hidden="true">▼</span>'
      : 'Show me more <span class="workCard__toggleIcon" aria-hidden="true">▼</span>';
  });
});