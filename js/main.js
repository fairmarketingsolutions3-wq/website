/* ══════════════════════════════════════════════════
   Fair Marketing Solutions motion system (editorial redesign)
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
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.4 });
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

  /* ─────────── Site start (no loading screen) ─────────── */
  function startSite() {
    document.body.classList.add("is-loaded");
    if (hasGSAP && !reduceMotion) heroIntro();
  }
  startSite();

  /* ─────────── Hero intro ─────────── */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hw-char", { yPercent: 118, duration: 1.3, stagger: 0.09 }, 0.15)
      .from(".hero__top > *", { y: -34, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5)
      .from(".hero__pitch", { y: 40, opacity: 0, duration: 1 }, 0.85)
      .from(".hero__media", { y: 60, opacity: 0, scale: 0.85, rotate: 5, duration: 1.2 }, 0.95);

    // gentle float on the hero portrait
    gsap.to(".hero__media", {
      y: -12, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.2
    });
  }

  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll(".stat-num").forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ─────────── Accordions (services + FAQ) ─────────── */
  document.querySelectorAll(".acc").forEach(function (group) {
    var items = group.querySelectorAll(":scope > .acc__item");
    items.forEach(function (item) {
      var head = item.querySelector(".acc__head");
      head.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          other.querySelector(".acc__head").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
        if (hasGSAP && typeof ScrollTrigger !== "undefined") {
          setTimeout(function () { ScrollTrigger.refresh(); }, 650);
        }
      });
    });
  });

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

    // parallax blobs
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

    // scroll-driven outline marquee
    gsap.utils.toArray("[data-scroll-marquee]").forEach(function (line) {
      var dir = parseInt(line.getAttribute("data-scroll-marquee"), 10) || 1;
      gsap.fromTo(line,
        { xPercent: dir > 0 ? -20 : 0 },
        {
          xPercent: dir > 0 ? 0 : -20, ease: "none",
          scrollTrigger: {
            trigger: line.closest(".big-marquee"),
            start: "top bottom", end: "bottom top", scrub: 1
          }
        });
    });

    // stat counters count up when visible
    document.querySelectorAll(".stat-num").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target, duration: 2.2, snap: { innerText: 1 }, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%" }
      });
    });

    // about bento photo parallax
    var bentoImg = document.querySelector(".bento--photo img");
    if (bentoImg) {
      gsap.fromTo(bentoImg, { yPercent: -8 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: ".bento--photo", start: "top bottom", end: "bottom top", scrub: 1 }
      });
    }

    // editorial band image parallax
    var bandImg = document.querySelector(".band__inner img");
    if (bandImg) {
      gsap.fromTo(bandImg, { yPercent: -10 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: ".band__inner", start: "top bottom", end: "bottom top", scrub: 1 }
      });
    }

    // footer giant wordmark rise
    var footWord = document.querySelector(".footer__word");
    if (footWord) {
      gsap.from(footWord.children, {
        yPercent: 60, opacity: 0, duration: 1.2, stagger: 0.06, ease: "power4.out",
        scrollTrigger: { trigger: footWord, start: "top 96%" }
      });
    }

    // pill nav appears after leaving the hero (home only; subpages keep it fixed)
    if (document.querySelector(".hero")) {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "bottom 120px",
        onEnter: function () { document.getElementById("nav").classList.add("is-scrolled"); },
        onLeaveBack: function () { document.getElementById("nav").classList.remove("is-scrolled"); }
      });
    }

    // journey wave: path draws itself, a glowing dot rides it and lights each step
    document.querySelectorAll("[data-journey]").forEach(function (jr) {
      var svg = jr.querySelector(".journey__svg");
      var path = jr.querySelector("[data-journey-path]");
      var dot = jr.querySelector("[data-journey-dot]");
      var nodes = jr.querySelectorAll(".journey__node");
      var cards = jr.querySelectorAll(".j-step");
      if (!svg || !path || !dot) return;

      var len = path.getTotalLength();
      path.style.strokeDasharray = len + " " + len;
      path.style.strokeDashoffset = len;

      // arc-length position of each node (where the wave crosses its row centre)
      var nodeLens = [];
      nodes.forEach(function (n, i) {
        var targetY = ((2 * i + 1) / 12) * 1560;
        var lo = 0, hi = len;
        for (var k = 0; k < 24; k++) {
          var mid = (lo + hi) / 2;
          if (path.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid;
        }
        nodeLens.push((lo + hi) / 2);
      });

      function ride(p) {
        path.style.strokeDashoffset = len * (1 - p);
        var pt = path.getPointAtLength(len * p);
        var sr = svg.getBoundingClientRect();
        var jrr = jr.getBoundingClientRect();
        dot.style.left = (sr.left - jrr.left + (pt.x / 1200) * sr.width) + "px";
        dot.style.top = (sr.top - jrr.top + (pt.y / 1560) * sr.height) + "px";
        nodes.forEach(function (n, i) {
          n.classList.toggle("is-lit", len * p >= nodeLens[i] - 1);
        });
        jr.classList.toggle("is-riding", p > 0.001 && p < 0.999);
      }
      ride(0);

      var prox = { p: 0 };
      gsap.to(prox, {
        p: 1, ease: "none",
        onUpdate: function () { ride(prox.p); },
        scrollTrigger: { trigger: jr, start: "top 72%", end: "bottom 62%", scrub: 0.6 }
      });

      // step cards swing in from their side of the wave
      cards.forEach(function (card, i) {
        var fromLeft = card.matches(":nth-child(odd)");
        gsap.from(card.firstElementChild, {
          x: fromLeft ? -70 : 70, opacity: 0, rotate: fromLeft ? -3 : 3,
          duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: card, start: "top 86%" }
        });
      });
    });

    // about page: timeline progress line scrubs with scroll
    var tlProgress = document.getElementById("timelineProgress");
    if (tlProgress) {
      gsap.fromTo(tlProgress, { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: "#timeline", start: "top 75%", end: "bottom 55%", scrub: 1 }
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  } else {
    // no-motion fallback: journey renders fully drawn with every step lit
    document.querySelectorAll(".journey__node").forEach(function (n) { n.classList.add("is-lit"); });

    // no-motion fallback: show pill nav after scrolling past hero (home only)
    if (document.querySelector(".hero")) {
      window.addEventListener("scroll", function () {
        var past = window.scrollY > window.innerHeight * 0.9;
        document.getElementById("nav").classList.toggle("is-scrolled", past);
      }, { passive: true });
    }
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
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
  } else {
    var cd = document.getElementById("cursorDot");
    var cr = document.getElementById("cursorRing");
    if (cd) cd.style.display = "none";
    if (cr) cr.style.display = "none";
  }

  /* ─────────── Magnetic buttons ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
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
        rx(-py * 6); ry(px * 6);
      });
      card.addEventListener("mouseleave", function () { rx(0); ry(0); });
    });
  }

  /* ─────────── Mouse-follow hero blobs ─────────── */
  if (!isTouch && hasGSAP && !reduceMotion) {
    var blobs = document.querySelectorAll(".hero__blob");
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5);
      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 22;
        gsap.to(b, { xPercent: nx * depth * 0.4, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      });
    });
  }

  /* ─────────── Lead form → WhatsApp / Email (no backend needed) ─────────── */
  var leadForm = document.getElementById("leadForm");
  if (leadForm) {
    var leadText = function () {
      var f = new FormData(leadForm);
      return "New project inquiry: FMS website\n\n" +
        "Name: " + (f.get("name") || "-") + "\n" +
        "Business: " + (f.get("company") || "-") + "\n" +
        "Email: " + (f.get("email") || "-") + "\n" +
        "Phone: " + (f.get("phone") || "-") + "\n" +
        "Service: " + f.get("service") + "\n" +
        "Package: " + f.get("package") + "\n\n" +
        "Project:\n" + (f.get("message") || "-");
    };
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!leadForm.reportValidity()) return;
      window.open("https://wa.me/255677157279?text=" + encodeURIComponent(leadText()), "_blank", "noopener");
    });
    var emailBtn = document.getElementById("leadFormEmail");
    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!leadForm.reportValidity()) return;
        var name = new FormData(leadForm).get("name") || "FMS website";
        window.location.href = "mailto:karibu@fms.co.tz?subject=" +
          encodeURIComponent("New project inquiry: " + name) +
          "&body=" + encodeURIComponent(leadText());
      });
    }
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
