/* L’Imprimerie · Le Livre im Haus (Robert 12.10.2026: «von L’Imprimerie aus auf Le Livre zugreifen, ich arbeite ja mit meinen Visuals in L’Imprimerie»).
   1. Startseite: eigener Punkt «Le Livre» (und runde Taste oben) mit Bildarchiv, Logo und Dateien, Farben zum Kopieren.
   2. Editor: Fach «Le Livre» neben den Werkzeugen. Foto, Logo, Wortmarke, Zeichen, Tapete per Klick einsetzen oder aufs Blatt ziehen;
      Farbe per Klick auf das gewählte Element (sonst auf den Grund der Seite).
   3. «Mit Le Livre prüfen»: die Seite als Bild an die Markenprüfung von Le Livre (/marke/api/pruefen), Ergebnis neben dem Blatt.
   Daten: DS.M.livre (satz.js lädt /marke/livre.json). Ohne Le Livre bleibt alles verborgen. */
(function () {
  const DS = window.DS;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = () => window.DSStudio;
  const T = () => DS.LIVRE_TEXT;
  const TYP = 'application/x-ds-livre';
  const IC = {
    buch: '<svg viewBox="0 0 24 24"><path d="M4 5.5c2.6-1 5.2-.8 8 1 2.8-1.8 5.4-2 8-1v13c-2.6-1-5.2-.8-8 1-2.8-1.8-5.4-2-8-1z"/><path d="M12 6.5v13"/></svg>',
    zu: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    pruef: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
    kopie: '<svg viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></svg>',
    ab: '<svg viewBox="0 0 24 24"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
    pfeil: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  };
  const ZEICHEN_N = { gold: 'Gold', taupe: 'Taupe', tinte: 'Ink', weiss: 'White' };
  const NAME = { zeichen: 'Logo mark', wortmarke: 'Wordmark', logo: 'Logo', quer: 'Logo landscape', tapete: 'Grid' };
  const L = () => DS.M && DS.M.livre;
  async function kopiere(t) { try { await navigator.clipboard.writeText(t); } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } }
  const melde = (t, ms) => S() && S().melde(t, ms);

  /* ================= Startseite: Le Livre als eigene Ansicht ================= */
  let reiter = 'bilder';
  function ansicht() {
    const box = $('#msLivre'); if (!box || !L()) return;
    if (!box.dataset.gebaut) {
      box.dataset.gebaut = 1;
      box.innerHTML = `<div class="ms-titel"><h1>Brand book</h1><span class="ms-leise">The brand book of txtme.social, here in the Print Workshop: photos, logo and files, colours. It is the same source as the brand book itself.</span></div>
        <div class="ll-kopf"><div class="ms-chips ll-reiter">${[['bilder', 'Photo archive'], ['dateien', 'Logo and files'], ['farben', 'Colours']].map(([k, t]) => `<button data-llreiter="${k}">${t}</button>`).join('')}</div>
          <a class="ms-lnk" href="${DS.livreSeite()}" target="_blank" rel="noopener"><span>Open the brand book</span>${IC.pfeil}</a></div>
        <div class="ll-fach" data-llfach="bilder"><div id="llBilderPlatz"></div></div>
        <div class="ll-fach" data-llfach="dateien">${dateienHtml()}</div>
        <div class="ll-fach" data-llfach="farben"><p class="ms-leise ll-satz">One click copies the colour value. In a piece, the «Brand book» tray in the editor puts the colour straight on the selected element.</p><div class="ll-farben">${L().farben.map((c, i) => `<button class="ll-farbe" data-hex="${c.h}" style="--i:${i}"><i style="background:${c.h}"></i><b>${esc(c.n)}</b><code>${esc(c.h)}</code><small>${esc(c.r || '')}</small><span class="ll-kopiert">Copied</span></button>`).join('')}</div></div>`;
      box.addEventListener('click', klickAnsicht);
    }
    zeigeReiter(reiter);
  }
  function dateienHtml() {
    return `<p class="ms-leise ll-satz">To download as SVG (for printers and agencies) or PNG (for Office and mail). In a piece, the «Brand book» tray in the editor puts logo, wordmark and mark straight on the sheet.</p>
      <div class="ll-dateien">${L().dateien.filter(d => d.var && d.var.length).map(d => d.var.map(v => {
        const svg = v.dateien.find(x => x.endsWith('.svg')), png = v.dateien.find(x => x.endsWith('.png')), webp = v.dateien.find(x => x.endsWith('.webp'));
        const bild = d.k === 'tapete' ? `<span class="ll-d__f ll-d__f--${v.grund}" style="background-image:url('/marke/dateien/${webp || png}')"></span>` : `<span class="ll-d__f ll-d__f--${v.grund}"><img src="/marke/dateien/${svg || png}" alt="" loading="lazy" decoding="async"></span>`;
        return `<figure class="ll-d">${bild}<figcaption><b>${esc(NAME[d.k] || d.k)}</b><small>${esc(ZEICHEN_N[v.k] || ({ hell: 'for light grounds', dunkel: 'for dark grounds' }[v.k]) || v.k)}</small>
          <span class="ll-d__l">${v.dateien.map(x => `<a href="/marke/dateien/${x}" download>${x.split('.').pop().toUpperCase()}${IC.ab}</a>`).join('')}</span></figcaption></figure>`;
      }).join('')).join('')}</div>`;
  }
  function zeigeReiter(k) {
    reiter = k;
    $$('#msLivre [data-llreiter]').forEach(b => b.classList.toggle('an', b.dataset.llreiter === k));
    $$('#msLivre [data-llfach]').forEach(f => f.hidden = f.dataset.llfach !== k);
    const platz = $('#llBilderPlatz');
    if (k === 'bilder' && platz && !platz.contains($('#fotoRaster'))) { platz.appendChild($('#fotoGruppen')); platz.appendChild($('#fotoRaster')); }
  }
  // Das Bildarchiv ist dasselbe Raster wie «Fotos des Hauses»: es wird nur hin- und hergereicht, nie doppelt gebaut
  function bilderZurueck() { const z = $('#msFotos'); if (z && !z.contains($('#fotoRaster'))) { z.appendChild($('#fotoGruppen')); z.appendChild($('#fotoRaster')); } }
  async function klickAnsicht(e) {
    const r = e.target.closest('[data-llreiter]'); if (r) return zeigeReiter(r.dataset.llreiter);
    const f = e.target.closest('[data-hex]');
    if (f) { await kopiere(f.dataset.hex); f.classList.add('kopiert'); setTimeout(() => f.classList.remove('kopiert'), 1400); melde(`${f.querySelector('b').textContent} ${f.dataset.hex} copied.`); }
  }

  /* ================= Editor: Fach «Le Livre» neben den Werkzeugen ================= */
  let fach = null, fachReiter = 'fotos', fGruppe = 'alle', fHerkunft = 'alle';
  function fachAuf(an) {
    if (!L()) return;
    if (an === undefined) an = !fach || fach.hidden;
    if (!fach) baueFach();
    fach.hidden = !an;
    $$('[data-livre]').forEach(b => b.classList.toggle('an', an));
    if (an) { requestAnimationFrame(() => fach.classList.add('auf')); zeichneFach(); } else fach.classList.remove('auf');
  }
  function baueFach() {
    fach = document.createElement('aside'); fach.className = 'lf'; fach.hidden = true; fach.setAttribute('aria-label', 'Le Livre');
    fach.innerHTML = `<div class="lf__kopf"><span class="lf__z">${DS.zeichenSvg(DS.M, 'currentColor')}</span><div><b>Brand book</b><small>Click to place, drag to drop</small></div><button class="rund rund--klein" data-lf="zu" aria-label="Close the tray">${IC.zu}</button></div>
      <div class="segment segment--klein lf__reiter">${[['fotos', 'Photos'], ['marke', 'Logo & mark'], ['farben', 'Colours']].map(([k, t]) => `<button data-lfreiter="${k}">${t}</button>`).join('')}</div>
      <div class="lf__in" id="lfIn"></div>
      <div class="lf__fuss"><button class="kn knopf--voll glanz-kn lf__pruef" data-lf="pruefen"><span>Check against the brand book</span><i>${IC.pruef}</i></button><small>The check uses the AI. The workshop asks first.</small></div>`;
    $('.studio').appendChild(fach);   // liegt über der linken Spalte, das Blatt bleibt frei
    fach.addEventListener('click', klickFach);
    fach.addEventListener('input', e => { if (e.target.id === 'lfSuche') { clearTimeout(fach._t); fach._t = setTimeout(zeichneFotos, 140); } });
    fach.addEventListener('dragstart', e => {
      const q = e.target.closest('[data-zieh]'); if (!q) return;
      e.dataTransfer.setData(TYP, q.dataset.zieh); e.dataTransfer.effectAllowed = 'copy';
      const img = q.querySelector('img'); if (img) e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    });
  }
  function zeichneFach() {
    $$('.lf [data-lfreiter]').forEach(b => b.classList.toggle('an', b.dataset.lfreiter === fachReiter));
    const box = $('#lfIn'), M = DS.M;
    if (fachReiter === 'fotos') {
      const B = M.bilder.filter(b => !b.eigen), gr = Object.entries(T().b).filter(([, g]) => B.some(b => b.gruppe === g));
      box.innerHTML = `<input type="search" id="lfSuche" placeholder="Search: night, crowd, shirt …" autocomplete="off">
        <div class="lf__chips">${[['alle', 'All'], ...gr.map(([, g]) => [g, g])].map(([k, t]) => `<button data-lfgruppe="${esc(k)}" class="${fGruppe === k ? 'an' : ''}">${esc(t)}</button>`).join('')}</div>
        <div class="lf__chips lf__chips--leise">${[['alle', 'Any source'], ...Object.entries(T().h)].map(([k, t]) => `<button data-lfherkunft="${k}" class="${fHerkunft === k ? 'an' : ''}">${esc(t)}</button>`).join('')}</div>
        <div class="lf__fotos" id="lfFotos"></div>`;
      zeichneFotos();
    } else if (fachReiter === 'marke') {
      const D = L().dateien, Z = D.find(d => d.k === 'zeichen'), tap = D.find(d => d.k === 'tapete');
      const dateien = DS.livreDateien(M);
      box.innerHTML = `<h4>Logo mark</h4><div class="lf__marke">${(Z ? Z.var : []).map(v => `<button class="lf__m lf__m--${v.grund}" data-lfzeichen="${v.farbe}" draggable="true" data-zieh='${JSON.stringify({ art: 'zeichen', farbe: v.farbe })}' title="Logo mark in ${esc(ZEICHEN_N[v.k] || v.k)}"><img src="/marke/dateien/${v.dateien[0]}" alt="" draggable="false"><small>${esc(ZEICHEN_N[v.k] || v.k)}</small></button>`).join('')}</div>
        <h4>Logo and wordmark</h4><div class="lf__marke lf__marke--breit">${dateien.map(d => `<button class="lf__m lf__m--${d.grund}" data-lfbild="${d.key}" draggable="true" data-zieh='${JSON.stringify({ art: 'bild', key: d.key })}' title="${esc(d.alt)}"><img src="${d.miniUrl}" alt="" draggable="false"><small>${esc(d.alt)}</small></button>`).join('')}</div>
        <h4>Grid</h4><div class="lf__marke">${(tap ? tap.var : []).map(v => `<button class="lf__m lf__m--${v.grund} lf__m--tapete" data-lftapete="${v.k}" draggable="true" data-zieh='${JSON.stringify({ art: 'tapete', tapete: v.k })}' style="--t:url('/marke/dateien/${v.dateien.find(x => x.endsWith('.webp')) || v.dateien[0]}')"><span></span><small>${v.k === 'dunkel' ? 'Dark' : 'Light'}</small></button>`).join('')}</div>
        <p class="lf__satz">The grid goes on the selected area, otherwise on the ground of the page.</p>`;
    } else {
      box.innerHTML = `<p class="lf__satz">One click puts the colour on the selected element: text, rule, frame, logo or area. If nothing is selected, it becomes the ground of the page.</p>
        <div class="lf__farben">${L().farben.map(c => `<button class="lf__farbe" data-lffarbe="${c.h}" title="${esc(c.r || '')}"><i style="background:${c.h}"></i><b>${esc(c.n)}</b><code>${esc(c.h)}</code><span class="lf__kopie" data-lfkopie="${c.h}" role="button" aria-label="Copy colour value">${IC.kopie}</span></button>`).join('')}</div>`;
    }
  }
  function zeichneFotos() {
    const box = $('#lfFotos'); if (!box) return;
    const q = (($('#lfSuche') || {}).value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const l = DS.M.bilder.filter(b => !b.eigen && (fGruppe === 'alle' || b.gruppe === fGruppe) && (fHerkunft === 'alle' || b.herkunft === fHerkunft)
      && q.every(w => (b.alt + ' ' + b.key + ' ' + b.gruppe + ' ' + (T().s[b.saison] || '')).toLowerCase().includes(w)));
    box.innerHTML = l.length ? l.map(b => `<button class="lf__foto" data-lfbild="${b.key}" draggable="true" data-zieh='${JSON.stringify({ art: 'bild', key: b.key })}' title="${esc(b.alt)}"><img src="${DS.bildUrl(DS.M, b.key, true)}" alt="${esc(b.alt)}" loading="lazy" decoding="async" draggable="false">${b.ki ? '<b class="foto__ki">KI</b>' : ''}</button>`).join('')
      : '<p class="lf__satz">No photo matches.</p>';
  }
  function einsetzen(d, an) {
    const st = S(), el = st.sel(), s = st.seite();
    if (d.art === 'bild') {
      if (!an && el && el.typ === 'bild' && !DS.M.bildIndex[d.key]?.datei && !DS.M.bildIndex[el.bild]?.datei) { st.tauscheFoto(d.key); melde('Photo replaced.'); }
      else st.neues('bild', d.key, an);
    } else if (d.art === 'zeichen') {
      if (!an && el && el.typ === 'zeichen') st.aendern(() => { el.farbe = d.farbe; });
      else { st.neues('zeichen', null, an); const z = st.sel(); if (z && z.typ === 'zeichen') st.aendern(() => { z.farbe = d.farbe; }); }
    } else if (d.art === 'tapete') {
      if (el && el.typ === 'flaeche' && !an) { st.aendern(() => { el.tapete = d.tapete; }); melde('Grid placed on the area.'); }
      else { st.aendern(() => { s.tapete = d.tapete; }, false); melde(`${d.tapete === 'dunkel' ? 'Dark' : 'Light'} grid on the page.`); }
    }
  }
  function farbeLegen(hex) {
    const st = S(), el = st.sel(), c = L().farben.find(x => x.h === hex), n = c ? c.n : hex;
    if (el && ['text', 'linie', 'rahmen', 'zeichen', 'flaeche'].includes(el.typ)) { st.aendern(() => { el.farbe = hex; }); melde(`${n} is now on ${el.typ === 'text' ? '«' + el.text.slice(0, 24) + (el.text.length > 24 ? '…' : '') + '»' : { linie: 'the rule', rahmen: 'the frame', zeichen: 'the logo', flaeche: 'the area' }[el.typ]}.`); }
    else if (el && el.typ === 'bild') melde('A photo has no colour. Please select text, a rule, a frame, the logo or an area.');
    else { st.aendern(() => { st.seite().grund = hex; }, false); melde(`${n} is now the ground of the page.`); }
  }
  async function klickFach(e) {
    const b = e.target.closest('button,[data-lfkopie]'); if (!b) return;
    if (b.dataset.lf === 'zu') return fachAuf(false);
    if (b.dataset.lf === 'pruefen') return pruefen();
    if (b.dataset.lfreiter) { fachReiter = b.dataset.lfreiter; return zeichneFach(); }
    if (b.dataset.lfgruppe) { fGruppe = b.dataset.lfgruppe; $$('.lf [data-lfgruppe]').forEach(x => x.classList.toggle('an', x === b)); return zeichneFotos(); }
    if (b.dataset.lfherkunft) { fHerkunft = b.dataset.lfherkunft; $$('.lf [data-lfherkunft]').forEach(x => x.classList.toggle('an', x === b)); return zeichneFotos(); }
    if (b.dataset.lfkopie) { e.stopPropagation(); await kopiere(b.dataset.lfkopie); return melde(b.dataset.lfkopie + ' copied.'); }
    if (b.dataset.lffarbe) return farbeLegen(b.dataset.lffarbe);
    if (b.dataset.lfbild) return einsetzen({ art: 'bild', key: b.dataset.lfbild });
    if (b.dataset.lfzeichen) return einsetzen({ art: 'zeichen', farbe: b.dataset.lfzeichen });
    if (b.dataset.lftapete) return einsetzen({ art: 'tapete', tapete: b.dataset.lftapete });
  }
  // Ablegen auf dem Blatt: Stelle in mm aus der Mausposition
  function ablage() {
    const fl = $('#flaeche');
    fl.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes(TYP)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; fl.classList.add('ablegen'); } });
    fl.addEventListener('drop', e => {
      if (![...e.dataTransfer.types].includes(TYP)) return;
      e.preventDefault(); e.stopImmediatePropagation(); fl.classList.remove('ablegen');
      let d; try { d = JSON.parse(e.dataTransfer.getData(TYP)); } catch (x) { return; }
      const r = $('#wirt').getBoundingClientRect(), Sk = S().massstab(), f = S().doc().format;
      const an = { x: Math.max(0, Math.min(f.b, (e.clientX - r.left) / Sk - DS.B)), y: Math.max(0, Math.min(f.h, (e.clientY - r.top) / Sk - DS.B)) };
      einsetzen(d, an);
    }, true);
  }

  /* ================= Markenprüfung aus L’Imprimerie ================= */
  let platte = null;
  async function pruefen() {
    const st = S(), doc = st.doc();
    const ja = await st.dialog(`<h2>Check against the brand book</h2>
      <p class="leise">The check uses the AI (Claude). An image of this page goes to the brand check of the brand book: the brand book measures the colours itself, the AI judges image, type, logo, spacing and tone by the rules of the brand book. Nothing is stored. It takes about half a minute.</p>`,
      [{ t: 'Cancel', v: false }, { t: 'Check now', v: true, haupt: true }]);
    if (!ja) return;
    if (st.textEnde) st.textEnde();
    const stopp = st.lader('The brand book is checking', ['Rendering the page as an image', 'Measuring colours against the palette', 'Judging image, type and logo', 'Reading spacing and tone', 'Putting the result together']);
    try {
      const blob = await DS.png(DS.M, doc, st.seiteNr(), 1400);
      const daten = await new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = nein; r.readAsDataURL(blob); });
      const r = await fetch('/marke/api/pruefen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: (doc.name || 'Entwurf') + '.png', typ: 'image/png', daten, sprache: 'de' }) });
      let j = {}; try { j = await r.json(); } catch (x) { /* leer */ }
      if (!r.ok) throw new Error(String(j.fehler || ('Error ' + r.status)).replace(/^[A-ZÄÖÜ]+ · /, ''));
      zeigeErgebnis(j);
    } catch (x) { st.melde('The check did not work: ' + (/failed to fetch|load failed|networkerror/i.test(x.message) ? 'the brand book cannot be reached.' : x.message), 8000); }
    finally { stopp(); }
  }
  const URTEIL = { passt: 'fits', achten: 'watch', passt_nicht: 'does not fit' };
  const TON = { gleich: 'same', nah: 'close', fremd: 'foreign' };
  const BEREICH = { farben: 'Colours', schrift: 'Type', zeichen: 'Logo', abstand: 'Spacing', bild: 'Image', ton: 'Tone' };
  function zeigeErgebnis(j) {
    const m = j.messung || { toene: [] }, k = j.ki || {}, pr = x => Math.round((x || 0) * 100);
    const reihe = { passt_nicht: 0, achten: 1, passt: 2 };
    const punkte = (k.punkte || []).slice().sort((a, b) => (reihe[a.urteil] ?? 1) - (reihe[b.urteil] ?? 1));
    const sonder = [m.schwarz > .01 ? `Pure black on ${pr(m.schwarz)} % of the area.` : '', m.tuerkis > .01 ? `Turquoise on ${pr(m.tuerkis)} % of the area.` : '', m.rot > .02 ? `Red on ${pr(m.rot)} % of the area, use sparingly.` : ''].filter(Boolean);
    if (!platte) { platte = document.createElement('aside'); platte.className = 'lp'; $('.studio').appendChild(platte); platte.addEventListener('click', e => { const b = e.target.closest('[data-lp]'); if (!b) return; if (b.dataset.lp === 'zu') platte.hidden = true; if (b.dataset.lp === 'nochmal') pruefen(); }); }
    const zahl = { passt: 0, achten: 0, passt_nicht: 0 }; punkte.forEach(p => zahl[p.urteil] = (zahl[p.urteil] || 0) + 1);
    platte.innerHTML = `<div class="lp__kopf"><div><p class="mono">Brand check · Brand book${k.art ? ' · ' + esc(k.art) : ''}</p><h3>Result</h3></div><button class="rund rund--klein" data-lp="zu" aria-label="Close">${IC.zu}</button></div>
      ${j.ki_fehler ? `<p class="lp__hinweis">The AI could not check (${esc(j.ki_fehler)}). The colour measurement is below.</p>` : `<p class="lp__gesamt">${esc(k.gesamt || '')}</p>
      <div class="lp__zahlen">${['passt_nicht', 'achten', 'passt'].map(u => `<span class="lp__z lp__z--${u}"><b>${zahl[u] || 0}</b>${URTEIL[u]}</span>`).join('')}</div>
      <ol class="lp__punkte">${punkte.map((p, i) => `<li class="lp__p lp__p--${esc(p.urteil)}" style="--i:${i}"><span class="lp__m"><em>${esc(URTEIL[p.urteil] || p.urteil)}</em><small>${esc(BEREICH[p.bereich] || p.bereich)}</small></span><span><b>${esc(p.titel)}</b>${esc(p.text)}</span></li>`).join('')}</ol>
      ${(k.ton || []).filter(x => x.stelle && x.vorschlag).length ? `<h4>Suggestions for the text</h4><ul class="lp__ton">${k.ton.filter(x => x.stelle && x.vorschlag).map(x => `<li><s>${esc(x.stelle)}</s><span>${esc(x.vorschlag)}</span></li>`).join('')}</ul>` : ''}`}
      <h4>Farben, gemessen</h4><p class="lp__rahmen"><span><i style="width:${pr(m.im_rahmen)}%"></i></span>${pr(m.im_rahmen)} % of the area in the house colours</p>
      <ol class="lp__toene">${(m.toene || []).slice(0, 6).map(x => `<li class="lp__t lp__t--${x.urteil}"><i style="background:${x.hex}"></i><b>${x.hex.toUpperCase()}</b><small>${x.anteil < .01 ? '<1' : pr(x.anteil)} % · nearest house colour ${esc(x.name)}, ΔE ${String(x.de)}</small><em>${TON[x.urteil] || x.urteil}</em></li>`).join('')}</ol>
      ${sonder.length ? `<ul class="lp__sonder">${sonder.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <button class="kn kn--klein kn--ohne lp__nochmal" data-lp="nochmal"><span>Check again</span></button>`;
    platte.hidden = false; platte.classList.remove('auf'); void platte.offsetWidth; platte.classList.add('auf');
  }

  /* ================= Start ================= */
  function los() {
    if (!L()) { $$('[data-livre],[data-ansicht="livre"]').forEach(b => b.hidden = true); return; }
    document.addEventListener('click', e => { const b = e.target.closest('#werkzeug [data-livre], .kopf [data-livre]'); if (b) fachAuf(); });
    ablage();
  }
  window.DSLivre = { ansicht, bilderZurueck, fachAuf, pruefen, zeigeErgebnis };
  if (window.DSStudio) los(); else document.addEventListener('ds:bereit', los, { once: true });
})();
