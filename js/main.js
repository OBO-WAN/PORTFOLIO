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