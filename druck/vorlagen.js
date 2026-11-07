/* Drucksachen-Studio · Vorlagen: elf Grundaufbauten im Hausstil. Jede Vorlage bekommt Format, Ton und Inhalt
   und setzt daraus frei verschiebbare Elemente. Alle Grössen wachsen mit dem Format, damit dieselbe Drucksache
   als A6-Karte und als A3-Plakat stimmt. Elemente tragen ihren «slot», damit Textänderungen beim Umsetzen bleiben. */
(function () {
  const DS = window.DS;
  let zaehler = 0;
  const neueId = () => 'e' + (Date.now() % 1e7).toString(36) + (zaehler++).toString(36);
  DS.neueId = neueId;

  const STIL = {
    titel: { zeile: 1.06, sperr: 0 },
    mono: { zeile: 1.6, sperr: .08, gross: true },   /* Sperrung höchstens .08 em im Druck (Master 10a, 28.10.2026: pdftotext zerlegt Wörter) */
    kapitale: { zeile: 1.3, sperr: .08, gross: true },
    text: { zeile: 1.5, sperr: 0 },
    kursiv: { zeile: 1.5, sperr: 0 },
  };
  DS.STIL = STIL;

  /* stil (Vorlagen-Bibliothek, Robert 12.10.2026): rahmen 'ohne'|'einfach'|'doppelt', ausr 'c'|'l', titel 0.8–1.25, zeichen 0.6–1.5, bild 0.38–0.66 (Bildanteil) */
  function ctx(M, fmt, ton, stil) {
    const w = fmt.b, h = fmt.h, s = Math.sqrt(w * h / (105 * 148)), s8 = Math.pow(s, .8);
    const T = M.toene[ton] || M.toene.dunkel;
    const m = Math.max(7, 8 * s8);
    return { M, w, h, s, s8, T, m, ton, el: [], quer: w > h * 1.15, stil: stil || {}, rahmenZahl: 0 };
  }

  function tx(c, rolle, text, w, gr, farbe, o = {}) {
    const el = Object.assign({ id: neueId(), typ: 'text', rolle, text: String(text), x: o.x ?? (c.w - w) / 2, y: 0, w, gr: +gr.toFixed(2), farbe, ausr: 'c', deck: 1 }, STIL[rolle], o);
    el.h = DS.mess(el).h;
    return el;
  }
  const linie = (c, L, o = {}) => Object.assign({ id: neueId(), typ: 'linie', x: (c.w - L) / 2, y: 0, w: L, h: 0, staerke: .3, farbe: c.T.linie, deck: 1 }, o);
  const zeichen = (c, zw, o = {}) => { zw *= Math.min(1.6, Math.max(.5, c.stil.zeichen || 1)); return Object.assign({ id: neueId(), typ: 'zeichen', x: (c.w - zw) / 2, y: 0, w: zw, farbe: c.T.zeichen, deck: 1 }, o); };
  const hoehe = (c, el) => el.typ === 'zeichen' ? el.w * c.M.zeichen.verh : el.typ === 'linie' ? el.staerke : el.h;

  /* Stapel: [element | zahl(abstand)] von oben nach unten setzen */
  function stapelHoehe(c, items) {
    let y = 0;
    for (const it of items) y += typeof it === 'number' ? it : hoehe(c, it);
    return y;
  }
  function stapel(c, items, y) {
    let lastGap = 0;
    for (const it of items) {
      if (typeof it === 'number') { y += it; lastGap = it; continue; }
      it.y = +y.toFixed(2); y += hoehe(c, it); c.el.push(it);
    }
    return y;
  }
  function stapelMitte(c, items, y0, y1) {
    let H = stapelHoehe(c, items);
    // Zu wenig Platz: Schrift und Abstände gemeinsam verkleinern, bis der Stapel passt (höchstens auf 60 %)
    for (let n = 0; n < 6 && H > (y1 - y0) + .05; n++) {
      const f = Math.max(.82, (y1 - y0) / H);
      items = items.map(it => {
        if (typeof it === 'number') return it * f;
        if (it.typ === 'text' && it.gr * f >= (it._gr0 || it.gr) * .6) { it._gr0 = it._gr0 || it.gr; it.gr = +(it.gr * f).toFixed(2); it.h = DS.mess(it).h; }
        return it;
      });
      H = stapelHoehe(c, items);
    }
    items.forEach(it => { if (it && it._gr0) delete it._gr0; });
    return stapel(c, items, Math.max(y0, y0 + (y1 - y0 - H) / 2));
  }
  /* Leere Felder und ihre Abstände aus einem Stapel entfernen */
  function sauber(items) {
    const out = [];
    for (const it of items) {
      if (it == null || it === false || it === '') { if (typeof out[out.length - 1] === 'number') out.pop(); continue; }
      out.push(it);
    }
    while (typeof out[0] === 'number') out.shift();
    while (typeof out[out.length - 1] === 'number') out.pop();
    return out;
  }

  function grund(c, seite, farbe, tapete) {
    seite.grund = farbe || c.T.grund;
    seite.tapete = tapete === undefined ? c.T.tapete : tapete;
  }
  function rahmen(c, inset, staerke = .25, deck = .75) {
    const r = inset ?? Math.max(4.5, 5 * c.s8);
    c.rahmenZahl++;
    if (c.stil.rahmen === 'ohne') return r;
    const ecke = c.stil.ecke ?? 2.2;
    c.el.push({ id: neueId(), typ: 'rahmen', x: r, y: r, w: c.w - 2 * r, h: c.h - 2 * r, staerke, r: ecke * c.s8, farbe: c.T.linie, deck });
    if (c.stil.rahmen === 'doppelt' && c.rahmenZahl === 1) { const r2 = r + 1.3 * c.s8; c.el.push({ id: neueId(), typ: 'rahmen', x: r2, y: r2, w: c.w - 2 * r2, h: c.h - 2 * r2, staerke: .15, r: Math.max(0, ecke - 1) * c.s8, farbe: c.T.linie, deck: deck * .8 }); }
    return r;
  }
  function foto(c, key, x, y, w, h, o = {}) {
    const el = Object.assign({ id: neueId(), typ: 'bild', bild: key, x, y, w, h, fx: .5, fy: .5, zoom: 1, slot: 'bild' }, o);
    c.el.push(el); return el;
  }
  function fuss(c, i, farbe, y1) {
    const t = i.fuss === undefined || i.fuss === null ? (c.M.fusszeile || `${c.M.adr} · ${c.M.tel}`) : i.fuss;
    if (!t) return y1 ?? c.h;
    const el = tx(c, 'mono', t, c.w - 2 * c.m - 6, 1.5 * c.s8, farbe || c.T.mono, { slot: 'fuss', deck: .85, sperr: .08 });
    el.y = +((y1 ?? c.h - c.m - 1.5 * c.s8) - el.h).toFixed(2);
    c.el.push(el);
    return el.y;
  }
  const titelGr = (c, t, faktor = 1, breite) => {
    let g = Math.min(9.4 * c.s * faktor * (c.stil.titel || 1), (breite || c.w) / 9.2 * Math.min(1.08, c.stil.titel || 1));
    const L = Math.max(...String(t || '').split('\n').map(z => z.length));
    if (L > 18) g *= .86; if (L > 26) g *= .86;
    return g;
  };

  /* ---------- die Vorlagen ---------- */
  const V = {};

  V.deckel = {
    name: 'Title page', wofuer: 'Cover, announcement, card with one strong title',
    slots: ['ueber', 'titel*', 'unter', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const bw = c.w - 2 * (r + 6 * c.s8);
      const zh = Math.min(c.w * .3, 30 * c.s, c.h * .2);
      const items = sauber([
        zeichen(c, zh), 8 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 3 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel), c.T.titel, { slot: 'titel' }), 5.5 * c.s8,
        linie(c, 14 * c.s8), 5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 2.05 * c.s8, c.T.mono, { slot: 'unter' }), 6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 80 * c.s8), 2.8 * c.s8, c.T.text, { slot: 'text' }),
      ]);
      const yF = fuss(c, i, null, c.h - r - 6 * c.s8);
      stapelMitte(c, items, r + 8 * c.s8, yF - 6 * c.s8);
    },
  };

  V.buehne = {
    name: 'Photo on top', wofuer: 'Flyer and poster with a big photo on top, text below; the logo sits on the seam',
    slots: ['bild*', 'ueber', 'titel*', 'text', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const ph = c.h * Math.min(.66, Math.max(.38, c.stil.bild || (c.quer ? .5 : .54))), B = DS.B;
      foto(c, i.bild, -B, -B, c.w + 2 * B, ph + B);
      const d = 15 * c.s8;
      c.el.push({ id: neueId(), typ: 'flaeche', x: (c.w - d) / 2, y: ph - d / 2, w: d, h: d, r: d / 2, farbe: seite.grund, tapete: seite.tapete, deck: 1 });
      const zw = d * .6, z = zeichen(c, zw); z.y = ph - zw * c.M.zeichen.verh / 2; c.el.push(z);
      const bw = c.w - 2 * c.m - 6;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .82), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 12 * c.s8), 4.5 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 86 * c.s8), 2.75 * c.s8, c.T.text, { slot: 'text' }), i.text && 4.5 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 2 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const yF = fuss(c, i);
      stapelMitte(c, items, ph + d / 2 + 4 * c.s8, yF - 5 * c.s8);
    },
  };

  V.ansicht = {
    name: 'Full-bleed photo', wofuer: 'Postcard or post: photo to the edge, small plate with the title',
    slots: ['bild*', 'titel*', 'unter'],
    bau(c, i, seite) {
      grund(c, seite, 'ink', null);
      const B = DS.B;
      foto(c, i.bild, -B, -B, c.w + 2 * B, c.h + 2 * B);
      const dunkel = c.ton !== 'hell';
      const schild = dunkel ? 'bone' : 'ink', tf = dunkel ? 'ink' : 'bone', mf = dunkel ? 'tinte2' : 'cyan';
      const pad = 4.6 * c.s8, max = c.w * .62;
      const t = tx(c, 'titel', i.titel, max, Math.min(6.4 * c.s8, c.w / 15), tf, { ausr: 'l', slot: 'titel', x: pad });
      const u = i.unter ? tx(c, 'mono', i.unter, max, 1.55 * c.s8, mf, { ausr: 'l', slot: 'unter', x: pad }) : null;
      const bw = Math.max(DS.mess(t).bw, u ? DS.mess(u).bw : 0);
      const sh = pad * 2 + t.h + (u ? u.h + 1.2 * c.s8 : 0), R = 3 * c.s8;
      c.el.push({ id: neueId(), typ: 'flaeche', x: -B - R, y: c.h - sh, w: bw + 2 * pad + B + R + 1, h: sh + B + R, r: R, farbe: schild, tapete: dunkel ? null : 'dunkel', deck: 1 });
      t.w = u ? Math.max(bw + 1, 10) : bw + 1; if (u) u.w = t.w;
      stapel(c, sauber([t, u && 1.2 * c.s8, u]), c.h - sh + pad);
    },
  };

  V.karte = {
    name: 'Card with a list', wofuer: 'Drinks card, price list, line-up: entries with name, detail, price',
    slots: ['ueber', 'titel*', 'text', 'liste*', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const x0 = r + 6 * c.s8, cw = c.w - 2 * x0;
      const kopf = sauber([
        zeichen(c, 10 * c.s8), 5 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, cw, 1.85 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.4 * c.s8,
        tx(c, 'titel', i.titel, cw, titelGr(c, i.titel, .74), c.T.titel, { slot: 'titel' }), 3.6 * c.s8,
        i.text && tx(c, 'kursiv', i.text, Math.min(cw, 80 * c.s8), 2.5 * c.s8, c.T.text, { slot: 'text', deck: .85 }),
      ]);
      const yK = stapel(c, kopf, r + 7 * c.s8) + 5 * c.s8;
      const yF = fuss(c, i, null, c.h - r - 5 * c.s8);
      const liste = (i.liste || []).filter(e => e && (e.name || e.preis));
      const verf = yF - 5 * c.s8 - yK;
      const sp = c.w / c.h > 1.6 && liste.length >= 3 ? 2 : 1, sg = 8 * c.s8, sw = (cw - (sp - 1) * sg) / sp;
      const baueListe = (k, luft) => {
        const els = []; let H = 0;
        const pw = Math.max(0, ...liste.map(e => e.preis ? DS.mess({ typ: 'text', rolle: 'mono', text: e.preis, w: 200, gr: 1.95 * c.s8 * k, ...STIL.mono, sperr: .12 }).bw : 0));
        const proSpalte = Math.ceil(liste.length / sp);
        for (let s0 = 0; s0 < sp; s0++) {
          const xs = x0 + s0 * (sw + sg), teil = liste.slice(s0 * proSpalte, (s0 + 1) * proSpalte);
          let y = 0;
          teil.forEach((e, j) => {
            const n = s0 * proSpalte + j, row = [];
            const nw = sw - (pw ? pw + 4 * c.s8 : 0);
            const nm = tx(c, 'titel', e.name || '', nw, 4.05 * c.s8 * k, c.T.titel, { ausr: 'l', x: xs, slot: `liste.${n}.name`, zeile: 1.12 });
            nm.y = y; row.push(nm);
            if (e.preis) {
              const p = tx(c, 'mono', e.preis, pw + 1, 1.95 * c.s8 * k, c.T.mono, { ausr: 'r', x: xs + sw - pw - 1, slot: `liste.${n}.preis`, sperr: .12 });
              p.y = y + (nm.gr * 1.12 - p.gr * 1.6) / 2 + .15 * c.s8 * k; row.push(p);
            }
            let yy = y + nm.h;
            if (e.detail) {
              const dt = tx(c, 'text', e.detail, nw, 2.3 * c.s8 * k, c.T.text, { ausr: 'l', x: xs, slot: `liste.${n}.detail`, deck: .78, zeile: 1.42 });
              dt.y = yy + .7 * c.s8 * k; row.push(dt); yy = dt.y + dt.h;
            }
            yy += 2.4 * c.s8 * k * luft;
            if (j < teil.length - 1) { row.push(linie(c, sw, { x: xs, y: yy, staerke: .15, deck: .4 })); yy += 2.4 * c.s8 * k * luft; }
            els.push(...row); y = yy;
          });
          H = Math.max(H, y);
        }
        return { els, H };
      };
      let k = 1, L = baueListe(k, 1);
      for (let n = 0; n < 8 && L.H > verf; n++) { k *= Math.max(.6, Math.sqrt(verf / L.H)) * .99; L = baueListe(k, 1); }
      if (L.H < verf * .7) { k = Math.min(1.35, Math.sqrt(verf * .8 / L.H)); L = baueListe(k, 1); if (L.H > verf) { k *= Math.sqrt(verf / L.H) * .98; L = baueListe(k, 1); } }
      if (L.H < verf * .85 && liste.length > sp) { const luft = Math.min(2.2, 1 + (verf * .92 - L.H) / (Math.ceil(liste.length / sp) * 4.8 * c.s8 * k)); L = baueListe(k, luft); }
      const dy = yK + Math.max(0, (verf - L.H) / 2) * .6;
      L.els.forEach(e => { e.y = +(e.y + dy).toFixed(2); c.el.push(e); });
    },
  };

  V.einladung = {
    name: 'Invitation', wofuer: 'Invitation to a night or a dinner: when, where, RSVP',
    slots: ['ueber', 'titel*', 'wann', 'wo', 'text', 'aktion'],
    bau(c, i, seite) {
      grund(c, seite);
      const r = rahmen(c, null, .35, .85); rahmen(c, r + 1.4 * c.s8, .15, .6);
      const bw = c.w - 2 * (r + 8 * c.s8);
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 5 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .95), c.T.titel, { slot: 'titel' }), 6 * c.s8,
        linie(c, 14 * c.s8), 6 * c.s8,
        i.wann && tx(c, 'mono', i.wann, bw, 2.45 * c.s8, c.T.titel, { slot: 'wann', sperr: .08 }), i.wann && 2 * c.s8,
        i.wo && tx(c, 'kursiv', i.wo, bw, 2.6 * c.s8, c.T.text, { slot: 'wo' }), 6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 78 * c.s8), 2.7 * c.s8, c.T.text, { slot: 'text' }), i.text && 6 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 1.75 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const z = zeichen(c, 9 * c.s8); z.y = c.h - r - 7 * c.s8 - hoehe(c, z); c.el.push(z);
      stapelMitte(c, items, r + 9 * c.s8, z.y - 6 * c.s8);
    },
  };

  V.programm = {
    name: 'Programme', wofuer: 'Dates, line-up, timetable: date, title, place',
    slots: ['ueber', 'titel*', 'termine*', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const x0 = r + 7 * c.s8, cw = c.w - 2 * x0;
      const kopf = sauber([
        i.ueber && tx(c, 'mono', i.ueber, cw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', ausr: 'l', x: x0 }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, cw, titelGr(c, i.titel, .8), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 4.4 * c.s8,
        linie(c, 14 * c.s8, { x: x0 }),
      ]);
      const yK = stapel(c, kopf, r + 9 * c.s8) + 7 * c.s8;
      const z = zeichen(c, 8 * c.s8, { x: c.w - x0 - 8 * c.s8 });
      const yF = fuss(c, Object.assign({}, i, {}), null, c.h - r - 5 * c.s8);
      const verf = yF - 6 * c.s8 - yK;
      const ter = (i.termine || []).filter(t => t && (t.was || t.wann));
      const sp = c.w / c.h > 1.6 && ter.length >= 3 ? 2 : 1, sg = 8 * c.s8, sw = (cw - (sp - 1) * sg) / sp, proSpalte = Math.ceil(ter.length / sp);
      const baue = (k, luft) => {
        const els = []; let H = 0;
        for (let s0 = 0; s0 < sp; s0++) {
          const xs = x0 + s0 * (sw + sg); let y = 0;
          ter.slice(s0 * proSpalte, (s0 + 1) * proSpalte).forEach((t, j) => {
            const n = s0 * proSpalte + j;
            if (t.wann) { const a = tx(c, 'mono', t.wann, sw, 1.8 * c.s8 * k, c.T.mono, { ausr: 'l', x: xs, slot: `termine.${n}.wann` }); a.y = y; els.push(a); y += a.h + .6 * c.s8 * k; }
            if (t.was) { const b = tx(c, 'titel', t.was, sw, 4.3 * c.s8 * k, c.T.titel, { ausr: 'l', x: xs, slot: `termine.${n}.was`, zeile: 1.12 }); b.y = y; els.push(b); y += b.h; }
            if (t.wo) { const d = tx(c, 'text', t.wo, sw, 2.3 * c.s8 * k, c.T.text, { ausr: 'l', x: xs, slot: `termine.${n}.wo`, deck: .75 }); d.y = y + .5 * c.s8 * k; els.push(d); y = d.y + d.h; }
            y += 4.6 * c.s8 * k * luft;
          });
          H = Math.max(H, y - 4.6 * c.s8 * k * luft);
        }
        return { els, H };
      };
      let k = 1, L = baue(k, 1);
      for (let n = 0; n < 8 && L.H > verf; n++) { k *= Math.max(.6, Math.sqrt(verf / L.H)) * .99; L = baue(k, 1); }
      if (L.H < verf * .7) { k = Math.min(1.35, Math.sqrt(verf * .8 / L.H)); L = baue(k, 1); if (L.H > verf) { k *= Math.sqrt(verf / L.H) * .98; L = baue(k, 1); } }
      if (L.H < verf * .85 && ter.length > sp) L = baue(k, Math.min(2, 1 + (verf * .92 - L.H) / (proSpalte * 4.6 * c.s8 * k)));
      L.els.forEach(e => { e.y = +(e.y + yK).toFixed(2); c.el.push(e); });
      void z;
    },
  };

  V.fenster = {
    name: 'Photo in a frame', wofuer: 'Photo with a mount on the surface, title and text below; quiet',
    slots: ['bild*', 'ueber', 'titel*', 'unter', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const m = c.m + 1;
      if (c.quer) {
        const pw = c.w * .5 - m, ph = c.h - 2 * m;
        foto(c, i.bild, m, m, pw, ph);
        c.el.push({ id: neueId(), typ: 'rahmen', x: m - 1.6 * c.s8, y: m - 1.6 * c.s8, w: pw + 3.2 * c.s8, h: ph + 3.2 * c.s8, staerke: .25, r: 0, farbe: c.T.linie, deck: .8 });
        const x0 = c.w * .5 + 6 * c.s8, bw = c.w - x0 - m;
        const items = sauber([
          i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', x: x0 }), i.ueber && 2.6 * c.s8,
          tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .75, bw * 2), c.T.titel, { slot: 'titel', x: x0 }), 4.4 * c.s8,
          linie(c, 12 * c.s8, { x: x0 + (bw - 12 * c.s8) / 2 }), 4.4 * c.s8,
          i.unter && tx(c, 'mono', i.unter, bw, 1.9 * c.s8, c.T.mono, { slot: 'unter', x: x0 }), i.unter && 4 * c.s8,
          i.text && tx(c, 'text', i.text, bw, 2.6 * c.s8, c.T.text, { slot: 'text', x: x0 }),
        ]);
        stapelMitte(c, items, m, c.h - m);
        return;
      }
      const ph = c.h * Math.min(.56, Math.max(.36, (c.stil.bild || .54) * .87));
      foto(c, i.bild, m, m, c.w - 2 * m, ph);
      c.el.push({ id: neueId(), typ: 'rahmen', x: m - 1.6 * c.s8, y: m - 1.6 * c.s8, w: c.w - 2 * m + 3.2 * c.s8, h: ph + 3.2 * c.s8, staerke: .25, r: 0, farbe: c.T.linie, deck: .8 });
      const bw = c.w - 2 * m - 6;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .85), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 12 * c.s8), 4.5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 1.95 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 4 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 84 * c.s8), 2.7 * c.s8, c.T.text, { slot: 'text' }),
      ]);
      const yF = fuss(c, i);
      stapelMitte(c, items, m + ph + 8 * c.s8, yF - 5 * c.s8);
    },
  };

  V.geteilt = {
    name: 'Photo and text', wofuer: 'Half photo, half text; side by side in landscape, stacked in portrait',
    slots: ['bild*', 'ueber', 'titel*', 'text', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const B = DS.B;
      if (c.quer) {
        foto(c, i.bild, -B, -B, c.w * .5 + B, c.h + 2 * B);
        const x0 = c.w * .5 + c.m, bw = c.w - x0 - c.m;
        const items = sauber([
          zeichen(c, 9 * c.s8, { x: x0 + (bw - 9 * c.s8) / 2 }), 5 * c.s8,
          i.ueber && tx(c, 'mono', i.ueber, bw, 1.8 * c.s8, c.T.mono, { slot: 'ueber', x: x0 }), i.ueber && 2.6 * c.s8,
          tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .72, bw * 2), c.T.titel, { slot: 'titel', x: x0 }), 4.2 * c.s8,
          linie(c, 12 * c.s8, { x: x0 + (bw - 12 * c.s8) / 2 }), 4.2 * c.s8,
          i.text && tx(c, 'text', i.text, bw, 2.55 * c.s8, c.T.text, { slot: 'text', x: x0 }), i.text && 4 * c.s8,
          i.aktion && tx(c, 'mono', i.aktion, bw, 1.8 * c.s8, c.T.mono, { slot: 'aktion', x: x0 }),
        ]);
        stapelMitte(c, items, c.m, c.h - c.m);
        return;
      }
      const ph = c.h * Math.min(.62, Math.max(.4, c.stil.bild || .5));
      foto(c, i.bild, -B, c.h - ph, c.w + 2 * B, ph + B);
      const x0 = c.m + 2, bw = c.w - 2 * x0;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', ausr: 'l', x: x0 }), i.ueber && 2.8 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .9), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 4.6 * c.s8,
        linie(c, 14 * c.s8, { x: x0 }), 4.6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 90 * c.s8), 2.75 * c.s8, c.T.text, { slot: 'text', ausr: 'l', x: x0 }), i.text && 4.4 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 1.95 * c.s8, c.T.mono, { slot: 'aktion', ausr: 'l', x: x0 }),
      ]);
      stapelMitte(c, items, c.m, c.h - ph - c.m);
    },
  };

  V.gutschein = {
    name: 'Voucher', wofuer: 'Voucher or gift card with a value and fields for For, From and No.',
    slots: ['titel', 'unter', 'wert', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const titel = i.titel || 'Voucher';
      const feld = (x, y, w, name, n) => {
        const l = tx(c, 'mono', name, 30, 1.55 * c.s8, c.T.mono, { ausr: 'l', x, slot: null }); l.y = y; c.el.push(l);
        c.el.push(linie(c, w - 12 * c.s8, { x: x + 12 * c.s8, y: y + l.h * .78, staerke: .15, deck: .6 }));
        void n;
      };
      if (c.quer) {
        const zw = Math.min(c.h * .42, c.w * .2);
        const z = zeichen(c, zw, { x: c.w * .17 - zw / 2 }); z.y = (c.h - hoehe(c, z)) / 2; c.el.push(z);
        c.el.push(linie(c, 0, { x: c.w * .33, y: r + 8 * c.s8, w: 0, h: c.h - 2 * r - 16 * c.s8, staerke: .2, deck: .7 }));
        const x0 = c.w * .38, bw = c.w - x0 - r - 8 * c.s8;
        const felder = 3 * 5.4 * c.s8;
        const items = sauber([
          tx(c, 'titel', titel, bw, Math.min(12 * c.s8, c.h / 6.5), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 3.5 * c.s8,
          i.unter && tx(c, 'mono', i.unter, bw, 1.9 * c.s8, c.T.mono, { slot: 'unter', ausr: 'l', x: x0 }), i.unter && 4 * c.s8,
          i.wert && tx(c, 'titel', i.wert, bw, Math.min(7 * c.s8, c.h / 11), c.ton === 'dunkel' ? 'cyan' : c.T.titel, { slot: 'wert', ausr: 'l', x: x0 }), i.wert && 3 * c.s8,
          i.text && tx(c, 'text', i.text, bw * .9, 2.3 * c.s8, c.T.text, { slot: 'text', ausr: 'l', x: x0, deck: .85 }),
        ]);
        const yEnd = stapelMitte(c, items, r + 7 * c.s8, c.h - r - 8 * c.s8 - felder - 4 * c.s8);
        let y = Math.max(yEnd + 5 * c.s8, c.h - r - 7 * c.s8 - felder);
        for (const f of ['For', 'From', 'No.']) { feld(x0, y, bw, f); y += 5.4 * c.s8; }
        return;
      }
      const bw = c.w - 2 * (r + 7 * c.s8), x0 = r + 7 * c.s8;
      const items = sauber([
        zeichen(c, Math.min(26 * c.s8, c.w * .26)), 7 * c.s8,
        tx(c, 'titel', titel, bw, titelGr(c, titel, 1.05), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 14 * c.s8), 4.5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 1.95 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 5 * c.s8,
        i.wert && tx(c, 'titel', i.wert, bw, 7 * c.s8, c.ton === 'dunkel' ? 'cyan' : c.T.titel, { slot: 'wert' }), i.wert && 4 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 70 * c.s8), 2.5 * c.s8, c.T.text, { slot: 'text', deck: .85 }),
      ]);
      const felder = 3 * 6 * c.s8;
      stapelMitte(c, items, r + 8 * c.s8, c.h - r - 10 * c.s8 - felder);
      let y = c.h - r - 8 * c.s8 - felder;
      for (const f of ['For', 'From', 'No.']) { feld(x0, y, bw, f); y += 6 * c.s8; }
    },
  };

  V.aushang = {
    name: 'Sign', wofuer: 'Notice, sign, tent card: title and text that reads from a distance',
    slots: ['ueber', 'titel*', 'text*', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const bw = c.w - 2 * (r + 7 * c.s8);
      const z = zeichen(c, Math.min(15 * c.s8, c.w * .16)); z.y = r + 8 * c.s8; c.el.push(z);
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.95 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 3 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .9), c.T.titel, { slot: 'titel' }), 5 * c.s8,
        linie(c, 14 * c.s8), 5.5 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 96 * c.s8), 3.15 * c.s8, c.T.text, { slot: 'text', zeile: 1.55 }), i.text && 6 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 2.1 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const yF = fuss(c, i, null, c.h - r - 5 * c.s8);
      stapelMitte(c, items, z.y + hoehe(c, z) + 7 * c.s8, yF - 7 * c.s8);
    },
  };

  V.rueckseite = {
    name: 'Back with address', wofuer: 'Back of a flyer or card: logo, name, address, contact',
    slots: ['text'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const M = c.M, bw = c.w - 2 * (r + 7 * c.s8);
      const items = sauber([
        zeichen(c, Math.min(19 * c.s8, c.w * .2)), 6 * c.s8,
        tx(c, 'kapitale', M.name, bw, 3.1 * c.s8, c.T.titel, { sperr: .08 }), 2 * c.s8,
        tx(c, 'mono', M.zeile, bw, 1.6 * c.s8, c.T.mono), 5 * c.s8,
        linie(c, 12 * c.s8), 5 * c.s8,
        i.text && tx(c, 'kursiv', i.text, Math.min(bw, 74 * c.s8), 2.55 * c.s8, c.T.text, { slot: 'text', deck: .9 }), i.text && 5 * c.s8,
        tx(c, 'text', [M.adr.replace(' · ', '\n'), M.tel, M.mail, M.web].join('\n'), bw, 2.45 * c.s8, c.T.text, { zeile: 1.75, deck: .9 }),
      ]);
      stapelMitte(c, items, r + 8 * c.s8, c.h - r - 8 * c.s8);
    },
  };

  V.kartengruss = {
    name: 'Postcard back', wofuer: 'Back of a postcard: room for a note on the left, stamp field and address lines on the right',
    slots: ['titel', 'text'],
    bau(c, i, seite) {
      grund(c, seite, c.ton === 'dunkel' ? 'bone' : c.T.grund, null);
      const T = c.M.toene.hell, m = Math.max(7, 7 * c.s8), mx = c.w / 2;
      c.el.push(linie(c, 0, { x: mx, y: m + 4, w: 0, h: c.h - 2 * m - 8, staerke: .2, farbe: T.linie, deck: .7 }));
      const lw = mx - m - 6 * c.s8;
      const z = zeichen(c, 9 * c.s8, { x: m, farbe: T.zeichen }); z.y = m; c.el.push(z);
      const kopf = sauber([
        tx(c, 'kapitale', c.M.name, lw, 2.1 * c.s8, T.titel, { ausr: 'l', x: m, sperr: .08 }), 1.2 * c.s8,
        tx(c, 'mono', i.titel || c.M.zeile, lw, 1.45 * c.s8, T.mono, { ausr: 'l', x: m, slot: 'titel' }),
        i.text && 4 * c.s8, i.text && tx(c, 'kursiv', i.text, lw, 2.25 * c.s8, T.text, { ausr: 'l', x: m, slot: 'text', deck: .85 }),
      ]);
      stapel(c, kopf, m + hoehe(c, z) + 4 * c.s8);
      const f = tx(c, 'mono', `${c.M.adr} · ${c.M.web}`, lw, 1.25 * c.s8, T.mono, { ausr: 'l', x: m, deck: .8, sperr: .08 }); f.y = c.h - m - f.h; c.el.push(f);
      const mb = 19 * c.s8, mh = 23 * c.s8;
      c.el.push({ id: neueId(), typ: 'rahmen', x: c.w - m - mb, y: m, w: mb, h: mh, staerke: .2, r: 0, farbe: T.linie, deck: .8 });
      const mz = zeichen(c, mb * .42, { x: c.w - m - mb / 2 - mb * .21, farbe: T.zeichen, deck: .35 }); mz.y = m + (mh - hoehe(c, mz)) / 2; c.el.push(mz);
      const ax = mx + 6 * c.s8, aw = c.w - m - ax, top = m + mh + 10 * c.s8, gap = Math.min(9 * c.s8, (c.h - m - 4 - top) / 4);
      for (let n = 0; n < 4; n++) c.el.push(linie(c, aw, { x: ax, y: top + gap * (n + 1) - 2, staerke: .15, farbe: T.linie, deck: .6 }));
    },
  };

  /* ---------- Die Vorlagen für die Nächte (Vorbild _cloud/txtme-quellen/rkn-rahmen-werkzeug/rahmen4.py: E Galerie, H Aufkleber, J Ticket) ---------- */
  const u = c => Math.max(.75, Math.min(1.6, Math.sqrt(c.w * c.h / (120 * 193))));   // Einheit wie im Rahmen-Werkzeug: 1 bei 120 × 193

  /* Fotorahmen (E Galerie): Passepartout mit Schnittkante, darunter Name der Nacht, «See you offline.», Zeile mit Kamera, Datum, Ort;
     unten N° von Hand, ONE NIGHT ONLY und das Zeichen (Logos immer sichtbar, keine Blindprägung: Robert 04.10.2026). */
  V.rahmenfoto = {
    name: 'Photo frame', wofuer: 'Frame for a print of the night: mount with a cut edge, name of the night, date and place, number by hand',
    slots: ['bild*', 'ueber', 'titel*', 'unter', 'nummer', 'aktion'],
    bau(c, i, seite) {
      grund(c, seite, c.T.grund, null);
      const U = u(c), hoch = !c.quer, m = 9 * U;
      let pw, ph;
      if (c.w === 120 && c.h === 193) { pw = 102; ph = 152; }            // echtes Fotomass 10 × 15
      else if (c.w === 170 && c.h === 143) { pw = 152; ph = 102; }
      else { pw = c.w - 2 * m; ph = Math.min(c.h - m - 44 * U, pw * (hoch ? 1.5 : 2 / 3)); }
      const x = hoch || c.w === 170 ? m : m, y = m, bw = 1.3 * U;
      const hell = c.ton !== 'dunkel';
      // Schnittkante des Passepartouts: Kern des Kartons, feine Aussenlinie
      c.el.push({ id: neueId(), typ: 'flaeche', x: x - bw, y: y - bw, w: pw + 2 * bw, h: ph + 2 * bw, farbe: hell ? 'bright' : 'surface2', r: 0, deck: 1 });
      c.el.push({ id: neueId(), typ: 'rahmen', x: x - bw, y: y - bw, w: pw + 2 * bw, h: ph + 2 * bw, staerke: .16 * U, r: 0, farbe: hell ? 'tinte3' : 'bright', deck: hell ? .9 : .16 });
      foto(c, i.bild, x, y, pw, ph);
      const B = c.h - (y + ph), big = B > 55 * U, tw = pw;
      let yy = y + ph + (big ? 10 * U : 7.4 * U);
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, tw, 1.55 * U, c.T.mono, { slot: 'ueber', ausr: 'l', x, sperr: .08 }), i.ueber && (big ? 3 * U : 1.6 * U),
        tx(c, 'titel', i.titel, tw, big ? 5.4 * U : 3.4 * U, c.T.titel, { slot: 'titel', ausr: 'l', x, zeile: 1.04 }), (big ? 2.2 * U : 1.4 * U),
        i.unter && tx(c, 'text', i.unter, tw, big ? 2.1 * U : 1.7 * U, c.T.text, { slot: 'unter', ausr: 'l', x, deck: .8 }),
      ]);
      stapel(c, items, yy);
      // Nummer von Hand, ONE NIGHT ONLY, Zeichen rechts unten
      const ey = c.h - m - 2.4 * U;
      const nr = tx(c, 'mono', i.nummer || 'N°', 12 * U, 1.7 * U, c.T.titel, { slot: 'nummer', ausr: 'l', x, sperr: .08 }); nr.y = ey; c.el.push(nr);
      c.el.push(linie(c, 15 * U, { x: x + 5.4 * U, y: ey + nr.h * .8, staerke: .18 * U, deck: .55 }));
      if (i.aktion) { const ak = tx(c, 'mono', i.aktion, tw - 26 * U, 1.55 * U, c.T.mono, { slot: 'aktion', ausr: 'l', x: x + 23.4 * U, sperr: .08 }); ak.y = ey + .1 * U; c.el.push(ak); }
      const zw = (big ? 14 : 11) * U, z = zeichen(c, zw, { x: x + pw - zw }); z.y = ey - hoehe(c, z) + nr.h; c.el.push(z);
    },
  };

  /* Sticker (H Aufkleber nach dem Entscheid 04.10.2026): nur die Tinte. Kein Grund, kein Rand, keine Platte, kein Schatten; gespeichert wird auf die Tinte getrimmt. */
  V.sticker = {
    name: 'Sticker', wofuer: 'Die-cut sticker with a line of the night: only the ink, trimmed, with the cut contour',
    slots: ['titel*', 'ueber', 'unter'],
    bau(c, i, seite) {
      seite.grund = null; seite.tapete = null;
      const farbe = c.ton === 'creme' ? 'yellow' : c.ton === 'hell' ? 'bright' : 'ink';   // eine Farbe je Fassung: Ink auf Weiss, Bright auf Schwarz, RKN-Gelb
      const bw = c.w - 4, x0 = 2;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, Math.max(1.9, c.h * .052), farbe, { slot: 'ueber', ausr: 'l', x: x0, sperr: .08 }), i.ueber && c.h * .04,
        tx(c, 'titel', i.titel, bw, Math.min(c.h * .3, c.w / 7.6 * Math.min(1.1, 10 / Math.max(...String(i.titel || '').split('\n').map(z => z.length)))), farbe, { slot: 'titel', ausr: 'l', x: x0, zeile: .98, sperr: -.02 }),
        i.unter && c.h * .05, i.unter && tx(c, 'mono', i.unter, bw, Math.max(1.8, c.h * .048), farbe, { slot: 'unter', ausr: 'l', x: x0, sperr: .08 }),
      ]);
      stapelMitte(c, items, 2, c.h - 2);
    },
  };
  V.stickerlogo = {
    name: 'Logo sticker', wofuer: 'The speech bubble alone, with one small line under it; trimmed to the ink',
    slots: ['ueber'],
    bau(c, i, seite) {
      seite.grund = null; seite.tapete = null;
      const farbe = c.ton === 'creme' ? 'yellow' : c.ton === 'hell' ? 'bright' : 'ink';
      const zw = Math.min(c.w - 4, (c.h - 4 - (i.ueber ? 4 : 0)) / c.M.zeichen.verh);
      const items = sauber([zeichen(c, zw, { farbe }), i.ueber && 1.6, i.ueber && tx(c, 'mono', i.ueber, c.w - 4, Math.max(1.8, c.h * .05), farbe, { slot: 'ueber', sperr: .08 })]);
      stapelMitte(c, items, 2, c.h - 2);
    },
  };

  /* Ticket (J Ticket): links das Foto, Mitte Name der Nacht, grosser Titel, Datum und Ort, Zeichen; rechts der Abriss mit Perforation, ADMIT ONE, Nummer. */
  V.ticket = {
    name: 'Ticket', wofuer: 'Ticket with a tear-off: photo, name of the night, date, place, number; perforation as a dashed line',
    slots: ['bild', 'ueber', 'titel*', 'wann', 'wo', 'nummer', 'aktion'],
    bau(c, i, seite) {
      grund(c, seite); const U = u(c) * 1.1, m = 6 * U, B = DS.B;
      const quer = c.w >= c.h * 1.4, ab = quer ? c.w * .7 : c.h * .72;   // Perforation
      if (quer) {
        const pw = Math.min(c.w * .28, (c.h - 2 * m) * .75), ph = c.h - 2 * m;
        if (i.bild) { foto(c, i.bild, m, m, pw, ph); c.el.push({ id: neueId(), typ: 'rahmen', x: m, y: m, w: pw, h: ph, staerke: .2 * U, r: 0, farbe: c.T.linie, deck: .4 }); }
        const x0 = (i.bild ? m + pw : 0) + 5 * U, bw = ab - x0 - 5 * U;
        const items = sauber([
          i.ueber && tx(c, 'mono', i.ueber, bw, 1.55 * U, c.T.mono, { slot: 'ueber', ausr: 'l', x: x0, sperr: .08 }), i.ueber && 2.2 * U,
          tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .72, bw * 1.6), c.T.titel, { slot: 'titel', ausr: 'l', x: x0, zeile: 1 }), 2.4 * U,
          i.wann && tx(c, 'mono', i.wann, bw, 2 * U, c.T.titel, { slot: 'wann', ausr: 'l', x: x0, sperr: .08 }), i.wann && 1 * U,
          i.wo && tx(c, 'text', i.wo, bw, 2.1 * U, c.T.text, { slot: 'wo', ausr: 'l', x: x0, deck: .85 }), 3 * U,
          i.aktion && tx(c, 'mono', i.aktion, bw, 1.55 * U, c.T.mono, { slot: 'aktion', ausr: 'l', x: x0, sperr: .08 }),
        ]);
        stapelMitte(c, items, m, c.h - m);
        const zw = 9 * U, z = zeichen(c, zw, { x: ab - 5 * U - zw }); z.y = c.h - m - hoehe(c, z); c.el.push(z);
        // Perforation über die ganze Höhe (in den Beschnitt), Kerben am Rand
        c.el.push(linie(c, 0, { x: ab, y: -B, w: 0, h: c.h + 2 * B, staerke: .3 * U, deck: .5, dash: [.3 * U, 1.3 * U] }));
        for (const ky of [-2.6 * U - B, c.h + B - 2.6 * U]) c.el.push({ id: neueId(), typ: 'flaeche', x: ab - 2.6 * U, y: ky, w: 5.2 * U, h: 5.2 * U, r: 2.6 * U, farbe: seite.grund, deck: 1 });
        // Abriss: ADMIT ONE, Datum, Nummer gross
        const sx = ab + 5 * U, sw = c.w - sx - m;
        const st = sauber([
          tx(c, 'mono', 'ADMIT ONE', sw, 1.8 * U, c.T.titel, { ausr: 'l', x: sx, sperr: .08 }), 1.2 * U,
          i.wann && tx(c, 'mono', i.wann, sw, 1.5 * U, c.T.mono, { slot: 'wann', ausr: 'l', x: sx, sperr: .08 }), 4 * U,
          tx(c, 'mono', 'N°', sw, 1.6 * U, c.T.mono, { ausr: 'l', x: sx, sperr: .08 }), .4 * U,
          tx(c, 'titel', i.nummer || '0001', sw, Math.min(8.5 * U, sw / 2.6), c.ton === 'dunkel' ? 'cyan' : c.T.titel, { slot: 'nummer', ausr: 'l', x: sx, zeile: 1 }),
        ]);
        stapelMitte(c, st, m, c.h - m);
        return;
      }
      // hoch: Foto oben, Text darunter, Abriss unten
      const pw = c.w - 2 * m, ph = Math.min(c.h * .42, pw * .75);
      if (i.bild) { foto(c, i.bild, m, m, pw, ph); c.el.push({ id: neueId(), typ: 'rahmen', x: m, y: m, w: pw, h: ph, staerke: .2 * U, r: 0, farbe: c.T.linie, deck: .4 }); }
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, pw, 1.55 * U, c.T.mono, { slot: 'ueber', ausr: 'l', x: m, sperr: .08 }), i.ueber && 2 * U,
        tx(c, 'titel', i.titel, pw, titelGr(c, i.titel, .8), c.T.titel, { slot: 'titel', ausr: 'l', x: m, zeile: 1 }), 2 * U,
        i.wann && tx(c, 'mono', i.wann, pw, 2 * U, c.T.titel, { slot: 'wann', ausr: 'l', x: m, sperr: .08 }), i.wann && 1 * U,
        i.wo && tx(c, 'text', i.wo, pw, 2.1 * U, c.T.text, { slot: 'wo', ausr: 'l', x: m, deck: .85 }),
      ]);
      stapelMitte(c, items, m + (i.bild ? ph : 0) + 4 * U, ab - 3 * U);
      c.el.push(linie(c, 0, { x: -B, y: ab, w: c.w + 2 * B, h: 0, staerke: .3 * U, deck: .5, dash: [.3 * U, 1.3 * U] }));
      for (const kx of [-2.6 * U - B, c.w + B - 2.6 * U]) c.el.push({ id: neueId(), typ: 'flaeche', x: kx, y: ab - 2.6 * U, w: 5.2 * U, h: 5.2 * U, r: 2.6 * U, farbe: seite.grund, deck: 1 });
      const st = sauber([
        tx(c, 'mono', 'ADMIT ONE', pw * .5, 1.8 * U, c.T.titel, { ausr: 'l', x: m, sperr: .08 }), 1 * U,
        i.aktion && tx(c, 'mono', i.aktion, pw * .5, 1.5 * U, c.T.mono, { slot: 'aktion', ausr: 'l', x: m, sperr: .08 }),
      ]);
      stapelMitte(c, st, ab + 3 * U, c.h - m);
      const nr = tx(c, 'titel', i.nummer || '0001', pw * .45, Math.min(8.5 * U, pw * .45 / 2.6), c.ton === 'dunkel' ? 'cyan' : c.T.titel, { slot: 'nummer', ausr: 'r', x: m + pw * .55, zeile: 1 });
      nr.y = ab + 3 * U + ((c.h - m) - (ab + 3 * U) - nr.h) / 2; c.el.push(nr);
    },
  };

  DS.VORLAGEN = V;

  /* Eine Seite aus Vorlage + Inhalt setzen */
  DS.setze = function (M, formatKey, vorlage, ton, inhalt, stil) {
    const fmt = DS.FORMATE[formatKey];
    const c = ctx(M, fmt, ton, stil);
    const seite = { grund: 'ink', tapete: null, el: [], quelle: { vorlage, ton, inhalt: JSON.parse(JSON.stringify(inhalt || {})) } };
    if (stil && Object.keys(stil).length) seite.quelle.stil = Object.assign({}, stil);
    (V[vorlage] || V.deckel).bau(c, inhalt || {}, seite);
    if (c.stil.ausr === 'l' && LINKS_MOEGLICH.includes(vorlage) && !(vorlage === 'gutschein' && c.quer)) linksbuendig(c);
    seite.el = c.el;
    return seite;
  };
  /* Linksbündige Fassung: alles, was mittig auf der Achse steht, an den linken Satzrand (Fotos, Flächen, Rahmen bleiben) */
  const LINKS_MOEGLICH = ['deckel', 'buehne', 'fenster', 'aushang', 'einladung', 'gutschein', 'rahmenfoto'];
  function linksbuendig(c) {
    const rand = c.el.some(e => e.typ === 'rahmen') ? Math.max(4.5, 5 * c.s8) : 0;
    const L = Math.max(c.m + 2, rand + 7 * c.s8);
    const scheibe = c.el.find(e => e.typ === 'flaeche' && e.r && Math.abs(e.w - e.h) < .5);   // Zeichen auf der Naht (Bild oben) bleibt mittig
    const mittig = e => Math.abs(e.x + e.w / 2 - c.w / 2) < .8;
    for (const e of c.el) {
      if (e.typ === 'text' && e.ausr === 'c' && mittig(e) && !(e.slot === 'fuss')) { e.ausr = 'l'; e.w = Math.min(e.w, c.w - L - rand - 4 * c.s8); e.x = L; e.h = DS.mess(e).h; }
      else if (e.typ === 'linie' && mittig(e) && e.w < c.w * .5) e.x = L;
      else if (e.typ === 'zeichen' && mittig(e) && !scheibe) e.x = L;
    }
  }

  /* Ein ganzes Dokument aus einem Entwurf (der KI oder einer Vorlage) */
  DS.dokument = function (M, entwurf) {
    const fk = DS.FORMATE[entwurf.format] ? entwurf.format : 'a5h';
    return {
      id: 'd' + Date.now().toString(36),
      name: entwurf.name || 'New piece',
      formatKey: fk, format: { b: DS.FORMATE[fk].b, h: DS.FORMATE[fk].h },
      seiten: entwurf.seiten.map(s => DS.setze(M, fk, s.vorlage, s.ton || 'dunkel', s.inhalt || {}, s.stil)),
      hinweise: entwurf.hinweise || [], auftrag: entwurf.auftrag || '', geaendert: Date.now(),
    };
  };

  /* Beispielinhalte (Wortlaut aus dem RKN-Rahmen-Werkzeug vom 04.10.2026 und dem Shop; Unbelegtes in [Klammern]) */
  const NACHT = 'RKN.OFC × TXTME.SOCIAL × ADE', WANN = '24.10.2026', WO = 'Wanakam, Amsterdam';
  DS.BEISPIEL = {
    rahmenfoto: { bild: 'ade', ueber: NACHT, titel: 'See you offline.', unter: `Disposable camera · 35 mm film · ${WANN} · ${WO}`, nummer: 'N°', aktion: 'ONE NIGHT ONLY' },
    sticker: { titel: 'See you\noffline.', ueber: 'RKN × txtme.social', unter: `${WANN} · ${WO}` },
    stickerlogo: { ueber: 'See you offline.' },
    ticket: { bild: 'party', ueber: NACHT, titel: 'See you offline.', wann: WANN, wo: WO, nummer: '0001', aktion: 'SEE YOU OFFLINE.' },
    deckel: { ueber: NACHT, titel: 'See you\noffline.', unter: `${WANN} · ${WO}`, text: 'Special edition' },
    buehne: { bild: 'cube', ueber: NACHT, titel: 'See you\noffline.', text: `${WANN} · ${WO}`, aktion: 'SPECIAL EDITION', fuss: '' },
    ansicht: { bild: 'night', titel: 'Amsterdam', unter: 'txtme.social · see you offline' },
    karte: { ueber: NACHT, titel: 'Drinks', text: '', liste: [
      { name: '[Drink]', detail: '[Detail]', preis: '€ [Price]' },
      { name: '[Drink]', detail: '[Detail]', preis: '€ [Price]' },
      { name: '[Drink]', detail: '[Detail]', preis: '€ [Price]' }] },
    einladung: { ueber: NACHT, titel: 'You’re on the list.', wann: `${WANN} · doors [time]`, wo: WO, text: 'Disposable cameras at the door. Leave the phone in your pocket.', aktion: 'RSVP [contact] until [date]' },
    programm: { ueber: NACHT, titel: 'The night', termine: [
      { wann: '[time]', was: '[Act]', wo: '[Floor]' }, { wann: '[time]', was: '[Act]', wo: '[Floor]' }, { wann: '[time]', was: '[Act]', wo: '[Floor]' }] },
    fenster: { bild: 'friends', ueber: NACHT, titel: 'See you offline.', unter: `${WANN} · ${WO}`, text: 'Disposable cameras, 35 mm film, one night only.' },
    geteilt: { bild: 'crowd', ueber: NACHT, titel: 'Who did you\nmeet tonight?', text: 'Scan before you lose them.', aktion: 'txtme.social', fuss: '' },
    gutschein: { titel: 'Voucher', unter: 'One night, one piece.', wert: '€ [Value]', text: 'For a piece from the drop or a night with us.' },
    aushang: { ueber: NACHT, titel: 'Doors [time]', text: 'Tickets at the door: [yes / no]\nID required.', aktion: 'See you offline.' },
    rueckseite: { text: 'The platform that wants you offline.' },
    kartengruss: { titel: 'Amsterdam · see you offline', text: 'Greetings from the night.' },
  };
})();
