
// Menu toggle for mobile

const mobileToggle = document.querySelector(".mobileBar__toggle");
const mobileMenuLinks = document.querySelectorAll(".mobileMenu__link");

if (mobileToggle) {
  mobileToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      mobileToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Scroll horizontally on desktop when using mouse wheel

const main = document.querySelector("main");

if (window.innerWidth > 768) {
  window.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      main.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}