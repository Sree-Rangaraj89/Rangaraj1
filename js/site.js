/* ==========================================================================
   site.js — theme pull-cord, nav, reveals, counters, filters, form
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- THEME (pull-cord) ---------------- */
  var STORE = 'rj-theme';
  var root  = document.documentElement;

  function apply(t) {
    root.setAttribute('data-theme', t);
    var knob = document.querySelector('.cord__knob');
    var hint = document.querySelector('.cord__hint');
    if (knob) knob.textContent = t === 'dark' ? 'DAY' : 'NGT';
    if (hint) hint.textContent = t === 'dark' ? 'pull for light' : 'pull for dark';
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0A0E27' : '#F5F5F5');
  }

  function stored() {
    try { return localStorage.getItem(STORE); } catch (e) { return null; }
  }

  // set before paint (also inlined in <head> to kill flash)
  apply(stored() || 'light');

  function toggle() {
    var cord = document.querySelector('.cord');
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    if (cord) {
      cord.classList.remove('is-pulled');
      void cord.offsetWidth;             // reflow to restart animation
      cord.classList.add('is-pulled');
      setTimeout(function () { cord.classList.remove('is-pulled'); }, 900);
    }

    var sweep = document.querySelector('.theme-sweep');
    if (sweep && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sweep.classList.remove('run');
      void sweep.offsetWidth;
      sweep.classList.add('run');
      setTimeout(function () { apply(next); }, 190);
      setTimeout(function () { sweep.classList.remove('run'); }, 680);
    } else {
      apply(next);
    }

    try { localStorage.setItem(STORE, next); } catch (e) {}
  }

  /* ---------------- BOOT ---------------- */
  document.addEventListener('DOMContentLoaded', function () {

    var cord = document.querySelector('.cord');
    if (cord) cord.addEventListener('click', toggle);

    /* ---- mobile nav ---- */
    var burger = document.querySelector('.nav__burger');
    var links  = document.querySelector('.nav__links');
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.querySelector('span').textContent = open ? 'CLOSE' : 'MENU';
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          burger.querySelector('span').textContent = 'MENU';
        }
      });
    }

    /* ---- scroll reveal ---- */
    var rv = document.querySelectorAll('.rv, .rv-clip');
    if ('IntersectionObserver' in window && rv.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---- progress bars ---- */
    var bars = document.querySelectorAll('.prog i');
    if ('IntersectionObserver' in window && bars.length) {
      var pio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            var p = e.target.getAttribute('data-p') || '0';
            setTimeout(function () { e.target.style.width = p + '%'; }, 120);
            pio.unobserve(e.target);
          }
        });
      }, { threshold: .4 });
      bars.forEach(function (b) { pio.observe(b); });
    } else {
      bars.forEach(function (b) { b.style.width = (b.getAttribute('data-p') || 0) + '%'; });
    }

    /* ---- stat counters ---- */
    var nums = document.querySelectorAll('[data-count]');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec    = (el.getAttribute('data-dec') | 0);
      if (reduce) { el.textContent = target.toFixed(dec); return; }
      var dur = 1500, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && nums.length) {
      var nio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { run(e.target); nio.unobserve(e.target); }
        });
      }, { threshold: .5 });
      nums.forEach(function (n) { nio.observe(n); });
    } else {
      nums.forEach(run);
    }

    /* ---- project filters ---- */
    var fbtns = document.querySelectorAll('.filters button');
    var cards = document.querySelectorAll('[data-tags]');
    var empty = document.querySelector('.noresult');

    if (fbtns.length && cards.length) {
      fbtns.forEach(function (b) {
        b.addEventListener('click', function () {
          var f = b.getAttribute('data-filter');
          fbtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          var shown = 0;
          cards.forEach(function (c) {
            var tags = (c.getAttribute('data-tags') || '').split(/\s+/);
            var ok = (f === 'all') || tags.indexOf(f) > -1;
            c.classList.toggle('hide', !ok);
            if (ok) {
              shown++;
              c.classList.remove('in');
              void c.offsetWidth;
              c.classList.add('in');
            }
          });
          if (empty) empty.hidden = shown > 0;
        });
      });
    }

    /* ---- mailto contact form ---- */
    var form = document.querySelector('#contact-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var g = function (n) {
          var el = form.querySelector('[name="' + n + '"]');
          return el ? el.value.trim() : '';
        };
        var name = g('name'), mail = g('email'), topic = g('topic'), msg = g('message');
        if (!name || !mail || !msg) {
          var s = form.querySelector('.formnote');
          if (s) { s.textContent = '! FILL NAME, EMAIL AND MESSAGE FIRST'; s.style.color = 'var(--red)'; }
          return;
        }
        var subject = '[' + (topic || 'General') + '] Message from ' + name;
        var body = 'Name: ' + name + '\nEmail: ' + mail + '\nTopic: ' + (topic || '-') +
                   '\n\n' + msg + '\n\n— sent from rangaraj.site';
        window.location.href = 'mailto:sreerangaraj1@gmail.com?subject=' +
          encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        var note = form.querySelector('.formnote');
        if (note) { note.textContent = '> OPENING YOUR MAIL APP…'; note.style.color = 'var(--ink-faint)'; }
      });
    }

    /* ---- year stamps ---- */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---- countdown (coming-soon) ---- */
    var cd = document.querySelector('[data-until]');
    if (cd) {
      var end = new Date(cd.getAttribute('data-until')).getTime();
      var out = {
        d: cd.querySelector('[data-u="d"]'), h: cd.querySelector('[data-u="h"]'),
        m: cd.querySelector('[data-u="m"]'), s: cd.querySelector('[data-u="s"]')
      };
      var tick = function () {
        var gap = end - Date.now();
        if (gap < 0) gap = 0;
        var d = Math.floor(gap / 864e5),
            h = Math.floor(gap % 864e5 / 36e5),
            m = Math.floor(gap % 36e5 / 6e4),
            s = Math.floor(gap % 6e4 / 1e3);
        if (out.d) out.d.textContent = d;
        if (out.h) out.h.textContent = String(h).padStart(2, '0');
        if (out.m) out.m.textContent = String(m).padStart(2, '0');
        if (out.s) out.s.textContent = String(s).padStart(2, '0');
      };
      tick(); setInterval(tick, 1000);
    }

    /* ---- video slot ----
       Probes for the hero file first so no 404 is logged while the slot
       is still empty. Drop assets/hero.mp4 in and it wires itself up. */
    var vid = document.querySelector('.vslot video[data-src]');
    if (vid && window.fetch) {
      fetch('assets/manifest.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (cfg) {
          if (!cfg || cfg.heroVideo !== true) return;   // slot stays a placeholder
          if (cfg.heroPoster === true) vid.poster = 'assets/hero-poster.jpg';
          vid.src = vid.getAttribute('data-src');
          vid.setAttribute('autoplay', '');
          vid.addEventListener('loadeddata', function () {
            var ph = document.querySelector('.vslot__ph');
            if (ph) ph.style.display = 'none';
          });
          var play = vid.play();
          if (play && play.catch) play.catch(function () {});
        })
        .catch(function () {});
    }
  });
})();
