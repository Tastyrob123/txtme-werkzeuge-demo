/* PDF aus der veröffentlichten Seite (Partner Pack). Läuft im Browser vor dem Drucken, S = Seitenhöhe in CSS-Pixeln.
   1. ruhig: was sonst einblendet oder klebt, steht fertig da; der Film zeigt sein Standbild.
   2. Gruppen: jeder Abschnitt beginnt oben auf einer Seite, kurze Abschnitte teilen sich eine Seite; ein Abschnitt,
      der knapp über ganze Seiten hinausgeht, wird leicht verkleinert, statt eine fast leere Seite zu machen.
   3. innerhalb eines Abschnitts rutscht ein Block, der über die Seitenkante ginge, ganz auf die nächste Seite.
   4. Blätter: die fertig gesetzte Seite wird in genau seitenhohe Blätter geteilt, so steht im PDF, was hier gemessen ist. */
(async (S) => {
  const d = document.documentElement;
  d.classList.remove('vor'); d.classList.add('druck');
  const takt = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const LOG = window.__druckDebug ? [] : null;
  const name = e => e ? (e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0]) : '-';

  // ---------- 1. ruhig ----------
  // die Seite darf das Rollen beim Setzen nicht sehen: Bühnen und Bildfolgen, die am Scrollweg hängen, bleiben im
  // Ausgangsbild (wie beim Öffnen der Seite); nur was beim Hinsehen einblendet, kommt dazu (Beobachter, nicht Scroll)
  window.addEventListener('scroll', e => e.stopImmediatePropagation(), true);
  document.addEventListener('scroll', e => e.stopImmediatePropagation(), true);
  // alles, was die Seite beim Hinscrollen einschaltet (Karten, die hereinfahren, Wörter, die hochsteigen): einmal langsam
  // durch die ganze Seite wie ein Besucher, dann zurück nach oben. Danach steht jede Stelle so da wie beim Lesen.
  for (let y = 0; y < d.scrollHeight; y += Math.max(240, Math.floor(innerHeight * 0.6))) { scrollTo(0, y); await takt(); }
  scrollTo(0, d.scrollHeight); await takt(); scrollTo(0, 0); await takt();
  document.querySelectorAll('.rv,.fl,.fly,.intro,.rise,.station,.pola,.ph,.lv,[data-scatter],[data-o],[data-on],[data-film]').forEach(e => e.classList.add('on'));
  // Grössen, die an der Fensterhöhe hängen (vh, svh …), auf ihren jetzigen Wert festschreiben: beim Drucken ist die
  // «Fensterhöhe» die Seitenhöhe und damit Bruchteile eines Pixels anders als beim Messen; ohne das rutscht der Satz
  // von Abschnitt zu Abschnitt weiter und am Seitenende blitzt ein Haarstreifen der nächsten Fläche auf
  {
    const FH = /(^|[^a-z-])(s|d|l)?v(h|min|max|b)\b/;
    const fest = new Map();
    const regeln = liste => {
      for (const r of Array.from(liste || [])) {
        if (r.cssRules && !r.style) { regeln(r.cssRules); continue; }
        if (!r.style || !r.selectorText) continue;
        const ps = Array.from(r.style).filter(p => FH.test(r.style.getPropertyValue(p)));
        if (!ps.length) continue;
        let els = []; try { els = document.querySelectorAll(r.selectorText); } catch (e) { /* Pseudo-Element */ }
        els.forEach(e => { const m = fest.get(e) || new Set(); ps.forEach(p => m.add(p)); fest.set(e, m); });
      }
    };
    for (const sh of Array.from(document.styleSheets)) { try { regeln(sh.cssRules); } catch (e) { /* fremdes Blatt */ } }
    document.querySelectorAll('[style]').forEach(e => { Array.from(e.style).filter(p => FH.test(e.style.getPropertyValue(p))).forEach(p => { const m = fest.get(e) || new Set(); m.add(p); fest.set(e, m); }); });
    const werte = [];
    for (const [e, ps] of fest) { const c = getComputedStyle(e); ps.forEach(p => werte.push([e, p, c.getPropertyValue(p)])); }
    werte.forEach(([e, p, w]) => { if (w) e.style.setProperty(p, w, 'important'); });
    if (LOG) LOG.push('fenster-hoehe fest: ' + werte.length + ' Werte an ' + fest.size + ' Teilen');
  }
  // Überschriften, die Wort für Wort hochsteigen: im Druck wieder gewöhnlicher Text (die Hüllen je Wort ergaben im PDF
  // Wörter ohne Leerzeichen beim Kopieren). Farbige Wörter behalten ihre Klasse und damit ihren eigenen Verlauf.
  document.querySelectorAll('.rise').forEach(h => {
    h.querySelectorAll('.w').forEach(w => {
      const wi = w.querySelector('.wi');
      if (wi && wi.classList.contains('soft')) {
        const s = document.createElement('span'); s.className = wi.className; s.textContent = wi.textContent;
        s.style.setProperty('display', 'inline', 'important'); s.style.setProperty('transform', 'none', 'important');
        w.replaceWith(s);
      } else w.replaceWith(document.createTextNode(w.textContent));
    });
    h.normalize();
  });
  document.querySelectorAll('[data-film]').forEach(e => e.classList.add('near'));
  document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; });
  document.querySelectorAll('video').forEach(v => {
    v.removeAttribute('autoplay'); try { v.pause(); } catch (e) { /* steht schon */ }
    if (!v.getAttribute('poster') && v.dataset.poster) v.setAttribute('poster', v.dataset.poster);
    v.preload = 'none';
  });
  const haupt = document.querySelector('main') || document.body;
  for (const e of document.querySelectorAll('body *')) {
    const p = getComputedStyle(e).position;
    if (p === 'sticky') e.style.setProperty('position', 'relative', 'important');
    else if (p === 'fixed') {
      // ein «Fenster» im Abschnitt (fest hinter dem Abschnitt) wird ein Bild im Abschnitt; Festes über der Seite fällt weg
      const abschnitt = haupt.contains(e) ? Array.from(haupt.children).find(a => a.contains(e)) : null;
      if (abschnitt) {
        e.style.setProperty('position', 'absolute', 'important');
        if (getComputedStyle(abschnitt).position === 'static') abschnitt.style.setProperty('position', 'relative', 'important');
      } else e.style.setProperty('display', 'none', 'important');
    }
  }
  const poster = Array.from(document.querySelectorAll('video[poster]')).map(v => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = v.getAttribute('poster'); }));
  const offen = Array.from(document.images).filter(i => !i.complete).map(i => new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }));
  await Promise.race([Promise.all(offen.concat(poster)), new Promise(r => setTimeout(r, 20000))]);
  if (document.fonts) await document.fonts.ready;
  await takt();

  // ---------- Messen ----------
  const oben = e => e.getBoundingClientRect().top + scrollY;
  const hoehe = e => e.getBoundingClientRect().height;
  const unten = e => oben(e) + hoehe(e);
  const sichtbar = e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.height > 1 && r.width > 1 && c.display !== 'none' && c.visibility !== 'hidden' && c.position !== 'absolute' && c.position !== 'fixed'; };
  const zeilen = e => {        // Kinder, die sich in der Höhe überlappen, stehen nebeneinander und bilden eine Zeile
    const k = Array.from(e.children).filter(sichtbar).map(c => ({ c, t: oben(c), b: unten(c) })).sort((a, b) => a.t - b.t);
    const z = [];
    for (const x of k) {
      const l = z[z.length - 1];
      if (l && x.t < l.b - 2) { l.els.push(x.c); l.b = Math.max(l.b, x.b); } else z.push({ els: [x.c], t: x.t, b: x.b });
    }
    return z;
  };
  const einheiten = (e, tiefe) => {   // Blöcke, die nie zerrissen werden; wer höher als eine Seite ist, wird in Zeilen zerlegt
    if (hoehe(e) <= S * 0.97 || tiefe > 8) return [[e]];
    const z = zeilen(e);
    if (!z.length) return [[e]];
    const out = [];
    for (const r of z) {
      if (r.els.length === 1) out.push(...einheiten(r.els[0], tiefe + 1));
      else if (r.b - r.t > S * 0.97) out.push(...einheiten(r.els.slice().sort((a, b) => hoehe(b) - hoehe(a))[0], tiefe + 1));
      else out.push(r.els);
    }
    return out;
  };
  const vorher = Array.from(document.body.children).filter(e => e !== haupt && sichtbar(e));
  const alle = [...vorher.filter(e => e.compareDocumentPosition(haupt) & 4), ...Array.from(haupt.children).filter(sichtbar), ...vorher.filter(e => e.compareDocumentPosition(haupt) & 2)];

  // ---------- Änderungen merken (je Gruppe zurücksetzbar) ----------
  const zoomVon = e => { let z = 1; for (let x = e; x && x.nodeType === 1; x = x.parentElement) z *= parseFloat(getComputedStyle(x).zoom) || 1; return z; };
  const merke = [];
  const setze = (e, prop, wert) => { merke.push([e, prop, e.style.getPropertyValue(prop), e.style.getPropertyPriority(prop)]); e.style.setProperty(prop, wert, 'important'); };
  const zurueck = bis => { while (merke.length > bis) { const [e, p, w, pr] = merke.pop(); if (w) e.style.setProperty(p, w, pr); else e.style.removeProperty(p); } };
  const plus = (e, prop, px) => setze(e, prop, (parseFloat(getComputedStyle(e).getPropertyValue(prop)) + px / zoomVon(e)) + 'px');
  const grund = getComputedStyle(document.body).backgroundColor;
  const flaeche = e => { const c = getComputedStyle(e).backgroundColor; return c === 'rgba(0, 0, 0, 0)' || c === 'transparent' ? grund : c; };
  const aufSeitenanfang = async (els, davor, luft = 0) => {   // Block an den Anfang der nächsten Seite (plus Luft); davor = Fläche, die bis zur Kante weiterläuft
    const ziel = (Math.floor(Math.min(...els.map(oben)) / S - 0.0005) + 1) * S + luft;
    if (davor) davor = traeger(davor);
    if (LOG) LOG.push('auf ' + els.map(name).join('+') + ' → S.' + Math.round(ziel / S + 1) + ' luft ' + luft + ' davor ' + name(davor));
    for (let k = 0; k < 6; k++) {
      const rest = ziel - Math.min(...els.map(oben));
      if (Math.abs(rest) < 0.5) return;
      // über den Teil davor (dessen Fläche läuft bis zur Kante); ein Abstand am neuen Teil würde mitverkleinert,
      // wenn seine Gruppe danach kleiner gesetzt wird
      if (davor && !luft) await luftDavor(davor, rest); else { els.forEach(x => plus(x, 'margin-top', rest)); await takt(); }
    }
  };
  // Luft unter einen Teil: als Innenabstand, damit seine Fläche weiterläuft; hat er eine feste Höhe (Film, Bühne), wächst
  // er dadurch nicht, dann als Abstand unter ihm
  const luftDavor = async (e, px) => {
    if (!e.__fest) {
      const h0 = hoehe(e), st = merke.length;
      plus(e, 'padding-bottom', px); await takt();
      if (Math.abs(hoehe(e) - h0 - px) <= 0.5) return;
      zurueck(st); e.__fest = true; await takt();
    }
    plus(e, 'margin-bottom', px); await takt();
  };
  // ein kleiner Teil am Ende (Laufband, Fusszeile) streckt sich nie bis zur Seitenkante: er bleibt, wie er ist, und sitzt
  // unten auf der Seite; die Luft geht in den grossen Teil davor (sonst stünde unter dem Laufband eine leere Farbfläche)
  const traeger = e => {
    if (hoehe(e) >= S * 0.12) return e;
    for (let i = alle.indexOf(e) - 1; i >= 0; i--) if (hoehe(alle[i]) >= S * 0.12) return alle[i];
    return e;
  };
  const LUFT = 64;   // ein Block, der auf die nächste Seite rutscht, klebt nicht an der Oberkante

  // ---------- 2. Gruppen ----------
  const ZMIN = 0.84, ZUNTEN = 0.78;
  const seiten = h => Math.max(1, Math.ceil(h * ZMIN / S - 0.0001));
  const gruppen = [];
  for (const a of alle) {
    const h = hoehe(a), g = gruppen[gruppen.length - 1];
    // ein winziger Teil (Fusszeile, Laufband) bekommt nie eine eigene Seite, er gehört zur Gruppe davor
    if (g && (seiten(g.h + h) < seiten(g.h) + seiten(h) || h < S * 0.12)) { g.els.push(a); g.h += h; } else gruppen.push({ els: [a], h });
  }

  // Blöcke einer Gruppe, die über eine Seitenkante gingen, auf die nächste Seite; gibt zurück, wie viele zu hoch sind
  // Zeilen eines Blocks; ein Block mit nur einem Kind (Hülle) wird dabei durchschaut
  const teile = (e, tiefe = 0) => {
    const z = zeilen(e);
    if (z.length === 1 && z[0].els.length === 1 && tiefe < 6) return teile(z[0].els[0], tiefe + 1);
    return z;
  };
  // einen Block setzen: passt er nicht mehr auf die Seite, rutscht er ganz auf die nächste; ist er höher als eine halbe Seite
  // und hat eigene Zeilen, wird er an seinen Zeilen geteilt, damit die Seite davor nicht halb leer bleibt
  const setze1 = async (u, davor, tiefe) => {
    let t = Math.min(...u.map(oben)), b = Math.max(...u.map(unten));
    // ein Block, der auf einer Folgeseite eines Abschnitts von selbst direkt an der Oberkante landet, bekommt Luft
    // (sonst kleben seine Überschrift und seine Zierstriche an der Kante oder werden oben abgeschnitten)
    const anfang = Math.floor(t / S + 0.001) * S, abschnitt = alle.find(a => a.contains(u[0]));
    if (!davor && abschnitt && oben(abschnitt) < anfang - 2 && t - anfang > -1 && t - anfang < LUFT - 0.5 && b - t <= S * 0.97 - LUFT) {
      if (LOG) LOG.push('luft oben ' + u.map(name).join('+') + ' S.' + Math.round(anfang / S + 1) + ' war ' + (t - anfang).toFixed(1));
      for (let k = 0; k < 3; k++) {
        const rest = anfang + LUFT - Math.min(...u.map(oben)); if (Math.abs(rest) < 0.5) break;
        u.forEach(x => plus(x, 'margin-top', rest)); await takt();
      }
      t = Math.min(...u.map(oben)); b = Math.max(...u.map(unten));
    }
    const ende = (Math.floor(t / S + 0.001) + 1) * S;
    if (b <= ende + 1) return 0;
    if (u.length === 1 && b - t > S * 0.45 && tiefe < 8) {
      const z = teile(u[0]);
      if (z.length >= 2) return setzeListe(z.map(r => r.els), () => null, tiefe + 1);
    }
    if (b - t <= S * 0.97) {
      if (davor) await aufSeitenanfang(u, davor);
      else await aufSeitenanfang(u, null, b - t <= S * 0.97 - LUFT ? LUFT : 0);
      return 0;
    }
    return 1;
  };
  // eine Überschrift (gleich wie hoch) bleibt nie allein am Seitenende: grosse Schrift, wenig Text, kein Bild
  const istKopf = u => {
    if (u.length !== 1) return false;
    const e = u[0], h = hoehe(e);
    if (h > S * 0.35 || e.querySelector('img,figure,picture,video,svg,canvas')) return false;
    if (/^H[1-4]$/.test(e.tagName)) return true;
    const t = e.textContent.trim();
    return t.length > 0 && t.length < 240 && parseFloat(getComputedStyle(e).fontSize) * zoomVon(e) >= 26;
  };
  // eine Folge von Blöcken setzen. Eine kleine Zeile (Kapitelzeile, Überschrift) bleibt nie allein am Seitenende:
  // rutscht der Block danach auf die nächste Seite, nimmt er sie mit
  const setzeListe = async (liste, davorVon, tiefe) => {
    let riss = 0;
    for (let k = 0; k < liste.length; k++) {
      const u = liste[k], nx = liste[k + 1];
      const tu = Math.min(...u.map(oben)), bu = Math.max(...u.map(unten));
      if (nx && (bu - tu < S * 0.12 || istKopf(u))) {
        const tn = Math.min(...nx.map(oben)), bn = Math.max(...nx.map(unten)), endeU = (Math.floor(tu / S + 0.001) + 1) * S;
        const ersteN = nx.length === 1 && bn - tn > S * 0.45 ? (teile(nx[0])[0] || { els: nx }).els : nx;
        const bErst = Math.max(...ersteN.map(unten));
        if (bu <= endeU + 1 && bErst > endeU + 1 && bErst - tu <= S * 0.97 - LUFT) { await aufSeitenanfang(u, null, LUFT); continue; }
      }
      riss += await setze1(u, davorVon(u), tiefe);
    }
    return riss;
  };
  // Blöcke einer Gruppe, die über eine Seitenkante gingen; gibt zurück, wie viele höher als eine Seite sind
  const setzeGruppe = async g => {
    let riss = 0;
    for (let i = 0; i < g.els.length; i++) {
      const a = g.els[i];
      riss += await setzeListe(einheiten(a, 0), u => (u.length === 1 && u[0] === a && i > 0 ? g.els[i - 1] : null), 0);
      await kappen(a);
    }
    return riss;
  };
  // geht von einem Abschnitt nur sein leerer Innenabstand über die Seitenkante, endet er genau an der Kante
  // (sonst stünde oben auf der nächsten Seite ein schmaler Streifen seiner Fläche)
  const kappen = async a => {
    const z = teile(a); if (!z.length) return;
    const cb = Math.max(...z.flatMap(r => r.els.map(unten))), b = unten(a);
    const kante = (Math.floor((cb - 0.5) / S) + 1) * S;
    if (b > kante + 0.5) {
      const ueber = b - kante, pad = parseFloat(getComputedStyle(a).paddingBottom) * zoomVon(a);
      if (ueber <= pad + 0.5) { plus(a, 'padding-bottom', -ueber); await takt(); }
    }
  };
  const blockListe = g => g.els.flatMap(a => einheiten(a, 0));

  // ---------- 3. Seiten setzen, Gruppe für Gruppe ----------
  let zerrissen = 0;
  for (let gi = 0; gi < gruppen.length; gi++) {
    const g = gruppen[gi];
    // ein Film allein auf einer Seite füllt die Seite (Standbild bis zum Rand), statt eine halbe Seite leer zu lassen
    if (g.els.length === 1 && g.els[0].matches('[data-film]') && g.h < S * 0.6) { setze(g.els[0], 'height', S + 'px'); await takt(); g.h = hoehe(g.els[0]); }
    let versatz = 0;
    if (gi > 0) {
      const v = gruppen[gi - 1].els, letzt = v[v.length - 1];
      const t0 = oben(g.els[0]), rest = (S - (t0 % S)) % S;
      // ist die Seite davor kaum zur Hälfte voll und passt der nächste Abschnitt ganz in den Rest, beginnt er dort
      if (rest > S * 0.5 && hoehe(g.els[0]) <= rest - 8) versatz = S - rest;
      // immer über den Innenabstand des Teils davor (dessen Fläche läuft bis zur Kante): ein Abstand am neuen Teil
      // würde mit verkleinert, wenn die Gruppe danach kleiner gesetzt wird
      else await aufSeitenanfang([g.els[0]], letzt);
    }
    g.n = Math.max(1, Math.ceil((g.h * ZMIN + versatz) / S - 0.0001)); g.z = Math.min(1, (g.n * S - versatz) / g.h);
    const start = Math.floor(oben(g.els[0]) / S + 0.0005);
    const stand = merke.length;
    for (let versuch = 0; versuch < 10; versuch++) {
      zurueck(stand);
      if (g.z < 0.999) g.els.forEach(e => setze(e, 'zoom', g.z.toFixed(4)));
      await takt();
      const riss = await setzeGruppe(g);
      const belegt = Math.ceil(unten(g.els[g.els.length - 1]) / S - 0.002) - start;
      g.riss = riss;
      if (belegt <= g.n) break;
      // zu lang geworden (Blöcke sind nach unten gerutscht): etwas kleiner, notfalls eine Seite mehr
      g.z *= 0.97;
      if (g.z < ZUNTEN) { g.n++; g.z = Math.min(1, (g.n * S - versatz) / g.h); }
    }
    // fast leere letzte Seite: lieber etwas kleiner (bis 0,78), wenn die Gruppe dann eine Seite weniger braucht
    {
      const endeG = () => unten(g.els[g.els.length - 1]);
      const belegtG = () => Math.ceil(endeG() / S - 0.002) - start;
      const b0 = belegtG(), fuell = (endeG() - (start + b0 - 1) * S) / S;
      if (b0 > 1 && fuell < 0.45) {
        const st = merke.length, z0 = g.z, n0 = g.n;
        let ok = false;
        for (let z = g.z * 0.96; z >= ZUNTEN - 0.001 && !ok; z *= 0.96) {
          zurueck(stand); g.z = z;
          g.els.forEach(e => setze(e, 'zoom', z.toFixed(4)));
          await takt();
          const r2 = await setzeGruppe(g);
          if (belegtG() < b0 && r2 <= g.riss) { ok = true; g.n = belegtG(); g.riss = r2; }
        }
        if (!ok) {   // alter Stand zurück
          zurueck(stand); g.z = z0; g.n = n0;
          if (g.z < 0.999) g.els.forEach(e => setze(e, 'zoom', g.z.toFixed(4)));
          await takt(); await setzeGruppe(g);
        }
        void st;
      }
    }
    // Ausgleich: ist die letzte Seite der Gruppe fast leer, wandert der letzte Block der Seite davor mit,
    // wenn danach beide Seiten ordentlich gefüllt sind und nichts über eine Kante geht
    const ende = () => unten(g.els[g.els.length - 1]);
    let seiteL = Math.ceil(ende() / S - 0.002) - 1;
    if (seiteL > start && (ende() - seiteL * S) / S < 0.4) {
      const bl = blockListe(g).map(u => ({ u, t: Math.min(...u.map(oben)) }));
      const vorn = bl.filter(x => Math.floor(x.t / S + 0.001) === seiteL - 1);
      if (vorn.length >= 2) {
        const st = merke.length, alt = Math.ceil(ende() / S - 0.002);
        await aufSeitenanfang(vorn[vorn.length - 1].u, null, LUFT);
        const riss2 = await setzeGruppe(g);
        const neuL = Math.ceil(ende() / S - 0.002) - 1;
        const davor = Math.max(...vorn.slice(0, -1).map(x => Math.max(...x.u.map(unten)))) - (seiteL - 1) * S;
        if (neuL + 1 !== alt || riss2 > g.riss || davor / S < 0.3) zurueck(st); else g.ausgleich = true;
        await takt();
      }
    }
    zerrissen += g.riss;
    g.von = start + 1; g.bis = start + g.n;
  }

  // Fotos in Druckgrösse (gut 170 dpi) als JPEG: das PDF bleibt klein, ohne dass hinterher etwas verkleinert werden muss.
  // Die Grösse jedes Bildes wird vorher festgehalten, damit sich am Satz nichts verschiebt. Bilder mit Transparenz bleiben, wie sie sind.
  let jpeg = 0;
  { // erst alle Bilder fertig laden (auch die, die die Seite sonst erst beim Hinscrollen holt)
    const rest = Array.from(document.images).filter(i => !i.complete).map(i => new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }));
    await Promise.race([Promise.all(rest), new Promise(r => setTimeout(r, 15000))]);
  }
  const leinwand = document.createElement('canvas'), probe = document.createElement('canvas'); probe.width = probe.height = 48;
  for (const i of Array.from(document.images)) {
    if (!i.complete || !i.naturalWidth || /\.svg(\?|$)/i.test(i.currentSrc || i.src)) continue;
    const r = i.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    try {
      // echte Pixelgrösse (bei mehreren Grössen im srcset meldet naturalWidth eine umgerechnete Breite)
      const echt = new Image(); await new Promise(ok => { echt.onload = echt.onerror = ok; echt.src = i.currentSrc || i.src; });
      const nw = echt.naturalWidth || i.naturalWidth, nh = echt.naturalHeight || i.naturalHeight;
      const tw = Math.min(nw, Math.ceil(r.width * 1.35));
      if (tw >= nw * 0.92 && /\.jpe?g(\?|$)/i.test(i.currentSrc || i.src) && !i.srcset) continue;
      const pc = probe.getContext('2d', { willReadFrequently: true }); pc.clearRect(0, 0, 48, 48); pc.drawImage(i, 0, 0, 48, 48);
      const px = pc.getImageData(0, 0, 48, 48).data; let klar = false;
      for (let k = 3; k < px.length; k += 4) if (px[k] < 250) { klar = true; break; }
      // mit Transparenz (Telefone, Kamera): bleibt PNG, nur verkleinert, wenn es sich lohnt
      if (klar && tw >= nw && !i.srcset) continue;
      const th = Math.max(1, Math.round(tw * nh / nw));
      leinwand.width = tw; leinwand.height = th;
      const c = leinwand.getContext('2d'); c.clearRect(0, 0, tw, th); c.imageSmoothingQuality = 'high'; c.drawImage(echt.naturalWidth ? echt : i, 0, 0, tw, th);
      const blob = await new Promise(ok => leinwand.toBlob(ok, klar ? 'image/png' : 'image/jpeg', 0.82));
      if (!blob) continue;
      const cs = getComputedStyle(i);
      i.style.setProperty('width', cs.width, 'important'); i.style.setProperty('height', cs.height, 'important');
      i.removeAttribute('srcset'); i.removeAttribute('sizes');
      const p = i.parentElement; if (p && p.tagName === 'PICTURE') p.querySelectorAll('source').forEach(s => s.remove());
      await new Promise(ok => { i.addEventListener('load', ok, { once: true }); i.addEventListener('error', ok, { once: true }); i.src = URL.createObjectURL(blob); });
      jpeg++;
    } catch (e) { /* Bild bleibt, wie es ist */ }
  }
  // Standbild des Films ebenso
  for (const v of Array.from(document.querySelectorAll('video[poster]'))) {
    try {
      const b = new Image(); await new Promise(ok => { b.onload = b.onerror = ok; b.src = v.getAttribute('poster'); });
      if (!b.naturalWidth) continue;
      const r = v.getBoundingClientRect(), tw = Math.min(b.naturalWidth, Math.max(2, Math.ceil(r.width * 1.35))), th = Math.round(tw * b.naturalHeight / b.naturalWidth);
      leinwand.width = tw; leinwand.height = th; leinwand.getContext('2d').drawImage(b, 0, 0, tw, th);
      const blob = await new Promise(ok => leinwand.toBlob(ok, 'image/jpeg', 0.82));
      if (blob) { v.setAttribute('poster', URL.createObjectURL(blob)); jpeg++; }
    } catch (e) { /* Standbild bleibt */ }
  }
  await takt();

  // Kanten genau: ein Teil, der eine Seite beginnt, steht exakt auf der Kante. Beginnt er nur Bruchteile davor oder danach,
  // stünde am Seitenende ein haarfeiner Streifen der nächsten Fläche oder oben einer der vorigen.
  for (let runde = 0; runde < 3; runde++) {
    let geaendert = 0;
    for (let i = 1; i < alle.length; i++) {
      const a = alle[i], t = oben(a), B = Math.round(t / S) * S, rest = B - t;
      if (Math.abs(rest) < 0.02 || Math.abs(rest) > 3 || hoehe(a) < 1) continue;
      const vor = traeger(alle[i - 1]);
      const pad = parseFloat(getComputedStyle(vor).paddingBottom) * zoomVon(vor), mb = parseFloat(getComputedStyle(vor).marginBottom) * zoomVon(vor);
      if (rest < 0 && (vor.__fest ? mb : pad) + rest < 0) continue;
      await luftDavor(vor, rest); geaendert++;
      if (LOG) LOG.push('kante ' + name(a) + ' S.' + Math.round(B / S + 1) + ' ' + rest.toFixed(2));
    }
    if (!geaendert) break;
    await takt();
  }

  // Farbige Wörter (Schrift mit Farbverlauf): Chrome legt sie im PDF als Maske über ein Verlaufs-Rechteck, und jeder
  // PDF-Betrachter zeichnet dabei die Kanten dieses Rechtecks als feine Linien um das Wort. Ein echter Verlauf auf der
  // Schrift geht auch nicht (die Hausschrift kommt als «Type 3» ins PDF, Poppler malt dann ganze Flächen). Im Druck wird
  // jedes solche Wort deshalb als SVG-Schrift gesetzt: genau an derselben Stelle, in derselben Schrift, jedes Zeichen in
  // der Farbe, die der Verlauf an seiner Mitte hat, Zeile für Zeile mit Leerzeichen (kopier- und suchbar).
  // Das Original bleibt im Satz, wird nur unsichtbar.
  const verlauf = { gezeichnet: 0, gelassen: [] };
  {
    const SVG = 'http://www.w3.org/2000/svg';
    const messen = document.createElement('canvas').getContext('2d');
    const winkel = (w, W, H) => {   // CSS-Winkel in Grad aus «100deg», «to right» …
      const m = w.match(/^(-?[\d.]+)(deg|turn|rad|grad)$/);
      if (m) { const v = parseFloat(m[1]); return m[2] === 'deg' ? v : m[2] === 'turn' ? v * 360 : m[2] === 'rad' ? v * 180 / Math.PI : v * 0.9; }
      const t = w.replace(/^to\s+/, '').split(/\s+/);
      if (t.length === 1) return { top: 0, right: 90, bottom: 180, left: 270 }[t[0]];
      const sx = t.includes('right') ? 1 : -1, sy = t.includes('bottom') ? 1 : -1;
      const a = Math.atan2(H, W) * 180 / Math.PI;   // Ecken: senkrecht zur Diagonale
      return sy < 0 ? (sx > 0 ? a : 360 - a) : (sx > 0 ? 180 - a : 180 + a);
    };
    const teileTop = s => { const o = []; let tiefe = 0, a = 0; for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '(') tiefe++; else if (c === ')') tiefe--; else if (c === ',' && !tiefe) { o.push(s.slice(a, i).trim()); a = i + 1; } } o.push(s.slice(a).trim()); return o; };
    const verlaufLesen = bild => {
      const m = bild.match(/^linear-gradient\((.*)\)$/); if (!m || /\),\s*(linear|radial|url)/.test(bild)) return null;
      const teile = teileTop(m[1]);
      let richtung = '180deg';
      if (/^(-?[\d.]+(deg|turn|rad|grad)|to\s)/.test(teile[0])) richtung = teile.shift();
      const stops = teile.map(t => { const mm = t.match(/^(.*\))\s*(.*)$/) || t.match(/^(\S+)\s*(.*)$/); return { farbe: mm[1], pos: mm[2] }; });
      return stops.length >= 2 ? { richtung, stops } : null;
    };
    const rgbVon = c => {   // rgb()/rgba() und color(srgb …), so wie Chrome berechnete Farben meldet (auch aus color-mix)
      let m = c.match(/rgba?\(([^)]+)\)/);
      if (m) return m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat).concat([1]).slice(0, 4);
      m = c.match(/color\(srgb\s+([^)]+)\)/);
      if (m) { const v = m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat); return [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
      const k = document.createElement('canvas').getContext('2d'); k.fillStyle = '#000'; k.fillStyle = c;
      const h = String(k.fillStyle); m = h.match(/^#([0-9a-f]{6})$/i);
      if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
      return null;
    };
    const ziele = Array.from(document.body.querySelectorAll('*')).filter(e => {
      const c = getComputedStyle(e);
      return (c.webkitBackgroundClip === 'text' || c.backgroundClip === 'text') && /gradient/.test(c.backgroundImage);
    });
    for (const e of ziele) {
      const ce = getComputedStyle(e);
      const grund = (v, s) => { verlauf.gelassen.push(name(e) + ' ' + v + (s ? ' ' + s : '')); };
      if (ce.display === 'none' || ce.visibility === 'hidden' || !e.getClientRects().length) continue;
      const g = verlaufLesen(ce.backgroundImage); if (!g) { grund('verlauf'); continue; }
      if (g.stops.some(x => !rgbVon(x.farbe))) { grund('farbe', g.stops.map(x => x.farbe).join(' ').slice(0, 60)); continue; }
      if (Array.from(e.querySelectorAll('*')).some(x => /^(IMG|SVG|VIDEO|CANVAS|PICTURE)$/i.test(x.tagName))) { grund('bild darin'); continue; }
      const P = e.offsetParent; if (!P) { grund('ohne halt'); continue; }
      // zwischen e und P: keine Drehung/Verschiebung, Durchsicht und Beschnitt einsammeln
      let deck = 1, schnitt = null, quer = false;
      for (let x = e; x && x !== P; x = x.parentElement) {
        const c = getComputedStyle(x);
        if (c.transform !== 'none' && x !== e) quer = true;
        deck *= parseFloat(c.opacity);
        if (x !== e && c.overflow !== 'visible') { const q = x.getBoundingClientRect(); schnitt = schnitt ? { l: Math.max(schnitt.l, q.left), t: Math.max(schnitt.t, q.top), r: Math.min(schnitt.r, q.right), b: Math.min(schnitt.b, q.bottom) } : { l: q.left, t: q.top, r: q.right, b: q.bottom }; }
      }
      if (quer || ce.transform !== 'none') { grund('bewegt'); continue; }
      if (deck < 0.01) continue;
      // Wörter dieses Elements (Text, der zu keinem eigenen farbigen Kind gehört), je Zeile gesammelt
      const stuecke = [];
      const gang = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      let t, leer = true;
      while ((t = gang.nextNode())) {
        let h = t.parentElement; while (h !== e && !ziele.includes(h)) h = h.parentElement;
        if (h !== e) { leer = true; continue; }
        const cs = getComputedStyle(t.parentElement);
        const re = /\S+/g; let m, vor = 0;
        while ((m = re.exec(t.nodeValue))) {
          const zwischen = t.nodeValue.slice(vor, m.index); vor = m.index + m[0].length;
          const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, vor);
          const q = Array.from(r.getClientRects()).filter(x => x.width > 0.1);
          if (q.length !== 1) { if (q.length) stuecke.push({ fehl: true }); leer = false; continue; }
          stuecke.push({ roh: m[0], knoten: t, start: m.index, gross: cs.textTransform === 'uppercase', klein: cs.textTransform === 'lowercase', q: q[0], cs, raum: leer || /\s/.test(zwischen) });
          leer = /\s$/.test(t.nodeValue);
        }
      }
      if (!stuecke.length) continue;
      if (stuecke.some(s => s.fehl)) { grund('getrenntes wort'); continue; }
      // folgt auf das Element ein Leerzeichen (nächstes farbiges Wort), bekommt sein letztes Zeichen es mit
      {
        let x = e; while (x && !x.nextSibling && x !== document.body) x = x.parentElement;
        const nx = x && x.nextSibling;
        const folgt = nx ? (nx.nodeType === 3 ? nx.nodeValue : nx.textContent || '') : '';
        if (/^\s/.test(folgt) || /\s$/.test(e.textContent)) stuecke[stuecke.length - 1].nachRaum = true;
      }
      // Massstab des Halters (Zoom der Gruppe) und Ursprung seines Innenraums
      const zP = zoomVon(P), pr = P.getBoundingClientRect();
      const ox = pr.left + P.clientLeft * zP, oy = pr.top + P.clientTop * zP;
      const L = (x, y) => [(x - ox) / zP + P.scrollLeft, (y - oy) / zP + P.scrollTop];
      // Flächen des Elements (je Zeile eine) für den Verlauf, wie die Seite ihn legt (Zeilen aneinandergereiht)
      const flaechen = Array.from(e.getClientRects()).filter(x => x.width > 0.1);
      let vorher = 0; const gesamt = flaechen.reduce((s, f) => s + f.width, 0);
      const fl = flaechen.map(f => { const o = { f, versatz: vorher }; vorher += f.width; return o; });
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'druck-verlauf');
      let box = null;
      // Farbe des Verlaufs an einer Stelle (Seitenpixel), so wie die Seite ihn über die Fläche legt
      const farbeAn = (f, px, py) => {
        const W = gesamt, Hh = f.f.height, links = f.f.left - f.versatz;
        const A = winkel(g.richtung, W, Hh) * Math.PI / 180, dx = Math.sin(A), dy = -Math.cos(A);
        const len = Math.abs(W * dx) + Math.abs(Hh * dy), cx = links + W / 2, cy = f.f.top + Hh / 2;
        const t = ((px - cx) * dx + (py - cy) * dy) / len + 0.5;
        if (!f.stops) {
          const pos = g.stops.map(s => { if (!s.pos) return null; const p = s.pos.split(/\s+/)[0]; return /%$/.test(p) ? parseFloat(p) / 100 : /px$/.test(p) ? parseFloat(p) / len : null; });
          if (pos[0] == null) pos[0] = 0; if (pos[pos.length - 1] == null) pos[pos.length - 1] = 1;
          for (let i = 1; i < pos.length; i++) if (pos[i] != null && pos[i] < pos[i - 1]) pos[i] = pos[i - 1];
          for (let i = 1; i < pos.length - 1; i++) if (pos[i] == null) { let j = i; while (pos[j] == null) j++; for (let k = i; k < j; k++) pos[k] = pos[i - 1] + (pos[j] - pos[i - 1]) * (k - i + 1) / (j - i + 1); }
          f.stops = g.stops.map((s, i) => ({ p: pos[i], c: rgbVon(s.farbe) }));
        }
        const st = f.stops; let i = 0; while (i < st.length - 1 && t > st[i + 1].p) i++;
        const a = st[Math.min(i, st.length - 1)], b = st[Math.min(i + 1, st.length - 1)];
        const u = b.p > a.p ? Math.max(0, Math.min(1, (t - a.p) / (b.p - a.p))) : (t >= b.p ? 1 : 0);
        const m = a.c.map((v, k) => v + (b.c[k] - v) * u);
        return m[3] < 0.999 ? 'rgba(' + m.slice(0, 3).map(v => Math.round(v)).join(',') + ',' + m[3].toFixed(3) + ')' : 'rgb(' + m.slice(0, 3).map(v => Math.round(v)).join(',') + ')';
      };
      // Zeilen bilden
      const zeilenW = [];
      for (const s of stuecke) {
        const f = fl.find(x => s.q.top >= x.f.top - 2 && s.q.bottom <= x.f.bottom + 2 && s.q.left >= x.f.left - 2 && s.q.right <= x.f.right + 2) || fl[0];
        const z = zeilenW[zeilenW.length - 1];
        if (z && z.f === f && Math.abs(z.oben - s.q.top) < 2 && z.cs === s.cs) z.s.push(s); else zeilenW.push({ f, oben: s.q.top, cs: s.cs, s: [s] });
      }
      for (const z of zeilenW) {
        const cs = z.cs, fs = parseFloat(cs.fontSize);
        messen.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
        const mm = messen.measureText('Hg'), auf = mm.fontBoundingBoxAscent, ab = mm.fontBoundingBoxDescent;
        const q0 = z.s[0].q, faktor = q0.height / (auf + ab);        // Seitenpixel je Pixel der Schrift (Zoom)
        const grundlinie = q0.top + auf * faktor;
        const text = document.createElementNS(SVG, 'text');
        const fsL = fs * faktor / zP, ls = (parseFloat(cs.letterSpacing) || 0) * faktor / zP;
        text.setAttribute('style', 'font-family:' + cs.fontFamily.replace(/"/g, "'") + ';font-weight:' + cs.fontWeight + ';font-style:' + cs.fontStyle + ';font-size:' + fsL + 'px;letter-spacing:' + ls + 'px;font-feature-settings:' + cs.fontFeatureSettings + ';font-variant-numeric:' + cs.fontVariantNumeric + ';font-variant-ligatures:none;font-kerning:' + cs.fontKerning + ';white-space:pre');
        z.s.forEach((s, i) => {
          // Zeichen für Zeichen an seiner Stelle, in der Farbe des Verlaufs an seiner Mitte
          const zeichen = Array.from(s.roh);
          let off = 0;
          zeichen.forEach((ch, j) => {
            const r = document.createRange(); r.setStart(s.knoten, s.start + off); r.setEnd(s.knoten, s.start + off + ch.length); off += ch.length;
            const q = r.getBoundingClientRect();
            const sp = document.createElementNS(SVG, 'tspan');
            const [x, y] = L(q.left, grundlinie);
            sp.setAttribute('x', x.toFixed(3)); sp.setAttribute('y', y.toFixed(3));
            sp.setAttribute('fill', farbeAn(z.f, q.left + q.width / 2, q.top + q.height / 2));
            let c = ch; if (s.gross) c = c.toLocaleUpperCase('de'); else if (s.klein) c = c.toLocaleLowerCase('de');
            const naechstes = z.s[i + 1];
            sp.textContent = c + (j === zeichen.length - 1 && ((naechstes && naechstes.raum) || (!naechstes && s.nachRaum)) ? ' ' : '');
            text.appendChild(sp);
          });
          box = box ? { l: Math.min(box.l, s.q.left), t: Math.min(box.t, s.q.top), r: Math.max(box.r, s.q.right), b: Math.max(box.b, s.q.bottom) } : { l: s.q.left, t: s.q.top, r: s.q.right, b: s.q.bottom };
        });
        svg.appendChild(text);
      }
      // Fenster des SVG: die Wörter mit etwas Rand für Unterlängen und Überhänge, beschnitten wie das Original
      const rand = Math.max(...zeilenW.map(z => z.s[0].q.height)) * 0.5;
      let fe = { l: box.l - rand, t: box.t - rand, r: box.r + rand, b: box.b + rand };
      if (schnitt) fe = { l: Math.max(fe.l, schnitt.l), t: Math.max(fe.t, schnitt.t), r: Math.min(fe.r, schnitt.r), b: Math.min(fe.b, schnitt.b) };
      if (fe.r - fe.l < 0.5 || fe.b - fe.t < 0.5) continue;
      const [vx, vy] = L(fe.l, fe.t), vw = (fe.r - fe.l) / zP, vh = (fe.b - fe.t) / zP;
      svg.setAttribute('viewBox', vx.toFixed(3) + ' ' + vy.toFixed(3) + ' ' + vw.toFixed(3) + ' ' + vh.toFixed(3));
      svg.setAttribute('width', vw.toFixed(3)); svg.setAttribute('height', vh.toFixed(3));
      svg.style.cssText = 'position:absolute;left:' + vx.toFixed(3) + 'px;top:' + vy.toFixed(3) + 'px;width:' + vw.toFixed(3) + 'px;height:' + vh.toFixed(3) + 'px;overflow:hidden;pointer-events:none;margin:0;padding:0;z-index:5' + (deck < 0.999 ? ';opacity:' + deck.toFixed(3) : '');
      P.appendChild(svg); verlauf.gezeichnet++;
      e.style.setProperty('visibility', 'hidden', 'important');
    }
    await takt();
  }

  // Weiche Schatten (box-shadow mit Unschärfe): Apples PDF-Darstellung (Vorschau, Quick Look) zeichnet sie aus Chromes PDF
  // als graue Rechtecke. Im Druck wird jeder solche Schatten deshalb ein eigener, unscharfer Körper hinter dem Element
  // (filter: blur), gleiche Lage, gleiche Drehung, gleiche Farbe. Das Element selbst bleibt, wie es ist, Text bleibt Text.
  const schatten = { gesetzt: 0, gelassen: [] };
  {
    const px = s => (s.match(/-?[\d.]+px/g) || []).map(parseFloat);
    for (const e of Array.from(document.body.querySelectorAll('*'))) {
      const c = getComputedStyle(e);
      if (c.boxShadow === 'none' || c.display === 'none' || c.visibility === 'hidden' || e.closest('#druck-blaetter')) continue;
      const teile = c.boxShadow.split(/,(?![^()]*\))/).map(s => s.trim()).filter(s => !/inset/.test(s));
      const weich = teile.filter(s => (px(s)[2] || 0) > 0);
      if (!weich.length) continue;
      const P = e.offsetParent;
      if (!P || !e.parentElement) { schatten.gelassen.push(name(e) + ' ohne halt'); continue; }
      // ein ungestelltes Element wird «relative», damit es über seinem Schatten liegt; nur, wenn darin nichts hängt,
      // das sich an einem Teil weiter aussen ausrichtet
      if (c.position === 'static' && c.transform === 'none') {
        const haengt = Array.from(e.querySelectorAll('*')).some(x => { const p = getComputedStyle(x).position; return (p === 'absolute' || p === 'fixed') && x.offsetParent && !e.contains(x.offsetParent); });
        if (haengt) { schatten.gelassen.push(name(e) + ' hält Teile'); continue; }
      }
      const tr = [e.style.getPropertyValue('transform'), e.style.getPropertyPriority('transform')];
      e.style.setProperty('transform', 'none', 'important');
      const r = e.getBoundingClientRect();
      if (tr[0]) e.style.setProperty('transform', tr[0], tr[1]); else e.style.removeProperty('transform');
      if (r.width < 1 || r.height < 1) continue;
      if (c.position === 'static' && c.transform === 'none') e.style.setProperty('position', 'relative', 'important');
      const zP = zoomVon(P), zE = zoomVon(e) / zP, pr = P.getBoundingClientRect();
      const x0 = (r.left - pr.left - P.clientLeft * zoomVon(P)) / zP + P.scrollLeft, y0 = (r.top - pr.top - P.clientTop * zoomVon(P)) / zP + P.scrollTop;
      const w = r.width / zP, h = r.height / zP;
      const [ox, oy] = c.transformOrigin.split(' ').map(parseFloat);
      for (const s of weich.reverse()) {
        const [dx, dy, blur, spread = 0] = px(s).map(v => v * zE);
        const farbe = (s.match(/(rgba?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8})/i) || [])[1] || 'rgba(0,0,0,.3)';
        const k = document.createElement('div'); k.className = 'druck-schatten'; k.setAttribute('aria-hidden', 'true');
        k.style.cssText = 'position:absolute;margin:0;padding:0;pointer-events:none;left:' + (x0 - spread) + 'px;top:' + (y0 - spread) + 'px;width:' + (w + 2 * spread) + 'px;height:' + (h + 2 * spread) + 'px;'
          + 'background:' + farbe + ';border-radius:' + c.borderRadius + ';filter:blur(' + (blur / 2) + 'px);'
          + 'transform-origin:' + (ox * zE + spread) + 'px ' + (oy * zE + spread) + 'px;transform:' + (c.transform === 'none' ? '' : c.transform + ' ') + 'translate(' + dx + 'px,' + dy + 'px)';
        e.parentElement.insertBefore(k, e);
      }
      const rest = c.boxShadow.split(/,(?![^()]*\))/).map(s => s.trim()).filter(s => !weich.includes(s));   // innere und harte Schatten bleiben
      e.style.setProperty('box-shadow', rest.join(', ') || 'none', 'important');
      schatten.gesetzt++;
    }
    await takt();
  }

  // Selbstprüfung: Schrift, Bilder und Striche, die über eine Seitenkante gehen
  const kante = [], verdeckt = [];
  const klasse = e => String(e.getAttribute && e.getAttribute('class') || '').split(' ')[0];
  const sichtbarHier = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (c.visibility === 'hidden' || c.opacity === '0' || c.display === 'none') return false; } return true; };
  for (const e of document.body.querySelectorAll('*')) {
    if (e.matches('svg.druck-verlauf')) continue;   // geprüft werden seine Zeichen, nicht sein Fenster
    const r = e.getBoundingClientRect();
    if (r.height < 1 || r.width < 1 || r.height > S * 0.97) continue;
    const blatt = !e.children.length || /^(IMG|VIDEO|SVG|FIGURE|PICTURE|CANVAS|BUTTON|A)$/i.test(e.tagName);
    if (!blatt || !(e.textContent.trim() || /^(IMG|VIDEO|SVG|PICTURE|CANVAS)$/i.test(e.tagName))) continue;
    const t = r.top + scrollY, b = t + r.height, k = Math.floor(t / S + 0.0005);
    if (b > (k + 1) * S + 1) {
      // nur zählen, was sichtbar ist (nicht von einem Elternteil abgeschnitten)
      let x = e.parentElement, weg = false;
      while (x && x !== document.body) { const c = getComputedStyle(x); if (c.overflow !== 'visible' || c.clipPath !== 'none') { const q = x.getBoundingClientRect(); if (q.bottom + scrollY <= (k + 1) * S + 1 || q.top + scrollY >= (k + 1) * S - 1) { weg = true; break; } } x = x.parentElement; }
      if (!weg) kante.push((e.tagName + '.' + klasse(e) + ' ' + e.textContent.trim().slice(0, 30)) + ' S.' + (k + 1));
    }
    // Schrift, die ein Rahmen darüber halb abschneidet (so fehlte im Botschafter-PDF eine ganze Überschrift):
    // ein Textstück, das teils innen, teils ausserhalb eines beschneidenden Elternteils liegt. Laufbänder laufen
    // absichtlich hinaus, Hilfstexte für Vorleseprogramme sind absichtlich winzig.
    if (e.textContent.trim().length > 1 && !e.closest('.mq,.band,.band-track,[aria-hidden="true"],.sr,.sr-only') && sichtbarHier(e)) {
      // Schrift ganz oder teils ausserhalb eines beschneidenden Elternteils, während ihr Kasten (Karte, Zeile) dort halb
      // drinsteht: dann ist sie abgeschnitten, nicht absichtlich versteckt (ein Band oder Karussell ist breiter als sein Rahmen)
      const teils = (q, y) => { const p = y.getBoundingClientRect(); const ueber = Math.max(q.top - p.top, p.bottom - q.bottom, q.left - p.left, p.right - q.right);
        return p.bottom > q.top + 1 && p.top < q.bottom - 1 && p.right > q.left + 1 && p.left < q.right - 1 && ueber > Math.max(3, Math.min(p.height, 40) * 0.2) && p.width <= q.width + 2 && p.height <= q.height + 2; };
      let gefunden = false;
      for (let x = e.parentElement; x && x !== document.body && x !== d && !gefunden; x = x.parentElement) {
        const c = getComputedStyle(x); if (c.overflow === 'visible' && c.clipPath === 'none') continue;
        const q = x.getBoundingClientRect();
        const ganzDrin = r.top >= q.top - 1 && r.bottom <= q.bottom + 1 && r.left >= q.left - 1 && r.right <= q.right + 1;
        if (ganzDrin) continue;
        for (let y = e; y && y !== x; y = y.parentElement) if (teils(q, y)) { gefunden = true; break; }
        if (gefunden) verdeckt.push(e.tagName + '.' + klasse(e) + ' «' + e.textContent.trim().slice(0, 40) + '» S.' + (k + 1));
      }
    }
  }

  if (window.__druckHalt) return { seiten: Math.ceil(d.scrollHeight / S - 0.002), kante, verdeckt, log: LOG };   // nur Prüfläufe: Satz ansehen, ohne Blätter

  // ---------- 4. Blätter ----------
  const n = Math.max(1, Math.ceil(d.scrollHeight / S - 0.002));
  // Kantenschutz: Chrome setzt beim Drucken Schrift und Kästen auf ganze Pixel, dadurch kann die Fläche des nächsten
  // Abschnitts um ein, zwei Pixel in die Seite davor ragen (Haarstreifen am Seitenende). Jede Seite bekommt deshalb oben
  // und unten einen schmalen Saum in genau der Farbe, die laut Satz dort liegt. Über Fotos und Bildern liegt nie ein Saum.
  const SAUM = 4;
  const farbeBei = (x, y) => {      // was an dieser Stelle zu sehen ist: eine Flächenfarbe oder null (Bild, Verlauf, Schrift)
    scrollTo(0, Math.max(0, y - innerHeight / 2));
    for (const e of document.elementsFromPoint(x, y - scrollY)) {
      if (/^(IMG|VIDEO|CANVAS|PICTURE|svg|IFRAME)$/i.test(e.tagName)) return null;
      const c = getComputedStyle(e);
      if (c.opacity === '0' || c.visibility === 'hidden') continue;
      if (c.backgroundImage !== 'none' && /url\(/.test(c.backgroundImage)) return null;
      const m = c.backgroundColor.match(/rgba?\(([^)]+)\)/); if (!m) continue;
      const v = m[1].split(',').map(parseFloat);
      if (v.length === 4 && v[3] < 0.98) { if (v[3] > 0.02) return null; continue; }
      return c.backgroundColor;
    }
    return grund;
  };
  const saeume = k => {             // Säume für Blatt k: [{oben|unten, links, breite, farbe}]
    const out = [];
    for (const [seite, y] of [['oben', k * S + SAUM + 2], ['unten', (k + 1) * S - SAUM - 2]]) {
      if ((seite === 'oben' && k === 0) || (seite === 'unten' && k === n - 1)) continue;
      // auf beiden Seiten der Kante muss dieselbe Farbe liegen, sonst ist es keine glatte Fläche (Bild, Linie, Schrift)
      const y2 = seite === 'oben' ? y + 6 : y - 6;
      let lauf = null;
      for (let x = 0; x <= innerWidth; x += 8) {
        const f = x < innerWidth ? farbeBei(Math.min(x + 4, innerWidth - 1), y) : null;
        const ok = f && f === farbeBei(Math.min(x + 4, innerWidth - 1), y2) ? f : null;
        if (lauf && lauf.farbe === ok) lauf.breite += 8;
        else { if (lauf && lauf.farbe) out.push(lauf); lauf = { seite, links: x, breite: 8, farbe: ok }; }
      }
      if (lauf && lauf.farbe) out.push(lauf);
    }
    return out;
  };
  const saumListe = []; for (let k = 0; k < n; k++) saumListe.push(saeume(k));
  const lage = new Map(alle.map(a => [a, [oben(a), unten(a)]]));   // vor dem Ausblenden der Vorlage festhalten
  scrollTo(0, 0); await takt();
  const schluss = flaeche(alle[alle.length - 1]);
  const inhalt = Array.from(document.body.children).filter(x => x.tagName !== 'SCRIPT' && x.tagName !== 'NOSCRIPT');
  const stapel = document.createElement('div'); stapel.id = 'druck-blaetter';
  const H = S + 0.4;   // ein Blatt ist die ganze Seite hoch (sonst blitzt unten ein Haarstreifen Seitengrund durch)
  for (let k = 0; k < n; k++) {
    const blatt = document.createElement('div'); blatt.className = 'druck-blatt';
    blatt.style.cssText = 'position:relative;overflow:hidden;width:100%;height:' + H + 'px;break-after:page;background:' + (k === n - 1 ? schluss : grund);
    const innen = document.createElement('div');
    innen.style.cssText = 'position:relative;top:' + (-k * S) + 'px;width:100%';
    for (const x of inhalt) innen.appendChild(x.cloneNode(true));
    blatt.appendChild(innen);
    for (const z of saumListe[k]) {
      const sm = document.createElement('div'); sm.className = 'druck-saum';
      sm.style.cssText = 'position:absolute;z-index:2147483647;pointer-events:none;' + (z.seite === 'oben' ? 'top:0' : 'bottom:0') + ';left:' + Math.max(0, z.links - (z.links ? 0 : 0)) + 'px;width:' + z.breite + 'px;height:' + SAUM + 'px;background:' + z.farbe;
      blatt.appendChild(sm);
    }
    stapel.appendChild(blatt);
  }
  stapel.lastChild.style.breakAfter = 'auto';
  inhalt.forEach(x => x.style.setProperty('display', 'none', 'important'));
  document.body.appendChild(stapel);
  stapel.querySelectorAll('img').forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; });
  const neu = Array.from(stapel.querySelectorAll('img')).filter(i => !i.complete).map(i => new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }));
  await Promise.race([Promise.all(neu), new Promise(r => setTimeout(r, 15000))]);
  await takt();
  // Anker: jedes Blatt setzt die Seite erst ab dem Abschnitt, der auf ihm steht; alles davor fällt im Blatt weg.
  // Chrome rundet beim Drucken minimal anders als beim Messen; ohne Anker summiert sich das über die Seiten
  // (auf Seite 15 waren es acht Pixel) und Flächen des nächsten Abschnitts ragen in die Seite davor.
  const kopie = (wurzel, e) => {
    const kette = []; let x = e;
    while (x.parentElement && x.parentElement !== document.body) { kette.unshift(Array.prototype.indexOf.call(x.parentElement.children, x)); x = x.parentElement; }
    let c = wurzel.children[inhalt.indexOf(x)];
    for (const j of kette) c = c && c.children[j];
    return c;
  };
  const anker = [];
  Array.from(stapel.children).forEach((bl, k) => {
    const innen = bl.firstChild, i0 = alle.findIndex(a => lage.get(a)[1] > k * S + 0.5);
    if (i0 <= 0) return;
    for (let i = 0; i < i0; i++) { const c = kopie(innen, alle[i]); if (c) c.style.setProperty('display', 'none', 'important'); }
    anker.push([bl, innen, alle[i0], k]);
  });
  await takt();
  for (const [bl, innen, a, k] of anker) {
    const c = kopie(innen, a); if (!c) continue;
    const ist = c.getBoundingClientRect().top - innen.getBoundingClientRect().top;
    innen.style.top = (-(k * S - lage.get(a)[0]) - ist) + 'px';
  }
  await takt();
  if (LOG && window.__druckVergleich) {   // nur Prüfläufe: liegt jeder Abschnitt im Blatt dort, wo er gemessen wurde?
    inhalt.forEach(x => x.style.removeProperty('display'));
    await takt();
    const pfad = e => { const p = []; for (let x = e; x && x !== document.body; x = x.parentElement) p.unshift(Array.prototype.indexOf.call(x.parentElement.children, x)); return p; };
    const blaetter = Array.from(stapel.children);
    for (const a of alle) {
      const t = oben(a), k = Math.floor(t / S + 0.001), bl = blaetter[k]; if (!bl) continue;
      let x = bl.firstChild; const p = pfad(a);
      const iBody = p[0]; x = x.children[inhalt.indexOf(document.body.children[iBody])];
      for (const j of p.slice(1)) x = x && x.children[j];
      if (!x) continue;
      const im = x.getBoundingClientRect().top - bl.getBoundingClientRect().top;
      LOG.push('blatt ' + name(a) + ' S.' + (k + 1) + ' soll ' + (t - k * S).toFixed(2) + ' ist ' + im.toFixed(2));
    }
    inhalt.forEach(x => x.style.setProperty('display', 'none', 'important'));
  }
  return {
    seiten: n, zerrissen, kante, verdeckt, jpeg, verlauf: verlauf.gezeichnet, verlaufGelassen: verlauf.gelassen.slice(0, 20), schatten: schatten.gesetzt, schattenGelassen: schatten.gelassen.slice(0, 10),
    gruppen: gruppen.map(g => g.els.map(e => e.id || String(e.className).split(' ')[0]).join('+') + ' S.' + g.von + (g.bis > g.von ? '-' + g.bis : '') + ' z' + g.z.toFixed(2) + (g.ausgleich ? ' ausgeglichen' : '')),
    offen: Array.from(stapel.querySelectorAll('img')).filter(i => !i.complete || !i.naturalWidth).length,
    ...(LOG ? { log: LOG } : {})
  };
})
