(() => {
  const STORAGE_KEY = "pcboy-skin";
  const ATTR = "data-pcboy-skin";
  const skins = [
    { key: "default", label: "默认" },
    { key: "neo", label: "霓虹" },
    { key: "sunset", label: "落日" },
    { key: "mono", label: "黑白" }
  ];

  const docEl = document.documentElement;
  const clampKey = (k) => (skins.some((s) => s.key === k) ? k : "default");

  const get = () => clampKey(localStorage.getItem(STORAGE_KEY) || docEl.getAttribute(ATTR) || "default");

  const apply = (k) => {
    const next = clampKey(k);
    docEl.setAttribute(ATTR, next);
    localStorage.setItem(STORAGE_KEY, next);
    updateLabels(next);
  };

  const cycle = () => {
    const cur = get();
    const idx = skins.findIndex((s) => s.key === cur);
    apply(skins[(idx + 1) % skins.length].key);
  };

  const labelOf = (k) => (skins.find((s) => s.key === k) || skins[0]).label;

  const updateLabels = (k) => {
    const text = `皮肤：${labelOf(k)}`;
    const navLabel = document.getElementById("pcboy-skin-label");
    if (navLabel) navLabel.textContent = text;
    const mobileLabel = document.getElementById("pcboy-skin-label-mobile");
    if (mobileLabel) mobileLabel.textContent = text;
  };

  const mountNavbar = () => {
    const navList = document.querySelector("#navbarSupportedContent ul.navbar-nav");
    if (navList && !document.getElementById("pcboy-skin-toggle-btn")) {
      const li = document.createElement("li");
      li.className = "nav-item";
      li.id = "pcboy-skin-toggle-btn";
      li.innerHTML =
        '<a class="nav-link" target="_self" href="javascript:;" aria-label="Skin Toggle">' +
        '<span id="pcboy-skin-label">皮肤</span>' +
        "</a>";
      li.addEventListener("click", cycle, { passive: true });
      const colorToggle = document.getElementById("color-toggle-btn");
      if (colorToggle && colorToggle.parentNode === navList) {
        navList.insertBefore(li, colorToggle);
      } else {
        navList.appendChild(li);
      }
    }

    const mobileRow = document.querySelector("#mobile-grid-menu .mobile-grid-menu-inner .row");
    if (mobileRow && !document.getElementById("pcboy-skin-toggle-btn-mobile")) {
      const cell = document.createElement("div");
      cell.className = "col-4 mobile-grid-cell";
      cell.id = "pcboy-skin-toggle-btn-mobile";
      cell.innerHTML =
        '<a href="javascript:;" aria-label="Skin Toggle">' +
        '<div class="mobile-grid-item">' +
        '<i class="iconfont icon-link-fill"></i>' +
        '<span id="pcboy-skin-label-mobile">皮肤</span>' +
        "</div>" +
        "</a>";
      cell.addEventListener("click", cycle, { passive: true });
      mobileRow.appendChild(cell);
    }
  };

  const boot = () => {
    apply(get());
    mountNavbar();
    setTimeout(mountNavbar, 400);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();

