/* ══════════════════════════════════════════════════
   Fair Marketing Solutions — motion system
   GSAP + ScrollTrigger + Lenis smooth scroll
   ══════════════════════════════════════════════════ */

(function () {
  "use strict";

  var hasGSAP = typeof gsap !== "undefined";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 901;

  if (hasGSAP && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ─────────── Smooth scroll (Lenis) ─────────── */
  var lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }

  function scrollToTarget(target) {
    var el = document.querySelector(target);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href.length > 1) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(href);
      }
    });
  });

  /* ─────────── Split helper ─────────── */
  function splitWords(el) {
    var text = el.innerHTML;
    var parts = text.split(/(<em>[\s\S]*?<\/em>)/g);
    var html = "";
    parts.forEach(function (part) {
      if (!part) return;
      if (part.indexOf("<em>") === 0) {
        var inner = part.replace(/<\/?em>/g, "");
        inner.split(" ").forEach(function (w) {
          if (w.trim()) html += '<span class="w"><span><em>' + w + "</em></span></span> ";
        });
      } else {
        part.split(" ").forEach(function (w) {
          if (w.trim()) html += '<span class="w"><span>' + w + "</span></span> ";
        });
      }
    });
    el.innerHTML = html;
    return el.querySelectorAll(".w > span");
  }

  /* ─────────── Preloader ─────────── */
  var preloader = document.getElementById("preloader");
  var plBar = document.getElementById("plBar");
  var plCount = document.getElementById("plCount");

  function startSite() {
    document.body.classList.add("is-loaded");
    if (hasGSAP && !reduceMotion) heroIntro();
  }

  if (preloader && hasGSAP && !reduceMotion) {
    var tl = gsap.timeline();
    var prog = { v: 0 };
    tl.to(".pl-char", { y: 0, duration: 0.9, stagger: 0.08, ease: "power4.out" })
      .to(prog, {
        v: 100, duration: 1.6, ease: "power2.inOut",
        onUpdate: function () {
          var v = Math.round(prog.v);
          plCount.textContent = v;
          plBar.style.width = v + "%";
        }
      }, "-=0.4")
      .to(".preloader__inner", { y: -40, opacity: 0, duration: 0.5, ease: "power2.in" })
      .to(".preloader__curtain", { y: "-100%", duration: 0.7, ease: "power4.inOut" }, "-=0.2")
      .to(preloader, { yPercent: -100, duration: 0.7, ease: "power4.inOut", onStart: startSite }, "<")
      .set(preloader, { display: "none" });
  } else {
    if (preloader) preloader.style.display = "none";
    startSite();
  }

  /* ─────────── Hero intro ─────────── */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__word", { yPercent: 120, rotate: 4, duration: 1.2, stagger: 0.07 }, 0.1)
      .from(".hero__eyebrow", { y: 30, opacity: 0, duration: 0.9 }, 0.3)
      .from(".hero__media", { opacity: 0, scale: 0.82, y: 60, rotate: 8, duration: 1.4, ease: "power4.out" }, 0.55)
      .from(".hero__media-badge", { opacity: 0, x: -30, duration: 0.8 }, 1.2)
      .from(".hero__sub, .hero__cta", { y: 40, opacity: 0, duration: 1, stagger: 0.12 }, 0.7)
      .from(".hero__stat", { y: 40, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.95)
      .from(".nav", { y: -80, opacity: 0, duration: 1 }, 0.6)
      .from(".hero__scroll", { opacity: 0, duration: 1 }, 1.3);

    // gentle perpetual float on the hero portrait
    gsap.to(".hero__media", {
      y: -16, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2
    });

    // stat counters
    document.querySelectorAll(".stat-num").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target, duration: 2, delay: 1.1,
        snap: { innerText: 1 }, ease: "power2.out"
      });
    });
  }

  if (!hasGSAP || reduceMotion) {
    // ensure counters show final values without animation
    document.querySelectorAll(".stat-num").forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ─────────── Scroll animations ─────────── */
  if (hasGSAP && typeof ScrollTrigger !== "undefined" && !reduceMotion) {

    // generic reveal-up
    gsap.utils.toArray(".reveal-up").forEach(function (el) {
      if (el.closest(".hero")) return; // hero handled by intro
      gsap.from(el, {
        y: 60, opacity: 0, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // split-word titles
    gsap.utils.toArray(".split-words").forEach(function (el) {
      var spans = splitWords(el);
      gsap.from(spans, {
        yPercent: 115, duration: 0.9, stagger: 0.025, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    // hero blobs parallax on scroll
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.3;
      gsap.to(el, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom", end: "bottom top", scrub: true
        }
      });
    });

    // constant marquees
    gsap.utils.toArray(".marquee__track").forEach(function (track) {
      var speed = parseFloat(track.getAttribute("data-marquee-speed")) || 1;
      var group = track.querySelector(".marquee__group");
      var w = group.offsetWidth;
      var tween = gsap.to(track, {
        x: -w, duration: (w / 100) / speed, ease: "none", repeat: -1
      });
      track.closest(".marquee").addEventListener("mouseenter", function () {
        gsap.to(tween, { timeScale: 0.25, duration: 0.5 });
      });
      track.closest(".marquee").addEventListener("mouseleave", function () {
        gsap.to(tween, { timeScale: 1, duration: 0.5 });
      });
    });

    // scroll-driven big marquee lines
    gsap.utils.toArray("[data-scroll-marquee]").forEach(function (line) {
      var dir = parseInt(line.getAttribute("data-scroll-marquee"), 10) || 1;
      gsap.fromTo(line,
        { xPercent: dir > 0 ? -18 : 0 },
        {
          xPercent: dir > 0 ? 0 : -18, ease: "none",
          scrollTrigger: {
            trigger: line.closest(".big-marquee"),
            start: "top bottom", end: "bottom top", scrub: 1
          }
        });
    });

    // service rows cascade in
    gsap.utils.toArray(".service-row").forEach(function (row, i) {
      gsap.from(row.querySelector(".service-row__inner"), {
        y: 80, opacity: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: row, start: "top 90%" }
      });
    });

    // about banner: parallax drift + soft zoom-out reveal
    var bannerImg = document.querySelector(".about__banner img");
    if (bannerImg) {
      gsap.fromTo(bannerImg, { yPercent: -12, scale: 1.15 }, {
        yPercent: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".about__banner", start: "top bottom", end: "bottom top", scrub: 1 }
      });
      gsap.from(".about__banner", {
        clipPath: "inset(12% 6% 12% 6% round 30px)", duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".about__banner", start: "top 85%" }
      });
    }

    // pinned horizontal process
    var track = document.getElementById("processTrack");
    if (track) {
      ScrollTrigger.matchMedia({
        "(min-width: 901px)": function () {
          var getDist = function () { return track.scrollWidth - window.innerWidth; };
          gsap.to(track, {
            x: function () { return -getDist(); },
            ease: "none",
            scrollTrigger: {
              trigger: ".process__pin",
              start: "top top",
              end: function () { return "+=" + getDist(); },
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true
            }
          });
        },
        "(max-width: 900px)": function () {
          gsap.utils.toArray(".process-card").forEach(function (card) {
            gsap.from(card, {
              y: 70, opacity: 0, duration: 0.9, ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 90%" }
            });
          });
        }
      });
    }

    // packages cascade
    gsap.from(".pkg", {
      y: 90, opacity: 0, duration: 1, stagger: 0.1, ease: "power4.out",
      scrollTrigger: { trigger: ".packages__grid", start: "top 85%" }
    });

    // CTA giant reveal
    gsap.from(".cta__line", {
      yPercent: 120, duration: 1.2, stagger: 0.12, ease: "power4.out",
      scrollTrigger: { trigger: ".cta__title", start: "top 85%" }
    });

    // nav shrink
    ScrollTrigger.create({
      start: 60,
      onUpdate: function (self) {
        document.getElementById("nav").classList.toggle("is-scrolled", self.scroll() > 60);
      }
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  } else {
    // no-motion fallback: keep nav state on scroll
    window.addEventListener("scroll", function () {
      document.getElementById("nav").classList.toggle("is-scrolled", window.scrollY > 60);
    }, { passive: true });
  }

  /* ─────────── Custom cursor ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    var dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
    var ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2" });
    var ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2" });

    window.addEventListener("mousemove", function (e) {
      document.body.classList.add("has-mouse");
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });

    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      var mode = el.getAttribute("data-cursor");
      el.addEventListener("mouseenter", function () {
        ring.classList.add(mode === "view" ? "is-view" : "is-hover");
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("is-view", "is-hover");
      });
    });
  } else {
    var cd = document.getElementById("cursorDot");
    var cr = document.getElementById("cursorRing");
    if (cd) cd.style.display = "none";
    if (cr) cr.style.display = "none";
  }

  /* ─────────── Service hover preview (follows cursor) ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    var preview = document.getElementById("servicePreview");
    if (preview) {
      var pvImgs = preview.querySelectorAll("img");
      var pvX = gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3" });
      var pvY = gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3" });
      var servicesList = document.querySelector(".services__list");

      servicesList.addEventListener("mousemove", function (e) {
        pvX(e.clientX); pvY(e.clientY);
      });

      document.querySelectorAll(".service-row").forEach(function (row) {
        var idx = row.getAttribute("data-preview");
        row.addEventListener("mouseenter", function () {
          pvImgs.forEach(function (img) {
            img.classList.toggle("is-active", img.getAttribute("data-preview-img") === idx);
          });
          gsap.to(preview, {
            opacity: 1, scale: 1, rotate: -3, duration: 0.45, ease: "power3.out",
            transformOrigin: "center", overwrite: "auto"
          });
        });
        row.addEventListener("mouseleave", function () {
          gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.35, ease: "power3.in", overwrite: "auto" });
        });
      });
      // quickTo x/y works alongside translate(-50%,-50%) baseline
      gsap.set(preview, { xPercent: -50, yPercent: -50 });
    }
  }

  /* ─────────── Magnetic buttons ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ─────────── Tilt cards ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * 8); ry(px * 8);
        card.style.setProperty("--mx", ((px + 0.5) * 100) + "%");
        card.style.setProperty("--my", ((py + 0.5) * 100) + "%");
      });
      card.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });
  }

  /* ─────────── Mouse-follow hero blobs ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    var blobs = document.querySelectorAll(".hero__blob");
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5);
      var ny = (e.clientY / window.innerHeight - 0.5);
      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 22;
        gsap.to(b, { xPercent: nx * depth * 0.4, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      });
    });
  }

  /* ─────────── Mobile menu ─────────── */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-label", "Open menu");
    if (lenis) lenis.start();
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
  }

})();
