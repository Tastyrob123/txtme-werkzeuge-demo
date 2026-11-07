/* Markenbuch · Online-Demo (GitHub Pages, ohne Server). Ersetzt die Aufrufe an den Python-Server (api/stand, api/fehler, api/pruefen,
   api/bild) durch Rechnung im Browser des Besuchers. Nichts geht an einen Server, gespeichert wird nur in localStorage dieses Browsers.
   Nachbau von livre.py: Fotos in fertiger Grösse (Zuschnitt, JPEG), Farbmessung nach CIEDE2000 gegen die Palette und die Probe ohne KI.
   PDF-Entwürfe liest pdf.js (lokal im Ordner pdfjs/), wie pdftoppm die ersten drei Seiten bei 110 dpi.
   Wird von online/bau_online.py als erstes Skript in jede Seite gesetzt; PALETTE füllt das Bau-Skript aus marke_daten.py. */
(function () {
  'use strict';
  if (window.__markenbuchDemo) return; window.__markenbuchDemo = 1;
  var PALETTE = [["ink", "Ink", "#0b0b0c"], ["surface", "Surface", "#131315"], ["surface-2", "Surface 2", "#1a1a1d"], ["bone", "Bone", "#efece6"], ["bone-2", "Bone 2", "#e5e1d9"], ["bright", "Bright", "#f4f2ee"], ["muted", "Muted", "#9d9b96"], ["faint", "Faint", "#66645f"], ["cyan", "Cyan", "#60c4e3"], ["pink", "Pink", "#eb5986"]];
  var WURZEL = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, '');

  /* Prüfseite gibt es online nicht (sie zeigt den Zustand des lokalen Servers) */
  var st = document.createElement('style');
  st.textContent = 'a[href$="pruefung.html"]{display:none!important}';
  (document.head || document.documentElement).appendChild(st);

  /* ------------------------------------------------------------ Farben (wie livre.py) */
  function lab(r, g, b) {
    function lin(c) { c /= 255; return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
    r = lin(r); g = lin(g); b = lin(b);
    var X = (r * .4124 + g * .3576 + b * .1805) / .95047, Y = r * .2126 + g * .7152 + b * .0722, Z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
    function f(t) { return t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  }
  var RAD = Math.PI / 180;
  function de2000(A, B) {
    var L1 = A[0], a1 = A[1], b1 = A[2], L2 = B[0], a2 = B[1], b2 = B[2];
    var C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
    var G = .5 * (1 - Math.sqrt(Math.pow(Cm, 7) / (Math.pow(Cm, 7) + Math.pow(25, 7))));
    var a1p = a1 * (1 + G), a2p = a2 * (1 + G), C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
    var h1p = ((Math.atan2(b1, a1p) / RAD) % 360 + 360) % 360, h2p = ((Math.atan2(b2, a2p) / RAD) % 360 + 360) % 360;
    var dL = L2 - L1, dC = C2p - C1p, dh;
    if (C1p * C2p === 0) dh = 0; else if (Math.abs(h2p - h1p) <= 180) dh = h2p - h1p; else dh = h2p > h1p ? h2p - h1p - 360 : h2p - h1p + 360;
    var dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh / 2 * RAD), Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2, hm;
    if (C1p * C2p === 0) hm = h1p + h2p; else if (Math.abs(h1p - h2p) <= 180) hm = (h1p + h2p) / 2; else hm = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
    var T = 1 - .17 * Math.cos((hm - 30) * RAD) + .24 * Math.cos(2 * hm * RAD) + .32 * Math.cos((3 * hm + 6) * RAD) - .2 * Math.cos((4 * hm - 63) * RAD);
    var dT = 30 * Math.exp(-Math.pow((hm - 275) / 25, 2)), RC = 2 * Math.sqrt(Math.pow(Cmp, 7) / (Math.pow(Cmp, 7) + Math.pow(25, 7)));
    var SL = 1 + .015 * Math.pow(Lm - 50, 2) / Math.sqrt(20 + Math.pow(Lm - 50, 2)), SC = 1 + .045 * Cmp, SH = 1 + .015 * Cmp * T, RT = -Math.sin(2 * dT * RAD) * RC;
    return Math.sqrt(Math.pow(dL / SL, 2) + Math.pow(dC / SC, 2) + Math.pow(dH / SH, 2) + RT * (dC / SC) * (dH / SH));
  }
  function hexRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  var PAL = PALETTE.map(function (p) { var c = hexRgb(p[2]); return { k: p[0], n: p[1], h: p[2], lab: lab(c[0], c[1], c[2]) }; });
  function palLab(k) { for (var i = 0; i < PAL.length; i++) if (PAL[i].k === k) return PAL[i].lab; return [0, 0, 0]; }
  var CYAN = palLab('cyan'), PINK = palLab('pink');
  function hex2(c) { return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function r4(x) { return Math.round(x * 1e4) / 1e4; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r3(x) { return Math.round(x * 1e3) / 1e3; }

  /* Median-Schnitt auf n Farben über eine Liste von [r,g,b] */
  function medianCut(px, n) {
    var boxen = [px];
    while (boxen.length < n) {
      var bi = -1, bw = -1, bk = 0;
      for (var i = 0; i < boxen.length; i++) {
        var b = boxen[i]; if (b.length < 2) continue;
        for (var k = 0; k < 3; k++) {
          var lo = 255, hi = 0;
          for (var j = 0; j < b.length; j++) { var v = b[j][k]; if (v < lo) lo = v; if (v > hi) hi = v; }
          if (hi - lo > bw) { bw = hi - lo; bi = i; bk = k; }
        }
      }
      if (bi < 0 || bw <= 0) break;
      var box = boxen[bi]; box.sort(function (x, y) { return x[bk] - y[bk]; });
      var m = box.length >> 1; boxen.splice(bi, 1, box.slice(0, m), box.slice(m));
    }
    return boxen.map(function (b) {
      var s = [0, 0, 0]; b.forEach(function (p) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; });
      return { rgb: [s[0] / b.length, s[1] / b.length, s[2] / b.length], anz: b.length };
    });
  }

  function farben(cv) {
    var g = cv.getContext('2d', { willReadFrequently: true });
    var W = cv.width, H = cv.height, d = g.getImageData(0, 0, W, H).data;
    /* Kanten heraus (wie MaxFilter/MinFilter 3 und Grenze 26 in livre.py) */
    var flach = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var mx = [0, 0, 0], mn = [255, 255, 255];
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var xx = Math.min(W - 1, Math.max(0, x + dx)), yy = Math.min(H - 1, Math.max(0, y + dy)), o = (yy * W + xx) * 4;
        for (var c = 0; c < 3; c++) { var v = d[o + c]; if (v > mx[c]) mx[c] = v; if (v < mn[c]) mn[c] = v; }
      }
      var u = (mx[0] - mn[0]) * .299 + (mx[1] - mn[1]) * .587 + (mx[2] - mn[2]) * .114;
      var p = (y * W + x) * 4;
      if (u <= 26) flach.push([d[p], d[p + 1], d[p + 2]]);
    }
    if (!flach.length) for (var q = 0; q < W * H; q++) flach.push([d[q * 4], d[q * 4 + 1], d[q * 4 + 2]]);
    var ges = flach.length || 1;
    var toene = medianCut(flach, 28).sort(function (a, b) { return b.anz - a.anz; }).map(function (t) {
      var L = lab(t.rgb[0], t.rgb[1], t.rgb[2]), best = PAL[0], bd = 1e9;
      PAL.forEach(function (p) { var e = de2000(L, p.lab); if (e < bd) { bd = e; best = p; } });
      return { hex: hex2(t.rgb), anteil: r4(t.anz / ges), naechste: best.k, name: best.n, palette: best.h, de: r1(bd), urteil: bd < 5 ? 'gleich' : bd < 12 ? 'nah' : 'fremd', _lab: L };
    });
    var zus = [];
    toene.forEach(function (t) {
      for (var i = 0; i < zus.length; i++) {
        var z = zus[i];
        if ((t.urteil === 'gleich' && z.urteil === 'gleich' && z.naechste === t.naechste) || (t.urteil !== 'gleich' && z.urteil === t.urteil && de2000(t._lab, z._lab) < 6)) { z.anteil = r4(z.anteil + t.anteil); return; }
      }
      zus.push(Object.assign({}, t));
    });
    toene = zus.sort(function (a, b) { return b.anteil - a.anteil; }).filter(function (z) { return z.anteil >= .004; })
      .map(function (z) { delete z._lab; return z; });
    var weiss = 0, grell = 0, marke = 0, n = W * H || 1;
    for (var s = 0; s < W * H; s++) {
      var Lb = lab(d[s * 4], d[s * 4 + 1], d[s * 4 + 2]), C = Math.hypot(Lb[1], Lb[2]);
      if (Lb[0] > 97 && C < 2.5) weiss++;
      if (de2000(Lb, CYAN) < 14 || de2000(Lb, PINK) < 14) marke++; else if (C > 55 && Lb[0] > 25) grell++;
    }
    var im_rahmen = toene.reduce(function (a, t) { return a + (t.urteil !== 'fremd' ? t.anteil : 0); }, 0);
    return { toene: toene, im_rahmen: r3(im_rahmen), weiss: r3(weiss / n), grell: r3(grell / n), marke: r3(marke / n) };
  }

  var PROBE_T = {
    en: { art: 'Draft', gesamt_gut: '{0} % of the surface is in the colours of the brand.', gesamt_mittel: '{0} % of the surface is in the colours of the brand, the rest is foreign.', gesamt_schlecht: 'Only {0} % of the surface is in the colours of the brand.',
      f_t: 'Colours of the brand', f_gut: 'Black, bone, cyan and pink carry the draft. No foreign surface stands out.', f_mittel: '{0} % of the surface is in the palette. The foreign tones below should become black, bone or a grey of the palette.', f_schlecht: '{0} % of the surface is in the palette. The draft is built on colours that do not belong to txtme.',
      g_t: 'Loud foreign tones', g_text: '{0} % of the surface is in saturated tones that are neither cyan nor pink. The brand knows no other signal colours.',
      w_t: 'Pure white', w_text: '{0} % of the surface is pure white. The light surface of the brand is bone #efece6, text on black is off-white #f4f2ee.',
      m_t: 'Cyan and pink as surface', m_text: '{0} % of the surface is cyan or pink. The two colours are a word, a dot or a gradient line, never a surface.', m_ok: 'Cyan and pink appear as signal, not as surface.' },
    de: { art: 'Entwurf', gesamt_gut: '{0} % der Fläche liegen in den Farben der Marke.', gesamt_mittel: '{0} % der Fläche liegen in den Farben der Marke, der Rest ist fremd.', gesamt_schlecht: 'Nur {0} % der Fläche liegen in den Farben der Marke.',
      f_t: 'Farben der Marke', f_gut: 'Schwarz, Knochenweiss, Türkis und Pink tragen den Entwurf. Keine fremde Fläche fällt auf.', f_mittel: '{0} % der Fläche liegen in der Palette. Die fremden Töne unten sollten Schwarz, Knochenweiss oder ein Grau der Palette werden.', f_schlecht: '{0} % der Fläche liegen in der Palette. Der Entwurf steht auf Farben, die nicht zu txtme gehören.',
      g_t: 'Grelle fremde Töne', g_text: '{0} % der Fläche sind gesättigte Töne, die weder Türkis noch Pink sind. Die Marke kennt keine anderen Signalfarben.',
      w_t: 'Reinweiss', w_text: '{0} % der Fläche sind Reinweiss. Die helle Fläche der Marke ist Knochenweiss #efece6, Text auf Schwarz ist Off-White #f4f2ee.',
      m_t: 'Türkis und Pink als Fläche', m_text: '{0} % der Fläche sind Türkis oder Pink. Die zwei Farben sind ein Wort, ein Punkt oder eine Verlaufslinie, nie eine Fläche.', m_ok: 'Türkis und Pink erscheinen als Signal, nicht als Fläche.' }
  };
  function probe(m, sp) {
    var T = PROBE_T[sp] || PROBE_T.en, pr = function (x) { return Math.round(x * 100); }, fm = function (s, v) { return s.replace('{0}', v); };
    var r = pr(m.im_rahmen), g = m.grell, w = m.weiss, k = m.marke, punkte = [];
    if (g >= .06 || r < 60) punkte.push({ bereich: 'farben', urteil: 'passt_nicht', titel: T.f_t, text: fm(T.f_schlecht, r) });
    else if (r < 85) punkte.push({ bereich: 'farben', urteil: 'achten', titel: T.f_t, text: fm(T.f_mittel, r) });
    else punkte.push({ bereich: 'farben', urteil: 'passt', titel: T.f_t, text: T.f_gut });
    if (g >= .02) punkte.push({ bereich: 'farben', urteil: g >= .06 ? 'passt_nicht' : 'achten', titel: T.g_t, text: fm(T.g_text, pr(g)) });
    if (w >= .08) punkte.push({ bereich: 'farben', urteil: 'achten', titel: T.w_t, text: fm(T.w_text, pr(w)) });
    if (k >= .25) punkte.push({ bereich: 'farben', urteil: 'achten', titel: T.m_t, text: fm(T.m_text, pr(k)) });
    else if (k > 0) punkte.push({ bereich: 'farben', urteil: 'passt', titel: T.m_t, text: T.m_ok });
    var gesamt = fm((g >= .06 || r < 60) ? T.gesamt_schlecht : r < 85 ? T.gesamt_mittel : T.gesamt_gut, r);
    return { art: T.art, gesamt: gesamt, punkte: punkte, text: '', ton: [], probe: true };
  }

  /* ------------------------------------------------------------ Bilder und Seiten */
  function ladeBild(src) {
    return new Promise(function (ok, nein) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { nein(new Error('x')); }; im.src = src; });
  }
  function leinwand(w, h, grund) {
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    var g = c.getContext('2d'); if (grund) { g.fillStyle = grund; g.fillRect(0, 0, c.width, c.height); }
    g.imageSmoothingQuality = 'high'; return c;
  }
  function verkleinere(quelle, w, h, max) {
    var s = Math.min(1, max / Math.max(w, h)), c = leinwand(w * s, h * s, '#fff');
    c.getContext('2d').drawImage(quelle, 0, 0, c.width, c.height); return c;
  }
  var pdfjs = null;
  async function pdfSeiten(bytes) {
    if (!pdfjs) { pdfjs = await import(WURZEL + 'pdfjs/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = WURZEL + 'pdfjs/pdf.worker.min.mjs'; }
    var doc = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise, aus = [];
    for (var i = 1; i <= Math.min(3, doc.numPages); i++) {
      var s = await doc.getPage(i), vp = s.getViewport({ scale: 110 / 72 }), c = leinwand(vp.width, vp.height, '#fff');
      await s.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; aus.push(c);
    }
    return aus;
  }
  function fehler(code, text) { var e = new Error(text); e.code = code; return e; }

  async function pruefen(d) {
    var m = /^data:([^;]+);base64,([\s\S]*)$/.exec(d.daten || '');
    if (!m) throw fehler(400, 'DATEI · No file arrived.');
    var name = String(d.name || 'Draft').slice(0, 120), sp = d.sprache === 'de' ? 'de' : 'en', seiten = [], groesse;
    if (m[1] === 'application/pdf') {
      var bin = atob(m[2]), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      try { seiten = await pdfSeiten(bytes); } catch (e) { throw fehler(400, 'PDF · The PDF could not be read.'); }
      if (!seiten.length) throw fehler(400, 'PDF · The PDF could not be read.');
      groesse = [seiten[0].width, seiten[0].height];
    } else {
      var im;
      try { im = await ladeBild(d.daten); } catch (e) { throw fehler(400, 'DATEI · The image could not be opened. Allowed are JPG, PNG, WebP and PDF.'); }
      var c = leinwand(im.naturalWidth, im.naturalHeight, '#fff'); c.getContext('2d').drawImage(im, 0, 0); seiten = [c];
      groesse = [im.naturalWidth, im.naturalHeight];
    }
    /* Streifen aller Seiten, je höchstens 600 px, für die Messung; für die Rechenzeit im Browser auf höchstens 360 px Breite */
    var streifen = seiten.map(function (s) { return verkleinere(s, s.width, s.height, 600); });
    var bw = Math.max.apply(null, streifen.map(function (s) { return s.width; })), bh = streifen.reduce(function (a, s) { return a + s.height; }, 0);
    var sk = Math.min(1, 360 / bw), ges = leinwand(bw * sk, bh * sk, '#fff'), y = 0, gg = ges.getContext('2d');
    streifen.forEach(function (s) { gg.drawImage(s, 0, y * sk, s.width * sk, s.height * sk); y += s.height; });
    var messung = farben(ges);
    var vor = verkleinere(seiten[0], seiten[0].width, seiten[0].height, 900);
    return { name: name, seiten: seiten.length, groesse: groesse, messung: messung, vorschau: vor.toDataURL('image/jpeg', .82), ki: probe(messung, sp), dauer: 0 };
  }

  /* ------------------------------------------------------------ Fotos in fertiger Grösse (api/bild) */
  var FORMATE = { instagram: [1080, 1350], story: [1080, 1920] };
  var daten = null;
  async function katalog() {
    if (!daten) daten = await (await fetch(WURZEL + 'livre.json')).json();
    return daten;
  }
  async function bild(q) {
    var k = q.get('k'), f = q.get('f') || 'web', d = await katalog(), foto = (d.fotos || []).filter(function (x) { return x.k === k; })[0];
    if (!foto) throw new Error('BILD');
    var im = await ladeBild(WURZEL + foto.gross), w = im.naturalWidth, h = im.naturalHeight;
    var grund = foto.b === 'hero' ? '#0b0b0c' : '#ffffff';
    var name = 'txtme-' + k + (foto.ki ? '-ai-generated' : '') + '-websitegroesse', c, qual, datei;
    if (f === 'druck') { c = leinwand(w, h, grund); c.getContext('2d').drawImage(im, 0, 0); qual = .95; datei = name + '-print-' + w + 'x' + h + '.jpg'; }
    else if (f === 'web') { var s = Math.min(1, 2000 / Math.max(w, h)); c = leinwand(w * s, h * s, grund); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); qual = .86; datei = name + '-web-' + c.width + 'x' + c.height + '.jpg'; }
    else {
      var Z = FORMATE[f]; if (!Z) throw new Error('FORMAT');
      var x = Math.min(1, Math.max(0, parseFloat(q.get('x') || .5) || .5)), y = Math.min(1, Math.max(0, parseFloat(q.get('y') || .5) || .5));
      var sx = 0, sy = 0, sw = w, sh = h;
      if (w / h > Z[0] / Z[1]) { sw = Math.round(h * Z[0] / Z[1]); sx = Math.round((w - sw) * x); } else { sh = Math.round(w * Z[1] / Z[0]); sy = Math.round((h - sh) * y); }
      c = leinwand(Z[0], Z[1], grund); c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, Z[0], Z[1]);
      qual = .9; datei = name + '-' + f + '-' + Z[0] + 'x' + Z[1] + (sw < Z[0] ? '-upscaled' : '') + '.jpg';
    }
    var blob = await new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', qual); });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = datei;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (!/\/api\/bild$/.test(u.pathname)) return;
    e.preventDefault();
    bild(u.searchParams).catch(function () { /* Rückfall: das Foto in Websitegrösse, wie ohne Server */
      katalog().then(function (d) { var f = (d.fotos || []).filter(function (x) { return x.k === u.searchParams.get('k'); })[0]; if (f) { var b = document.createElement('a'); b.href = WURZEL + f.gross; b.download = ''; document.body.appendChild(b); b.click(); b.remove(); } });
    });
  }, true);

  /* ------------------------------------------------------------ Aufrufe an den Server */
  var echt = window.fetch;
  function antwort(code, d) { return new Response(JSON.stringify(d), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
  window.fetch = function (eingabe, opt) {
    var url = typeof eingabe === 'string' ? eingabe : (eingabe && eingabe.url) || '';
    var u; try { u = new URL(url, location.href); } catch (e) { return echt.apply(this, arguments); }
    var m = /\/api\/(stand|zustand|fehler|pruefen|bild)$/.exec(u.pathname);
    if (!m || u.origin !== location.origin) return echt.apply(this, arguments);
    var was = m[1];
    if (was === 'fehler') return Promise.resolve(antwort(200, { ok: true }));
    if (was === 'stand' || was === 'zustand') return katalog().then(function (d) { return antwort(200, Object.assign({}, d.stand || {}, { ki: false, demo: true })); }, function () { return antwort(200, { ki: false, demo: true }); });
    if (was === 'pruefen') {
      var roh = opt && opt.body;
      return new Promise(function (ok) { setTimeout(ok, 30); }).then(function () { return pruefen(JSON.parse(roh || '{}')); })
        .then(function (j) { return antwort(200, j); }, function (e) { return antwort(e.code || 400, { fehler: e.message || 'SERVER · Error' }); });
    }
    return Promise.resolve(antwort(404, { fehler: 'WEG · Not found.' }));
  };
})();
