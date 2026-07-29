(function () {
  const MQ = window.matchMedia("(max-width: 900px)");
  let toggle = null;
  let backdrop = null;
  let bound = false;
  let themeObserver = null;

  function isOpen() {
    return document.body.classList.contains("learn-sidebar-open");
  }

  function setOpen(open) {
    document.body.classList.toggle("learn-sidebar-open", open);
    if (!toggle || !backdrop) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    backdrop.setAttribute("aria-hidden", String(!open));
    toggle.innerHTML = open
      ? '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    applyToggleTheme();

    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: "learn-sidebar", open }, "*");
      }
    } catch {
      // ignore cross-origin errors
    }
  }

  function getTheme() {
    const root = document.querySelector("div[data-theme]");
    const attr = root?.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    if (document.documentElement.dataset.theme === "dark") return "dark";
    return "light";
  }

  function applyToggleTheme() {
    const theme = getTheme();
    document.body.setAttribute("data-learn-theme", theme);
    if (!toggle) return;

    if (theme === "dark") {
      toggle.style.background = "#1a1a1d";
      toggle.style.color = "#ffffff";
      toggle.style.borderColor = "#404048";
      toggle.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.55)";
      toggle.querySelectorAll("svg path").forEach((path) => {
        path.setAttribute("stroke", "#ffffff");
      });
    } else {
      toggle.style.background = "#ffffff";
      toggle.style.color = "#0a0a0a";
      toggle.style.borderColor = "#ececec";
      toggle.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.12)";
      toggle.querySelectorAll("svg path").forEach((path) => {
        path.setAttribute("stroke", "currentColor");
      });
    }
  }

  function bindNavClose() {
    document.querySelectorAll("aside nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (MQ.matches) setOpen(false);
      });
    });
  }

  function watchTheme(root) {
    applyToggleTheme();
    if (themeObserver) themeObserver.disconnect();
    themeObserver = new MutationObserver(applyToggleTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  function updateMode() {
    if (!toggle || !backdrop) return;
    if (!MQ.matches) {
      setOpen(false);
      toggle.hidden = true;
      backdrop.hidden = true;
      return;
    }
    toggle.hidden = false;
    backdrop.hidden = false;
    applyToggleTheme();
  }

  function init() {
    const root = document.querySelector("div[data-theme]");
    const sidebar = document.querySelector("aside");
    if (!root || !sidebar) return;

    if (bound && toggle && document.body.contains(toggle)) {
      updateMode();
      applyToggleTheme();
      return;
    }

    if (toggle && !document.body.contains(toggle)) {
      toggle = null;
      backdrop = null;
      bound = false;
    }

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "learn-nav-toggle";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    backdrop = document.createElement("div");
    backdrop.className = "learn-sidebar-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(toggle);

    bindNavClose();
    watchTheme(root);
    MQ.addEventListener("change", updateMode);
    bound = true;
    updateMode();
  }

  function whenReady() {
    if (document.querySelector("div[data-theme] aside")) {
      init();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector("div[data-theme] aside")) {
        observer.disconnect();
        init();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", whenReady);
  } else {
    whenReady();
  }
})();
