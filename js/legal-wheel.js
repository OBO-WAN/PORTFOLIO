const LEGAL_WHEEL_SCROLL_SPEED = 8;
const LEGAL_MOBILE_BREAKPOINT = 768;

let legalMain = null;

document.addEventListener("DOMContentLoaded", initLegalPageScrolling);

function initLegalPageScrolling() {
  legalMain = document.querySelector("main.legalPage");
  if (!legalMain) return;

  bindWheelScrolling();
  bindAnchorScrolling("#legal-start", scrollToLegalStart);
  bindAnchorScrolling("#legal-end", scrollToLegalEnd);
}

function bindWheelScrolling() {
  window.addEventListener("wheel", handleLegalWheel, { passive: false });
}

function handleLegalWheel(event) {
  if (shouldIgnoreWheel(event)) return;

  const delta = getMainWheelDelta(event);
  if (!delta) return;

  event.preventDefault();
  scrollMainHorizontally(delta);
}

function shouldIgnoreWheel(event) {
  if (isMobileViewport()) return true;
  if (event.ctrlKey || event.metaKey) return true;

  return legalMain.scrollWidth <= legalMain.clientWidth;
}

function getMainWheelDelta(event) {
  const { deltaX, deltaY } = event;

  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
}

function scrollMainHorizontally(delta) {
  legalMain.scrollBy({
    left: delta * LEGAL_WHEEL_SCROLL_SPEED,
    top: 0,
    behavior: "auto",
  });
}

function bindAnchorScrolling(hash, scrollHandler) {
  document.querySelectorAll(`a[href="${hash}"]`).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollHandler("smooth");
      history.replaceState(null, "", hash);
    });
  });
}

function scrollToLegalStart(behavior = "smooth") {
  const target = document.querySelector("#legal-start");

  if (isMobileViewport()) {
    scrollWindowToTarget(target, behavior);
    return;
  }

  scrollMainToStart(behavior);
}

function scrollToLegalEnd(behavior = "smooth") {
  const target = document.querySelector("#legal-end");

  if (isMobileViewport()) {
    scrollWindowToTarget(target, behavior);
    return;
  }

  scrollMainToEnd(behavior);
}

function scrollWindowToTarget(target, behavior = "smooth") {
  if (!target) return;

  target.scrollIntoView({
    behavior,
    block: "start",
    inline: "nearest",
  });
}

function scrollMainToStart(behavior) {
  legalMain.scrollTo({
    left: 0,
    top: 0,
    behavior,
  });
}

function scrollMainToEnd(behavior) {
  const left = legalMain.scrollWidth - legalMain.clientWidth;

  legalMain.scrollTo({
    left,
    top: 0,
    behavior,
  });
}

function isMobileViewport() {
  return window.innerWidth <= LEGAL_MOBILE_BREAKPOINT;
}