(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Intro */
  const intro = document.getElementById("intro");
  const skip = document.getElementById("intro-skip");
  function endIntro() {
    if (!intro || intro.classList.contains("is-done")) return;
    intro.classList.add("is-done");
    intro.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-intro");
  }
  if (reduce) endIntro();
  else {
    skip && skip.addEventListener("click", endIntro);
    window.setTimeout(endIntro, 2800);
  }

  /* Nav */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Scroll story */
  const story = document.getElementById("story");
  const stage = document.getElementById("story-stage");
  if (!story || !stage) return;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateStory() {
    if (reduce) {
      stage.style.setProperty("--p", "1");
      stage.style.setProperty("--spread", "1");
      stage.style.setProperty("--fold", "0.55");
      stage.style.setProperty("--fill", "0.85");
      stage.style.setProperty("--pour", "0");
      stage.style.setProperty("--steam", "1");
      stage.style.setProperty("--sides", "1");
      stage.dataset.step = "3";
      return;
    }
    const rect = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    const p = total > 0 ? scrolled / total : 0;
    stage.style.setProperty("--p", p.toFixed(4));

    // 0–0.28 batter spreads into dosa
    const spread = smoothstep(0.02, 0.28, p);
    // 0.28–0.48 fold
    const fold = smoothstep(0.28, 0.52, p);
    // 0.45–0.62 pour appears
    const pour = Math.sin(Math.PI * smoothstep(0.45, 0.68, p));
    // fill rises 0.5–0.78
    const fill = smoothstep(0.5, 0.78, p);
    const steam = smoothstep(0.62, 0.85, p);
    const sides = smoothstep(0.2, 0.4, p);

    stage.style.setProperty("--spread", spread.toFixed(4));
    stage.style.setProperty("--fold", fold.toFixed(4));
    stage.style.setProperty("--pour", pour.toFixed(4));
    stage.style.setProperty("--fill", fill.toFixed(4));
    stage.style.setProperty("--steam", steam.toFixed(4));
    stage.style.setProperty("--sides", sides.toFixed(4));

    let step = 0;
    if (p > 0.72) step = 3;
    else if (p > 0.48) step = 2;
    else if (p > 0.24) step = 1;
    stage.dataset.step = String(step);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateStory();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateStory();
})();
