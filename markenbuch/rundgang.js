/* Kurzer Rundgang beim ersten Öffnen (R18; Kopie von assets/js/rundgang.js der Vorlage, nur der Gang «livre» und das Kleid txtme).
   Ein Lichtkegel liegt auf dem echten Bedienelement, daneben eine Karte mit zwei, drei Sätzen: was und wozu, nie die Bedienung.
   Startet nicht von selbst: ein Schild «Short tour» unten rechts, fünf Sekunden, dann weg; ?rundgang startet direkt; «Short tour» im Rand.
   Automatische Prüfungen (navigator.webdriver) und eingebettete Ansichten sehen nichts. Einbinden: <script src="rundgang.js" defer data-werkzeug="livre"> */
(function () {
  var S = document.currentScript, WZ = (S && S.dataset.werkzeug) || 'livre';
  var Q = new URLSearchParams(location.search), ERZWINGEN = Q.has('rundgang');
  if (window.self !== window.top && !ERZWINGEN) return;
  /* Sprache bei jedem Gebrauch neu lesen, nicht nur beim Laden: nach dem Wechsel im Kopf stimmt sonst «Kurzer Rundgang» nicht (Abnahme F08).
     livre.js setzt <html lang> beim Start und bei jedem Wechsel. */
  var SP, W, GAENGE;
  function lies() {
    SP = /^de/i.test(document.documentElement.lang || '') ? 'de' : 'en';
    W = { en: { tour: 'Short tour', zeigen: 'Show', weiter: 'Next', los: 'Let’s go', ueber: 'Skip', von: 'of' }, de: { tour: 'Kurzer Rundgang', zeigen: 'Zeigen', weiter: 'Weiter', los: 'Los geht’s', ueber: 'Überspringen', von: 'von' } }[SP];
    GAENGE = {
      livre: { name: 'Brand Book', schritte: SP === 'de' ? [
        { ziel: ['#ansicht .titel'], titel: 'Das ist das Markenbuch', text: 'Die Marke von txtme.social zum Arbeiten. Alles, was Botschafter, Partner, Läden und das Team brauchen, an einem Ort.' },
        { ziel: ['#ansicht .li-karten'], titel: 'Fotos, Logo, Ton, Prüfung', text: 'Jedes Foto in der richtigen Grösse für Instagram, Website oder Druck, das Logo für jede Fläche, die Stimme Wort für Wort und eine Prüfung, ob ein Entwurf zu txtme passt.' },
        { ziel: ['#ansicht .li-buch'], titel: 'Wie txtme aussieht', text: 'Die Markenrichtlinien: Farben, Schrift, Logo, Raum, Bilder und warum sie so sind. Zum Nachschlagen und zum Weitergeben.' },
        { ziel: ['#leiste'], titel: 'Weitergeben mit einem Klick', text: 'Alle Dateien als ein Paket, die Bildrechte gleich dabei.' }
      ] : [
        { ziel: ['#ansicht .titel'], titel: 'This is the Brand Book', text: 'The brand of txtme.social to work with. Everything ambassadors, partners, shops and the team need, in one place.' },
        { ziel: ['#ansicht .li-karten'], titel: 'Photos, logo, voice, check', text: 'Every photo in the right size for Instagram, website or print, the logo for every surface, the voice word for word, and a check whether a draft fits txtme.' },
        { ziel: ['#ansicht .li-buch'], titel: 'How txtme looks', text: 'The brand guidelines: colours, typeface, logo, space, images, and why they are the way they are. To look up and to pass on.' },
        { ziel: ['#leiste'], titel: 'Pass it on with one click', text: 'All files as one package, the image rights included.' }
      ] }
    };
  }
  lies();
  function schluessel(w) { return 'rundgang-txtme-' + w; }
  function merk(w) { try { localStorage.setItem(schluessel(w), '1'); } catch (e) { } }

  var CSS = '' +
    '.rdg-kegel{position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;box-shadow:0 0 0 2px #60c4e3,0 0 0 200vmax rgba(11,11,12,.78)}' +
    '.rdg-sperre{position:fixed;inset:0;z-index:2147482999}' +
    '.rdg-karte{position:fixed;left:0;top:0;z-index:2147483001;width:360px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:22px 24px 20px;color:#0b0b0c;background:#f7f5f1;' +
      'box-shadow:0 0 0 1px rgba(11,11,12,.12),0 30px 60px -24px rgba(0,0,0,.6);font:15px/1.55 "Space Grotesk",system-ui,sans-serif;animation:rdg-auf .42s cubic-bezier(.2,.8,.2,1) both;transform:translate3d(var(--rx,0),var(--ry,0),0)}' +
    '@keyframes rdg-auf{from{transform:translate3d(var(--rx,0),calc(var(--ry,0px) + 14px),0)}to{transform:translate3d(var(--rx,0),var(--ry,0),0)}}' +
    '.rdg-zier{display:flex;align-items:center;gap:10px;font:600 10px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#8a8781}' +
    '.rdg-zier i{flex:1;height:2px;max-width:34px;background:linear-gradient(100deg,#60c4e3,#eb5986)}' +
    '.rdg-karte h3{margin:12px 0 6px;font:600 24px/1.12 "Space Grotesk",system-ui,sans-serif;color:#0b0b0c;letter-spacing:-.025em}' +
    '.rdg-karte p{margin:0;color:#5b5954;font:15px/1.55 "Space Grotesk",system-ui,sans-serif!important;letter-spacing:0!important;text-transform:none!important}' +
    '.rdg-fuss{display:flex;align-items:center;gap:14px;margin-top:20px;flex-wrap:nowrap!important}' +
    '.rdg-weg{display:flex;gap:5px;flex:1 1 auto;min-width:64px}.rdg-weg b{display:block;height:3px;flex:1 1 0;min-width:6px;max-width:26px;background:rgba(11,11,12,.14)}.rdg-weg b.da{background:#0b0b0c}' +
    '.rdg-karte .rdg-zu{flex:none;margin:0;border:0;background:none;padding:6px 2px;font:600 10px/1 "Space Grotesk",system-ui,sans-serif!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:#8a8781!important;cursor:pointer;box-shadow:none!important}' +
    '.rdg-karte .rdg-zu:hover{color:#0b0b0c!important}' +
    '.rdg-karte .rdg-los,.rdg-schild .rdg-los{flex:none;margin:0!important;display:inline-flex;align-items:center;gap:10px;height:42px!important;padding:0 20px!important;border:0!important;border-radius:999px!important;cursor:pointer;' +
      'font:600 10px/1 "Space Grotesk",system-ui,sans-serif!important;letter-spacing:.22em!important;text-transform:uppercase!important;color:#0b0b0c!important;background:linear-gradient(100deg,#60c4e3,#eb5986)!important;box-shadow:none!important}' +
    '.rdg-los i{display:grid;margin:0}.rdg-los svg{width:13px;height:13px;fill:none;stroke:#0b0b0c;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '.rdg-los:focus-visible,.rdg-zu:focus-visible{outline:2px solid #60c4e3;outline-offset:3px}' +
    '.rdg-karte,.rdg-karte *{box-sizing:border-box!important}' +
    '@media (max-width:700px){.rdg-karte{left:16px!important;right:16px;top:auto!important;bottom:16px;width:auto;--rx:0!important;--ry:0!important}}' +
    '@media (prefers-reduced-motion:reduce){.rdg-karte{animation:none}}';
  var PFEIL = '<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></i>';
  var lauf = null;

  function sichtbar(sel) { var e; try { e = document.querySelector(sel); } catch (x) { return null; } if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 ? e : null; }
  function finde(liste) { for (var i = 0; i < liste.length; i++) { var e = sichtbar(liste[i]); if (e) return e; } return null; }

  function starte(w) {
    lies(); var g = GAENGE[w]; if (!g || lauf) return;
    var schritte = g.schritte;
    if (!finde(schritte[0].ziel)) return;
    if (!document.getElementById('rdg-css')) { var st = document.createElement('style'); st.id = 'rdg-css'; st.textContent = CSS; document.head.appendChild(st); }
    var sperre = document.createElement('div'); sperre.className = 'rdg-sperre';
    var kegel = document.createElement('div'); kegel.className = 'rdg-kegel';
    var karte = document.createElement('div'); karte.className = 'rdg-karte';
    karte.setAttribute('role', 'dialog'); karte.setAttribute('aria-modal', 'true'); karte.setAttribute('aria-label', W.tour);
    document.body.appendChild(sperre); document.body.appendChild(kegel); document.body.appendChild(karte);
    var nr = 0, ziel = null, gerueckt = false;
    lauf = { w: w };
    function lege() {
      if (!ziel || !ziel.isConnected) ziel = finde(schritte[nr].ziel);
      if (!ziel) return;
      var r = ziel.getBoundingClientRect(), pad = 8, vw = innerWidth, vh = innerHeight;
      var x = Math.max(4, r.left - pad), y = Math.max(4, r.top - pad);
      var b = Math.min(vw - 8, r.right + pad) - x, h = Math.min(vh - 8, Math.min(Math.max(r.bottom, r.top + (schritte[nr].min || 0)), r.top + (schritte[nr].max || 1e5)) + pad) - y;
      kegel.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      kegel.style.width = Math.max(0, b) + 'px'; kegel.style.height = Math.max(0, h) + 'px';
      if (vw <= 700) return;
      var kw = karte.offsetWidth, kh = karte.offsetHeight, abst = 22, kx, ky;
      if (x + b + abst + kw <= vw - 16) { kx = x + b + abst; ky = y; }
      else if (x - abst - kw >= 16) { kx = x - abst - kw; ky = y; }
      else if (y + h + abst + kh <= vh - 16) { kx = x; ky = y + h + abst; }
      else if (y - abst - kh >= 16) { kx = x; ky = y - abst - kh; }
      else if (!gerueckt && h + abst + kh + 110 < vh) { gerueckt = true; scrollBy({ top: r.top - 96, behavior: 'instant' }); return lege(); }
      else { kx = vw - kw - 24; ky = vh - kh - 24; }
      kx = Math.min(Math.max(16, kx), vw - kw - 16); ky = Math.min(Math.max(16, ky), vh - kh - 16);
      karte.style.setProperty('--rx', kx + 'px'); karte.style.setProperty('--ry', ky + 'px');
    }
    function zeige(n, rueck) {
      while (n >= 0 && n < schritte.length && !finde(schritte[n].ziel)) n += rueck ? -1 : 1;
      if (n < 0 || n >= schritte.length) return ende();
      nr = n; gerueckt = false; var s = schritte[n], letzt = n === schritte.length - 1;
      ziel = finde(s.ziel);
      if (s.oben) scrollTo({ top: 0, behavior: 'instant' });
      var r = ziel.getBoundingClientRect();
      if (!s.oben && r.top < 70 || r.bottom > innerHeight - 20) ziel.scrollIntoView({ block: r.height > innerHeight * .7 ? 'start' : 'center', behavior: 'instant' });
      var weg = ''; for (var i = 0; i < schritte.length; i++) weg += '<b' + (i <= n ? ' class="da"' : '') + '></b>';
      karte.innerHTML = '<div class="rdg-zier"><span>' + W.tour + ' · ' + (n + 1) + ' ' + W.von + ' ' + schritte.length + '</span><i></i></div>' +
        '<h3>' + s.titel + '</h3><p>' + s.text + '</p>' +
        '<div class="rdg-fuss"><div class="rdg-weg" aria-hidden="true">' + weg + '</div>' +
        (letzt ? '' : '<button type="button" class="rdg-zu">' + W.ueber + '</button>') +
        '<button type="button" class="rdg-los">' + (letzt ? W.los : W.weiter) + PFEIL + '</button></div>';
      karte.style.animation = 'none'; void karte.offsetWidth; karte.style.animation = '';
      lege(); setTimeout(lege, 450);
      var zu = karte.querySelector('.rdg-zu'); if (zu) zu.onclick = ende;
      var los = karte.querySelector('.rdg-los'); los.onclick = function () { letzt ? ende() : zeige(n + 1); };
      try { los.focus({ preventScroll: true }); } catch (e) { }
    }
    function taste(e) {
      if (e.key === 'Escape') { e.preventDefault(); ende(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nr < schritte.length - 1 ? zeige(nr + 1) : ende(); }
      else if (e.key === 'ArrowLeft' && nr > 0) { e.preventDefault(); zeige(nr - 1, true); }
    }
    var takt = 0; function neu() { if (!takt) takt = requestAnimationFrame(function () { takt = 0; lege(); }); }
    var zuletzt = '', wacht = setInterval(function () { if (!ziel) return; var r = ziel.getBoundingClientRect(), k = [r.left, r.top, r.width, r.height].map(Math.round).join(); if (k !== zuletzt) { zuletzt = k; neu(); } }, 120);
    function ende() { merk(w); lauf = null; removeEventListener('resize', neu); removeEventListener('scroll', neu, true); document.removeEventListener('keydown', taste, true); clearInterval(wacht); sperre.remove(); kegel.remove(); karte.remove(); }
    addEventListener('resize', neu); addEventListener('scroll', neu, true); document.addEventListener('keydown', taste, true);
    zeige(0);
  }

  function wenn_bereit(w, dann) {
    var g = GAENGE[w], t0 = Date.now();
    (function blick() { if (finde(g.schritte[0].ziel) && document.readyState === 'complete') return nach_auftritt(dann); if (Date.now() - t0 < 12000) setTimeout(blick, 250); })();
  }
  function nach_auftritt(dann) {
    var t0 = performance.now(), ruhe = 0;
    (function blick() {
      var laeuft = (document.getAnimations ? document.getAnimations() : []).some(function (a) { try { return a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime); } catch (e) { return false; } });
      ruhe = laeuft ? 0 : ruhe + 1;
      var seit = performance.now() - t0;
      if ((ruhe >= 3 && seit > 2500) || seit > 6000) return setTimeout(dann, 700);
      setTimeout(blick, 200);
    })();
  }
  var angesetzt = {};
  function vielleicht() {
    var w = WZ;
    if (!GAENGE[w] || lauf || angesetzt[w]) return;
    if (navigator.webdriver && !ERZWINGEN) return;
    angesetzt[w] = true;
    wenn_bereit(w, function () { ERZWINGEN ? starte(w) : schild(w); });
  }
  var SCHILD_CSS = '' +
    '.rdg-schild{position:fixed;right:24px;bottom:24px;z-index:2147482990;display:flex;align-items:center;gap:14px;box-sizing:border-box;padding:10px 10px 10px 18px;border-radius:999px;color:#0b0b0c;background:#f7f5f1;' +
      'box-shadow:0 0 0 1px rgba(11,11,12,.14),0 18px 34px -16px rgba(0,0,0,.5);transform:translate3d(0,0,0);transition:transform .55s cubic-bezier(.2,.8,.2,1);animation:rdg-schild-auf .7s cubic-bezier(.22,1,.36,1) both}' +
    '@keyframes rdg-schild-auf{from{transform:translate3d(0,calc(100% + 40px),0)}to{transform:translate3d(0,0,0)}}' +
    '.rdg-schild.weg{animation:none;transform:translate3d(0,calc(100% + 60px),0)}' +
    '.rdg-schild__t{display:flex;flex-direction:column;gap:4px;line-height:1}' +
    '.rdg-schild__t small{font:600 9px/1 "Space Grotesk",system-ui,sans-serif!important;letter-spacing:.2em!important;text-transform:uppercase;color:#8a8781}' +
    '.rdg-schild__t b{font:600 16px/1 "Space Grotesk",system-ui,sans-serif!important;letter-spacing:-.01em!important;color:#0b0b0c}' +
    '.rdg-schild .rdg-los{height:38px!important;padding:0 16px!important}' +
    '.rdg-schild__zu{flex:none;width:26px;height:26px;margin:0 2px 0 -4px!important;padding:0!important;border:0!important;border-radius:50%;background:none!important;box-shadow:none!important;cursor:pointer;color:#8a8781;font:16px/1 system-ui!important}' +
    '.rdg-schild__zu:hover{color:#0b0b0c}' +
    '@media (max-width:700px){.rdg-schild{right:16px;left:auto}}' +
    /* In der Leiste «Image rights» statt frei schwebend: verdeckt nie Text oder Knöpfe der Seite (Fund 07.11.2026: Schild lag auf «All files (ZIP)» und auf den Karten) */
    '.rdg-schild.rdg-schild--leiste{position:static;flex:none;order:2;animation:none;padding:6px 6px 6px 16px;box-shadow:0 0 0 1px rgba(255,255,255,.18)}' +
    '.rdg-schild--leiste.weg{opacity:0;transform:none;transition:opacity .4s}' +
    '@media (prefers-reduced-motion:reduce){.rdg-schild{animation:none;transition:none}}';
  function schild(w) {
    if (document.querySelector('.rdg-schild')) return;
    lies();
    if (!document.getElementById('rdg-css')) { var st0 = document.createElement('style'); st0.id = 'rdg-css'; st0.textContent = CSS; document.head.appendChild(st0); }
    if (!document.getElementById('rdg-schild-css')) { var st = document.createElement('style'); st.id = 'rdg-schild-css'; st.textContent = SCHILD_CSS; document.head.appendChild(st); }
    var s = document.createElement('div'); s.className = 'rdg-schild'; s.setAttribute('role', 'status');
    s.innerHTML = '<span class="rdg-schild__t"><small>' + GAENGE[w].name + '</small><b>' + W.tour + '</b></span>' +
      '<button type="button" class="rdg-los">' + W.zeigen + PFEIL + '</button><button type="button" class="rdg-schild__zu" aria-label="Close">×</button>';
    var leiste = document.querySelector('#leiste');
    function platz() { var l = document.querySelector('#leiste'), lr = l && l.getBoundingClientRect(); if (!l || !lr || lr.height < 5) return; s.style.bottom = Math.max(24, innerHeight - lr.top + 14) + 'px'; }
    if (leiste) { s.classList.add('rdg-schild--leiste'); leiste.appendChild(s); } else { document.body.appendChild(s); platz(); }
    var wache = leiste ? 0 : setInterval(platz, 150);
    var uhr = 0, ueber = false;
    function weg() { clearTimeout(uhr); clearInterval(wache); s.classList.add('weg'); setTimeout(function () { s.remove(); }, 650); }
    function zaehle() { clearTimeout(uhr); uhr = setTimeout(function () { if (!ueber) weg(); }, 5000); }
    s.addEventListener('mouseenter', function () { ueber = true; clearTimeout(uhr); });
    s.addEventListener('mouseleave', function () { ueber = false; uhr = setTimeout(weg, 2000); });
    s.querySelector('.rdg-los').onclick = function () { weg(); starte(w); };
    s.querySelector('.rdg-schild__zu').onclick = weg;
    zaehle();
  }
  function weg_im_rand() {
    var wege = document.querySelector('#rand .wege');
    if (!wege || wege.querySelector('.rdg-wieder')) return;
    lies();
    var a = document.createElement('a'); a.href = '#'; a.className = 'rdg-wieder'; a.textContent = W.tour;
    a.onclick = function (e) { e.preventDefault(); starte(WZ); };
    wege.appendChild(a);
  }
  function los() { vielleicht(); new MutationObserver(weg_im_rand).observe(document.body, { childList: true, subtree: true }); weg_im_rand(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', los) : los();
  window.rundgang = function () { starte(WZ); };
})();
