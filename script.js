/* ==========================================================
   Tavola Urbana — script.js
   - Scroll animation Canvas (food-fresh, 151 frame .webp)
   - IntersectionObserver: .fade-up e .stagger-card
   - Anno corrente nel footer
   Vanilla JS, no dipendenze esterne.
   ========================================================== */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Anno corrente nel footer
  // ----------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl && (!yearEl.textContent || /^\{\{/.test(yearEl.textContent))) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----------------------------------------------------------
  // Scroll Animation — food-fresh
  // FRAME_COUNT = 151
  // ----------------------------------------------------------
  var canvas = document.getElementById('scroll-canvas');
  var section = document.getElementById('scroll-anim');

  if (canvas && section) {
    var ctx = canvas.getContext('2d');

    var FRAME_PATH = 'assets/scroll/frames-upscaled/';
    var FRAME_COUNT = 151;
    var FRAME_PREFIX = 'frame_';
    var FRAME_PAD = 4;
    var FRAME_EXT = '.webp';

    var images = [];
    var loaded = 0;

    function setupCanvas() {
      var pin = section.querySelector('.scroll-anim-pin');
      if (!pin) return;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = pin.clientWidth * dpr;
      canvas.height = pin.clientHeight * dpr;
    }

    function render(progress) {
      var idx = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(progress * FRAME_COUNT))
      );
      var img = images[idx];
      if (!img || !img.complete) return;

      var cw = canvas.width;
      var ch = canvas.height;
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;

      // object-fit:cover via drawImage
      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale;
      var dh = ih * scale;
      var dx = (cw - dw) / 2;
      var dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function onScroll() {
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) { render(0); return; }
      var progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      render(progress);
    }

    // Preload frame
    for (var i = 1; i <= FRAME_COUNT; i++) {
      var img = new Image();
      var num = String(i);
      while (num.length < FRAME_PAD) num = '0' + num;
      img.src = FRAME_PATH + FRAME_PREFIX + num + FRAME_EXT;
      img.onload = (function () {
        loaded++;
        if (loaded === 1) {
          setupCanvas();
          onScroll();
        }
      });
      images.push(img);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      setupCanvas();
      onScroll();
    });
  }

  // ----------------------------------------------------------
  // IntersectionObserver — Fade Up
  // ----------------------------------------------------------
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      fadeObserver.observe(el);
    });

    // ----------------------------------------------------------
    // IntersectionObserver — Stagger Cards (menu + gallery)
    // ----------------------------------------------------------
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.dataset.stagger || 0, 10) * 120;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stagger-card').forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up, .stagger-card').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();
