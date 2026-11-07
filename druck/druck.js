/* Drucksachen-Studio · Druck: eine Seite in Zeichenbefehle zerlegen (Masse in mm, Text Zeichen für Zeichen an
   der Stelle, an der der Browser ihn gesetzt hat), daraus PDF für die Druckerei oder ein Bild. Dazu die Druckprüfung. */
(function () {
  const DS = window.DS;
  const MM = 72 / 25.4;
  const S = 8;   // Messauflösung: 8 px je mm

  const hex = f => { const h = f.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255); };
  const bildCache = {};
  DS.ladeBild = function (url) {
    if (!bildCache[url]) bildCache[url] = new Promise((ok, nein) => { const i = new Image(); i.onload = () => ok(i); i.onerror = nein; i.src = url; });
    return bildCache[url];
  };

  /* Grundlinien-Lage je Schrift: Abstand Oberkante Zeichenkasten → Grundlinie, als Anteil der Schriftgrösse */
  const grund = {};
  function grundlinie(rolle) {
    if (grund[rolle]) return grund[rolle];
    const w = document.createElement('div');
    w.style.cssText = `position:absolute;left:-99999px;top:0;font-family:'DS-${rolle}';font-size:100px;line-height:normal;white-space:nowrap`;
    w.innerHTML = 'H<span style="display:inline-block;width:0;height:0;vertical-align:baseline"></span>';
    document.body.appendChild(w);
    const r = document.createRange(); r.setStart(w.firstChild, 0); r.setEnd(w.firstChild, 1);
    const top = r.getBoundingClientRect().top, base = w.lastChild.getBoundingClientRect().top;
    document.body.removeChild(w);
    return (grund[rolle] = (base - top) / 100);
  }

  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    if (!r) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    const k = r * .5523;
    return `M${x + r} ${y}H${x + w - r}C${x + w - r + k} ${y} ${x + w} ${y + r - k} ${x + w} ${y + r}V${y + h - r}C${x + w} ${y + h - r + k} ${x + w - r + k} ${y + h} ${x + w - r} ${y + h}` +
      `H${x + r}C${x + r - k} ${y + h} ${x} ${y + h - r + k} ${x} ${y + h - r}V${y + r}C${x} ${y + r - k} ${x + r - k} ${y} ${x + r} ${y}Z`;
  }
  DS.rr = rr;

  /* Fläche mit Tapete als Pixelbild (Rapport an der Ecke des Endformats verankert, wie am Bildschirm) */
  async function tapetenBild(M, art, farbe, x, y, w, h, r, dpi) {
    const k = dpi / 25.4, cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const g = cv.getContext('2d');
    if (r) { g.beginPath(); g.roundRect(0, 0, cw, ch, r * k); g.clip(); }
    g.fillStyle = farbe; g.fillRect(0, 0, cw, ch);
    const kachel = await DS.ladeBild(M.basis + M.tapete[art]);
    const rw = M.tapete.rapport_mm * k, rh = rw * kachel.height / kachel.width;
    const ox = ((-x * k) % rw + rw) % rw - rw, oy = ((-y * k) % rh + rh) % rh - rh;
    for (let yy = oy; yy < ch; yy += rh) for (let xx = ox; xx < cw; xx += rw) g.drawImage(kachel, xx, yy, rw, rh);
    return { cv, png: !!r };
  }

  async function fotoBild(M, el, dpi) {
    const b = M.bildIndex[el.bild];
    const img = await DS.ladeBild(b && b.druck ? b.druck.url : DS.bildUrl(M, el.bild));
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const a = DS.ausschnitt(el, iw, ih);
    const s = iw / a.bw;                       // Quellpixel je mm
    const sx = -a.x * s, sy = -a.y * s, sw = el.w * s, sh = el.h * s;
    const cw = Math.max(1, Math.round(Math.min(sw, el.w / 25.4 * dpi))), ch = Math.max(1, Math.round(cw * el.h / el.w));
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high';
    if (el.r) { g.beginPath(); g.roundRect(0, 0, cw, ch, el.r * cw / el.w); g.clip(); }
    g.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    void b;
    return { cv, png: !!el.r || !!(b && (b.datei || b.alpha)), dpi: sw / (el.w / 25.4) };
  }

  /* ---------- Zerlegen ---------- */
  DS.druckplan = async function (M, doc, i, o = {}) {
    const B = DS.B, s = doc.seiten[i], f = doc.format, dpi = o.dpi || 300;
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;transform:translateX(-200000px);pointer-events:none';
    document.body.appendChild(host);
    const blatt = DS.seiteDom(M, doc, i, S, {});
    host.appendChild(blatt);
    await document.fonts.ready;
    const ur = blatt.getBoundingClientRect();
    const ox = ur.left + B * S, oy = ur.top + B * S;
    const ops = [];
    // Grund über den ganzen Beschnitt
    if (s.grund && s.tapete) ops.push({ art: 'raster', x: -B, y: -B, w: f.b + 2 * B, h: f.h + 2 * B, ...(await tapetenBild(M, s.tapete, DS.farbe(M, s.grund), -B, -B, f.b + 2 * B, f.h + 2 * B, 0, 240)) });
    else if (s.grund) ops.push({ art: 'pfad', d: rr(-B, -B, f.b + 2 * B, f.h + 2 * B, 0), fill: DS.farbe(M, s.grund), deck: 1 });
    const kinder = [...blatt.children];
    for (let n = 0; n < s.el.length; n++) {
      const el = s.el[n], d = kinder[n];
      const deck = el.deck ?? 1;
      if (el.typ === 'text') {
        const gl = DS.glyphen(d, S, ox, oy), a = grundlinie(el.rolle);
        ops.push({ art: 'text', rolle: el.rolle, gr: el.gr, farbe: DS.farbe(M, el.farbe), deck, gross: el.gross,
          glyphen: gl.map(g => ({ ch: el.gross ? g.ch.toUpperCase() : g.ch, x: g.x, base: g.top + a * el.gr })) });
      } else if (el.typ === 'bild') {
        if (!M.bildIndex[el.bild]) continue;
        ops.push({ art: 'raster', x: el.x, y: el.y, w: el.w, h: el.h, deck, ...(await fotoBild(M, el, dpi)) });
      } else if (el.typ === 'flaeche') {
        if (el.tapete) ops.push({ art: 'raster', x: el.x, y: el.y, w: el.w, h: el.h, deck, ...(await tapetenBild(M, el.tapete, DS.farbe(M, el.farbe), el.x, el.y, el.w, el.h, el.r, 240)) });
        else ops.push({ art: 'pfad', d: rr(el.x, el.y, el.w, el.h, el.r), fill: DS.farbe(M, el.farbe), deck });
      } else if (el.typ === 'linie') {
        const senk = el.h > el.w;
        if (el.dash) ops.push({ art: 'strich', x1: senk ? el.x + el.staerke / 2 : el.x, y1: senk ? el.y : el.y + el.staerke / 2, x2: senk ? el.x + el.staerke / 2 : el.x + el.w, y2: senk ? el.y + el.h : el.y + el.staerke / 2, breite: el.staerke, dash: el.dash, farbe: DS.farbe(M, el.farbe), deck });
        else ops.push({ art: 'pfad', d: rr(el.x, el.y, senk ? el.staerke : el.w, senk ? el.h : el.staerke, 0), fill: DS.farbe(M, el.farbe), deck });
      } else if (el.typ === 'rahmen') {
        const t = el.staerke;
        ops.push({ art: 'pfad', d: rr(el.x + t / 2, el.y + t / 2, el.w - t, el.h - t, Math.max(0, (el.r || 0) - t / 2)), stroke: DS.farbe(M, el.farbe), breite: t, deck });
      } else if (el.typ === 'zeichen') {
        const k = el.w / M.zeichen.vb[2];
        ops.push({ art: 'zeichen', x: el.x, y: el.y, k, farbe: DS.farbe(M, el.farbe), deck });
      }
    }
    document.body.removeChild(host);
    return ops;
  };

  /* ---------- PDF ---------- */
  const schriftCache = {};
  async function schriftBytes(M, rolle) {
    const url = M.basis + 'schriften/' + M.schriften[rolle].datei;
    if (!schriftCache[url]) schriftCache[url] = fetch(url).then(r => r.arrayBuffer());
    return schriftCache[url];
  }

  /* ---------- Sticker: auf die Tinte getrimmt (Robert 04.10.2026: ohne weissen Rand, ohne Platte, ohne Schatten) ----------
     Die Seite wird ohne Grund gerastert (8 px je mm), die Deckung der Pixel ergibt die Tinte: ihr Rechteck ist die Seite (PDF, PNG),
     die Kontur der um KONTUR mm erweiterten Tinte ist die Schnittlinie: Sonderfarbe «CutContour» (Separation, Ersatzfarbe Magenta), Haarlinie,
     auf eigener Ebene «CutContour», rundum RAND mm Luft bis zur Seitenkante, wie die Stickerdatei des RKN-Kits (kit.py: BLEED 2 mm, Ebene CutContour). */
  DS.KONTUR_RAND = 2;   // mm von der Schnittlinie bis zur Seitenkante (vorher 0: die Linie lag auf der Kante und war angeschnitten, zweite Abnahme 07.11.2026 Fund N6)
  DS.KONTUR = 1.5;   // mm Abstand der Schnittlinie von der Tinte (Konturschnitt; 0 = genau an der Tinte, für Plotter zu knapp)
  DS.tinte = async function (M, doc, i, px = 8) {
    const f = doc.format, ops = await DS.druckplan(M, doc, i, { dpi: 220 });
    const cv = document.createElement('canvas'); cv.width = Math.ceil(f.b * px); cv.height = Math.ceil(f.h * px);
    const g = cv.getContext('2d'); g.setTransform(px, 0, 0, px, 0, 0);
    male(g, M, ops);
    const d = g.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    const maske = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 24) { maske[y * W + x] = 1; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    return { px, W, H, maske, box: { x: x0 / px, y: y0 / px, w: (x1 - x0 + 1) / px, h: (y1 - y0 + 1) / px }, ops };
  };
  /* Kontur der erweiterten Tinte als Pfad in mm (Marching Squares auf der um r mm verdickten Maske) */
  /* Maske um R Pixel verdicken (Scheibe): je Zeile der Abstand zur nächsten Tinte, dann je Spalte die Scheibe prüfen */
  function verdicke(maske, W, H, R) {
    const m = new Uint8Array(W * H), dist = new Float32Array(W * H).fill(1e9);
    for (let y = 0; y < H; y++) { let last = -1e9; for (let x = 0; x < W; x++) { if (maske[y * W + x]) last = x; dist[y * W + x] = x - last; } last = 1e9; for (let x = W - 1; x >= 0; x--) { if (maske[y * W + x]) last = x; dist[y * W + x] = Math.min(dist[y * W + x], last - x); } }
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { for (let k = -R; k <= R; k++) { const yy = y + k; if (yy < 0 || yy >= H) continue; const dx = dist[yy * W + x]; if (dx * dx + k * k <= R * R) { m[y * W + x] = 1; break; } } }
    return m;
  }
  DS.KONTUR_SCHLIESSEN = 4;   // mm: Lücken zwischen Zeilen und Wörtern, die der Schnitt überbrückt (ein Sticker, nicht sieben)
  DS.kontur = function (T0, r) {
    /* Raster rundum um Abstand und Schliessweite gepolstert: liegt Tinte nah am Formatrand, läuft die Linie trotzdem im vollen Abstand darum
       (vorher endete das Raster am Format, die Linie wäre dort an die Tinte gerückt) */
    const PAD = Math.round((r + DS.KONTUR_SCHLIESSEN) * T0.px) + 2, W = T0.W + 2 * PAD, H = T0.H + 2 * PAD, px = T0.px;   // Polster = Abstand + Schliessen, sonst bleibt die Linie am Rand des Rasters hängen
    const T = { W, H, px, maske: new Uint8Array(W * H) };
    for (let y = 0; y < T0.H; y++) T.maske.set(T0.maske.subarray(y * T0.W, (y + 1) * T0.W), (y + PAD) * W + PAD);
    const R = Math.round(r * px), RS = Math.round(DS.KONTUR_SCHLIESSEN * px);
    // Schliessen: um R+RS verdicken, dann um RS zurücknehmen (Verdicken des Gegenteils) → eine Form im Abstand R um die ganze Tinte
    const grob = verdicke(T.maske, W, H, R + RS);
    const gegen = new Uint8Array(W * H); for (let i = 0; i < gegen.length; i++) gegen[i] = grob[i] ? 0 : 1;
    const zurueck = verdicke(gegen, W, H, RS);
    const m = new Uint8Array(W * H); for (let i = 0; i < m.length; i++) m[i] = zurueck[i] ? 0 : 1;
    // Marching Squares auf dem um 1 px gepolsterten Raster
    const P = W + 2, Q = H + 2, at = (x, y) => (x <= 0 || y <= 0 || x > W || y > H) ? 0 : m[(y - 1) * W + (x - 1)];
    const key = (x, y) => (x * 2) + ',' + (y * 2), seg = new Map(), segs = [];
    for (let y = 0; y < Q - 1; y++) for (let x = 0; x < P - 1; x++) {
      const c = at(x, y) * 8 + at(x + 1, y) * 4 + at(x + 1, y + 1) * 2 + at(x, y + 1);
      if (!c || c === 15) continue;
      const t = [x + .5, y], rgt = [x + 1, y + .5], b = [x + .5, y + 1], l = [x, y + .5];
      const L = { 1: [[l, b]], 2: [[b, rgt]], 3: [[l, rgt]], 4: [[t, rgt]], 5: [[l, t], [b, rgt]], 6: [[t, b]], 7: [[l, t]], 8: [[t, l]], 9: [[t, b]], 10: [[t, rgt], [b, l]], 11: [[t, rgt]], 12: [[rgt, l]], 13: [[rgt, b]], 14: [[b, l]] }[c];
      for (const s of L) segs.push(s);
    }
    // Kette über beide Enden (Richtung der Stücke spielt keine Rolle)
    for (const s of segs) for (const e of s) { const k = key(e[0], e[1]); if (!seg.has(k)) seg.set(k, []); seg.get(k).push(s); }
    const pfade = [], benutzt = new Set();
    for (const s of segs) {
      if (benutzt.has(s)) continue;
      benutzt.add(s);
      const p = [s[0], s[1]];
      for (let n = 0; n < segs.length; n++) {
        const e = p[p.length - 1], nx = (seg.get(key(e[0], e[1])) || []).find(z => !benutzt.has(z)); if (!nx) break;
        benutzt.add(nx);
        const o = nx[0][0] === e[0] && nx[0][1] === e[1] ? nx[1] : nx[0];
        p.push(o);
        if (o[0] === p[0][0] && o[1] === p[0][1]) break;
      }
      if (p.length > 8) pfade.push(p.map(([x, y]) => [(x - 1 - PAD) / px, (y - 1 - PAD) / px]));
    }
    pfade.sort((a, b) => b.length - a.length);
    // nur die äussere Kontur (Löcher gefüllt, wie die Stickerdatei des Kits); glätten: jeden dritten Punkt, Mittelwert der Nachbarn
    return pfade.slice(0, 1).map(p => { const q = []; for (let i = 0; i < p.length; i += 3) { const a = p[Math.max(0, i - 1)], b = p[i], c = p[Math.min(p.length - 1, i + 1)]; q.push([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3]); } return q; });
  };
  function male(g, M, ops) {
    for (const op of ops) {
      g.save(); g.globalAlpha = op.deck ?? 1;
      if (op.art === 'pfad') {
        const p = new Path2D(op.d);
        if (op.fill) { g.fillStyle = op.fill; g.fill(p); }
        if (op.stroke) { g.strokeStyle = op.stroke; g.lineWidth = op.breite; g.stroke(p); }
      } else if (op.art === 'raster') g.drawImage(op.cv, op.x, op.y, op.w, op.h);
      else if (op.art === 'strich') { g.strokeStyle = op.farbe; g.lineWidth = op.breite; g.lineCap = 'round'; g.setLineDash(op.dash); g.beginPath(); g.moveTo(op.x1, op.y1); g.lineTo(op.x2, op.y2); g.stroke(); g.setLineDash([]); }
      else if (op.art === 'zeichen') {
        g.translate(op.x, op.y); g.scale(op.k, op.k); g.fillStyle = op.farbe;
        for (const d of M.zeichen.pfade) g.fill(new Path2D(d));
      } else if (op.art === 'text') {
        g.fillStyle = op.farbe; g.font = `${op.gr}px 'DS-${op.rolle}'`; g.textBaseline = 'alphabetic';
        for (const gl of op.glyphen) g.fillText(gl.ch, gl.x, gl.base);
      }
      g.restore();
    }
  }
  DS.male = male;

  DS.pdf = async function (M, doc, o = {}) {
    const { PDFDocument, rgb, cmyk } = PDFLib;
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const W = (M.werkzeug || 'Print Workshop') + ' · ' + M.name;
    pdf.setTitle(doc.name); pdf.setAuthor(M.name); pdf.setCreator(W + ' · Tasty Studios'); pdf.setProducer(W);
    if (DS.frei(doc.formatKey)) return DS.pdfFrei(pdf, M, doc, o);
    const B = DS.B, R = o.marken ? 10 : 0, f = doc.format;
    const fonts = {}, zeichensatz = {};
    const font = async rolle => {
      if (!fonts[rolle]) {
        fonts[rolle] = await pdf.embedFont(await schriftBytes(M, rolle), { subset: true });
        zeichensatz[rolle] = new Set(fonts[rolle].getCharacterSet());
      }
      return fonts[rolle];
    };
    const fehlend = new Set();
    for (let i = 0; i < doc.seiten.length; i++) {
      if (o.melde) o.melde(`Setting page ${i + 1} of ${doc.seiten.length} …`);
      const ops = await DS.druckplan(M, doc, i, o);
      const PW = (f.b + 2 * B + 2 * R) * MM, PH = (f.h + 2 * B + 2 * R) * MM;
      const page = pdf.addPage([PW, PH]);
      const X = x => (x + B + R) * MM, Y = y => PH - (y + B + R) * MM;
      page.setBleedBox(R * MM, R * MM, (f.b + 2 * B) * MM, (f.h + 2 * B) * MM);
      page.setTrimBox((R + B) * MM, (R + B) * MM, f.b * MM, f.h * MM);
      for (const op of ops) {
        if (op.art === 'pfad') {
          const opt = { x: X(0), y: Y(0), scale: MM };
          if (op.fill) Object.assign(opt, { color: rgb(...hex(op.fill)), opacity: op.deck });
          if (op.stroke) Object.assign(opt, { borderColor: rgb(...hex(op.stroke)), borderWidth: op.breite, borderOpacity: op.deck });
          page.drawSvgPath(op.d, opt);
        } else if (op.art === 'strich') {
          page.drawLine({ start: { x: X(op.x1), y: Y(op.y1) }, end: { x: X(op.x2), y: Y(op.y2) }, thickness: op.breite * MM, color: rgb(...hex(op.farbe)), opacity: op.deck, dashArray: op.dash.map(v => v * MM), lineCap: 1 });
        } else if (op.art === 'raster') {
          const daten = op.png ? op.cv.toDataURL('image/png') : op.cv.toDataURL('image/jpeg', .92);
          const bild = op.png ? await pdf.embedPng(daten) : await pdf.embedJpg(daten);
          page.drawImage(bild, { x: X(op.x), y: Y(op.y + op.h), width: op.w * MM, height: op.h * MM, opacity: op.deck ?? 1 });
        } else if (op.art === 'zeichen') {
          for (const d of M.zeichen.pfade) page.drawSvgPath(d, { x: X(op.x), y: Y(op.y), scale: op.k * MM, color: rgb(...hex(op.farbe)), opacity: op.deck });
        } else if (op.art === 'text') {
          const fo = await font(op.rolle);
          for (const g of op.glyphen) {
            let fx = fo;
            if (!zeichensatz[op.rolle].has(g.ch.codePointAt(0))) {
              const alt = await font('text');
              if (zeichensatz.text.has(g.ch.codePointAt(0))) fx = alt; else { fehlend.add(g.ch); continue; }
            }
            page.drawText(g.ch, { x: X(g.x), y: Y(g.base), size: op.gr * MM, font: fx, color: rgb(...hex(op.farbe)), opacity: op.deck });
          }
        }
      }
      if (o.marken) {
        const reg = cmyk(1, 1, 1, 1), t = .25, L = 5 * MM, gap = (B + 1) * MM;
        const x0 = (R + B) * MM, x1 = x0 + f.b * MM, y0 = (R + B) * MM, y1 = y0 + f.h * MM;
        for (const [x, sx] of [[x0, -1], [x1, 1]]) for (const [y, sy] of [[y0, -1], [y1, 1]]) {
          page.drawLine({ start: { x: x + sx * gap, y }, end: { x: x + sx * (gap + L), y }, thickness: t, color: reg });
          page.drawLine({ start: { x, y: y + sy * gap }, end: { x, y: y + sy * (gap + L) }, thickness: t, color: reg });
        }
        const fo = await font('mono');
        page.drawText(`${doc.name} · ${DS.FORMATE[doc.formatKey].name} (${f.b} × ${f.h} mm) · page ${i + 1} · 3 mm bleed`, { x: x0 + 10 * MM, y: 3.5 * MM, size: 5.5, font: fo, color: reg });
      }
    }
    return { bytes: await pdf.save(), fehlend: [...fehlend] };
  };

  /* Sticker-PDF: je Seite ein Blatt in der Grösse der Tinte (kein Beschnitt, kein Grund), darauf die Teile, dazu die Schnittkontur in Magenta */
  /* Schnittlinie als Sonderfarbe: Schneideplotter und Druckereien erkennen die Linie an der Separation «CutContour»; als gewöhnliches
     CMYK-Magenta würde sie mitgedruckt (zweite Abnahme 07.11.2026 Fund N6). Ersatzfarbe für Bildschirm und Proof: 0/100/0/0. */
  function schnittlinie(pdf, page, pfade) {
    const P = PDFLib, ctx = pdf.context, N = P.PDFName.of;
    if (!pdf.__cut) {
      const fn = ctx.register(ctx.obj({ FunctionType: 2, Domain: [0, 1], C0: [0, 0, 0, 0], C1: [0, 1, 0, 0], N: 1 }));
      const cs = ctx.register(ctx.obj([N('Separation'), N('CutContour'), N('DeviceCMYK'), fn]));
      const ocg = ctx.register(ctx.obj({ Type: 'OCG', Name: P.PDFString.of('CutContour'), Intent: 'View' }));
      pdf.catalog.set(N('OCProperties'), ctx.obj({ OCGs: [ocg], D: { Name: P.PDFString.of('Layers'), Order: [ocg], ON: [ocg], OFF: [] } }));
      pdf.__cut = { cs, ocg };
    }
    const res = page.node.Resources();
    const unter = name => { let d = res.lookup(N(name)); if (!d) { d = ctx.obj({}); res.set(N(name), d); } return d; };
    unter('ColorSpace').set(N('CSCut'), pdf.__cut.cs);
    unter('Properties').set(N('OCCut'), pdf.__cut.ocg);
    const ops = [P.pushGraphicsState(), P.PDFOperator.of('BDC', [N('OC'), N('OCCut')]),
      P.PDFOperator.of('CS', [N('CSCut')]), P.PDFOperator.of('SCN', [P.PDFNumber.of(1)]), P.setLineWidth(.25), P.setLineJoin(P.LineJoinStyle.Round)];
    for (const p of pfade) { p.forEach(([x, y], i) => ops.push(i ? P.lineTo(x, y) : P.moveTo(x, y))); ops.push(P.closePath()); }
    ops.push(P.stroke(), P.PDFOperator.of('EMC'), P.popGraphicsState());
    page.pushOperators(...ops);
  }
  DS.pdfFrei = async function (pdf, M, doc, o = {}) {
    const { rgb, cmyk } = PDFLib;
    const fonts = {}, zeichensatz = {}, fehlend = new Set();
    const schrift = async rolle => { if (!fonts[rolle]) { fonts[rolle] = await pdf.embedFont(await schriftBytes(M, rolle), { subset: true }); zeichensatz[rolle] = new Set(fonts[rolle].getCharacterSet()); } return fonts[rolle]; };
    for (let i = 0; i < doc.seiten.length; i++) {
      if (o.melde) o.melde(`Page ${i + 1} of ${doc.seiten.length}: trimming to the ink …`);
      const T = await DS.tinte(M, doc, i);
      if (!T) continue;
      const k = DS.KONTUR, kont = DS.kontur(T, k), rd = DS.KONTUR_RAND;
      // Seite = Rechteck der Schnittlinie + RAND rundum; TrimBox = Rechteck der Schnittlinie (der Sticker), BleedBox = ganze Seite
      let kx0 = T.box.x - k, ky0 = T.box.y - k, kx1 = T.box.x + T.box.w + k, ky1 = T.box.y + T.box.h + k;
      for (const p of kont) for (const [x, y] of p) { kx0 = Math.min(kx0, x); ky0 = Math.min(ky0, y); kx1 = Math.max(kx1, x); ky1 = Math.max(ky1, y); }
      const box = { x: kx0 - rd, y: ky0 - rd, w: kx1 - kx0 + 2 * rd, h: ky1 - ky0 + 2 * rd };
      const PW = box.w * MM, PH = box.h * MM, page = pdf.addPage([PW, PH]);
      const X = x => (x - box.x) * MM, Y = y => PH - (y - box.y) * MM;
      page.setTrimBox(rd * MM, rd * MM, (kx1 - kx0) * MM, (ky1 - ky0) * MM); page.setBleedBox(0, 0, PW, PH);
      for (const op of T.ops) {
        if (op.art === 'pfad') {
          const opt = { x: X(0), y: Y(0), scale: MM };
          if (op.fill) Object.assign(opt, { color: rgb(...hex(op.fill)), opacity: op.deck });
          if (op.stroke) Object.assign(opt, { borderColor: rgb(...hex(op.stroke)), borderWidth: op.breite, borderOpacity: op.deck });
          page.drawSvgPath(op.d, opt);
        } else if (op.art === 'strich') {
          page.drawLine({ start: { x: X(op.x1), y: Y(op.y1) }, end: { x: X(op.x2), y: Y(op.y2) }, thickness: op.breite * MM, color: rgb(...hex(op.farbe)), opacity: op.deck, dashArray: op.dash.map(v => v * MM) });
        } else if (op.art === 'raster') {
          const daten = op.png ? op.cv.toDataURL('image/png') : op.cv.toDataURL('image/jpeg', .92);
          const bild = op.png ? await pdf.embedPng(daten) : await pdf.embedJpg(daten);
          page.drawImage(bild, { x: X(op.x), y: Y(op.y + op.h), width: op.w * MM, height: op.h * MM, opacity: op.deck ?? 1 });
        } else if (op.art === 'zeichen') {
          for (const d of M.zeichen.pfade) page.drawSvgPath(d, { x: X(op.x), y: Y(op.y), scale: op.k * MM, color: rgb(...hex(op.farbe)), opacity: op.deck });
        } else if (op.art === 'text') {
          const fo = await schrift(op.rolle);
          for (const g of op.glyphen) {
            let fx = fo;
            if (!zeichensatz[op.rolle].has(g.ch.codePointAt(0))) { const alt = await schrift('text'); if (zeichensatz.text.has(g.ch.codePointAt(0))) fx = alt; else { fehlend.add(g.ch); continue; } }
            page.drawText(g.ch, { x: X(g.x), y: Y(g.base), size: op.gr * MM, font: fx, color: rgb(...hex(op.farbe)), opacity: op.deck });
          }
        }
      }
      // Schnittkontur: Sonderfarbe «CutContour» auf Ebene «CutContour», Haarlinie, Abstand DS.KONTUR von der Tinte, nur die äussere Kontur (Löcher gefüllt)
      schnittlinie(pdf, page, kont.map(p => p.map(([x, y]) => [X(x), Y(y)])));
      page.setMediaBox(0, 0, PW, PH);
    }
    return { bytes: await pdf.save(), fehlend: [...fehlend], frei: true };
  };

  /* ---------- Bild (PNG) ---------- */
  DS.png = async function (M, doc, i, pxBreite) {
    const f = doc.format, ops = await DS.druckplan(M, doc, i, { dpi: 220 });
    const k = pxBreite / f.b, cv = document.createElement('canvas');
    cv.width = Math.round(f.b * k); cv.height = Math.round(f.h * k);
    const g = cv.getContext('2d');
    g.setTransform(k, 0, 0, k, 0, 0);
    male(g, M, ops);
    if (DS.frei(doc.formatKey)) {   // Sticker: transparent und auf die Tinte getrimmt
      const T = await DS.tinte(M, doc, i);
      if (T) {
        const b = T.box, c2 = document.createElement('canvas'); c2.width = Math.max(1, Math.round(b.w * k)); c2.height = Math.max(1, Math.round(b.h * k));
        c2.getContext('2d').drawImage(cv, Math.round(b.x * k), Math.round(b.y * k), c2.width, c2.height, 0, 0, c2.width, c2.height);
        return new Promise(ok => c2.toBlob(ok, 'image/png'));
      }
    }
    return new Promise(ok => cv.toBlob(ok, 'image/png'));
  };

  /* ---------- Druckprüfung ---------- */
  DS.pruefe = function (M, doc) {
    const out = [], f = doc.format, B = DS.B, Sx = DS.SICHER, digital = DS.FORMATE[doc.formatKey]?.digital || DS.frei(doc.formatKey);
    doc.seiten.forEach((s, i) => {
      const seite = doc.seiten.length > 1 ? `Page ${i + 1}: ` : '';
      for (const el of s.el) {
        const h = DS.elHoehe(M, el), kurz = el.typ === 'text' ? `«${el.text.replace(/\s+/g, ' ').slice(0, 34)}${el.text.length > 34 ? '…' : ''}»` : { bild: 'Photo', flaeche: 'Area', linie: 'Rule', rahmen: 'Frame', zeichen: 'Logo' }[el.typ];
        if (el.typ === 'bild' && M.bildIndex[el.bild]) {   // Kennzeichnung wie in Le Livre
          const bi = M.bildIndex[el.bild];
          if (bi.ki) out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}Photo made with AI («${bi.alt}»): for promotion only with a note or after a real photo.` });
          else if (bi.herkunft === 'frei') out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}Photo under a free licence (${bi.quelle}): name author and licence next to the photo or in the imprint.` });
        }
        if (el.typ === 'text') {
          const ph = el.text.match(/\[[^\]]*\]/g);
          if (ph) out.push({ stufe: 'rot', id: el.id, seite: i, text: `${seite}Fill in ${ph.join(', ')}` });
          if (!el.text.trim()) out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}empty text field` });
          /* Text läuft aus dem Blatt oder über andere Texte und das Zeichen (Abnahme 06.11.2026, Fund 16: 5'000 Zeichen meldeten nur «closer than 4 mm»).
             Gemessen wird die Tinte (breiteste Zeile, Ausrichtung), nicht der Kasten, sonst meldet jede Vorlage falsche Überdeckungen. */
          const tinte = o => { if (o.typ !== 'text') return { x: o.x, y: o.y, w: o.w, h: DS.elHoehe(M, o) }; const m = DS.mess(o), w = Math.min(o.w, m.bw || o.w), a = o.ausr || 'l'; return { x: a === 'c' ? o.x + (o.w - w) / 2 : a === 'r' ? o.x + o.w - w : o.x, y: o.y, w, h: m.h }; };
          const ti = el.text.trim() ? tinte(el) : null;
          const ueber = !ti ? [] : s.el.filter(o => o !== el && (o.typ === 'text' || o.typ === 'zeichen') && (o.typ !== 'text' || o.text.trim())).filter(o => { const to = tinte(o), bx = Math.min(ti.x + ti.w, to.x + to.w) - Math.max(ti.x, to.x), by = Math.min(ti.y + ti.h, to.y + to.h) - Math.max(ti.y, to.y); const ae = ti.w * ti.h, ao = to.w * to.h; return bx > 1 && by > 1 && bx * by > .25 * Math.min(ae, ao) && (o.typ === 'zeichen' || ae > ao || (ae === ao && s.el.indexOf(el) < s.el.indexOf(o))); });   // je Paar eine Meldung, beim grösseren Text
          if (ti && (ti.y + ti.h > f.h + .01 || ti.x + ti.w > f.b + .01 || ti.y < -.01 || ti.x < -.01)) out.push({ stufe: 'rot', id: el.id, seite: i, text: `${seite}${kurz} runs off the page and will be cut off (shorten the text or make it smaller)` });
          else if (!digital && (el.x < Sx - .01 || el.y < Sx - .01 || el.x + el.w > f.b - Sx + .01 || el.y + h > f.h - Sx + .01))
            out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}${kurz} is closer than ${Sx} mm to the edge and may get cut off` });
          if (ueber.length) out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}${kurz} covers ${ueber.map(o => o.typ === 'zeichen' ? 'the logo' : `«${o.text.replace(/\s+/g, ' ').slice(0, 24)}${o.text.length > 24 ? '…' : ''}»`).join(', ')}` });
        }
        if ((el.typ === 'bild' || el.typ === 'flaeche') && !digital) {
          const zuKurz = (a, b) => a > -B + .05 && a < .6 && b > 0;   // berührt den Rand, reicht aber nicht in den Beschnitt
          if (zuKurz(el.x, el.w) || zuKurz(el.y, h) || zuKurz(f.b - (el.x + el.w), el.w) || zuKurz(f.h - (el.y + h), h))
            out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}${kurz} ends at the edge without reaching 3 mm into the bleed (white flash possible)` });
        }
        if (el.typ === 'bild') {
          const b = M.bildIndex[el.bild];
          if (!b) { out.push({ stufe: 'rot', id: el.id, seite: i, text: `${seite}photo missing` }); continue; }
          const px = b.druck || b, a = DS.ausschnitt(el, px.w, px.h), dpi = (px.w / a.bw) * 25.4;
          const plakat = Math.min(f.b, f.h) >= 297;   // ab A3: Plakat, wird aus Abstand gesehen, 150 dpi genügen (so sagt es der gelbe Hinweis selbst)
          if (dpi < 150) out.push({ stufe: 'rot', id: el.id, seite: i, text: `${seite}photo «${(b.eigen && b.alt) || b.key}» prints at only ${Math.round(dpi)} dpi and will be soft (make it smaller or zoom out)` });
          else if (dpi < 220 && !digital && !plakat) out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}photo «${(b.eigen && b.alt) || b.key}» prints at ${Math.round(dpi)} dpi: fine for posters seen from a distance, tight for cards seen up close` });
        }
        if (el.x > f.b + B || el.y > f.h + B || el.x + el.w < -B || el.y + h < -B)
          out.push({ stufe: 'gelb', id: el.id, seite: i, text: `${seite}${kurz} lies outside the page` });
      }
    });
    return out;
  };
})();
