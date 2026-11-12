/* Roomila landing — behaviour shared by both variants.
   Classic script (no modules) so the pages also work when opened from disk. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIG — the only values the team needs to change.
     contactEndpoint: where the "Book a call" form is posted. On Vercel this is
                   the function in api/contact.js, which emails the team via Resend.
     contactEmail: optional public address shown in the footer (hidden while empty).
     calLink:      Antoni Małocha's Cal.com event, written as "username/event-slug"
                   (the part after cal.com/ in the booking link). When set, the
                   calendar block (#book) appears above the form and every
                   "Book a call" button leads to it. Empty: block hidden, buttons
                   lead to the form.
     defaultLang:  language shown to a first-time visitor.
     plnPerEur:    rate used to show demo prices in zł on the Polish version.
     ------------------------------------------------------------------ */
  var CONFIG = {
    contactEndpoint: '/api/contact',
    contactEmail: '',
    calLink: '',
    defaultLang: 'pl',
    plnPerEur: 4.3
  };

  var I18N = window.RUMILO_I18N || {};
  var LOCALE = { en: 'en-GB', pl: 'pl-PL' };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  function pick(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function supports(decl) {
    return !!(window.CSS && CSS.supports && CSS.supports(decl));
  }

  /* ---------- language ---------- */

  function detectLang() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* old browser */ }
    if (q && I18N[q]) return q;
    var saved = store.get('rumilo-lang');
    if (saved && I18N[saved]) return saved;
    return CONFIG.defaultLang; // Polish is the base language; English is one click away
  }

  var lang = detectLang();

  function fmtDate(iso, kind) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] || 1));
    var opts = { timeZone: 'UTC' };
    if (kind === 'md') { opts.day = 'numeric'; opts.month = 'short'; }
    else if (kind === 'wmd') { opts.weekday = 'short'; opts.day = 'numeric'; opts.month = 'short'; }
    else if (kind === 'full') { opts.weekday = 'long'; opts.day = 'numeric'; opts.month = 'long'; }
    else if (kind === 'month') { opts.month = 'long'; }
    else if (kind === 'mon') { opts.month = 'short'; }
    else { opts.day = 'numeric'; opts.month = 'long'; }
    var s = new Intl.DateTimeFormat(LOCALE[lang], opts).format(d);
    if (kind !== 'full') s = s.replace(',', ''); // the long form keeps its comma
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function fmtPrice(eur) {
    if (lang === 'pl') {
      var pln = Math.round((eur * CONFIG.plnPerEur) / 10) * 10;
      return new Intl.NumberFormat('pl-PL').format(pln) + ' zł';
    }
    return '€' + new Intl.NumberFormat('en-GB').format(eur);
  }

  // The staggered reveal of calendar cells uses CSS sibling-index(); browsers
  // without it get the index as a custom property instead.
  var needsSiblingIndex = !supports('transition-delay: calc(sibling-index() * 1ms)');

  function renderCalendar(el) {
    var p = el.getAttribute('data-cal').split('-');
    var y = +p[0], m = +p[1];
    var levels = (el.getAttribute('data-levels') || '').split(',');
    var flags = (el.getAttribute('data-flag') || '').split(',');
    var days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday first
    var narrow = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'narrow', timeZone: 'UTC' });
    var html = '<div class="cal__head"><span aria-hidden="true">‹</span><span class="cal__month">' +
      fmtDate(y + '-' + m + '-1', 'month') + '</span><span aria-hidden="true">›</span></div><div class="cal__grid">';
    for (var w = 0; w < 7; w++) {
      // 1 Jan 2024 was a Monday
      html += '<span class="cal__wd">' + narrow.format(new Date(Date.UTC(2024, 0, 1 + w))).toUpperCase() + '</span>';
    }
    for (var b = 0; b < offset; b++) html += '<span class="cal__blank"></span>';
    for (var d = 1; d <= days; d++) {
      var flagged = flags.indexOf(String(d)) !== -1;
      html += '<span class="cal__day' + (flagged ? ' is-flag' : '') + '" data-l="' + (levels[d - 1] || 0) + '">' + d + '</span>';
    }
    el.innerHTML = html + '</div>';
    if (needsSiblingIndex) {
      all('.cal__grid > *', el).forEach(function (cell, i) {
        cell.style.setProperty('--sibling-index', i + 1);
      });
    }
  }

  // Market signals: two identical groups make the loop seamless; the second is hidden from assistive tech.
  function renderTicker(el, t) {
    var arrow = { up: '▲', down: '▼' };
    var word = { up: t.up, down: t.down };
    var items = (t.items || []).map(function (it) {
      var delta = it.d === 'new'
        ? '<span class="tick__d tick__d--new">' + esc(it.v) + '</span>'
        : '<span class="tick__d tick__d--' + it.d + '"><span aria-hidden="true">' + arrow[it.d] + '</span>' +
          '<span class="visually-hidden">' + esc(word[it.d]) + '</span> ' + esc(it.v) + '</span>';
      return '<li class="tick">' + delta + '<span class="tick__t">' + esc(it.t) + '</span></li>';
    }).join('');
    el.innerHTML = '<ul class="ticker__group">' + items + '</ul>' +
      '<ul class="ticker__group" aria-hidden="true">' + items + '</ul>';
  }

  function applyLang(next) {
    lang = I18N[next] ? next : 'en';
    var dict = I18N[lang];
    if (!dict) return;
    root.lang = lang;

    all('[data-i18n]').forEach(function (el) {
      var v = pick(dict, el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    });
    // data-i18n-attr="aria-label:nav.label; placeholder:contact.name"
    all('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':');
        if (kv.length < 2) return;
        var v = pick(dict, kv[1].trim());
        if (typeof v === 'string') el.setAttribute(kv[0].trim(), v);
      });
    });
    all('[data-date]').forEach(function (el) {
      el.textContent = fmtDate(el.getAttribute('data-date'), el.getAttribute('data-fmt'));
    });
    all('[data-price]').forEach(function (el) {
      el.textContent = fmtPrice(+el.getAttribute('data-price'));
    });
    all('[data-cal]').forEach(renderCalendar);
    all('[data-ticker-track]').forEach(function (el) { renderTicker(el, dict.ticker || {}); });

    document.title = dict.meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', dict.meta.desc);

    all('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });
    all('[data-form-lang]').forEach(function (input) { input.value = lang; });

    syncMotionLabel();
    resetRotator();
    syncNav(); // link widths change with the language
  }

  /* ---------- hero: rotating word ---------- */

  var rotatorEl = document.querySelector('[data-rotator]');
  var rotatorTimer = null;
  var rotatorIndex = 0;

  function rotatorWords() { return (I18N[lang] && I18N[lang].hero.words) || []; }

  function resetRotator() {
    if (!rotatorEl) return;
    rotatorIndex = 0;
    rotatorEl.classList.remove('is-out', 'is-in');
    rotatorEl.textContent = rotatorWords()[0] || '';
    stopRotator();
    startRotator();
  }

  // The word leaves upwards (.is-out), is swapped, then enters from below (.is-in → rest).
  // Timers drive the swap, so the word can never get stuck hidden if the tab stops painting.
  function stepRotator() {
    if (rotatorWords().length < 2) return;
    rotatorIndex = (rotatorIndex + 1) % rotatorWords().length;
    rotatorEl.classList.add('is-out');
    window.setTimeout(function () {
      rotatorEl.textContent = rotatorWords()[rotatorIndex] || '';
      rotatorEl.classList.remove('is-out');
      rotatorEl.classList.add('is-in');
      void rotatorEl.offsetWidth; // restart the transition from the lower position
      rotatorEl.classList.remove('is-in');
    }, 300);
  }

  function startRotator() {
    if (!rotatorEl || rotatorTimer || !motionOn() || document.hidden) return;
    rotatorTimer = window.setInterval(stepRotator, 2600);
  }
  function stopRotator() {
    if (rotatorTimer) { window.clearInterval(rotatorTimer); rotatorTimer = null; }
  }

  /* ---------- hero: panels open, change and close in a loop ----------
     Each [data-hv="key"] element is closed until it gets .is-on (see base.css).
     STEPS is the script of one cycle: [time in ms, key, open?]. */

  var hvRoot = document.querySelector('[data-hv-root]');
  var hvEls = {};
  var hvTimers = [];
  var hvInView = true;
  var HV_CYCLE = 17800;
  var HV_STEPS = [
    [150, 'p-tag', 1], [420, 'p-r1', 1], [600, 'p-r2', 1],
    [950, 'i-tag', 1], [1200, 'i-cal', 1],
    [1800, 'o-tag', 1], [2050, 'o-meter', 1],
    [2500, 'r-tag', 1], [2750, 'r-chart', 1], [3200, 'r-line', 1],
    [5300, 'i-flag', 1], [6000, 'i-tip', 1],
    [7500, 'o-fill', 1], [8000, 'o-val', 1],
    [9700, 'p-s1', 1], [10700, 'p-s2', 1],
    [12500, 'i-tip', 0],
    [14500, 'r-chart', 0], [14750, 'r-tag', 0],
    [15000, 'o-meter', 0], [15250, 'o-tag', 0],
    [15500, 'i-cal', 0], [15850, 'i-tag', 0],
    [16100, 'p-r2', 0], [16250, 'p-r1', 0], [16500, 'p-tag', 0],
    [17000, '*', 0]
  ];

  if (hvRoot) {
    all('[data-hv]', hvRoot).forEach(function (el) { hvEls[el.getAttribute('data-hv')] = el; });
  }

  function hvSet(key, on) {
    if (key === '*') {
      Object.keys(hvEls).forEach(function (k) { hvEls[k].classList.toggle('is-on', !!on); });
    } else if (hvEls[key]) {
      hvEls[key].classList.toggle('is-on', !!on);
    }
  }

  function hvClear() {
    hvTimers.forEach(window.clearTimeout);
    hvTimers = [];
  }

  function hvRun() {
    hvClear();
    hvSet('*', false);
    HV_STEPS.forEach(function (s) {
      hvTimers.push(window.setTimeout(function () { hvSet(s[1], s[2]); }, s[0]));
    });
    hvTimers.push(window.setTimeout(hvRun, HV_CYCLE));
  }

  // Runs only while motion is allowed, the tab is visible and the hero is on screen.
  function hvSync() {
    if (!hvRoot) return;
    if (!motionOn()) {
      hvClear();
      root.classList.remove('hv-anim'); // resting state: everything open
      return;
    }
    root.classList.add('hv-anim');
    if (document.hidden || !hvInView) {
      hvClear(); // freeze where it is
    } else if (!hvTimers.length) {
      hvRun();
    }
  }

  window.RUMILO_HV = true; // tells the failsafe in <head> that the sequence is managed

  if (hvRoot && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hvInView = entries[entries.length - 1].isIntersecting;
      hvSync();
    }).observe(hvRoot);
  }

  /* ---------- demo interfaces: small entrance animations ----------
     A .fx element animates its contents when it gets .is-live (see base.css).
     Where module previews show on hover (wide screens with a mouse) they replay
     each time a row is hovered; everywhere else they play once when scrolled into view. */

  var fxEls = all('.fx');
  var fxRows = all('.a-row');
  var hoverPreviews = window.matchMedia('(hover: hover) and (min-width: 1001px)');

  function fxPlay(el) {
    el.classList.remove('is-live');
    void el.offsetWidth; // apply the start state before animating
    el.classList.add('is-live');
  }

  if ('IntersectionObserver' in window) {
    var fxObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var row = el.closest ? el.closest('.a-row') : null;
        // hover layout: only the first preview is visible without a pointer over the list
        if (row && hoverPreviews.matches && row !== fxRows[0]) return;
        fxObserver.unobserve(el);
        fxPlay(el);
      });
    }, { threshold: 0.3 });
    fxEls.forEach(function (el) { fxObserver.observe(el); });
  } else {
    fxEls.forEach(function (el) { el.classList.add('is-live'); });
  }

  fxRows.forEach(function (row) {
    var preview = row.querySelector('.fx');
    if (!preview) return;
    row.addEventListener('mouseenter', function () {
      if (hoverPreviews.matches) fxPlay(preview);
    });
  });
  var fxList = fxRows.length ? fxRows[0].parentNode : null;
  if (fxList) {
    fxList.addEventListener('mouseleave', function () {
      var first = fxRows[0].querySelector('.fx');
      if (hoverPreviews.matches && first) fxPlay(first); // the default preview comes back
    });
  }

  /* ---------- images that may be missing (the hotel photo) ---------- */

  all('img[data-optional]').forEach(function (img) {
    var drop = function () { img.remove(); }; // the patterned placeholder behind it shows instead
    if (img.complete && !img.naturalWidth) drop();
    else img.addEventListener('error', drop);
  });

  /* ---------- motion pause control (ticker, hero, rotating word) ---------- */

  function motionOn() {
    return root.getAttribute('data-motion') !== 'off' && !reduceMotion.matches;
  }

  function syncMotionLabel() {
    var dict = I18N[lang];
    all('[data-motion-toggle]').forEach(function (btn) {
      var paused = root.getAttribute('data-motion') === 'off';
      btn.setAttribute('aria-label', paused ? dict.motion.play : dict.motion.pause);
      btn.setAttribute('title', paused ? dict.motion.play : dict.motion.pause);
      btn.classList.toggle('is-paused', paused);
    });
  }

  function setMotion(on) {
    root.setAttribute('data-motion', on ? 'on' : 'off');
    store.set('rumilo-motion', on ? 'on' : 'off');
    syncMotionLabel();
    if (on) startRotator(); else stopRotator();
    hvSync();
  }

  if (!root.hasAttribute('data-motion')) {
    root.setAttribute('data-motion', store.get('rumilo-motion') === 'off' ? 'off' : 'on');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-motion-toggle]') : null;
    if (t) setMotion(root.getAttribute('data-motion') === 'off');
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopRotator(); else startRotator();
    hvSync();
  });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function () {
      stopRotator();
      startRotator();
      hvSync();
    });
  }

  /* ---------- language switch ---------- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-lang]') : null;
    if (!btn) return;
    var next = btn.getAttribute('data-lang');
    store.set('rumilo-lang', next);
    applyLang(next);
  });

  /* ---------- navigation ----------
     Wide: the links sit in the header row. When the row does not fit (it is measured,
     there is no fixed breakpoint, so a longer translation moves the switch point by
     itself) the header keeps logo, menu button and call to action, and the links
     live in the full-screen menu: a modal <dialog> that slides in from the right. */

  var header = document.querySelector('[data-header]');
  var headerBar = document.querySelector('[data-header-bar]');
  var menu = document.querySelector('[data-menu]');
  var lastHeaderWidth = 0;

  var drawer = document.querySelector('[data-drawer]');
  var drawerScroller = drawer ? drawer.querySelector('[data-drawer-scroller]') : null;
  var drawerSheet = drawer ? drawer.querySelector('[data-drawer-sheet]') : null;
  var drawerOpenBtn = document.querySelector('[data-menu-open]');
  var drawerState = 'closed'; // closed → opening → open → closing → closed
  var drawerTimer = null;

  function syncNav() {
    if (!header || !headerBar) return;
    header.classList.add('is-measuring', 'is-wide');
    var wide = headerBar.scrollWidth <= headerBar.clientWidth;
    header.classList.toggle('is-wide', wide);
    if (wide && drawerState !== 'closed') finishClosingDrawer(); // the links are back in the bar
    window.requestAnimationFrame(function () { header.classList.remove('is-measuring'); });
  }

  if (header && menu) {
    if ('ResizeObserver' in window) {
      // while collapsed, remeasure only when the header has grown (avoids layout thrash)
      var ro = new ResizeObserver(function () {
        var w = header.clientWidth;
        if (header.classList.contains('is-wide') || w > lastHeaderWidth) syncNav();
        lastHeaderWidth = w;
      });
      ro.observe(header);
      ro.observe(menu);
    } else {
      window.addEventListener('resize', syncNav);
    }
  }

  // The panel is the second of two snap stops in a horizontal scroller: at the start
  // of the scroll it is off-screen (closed), at the end it covers the screen (open).
  // Scrolling is the slide; an observer on the panel reports when it has left the
  // screen, and only then is the dialog closed, so the slide-out stays visible.
  function openDrawer() {
    if (!drawer || !drawer.showModal || drawerState !== 'closed') return;
    drawerState = 'opening';
    drawer.showModal();
    drawerOpenBtn.setAttribute('aria-expanded', 'true');
    drawerScroller.scrollTo({ left: drawerScroller.scrollWidth, behavior: 'auto' });
    // safety net: if the slide did not happen (for example the tab is not painting), jump
    window.clearTimeout(drawerTimer);
    drawerTimer = window.setTimeout(function () {
      if (drawerState !== 'opening') return;
      drawerScroller.scrollTo({ left: drawerScroller.scrollWidth, behavior: 'instant' });
      drawerState = 'open';
    }, 1200);
  }

  function closeDrawer() {
    if (!drawer || drawerState === 'closed' || drawerState === 'closing') return;
    drawerState = 'closing';
    drawerScroller.scrollTo({ left: 0, behavior: 'auto' });
    window.clearTimeout(drawerTimer);
    drawerTimer = window.setTimeout(function () {
      if (drawerState === 'closing') finishClosingDrawer();
    }, 1200);
  }

  function finishClosingDrawer() {
    window.clearTimeout(drawerTimer);
    drawerState = 'closed';
    if (drawer.open) drawer.close(); // the browser returns focus to the menu button
    drawerOpenBtn.setAttribute('aria-expanded', 'false');
  }

  if (drawer && drawerOpenBtn) {
    drawerOpenBtn.addEventListener('click', openDrawer);
    all('[data-drawer-close]', drawer).forEach(function (btn) {
      btn.addEventListener('click', closeDrawer);
    });
    // following a link (or the call to action) closes the menu
    drawerSheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });
    // Escape: slide out instead of disappearing at once
    drawer.addEventListener('cancel', function (e) {
      if (e.cancelable) {
        e.preventDefault();
        closeDrawer();
      } else {
        finishClosingDrawer();
      }
    });
    drawer.addEventListener('close', function () {
      if (drawerState !== 'closed') finishClosingDrawer();
    });

    if ('IntersectionObserver' in window) {
      var seen = 1 / Math.max(window.innerWidth, 1); // "at least a pixel of the panel is on screen"
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        if (entry.intersectionRatio >= seen) {
          if (drawerState === 'opening' && entry.intersectionRatio > 0.99) drawerState = 'open';
        } else if (drawerState === 'open' || drawerState === 'closing') {
          finishClosingDrawer(); // slid or swiped fully off-screen
        }
      }, { root: drawer, threshold: [seen, 0.5, 1] }).observe(drawerSheet);
    }

    // browsers without scroll-driven animations: tie the dim to the scroll by hand
    if (!supports('animation-timeline: scroll()')) {
      drawerScroller.addEventListener('scroll', function () {
        drawer.style.setProperty('--drawer-backdrop', drawerScroller.scrollLeft / Math.max(drawerSheet.offsetWidth, 1));
      });
    }

    if (needsSiblingIndex) {
      all('.drawer__nav li', drawer).forEach(function (li, i) { li.style.setProperty('--sibling-index', i + 1); });
    }
  }

  /* ---------- "why" accordion: side panel follows the item opened last ---------- */

  var whyPanel = document.querySelector('[data-why-panel]');
  if (whyPanel) {
    // toggle does not bubble, hence capture
    document.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d && d.matches && d.matches('details[data-panel]') && d.open) {
        whyPanel.setAttribute('data-active', d.getAttribute('data-panel'));
      }
    }, true);
  }

  /* ---------- contact: optional public email, optional booking link, call-request form ---------- */

  all('[data-email]').forEach(function (a) {
    if (!CONFIG.contactEmail) return; // stays hidden until an address is set
    a.setAttribute('href', 'mailto:' + CONFIG.contactEmail);
    a.textContent = CONFIG.contactEmail;
    a.hidden = false;
  });

  /* Booking calendar (Cal.com inline embed). The embed script is fetched only when the
     block comes near the viewport or a "Book a call" button is pressed. */
  var book = document.querySelector('[data-book]');
  var calBox = book && book.querySelector('[data-cal-inline]');
  if (book && calBox && CONFIG.calLink) {
    var CAL_ORIGIN = 'https://app.cal.com';
    var CAL_SCRIPT = CAL_ORIGIN + '/embed/embed.js';
    var calNote = book.querySelector('[data-cal-note]');
    var calStarted = false;

    var calFailed = function () {
      if (calBox.getAttribute('data-state') === 'ready' || !calNote) return;
      calBox.setAttribute('data-state', 'failed');
      calNote.setAttribute('data-i18n', 'book.failed');
      calNote.textContent = pick(I18N[lang] || {}, 'book.failed') || '';
    };

    var startCal = function () {
      if (calStarted) return;
      calStarted = true;
      // Cal.com's own loader: queues calls until embed.js has arrived
      /* eslint-disable */
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, CAL_SCRIPT, 'init');
      /* eslint-enable */
      var Cal = window.Cal;
      Cal('init', 'rumilo', { origin: CAL_ORIGIN });
      var tag = document.querySelector('script[src="' + CAL_SCRIPT + '"]');
      if (tag) tag.addEventListener('error', calFailed);

      var calApi = Cal.ns.rumilo;
      calApi('inline', {
        elementOrSelector: calBox,
        calLink: CONFIG.calLink,
        config: { layout: 'month_view', theme: 'dark' }
      });
      calApi('ui', {
        theme: 'dark',
        layout: 'month_view',
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          dark: {
            'cal-brand': '#ffffff',
            'cal-brand-text': '#151515',
            'cal-bg': '#151515',
            'cal-bg-muted': '#1c1c1c',
            'cal-bg-subtle': '#242424',
            'cal-border-booker': 'rgba(255, 255, 255, 0.12)',
            radius: '0px'
          }
        }
      });
      calApi('on', {
        action: 'linkReady',
        callback: function () { calBox.setAttribute('data-state', 'ready'); }
      });
      calApi('on', { action: 'linkFailed', callback: calFailed });
    };

    book.hidden = false;
    all('[data-cta-call]').forEach(function (a) {
      a.setAttribute('href', '#book');
      a.addEventListener('click', startCal);
    });
    if (window.location.hash === '#book' || !('IntersectionObserver' in window)) {
      startCal(); // opened straight on the calendar, or no way to watch for it
    } else {
      var calWatch = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        calWatch.disconnect();
        startCal();
      }, { rootMargin: '800px 0px' });
      calWatch.observe(book);
    }
  }

  var form = document.querySelector('[data-call-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var required = all('[required]', form);

    // without JavaScript the form posts to the same endpoint as a normal page request
    form.setAttribute('action', CONFIG.contactEndpoint);

    // :user-invalid is only visual, so mirror it into aria-invalid and link the
    // error text to the field only while the field is invalid.
    var syncAria = function (el) {
      var invalid = false;
      try { invalid = el.matches(':user-invalid'); } catch (e) { invalid = false; }
      el.setAttribute('aria-invalid', String(invalid));
      var errId = el.getAttribute('data-error');
      if (!errId) return;
      if (invalid) el.setAttribute('aria-describedby', errId);
      else el.removeAttribute('aria-describedby');
    };
    required.forEach(function (el) {
      el.setAttribute('aria-invalid', 'false');
      ['blur', 'change', 'input'].forEach(function (type) {
        el.addEventListener(type, function () { syncAria(el); });
      });
      // fires when a submit attempt is blocked; :user-invalid applies right after
      el.addEventListener('invalid', function () {
        window.setTimeout(function () { syncAria(el); }, 0);
      });
    });
    form.addEventListener('reset', function () {
      window.setTimeout(function () { required.forEach(syncAria); }, 0);
    });

    var setBusy = function (busy) {
      form.setAttribute('aria-busy', String(busy));
      submitBtn.disabled = busy; // no double posts while a request is on its way
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dict = I18N[lang];
      var f = form.elements;
      var payload = {
        name: f.name.value.trim(),
        hotel: f.hotel.value.trim(),
        reach: f.reach.value.trim(),
        time: f.time.value.trim(),
        consent: f.consent.checked ? 'yes' : '',
        lang: lang,
        company_site: f.company_site.value // spam trap, empty for real visitors
      };
      if (!payload.name || !payload.hotel || !payload.reach || !payload.consent) {
        status.textContent = dict.contact.err;
        return;
      }
      setBusy(true);
      status.textContent = dict.contact.sending;
      window.fetch(CONFIG.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error('send failed');
          form.reset();
          status.textContent = I18N[lang].contact.sent;
        });
      }).catch(function () {
        status.textContent = I18N[lang].contact.fail;
      }).then(function () {
        setBusy(false);
      });
    });
  }

  applyLang(lang);
  hvSync();
})();
