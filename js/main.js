/* TIPFA — motion engine (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Preloader ---------------- */
  var preloader = document.getElementById('preloader');
  var hero = document.querySelector('.hero');

  function finishLoading() {
    preloader.classList.add('done');
    hero.classList.add('loaded');
  }
  if (document.readyState === 'complete') {
    setTimeout(finishLoading, 500);
  } else {
    window.addEventListener('load', function () { setTimeout(finishLoading, 500); });
    // Never trap the visitor behind the preloader
    setTimeout(finishLoading, 3500);
  }

  /* ---------------- Sticky nav ---------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  /* ---------------- Scroll progress bar ---------------- */
  var progress = document.getElementById('scrollProgress');
  function onProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  /* ---------------- Word-by-word heading reveal ---------------- */
  document.querySelectorAll('[data-words]').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach(function (word, i) {
      var mask = document.createElement('span');
      mask.className = 'w';
      var inner = document.createElement('span');
      inner.textContent = word;
      mask.appendChild(inner);
      h.appendChild(mask);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------------- Marquee: duplicate the track for the seamless loop ----
     The served HTML lists each founding farm exactly once, so crawlers and
     assistive tech see no duplicates; the visual loop needs a second copy,
     which is cloned here and hidden from the accessibility tree. */
  (function () {
    var track = document.getElementById('farmTrack');
    if (!track) return;
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      // Headings in a decorative copy would duplicate the outline
      clone.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (h) {
        var span = document.createElement('span');
        span.className = 'farm-name';
        span.textContent = h.textContent;
        h.parentNode.replaceChild(span, h);
      });
      clone.querySelectorAll('a, button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
      track.appendChild(clone);
    });
  })();

  /* ---------------- Reveal on scroll ---------------- */
  var revealables = document.querySelectorAll('[data-reveal], [data-stagger], [data-words], .trace, .timeline');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
    // threshold 0: a tall grid can never fill a fraction of a small screen,
    // so trigger as soon as its leading edge crosses into view.
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  revealables.forEach(function (el) { io.observe(el); });

  /* ---------------- Animated counters ---------------- */
  function renderCount(el, value) {
    var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var val = value.toString();
    while (val.length < pad) val = '0' + val;
    el.textContent = val;
    if (suffix) {
      var s = document.createElement('span');
      s.className = 'sfx';
      s.textContent = suffix;
      el.appendChild(s);
    }
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (prefersReduced) { renderCount(el, target); return; }
    // Slower than a typical odometer, and eased gently, so the digits are
    // legible as they climb rather than snapping to the total.
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 3400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      renderCount(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Hero counters roll as soon as the page loads; the rest on scroll.
  var allCounters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  var heroCounters = allCounters.filter(function (el) { return el.closest('.hero'); });
  var scrollCounters = allCounters.filter(function (el) { return !el.closest('.hero'); });
  window.addEventListener('load', function () {
    setTimeout(function () {
      heroCounters.forEach(function (el) { animateCount(el); });
    }, 900);
  });
  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      counterIO.unobserve(entry.target);
      animateCount(entry.target);
    });
  }, { threshold: 0.6 });
  scrollCounters.forEach(function (el) { counterIO.observe(el); });

  /* ---------------- Parallax (images + drifting arcs + gallery) ---------------- */
  var parallaxImgs = document.querySelectorAll('[data-parallax]');
  var arcs = document.querySelectorAll('[data-drift]');
  var galleryTrack = document.getElementById('galleryTrack');
  var ticking = false;

  function onParallax() {
    if (ticking || prefersReduced) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;

      parallaxImgs.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var ratio = (rect.top + rect.height / 2 - vh / 2) / vh;
        var depth = parseFloat(img.getAttribute('data-parallax')) || 0.1;
        img.style.transform = 'scale(1.12) translateY(' + (ratio * depth * -220) + 'px)';
      });

      arcs.forEach(function (arc) {
        var holder = arc.parentElement.getBoundingClientRect();
        if (holder.bottom < 0 || holder.top > vh) return;
        var ratio = (holder.top + holder.height / 2 - vh / 2) / vh;
        var depth = parseFloat(arc.getAttribute('data-drift')) || 0.06;
        arc.style.transform = 'translateY(' + (ratio * depth * 600) + 'px)';
      });

      if (galleryTrack) {
        var band = galleryTrack.parentElement.getBoundingClientRect();
        if (band.bottom > 0 && band.top < vh) {
          var p = 1 - (band.top + band.height) / (vh + band.height);
          var overflow = galleryTrack.scrollWidth - window.innerWidth;
          galleryTrack.style.transform = 'translateX(' + (-p * overflow) + 'px)';
        }
      }

      ticking = false;
    });
  }
  window.addEventListener('scroll', onParallax, { passive: true });
  window.addEventListener('resize', onParallax);
  onParallax();

  /* ---------------- Magnetic buttons ---------------- */
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.22 + 'px,' + y * 0.28 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });

    /* ---------------- Card tilt ---------------- */
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(800px) rotateY(' + x * 6 + 'deg) rotateX(' + -y * 6 + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------- Farm conveyor: nudge speed with scroll ----------------
     The track loops right to left on its own. Scrolling briefly accelerates
     it so the section feels connected to the page. */
  var farmTrack = document.getElementById('farmTrack');
  if (farmTrack && !prefersReduced) {
    var boostTimer = null;
    window.addEventListener('scroll', function () {
      farmTrack.style.animationDuration = '16s';
      clearTimeout(boostTimer);
      boostTimer = setTimeout(function () {
        farmTrack.style.animationDuration = '';
      }, 320);
    }, { passive: true });
  }

  /* ---------------- Image fallbacks ----------------
     Generated visuals are served from a CDN. If one cannot be reached,
     swap in the local photograph so the layout never shows a broken image. */
  // Member logos are optional: drop the slot entirely when no file is present,
  // so a card without a logo looks deliberate rather than broken.
  document.querySelectorAll('img[data-optional]').forEach(function (img) {
    function drop() {
      var slot = img.closest('.farm-logo, .partner-logo');
      if (slot) { slot.remove(); } else { img.remove(); }
    }
    img.addEventListener('error', drop);
    if (img.complete && img.naturalWidth === 0) { drop(); }
  });

  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      img.src = img.getAttribute('data-fallback');
    });
    if (img.complete && img.naturalWidth === 0) {
      img.src = img.getAttribute('data-fallback');
    }
  });

  /* ---------------- Hero montage: cycle video and stills ---------------- */
  var scenes = document.querySelectorAll('#heroMedia [data-scene]');
  if (scenes.length > 1 && !prefersReduced) {
    var current = 0;
    // The opening video scene holds longer than the stills.
    var holds = [9000, 5500, 5500];
    function nextScene() {
      scenes[current].classList.remove('is-active');
      current = (current + 1) % scenes.length;
      scenes[current].classList.add('is-active');
      var vid = scenes[current].querySelector('video');
      if (vid) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      setTimeout(nextScene, holds[current % holds.length]);
    }
    setTimeout(nextScene, holds[0]);
  }

  /* ---------------- Section headings: subtle scroll-linked drift ---------------- */
  var driftables = document.querySelectorAll('.section-pad .eyebrow, .pull-quote');
  function onDrift() {
    if (prefersReduced) return;
    var vh = window.innerHeight;
    driftables.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var ratio = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = 'translateX(' + (ratio * -18) + 'px)';
    });
  }
  window.addEventListener('scroll', onDrift, { passive: true });
  onDrift();

  /* ---------------- Lazy-start videos when visible ---------------- */
  var vids = document.querySelectorAll('video');
  var vidIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.15 });
  vids.forEach(function (v) { vidIO.observe(v); });
})();
