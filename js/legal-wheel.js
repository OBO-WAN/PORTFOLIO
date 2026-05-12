document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main.legalPage");
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
});