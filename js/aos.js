(function () {
  const AOS_ATTRIBUTE = "portfolio-fade";
  const MOBILE_QUERY = "(max-width: 768px)";
  const DESKTOP_QUERY = "(min-width: 769px)";
  const ARROW_SELECTOR = [
    ".hero__arrow",
    ".section__arrow",
    ".section__arrow_skills",
    ".myWork__arrow",
    ".contact__middleArrow",
    ".contact__backArrow",
    ".contact__footerArrow",
    ".legal__middleArrow",
    ".legal__backArrow",
  ].join(", ");

  let portfolioAOSObserver = null;
  let resizeAOSTimer = null;

  setupPortfolioAOSResizeRefresh();

  window.PortfolioAOS = {
    init: initPortfolioAOSAnimations,
    refresh: initPortfolioAOSAnimations,
  };

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobileViewport() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function isDesktopViewport() {
    return window.matchMedia(DESKTOP_QUERY).matches;
  }

  function getMainScroller() {
    return document.querySelector("main");
  }

  function uniqueElements(elements) {
    return [...new Set(elements)];
  }

  function isNavigationArrow(element) {
    return element.matches(ARROW_SELECTOR);
  }

  function keepNavigationArrowsVisible() {
    document.querySelectorAll(ARROW_SELECTOR).forEach(showArrow);
  }

  function showArrow(arrow) {
    arrow.removeAttribute("data-aos");
    arrow.removeAttribute("data-aos-group-item");
    arrow.removeAttribute("data-aos-order");
    arrow.style.transitionDelay = "";
    arrow.classList.add("aos-init", "aos-animate");
  }

  function isValidAOSItem(element) {
    if (!element) return false;
    if (isIgnoredAOSTag(element)) return false;
    if (element.hasAttribute("hidden")) return false;
    if (isNavigationArrow(element)) return false;

    return isVisibleElement(element);
  }

  function isIgnoredAOSTag(element) {
    return ["SCRIPT", "STYLE", "LINK", "META"].includes(element.tagName);
  }

  function isVisibleElement(element) {
    const styles = window.getComputedStyle(element);

    return styles.display !== "none" && styles.visibility !== "hidden";
  }

  function getDirectAOSItems(container) {
    return [...container.children].filter(isValidAOSItem);
  }

  function getSectionAOSItems(container) {
    const directItems = getDirectAOSItems(container);
    if (directItems.length !== 1) return directItems;

    const innerItems = getDirectAOSItems(directItems[0]);
    return innerItems.length > 1 ? innerItems : directItems;
  }

  function getAOSElements() {
    keepNavigationArrowsVisible();

    return uniqueElements([
      ...getGroupedAOSElements(),
      ...getFooterAOSElements(),
      ...getStandaloneAOSElements(),
    ]);
  }

  function getGroupedAOSElements() {
    const containers = getAOSGroupContainers();
    const elements = [];

    containers.forEach((container) => {
      elements.push(...prepareAOSGroup(container));
    });

    return elements;
  }

  function getAOSGroupContainers() {
    return [
      ...document.querySelectorAll(
        `[data-aos-group="${AOS_ATTRIBUTE}"], section[data-aos="${AOS_ATTRIBUTE}"]`,
      ),
    ];
  }

  function prepareAOSGroup(container) {
    const items = getSectionAOSItems(container);

    if (!items.length) return [container];

    container.dataset.aosGroup = AOS_ATTRIBUTE;
    container.removeAttribute("data-aos");

    return items.map(prepareGroupedAOSItem);
  }

  function prepareGroupedAOSItem(item, index) {
    item.dataset.aos = AOS_ATTRIBUTE;
    item.dataset.aosGroupItem = "true";
    item.dataset.aosOrder = String(index);

    return item;
  }

  function getFooterAOSElements() {
    const selector = `footer[data-aos="${AOS_ATTRIBUTE}"]`;
    const footers = [...document.querySelectorAll(selector)];

    footers.forEach((footer) => {
      footer.dataset.aosOrder = "0";
    });

    return footers;
  }

  function getStandaloneAOSElements() {
    const selector = `[data-aos="${AOS_ATTRIBUTE}"]:not([data-aos-group-item="true"])`;

    return [...document.querySelectorAll(selector)].filter(isStandaloneAOSItem);
  }

  function isStandaloneAOSItem(element) {
    return !element.matches("section") && isValidAOSItem(element);
  }

  function showAOSElements(elements) {
    elements.forEach(showAOSElement);
  }

  function showAOSElement(element) {
    element.style.transitionDelay = "";
    element.classList.add("aos-init", "aos-animate");
  }

  function shouldUseDesktopHorizontalAOS(main) {
    if (!isDesktopViewport()) return false;
    if (!main) return false;

    return main.scrollWidth > main.clientWidth;
  }

  function getObserverRoot() {
    const main = getMainScroller();

    return shouldUseDesktopHorizontalAOS(main) ? main : null;
  }

  function getRootRect(root) {
    if (root) return root.getBoundingClientRect();

    return getViewportRect();
  }

  function getViewportRect() {
    return {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    };
  }

  function isElementInsideRoot(element, root) {
    const elementRect = element.getBoundingClientRect();
    const rootRect = getRootRect(root);

    return rectanglesOverlap(elementRect, rootRect);
  }

  function rectanglesOverlap(elementRect, rootRect) {
    return (
      elementRect.bottom > rootRect.top &&
      elementRect.top < rootRect.bottom &&
      elementRect.right > rootRect.left &&
      elementRect.left < rootRect.right
    );
  }

  function markInitiallyVisibleElements(elements, root) {
    elements.forEach((element) => {
      if (isElementInsideRoot(element, root)) showVisibleElement(element);
    });
  }

  function showVisibleElement(element) {
    element.classList.add("aos-animate");
  }

  function applyStaggeredAOSDelays(elements) {
    const settings = getStaggerSettings();

    elements.forEach((element) => {
      element.style.transitionDelay = getAOSDelay(element, settings);
    });
  }

  function getStaggerSettings() {
    if (isMobileViewport()) return { step: 110, max: 440 };

    return { step: 140, max: 700 };
  }

  function getAOSDelay(element, settings) {
    const order = Number.parseInt(element.dataset.aosOrder || "0", 10);
    const delay = Math.min(order * settings.step, settings.max);

    return `${delay}ms`;
  }

  function disconnectPortfolioAOSObserver() {
    if (!portfolioAOSObserver) return;

    portfolioAOSObserver.disconnect();
    portfolioAOSObserver = null;
  }

  function getAOSObserverOptions(root) {
    if (root) return getHorizontalObserverOptions(root);

    return getVerticalObserverOptions();
  }

  function getHorizontalObserverOptions(root) {
    return {
      root,
      rootMargin: "0px -12% 0px -12%",
      threshold: 0.01,
    };
  }

  function getVerticalObserverOptions() {
    return {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.01,
    };
  }

  function initObservedAOS(elements, root) {
    if (!supportsIntersectionObserver()) {
      showAOSElements(elements);
      return;
    }

    prepareObservedAOSElements(elements, root);
    observeHiddenAOSElements(elements, root);
  }

  function supportsIntersectionObserver() {
    return "IntersectionObserver" in window;
  }

  function prepareObservedAOSElements(elements, root) {
    elements.forEach(addAOSInitClass);
    markInitiallyVisibleElements(elements, root);
    document.body.classList.add("aos-ready");
  }

  function addAOSInitClass(element) {
    element.classList.add("aos-init");
  }

  function observeHiddenAOSElements(elements, root) {
    createPortfolioAOSObserver(root);

    elements
      .filter(isNotAnimatedYet)
      .forEach((element) => portfolioAOSObserver.observe(element));
  }

  function createPortfolioAOSObserver(root) {
    portfolioAOSObserver = new IntersectionObserver(
      handleAOSIntersection,
      getAOSObserverOptions(root),
    );
  }

  function handleAOSIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateObservedElement(entry.target);
    });
  }

  function animateObservedElement(element) {
    element.classList.add("aos-animate");

    if (portfolioAOSObserver) {
      portfolioAOSObserver.unobserve(element);
    }
  }

  function isNotAnimatedYet(element) {
    return !element.classList.contains("aos-animate");
  }

  function initPortfolioAOSAnimations() {
    const elements = getAOSElements();
    if (!elements.length) return;

    disconnectPortfolioAOSObserver();

    if (prefersReducedMotion()) {
      showAOSElements(elements);
      return;
    }

    initAnimatedAOS(elements);
  }

  function initAnimatedAOS(elements) {
    const root = getObserverRoot();

    applyStaggeredAOSDelays(elements);
    initObservedAOS(elements, root);
  }

  function setupPortfolioAOSResizeRefresh() {
    window.addEventListener("resize", scheduleAOSRefresh);
  }

  function scheduleAOSRefresh() {
    window.clearTimeout(resizeAOSTimer);
    resizeAOSTimer = window.setTimeout(initPortfolioAOSAnimations, 250);
  }
})();