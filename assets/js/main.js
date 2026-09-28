/* AdTech Prime Solutions — small progressive enhancements. The page works without this file. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHeaderShadow();
    initReveal();
    initSolutionPrefill();
    initContactForm();
    initVideoTiles();
    var year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  });

  /* ---- Mobile navigation ---- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function () { setOpen(false); });
  }

  /* ---- Header shadow once the page scrolls ---- */
  function initHeaderShadow() {
    var header = document.querySelector('[data-header]');
    var sentinel = document.getElementById('top');
    if (!header || !sentinel || !('IntersectionObserver' in window)) return;
    var marker = document.createElement('div');
    marker.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    sentinel.prepend(marker);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(marker);
  }

  /* ---- Fade-in on scroll ---- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Clicking a solution card pre-selects it in the form ---- */
  function initSolutionPrefill() {
    var select = document.querySelector('[data-contact-form] select[name="requirement"]');
    if (!select) return;
    document.querySelectorAll('[data-solution]').forEach(function (card) {
      card.addEventListener('click', function () {
        var value = card.getAttribute('data-solution');
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].text === value) { select.selectedIndex = i; break; }
        }
      });
    });
  }

  /* ---- Contact form: sends the enquiry to sales@adtechprime.in via Web3Forms ---- */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var card = document.querySelector('[data-form-card]');
    var success = card.querySelector('[data-form-success]');
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('[data-submit]');
    var defaultStatus = status.textContent;
    var messages = {
      name: 'Please enter your name.',
      phone: 'Please enter a valid phone number.',
      email: 'Please enter a valid email address.'
    };

    function setStatus(text, kind) {
      status.textContent = text;
      status.className = 'form-status' + (kind ? ' is-' + kind : '');
    }
    function setBusy(busy) {
      submit.disabled = busy;
      submit.classList.toggle('is-loading', busy);
      submit.querySelector('.btn-label').textContent = busy ? 'Sending…' : 'Request site survey';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input:not([type=hidden]):not(.hp), select, textarea').forEach(function (field) {
        var bad = !field.checkValidity();
        field.classList.toggle('is-invalid', bad);
        field.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = field;
      });
      if (firstBad) {
        firstBad.focus();
        setStatus(messages[firstBad.name] || 'Please check the highlighted fields.', 'error');
        return;
      }

      var data = new FormData(form);
      var name = String(data.get('name')).trim();
      var city = String(data.get('city') || '').trim();
      form.querySelector('[data-subject]').value =
        'Site survey request: ' + name + (city ? ' (' + city + ')' : '') + ' — ' + data.get('requirement');
      data = new FormData(form);

      setBusy(true);
      setStatus('Sending your request…');
      fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (json) {
          if (!res.ok || json.success === false) throw new Error(json.message || res.status);
        }); })
        .then(function () {
          card.querySelector('[data-success-name]').textContent = name.split(' ')[0];
          form.hidden = true;
          success.hidden = false;
          success.focus();
          form.reset();
          setStatus(defaultStatus);
        })
        .catch(function () {
          setStatus('We couldn\'t send your request. Please try again, or call +91 77388 24979.', 'error');
        })
        .then(function () { setBusy(false); });
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) {
        e.target.classList.remove('is-invalid');
        e.target.setAttribute('aria-invalid', 'false');
      }
    });

    card.querySelector('[data-form-reset]').addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      form.querySelector('input[name="name"]').focus();
    });
  }

  /* ---- Video tiles: play in a lightbox when a data-video file is set ---- */
  function initVideoTiles() {
    var dialog = document.querySelector('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var video = dialog.querySelector('[data-lightbox-video]');

    document.querySelectorAll('.motion[data-video]').forEach(function (tile) {
      var src = tile.getAttribute('data-video');
      if (!src) { tile.disabled = true; return; }
      tile.addEventListener('click', function () {
        video.src = src;
        dialog.showModal();
        video.play().catch(function () {});
      });
    });
    function close() { video.pause(); video.removeAttribute('src'); video.load(); }
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', close);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }
})();
