/* Print Workshop txtme.social: Bühne über jeder Ansicht und Knopf zurück zum Kontrollpanel (Backstage).
   Kopie der Haus-Bühne der Vorlage L’Imprimerie (Robert 15.10.2026, «Heroes richtig schön»); geändert sind nur Fotos, Wege und Wortlaut.
   Nur für dieses Haus geladen (index.html, HAUS_STIL). Entfernen = vorheriger Stand. */
(function () {
  var BASIS = 'haeuser/txtme/kopf/';
  /* Foto je Ansicht (1200 px, haeuser/txtme/kopf/, gebaut von bau.py KOPF) */
  var FOTO = { msStart: 'party', msEvents: 'ade', msAbteilungen: 'friends', msHinweise: 'cube', msNewsletter: 'desk',
    msFotos: 'night', msMarke: 'hero-wide', msLivre: 'about-white', msMeine: 'print', msNeu: 'desk', weg: 'roof', entwuerfe: 'laugh', msFreigegeben: 'tram' };
  /* Zentrale von txtme: das Kontrollpanel «Backstage» (Werkzeug 4, Port 3213 laut _cloud/AUFTRAG.md). Online unter derselben Adresse: ../backstage/ */
  var ZENTRALE = '../backstage/';
  var ZENTRALE_NAME = 'Backstage';
  /* R05/I15: die Website von txtme (lokal die Vorschau des Shops, python3 serve.py 3210 in der Wurzel, laut DESIGN.md; online dieselbe Adresse) */
  var WEBSITE = 'https://txtme.social/';
  var HAUS = '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>';

  function foto(h, src) {
    var f = document.createElement('div'); f.className = 'ms-bue__foto'; f.setAttribute('aria-hidden', 'true');
    var im = new Image(); im.alt = ''; im.decoding = 'async';
    im.onload = function () { f.classList.add('da'); };
    im.src = src; f.appendChild(im); h.insertBefore(f, h.firstChild);
    if (im.complete && im.naturalWidth) f.classList.add('da');
  }
  function buehne(h, src, knapp) {
    if (!h || h.__b) return; h.__b = 1;
    h.classList.add('ms-bue'); if (knapp) h.classList.add('ms-bue--knapp');
    foto(h, src);
  }
  /* Kopf einer Ansicht in eine eigene Tafel heben (h1, Satz, Feld bleiben dieselben Knoten) */
  function hebe(eltern, knoten, src, cls) {
    if (!eltern || eltern.__b || !knoten[0]) return; eltern.__b = 1;
    var t = document.createElement('div'); t.className = 'ms-tafel ' + (cls || '');
    eltern.insertBefore(t, knoten[0]);
    knoten.forEach(function (k) { if (k) t.appendChild(k); });
    buehne(t, src);
  }
  function alle() {
    buehne(document.querySelector('#msStart .ms-gruss'), BASIS + FOTO.msStart + '.webp');
    [].forEach.call(document.querySelectorAll('#start .ms-titel'), function (t) {
      var v = t.closest('[id^="ms"]'); buehne(t, BASIS + (FOTO[v && v.id] || 'roof') + '.webp', true);
    });
    var neu = document.getElementById('msNeu');
    if (neu) hebe(neu, [neu.querySelector(':scope>h1'), neu.querySelector(':scope>.start__satz'), neu.querySelector(':scope>.start__direkt'), neu.querySelector(':scope>.start__fehler')], BASIS + FOTO.msNeu + '.webp', 'ms-tafel--mitte');
    var w = document.getElementById('startWeg');
    if (w && !w.hidden) {
      buehne(w.querySelector('.weg__kopf'), BASIS + FOTO.weg + '.webp', true);
      var h1 = w.querySelector(':scope>h1');
      if (h1) hebe(w, [h1, w.querySelector(':scope>.start__satz')], BASIS + FOTO.entwuerfe + '.webp');
    }
    var kd = document.querySelector('#msDetail .kd');
    if (kd && !kd.__b) {
      var b = kd.querySelector('.wo__bild'), m = b && /url\(["']?([^"')]+)/.exec(b.style.backgroundImage);
      buehne(kd, m ? m[1] : BASIS + FOTO.msEvents + '.webp');
    }
    zentrale();
  }
  function knopf(cls) {
    var a = document.createElement('a'); a.className = 'rund ' + cls; a.href = ZENTRALE;
    a.setAttribute('aria-label', 'Back to ' + ZENTRALE_NAME); a.setAttribute('data-tip', ZENTRALE_NAME); a.innerHTML = HAUS;
    return a;
  }
  /* Handy: Knopf «Sections» vor der Suche, klappt die Seitenleiste auf; ein Tipp auf einen Bereich schliesst sie (R07) */
  function bereiche() {
    var k = document.querySelector('.ms-kopf'), s = document.getElementById('start'); if (!k || !s || k.querySelector('.ms-bereiche')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ms-bereiche'; b.setAttribute('aria-label', 'Sections');
    b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Sections</span>';
    b.addEventListener('click', function () { s.classList.toggle('leiste-offen'); });
    k.insertBefore(b, k.querySelector('.ms-suche') || null);
    s.querySelector('.ms-leiste').addEventListener('click', function (e) { if (e.target.closest('[data-ansicht],[data-akt],#startHilfe')) s.classList.remove('leiste-offen'); });
    s.addEventListener('click', function (e) { if (e.target === s && s.classList.contains('leiste-offen')) s.classList.remove('leiste-offen'); });
  }
  function zentrale() {
    bereiche();
    var k = document.querySelector('.ms-kopf');
    if (k && !k.querySelector('.zur-maison')) { var l = k.querySelector('.ms-rund'); k.insertBefore(knopf('ms-rund zur-maison'), l || null); }
    var e = document.querySelector('.kopf__werk');
    if (e && !e.querySelector('.zur-maison')) { var n = e.querySelector('#btnNeu'); e.insertBefore(knopf('zur-maison'), n || e.firstChild); }
  }
  /* Editor: Grund der Arbeitsfläche nach dem Dokument (Robert 15.10.2026: «dunkle Dokumente, dann heller Hintergrund; helle Dokumente, dann dunkler Hintergrund;
     bei Fotos situativ, je nachdem, was im Foto überwiegt»). Die Seite wird in einem Raster abgetastet:
     je Punkt zählt das oberste Foto oder die oberste Fläche, sonst der Grund des Blatts. Dunkel überwiegt → Fläche hell, sonst Ink. */
  var hellCache = {}, prueft = 0;
  function lum(c) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(c || ''); if (!m || m[4] === '0') return null;
    return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255; }
  function fotoLum(im) {
    if (hellCache[im.src] != null) return hellCache[im.src];
    if (!im.complete || !im.naturalWidth) { im.addEventListener('load', grundBald, { once: true }); return null; }
    try { var c = document.createElement('canvas'); c.width = c.height = 16; var x = c.getContext('2d'); x.drawImage(im, 0, 0, 16, 16);
      var d = x.getImageData(0, 0, 16, 16).data, s = 0; for (var i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      return (hellCache[im.src] = s / (d.length / 4) / 255); } catch (e) { return (hellCache[im.src] = 0.5); }
  }
  function grundPruefen() {
    prueft = 0;
    var fl = document.getElementById('flaeche'), bl = fl && fl.querySelector('.blatt'); if (!bl) return;
    var r = bl.getBoundingClientRect(); if (!r.width) return;
    var grund = lum(getComputedStyle(bl).backgroundColor);
    if (grund == null) {   // Seite ohne Grund (Sticker): die Fläche richtet sich nach der Tinte, dunkle Tinte braucht eine helle Fläche
      var farben = [].slice.call(bl.querySelectorAll('.el')).map(function (e) { return lum(getComputedStyle(e).color); }).filter(function (v) { return v != null; });
      var mittel = farben.length ? farben.reduce(function (a, b) { return a + b; }, 0) / farben.length : 0;
      fl.classList.toggle('flaeche--hell', mittel < 0.5); return;
    }
    var teile = [].slice.call(bl.children).map(function (e) {
      var q = e.getBoundingClientRect(), im = e.querySelector('img'), l = null;
      if (im) l = fotoLum(im); else if (!e.textContent.trim()) l = lum(getComputedStyle(e).backgroundColor);
      return l == null ? null : { x0: q.left, x1: q.right, y0: q.top, y1: q.bottom, l: l };
    }).filter(Boolean).reverse();
    var n = 0, s = 0;
    for (var i = 0; i < 18; i++) for (var j = 0; j < 30; j++) {
      var px = r.left + (i + .5) / 18 * r.width, py = r.top + (j + .5) / 30 * r.height, l = grund;
      for (var k = 0; k < teile.length; k++) { var t = teile[k]; if (px >= t.x0 && px <= t.x1 && py >= t.y0 && py <= t.y1) { l = t.l; break; } }
      s += l; n++;
    }
    fl.classList.toggle('flaeche--hell', s / n < 0.45);
  }
  function grundBald() { if (!prueft) prueft = setTimeout(grundPruefen, 200); }

  function los() {
    document.documentElement.classList.add('haus-hell');
    var lauf = 0;
    new MutationObserver(function () { if (lauf) return; lauf = 1; try { alle(); } finally { lauf = 0; } })
      .observe(document.getElementById('start') || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    alle();
    var w = document.getElementById('wirt');
    if (w) { new MutationObserver(grundBald).observe(w, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] }); grundBald(); }
  }
  /* Wege unten in der Seitenleiste (Master I15, Abnahme 06.11.2026 Fund 15): Backstage · Website · Check, je in neuem Fenster */
  function wege() { document.querySelectorAll('.ms-wege a[data-weg]').forEach(function (a) { a.href = a.dataset.weg === 'backstage' ? ZENTRALE : WEBSITE; }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { los(); wege(); }); else { los(); wege(); }
})();
