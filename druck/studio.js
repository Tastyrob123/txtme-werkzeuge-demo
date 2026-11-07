/* Print Workshop txtme.social · Oberfläche (Kopie von studio.js der Vorlage L’Imprimerie, Wortlaut Englisch): Entwerfen (KI aus, Probe), Vorlagen, Fotos, Ablage, Bearbeiten wie auf dem Papier, druckfertig speichern. */
(function () {
  const DS = window.DS;
  const HAUS = new URLSearchParams(location.search).get('haus') || 'txtme';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const B = DS.B;
  const ST = { M: null, doc: null, seite: 0, sel: null, S: 3, zoom: 1, hist: [], zukunft: [], modus: null, urform: {}, seitePanel: false };
  const LS = { docs: `ds-${HAUS}-docs`, aktuell: `ds-${HAUS}-aktuell` };
  const lies = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const schreib = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  /* Welches Stück dieses Fenster offen hat, steht je Fenster (sessionStorage): Neuladen öffnet das eigene Stück, nicht das zuletzt gesicherte
     eines anderen Fensters (Master I01/R15, zweite Abnahme 07.11.2026 Fund N4). */
  const FENSTER = `ds-${HAUS}-fenster`;
  const merkeFenster = id => { try { sessionStorage.setItem(FENSTER, id); } catch (e) { } };
  const fensterStueck = () => { try { return sessionStorage.getItem(FENSTER) || ''; } catch (e) { return ''; } };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r2 = v => Math.round(v * 10) / 10;
  const PT = 72 / 25.4;

  /* ---------- Meldung, Dialog ---------- */
  let mT;
  function melde(t, ms = 3200) { const m = $('#meldung'); m.textContent = t; m.hidden = false; clearTimeout(mT); mT = setTimeout(() => m.hidden = true, ms); }
  function dialog(html, knoepfe) {
    return new Promise(ok => {
      $('#dialogKarte').innerHTML = html + `<div class="dialog__knoepfe">${knoepfe.map((k, i) => `<button class="${k.haupt ? 'knopf' : 'leicht'}" data-i="${i}">${esc(k.t)}${k.haupt ? '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>' : ''}</button>`).join('')}</div>`;
      $('#dialog').hidden = false;
      $('#dialogKarte').onclick = e => {
        const b = e.target.closest('[data-i]');
        if (b) { $('#dialog').hidden = true; ok(knoepfe[+b.dataset.i].v); }
        const li = e.target.closest('li[data-id]');
        if (li) { $('#dialog').hidden = true; ok({ springe: li.dataset.id, seite: +li.dataset.seite }); }
      };
    });
  }

  /* ---------- Ablage ---------- */
  const alleDocs = () => lies(LS.docs, {});
  function speichern(beimOeffnen) {
    if (!ST.doc) return;
    if (ST.doc.platzhalter) { if (beimOeffnen) return; delete ST.doc.platzhalter; }
    if (beimOeffnen && !alleDocs()[ST.doc.id]) return;   // nur geöffnet (Vorlage, KI-Entwurf): gespeichert wird erst ab der ersten Änderung (Robert 12.10.2026)
    if (beimOeffnen) { schreib(LS.aktuell, ST.doc.id); merkeFenster(ST.doc.id); return; }   // Öffnen ist keine Änderung, sonst meldet ein zweites Fenster, das nur öffnet, dem ersten einen Konflikt (Master I12)
    const d = alleDocs(), da = d[ST.doc.id];
    /* Zwei Fenster mit derselben Drucksache (Master I01, Abnahme 06.11.2026 Fund 4): hat das andere Fenster inzwischen gespeichert, wird dessen Fassung
       nicht überschrieben; diese Fassung geht als Kopie in «My pieces» und bleibt hier offen. */
    if (da && ST.stand && (da.geaendert || 0) > ST.stand) {
      /* Zusatz vorne, damit er im Kopf und in den Karten zu sehen ist; hinten wurde er bei langen Namen abgeschnitten (zweite Abnahme 07.11.2026 Fund N4) */
      const k = JSON.parse(JSON.stringify(ST.doc)); k.id = 'd' + Date.now().toString(36); k.name = 'Second window · ' + String(k.name || 'Piece').replace(/^Second window · /, ''); delete k.freigabe; ST.doc = k;
      $('#docName').value = k.name; $('#docName').title = k.name;
      setTimeout(() => melde(`CONFLICT · This piece was changed in another window. Nothing was overwritten: your version is in «My pieces» as «${k.name}».`, 12000), 0);
    }
    /* Die Freigabe für Teams setzt und zieht nur «My pieces» zurück; was dort steht, gilt. Sonst löscht das offene Stück eine Freigabe, die nach dem
       Öffnen gesetzt wurde, beim nächsten Sichern still (zweite Abnahme 07.11.2026 Fund N3). */
    const db = d[ST.doc.id];
    if (db) { if (db.freigabe) ST.doc.freigabe = db.freigabe; else delete ST.doc.freigabe; }
    ST.doc.geaendert = Date.now(); ST.stand = ST.doc.geaendert;
    d[ST.doc.id] = ST.doc;
    if (!schreib(LS.docs, d)) melde('The browser storage is full. Please delete older pieces in the library or save them as a working file.');
    schreib(LS.aktuell, ST.doc.id); merkeFenster(ST.doc.id);
    const g = $('#gespeichert'); if (g) { g.classList.add('an'); clearTimeout(g._t); g._t = setTimeout(() => g.classList.remove('an'), 1600); }
  }
  function oeffne(doc) {
    ST.doc = doc; ST.stand = doc.geaendert || 0; ST.seite = 0; ST.sel = null; ST.hist = []; ST.zukunft = []; ST.modus = null; ST.urform = {}; ST.seitePanel = false;
    ST.auftritt = true;
    speichern(true); passeZoom(); zeichne(); zeichneAblage();
  }

  /* ---------- Änderungen mit Verlauf ---------- */
  const seite = () => ST.doc.seiten[ST.seite];
  const sozial = () => !!(window.DSIg && DSIg.istSozial(ST.doc));
  const elById = id => seite().el.find(e => e.id === id);
  function aendern(fn, frei = true) {
    ST.hist.push(JSON.stringify(ST.doc)); if (ST.hist.length > 100) ST.hist.shift();
    ST.zukunft = [];
    fn();
    if (frei) seite().frei = true;
    for (const el of seite().el) if (el.typ === 'text') el.h = DS.mess(el).h;
    speichern(); zeichne();
  }
  /* Verwerfen aus dem Editor (Robert 12.10.2026: «hier will ich doch nicht mitarbeiten: einfach Entwurf löschen oder verwerfen») */
  async function verwerfen() {
    if (ST.modus === 'text') textEnde();
    const d = ST.doc, gespeichert = !!alleDocs()[d.id];
    const seit = Date.now() - (parseInt(String(d.id).slice(1), 36) || Date.now());
    const lange = gespeichert && (seit > 10 * 60000 || ST.hist.length >= 10);
    const a = await dialog(`<h2>Discard this draft?</h2><p class="leise">${gespeichert ? 'It will be removed from your pieces.' : 'It is not saved yet and simply disappears.'}${lange ? ' You worked on it for a while. If you might still need it, keep it as a copy.' : ''}</p>`,
      [{ t: 'Keep', v: false }, ...(lange ? [{ t: 'Keep a copy instead', v: 'kopie' }] : []), { t: 'Discard', v: true, haupt: true }]);
    if (!a) return;
    const alle = alleDocs();
    if (a === 'kopie') { const k = JSON.parse(JSON.stringify(d)); k.id = 'd' + Date.now().toString(36); k.name = d.name + ' (copy)'; k.geaendert = Date.now(); alle[k.id] = k; }
    delete alle[d.id]; schreib(LS.docs, alle);
    oeffne(leer('a5h', true)); zeichneAblage();
    if (window.DSStart) DSStart.zeige('meine');
    melde(a === 'kopie' ? 'Kept as a copy in your pieces.' : 'Draft discarded.');
  }
  function zurueck() { if (document.activeElement && document.activeElement.id === 'eText') document.activeElement.blur();   // erst das Tippen abschliessen (löst «change» aus), dann zurück (Master I10)
    if (eTextVor) { ST.hist.push(eTextVor); eTextVor = null; }   // Tippen im Feld «Content» ohne Verlassen des Felds
    if (!ST.hist.length) return; const id0 = ST.doc.id; ST.zukunft.push(JSON.stringify(ST.doc)); ST.doc = JSON.parse(ST.hist.pop()); ST.doc.id = id0; ST.seite = Math.min(ST.seite, ST.doc.seiten.length - 1); if (ST.sel && !elById(ST.sel)) ST.sel = null; speichern(); zeichne(); }
  function vor() { if (!ST.zukunft.length) return; const id0 = ST.doc.id; ST.hist.push(JSON.stringify(ST.doc)); ST.doc = JSON.parse(ST.zukunft.pop()); ST.doc.id = id0; ST.seite = Math.min(ST.seite, ST.doc.seiten.length - 1); if (ST.sel && !elById(ST.sel)) ST.sel = null; speichern(); zeichne(); }

  function setzeSlot(s, slot, wert) {
    if (!s.quelle || !slot) return;
    const teile = slot.split('.'); let o = s.quelle.inhalt;
    for (let i = 0; i < teile.length - 1; i++) { if (o[teile[i]] == null) o[teile[i]] = /^\d+$/.test(teile[i + 1]) ? [] : {}; o = o[teile[i]]; }
    o[teile[teile.length - 1]] = wert;
  }

  /* ---------- Zeichnen ---------- */
  function passeZoom() {
    const f = ST.doc.format, fl = $('#flaeche');
    const zu = document.querySelector('.studio.rechts-zu'), rb = zu && innerWidth > 900 ? (innerWidth <= 1240 ? 284 : 320) : 0;   // am Handy liegt das Seitenmenü unter dem Blatt, nicht daneben (Master I09)
    const rand = innerWidth <= 900 ? 2 * 16 + 8 : 90;   // Rand = 2 × Abstand des Blatts (.wirt, am Handy 16 px) + Luft; vorher 40 bei 2 × 44 px, das Blatt ragte unten hinaus (Abnahme 06.11.2026, Fund 3)
    const fit = Math.min((fl.clientWidth - rb - rand) / (f.b + 2 * B), (fl.clientHeight - rand) / (f.h + 2 * B));
    ST.S = Math.max(.6, fit) * ST.zoom;
  }
  function zeichne() {
    const M = ST.M, doc = ST.doc, f = doc.format, S = ST.S;
    const wirt = $('#wirt');
    wirt.style.width = (f.b + 2 * B) * S + 'px'; wirt.style.height = (f.h + 2 * B) * S + 'px';
    wirt.innerHTML = '';
    const blatt = DS.seiteDom(M, doc, ST.seite, S, { editor: true });
    wirt.appendChild(blatt);
    if (ST.auftritt) {
      ST.auftritt = false;
      [...blatt.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 24)));
      wirt.classList.remove('schwebt'); void wirt.offsetWidth; wirt.classList.add('schwebt');
      clearTimeout(wirt._a); wirt._a = setTimeout(() => wirt.classList.remove('schwebt'), 3200);
    }
    const ue = document.createElement('div'); ue.className = 'ueber'; ue.id = 'ueber';
    const dg = DS.FORMATE[doc.formatKey]?.digital;
    ue.innerHTML = `<div class="schnitt" style="left:${B * S}px;top:${B * S}px;width:${f.b * S}px;height:${f.h * S}px${dg ? ';outline:0' : ''}"></div>` +
      (dg ? '' : `<div class="sicher" style="left:${(B + DS.SICHER) * S}px;top:${(B + DS.SICHER) * S}px;width:${(f.b - 2 * DS.SICHER) * S}px;height:${(f.h - 2 * DS.SICHER) * S}px"></div>`);
    wirt.appendChild(ue);
    wirt.classList.toggle('ohneHilfen', !$('#zeigeHilfen').checked);
    zeichneAuswahl();
    $('#docName').value = doc.name; $('#docName').title = doc.name || '';
    $('#formatInfo').textContent = `${DS.FORMATE[doc.formatKey]?.name || ''} · ${f.b} × ${f.h} mm${dg ? '' : DS.frei(doc.formatKey) ? ' · trimmed to the ink' : ' · bleed 3 mm'}`;
    $('#zoomWert').textContent = Math.round(ST.zoom * 100) + ' %';
    $('#btnZurueck').disabled = !ST.hist.length; $('#btnVor').disabled = !ST.zukunft.length;
    zeichneSeitenwahl(); zeichneEigenschaften(); zeichnePruefung();
    const zipK = $('#menueSpeichern [data-aus="zip"]'); if (zipK) zipK.hidden = !(sozial() && doc.seiten.length > 1);
    /* Wird das Blatt neu gezeichnet, während auf ihm geschrieben wird (Seitenmenü geht beim Doppelklick auf, Fenstergrösse), bleibt das Schreiben
       offen: vorher war der Schreibmodus danach ohne Feld, das Getippte landete nirgends (gefunden bei der Nachprüfung 07.11.2026) */
    if (ST.modus === 'text') { const el = ST.sel && elById(ST.sel); if (el && el.typ === 'text') textBinden(el, !textGetippt); else ST.modus = null; }
  }
  function domVon(id) { return $(`#wirt .blatt .el[data-id="${id}"]`); }
  function zeichneAuswahl(live) {
    const ue = $('#ueber'); if (!ue) return;
    ue.querySelectorAll('.auswahl,.griff,.hl,.mass').forEach(n => n.remove());
    const el = ST.sel && elById(ST.sel); if (!el) return;
    const S = ST.S, b = live || { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) };
    const a = document.createElement('div'); a.className = 'auswahl' + (ST.modus === 'ausschnitt' ? ' ausschnitt' : '');
    Object.assign(a.style, { left: (b.x + B) * S + 'px', top: (b.y + B) * S + 'px', width: Math.max(2, b.w * S) + 'px', height: Math.max(2, b.h * S) + 'px' });
    ue.appendChild(a);
    if (ST.modus) return;
    const senk = el.typ === 'linie' && el.h > el.w;
    let gr = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    if (el.typ === 'text' || (el.typ === 'linie' && !senk)) gr = ['w', 'e'];
    if (senk) gr = ['n', 's'];
    if (el.typ === 'zeichen') gr = ['nw', 'ne', 'se', 'sw'];
    const pos = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
    for (const g of gr) {
      const d = document.createElement('div'); d.className = 'griff'; d.dataset.griff = g;
      d.style.left = (b.x + B + b.w * pos[g][0]) * S + 'px'; d.style.top = (b.y + B + b.h * pos[g][1]) * S + 'px';
      d.style.cursor = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' }[g];
      ue.appendChild(d);
    }
  }
  function zeichneSeitenwahl() {
    const n = ST.doc.seiten.length;
    const so = sozial();
    $('#seitenwahl').innerHTML = ST.doc.seiten.map((_, i) => `<button data-seite="${i}" class="${i === ST.seite ? 'an' : ''}">${so ? 'Image ' + (i + 1) : n === 2 ? (i ? 'Back' : 'Front') : 'Page ' + (i + 1)}</button>`).join('') +
      `<button data-seite="neu" title="${so ? 'Add an image in the same style' : 'Add a page'}">+</button>`;
  }
  function zeichnePruefung() {
    const p = DS.pruefe(ST.M, ST.doc), b = $('#btnPruefen');
    $('#pruefZahl').textContent = p.length;
    b.classList.toggle('rot', p.some(x => x.stufe === 'rot')); b.classList.toggle('gut', !p.length);
    b.title = p.length ? p.map(x => x.text).join('\n') : 'All ready to print';
  }

  /* ---------- Eigenschaften ---------- */
  const farbKnoepfe = (aktiv, art) => `<div class="farben">${Object.entries(ST.M.farben).map(([k, v]) => `<button data-farbe="${k}" data-art="${art}" title="${esc(ST.M.farbnamen[k] || k)}" style="background:${v}" class="${aktiv === k ? 'an' : ''}"></button>`).join('')}</div>`;
  const regler = (name, wert, min, max, schritt, anzeige) => `<div class="regler"><input type="range" data-regler="${name}" min="${min}" max="${max}" step="${schritt}" value="${wert}"><output>${anzeige}</output></div>`;
  const masse = (el, felder) => `<div class="masse">${felder.map(([k, t]) => `<label>${t}<input type="number" step="0.5" data-mass="${k}" value="${r2(el[k])}"></label>`).join('')}</div>`;
  const ROLLEN = [['titel', 'Title'], ['kapitale', 'Capitals'], ['text', 'Text'], ['kursiv', 'Italic'], ['mono', 'Label']];
  /* Gestalten (Robert 16.10.2026, für alle Werkzeuge gleich): Schriftart, Textart und Schriftgrösse getrennt wählbar */
  const SCHRIFTEN = [['titel', 'Title'], ['kapitale', 'Capitals'], ['text', 'Text'], ['mono', 'Label']];
  const textart = el => el.rolle === 'kursiv' ? 'kursiv' : el.gross ? 'versal' : 'normal';
  const kursivGeht = el => (el.rolle === 'text' || el.rolle === 'kursiv') && !!ST.M.schriften.kursiv;

  let rechtsSchluessel = '', eTextVor = null, eTextT = 0;
  /* Gestalten als Seitenmenü (Entscheid 16.10.2026 für alle Werkzeuge): offen, sobald ein Element gewählt ist oder die Seite angetippt wird;
     zu mit ×, Esc oder Klick neben das Blatt. Die Grösse des Blatts bleibt dabei gleich, es rückt nur zur Seite. */
  const ZU_KNOPF = '<button class="rechts__zu" data-tu="zu" aria-label="Close (Esc)" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
  function rechtsOffen(offen) {
    const st = document.querySelector('.studio'); if (!st || st.classList.contains('rechts-zu') === !offen) return;
    st.classList.toggle('rechts-zu', !offen);
  }
  function zeichneEigenschaften() {
    const R = $('#rechts'), el = ST.sel && elById(ST.sel), M = ST.M;
    rechtsOffen(!!el || !!ST.seitePanel);
    if (el && !ST.urform[el.id]) ST.urform[el.id] = JSON.stringify(el);
    const schl = (el ? el.id : 'seite' + ST.seite) + ST.doc.id;
    if (schl !== rechtsSchluessel) { rechtsSchluessel = schl; if (eTextVor) { const vor = eTextVor; eTextVor = null; ST.hist.push(vor); ST.zukunft = []; speichern(); } R.classList.remove('wechsel'); void R.offsetWidth; R.classList.add('wechsel'); }
    if (!el) {
      const s = seite(), q = s.quelle;
      R.innerHTML = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>${sozial() ? (ST.doc.seiten.length > 1 ? 'Image ' + (ST.seite + 1) + ' of ' + ST.doc.seiten.length : 'The post') : ST.doc.seiten.length > 1 ? (ST.doc.seiten.length === 2 ? (ST.seite ? 'Back' : 'Front') : 'Page ' + (ST.seite + 1)) : 'The page'}</h2>
        <p class="klein">Click an element to design it. Double-click text to write on the sheet, double-click a photo to move the crop.</p>
        ${window.DSIg ? DSIg.panel(ST.doc) : ''}
        <div class="gruppe"><label>Format</label><select id="eFormat">${Object.entries(DS.FORMATE).map(([k, f]) => `<option value="${k}" ${k === ST.doc.formatKey ? 'selected' : ''}>${f.name} · ${f.b} × ${f.h} mm</option>`).join('')}</select>
          <p class="klein">On change every page is set again in the new format. Texts and photos stay.</p></div>
        ${q ? `<div class="gruppe"><button class="knopf knopf--voll" data-tu="neuSetzen" style="height:42px">Set the page again<i><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/></svg></i></button>
          <p class="klein">Sets the page again with your changed texts and photos; spacing is right again afterwards.</p></div>` : ''}
        <div class="gruppe"><label>Layout</label><select id="eVorlage"><option value="">${q ? '' : 'Free layout'}</option>${Object.entries(DS.VORLAGEN).map(([k, v]) => `<option value="${k}" ${q && q.vorlage === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></div>
        <div class="gruppe"><label>Ground</label><div class="segment" id="eTon">${['dunkel', 'hell', 'creme'].map(k => [k, DS.tonName(M, k)]).map(([k, t]) => `<button data-ton="${k}" class="${q && q.ton === k ? 'an' : ''}">${t}</button>`).join('')}</div>
          <div style="margin-top:10px">${farbKnoepfe(s.grund, 'grund')}</div>
          <label style="margin:14px 0 8px">Grid</label><div class="segment" id="eTapete">${[['', 'No grid'], ['dunkel', 'Light lines'], ['hell', 'Dark lines']].map(([k, t]) => `<button data-tapete="${k}" class="${(s.tapete || '') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Pages</label><div class="knoepfe">${sozial() ? '' : '<button data-tu="rueckseite">Add a back</button>'}<button data-tu="seiteKopie">${sozial() ? 'Copy image' : 'Copy page'}</button>
          ${ST.doc.seiten.length > 1 ? `<button data-tu="seiteWeg" class="weg">${sozial() ? 'Delete image' : 'Delete page'}</button>` : ''}</div></div>`;
      return;
    }
    let h = `<div class="rechts__kopf"><small>Design</small>${ZU_KNOPF}</div><h2>${{ text: 'Text', bild: 'Photo', flaeche: 'Area', linie: 'Rule', rahmen: 'Frame', zeichen: 'Logo' }[el.typ]}</h2>`;
    const masseZeile = (felder) => `<div class="gruppe"><label>Position in mm</label>${masse(el, felder)}</div>`;
    if (el.typ === 'text') {
      h += `<div class="gruppe gestalten"><label>Font</label><div class="segment segment--schrift">${SCHRIFTEN.filter(([k]) => M.schriften[k]).map(([k, t]) => `<button data-rolle="${k}" class="${(el.rolle === 'kursiv' ? 'text' : el.rolle) === k ? 'an' : ''}" style="font-family:'DS-${k}'" title="${esc(M.schriften[k].familie)}">${esc(t)}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Size</label><div class="groesse"><button data-grschritt="-1" aria-label="Smaller">−</button><input type="number" min="4" max="400" step="0.5" data-grpt="1" value="${r2(el.gr * PT)}"><span>pt</span><button data-grschritt="1" aria-label="Larger">+</button></div>
          ${regler('gr', el.gr, .8, Math.max(40, el.gr), .05, r2(el.gr * PT) + ' pt')}</div>
        <div class="gruppe"><label>Style</label><div class="segment">${[['normal', 'Normal'], ['kursiv', 'Italic'], ['versal', 'Spaced capitals']].map(([k, t]) => `<button data-textart="${k}" class="${textart(el) === k ? 'an' : ''}" ${k === 'kursiv' && !kursivGeht(el) ? 'disabled title="Space Grotesk has no italic"' : ''}>${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Alignment</label><div class="segment">${[['l', 'Left'], ['c', 'Centre'], ['r', 'Right']].map(([k, t]) => `<button data-ausr="${k}" class="${(el.ausr || 'l') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Spacing</label><label class="unter">Tracking</label>${regler('sperr', el.sperr || 0, -.03, .45, .01, (el.sperr || 0).toFixed(2))}
          <label class="unter">Line height</label>${regler('zeile', el.zeile || 1.2, .85, 2.2, .01, (el.zeile || 1.2).toFixed(2))}
          <label class="unter">Opacity</label>${regler('deck', el.deck ?? 1, .2, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}</div>
        <div class="gruppe"><label>Content</label><textarea class="textfeld" id="eText" rows="3">${esc(el.text)}</textarea><p class="klein">Or double-click the text and write on the sheet.</p></div>
        ${masseZeile([['x', 'Left'], ['y', 'Top'], ['w', 'Width']])}`;
    } else if (el.typ === 'bild') {
      const b = M.bildIndex[el.bild];
      h += `<div class="gruppe"><label>Size in mm</label>${masse(el, [['w', 'Width'], ['h', 'Height']])}<div class="knoepfe" style="margin-top:10px"><button data-tu="randlos">Full bleed</button></div></div>
        <div class="gruppe"><label>Crop</label>${regler('zoom', el.zoom || 1, 1, 3, .01, Math.round((el.zoom || 1) * 100) + ' %')}
          ${regler('fx', el.fx ?? .5, 0, 1, .01, 'left/right')}${regler('fy', el.fy ?? .5, 0, 1, .01, 'top/bottom')}
          <p class="klein">Or double-click the photo and drag the crop with the mouse.</p></div>
        <div class="gruppe"><label>Photo</label><p class="klein" style="margin:0 0 8px">${esc(b ? b.alt : 'no photo')}</p><div class="knoepfe"><button data-tu="fotoWahl">Swap photo</button></div></div>
        <div class="gruppe"><label>Corners</label>${regler('r', el.r || 0, 0, 20, .5, r2(el.r || 0) + ' mm')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    } else if (el.typ === 'flaeche') {
      h += `<div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}
          <div class="segment" style="margin-top:10px">${[['', 'No grid'], ['dunkel', 'Light lines'], ['hell', 'Dark lines']].map(([k, t]) => `<button data-eltapete="${k}" class="${(el.tapete || '') === k ? 'an' : ''}">${t}</button>`).join('')}</div></div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .1, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}<label class="unter">Corners</label>${regler('r', el.r || 0, 0, 40, .5, r2(el.r || 0) + ' mm')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top'], ['w', 'Width'], ['h', 'Height']])}`;
    } else if (el.typ === 'linie' || el.typ === 'rahmen') {
      const senk = el.typ === 'linie' && el.h > el.w;
      h += `<div class="gruppe"><label>Weight</label>${regler('staerke', el.staerke, .1, 2, .05, r2(el.staerke * PT * 10) / 10 + ' pt')}</div>
        <div class="gruppe"><label>${el.typ === 'rahmen' ? 'Size in mm' : 'Length in mm'}</label>${masse(el, el.typ === 'rahmen' ? [['w', 'Width'], ['h', 'Height']] : senk ? [['h', 'Length']] : [['w', 'Length']])}</div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .1, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}
          ${el.typ === 'rahmen' ? `<label class="unter">Corners</label>${regler('r', el.r || 0, 0, 20, .5, r2(el.r || 0) + ' mm')}` : ''}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    } else if (el.typ === 'zeichen') {
      h += `<div class="gruppe"><label>Size in mm</label>${masse(el, [['w', 'Width']])}</div>
        <div class="gruppe"><label>Colour</label>${farbKnoepfe(el.farbe, 'el')}</div>
        <div class="gruppe"><label>Opacity</label>${regler('deck', el.deck ?? 1, .05, 1, .01, Math.round((el.deck ?? 1) * 100) + ' %')}</div>
        ${masseZeile([['x', 'Left'], ['y', 'Top']])}`;
    }
    h += `<div class="gruppe"><label>Arrange</label><div class="knoepfe">
      <button data-tu="mitteH">Centre horizontally</button><button data-tu="mitteV">Centre vertically</button>
      <button data-tu="vorn">Bring forward</button><button data-tu="hinten">Send back</button>
      <button data-tu="kopie">Duplicate</button></div></div>
      <div class="gruppe rechts__fuss"><div class="knoepfe"><button data-tu="zuruecksetzen" ${ST.urform[el.id] && ST.urform[el.id] !== JSON.stringify(el) ? '' : 'disabled'}>Reset element</button><button data-tu="weg" class="weg">Remove</button></div></div>`;
    R.innerHTML = h;
  }

  /* Eigenschaften: Ereignisse */
  function rechtsEreignisse() {
    const R = $('#rechts');
    let reglerStart = null;
    R.addEventListener('input', e => {
      const t = e.target, el = ST.sel && elById(ST.sel);
      if (t.dataset.regler && el) {
        if (!reglerStart) { reglerStart = JSON.stringify(ST.doc); }
        const k = t.dataset.regler, v = +t.value;
        el[k] = v;
        if (el.typ === 'text') el.h = DS.mess(el).h;
        const alt = domVon(el.id), neu = DS.elementDom(ST.M, el, ST.S, { editor: true });
        alt.replaceWith(neu); zeichneAuswahl();
        const out = t.parentNode.querySelector('output');
        out.textContent = k === 'gr' ? r2(v * PT) + ' pt' : k === 'deck' || k === 'zoom' ? Math.round(v * 100) + ' %' : k === 'r' ? r2(v) + ' mm' : k === 'staerke' ? r2(v * PT * 10) / 10 + ' pt' : k === 'fx' ? 'left/right' : k === 'fy' ? 'top/bottom' : v.toFixed(2);
      }
      if (t.id === 'eText' && el) {
        if (!eTextVor) eTextVor = JSON.stringify(ST.doc);   // Stand vor dem ersten Buchstaben, damit «Undo» das ganze Tippen zurücknimmt (Master I10, Abnahme 06.11.2026 Fund 5)
        $('#btnZurueck').disabled = false;
        clearTimeout(eTextT); eTextT = setTimeout(() => { if (ST.doc) speichern(); }, 900);   // auch ohne Verlassen des Felds gesichert (Fenster zu, Akku leer)
        el.text = t.value; el.h = DS.mess(el).h; setzeSlot(seite(), el.slot, t.value);   // auch in den Inhalt der Vorlage, sonst holt ein Format- oder Aufbauwechsel nach dem Neuladen den alten Text (zweite Abnahme 07.11.2026 Fund N2)
        domVon(el.id).replaceWith(DS.elementDom(ST.M, el, ST.S, { editor: true })); zeichneAuswahl();
      }
    });
    R.addEventListener('change', e => {
      const t = e.target, el = ST.sel && elById(ST.sel);
      if (t.dataset.regler && reglerStart) {
        ST.hist.push(reglerStart); ST.zukunft = []; reglerStart = null; seite().frei = true; speichern(); zeichne(); return;
      }
      if (t.id === 'eText' && el) {
        const v = t.value, vor = eTextVor || JSON.stringify(ST.doc); eTextVor = null; clearTimeout(eTextT);
        ST.hist.push(vor); if (ST.hist.length > 100) ST.hist.shift(); ST.zukunft = [];
        el.text = v; setzeSlot(seite(), el.slot, v); for (const x of seite().el) if (x.typ === 'text') x.h = DS.mess(x).h;
        speichern(); zeichne(); return;
      }
      if (t.dataset.mass && el) { const k = t.dataset.mass, v = +t.value; aendern(() => { el[k] = v; }); return; }
      if (t.dataset.grpt && el && +t.value > 0) { const v = Math.min(400, Math.max(4, +t.value)); aendern(() => { el.gr = v / PT; el.h = DS.mess(el).h; }); return; }
      if (t.id === 'eFormat') return umsetzenFormat(t.value);
      if (t.id === 'eVorlage' && t.value) return umsetzenSeite({ vorlage: t.value });
    });
    R.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const el = ST.sel && elById(ST.sel), s = seite(), f = ST.doc.format;
      if (b.dataset.ig && window.DSIg) { DSIg.klick(b.dataset.ig); return; }
      if (b.dataset.farbe) {
        const k = b.dataset.farbe;
        if (b.dataset.art === 'grund') aendern(() => { s.grund = k; }, false); else aendern(() => { el.farbe = k; });
      } else if (b.dataset.rolle) aendern(() => { const versal = el.gross, sp = el.sperr; el.rolle = b.dataset.rolle; Object.assign(el, { zeile: DS.STIL[el.rolle].zeile, sperr: DS.STIL[el.rolle].sperr, gross: !!DS.STIL[el.rolle].gross }); if (versal) Object.assign(el, { gross: true, sperr: Math.max(sp || 0, el.sperr || 0) }); el.h = DS.mess(el).h; });
      else if (b.dataset.textart) aendern(() => {
        const a = b.dataset.textart;
        if (a === 'kursiv') { el.rolle = 'kursiv'; el.gross = false; }
        else { if (el.rolle === 'kursiv') el.rolle = 'text'; el.gross = a === 'versal'; el.sperr = a === 'versal' ? Math.max(el.sperr || 0, .16) : (DS.STIL[el.rolle] && !DS.STIL[el.rolle].gross ? DS.STIL[el.rolle].sperr || 0 : 0); }
        el.h = DS.mess(el).h;
      });
      else if (b.dataset.grschritt) aendern(() => { el.gr = Math.max(4 / PT, (Math.round(el.gr * PT) + +b.dataset.grschritt) / PT); el.h = DS.mess(el).h; });
      else if (b.dataset.ausr) aendern(() => { el.ausr = b.dataset.ausr; });
      else if (b.dataset.gross) aendern(() => { el.gross = !el.gross; });
      else if (b.dataset.eltapete !== undefined) aendern(() => { el.tapete = b.dataset.eltapete || null; });
      else if (b.dataset.tapete !== undefined) aendern(() => { s.tapete = b.dataset.tapete || null; }, false);
      else if (b.dataset.ton) umsetzenSeite({ ton: b.dataset.ton });
      else if (b.dataset.tu) {
        const tu = b.dataset.tu;
        if (tu === 'zu') { ST.sel = null; ST.seitePanel = false; zeichne(); return; }
        if (tu === 'zuruecksetzen') { const u = ST.urform[el.id]; if (u) aendern(() => { Object.keys(el).forEach(k => delete el[k]); Object.assign(el, JSON.parse(u)); }); return; }
        if (tu === 'weg') { aendern(() => { s.el = s.el.filter(x => x !== el); }); ST.sel = null; zeichne(); }
        else if (tu === 'kopie') { const k = JSON.parse(JSON.stringify(el)); k.id = DS.neueId(); k.x += 4; k.y += 4; delete k.slot; aendern(() => s.el.push(k)); ST.sel = k.id; zeichne(); }
        else if (tu === 'vorn') aendern(() => { const i = s.el.indexOf(el); if (i < s.el.length - 1) { s.el.splice(i, 1); s.el.splice(i + 1, 0, el); } });
        else if (tu === 'hinten') aendern(() => { const i = s.el.indexOf(el); if (i > 0) { s.el.splice(i, 1); s.el.splice(i - 1, 0, el); } });
        else if (tu === 'mitteH') aendern(() => { el.x = (f.b - el.w) / 2; });
        else if (tu === 'mitteV') aendern(() => { el.y = (f.h - DS.elHoehe(ST.M, el)) / 2; });
        else if (tu === 'randlos') aendern(() => Object.assign(el, { x: -B, y: -B, w: f.b + 2 * B, h: f.h + 2 * B, r: 0 }));
        else if (tu === 'fotoWahl') zeigeTab('fotos');
        else if (tu === 'neuSetzen') umsetzenSeite({});
        else if (tu === 'rueckseite') { aendern(() => ST.doc.seiten.push(DS.setze(ST.M, ST.doc.formatKey, 'rueckseite', seite().quelle?.ton || 'dunkel', DS.BEISPIEL.rueckseite)), false); ST.seite = ST.doc.seiten.length - 1; zeichne(); }
        else if (tu === 'seiteKopie') { const k = JSON.parse(JSON.stringify(s)); k.el.forEach(x => x.id = DS.neueId()); aendern(() => ST.doc.seiten.splice(ST.seite + 1, 0, k), false); ST.seite++; zeichne(); }
        else if (tu === 'seiteWeg') { aendern(() => ST.doc.seiten.splice(ST.seite, 1), false); ST.seite = Math.max(0, ST.seite - 1); zeichne(); }
      }
    });
  }

  /* ---------- Umsetzen: Format, Aufbau, Ton ---------- */
  async function frag(text) {
    return dialog(`<h2>Set again?</h2><p>${text}</p>`, [{ t: 'Cancel', v: false }, { t: 'Set again', v: true, haupt: true }]);
  }
  async function umsetzenSeite(neu) {
    const s = seite();
    const q = s.quelle || { vorlage: 'deckel', ton: 'dunkel', inhalt: ausSeiteInhalt(s) };
    if (s.frei && !(await frag('The page is set again with the new layout. Texts and photos stay, your moves on this page are lost.'))) return zeichne();
    ST.auftritt = true;
    aendern(() => { ST.doc.seiten[ST.seite] = DS.setze(ST.M, ST.doc.formatKey, neu.vorlage || q.vorlage, neu.ton || q.ton, q.inhalt, q.stil); }, false);
    ST.sel = null; zeichne();
  }
  async function umsetzenFormat(fk) {
    const alt = ST.doc.format, nf = DS.FORMATE[fk];
    if (ST.doc.seiten.some(s => s.frei && s.quelle) && !(await frag('All pages are set again in the new format. Texts and photos stay, moves are lost.'))) return zeichne();
    aendern(() => {
      ST.doc.seiten = ST.doc.seiten.map(s => {
        if (s.quelle) return DS.setze(ST.M, fk, s.quelle.vorlage, s.quelle.ton, s.quelle.inhalt, s.quelle.stil);
        const kx = nf.b / alt.b, ky = nf.h / alt.h, k = Math.sqrt(kx * ky);
        s.el.forEach(e => { e.x *= kx; e.y *= ky; e.w *= kx; if (e.h) e.h *= ky; if (e.gr) e.gr *= k; });
        return s;
      });
      ST.doc.formatKey = fk; ST.doc.format = { b: nf.b, h: nf.h };
      ST.auftritt = true;
    }, false);
    ST.sel = null; passeZoom(); zeichne();
  }
  function ausSeiteInhalt(s) {
    const t = s.el.filter(e => e.typ === 'text').sort((a, b) => b.gr - a.gr);
    const bild = s.el.find(e => e.typ === 'bild');
    return { titel: t[0]?.text || 'Title', text: t[1]?.text || '', bild: bild?.bild };
  }

  /* ---------- Neue Elemente ---------- */
  function neuesElement(art, bildKey, an) {
    const f = ST.doc.format, s = seite(), q = s.quelle, T = ST.M.toene[q?.ton || (s.grund === 'bone' || s.grund === 'bone2' || s.grund === 'bright' || s.grund === 'yellow' ? 'hell' : 'dunkel')];
    const k = Math.pow(Math.sqrt(f.b * f.h / (105 * 148)), .8), id = DS.neueId(), w = f.b * .7, x = (f.b - w) / 2, y = f.h * .4;
    const E = {
      titel: { typ: 'text', rolle: 'titel', text: 'New title', gr: 8 * k, farbe: T.titel, ausr: 'c', x, y, w, ...DS.STIL.titel },
      text: { typ: 'text', rolle: 'text', text: 'Your text', gr: 2.8 * k, farbe: T.text, ausr: 'c', x, y, w, ...DS.STIL.text },
      zeile: { typ: 'text', rolle: 'mono', text: 'A label', gr: 1.9 * k, farbe: T.mono, ausr: 'c', x, y, w, ...DS.STIL.mono },
      bild: (() => { const bb = ST.M.bildIndex[bildKey || DS.ersatzFoto(ST.M)] || { w: 3, h: 2 }; let w = f.b * .7, h = w * bb.h / bb.w; if (h > f.h * .7) { h = f.h * .7; w = h * bb.w / bb.h; } return { typ: 'bild', bild: bildKey || DS.ersatzFoto(ST.M), x: (f.b - w) / 2, y: (f.h - h) / 2, w, h, fx: .5, fy: .5, zoom: 1 }; })(),
      zeichen: { typ: 'zeichen', x: (f.b - 18 * k) / 2, y: f.h * .2, w: 18 * k, farbe: T.zeichen },
      linie: { typ: 'linie', x: (f.b - 14 * k) / 2, y: f.h * .5, w: 14 * k, h: 0, staerke: .3, farbe: T.linie },
      flaeche: { typ: 'flaeche', x: f.b * .2, y: f.h * .3, w: f.b * .6, h: f.h * .3, farbe: T.grund === 'ink' ? 'bone' : 'ink', tapete: null, r: 0 },
      rahmen: { typ: 'rahmen', x: 5 * k, y: 5 * k, w: f.b - 10 * k, h: f.h - 10 * k, staerke: .25, r: 2.2 * k, farbe: T.linie },
    }[art];
    E.id = id; E.deck = 1;
    if (E.typ === 'text') E.h = DS.mess(E).h;
    if (bildKey && ST.M.bildIndex[bildKey]?.datei) { const bb = ST.M.bildIndex[bildKey]; E.w = f.b * (bb.w / bb.h > 3 ? .7 : .45); E.h = E.w * bb.h / bb.w; E.x = (f.b - E.w) / 2; E.y = (f.h - E.h) / 2; }   // Logo, Wortmarke
    if (an) { E.x = an.x - E.w / 2; E.y = an.y - (E.h || E.w) / 2; }   // abgelegt an einer Stelle (Le Livre)
    if (an && an.farbe) E.farbe = an.farbe;
    aendern(() => s.el.push(E));
    ST.sel = id; zeichne();
  }

  /* ---------- Maus auf dem Blatt ---------- */
  function fang(b, el, art) {
    const f = ST.doc.format, th = 7 / ST.S, gx = [0, f.b / 2, f.b, DS.SICHER, f.b - DS.SICHER, -B, f.b + B], gy = [0, f.h / 2, f.h, DS.SICHER, f.h - DS.SICHER, -B, f.h + B];
    for (const o of seite().el) {
      if (o === el) continue;
      const oh = DS.elHoehe(ST.M, o);
      gx.push(o.x, o.x + o.w / 2, o.x + o.w); gy.push(o.y, o.y + oh / 2, o.y + oh);
    }
    const linien = [];
    const best = (werte, kand) => {
      let bd = th, bv = null, bk = null;
      for (const [w, i] of werte) for (const k of kand) { const d = Math.abs(w - k); if (d < bd) { bd = d; bv = k - w; bk = k; } }
      return bv === null ? null : { d: bv, k: bk };
    };
    if (art === 'zieh') {
      const sx = best([[b.x, 0], [b.x + b.w / 2, 1], [b.x + b.w, 2]], gx); if (sx) { b.x += sx.d; linien.push({ x: sx.k }); }
      const sy = best([[b.y, 0], [b.y + b.h / 2, 1], [b.y + b.h, 2]], gy); if (sy) { b.y += sy.d; linien.push({ y: sy.k }); }
    } else {
      if (art.includes('e')) { const s = best([[b.x + b.w, 0]], gx); if (s) { b.w += s.d; linien.push({ x: s.k }); } }
      if (art.includes('w')) { const s = best([[b.x, 0]], gx); if (s) { b.x += s.d; b.w -= s.d; linien.push({ x: s.k }); } }
      if (art.includes('s')) { const s = best([[b.y + b.h, 0]], gy); if (s) { b.h += s.d; linien.push({ y: s.k }); } }
      if (art.includes('n')) { const s = best([[b.y, 0]], gy); if (s) { b.y += s.d; b.h -= s.d; linien.push({ y: s.k }); } }
    }
    return linien;
  }
  function zeigeLinien(linien, b) {
    const ue = $('#ueber'), S = ST.S, f = ST.doc.format;
    ue.querySelectorAll('.hl,.mass').forEach(n => n.remove());
    for (const l of linien) {
      const d = document.createElement('div'); d.className = 'hl';
      if (l.x !== undefined) Object.assign(d.style, { left: (l.x + B) * S + 'px', top: 0, width: '1px', height: (f.h + 2 * B) * S + 'px' });
      else Object.assign(d.style, { top: (l.y + B) * S + 'px', left: 0, height: '1px', width: (f.b + 2 * B) * S + 'px' });
      ue.appendChild(d);
    }
    if (b) { const m = document.createElement('div'); m.className = 'mass'; m.style.left = (b.x + B + b.w / 2) * S + 'px'; m.style.top = (b.y + B) * S + 'px'; m.textContent = `${r2(b.x)} · ${r2(b.y)} mm  ${r2(b.w)} × ${r2(b.h)}`; ue.appendChild(m); }
  }

  /* Element unter dem Zeiger: Rahmen nur am Rand greifbar, sonst liegt ein seitengrosser Rahmen über allem */
  function elUnter(e, bevorzugt) {
    const S = ST.S, liste = [];
    for (const n of document.elementsFromPoint(e.clientX, e.clientY)) {
      const d = n.closest && n.closest('.blatt .el'); if (!d || liste.includes(d)) continue;
      if (d.classList.contains('el-rahmen')) {
        const r = d.getBoundingClientRect(), t = Math.max(6, 2 * S);
        const amRand = e.clientX - r.left < t || r.right - e.clientX < t || e.clientY - r.top < t || r.bottom - e.clientY < t;
        if (!amRand) continue;
      }
      liste.push(d);
    }
    return liste.find(n => n.dataset.id === bevorzugt) || liste[0] || null;
  }

  function blattEreignisse() {
    const wirt = $('#wirt');
    let zug = null;
    wirt.addEventListener('pointerdown', e => {
      e.__wirt = true;   // das Blatt wird gleich neu gezeichnet; der Griff an #flaeche weiss so, dass der Klick auf dem Blatt war (Master I11)
      if (ST.modus === 'text') { if (e.target.closest('.el') && e.target.closest('.el').dataset.id === ST.sel) return; textEnde(); }
      const griff = e.target.closest('.griff');
      const elDom = griff ? null : elUnter(e);
      if (ST.modus === 'ausschnitt') {
        const el = elById(ST.sel);
        if (elDom && elDom.dataset.id === ST.sel) { zug = { art: 'ausschnitt', el, px: e.clientX, py: e.clientY, fx: el.fx ?? .5, fy: el.fy ?? .5, vorher: JSON.stringify(ST.doc) }; wirt.setPointerCapture(e.pointerId); return; }
        ST.modus = null;
      }
      if (griff) {
        const el = elById(ST.sel);
        zug = { art: griff.dataset.griff, el, px: e.clientX, py: e.clientY, b0: { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) }, vorher: JSON.stringify(ST.doc), bewegt: false };
        wirt.setPointerCapture(e.pointerId); e.preventDefault(); return;
      }
      if (!elDom) { const bq = wirt.querySelector('.blatt')?.getBoundingClientRect(), aufBlatt = !!bq && e.clientX >= bq.left && e.clientX <= bq.right && e.clientY >= bq.top && e.clientY <= bq.bottom; if (ST.sel || ST.seitePanel !== aufBlatt) { ST.sel = null; ST.seitePanel = aufBlatt; zeichne(); } return; }
      const id = elDom.dataset.id, el = elById(id);
      if (ST.sel !== id) { ST.sel = id; zeichneAuswahl(); zeichneEigenschaften(); markiereFoto(); }
      zug = { art: 'zieh', el, px: e.clientX, py: e.clientY, b0: { x: el.x, y: el.y, w: el.w, h: DS.elHoehe(ST.M, el) }, vorher: JSON.stringify(ST.doc), bewegt: false };
      wirt.setPointerCapture(e.pointerId); e.preventDefault();
    });
    wirt.addEventListener('pointermove', e => {
      if (!zug) return;
      const S = ST.S, dx = (e.clientX - zug.px) / S, dy = (e.clientY - zug.py) / S, el = zug.el;
      if (zug.art === 'ausschnitt') {
        const b = ST.M.bildIndex[el.bild], a = DS.ausschnitt(el, b.w, b.h);
        const rx = el.w - a.bw, ry = el.h - a.bh;
        el.fx = rx ? Math.min(1, Math.max(0, zug.fx + dx / rx)) : .5; el.fy = ry ? Math.min(1, Math.max(0, zug.fy + dy / ry)) : .5;
        domVon(el.id).replaceWith(DS.elementDom(ST.M, el, S, { editor: true }));
        return;
      }
      if (!zug.bewegt && Math.hypot(e.clientX - zug.px, e.clientY - zug.py) < 3) return;
      zug.bewegt = true;
      const b = Object.assign({}, zug.b0), a = zug.art;
      let linien = [];
      if (a === 'zieh') { b.x += dx; b.y += dy; if (!e.altKey) linien = fang(b, el, 'zieh'); }
      else {
        const prop = el.typ === 'zeichen' || (el.typ === 'bild' && e.shiftKey);
        if (a.includes('e')) b.w = Math.max(2, zug.b0.w + dx);
        if (a.includes('w')) { b.w = Math.max(2, zug.b0.w - dx); b.x = zug.b0.x + zug.b0.w - b.w; }
        if (a.includes('s')) b.h = Math.max(1, zug.b0.h + dy);
        if (a.includes('n')) { b.h = Math.max(1, zug.b0.h - dy); b.y = zug.b0.y + zug.b0.h - b.h; }
        if (prop) { const r = zug.b0.h / zug.b0.w; b.h = b.w * r; if (a.includes('n')) b.y = zug.b0.y + zug.b0.h - b.h; }
        else if (!e.altKey) linien = fang(b, el, a);
      }
      el.x = b.x; el.y = b.y; el.w = b.w;
      if (el.typ === 'text') { el.h = DS.mess(el).h; b.h = el.h; }
      else if (el.typ === 'zeichen') b.h = el.w * ST.M.zeichen.verh;
      else el.h = b.h;
      if (el.typ === 'linie' && !(el.h > el.w)) el.h = 0;
      domVon(el.id).replaceWith(DS.elementDom(ST.M, el, S, { editor: true }));
      zeichneAuswahl(b); zeigeLinien(linien, b);
    });
    const ende = () => {
      if (!zug) return;
      const z = zug; zug = null;
      if (z.art === 'ausschnitt' || z.bewegt) {
        ST.hist.push(z.vorher); ST.zukunft = []; if (z.art !== 'ausschnitt') seite().frei = true;
        speichern(); zeichne();
      }
    };
    wirt.addEventListener('pointerup', ende); wirt.addEventListener('pointercancel', ende);
    wirt.addEventListener('dblclick', e => {
      // Durch das Festhalten des Zeigers kommt der Doppelklick am Wirt an: Element unter dem Zeiger suchen, bevorzugt das gewählte
      const d = elUnter(e, ST.sel); if (!d) return;
      const el = elById(d.dataset.id); ST.sel = el.id;
      if (el.typ === 'text') textStart(el);
      else if (el.typ === 'bild') { ST.modus = 'ausschnitt'; zeichneAuswahl(); melde('Move the crop: drag on the photo. Finish with Esc or a click beside it.'); }
    });
    wirt.addEventListener('wheel', e => {
      if (ST.modus !== 'ausschnitt') return;
      e.preventDefault();
      const el = elById(ST.sel); el.zoom = Math.min(3, Math.max(1, (el.zoom || 1) * (e.deltaY < 0 ? 1.04 : 1 / 1.04)));
      domVon(el.id).replaceWith(DS.elementDom(ST.M, el, ST.S, { editor: true }));
      clearTimeout(wirt._z); wirt._z = setTimeout(() => { speichern(); zeichneEigenschaften(); zeichnePruefung(); }, 300);
    }, { passive: false });
  }

  let textVorher = null, blattT = 0, textGetippt = false;
  /* Schreiben direkt auf dem Blatt: das Getippte steht sofort im Stück (auch im Inhalt der Vorlage) und wird 0,9 s nach dem letzten Buchstaben
     und beim Schliessen oder Neuladen gesichert, nicht erst beim Klick daneben (R13, zweite Abnahme 07.11.2026 Fund N1). */
  function textZwischen() {
    if (ST.modus !== 'text' || !ST.sel) return;
    const el = elById(ST.sel), d = domVon(ST.sel); if (!el || !d) return;
    clearTimeout(blattT);
    el.text = textAus(d); el.h = DS.mess(el).h; setzeSlot(seite(), el.slot, el.text);
    speichern();
  }
  function textStart(el) {
    ST.modus = 'text'; textVorher = JSON.stringify(ST.doc); textGetippt = false;
    textBinden(el, true);
  }
  function textBinden(el, alles) {
    const d = domVon(el.id); if (!d) return;
    d.contentEditable = 'plaintext-only';
    if (d.contentEditable !== 'plaintext-only') d.contentEditable = 'true';
    d.focus();
    const r = document.createRange(); r.selectNodeContents(d); if (!alles) r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    zeichneAuswahl();
    d.addEventListener('input', () => { textGetippt = true; const x = elById(el.id); if (!x) return; x.text = textAus(d); x.h = DS.mess(x).h; setzeSlot(seite(), x.slot, x.text); zeichneAuswahl(); $('#btnZurueck').disabled = false; clearTimeout(blattT); blattT = setTimeout(textZwischen, 900); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); textEnde(); } });
  }
  function textAus(d) {
    let t = '';
    for (const n of d.childNodes) t += n.nodeType === 3 ? n.textContent : n.nodeName === 'BR' ? '\n' : (t && !t.endsWith('\n') ? '\n' : '') + n.textContent;
    return t.replace(/\n$/, '');
  }
  function textEnde() {
    if (ST.modus !== 'text') return;
    clearTimeout(blattT);
    const el = elById(ST.sel), d = domVon(ST.sel);
    ST.modus = null;
    if (el && d) {
      const neu = textAus(d);
      ST.hist.push(textVorher); ST.zukunft = [];
      el.text = neu; el.h = DS.mess(el).h; setzeSlot(seite(), el.slot, neu);
      speichern();
    }
    zeichne();
  }

  /* ---------- Tastatur ---------- */
  function tasten() {
    document.addEventListener('keydown', e => {
      const inFeld = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || ST.modus === 'text';
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === 's' && ST.doc && $('#start').hidden) { e.preventDefault(); if (document.activeElement && document.activeElement.id === 'eText') document.activeElement.blur(); if (ST.modus === 'text') textEnde(); speichern(); melde('Saved. The piece is in «My pieces».'); return; }   // ⌘S statt «Seite sichern» des Browsers (Master I11, Abnahme 06.11.2026 Fund 11)
      if (cmd && e.key.toLowerCase() === 'z' && !inFeld) { e.preventDefault(); e.shiftKey ? vor() : zurueck(); return; }
      if (inFeld) return;
      if (e.key === 'Escape') { if (ST.modus === 'ausschnitt') { ST.modus = null; zeichne(); } else if (ST.sel || ST.seitePanel) { ST.sel = null; ST.seitePanel = false; zeichne(); } }
      const el = ST.sel && elById(ST.sel); if (!el) return;
      if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); aendern(() => { seite().el = seite().el.filter(x => x !== el); }); ST.sel = null; zeichne(); }
      if (cmd && e.key.toLowerCase() === 'd') { e.preventDefault(); const k = JSON.parse(JSON.stringify(el)); k.id = DS.neueId(); k.x += 4; k.y += 4; delete k.slot; aendern(() => seite().el.push(k)); ST.sel = k.id; zeichne(); }
      const schritt = e.shiftKey ? 5 : .5;
      const pfeil = { ArrowLeft: [-schritt, 0], ArrowRight: [schritt, 0], ArrowUp: [0, -schritt], ArrowDown: [0, schritt] }[e.key];
      if (pfeil) { e.preventDefault(); aendern(() => { el.x += pfeil[0]; el.y += pfeil[1]; }); }
      if (e.key === 'Enter' && el.typ === 'text') { e.preventDefault(); textStart(el); }
    });
  }

  /* ---------- Linke Spalte ---------- */
  function gleiter() {
    const b = $('.reiter button.an'), g = $('.reiter__gleiter'); if (!b || !g) return;
    g.style.width = b.offsetWidth + 'px'; g.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  function zeigeTab(t) {
    $$('.reiter button').forEach(b => b.classList.toggle('an', b.dataset.tab === t));
    gleiter();
    $$('.tab').forEach(s => s.classList.toggle('an', s.dataset.tab === t));
    if (t === 'vorlagen') zeichneVorlagen();
    if (t === 'fotos') { zeichneFotos(); markiereFoto(); }
    if (t === 'ablage') zeichneAblage();
  }
  function miniBox(doc, i, box) {
    const f = doc.format, S = Math.min(box / (f.b + 2 * B), box / (f.h + 2 * B));
    const p = DS.seiteDom(ST.M, doc, i, S, { mini: true });
    p.style.width = (f.b) * S + 'px'; p.style.height = f.h * S + 'px';
    [...p.children].forEach(c => { c.style.left = parseFloat(c.style.left) - B * S + 'px'; c.style.top = parseFloat(c.style.top) - B * S + 'px'; });
    p.style.backgroundPosition = '0 0';
    return p;
  }
  function zeichneVorlagen() {
    const fk = $('#vorlageFormat').value, ton = $('#vorlageTon').value, box = $('#vorlagen');
    box.innerHTML = '';
    for (const [k, v] of Object.entries(DS.VORLAGEN)) {
      const doc = { format: { b: DS.FORMATE[fk].b, h: DS.FORMATE[fk].h }, formatKey: fk, seiten: [DS.setze(ST.M, fk, k, ton, DS.BEISPIEL[k])] };
      const b = document.createElement('button'); b.className = 'vk'; b.dataset.vorlage = k; b.style.setProperty('--i', box.children.length);
      b.innerHTML = `<div class="vk__bild"></div><b>${esc(v.name)}</b><small>${esc(v.wofuer)}</small>`;
      b.firstChild.appendChild(miniBox(doc, 0, 132));
      box.appendChild(b);
    }
  }
  const GRUPPEN = ['My photos', 'Nights', 'ADE shoot', 'Brand', 'Merch', 'App'];
  const lageVon = b => b.w > b.h * 1.1 ? 'quer' : b.h > b.w * 1.1 ? 'hoch' : 'quadrat';
  function fotoListe() {
    const q = $('#fotoSuche').value.trim().toLowerCase();
    const W = q.split(/\s+/).filter(Boolean), g = ST.fotoGruppe || 'alle', lage = ST.fotoLage || 'alle';
    const T = DS.LIVRE_TEXT, mehr = b => b.saison ? ' ' + T.s[b.saison] + ' ' + T.h[b.herkunft] + (b.ki ? ' ki' : '') : '';
    return ST.M.bilder.filter(b => (g === 'alle' || b.gruppe === g) && (lage === 'alle' || lageVon(b) === lage || (lage === 'hoch' && lageVon(b) === 'quadrat'))
      && (!W.length || W.every(w => (b.alt + ' ' + b.key + ' ' + (b.gruppe || '') + mehr(b)).toLowerCase().includes(w))));
  }
  function fotoHinweis(n) { return `${n} ${n === 1 ? 'photo' : 'photos'}. ` + (ST.sel && elById(ST.sel)?.typ === 'bild' ? 'One click swaps the selected photo.' : 'One click puts the photo on the sheet.'); }
  function zeichneFotos() {
    const zahl = {}; ST.M.bilder.forEach(b => zahl[b.gruppe] = (zahl[b.gruppe] || 0) + 1);
    const g = ST.fotoGruppe || 'alle';
    $('#fotoFilter').innerHTML = `<button data-gruppe="alle" class="${g === 'alle' ? 'an' : ''}">All<i>${ST.M.bilder.length}</i></button>` +
      (ST.M.livre ? [DS.eigene.GRUPPE, ...Object.values(DS.LIVRE_TEXT.b)] : GRUPPEN).filter(x => zahl[x]).map(x => `<button data-gruppe="${esc(x)}" class="${g === x ? 'an' : ''}">${esc(x)}<i>${zahl[x]}</i></button>`).join('');
    $$('#fotoLage button').forEach(b => b.classList.toggle('an', b.dataset.lage === (ST.fotoLage || 'alle')));
    const l = fotoListe();
    $('#fotoInfo').textContent = fotoHinweis(l.length);
    $('#fotos').innerHTML = l.length ? l.map((b, i) => `<div class="foto" role="button" tabindex="0" data-bild="${b.key}" title="${esc(b.alt)}" style="--i:${Math.min(i, 16)}"><img loading="lazy" src="${DS.bildUrl(ST.M, b.key, true)}" alt="${esc(b.alt)}"><span>${esc(b.alt)}</span>${b.ki ? '<b class="foto__ki" title="Made with AI">AI</b>' : ''}${b.eigen ? `<button class="foto__weg" data-weg="${b.key}" aria-label="Remove photo"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` : ''}</div>`).join('')
      : `<p class="fotos__leer">${g === DS.eigene.GRUPPE ? 'No photos of your own yet. Upload above or drop them on the sheet.' : 'No photo matches this search.'}</p>`;
  }
  async function hochladen(dateien, aufsBlatt) {
    if (!dateien || !dateien.length) return;
    try {
      const keys = await DS.eigene.hinzu(ST.M, dateien, t => melde(t, 30000));
      if (!keys.length) { melde('No image file found. Please choose JPG, PNG or HEIC.'); return; }
      melde((keys.length === 1 ? 'Photo added. It is under «My photos».' : `${keys.length} photos added. They are under «My photos».`) + (keys.fluechtig ? ' This browser does not store photos (private window?): it stays only until you close the Print Workshop. To keep it: save a working file.' : ''), keys.fluechtig ? 10000 : 4000);
      ST.fotoGruppe = DS.eigene.GRUPPE; ST.fotoLage = 'alle'; $('#fotoSuche').value = '';
      if (aufsBlatt) {
        const el = ST.sel && elById(ST.sel);
        if (el && el.typ === 'bild') aendern(() => { el.bild = keys[0]; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, keys[0]); }, false);
        else neuesElement('bild', keys[0]);
      }
      zeigeTab('fotos');
    } catch (x) { console.warn(x); melde('Upload did not work: ' + ((x && x.message) || 'reason unknown.'), 7000); }
  }
  function markiereFoto() {
    const el = ST.sel && elById(ST.sel);
    $$('.foto').forEach(f => f.classList.toggle('an', !!el && el.typ === 'bild' && el.bild === f.dataset.bild));
    if ($('.tab[data-tab="fotos"]').classList.contains('an')) $('#fotoInfo').textContent = fotoHinweis(fotoListe().length);
  }
  function zeichneAblage() {
    const d = Object.values(alleDocs()).sort((a, b) => b.geaendert - a.geaendert), box = $('#ablage');
    box.innerHTML = '';
    for (const doc of d) {
      const r = document.createElement('div'); r.className = 'ab' + (ST.doc && doc.id === ST.doc.id ? ' an' : ''); r.style.animationDelay = Math.min(box.children.length, 12) * 50 + 'ms';
      r.innerHTML = `<div class="ab__bild" data-oeffne="${doc.id}"></div><div><b data-oeffne="${doc.id}">${esc(doc.name)}</b><small>${esc(DS.FORMATE[doc.formatKey]?.name || '')} · ${doc.seiten.length} ${doc.seiten.length === 1 ? 'page' : 'pages'} · ${new Date(doc.geaendert).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
        <div class="ab__knoepfe"><button data-kopie="${doc.id}">Copy</button><button data-loesch="${doc.id}">Delete</button></div></div>`;
      try { r.firstChild.appendChild(miniBox(doc, 0, 70)); } catch (e) { }
      box.appendChild(r);
    }
  }
  function linksEreignisse() {
    $('.reiter').addEventListener('click', e => { const b = e.target.closest('button'); if (b) zeigeTab(b.dataset.tab); });
    $('#vorlageFormat').addEventListener('change', zeichneVorlagen); $('#vorlageTon').addEventListener('change', zeichneVorlagen);
    $('#vorlagen').addEventListener('click', e => {
      const b = e.target.closest('[data-vorlage]'); if (!b) return;
      const k = b.dataset.vorlage, fk = $('#vorlageFormat').value, ton = $('#vorlageTon').value;
      oeffne(DS.dokument(ST.M, { name: DS.VORLAGEN[k].name, format: fk, seiten: [{ vorlage: k, ton, inhalt: DS.BEISPIEL[k] }] }));
      melde('Template opened. Overwrite the texts on the sheet.');
    });
    let sT; $('#fotoSuche').addEventListener('input', () => { clearTimeout(sT); sT = setTimeout(() => { zeichneFotos(); markiereFoto(); }, 150); });
    $('#fotoFilter').addEventListener('click', e => { const b = e.target.closest('[data-gruppe]'); if (!b) return; ST.fotoGruppe = b.dataset.gruppe; zeichneFotos(); markiereFoto(); b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); });
    $('#fotoLage').addEventListener('click', e => { const b = e.target.closest('[data-lage]'); if (!b) return; ST.fotoLage = b.dataset.lage; zeichneFotos(); markiereFoto(); });
    $('#fotoDatei').addEventListener('change', e => { hochladen(e.target.files, false); e.target.value = ''; });
    const zone = $('#hochladen');
    ['dragenter', 'dragover'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('ueber'); }));
    ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.remove('ueber'); }));
    zone.addEventListener('drop', e => hochladen(e.dataTransfer.files, false));
    const fl = $('#flaeche');
    fl.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); fl.classList.add('ablegen'); } });
    fl.addEventListener('dragleave', e => { if (!fl.contains(e.relatedTarget)) fl.classList.remove('ablegen'); });
    fl.addEventListener('drop', e => { e.preventDefault(); fl.classList.remove('ablegen'); hochladen(e.dataTransfer.files, true); });
    $('#fotos').addEventListener('keydown', e => { if (e.key === 'Enter') { const b = e.target.closest('[data-bild]'); if (b) b.click(); } });
    $('#fotos').addEventListener('click', e => {
      const w = e.target.closest('[data-weg]');
      if (w) {
        e.stopPropagation();
        const k = w.dataset.weg, benutzt = Object.values(alleDocs()).some(d => d.seiten.some(s => s.el.some(x => x.bild === k)));
        dialog(`<h2>Remove photo?</h2><p>«${esc(ST.M.bildIndex[k].alt)}» is deleted from your own photos.${benutzt ? ' It is in at least one piece, which keeps an empty area there.' : ''}</p>`, [{ t: 'Keep', v: false }, { t: 'Remove', v: true, haupt: true }])
          .then(async ja => { if (!ja) return; await DS.eigene.loeschen(ST.M, k); zeichneFotos(); zeichne(); });
        return;
      }
      const b = e.target.closest('[data-bild]'); if (!b) return;
      const el = ST.sel && elById(ST.sel), key = b.dataset.bild;
      if (el && el.typ === 'bild') aendern(() => { el.bild = key; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, key); }, false);
      else neuesElement('bild', key);
      markiereFoto();
    });
    $('#ablage').addEventListener('click', e => {
      const t = e.target.closest('[data-oeffne],[data-kopie],[data-loesch]'); if (!t) return;
      const d = alleDocs();
      if (t.dataset.oeffne) oeffne(d[t.dataset.oeffne]);
      else if (t.dataset.kopie) { const k = JSON.parse(JSON.stringify(d[t.dataset.kopie])); k.id = 'd' + Date.now().toString(36); k.name += ' (copy)'; oeffne(k); }
      else if (t.dataset.loesch) {
        dialog(`<h2>Delete?</h2><p>«${esc(d[t.dataset.loesch].name)}» is removed from the library of this browser.</p>`, [{ t: 'Keep', v: false }, { t: 'Delete', v: true, haupt: true }]).then(ja => {
          if (!ja) return;
          const id = t.dataset.loesch; delete d[id]; schreib(LS.docs, d);
          if (ST.doc.id === id) { const rest = Object.values(d).sort((a, b) => b.geaendert - a.geaendert); if (rest[0]) oeffne(rest[0]); else oeffne(leer()); }
          zeichneAblage();
        });
      }
    });
    $('#btnNeuLeer').addEventListener('click', () => window.DSStart ? DSStart.zeige() : oeffne(leer()));
    $('#dateiLaden').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const doc = JSON.parse(await f.text()); if (!Array.isArray(doc.seiten) || !doc.format || !doc.seiten.every(s => s && Array.isArray(s.el))) throw 0; if (doc.eigeneFotos) { await DS.eigene.einlesen(ST.M, doc.eigeneFotos); delete doc.eigeneFotos; } doc.id = 'd' + Date.now().toString(36); oeffne(doc); melde('Working file opened.'); }
      catch (x) { melde('This file is not a working file of the workshop.'); }
      e.target.value = '';
    });
  }
  function leer(fk = 'a5h', platzhalter = false) {
    const f = DS.FORMATE[fk];
    const d = { id: 'd' + Date.now().toString(36), name: 'Blank sheet · ' + f.name, formatKey: fk, format: { b: f.b, h: f.h }, seiten: [{ grund: DS.frei(fk) ? null : 'bone', tapete: null, el: [] }], hinweise: [], geaendert: Date.now() };
    if (platzhalter) d.platzhalter = true;
    return d;
  }

  /* ---------- Entwerfen über die KI ---------- */
  const IDEEN = [
    'A photo frame for the RKN night, portrait, with the date and the venue',
    'A sticker: See you offline.',
    'A ticket for the next night with a tear-off and a number',
    'A poster A3 for the night, one photo, date and venue',
    'An Instagram post for the night',
    'A story for the door: doors open, no photos',
    'A sign A4: sold out',
    'A flyer A6 to hand out on the street',
  ];
  /* Grund in Alltagssprache statt «Failed to fetch» oder Python-Text (Master I11, Abnahme 06.11.2026 Fund 12) */
  function grund(x) {
    const m = String((x && x.message) || x || '');
    if (/failed to fetch|load failed|networkerror|network request failed/i.test(m) || (navigator.onLine === false)) return 'There is no connection to the workshop right now. Check the network and try again.';
    const k = /^([A-ZÄÖÜ-]+) · (.*)$/.exec(m);
    if (k && k[1] === 'GRENZE') return 'The limit of 40 drafts per hour is reached. Please try again in an hour.';
    if (k && k[1] === 'KI-GUTHABEN') return 'The AI credit is used up. Robert can top it up.';
    if (k) return k[2];
    return m || 'Reason unknown.';
  }
  async function entwerfen(o = {}) {
    if (o instanceof Event) o = {};
    entwerfen.fehler = '';
    const auftrag = (o.auftrag || $('#auftrag').value).trim();
    if (auftrag.length < 4) { $('#auftrag').focus(); melde('Please describe briefly what should be made.'); return false; }
    const st = $('#entwurfStatus'), btn = $('#btnEntwerfen');
    st.hidden = true;
    $('#entwurfHinweise').hidden = true; btn.disabled = true;
    const lader = $('#lader'), fl = $('#flaeche').getBoundingClientRect();
    Object.assign(lader.style, { left: fl.left + 'px', top: fl.top + 'px', width: fl.width + 'px', height: fl.height + 'px' });
    const ZEILEN = ['Reading the brief', 'Choosing format and layout', 'Picking photos of the house', 'Writing the lines in the voice of the house', 'Checking the facts', 'Setting it by the rules of the house'];
    $('#laderText').textContent = o.varianten ? 'Five drafts in the making' : 'The workshop is drafting';
    if (o.varianten) ZEILEN.splice(1, 0, 'Laying out five different designs');
    let zi = 0; $('#laderZeile').textContent = ZEILEN[0]; lader.hidden = false;
    const zuhr = setInterval(() => { const z = $('#laderZeile'); z.style.opacity = 0; setTimeout(() => { zi = (zi + 1) % ZEILEN.length; z.textContent = ZEILEN[zi]; z.style.opacity = 1; }, 450); }, 3000);
    const basis = !o.auftrag && $('#auftragBasis').checked && ST.doc && !ST.doc.platzhalter ? { name: ST.doc.name, format: ST.doc.formatKey, seiten: ST.doc.seiten.map(s => s.quelle || { vorlage: 'frei', inhalt: ausSeiteInhalt(s) }) } : null;
    try {
      const r = await fetch('api/entwurf', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ haus: HAUS, auftrag, format: o.format || $('#auftragFormat').value || null, basis, varianten: o.varianten ? 5 : undefined }) });
      const j = await r.json().catch(() => ({ fehler: 'Answer not readable (' + r.status + ')' }));
      if (!r.ok || j.fehler) throw new Error(j.fehler || ('Error ' + r.status));
      if (o.varianten) {
        const E = j.entwuerfe || {};
        const docs = (E.varianten || []).map(v => {
          const seiten = (v.seiten || []).filter(x => DS.VORLAGEN[x.vorlage]);
          seiten.forEach(x => { if (x.inhalt?.bild && !ST.M.bildIndex[x.inhalt.bild]) x.inhalt.bild = DS.ersatzFoto(ST.M); });
          if (!seiten.length) return null;
          const d = DS.dokument(ST.M, { name: E.name || 'Draft', format: o.format || E.format, seiten, hinweise: E.hinweise || [], auftrag: o.anzeige || auftrag });
          d.variante = v.titel || ''; return d;
        }).filter(Boolean);
        if (!docs.length) throw new Error('The drafts came back without a valid layout.');
        return { docs, hinweise: E.hinweise || [] };
      }
      const e = j.entwurf;
      e.auftrag = o.anzeige || auftrag;
      if (o.auftrag) $('#auftrag').value = o.anzeige || auftrag;
      e.seiten = (e.seiten || []).filter(s => DS.VORLAGEN[s.vorlage]);
      if (!e.seiten.length) throw new Error('The draft came back without a valid layout.');
      e.seiten.forEach(s => { if (s.inhalt?.bild && !ST.M.bildIndex[s.inhalt.bild]) s.inhalt.bild = DS.ersatzFoto(ST.M); });
      const doc = DS.dokument(ST.M, e);
      oeffne(doc);
      st.hidden = true;
      const h = $('#entwurfHinweise');
      if (doc.hinweise.length) { h.hidden = false; h.innerHTML = `<b>Please check</b><ul>${doc.hinweise.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; zeigeTab('entwerfen'); }
      return true;
    } catch (x) {
      st.className = 'status fehler';
      entwerfen.fehler = grund(x);
      st.innerHTML = `The draft did not work. ${esc(entwerfen.fehler)}<br>Under «Templates» it goes on any time without AI.`;
      st.hidden = false;
      return false;
    } finally { btn.disabled = false; clearInterval(zuhr); $('#lader').hidden = true; }
  }

  function zeichneDna() {
    const M = ST.M;
    $('#dna').innerHTML = `<div class="dna__zeichen">${DS.zeichenSvg(M, 'currentColor')}</div>
      <div class="dna__farben">${Object.entries(M.farben).map(([k, v]) => `<div><span style="background:${v}"></span>${esc(M.farbnamen[k])}<br>${v}</div>`).join('')}</div>
      ${Object.entries(M.schriften).map(([k, s]) => `<div class="dna__schrift" style="font-family:'DS-${k}';font-size:${k === 'titel' ? 22 : k === 'mono' ? 12 : 15}px;${k === 'mono' || k === 'kapitale' ? 'text-transform:uppercase;letter-spacing:.16em' : ''}">${esc(M.name)}<small style="font-family:'DS-text';text-transform:none;letter-spacing:0">${esc(s.familie)} · ${esc(s.wofuer)}</small></div>`).join('')}
      <ul>${M.regeln.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
      <p class="klein">${M.bilder.length} photos of the house with a caption, plus the words of the shop and the nights.</p>`;
  }

  /* ---------- Speichern als Datei ---------- */
  function laden(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const dateiname = () => (ST.doc.name || 'piece').toLowerCase().replace(/[äöü]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue' }[c])).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + ST.doc.formatKey;
  async function pruefDialog(fuer) {
    const p = DS.pruefe(ST.M, ST.doc);
    if (!p.length) { if (!fuer) melde('All ready to print: nothing open.'); return true; }
    const rot = p.some(x => x.stufe === 'rot');
    const a = await dialog(`<h2>${rot ? 'Check before printing' : 'Notes for printing'}</h2><p class="leise">Click a point to see the spot.</p><ul>${p.map(x => `<li class="${x.stufe}" data-id="${x.id}" data-seite="${x.seite}">${esc(x.text)}</li>`).join('')}</ul>`,
      fuer ? [{ t: 'Back to the sheet', v: false }, { t: 'Save anyway', v: true, haupt: true }] : [{ t: 'Close', v: false }]);
    if (a && a.springe) { ST.seite = a.seite; ST.sel = a.springe; zeichne(); return false; }
    return a;
  }
  async function ausgabe(art) {
    $('#menueSpeichern').hidden = true;
    if (art === 'zip') { if (window.DSIg) DSIg.zip().catch(x => melde('Saving failed: ' + x.message, 8000)); return; }
    if (art === 'json') { const ef = await DS.eigene.mitnehmen(ST.M, ST.doc); laden(new Blob([JSON.stringify(Object.keys(ef).length ? Object.assign({}, ST.doc, { eigeneFotos: ef }) : ST.doc)], { type: 'application/json' }), dateiname() + '.json'); melde(`Working file saved: ${dateiname()}.json. Open it again with «Open working file».`, 6000); return; }   // eigene Quittung (R10, zweite Abnahme 07.11.2026 Fund N9)
    if (ST.modus === 'text') textEnde();
    if (art !== 'png' && !(await pruefDialog(true))) return;
    const btn = $('#btnSpeichern'); btn.disabled = true;
    try {
      if (art === 'png') {
        const f = DS.FORMATE[ST.doc.formatKey], px = f.px ? f.px[0] : Math.round(ST.doc.format.b / 25.4 * 200);
        melde('Rendering the image …', 20000);
        laden(await DS.png(ST.M, ST.doc, ST.seite, px), dateiname() + (ST.doc.seiten.length > 1 ? '-s' + (ST.seite + 1) : '') + '.png');
        melde('Image saved.');
      } else {
        melde('Setting the PDF …', 60000);
        const { bytes, fehlend } = await DS.pdf(ST.M, ST.doc, { marken: art === 'marken', melde: t => melde(t, 60000) });
        laden(new Blob([bytes], { type: 'application/pdf' }), dateiname() + (art === 'marken' ? '-schnittmarken' : '') + '.pdf');
        melde(fehlend.length ? `PDF saved. These characters are missing in the house font and were left out: ${fehlend.join(' ')}` : `PDF saved: ${ST.doc.seiten.length} ${ST.doc.seiten.length === 1 ? 'page' : 'pages'}, ${(bytes.length / 1e6).toFixed(1)} MB.`, 6000);
      }
    } catch (x) { console.error(x); melde('Saving failed: ' + x.message, 8000); }
    finally { btn.disabled = false; }
  }

  /* ---------- Start ---------- */
  async function start() {
    const M = await DS.ladeMarke(HAUS);
    ST.M = M;
    document.title = `${M.werkzeug || 'Print Workshop'} · ${M.name}`;
    $('#kopfName').textContent = M.name;
    ['#kopfWerkzeug', '#leisteWerkzeug', '#msKopfWerkzeug'].forEach(s => { const e = $(s); if (e && M.werkzeug) e.textContent = M.werkzeug; });
    $('#kopfZeichen').innerHTML = DS.zeichenSvg(M, 'currentColor');
    $('#inselZeichen').innerHTML = DS.zeichenSvg(M, 'currentColor');
    $('#laderZeichen').innerHTML = `<span class="lader__a">${DS.zeichenSvg(M, 'currentColor')}</span><span class="lader__b">${DS.zeichenSvg(M, 'currentColor')}</span>`;   /* wie beim Buchen auf der Website: das Zeichen füllt sich von unten mit Gold */
    const opt = Object.entries(DS.FORMATE).map(([k, f]) => `<option value="${k}">${f.name} · ${f.art}</option>`).join('');
    $('#auftragFormat').innerHTML = '<option value="">The workshop picks one</option>' + opt;
    $('#vorlageFormat').innerHTML = opt; $('#vorlageFormat').value = 'rahmenh';
    $('#ideen').innerHTML = IDEEN.map(t => `<button>${esc(t)}</button>`).join('');
    $('#ideen').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { $('#auftrag').value = b.textContent; $('#auftrag').focus(); } });
    zeichneDna();
    await DS.eigene.laden(M);
    const docs = alleDocs();
    const akt = docs[fensterStueck()] || docs[lies(LS.aktuell, '')] || Object.values(docs).sort((a, b) => b.geaendert - a.geaendert)[0] || leer('a5h', true);
    rechtsEreignisse(); blattEreignisse(); linksEreignisse(); tasten();
    const fuenf = async () => {   /* Robert 11.10.2026: «immer fünf Vorschläge, ich wähle einen» */
      const text = $('#auftrag').value.trim();
      const r = await entwerfen({ varianten: true });
      if (r && r.docs && window.DSStart) DSStart.auswahl(r, text, fuenf);
    };
    $('#btnEntwerfen').addEventListener('click', fuenf);
    $('#auftrag').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) fuenf(); });
    $('#btnZurueck').addEventListener('click', zurueck); $('#btnVor').addEventListener('click', vor);
    $('#docName').addEventListener('change', e => { ST.doc.name = e.target.value.trim() || 'Piece'; e.target.title = ST.doc.name; speichern(); zeichneAblage(); });
    $('#kopfMarke').addEventListener('click', () => $('#btnNeu').click());
    $('#btnVerwerfen').addEventListener('click', verwerfen);
    $('#btnSpeichern').addEventListener('click', e => { e.stopPropagation(); $('#menueSpeichern').hidden = !$('#menueSpeichern').hidden; });
    $('#menueSpeichern').addEventListener('click', e => { const b = e.target.closest('[data-aus]'); if (b) ausgabe(b.dataset.aus); });
    document.addEventListener('click', e => { if (!e.target.closest('.ausgabe')) $('#menueSpeichern').hidden = true; });
    document.addEventListener('pointerdown', e => { if (ST.modus === 'text' && !e.target.closest('#wirt')) textEnde(); }, true);
    $('#btnPruefen').addEventListener('click', () => pruefDialog(false));
    $('#werkzeug').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.neu) { if (b.dataset.neu === 'bild') { zeigeTab('fotos'); ST.sel = null; zeichne(); melde('Click a photo or upload your own, it goes on the sheet.'); } else neuesElement(b.dataset.neu); }
      if (b.dataset.seite !== undefined) {
        if (ST.modus === 'text') textEnde();
        if (b.dataset.seite === 'neu' && sozial()) { DSIg.bildAnfuegen(); return; }
        if (b.dataset.seite === 'neu') { aendern(() => ST.doc.seiten.push(DS.setze(ST.M, ST.doc.formatKey, 'rueckseite', seite().quelle?.ton || 'dunkel', DS.BEISPIEL.rueckseite)), false); ST.seite = ST.doc.seiten.length - 1; }
        else ST.seite = +b.dataset.seite;
        ST.sel = null; ST.seitePanel = true; ST.auftritt = true; zeichne();
      }
    });
    $('#flaeche').addEventListener('pointerdown', e => { if (e.target.id === 'flaeche' && ST.sel && ST.modus !== 'text') { ST.sel = null; ST.modus = null; zeichne(); } });
    $('#zeigeHilfen').addEventListener('change', () => $('#wirt').classList.toggle('ohneHilfen', !$('#zeigeHilfen').checked));
    $('#zoomEin').addEventListener('click', () => { ST.zoom = Math.min(4, ST.zoom * 1.25); passeZoom(); zeichne(); });
    $('#zoomAus').addEventListener('click', () => { ST.zoom = Math.max(.3, ST.zoom / 1.25); passeZoom(); zeichne(); });
    /* Klick neben das Blatt schliesst das Seitenmenü «Gestalten» (16.10.2026) */
    $('#flaeche').addEventListener('pointerdown', e => { const w = $('#wirt').getBoundingClientRect(), imBlatt = !!e.__wirt || (e.clientX >= w.left && e.clientX <= w.right && e.clientY >= w.top && e.clientY <= w.bottom);
      if (!imBlatt && !e.target.closest('.ue, .griff, .werkzeug') && (ST.sel || ST.seitePanel)) { if (ST.modus === 'text') textEnde(); ST.sel = null; ST.seitePanel = false; ST.modus = null; zeichne(); } });
    let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { passeZoom(); zeichne(); gleiter(); }, 120); });
    /* Ändert sich die Fläche ohne Fenstergrösse (Werkzeugleiste, Seitenmenü, Schriften geladen), passt das Blatt neu hinein (Abnahme 06.11.2026, Funde 3 und 9) */
    /* Tippen im Feld «Content» und gleich Fenster zu oder neu laden: das Getippte wird noch gesichert (R13, Abnahme 06.11.2026 Fund 5B) */
    const sichereTippen = () => { if (ST.modus === 'text') textZwischen(); if (eTextVor && ST.doc) { clearTimeout(eTextT); speichern(); } };
    addEventListener('pagehide', sichereTippen); addEventListener('beforeunload', sichereTippen); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sichereTippen(); });
    if (window.ResizeObserver) { let rG = ''; new ResizeObserver(() => { const fl = $('#flaeche'), g = fl.clientWidth + 'x' + fl.clientHeight; if (g === rG || !ST.doc) return; rG = g; clearTimeout(rT); rT = setTimeout(() => { passeZoom(); zeichne(); }, 60); }).observe($('#flaeche')); }
    document.fonts.ready.then(gleiter); setTimeout(gleiter, 400);
    oeffne(akt);
    window.__ST = ST;
    window.DSStudio = { oeffne, entwerfen, leer, alleDocs, miniBox, zeigeTab, doc: () => ST.doc,
      dialog, melde, haus: HAUS, laden, dateiname, textEnde,
      seiteNr: () => ST.seite, aendern, neues: neuesElement,
      tauscheFoto(key) { const el = ST.sel && elById(ST.sel); if (el && el.typ === 'bild') aendern(() => { el.bild = key; el.fx = .5; el.fy = .5; setzeSlot(seite(), el.slot, key); }, false); }, sel: () => ST.sel && elById(ST.sel), seite: () => seite(), massstab: () => ST.S, waehle(id) { ST.sel = id; zeichne(); }, speichern: () => speichern(),
      zeigeSeite(i) { ST.seite = Math.max(0, Math.min(i, ST.doc.seiten.length - 1)); ST.sel = null; ST.auftritt = true; zeichne(); },
      neuZeichnen: () => zeichne(),
      lader(text, zeilen) {
        const lader = $('#lader'), fl = $('#flaeche').getBoundingClientRect();
        Object.assign(lader.style, { left: fl.left + 'px', top: fl.top + 'px', width: fl.width + 'px', height: fl.height + 'px' });
        $('#laderText').textContent = text; let zi = 0; $('#laderZeile').textContent = zeilen[0]; lader.hidden = false;
        const uhr = setInterval(() => { const z = $('#laderZeile'); z.style.opacity = 0; setTimeout(() => { zi = (zi + 1) % zeilen.length; z.textContent = zeilen[zi]; z.style.opacity = 1; }, 450); }, 3000);
        return () => { clearInterval(uhr); lader.hidden = true; };
      },
      umbenennen(id, name) { const d = alleDocs(); if (!d[id]) return; d[id].name = name; schreib(LS.docs, d); if (ST.doc && ST.doc.id === id) { ST.doc.name = name; $('#docName').value = name; $('#docName').title = name; } },
      kopie(id) { const d = alleDocs(); const k = JSON.parse(JSON.stringify(d[id])); k.id = 'd' + Date.now().toString(36); k.name += ' (copy)'; k.geaendert = Date.now(); d[k.id] = k; schreib(LS.docs, d); return k; },
      loeschen(id) { const d = alleDocs(); delete d[id]; schreib(LS.docs, d); if (ST.doc && ST.doc.id === id) oeffne(leer('a5h', true)); zeichneAblage(); },
      zeigeHinweise(l) { const h = $('#entwurfHinweise'); if (!l || !l.length) { h.hidden = true; return; } h.hidden = false; h.innerHTML = `<b>Please check</b><ul>${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; zeigeTab('entwerfen'); } };
    document.dispatchEvent(new Event('ds:bereit'));
  }
  start().catch(e => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<div class="meldung">The workshop could not start: ${esc(e.message)}</div>`); });
})();
