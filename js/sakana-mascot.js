(() => {
  const containerId = "pcboy-sakana-mascot";
  if (document.getElementById(containerId)) return;

  const cfg = {
    size: 200,
    sizeMobile: 180,
    right: 12,
    bottom: 12,
    rightMobile: 6,
    bottomMobile: 6,
    thresholdUp: 0.6,
    thresholdDown: 0.5,
    manualTimeoutMs: 15000,
    smoothFactor: 0.12,
    stateUpdateIntervalMs: 140,
    settleDelayMs: 220
  };

  const container = document.createElement("div");
  container.id = containerId;
  container.setAttribute("aria-hidden", "true");
  container.style.setProperty("--pcboy-sakana-size", `${cfg.size + 20}px`);
  container.style.setProperty("--pcboy-sakana-size-mobile", `${cfg.sizeMobile + 20}px`);
  container.style.setProperty("--pcboy-sakana-right", `${cfg.right}px`);
  container.style.setProperty("--pcboy-sakana-bottom", `${cfg.bottom}px`);
  container.style.setProperty("--pcboy-sakana-right-mobile", `${cfg.rightMobile}px`);
  container.style.setProperty("--pcboy-sakana-bottom-mobile", `${cfg.bottomMobile}px`);
  document.body.appendChild(container);

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const getProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return 1;
    return clamp01((window.scrollY || doc.scrollTop || 0) / max);
  };

  const ensureScript = (src) =>
    new Promise((resolve, reject) => {
      if (window.SakanaWidget) return resolve();
      const existed = document.querySelector(`script[data-src="${src}"]`);
      if (existed) {
        existed.addEventListener("load", () => resolve(), { once: true });
        existed.addEventListener("error", () => reject(new Error("load failed")), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.async = true;
      s.src = src;
      s.dataset.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("load failed"));
      document.head.appendChild(s);
    });

  const mount = async () => {
    await ensureScript("https://cdn.jsdelivr.net/npm/sakana-widget@3.0.0/lib/index.umd.min.js");

    const SakanaWidget = window.SakanaWidget;
    if (!SakanaWidget) return;

    const widget = new SakanaWidget({
      character: "chisato",
      size: cfg.size,
      controls: false,
      rod: false,
      draggable: true,
      saveState: true,
      stateKey: "pcboy-sakana-mascot-status"
    }).mount(`#${containerId}`);

    let currentKey = "chisato";
    let manual = false;
    let lastManualAt = 0;
    let downX = 0;
    let downY = 0;
    let downAt = 0;
    let moved = false;
    let running = false;
    let lastInputAt = 0;
    let targetP = getProgress();
    let smoothP = targetP;
    let lastStateAt = 0;

    const next = () => {
      if (typeof widget.nextCharacter === "function") {
        widget.nextCharacter();
        currentKey = currentKey === "chisato" ? "takina" : "chisato";
        return;
      }
      const key = currentKey === "chisato" ? "takina" : "chisato";
      widget.setCharacter(key);
      currentKey = key;
    };

    container.addEventListener(
      "pointerdown",
      (e) => {
        downX = e.clientX;
        downY = e.clientY;
        downAt = Date.now();
        moved = false;
      },
      { passive: true }
    );
    container.addEventListener(
      "pointermove",
      (e) => {
        if (moved) return;
        const dx = e.clientX - downX;
        const dy = e.clientY - downY;
        if (dx * dx + dy * dy >= 64) moved = true;
      },
      { passive: true }
    );
    container.addEventListener(
      "pointerup",
      () => {
        const dt = Date.now() - downAt;
        if (moved || dt > 500) return;
        manual = true;
        lastManualAt = Date.now();
        next();
      },
      { passive: true }
    );

    const update = (ts) => {
      const now = Date.now();
      if (manual && now - lastManualAt > cfg.manualTimeoutMs) manual = false;
      if (targetP <= 0.03) manual = false;

      if (!manual) {
        if (currentKey === "chisato" && smoothP >= cfg.thresholdUp) {
          widget.setCharacter("takina");
          currentKey = "takina";
        } else if (currentKey === "takina" && smoothP <= cfg.thresholdDown) {
          widget.setCharacter("chisato");
          currentKey = "chisato";
        }
      }

      if (!prefersReducedMotion && ts - lastStateAt >= cfg.stateUpdateIntervalMs) {
        lastStateAt = ts;
        widget.setState({
          i: 0.03 + smoothP * 0.035,
          s: 0.12 + smoothP * 0.08,
          d: 0.86 + smoothP * 0.06
        });
      }
    };

    const tick = (ts) => {
      smoothP = smoothP + (targetP - smoothP) * cfg.smoothFactor;
      update(ts);

      const idle = Date.now() - lastInputAt > cfg.settleDelayMs;
      const settled = Math.abs(targetP - smoothP) <= 0.002;
      if (!idle || !settled) {
        window.requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const kick = () => {
      targetP = getProgress();
      lastInputAt = Date.now();
      if (running) return;
      running = true;
      window.requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    kick();
  };

  mount().catch(() => {});
})();
