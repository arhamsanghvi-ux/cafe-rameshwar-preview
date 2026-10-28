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

  /* Photoreal scroll story */
  const story = document.getElementById("story");
  const stage = document.getElementById("story-stage");
  if (!story || !stage) return;

  const layers = Array.from(stage.querySelectorAll(".story-layer"));
  const videos = Array.from(stage.querySelectorAll(".story-vid"));

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function setStep(step) {
    if (stage.dataset.step === String(step)) return;
    stage.dataset.step = String(step);
    layers.forEach((layer) => {
      const i = Number(layer.dataset.layer);
      layer.classList.toggle("is-active", i === step);
      layer.classList.toggle("is-prev", i === step - 1);
    });
    videos.forEach((vid) => {
      const i = Number(vid.dataset.vid);
      if (reduce) {
        vid.pause();
        return;
      }
      if (i === step) {
        const play = () => {
          const p = vid.play();
          if (p && p.catch) p.catch(() => {});
        };
        if (vid.readyState >= 2) play();
        else {
          vid.preload = "auto";
          vid.addEventListener("loadeddata", play, { once: true });
          try { vid.load(); } catch (_) {}
        }
        vid.closest(".story-layer")?.classList.add("has-video");
      } else {
        vid.pause();
      }
    });
  }

  /* Mark videos that can show */
  videos.forEach((vid) => {
    vid.addEventListener("loadeddata", () => {
      vid.closest(".story-layer")?.classList.add("has-video");
    });
  });

  function updateStory() {
    if (reduce) {
      setStep(0);
      return;
    }
    const rect = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, total);
    const p = total > 0 ? scrolled / total : 0;
    stage.style.setProperty("--p", p.toFixed(4));

    let step = 0;
    if (p >= 0.72) step = 3;
    else if (p >= 0.48) step = 2;
    else if (p >= 0.24) step = 1;
    setStep(step);
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

  /* Lazy-load first video when story nears viewport */
  if ("IntersectionObserver" in window && videos[0]) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            videos[0].preload = "auto";
            try { videos[0].load(); } catch (_) {}
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(story);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  setStep(0);
  updateStory();
})();
