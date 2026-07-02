// Fair Agro — scroll motion engine (vanilla)
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__motionFactor = 1; // tweaks panel may change this

  // ---- split headline words into masked spans ----
  doc.querySelectorAll('[data-words]').forEach(function (el) {
    var stagger = 0;
    function split(node) {
      if (node.nodeType === 3) {
        var frag = doc.createDocumentFragment();
        node.textContent.split(/\s+/).forEach(function (word, i, arr) {
          if (!word) return;
          var w = doc.createElement('span'); w.className = 'w';
          var wi = doc.createElement('span'); wi.className = 'wi';
          wi.textContent = word;
          wi.style.transitionDelay = (stagger++ * 70) + 'ms';
          w.appendChild(wi); frag.appendChild(w);
          if (i < arr.length - 1) frag.appendChild(doc.createTextNode(' '));
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName === 'BR') {
        // keep
      } else if (node.nodeType === 1 && !node.classList.contains('w')) {
        Array.prototype.slice.call(node.childNodes).forEach(split);
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(split);
  });

  // ---- stagger children delays ----
  doc.querySelectorAll('[data-stagger]').forEach(function (el) {
    var step = parseInt(el.getAttribute('data-stagger'), 10) || 90;
    Array.prototype.forEach.call(el.children, function (c, i) {
      c.style.transitionDelay = (i * step) + 'ms';
    });
  });

  // ---- intersection reveals (IO + rect-based fallback for throttled iframes) ----
  var pending = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal],[data-stagger],[data-words],.tl-item'));
  function markIn(el) {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
    if (io) io.unobserve(el);
  }
  var io = null;
  try {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) markIn(e.target); });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    pending.forEach(function (el) { io.observe(el); });
  } catch (err) { /* fall through to rect checks */ }
  function rectSweep() {
    var vh = window.innerHeight;
    pending.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) markIn(el);
    });
  }
  // if IO never fired for anything visible (throttled/unavailable), rect checks take over
  setTimeout(rectSweep, 700);

  // ---- animated counters ----
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.firstChild.textContent = Math.round(target * p);
      if (p < 1) requestAnimationFrame(tick);
    }
    el.innerHTML = '0<i>' + suffix + '</i>';
    if (reduced || window.__motionFactor === 0) { el.firstChild.textContent = target; return; }
    requestAnimationFrame(tick);
  }
  var counters = Array.prototype.slice.call(doc.querySelectorAll('[data-count]'));
  function startCounter(el) {
    if (el.__counted) return;
    el.__counted = true;
    var i = counters.indexOf(el);
    if (i > -1) counters.splice(i, 1);
    if (cio) cio.unobserve(el);
    runCounter(el);
  }
  var cio = null;
  try {
    cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) startCounter(e.target); });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } catch (err) { /* rect fallback below */ }
  function counterSweep() {
    var vh = window.innerHeight;
    counters.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) startCounter(el);
    });
  }

  // ---- marquee: duplicate track for seamless loop ----
  doc.querySelectorAll('.marquee').forEach(function (m) {
    var track = m.querySelector('.track');
    m.appendChild(track.cloneNode(true));
  });

  // ---- rAF scroll effects: progress bar, nav, parallax, timeline spine, card stack ----
  var progress = doc.getElementById('progress');
  var nav = doc.getElementById('nav');
  var hero = doc.getElementById('hero');
  var spine = doc.querySelector('.tl .spine i');
  var tl = doc.querySelector('.tl');
  var parallaxEls = Array.prototype.slice.call(doc.querySelectorAll('[data-parallax]'));
  var cards = Array.prototype.slice.call(doc.querySelectorAll('.scard'));
  var ticking = false;

  function update() {
    ticking = false;
    rectSweep();
    counterSweep();
    var y = window.scrollY, vh = window.innerHeight;
    var f = reduced ? 0 : window.__motionFactor;

    if (progress) {
      var max = root.scrollHeight - vh;
      progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    }
    if (nav) nav.classList.toggle('solid', y > (hero ? hero.offsetHeight - 120 : 200));

    // hero content parallax fade
    if (hero) {
      var hwrap = hero.__wrap || (hero.__wrap = hero.querySelector('.wrap'));
      if (hwrap) {
        if (f) {
          var hp = vh ? Math.min(1, y / (vh * 0.95)) : 0;
          hwrap.style.transform = 'translateY(' + (hp * -70).toFixed(1) + 'px)';
          hwrap.style.opacity = (1 - hp * 0.95).toFixed(3);
        } else { hwrap.style.transform = ''; hwrap.style.opacity = ''; }
      }
    }

    parallaxEls.forEach(function (el) {
      var sp = parseFloat(el.getAttribute('data-parallax')) * f;
      if (!sp) { el.style.transform = ''; return; }
      var r = el.getBoundingClientRect();
      var center = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translateY(' + (center * -sp).toFixed(1) + 'px)';
    });

    if (spine && tl) {
      var r2 = tl.getBoundingClientRect();
      var p = (vh * 0.7 - r2.top) / r2.height;
      spine.style.setProperty('--p', Math.max(0, Math.min(1, p)));
      tl.parentNode.style.setProperty('--p', Math.max(0, Math.min(1, p)));
      spine.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
    }

    // stacked cards: scale down + dim as the next card covers them
    cards.forEach(function (card, i) {
      if (i === cards.length - 1 || f === 0) { card.style.transform = ''; card.style.filter = ''; return; }
      var next = cards[i + 1];
      var nr = next.getBoundingClientRect();
      var cover = Math.max(0, Math.min(1, (vh - nr.top) / vh));
      card.style.transform = 'scale(' + (1 - cover * 0.05) + ')';
      card.style.filter = 'brightness(' + (1 - cover * 0.18) + ')';
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // ===== heavy interaction layer (pointer-fine, motion-on only) =====
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // ---- scroll-spy: highlight active nav link ----
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('#nav .links a'));
  var linkFor = {};
  navLinks.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') linkFor[href.slice(1)] = a;
  });
  var spySects = Object.keys(linkFor).map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  if (spySects.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = linkFor[e.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spySects.forEach(function (s) { sio.observe(s); });
  }

  if (fine && !reduced) {
    // ---- custom cursor (dot + trailing ring) ----
    var dot = doc.createElement('div'); dot.className = 'cur-dot';
    var ring = doc.createElement('div'); ring.className = 'cur-ring';
    doc.body.appendChild(dot); doc.body.appendChild(ring);
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, shown = false;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      if (!shown) { shown = true; doc.body.classList.add('cur-on'); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { doc.body.classList.remove('cur-on'); shown = false; });
    (function ringLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(ringLoop);
    })();
    var hotSel = 'a,button,.chal,.chain .node,.person,.rec,.scard,.social-link,.valrow .val';
    doc.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hotSel)) ring.classList.add('hot');
    });
    doc.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hotSel) &&
          !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hotSel))) {
        ring.classList.remove('hot');
      }
    });

    // ---- magnetic buttons / icons ----
    Array.prototype.slice.call(doc.querySelectorAll('.btn,.social-link')).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (!window.__motionFactor) return;
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var yy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x * 0.3).toFixed(1) + 'px,' + (yy * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    // ---- 3D tilt on cards ----
    Array.prototype.slice.call(doc.querySelectorAll('.chal,.chain .node,.person,.vmv>div')).forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (!window.__motionFactor) return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .08s linear';
        el.style.transform = 'perspective(820px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' +
          (px * 5).toFixed(2) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transition = ''; el.style.transform = ''; });
    });
  }
})();
