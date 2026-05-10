(function () {
  const AOS_ATTRIBUTE = "portfolio-fade";

  let portfolioAOSObserver = null;
  let resizeAOSTimer = null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobileViewport() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function isDesktopViewport() {
    return window.matchMedia("(min-width: 769px)").matches;
  }

  function uniqueElements(elements) {
    return [...new Set(elements)];
  }

  function getMainScroller() {
    return document.querySelector("main");
  }

  function getArrowSelector() {
    return [
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
  }

  function isNavigationArrow(element) {
    return element.matches(getArrowSelector());
  }

  function keepNavigationArrowsVisible() {
    const arrows = document.querySelectorAll(getArrowSelector());

    arrows.forEach((arrow) => {
      arrow.removeAttribute("data-aos");
      arrow.removeAttribute("data-aos-group-item");
      arrow.removeAttribute("data-aos-order");
      arrow.style.transitionDelay = "";
      arrow.classList.add("aos-init", "aos-animate");
    });
  }

  function isValidAOSItem(element) {
    if (!element) return false;

    const ignoredTags = ["SCRIPT", "STYLE", "LINK", "META"];

    if (ignoredTags.includes(element.tagName)) return false;
    if (element.hasAttribute("hidden")) return false;
    if (isNavigationArrow(element)) return false;

    const styles = window.getComputedStyle(element);

    return styles.display !== "none" && styles.visibility !== "hidden";
  }

  function getDirectAOSItems(container) {
    return [...container.children].filter(isValidAOSItem);
  }

  function getSectionAOSItems(container) {
    const directItems = getDirectAOSItems(container);

    if (directItems.length !== 1) {
      return directItems;
    }

    const innerItems = getDirectAOSItems(directItems[0]);

    if (innerItems.length > 1) {
      return innerItems;
    }

    return directItems;
  }

  function prepareStaggeredAOSElements() {
    keepNavigationArrowsVisible();

    const sectionContainers = [
      ...document.querySelectorAll(
        [
          `[data-aos-group="${AOS_ATTRIBUTE}"]`,
          `section[data-aos="${AOS_ATTRIBUTE}"]`,
        ].join(", "),
      ),
    ];

    const animatedElements = [];

    sectionContainers.forEach((container) => {
      const sectionItems = getSectionAOSItems(container);

      if (!sectionItems.length) {
        animatedElements.push(container);
        return;
      }

      container.dataset.aosGroup = AOS_ATTRIBUTE;
      container.removeAttribute("data-aos");

      sectionItems.forEach((item, index) => {
        item.dataset.aos = AOS_ATTRIBUTE;
        item.dataset.aosGroupItem = "true";
        item.dataset.aosOrder = String(index);

        animatedElements.push(item);
      });
    });

    const footerElements = [
      ...document.querySelectorAll(`footer[data-aos="${AOS_ATTRIBUTE}"]`),
    ];

    footerElements.forEach((footer) => {
      footer.dataset.aosOrder = "0";
      animatedElements.push(footer);
    });

    const standaloneElements = [
      ...document.querySelectorAll(
        `[data-aos="${AOS_ATTRIBUTE}"]:not([data-aos-group-item="true"])`,
      ),
    ].filter((element) => {
      return !element.matches("section") && isValidAOSItem(element);
    });

    return uniqueElements([
      ...animatedElements,
      ...footerElements,
      ...standaloneElements,
    ]);
  }

  function getAOSElements() {
    return prepareStaggeredAOSElements();
  }

  function showAOSElements(animatedElements) {
    animatedElements.forEach((element) => {
      element.style.transitionDelay = "";
      element.classList.add("aos-init", "aos-animate");
    });
  }

  function shouldUseDesktopHorizontalAOS(main) {
    return isDesktopViewport() && main && main.scrollWidth > main.clientWidth;
  }

  function getObserverRoot() {
    const main = getMainScroller();

    if (shouldUseDesktopHorizontalAOS(main)) {
      return main;
    }

    return null;
  }

  function getRootRect(root) {
    if (root) {
      return root.getBoundingClientRect();
    }

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

    return (
      elementRect.bottom > rootRect.top &&
      elementRect.top < rootRect.bottom &&
      elementRect.right > rootRect.left &&
      elementRect.left < rootRect.right
    );
  }

  function markInitiallyVisibleElements(animatedElements, root) {
    animatedElements.forEach((element) => {
      if (isElementInsideRoot(element, root)) {
        element.classList.add("aos-animate");
      }
    });
  }

  function applyStaggeredAOSDelays(animatedElements) {
    const staggerStep = isMobileViewport() ? 110 : 140;
    const maxDelay = isMobileViewport() ? 440 : 700;

    animatedElements.forEach((element) => {
      const order = Number.parseInt(element.dataset.aosOrder || "0", 10);
      const delay = Math.min(order * staggerStep, maxDelay);

      element.style.transitionDelay = `${delay}ms`;
    });
  }

  function disconnectPortfolioAOSObserver() {
    if (portfolioAOSObserver) {
      portfolioAOSObserver.disconnect();
      portfolioAOSObserver = null;
    }
  }

  function getAOSObserverOptions(root) {
    if (root) {
      return {
        root,
        rootMargin: "0px -12% 0px -12%",
        threshold: 0.01,
      };
    }

    return {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.01,
    };
  }

  function initObservedAOS(animatedElements, root) {
    if (!("IntersectionObserver" in window)) {
      showAOSElements(animatedElements);
      return;
    }

    animatedElements.forEach((element) => {
      element.classList.add("aos-init");
    });

    markInitiallyVisibleElements(animatedElements, root);
    document.body.classList.add("aos-ready");

    portfolioAOSObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("aos-animate");

        if (portfolioAOSObserver) {
          portfolioAOSObserver.unobserve(entry.target);
        }
      });
    }, getAOSObserverOptions(root));

    animatedElements.forEach((element) => {
      if (!element.classList.contains("aos-animate")) {
        portfolioAOSObserver.observe(element);
      }
    });
  }

  function initPortfolioAOSAnimations() {
    const animatedElements = getAOSElements();

    if (!animatedElements.length) return;

    disconnectPortfolioAOSObserver();

    if (prefersReducedMotion()) {
      showAOSElements(animatedElements);
      return;
    }

    const root = getObserverRoot();

    applyStaggeredAOSDelays(animatedElements);
    initObservedAOS(animatedElements, root);
  }

  function setupPortfolioAOSResizeRefresh() {
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeAOSTimer);

      resizeAOSTimer = window.setTimeout(() => {
        initPortfolioAOSAnimations();
      }, 250);
    });
  }

  window.PortfolioAOS = {
    init: initPortfolioAOSAnimations,
    refresh: initPortfolioAOSAnimations,
  };

  setupPortfolioAOSResizeRefresh();
})();