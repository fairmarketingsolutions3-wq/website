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

  /* ---------------- Reveal on scroll ---------------- */
  var revealables = document.querySelectorAll('[data-reveal], [data-stagger], .trace, .timeline');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  revealables.forEach(function (el) { io.observe(el); });

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll('[data-count]');
  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      counterIO.unobserve(entry.target);
      animateCount(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { counterIO.observe(el); });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased).toString();
      while (val.length < pad) val = '0' + val;
      el.textContent = val;
      if (p < 1) requestAnimationFrame(frame);
    }
    if (prefersReduced) {
      var val = target.toString();
      while (val.length < pad) val = '0' + val;
      el.textContent = val;
      return;
    }
    requestAnimationFrame(frame);
  }

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

  /* ---------------- Farm strip: drag to scroll ---------------- */
  var strip = document.getElementById('farmStrip');
  if (strip) {
    var isDown = false, startX = 0, startScroll = 0;
    strip.addEventListener('pointerdown', function (e) {
      isDown = true;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
      strip.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      strip.scrollLeft = startScroll - (e.clientX - startX);
    });
    window.addEventListener('pointerup', function () {
      isDown = false;
      strip.classList.remove('dragging');
    });
  }

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
