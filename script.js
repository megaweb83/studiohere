/* =========================================================================
   STUDIO HERE — v2 script
   1) splash · nav · progress   2) smooth scroll + spy   3) reveal
   4) hero parallax             5) work tilt + cursor    6) calculator
   7) filters                   8) modal                 9) contact form
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------------------------------------------------- 1. splash */
  var splash = $('#splash');
  function hideSplash() {
    if (!splash || splash.classList.contains('is-done')) return;
    splash.classList.add('is-done');
    window.setTimeout(function () { splash.style.display = 'none'; }, 900);
  }
  window.addEventListener('load', function () { window.setTimeout(hideSplash, 280); });
  window.setTimeout(hideSplash, 2400);

  /* ---------------------------------------------------- nav + progress */
  var nav = $('#siteHeader');
  var progressBar = $('#progressBar');
  var lightSections = $$('.section-light');
  var hero = $('.hero');

  function navHeight() {
    return window.innerWidth <= 900 ? 68 : 76;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (progressBar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.parentNode.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1) : 0);
      }
      if (nav) {
        nav.classList.toggle('is-stuck', y > 16);
        var light = [16, 40, 66].filter(function (probe) {
          return lightSections.some(function (sec) {
            var r = sec.getBoundingClientRect();
            return probe >= r.top && probe < r.bottom;
          });
        }).length;
        var overLight = light === 3;
        nav.classList.toggle('is-light', overLight);
      }
      updateSpy(y);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------- mobile menu */
  var menu = $('#menuPanel');
  var menuBtn = $('#menuBtn');
  var menuClose = $('#menuClose');

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
    document.body.classList.add('is-locked');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    window.setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500);
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  $$('#menuPanel a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ---------------------------------------------------- smooth scroll */
  function scrollToAnchor(target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset - (navHeight() - 8);
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    var settled = false;
    var correct = function () {
      if (settled) return;
      settled = true;
      var delta = target.getBoundingClientRect().top - (navHeight() - 8);
      if (Math.abs(delta) > 2) window.scrollTo({ top: window.pageYOffset + delta, behavior: 'auto' });
    };
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', correct, { once: true });
      window.setTimeout(correct, 1500);
    } else {
      window.setTimeout(correct, 720);
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToAnchor(target);
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------------------------------------------------- scroll spy */
  var spyLinks = $$('.nav-links a[href^="#"]');
  var spyTargets = spyLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  function updateSpy(y) {
    if (!spyLinks.length) return;
    var line = y + 150;
    var contactSec = document.querySelector('#contact');
    if (contactSec && contactSec.getBoundingClientRect().top <= 140) {
      spyLinks.forEach(function (a) { a.classList.remove('is-active'); });
      return;
    }
    var active = -1;
    spyTargets.forEach(function (t, i) {
      if (t && t.getBoundingClientRect().top + y <= line) active = i;
    });
    spyLinks.forEach(function (a, i) {
      a.classList.toggle('is-active', i === active);
    });
  }

  /* ---------------------------------------------------- 3. reveal */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var idx = parseInt(el.getAttribute('data-i') || '0', 10);
        el.style.transitionDelay = Math.min(idx, 3) * 70 + 'ms';
        el.classList.add('in');
        ro.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* stagger indexes */
  $$('.svc').forEach(function (el, i) { el.setAttribute('data-i', String(i % 3)); });
  $$('.work-card').forEach(function (el, i) { el.setAttribute('data-i', String(i % 3)); });
  $$('.step').forEach(function (el, i) { el.setAttribute('data-i', String(i)); });

  /* ---------------------------------------------------- counters */
  var counters = $$('.num[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce || target === 0) { el.textContent = String(target); return; }
    var start = null, dur = 1500;
    function step(t) {
      if (!start) start = t;
      var p = clamp((t - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var stats = $('.stats');
  if (stats && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        counters.forEach(runCounter);
        so.disconnect();
      });
    }, { threshold: 0.3 });
    so.observe(stats);
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------------------------------------------- 4. hero parallax */
  var stage = $('.hero-stage');
  var fcards = $$('.fcard');
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var heroVisible = true;
  var rafId = null;

  function applyHero() {
    var sy = window.pageYOffset * -1;
    fcards.forEach(function (card) {
      var depth = parseFloat(card.getAttribute('data-depth') || '20');
      var drift = parseFloat(card.getAttribute('data-drift') || '0.12');
      card.style.setProperty('--tx', (pointer.x * depth).toFixed(2) + 'px');
      card.style.setProperty('--ty', (pointer.y * depth).toFixed(2) + 'px');
      var shift = Math.max(-170, Math.min(90, sy * drift));
      card.style.setProperty('--sy', shift.toFixed(2) + 'px');
    });
  }

  function heroLoop() {
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    applyHero();
    if (Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001) {
      rafId = window.requestAnimationFrame(heroLoop);
    } else {
      rafId = null;
    }
  }
  function kickHero() {
    if (!rafId) rafId = window.requestAnimationFrame(heroLoop);
  }

  if (stage && finePointer && !reduce) {
    window.addEventListener('pointermove', function (e) {
      if (!heroVisible) return;
      var r = stage.getBoundingClientRect();
      pointer.tx = clamp(((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 1.6, -1, 1);
      pointer.ty = clamp(((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 1.6, -1, 1);
      kickHero();
    }, { passive: true });
  }

  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }

  if (!reduce) {
    var lastY = window.pageYOffset;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      if (Math.abs(y - lastY) < 1) return;
      lastY = y;
      if (fcards.length) applyHero();
    }, { passive: true });
  }

  /* ---------------------------------------------------- 5. cursor + tilt */
  var cursor = $('#cursor');
  if (cursor && finePointer && !reduce) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tcx = cx, tcy = cy, curRunning = false;
    function cursorLoop() {
      cx += (tcx - cx) * 0.18;
      cy += (tcy - cy) * 0.18;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (Math.abs(tcx - cx) > 0.2 || Math.abs(tcy - cy) > 0.2) {
        window.requestAnimationFrame(cursorLoop);
      } else {
        curRunning = false;
      }
    }
    window.addEventListener('pointermove', function (e) {
      tcx = e.clientX; tcy = e.clientY;
      if (e.pointerType === 'mouse') cursor.classList.add('is-on');
      if (!curRunning) { curRunning = true; window.requestAnimationFrame(cursorLoop); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cursor.classList.remove('is-on', 'is-view'); });
    $$('[data-cursor]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-view'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-view'); });
    });
  }

  if (finePointer && !reduce) {
    $$('.work-card').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(1000px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' +
            (px * 6).toFixed(2) + 'deg) translateY(-6px)';
          raf = null;
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------- 6. calculator */
  var SVC = {
    imweb:  { label: '아임웹 노코드 반응형 웹',    base: 1500000, per: 150000, incl: 4, unit: '페이지', short: '페이지', type: 'imweb',  lead: '2~4주', max: 30, def: 5 },
    corp:   { label: 'UI/UX 반응형 웹 & 퍼블리싱', base: 2400000, per: 220000, incl: 4, unit: '페이지', short: '페이지', type: 'web',    lead: '6~8주', max: 40, def: 6 },
    pub:    { label: '웹·앱 퍼블리싱·유지보수',    base: 1200000, per: 130000, incl: 2, unit: '페이지', short: '페이지', type: 'web',    lead: '3~4주', max: 40, def: 5 },
    detail: { label: '고전환 상세페이지',          base: 150000,  per: 120000, incl: 1, unit: '페이지(8,000px)', short: '페이지', type: 'design', lead: '3~5일', max: 20, def: 2 },
    bi:     { label: '브랜드 아이덴티티',          base: 1500000, per: 300000, incl: 1, unit: '응용 항목', short: '항목', type: 'design', lead: '2~3주', max: 12, def: 3 },
    ir:     { label: '기업 IR·브로셔',             base: 500000,  per: 120000, incl: 2, unit: '스프레드', short: '스프레드', type: 'design', lead: '1~2주', max: 20, def: 4 }
  };

  var calcForm = $('#calcForm');
  var qty = $('#qty');
  var qtyOut = $('#qtyOut');
  var qtyLegend = $('#qtyLegend');
  var qtyHint = $('#qtyHint');
  var optPublish = $('#optPublish');
  var optPublishTitle = $('#optPublishTitle');
  var optPublishDesc = $('#optPublishDesc');
  var optPlan = $('#optPlan');
  var optA11y = $('#optA11y');
  var optRush = $('#optRush');
  var outTotal = $('#calcTotal');
  var outVat = $('#calcVat');
  var outBreak = $('#calcBreak');
  var outLead = $('#calcLead');
  var goBtn = $('#calcGo');

  var won = function (n) { return Math.round(n).toLocaleString('ko-KR') + '원'; };
  var roundMan = function (n) { return Math.round(n / 10000) * 10000; };

  function checkedSvc() {
    return calcForm ? calcForm.querySelector('input[name="svc"]:checked') : null;
  }
  function currentKey() { var c = checkedSvc(); return c ? c.value : 'corp'; }
  function currentSvc() { return SVC[currentKey()] || SVC.corp; }

  function paintRange() {
    if (!qty) return;
    var min = +qty.min, max = +qty.max, val = +qty.value;
    qty.style.setProperty('--fill', (((val - min) / (max - min)) * 100) + '%');
  }

  var shownTotal = 0;
  function setTotal(total) {
    var from = shownTotal;
    shownTotal = total;
    if (reduce || from === total) {
      outTotal.innerHTML = total.toLocaleString('ko-KR') + '<span>원</span>';
      return;
    }
    var start = null, dur = 620;
    function tick(t) {
      if (!start) start = t;
      var p = clamp((t - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(from + (total - from) * eased);
      outTotal.innerHTML = v.toLocaleString('ko-KR') + '<span>원</span>';
      if (p < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function syncServiceUI() {
    var s = currentSvc();
    var webLike = (s.type === 'web' || s.type === 'imweb');
    var isImweb = (s.type === 'imweb');

    qty.min = 1;
    qty.max = s.max;
    if (+qty.value > s.max) qty.value = s.max;
    if (+qty.value < 1) qty.value = 1;

    qtyLegend.textContent = s.unit.replace(/\(.*\)/, '');
    qtyHint.textContent = '기본 포함 ' + s.incl + s.unit + ' · 추가 ' + s.unit + '당 ' + won(s.per);

    if (optPublishTitle && optPublishDesc) {
      if (isImweb) {
        optPublishTitle.textContent = '아임웹 관리자 페이지 제공';
        optPublishDesc.textContent = '비개발자 사장님용 관리자 대시보드 100% 인계';
      } else {
        optPublishTitle.textContent = '구축 · 퍼블리싱 포함';
        optPublishDesc.textContent = 'HTML/CSS/JS 반응형 구현 및 개발팀 인계 대응';
      }
    }

    [optPublish, optA11y].forEach(function (el) {
      if (!el) return;
      var wrap = el.closest('.opt');
      if (!wrap) return;
      wrap.classList.toggle('is-disabled', !webLike);
      el.disabled = !webLike || isImweb;
      if (!webLike) {
        el.checked = false;
      } else if (isImweb) {
        if (el === optPublish) el.checked = true;
      } else if (el === optPublish && !el.dataset.touched) {
        el.checked = true;
      }
    });
    if (webLike && !optPublish.dataset.touched && !optPublish.checked) optPublish.checked = true;

    qtyOut.textContent = qty.value + s.short;
    paintRange();
    calc();
  }

  function calc() {
    if (!calcForm) return;
    var s = currentSvc();
    var pages = parseInt(qty.value, 10) || 1;
    var extra = Math.max(0, pages - s.incl);
    var rows = [];
    var sub = s.base;

    rows.push({ label: s.label + ' 기본 (' + s.incl + s.unit + ' 포함)', value: s.base });

    if (extra > 0) {
      var addPages = extra * s.per;
      sub += addPages;
      rows.push({ label: '추가 ' + s.unit + ' ' + extra + ' × ' + won(s.per), value: addPages });
    }

    if (s.type === 'imweb') {
      rows.push({ label: '비개발자 관리자 대시보드 인계 (기본 포함)', value: 0 });
    } else if (s.type === 'web' && !optPublish.checked) {
      var cut = Math.round(sub * 0.28);
      sub -= cut;
      rows.push({ label: '퍼블리싱 제외 (화면 디자인만)', value: -cut });
    }

    if (optPlan.checked) {
      var plan = Math.round(sub * 0.15);
      sub += plan;
      rows.push({ label: '기획 · IA 설계 (+15%)', value: plan });
    }

    if (s.type === 'web' && optA11y.checked) {
      sub += 400000;
      rows.push({ label: '웹접근성 점검 (KWCAG 2.2)', value: 400000 });
    }

    if (optRush.checked) {
      var rush = Math.round(sub * 0.2);
      sub += rush;
      rows.push({ label: '급행 일정 (+20%)', value: rush });
    }

    var total = roundMan(sub);
    var vat = roundMan(total * 0.1);

    setTotal(total);
    outVat.textContent = '부가세 포함 ' + (total + vat).toLocaleString('ko-KR') + '원 (VAT ' + vat.toLocaleString('ko-KR') + '원)';

    outBreak.innerHTML = rows.map(function (r) {
      var v = r.value < 0 ? '−' + won(-r.value) : won(r.value);
      return '<li><span>' + r.label + '</span><b>' + v + '</b></li>';
    }).join('') +
      '<li class="is-total"><span>합계 (부가세 별도)</span><b>' + won(total) + '</b></li>';

    outLead.textContent = '예상 기간 ' + (optRush.checked ? '일정 압축 협의' : s.lead);
  }

  if (calcForm) {
    calcForm.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('input[name="svc"]', calcForm).forEach(function (r) {
      r.addEventListener('change', function () {
        qty.value = currentSvc().def;
        syncServiceUI();
      });
    });
    qty.addEventListener('input', function () {
      qtyOut.textContent = qty.value + currentSvc().short;
      paintRange();
      calc();
    });
    [optPublish, optPlan, optA11y, optRush].forEach(function (el) {
      if (!el) return;
      el.addEventListener('change', function () {
        el.dataset.touched = '1';
        calc();
      });
    });
    shownTotal = 0;
    syncServiceUI();
  }

  if (goBtn) {
    goBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var s = currentSvc();
      var opts = [];
      if (s.type === 'web' && optPublish.checked) opts.push('퍼블리싱 포함');
      if (optPlan.checked) opts.push('기획·IA 포함');
      if (s.type === 'web' && optA11y.checked) opts.push('웹접근성 점검');
      if (optRush.checked) opts.push('급행 일정');

      var msg = $('#f-message');
      if (msg) {
        msg.value =
          '[견적 계산기 조건]\n' +
          '· 서비스: ' + s.label + '\n' +
          '· 분량: ' + qty.value + s.unit + '\n' +
          '· 범위: ' + (opts.length ? opts.join(', ') : '기본') + '\n' +
          '· 계산된 예상 금액: ' + shownTotal.toLocaleString('ko-KR') + '원 (부가세 별도)\n\n' +
          '추가 요청사항을 여기에 적어주세요.\n';
      }
      var sel = $('#f-service');
      if (sel) {
        var map = {
          imweb: '아임웹 노코드 반응형 웹',
          corp: 'UI/UX 반응형 웹 & 퍼블리싱',
          pub: '웹·앱 퍼블리싱 · 유지보수',
          detail: '고전환 상세페이지',
          bi: '브랜드 아이덴티티',
          ir: '기업 IR · 브로셔'
        };
        var label = map[currentKey()];
        $$('option', sel).forEach(function (o) { if (o.value === label || o.textContent === label) sel.value = o.value; });
      }
      var contact = $('#contact');
      if (contact) scrollToAnchor(contact);
      window.setTimeout(function () {
        var name = $('#f-name');
        if (name) name.focus({ preventScroll: true });
      }, 520);
    });
  }

  /* ---------------------------------------------------- 7. filters */
  var filterBar = $('.filter-bar');
  var cards = $$('.work-card');
  var visible = cards.slice();

  function applyFilter(cat) {
    visible = [];
    cards.forEach(function (card) {
      var on = cat === 'all' || card.dataset.cat === cat;
      card.classList.toggle('is-hiding', !on);
      card.classList.remove('is-shown');
      if (on) {
        visible.push(card);
        void card.offsetWidth;
        card.classList.add('is-shown');
      }
    });
  }

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      $$('.filter', filterBar).forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyFilter(btn.dataset.filter);
    });
  }

  /* ---------------------------------------------------- 8. modal */
  var modal = $('#workModal');
  var modalImg = $('#modalImg');
  var mTitle = $('#modalTitle');
  var mTag = $('#modalTag');
  var mScope = $('#modalScope');
  var mPeriod = $('#modalPeriod');
  var mStack = $('#modalStack');
  var mSub = $('#modalSub');
  var mCount = $('#modalCount');
  var lastFocus = null;
  var mIndex = 0;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function renderModal(card) {
    if (!card) return;
    var media = $('.modal-media', modal);
    var full = card.dataset.full || card.dataset.img || '';
    media.classList.remove('is-fit', 'is-tall');
    modalImg.onload = function () {
      var tallRatio = modalImg.naturalHeight / modalImg.naturalWidth;
      var boxRatio = media.clientHeight / media.clientWidth;
      media.classList.add(tallRatio > boxRatio ? 'is-tall' : 'is-fit');
      media.scrollTop = 0;
    };
    modalImg.src = full;
    modalImg.alt = (card.dataset.title || '') + ' 화면';
    mTitle.textContent = card.dataset.title || '';
    mTag.textContent = card.dataset.tag || '';
    mScope.textContent = card.dataset.scope || '';
    mPeriod.textContent = card.dataset.period || '';
    mStack.textContent = card.dataset.stack || '';
    var sub = card.querySelector('.work-sub');
    mSub.textContent = sub ? sub.textContent : '';
    if (mCount) mCount.textContent = pad(mIndex + 1) + ' / ' + pad(visible.length);
  }

  function openModal(card) {
    if (!modal || !card) return;
    lastFocus = document.activeElement;
    mIndex = Math.max(0, visible.indexOf(card));
    renderModal(card);
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var close = $('#modalClose');
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(dir) {
    if (!visible.length) return;
    mIndex = (mIndex + dir + visible.length) % visible.length;
    renderModal(visible[mIndex]);
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () { openModal(card); });
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
    });
    var prev = $('#modalPrev'), next = $('#modalNext');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Tab') {
        var f = $$('button, a, [tabindex]:not([tabindex="-1"])', modal);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------------------------------------------- 9. contact form */
  var form = $('#contactForm');
  var status = $('#formStatus');
  var submitBtn = $('#submitBtn');

  function setStatus(text, isError) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }

  if (form) {
    /* GitHub Pages 같은 정적 호스팅에서는 form POST 엔드포인트가 없다.
       (Netlify 배포에서는 기존처럼 fetch('/', POST) 로 전송) */
    var staticPreview = /\.github\.io$/i.test(window.location.hostname);

    function buildMailto(data) {
      var lines = [];
      ['name', 'email', 'phone', 'service', 'message'].forEach(function (k) {
        var v = data.get(k);
        if (v) lines.push(k === 'name' ? '이름/회사: ' + v :
                    k === 'email' ? '이메일: ' + v :
                    k === 'phone' ? '연락처: ' + v :
                    k === 'service' ? '서비스: ' + v : '요청 내용:\n' + v);
      });
      return 'mailto:djseo2707@gmail.com?subject=' +
        encodeURIComponent('[프로젝트 문의] ' + (data.get('name') || '')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    function showMailtoStatus(data) {
      if (!status) return;
      status.classList.remove('is-error');
      status.textContent = '미리보기(GitHub Pages) 환경이라 폼 전송이 저장되지 않습니다. ';
      var a = document.createElement('a');
      a.href = buildMailto(data);
      a.textContent = '이 내용으로 메일 보내기';
      a.style.cssText = 'color:var(--accent-2);text-decoration:underline;text-underline-offset:3px;display:inline-block;white-space:nowrap';
      status.appendChild(a);
      status.appendChild(document.createTextNode(' 또는 djseo2707@gmail.com 로 보내주세요.'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('필수 항목을 확인해 주세요.', true);
        return;
      }
      var data = new FormData(form);

      if (staticPreview) {
        showMailtoStatus(data);
        return;
      }

      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });

      submitBtn.disabled = true;
      setStatus('보내는 중입니다…');

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('문의가 접수되었습니다. 영업일 24시간 안에 회신드리겠습니다.');
        })
        .catch(function () {
          setStatus('전송에 실패했습니다. djseo2707@gmail.com 로 보내주시면 바로 확인하겠습니다.', true);
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------------------------------------------------- 10. hero video */
  var heroVideo = $('#heroVideo');
  if (heroVideo) {
    var heroMedia = heroVideo.parentNode;
    var markVideoReady = function () {
      if (heroMedia && heroMedia.classList) heroMedia.classList.add('is-ready');
    };
    heroVideo.addEventListener('loadeddata', markVideoReady);
    heroVideo.addEventListener('canplay', markVideoReady);
    if (heroVideo.readyState >= 2) markVideoReady();
    heroVideo.addEventListener('error', function () { heroVideo.style.display = 'none'; });

    var conn = navigator.connection || navigator.mozConnection || {};
    var saveData = conn.saveData === true || /(^|-)2g$/.test(String(conn.effectiveType || ''));

    var playHero = function () {
      if (reduce || document.hidden) return;
      var p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* 자동재생 차단 시 포스터 유지 */ });
    };

    if (reduce || saveData) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.autoplay = false;
      try { heroVideo.pause(); } catch (err) {}
    } else {
      playHero();
      /* iOS 저전력 모드 대응: 첫 터치·클릭에서 재생 재시도 */
      document.addEventListener('touchstart', playHero, { passive: true, once: true });
      document.addEventListener('click', playHero, { once: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { try { heroVideo.pause(); } catch (e) {} } else { playHero(); }
      });
      /* 화면 밖으로 나가면 재생 정지 (배터리·데이터 절약) */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) playHero();
            else if (!heroVideo.paused) heroVideo.pause();
          });
        }, { threshold: 0.02 }).observe(heroVideo);
      }
    }
  }

  /* ---------------------------------------------------- 10b. hero sound toggle */
  var soundToggle = $('#soundToggle');
  if (soundToggle) {
    var soundLabel = $('.sound-label', soundToggle);
    var setSoundState = function (on) {
      if (heroVideo) {
        heroVideo.muted = !on;
        if (on) { try { heroVideo.volume = 0.85; } catch (e) {} }
        if (on && heroVideo.paused) {
          var pr = heroVideo.play();
          if (pr && typeof pr.catch === 'function') pr.catch(function () {});
        }
      }
      if (soundToggle.classList) soundToggle.classList.toggle('is-on', on);
      soundToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      var lbl = on ? '히어로 영상 소리 끄기' : '히어로 영상 소리 켜기';
      soundToggle.setAttribute('aria-label', lbl);
      soundToggle.setAttribute('title', lbl);
      if (soundLabel) soundLabel.textContent = on ? 'ON' : 'SOUND';
    };
    soundToggle.addEventListener('click', function () {
      /* muted 상태면 → 켜기, 소리 켜져 있으면 → 끄기 */
      setSoundState(!heroVideo ? false : heroVideo.muted);
    });
    /* 브라우저·OS가 임의로 음소거를 바꿈 경우(미디어 세션 등) 버튼 상태 동기화 */
    if (heroVideo) {
      heroVideo.addEventListener('volumechange', function () {
        var isOn = soundToggle.classList.contains('is-on');
        if (heroVideo.muted === isOn) setSoundState(!heroVideo.muted);
      });
      heroVideo.addEventListener('error', function () { soundToggle.style.display = 'none'; });
    }
  }

  /* ---------------------------------------------------- etc */
  var year = new Date().getFullYear();
  var copy = $('.footer-bottom p');
  if (copy && year > 2026) copy.textContent = '© ' + year + ' Studio Here. All rights reserved.';
})();
