/* «Zur Werkbank» (R19; Kopie von assets/js/zur-werkbank.js der Vorlage, gekürzt auf das Werkzeug): ein Knopf unten links, nur wenn die Seite aus der
   Werkbank 2.0 heraus geöffnet wurde (?wb=<Sprache>[.<Abschnitt>]&wbo=<Adresse der Werkbank>). Die Herkunft bleibt für die Sitzung gemerkt
   (sessionStorage «txtme-wb»), der Zusatz verschwindet aus der Adresse. Ohne Herkunft erscheint nichts; eingebettet erscheint nichts.
   Weg beim Hinunterscrollen, zurück beim Hochscrollen, nur transform und opacity. Rückt neben #rand (data-neben) und über #leiste (data-ueber).
   Der Besuchs-Zähler der Vorlage (sendBeacon an einen Dienst) ist weggelassen: Marouan will kein Tracking (Regel 7). */
(function () {
  'use strict';
  if (window.__zurWerkbank) return; window.__zurWerkbank = 1;
  var TEXT = { de: 'Zur Werkbank', en: 'To the workbench' };
  var HERKUNFT = /^https:\/\/[a-z0-9.-]+\.(deploybase\.eu|vercel\.app)$|^http:\/\/(127\.0\.0\.1|localhost):\d{2,5}$/;
  var SCHL = 'txtme-wb';
  var tag = document.currentScript || document.querySelector('script[src*="zur-werkbank.js"]');
  function lies() { try { var d = JSON.parse(sessionStorage.getItem(SCHL) || 'null'); return d && (d.sp === 'de' || d.sp === 'en') && HERKUNFT.test(d.o) ? d : null; } catch (e) { return null; } }
  function merke(d) { try { sessionStorage.setItem(SCHL, JSON.stringify(d)); } catch (e) { } }
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
  var roh = q && q.get('wb');
  if (roh) {
    var t = /^(de|en)(?:\.([a-z0-9-]{1,40}))?$/.exec(roh), o = q.get('wbo') || '';
    if (t && HERKUNFT.test(o)) merke({ sp: t[1], anker: t[2] || '', o: o });
    try { q.delete('wb'); q.delete('wbo'); var rest = q.toString(); history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash); } catch (e) { }
  }
  var von = lies();
  if (!von || window.self !== window.top) return;
  var sp = von.sp, ziel = von.o + '/' + (von.anker ? '#' + von.anker : '');

  function baue() {
    if (document.getElementById('zur-werkbank')) return;
    var wirt = document.createElement('div'); wirt.id = 'zur-werkbank'; wirt.className = 'neu';
    var setz = function (k, v) { wirt.style.setProperty(k, v, 'important'); };
    var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
    wirt.style.display = 'block';
    [['position', 'fixed'], ['z-index', '61'], ['left', 'clamp(14px,2vw,32px)'], ['bottom', 'clamp(14px,2vw,32px)'], ['margin', '0'], ['padding', '0'], ['border', '0'], ['background', 'none'],
     ['animation', 'none'], ['box-shadow', 'none'], ['transition', ruhig ? 'opacity .2s ease' : 'transform .55s cubic-bezier(.32,.72,0,1),opacity .4s ease']].forEach(function (x) { setz(x[0], x[1]); });
    var male = function () {
      var fort = wirt.classList.contains('weg') || wirt.classList.contains('neu');
      setz('transform', fort ? 'translate3d(var(--zw-schub,0px),calc(100% + 48px - var(--zw-hub,0px)),0)' : 'translate3d(var(--zw-schub,0px),calc(var(--zw-hub,0px) * -1),0)');
      setz('opacity', fort ? '0' : '1'); setz('pointer-events', fort ? 'none' : 'auto');
    };
    male();
    if (window.MutationObserver) new MutationObserver(male).observe(wirt, { attributes: true, attributeFilter: ['class'] });
    var baum = wirt.attachShadow ? wirt.attachShadow({ mode: 'open' }) : wirt;
    baum.innerHTML = '<style>a{position:relative;box-sizing:border-box;display:inline-flex;align-items:center;gap:11px;height:44px;padding:0 20px 0 6px;border-radius:999px;' +
      'font:600 10.5px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap;text-decoration:none;color:#f4f2ee;background:#0b0b0c;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);transition:transform .55s cubic-bezier(.32,.72,0,1)}' +
      'i{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(100deg,#60c4e3,#eb5986);color:#0b0b0c}' +
      'svg{display:block;width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}' +
      '@media (hover:hover){a:hover{transform:translateY(-2px)}}a:active{transform:translateY(1px)}a:focus-visible{outline:2px solid #60c4e3;outline-offset:3px}' +
      '@media (max-width:560px){a{height:40px;gap:9px;padding:0 16px 0 5px;font-size:10px}i{width:30px;height:30px}}@media (prefers-reduced-motion:reduce){a{transition:none!important}}@media print{a{display:none}}</style>' +
      '<a part="knopf" href="' + ziel.replace(/"/g, '&quot;') + '"><i aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M13 8H3.5M7.5 4 3.5 8l4 4"/></svg></i><span>' + TEXT[sp] + '</span></a>';
    document.body.appendChild(wirt);
    var liste = function (n) { return ((tag && tag.getAttribute(n)) || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean); };
    var ueber = liste('data-ueber'), neben = liste('data-neben'), luft = 14, hub = -1, schub = -1;
    function platz() {
      var cs = getComputedStyle(wirt), unten = parseFloat(cs.bottom) || 0, links = parseFloat(cs.left) || 0, breite = wirt.offsetWidth, hoehe = wirt.offsetHeight, H = innerHeight, B = innerWidth;
      var s = 0, h = 0;
      neben.forEach(function (sel) { var el = document.querySelector(sel); if (!el) return; var c = getComputedStyle(el), r = el.getBoundingClientRect(); if (c.display === 'none' || !el.offsetHeight || c.position !== 'fixed') return; if (r.width > B * .6 || r.bottom < H - unten - hoehe) return; if (r.left < links + breite && r.right > links) s = Math.max(s, r.right + luft - links); });
      if (links + s + breite > B - 8) s = 0;
      ueber.forEach(function (sel) { var el = document.querySelector(sel); if (!el) return; var c = getComputedStyle(el), r = el.getBoundingClientRect(); if (c.display === 'none' || !el.offsetHeight) return; if (r.right <= links + s || r.left >= links + s + breite) return; var o = c.position === 'fixed' && c.bottom !== 'auto' ? parseFloat(c.bottom) + el.offsetHeight : (r.bottom > H - unten - hoehe ? H - r.top : 0); if (o > unten) h = Math.max(h, o - unten + 10); });
      h = Math.round(h); s = Math.round(s);
      if (h !== hub) { hub = h; wirt.style.setProperty('--zw-hub', h + 'px'); }
      if (s !== schub) { schub = s; wirt.style.setProperty('--zw-schub', s + 'px'); }
    }
    var wartet = 0; function bald() { if (wartet) return; wartet = requestAnimationFrame(function () { wartet = 0; platz(); }); }
    platz(); addEventListener('resize', bald, { passive: true }); [400, 1100, 2000, 3400].forEach(function (ms) { setTimeout(bald, ms); }); addEventListener('load', bald);
    if (window.MutationObserver) new MutationObserver(bald).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    var stand = { alt: 0, richt: 0, anker: 0 };
    document.addEventListener('scroll', function (e) {
      var z = e.target === document || e.target === document.documentElement ? (document.scrollingElement || document.documentElement) : e.target;
      if (!z || z.nodeType !== 1 || (z !== (document.scrollingElement || document.documentElement) && z.clientHeight < innerHeight * .5)) return;
      var y = z.scrollTop, s = stand;
      if ((y - s.alt) * s.richt < 0 || (!s.richt && y !== s.alt)) { s.richt = y > s.alt ? 1 : -1; s.anker = s.alt; }
      if (y < 140) wirt.classList.remove('weg'); else if (s.richt > 0 && y - s.anker > 24) wirt.classList.add('weg'); else if (s.richt < 0 && s.anker - y > 24) wirt.classList.remove('weg');
      s.alt = y;
    }, { capture: true, passive: true });
    setTimeout(function () { requestAnimationFrame(function () { platz(); wirt.classList.remove('neu'); }); }, 900);
  }
  if (document.body) baue(); else document.addEventListener('DOMContentLoaded', baue);
})();
