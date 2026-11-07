/* Drucksachen-Studio · Hilfe: Begrüssung beim ersten Besuch, Führung Schritt für Schritt am echten Studio,
   Demo-Video mit Kapiteln, Tastenkürzel. Alles jederzeit über «Hilfe» oben wieder aufrufbar. */
(function () {
  const $ = s => document.querySelector(s);
  const HAUS = new URLSearchParams(location.search).get('haus') || 'txtme';
  const GESEHEN = `ds-${HAUS}-willkommen`;
  const merk = () => { try { localStorage.setItem(GESEHEN, '1'); } catch (e) { } };
  const gesehen = () => { try { return localStorage.getItem(GESEHEN) === '1'; } catch (e) { return true; } };
  const tab = t => { const b = document.querySelector(`.reiter [data-tab="${t}"]`); if (b) b.click(); };
  const PFEIL = '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>';
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>';

  /* ---------- Schritte der Führung ---------- */
  const SCHRITTE = [
    { ziel: '#btnNeu', film: 'schritt-neu', titel: 'Overview and new piece',
      text: 'Through «Overview» you get to the start page. There lie all your pieces to open, rename, copy or save as PDF. At the top you describe in one line what should be made, and the workshop lays out five drafts. You take the one you like.' },
    { ziel: '#auftrag', film: 'schritt-1', vor: () => tab('entwerfen'), titel: 'Say what you need',
      text: 'Write here in one line which piece should be made, for example «A photo frame for the RKN night». Colours, fonts, photos and the details of the house the workshop already knows. Demo: the AI is off, the drafts come from the templates.',
      extra: { t: 'Insert example', tu: () => { $('#auftrag').value = 'A photo frame for the RKN night, portrait, with the date and the venue'; } } },
    { ziel: '#btnEntwerfen', film: 'schritt-2', titel: 'Five drafts, one wins',
      text: 'One click, and five drafts stand side by side: same details, different design. You click the best one and keep working in it. If none fits, you get five new ones.' },
    { ziel: '#wirt', film: 'schritt-3', titel: 'The sheet',
      text: 'Here lies your piece. One click selects a part, with the mouse held down you move it. Double-click a text and you write straight into it. The dark edge is the bleed: what lies there, the printer cuts off.' },
    { ziel: '#rechts', film: 'schritt-4', titel: 'Adjust',
      text: 'On the right you change what you selected: font, size, colour or the photo. With nothing selected you switch the format and the layout of the whole page here. There are only the colours and fonts of the house, so everything stays in the brand.' },
    { ziel: '#werkzeug', film: 'schritt-5', titel: 'Add something',
      text: 'A new title, a text, a photo, the logo of the house or a rule: one click and it lies on the sheet. At the top right of this bar you switch between front and back.' },
    { ziel: '.reiter', film: 'schritt-6', titel: 'Templates, photos and library',
      text: 'Under «Photos» lie all images of the house, sorted by group, plus your own: upload or simply drop them on the sheet. Under «Templates» you find ready layouts, in the «Library» everything you made. Everything is saved in this browser.' },
    { ziel: '#btnZurueck', film: 'schritt-7', titel: 'One step back',
      text: 'Something slipped or got deleted? This arrow takes the last step back, the one next to it brings it back. On the keyboard that is ⌘ Z.' },
    { ziel: '#btnPruefen', film: 'schritt-8', titel: 'The print check',
      text: 'The workshop checks for you whether everything is ready to print: open gaps like [Date], text too close to the edge, photos that would print soft. A zero here means all is fine. One click shows what is missing.' },
    { ziel: '#btnSpeichern', film: 'schritt-9', titel: 'Save print-ready',
      text: 'Finally you save the piece as a PDF for the printer. Bleed, fonts and photos are set right already, you just pass the file on. Stickers come trimmed to the ink with the cut contour; for Instagram there is an image too.' },
  ];

  /* ---------- Begrüssung ---------- */
  function willkommen() {
    const M = window.DS && DS.M;
    schicht(`<div class="hk hk--gross" role="dialog" aria-modal="true" aria-label="Welcome">
      <div class="hk__zeichen">${M ? DS.zeichenSvg(M, 'currentColor') : ''}</div>
      <h2>Welcome to the ${M && M.werkzeug ? M.werkzeug : 'Print Workshop'}</h2>
      <p class="hk__unter">Photo frames, stickers, tickets, posters and posts in the style of ${M ? M.name : 'the house'}, without any design software.</p>
      <div class="hk__drei">
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M10 34h28M10 26h20M10 18h28"/><path d="m33 30 7-7 3 3-7 7-4 1z"/></svg></span><b>Say</b><p>Describe in one line what you need.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="6" y="14" width="10" height="14" rx="1.5"/><rect x="19" y="10" width="10" height="14" rx="1.5"/><rect x="32" y="14" width="10" height="14" rx="1.5"/><path d="m20 33 4 4 7-8"/></svg></span><b>Choose</b><p>Five drafts in the style of the house, you take the best one.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="11" y="8" width="26" height="34" rx="2"/><path d="M17 16h14M17 22h10"/><path d="m27 30 9 3-4 1.5-1.5 4z"/></svg></span><b>Adjust</b><p>Change texts, photos and format on the sheet.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M14 18V8h20v10"/><rect x="8" y="18" width="32" height="14" rx="3"/><path d="M14 28h20v12H14z"/><path d="M19 33h10M19 37h6"/></svg></span><b>Print</b><p>Save as PDF and hand it to the printer.</p></div>
      </div>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="fuehrung">Start the short tour${PFEIL}</button>
        <button class="hk__video" data-hk="video">${PLAY}<span>Watch the demo video</span></button>
      </div>
      <button class="hk__leise" data-hk="los">Start right away</button>
    </div>`, true);
    merk();
  }

  /* ---------- Schicht (Hintergrund + Karte) ---------- */
  let ebene;
  function schicht(html, dunkel) {
    zu();
    ebene = document.createElement('div');
    ebene.className = 'hs' + (dunkel ? ' hs--dunkel' : '');
    ebene.innerHTML = html;
    document.body.appendChild(ebene);
    ebene.addEventListener('click', klick);
    requestAnimationFrame(() => ebene && ebene.classList.add('an'));
    return ebene;
  }
  function zu() {
    if (ebene) { ebene.remove(); ebene = null; }
    removeEventListener('resize', setze); document.removeEventListener('keydown', taste);
  }
  function klick(e) {
    const b = e.target.closest('[data-hk]'); if (!b) return;
    const a = b.dataset.hk;
    if (a === 'fuehrung') { if (window.DSStart) DSStart.zu(); starte(0); }
    else if (a === 'video') video();
    else if (a === 'los' || a === 'zu') {
      zu(); tab('entwerfen');
      if (window.DSStart && !DSStart.offen() && window.DSStudio && DSStudio.doc().platzhalter) DSStart.zeige();   // noch nichts begonnen: zur Auswahl
    }
    else if (a === 'weiter') starte(nr + 1);
    else if (a === 'zurueck') starte(nr - 1);
    else if (a === 'extra') { SCHRITTE[nr].extra.tu(); b.textContent = 'Inserted'; b.disabled = true; }
    else if (a === 'kapitel') { const v = ebene.querySelector('video'); v.currentTime = +b.dataset.t; v.play(); }
  }

  /* ---------- Führung ---------- */
  let nr = 0;
  function starte(i) {
    if (i >= SCHRITTE.length) return ende();
    nr = Math.max(0, i);
    const s = SCHRITTE[nr];
    if (s.vor) s.vor();
    if (!ebene || !ebene.classList.contains('hs--tour')) {
      schicht(`<div class="hs__loch"></div><div class="hk hk--tour" role="dialog" aria-live="polite"></div>`);
      ebene.classList.add('hs--tour');
      addEventListener('resize', setze); document.addEventListener('keydown', taste);
    }
    const k = ebene.querySelector('.hk--tour');
    const film = `hilfe/${s.film}`;
    k.innerHTML = `<div class="hk__film"><video src="${film}.mp4" poster="${film}.jpg" autoplay muted loop playsinline preload="auto"></video></div>
      <div class="hk__fort"><span style="width:${(nr + 1) / SCHRITTE.length * 100}%"></span></div>
      <small>Step ${nr + 1} of ${SCHRITTE.length}</small>
      <h3>${s.titel}</h3><p>${s.text}</p>
      ${s.extra ? `<button class="leicht hk__extra" data-hk="extra">${s.extra.t}</button>` : ''}
      <div class="hk__nav">
        <button class="hk__leise" data-hk="zu">End</button>
        <span></span>
        ${nr ? '<button class="leicht" data-hk="zurueck">Back</button>' : ''}
        <button class="knopf" data-hk="weiter">${nr === SCHRITTE.length - 1 ? 'Done' : 'Next'}${PFEIL}</button>
      </div>`;
    const v = k.querySelector('video');
    v.addEventListener('error', () => k.querySelector('.hk__film').remove());
    v.addEventListener('loadedmetadata', setze);
    v.play().catch(() => { });
    k.querySelector('.hk__film').addEventListener('click', () => v.paused ? v.play() : v.pause());
    setze();
    k.querySelector('[data-hk="weiter"]').focus({ preventScroll: true });
  }
  function setze() {
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    const s = SCHRITTE[nr], z = document.querySelector(s.ziel);
    const loch = ebene.querySelector('.hs__loch'), k = ebene.querySelector('.hk--tour');
    if (!z) { loch.style.cssText = 'left:50%;top:50%;width:0;height:0'; return; }
    z.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = z.getBoundingClientRect(), p = 8, vw = innerWidth, vh = innerHeight;
    const L = Math.max(4, r.left - p), T = Math.max(4, r.top - p), W = Math.min(vw - 8, r.width + 2 * p), H = Math.min(vh - 8, r.height + 2 * p);
    Object.assign(loch.style, { left: L + 'px', top: T + 'px', width: W + 'px', height: H + 'px' });
    const kw = Math.min(460, vw - 32), kh = k.offsetHeight, g = 18;
    let x, y;
    if (r.top < 90 && vh - (T + H) > kh + g + 16) { x = L + W - kw; y = T + H + g; }   // Knöpfe oben: darunter
    else if (vw - (L + W) > kw + g + 16) { x = L + W + g; y = T; }         // rechts daneben
    else if (L > kw + g + 16) { x = L - kw - g; y = T; }                  // links daneben
    else if (vh - (T + H) > kh + g + 16) { x = L; y = T + H + g; }        // darunter
    else { x = L; y = T - kh - g; }                                       // darüber
    x = Math.min(Math.max(16, x), vw - kw - 16); y = Math.min(Math.max(16, y), vh - kh - 16);
    Object.assign(k.style, { left: x + 'px', top: y + 'px', width: kw + 'px' });
  }
  function taste(e) {
    if (e.key === 'Escape') { zu(); return; }
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); starte(nr + 1); }
    if (e.key === 'ArrowLeft') starte(nr - 1);
  }
  function ende() {
    schicht(`<div class="hk hk--gross" role="dialog" aria-modal="true">
      <div class="hk__zeichen">${DS.zeichenSvg(DS.M, 'currentColor')}</div>
      <h2>That is all it takes</h2>
      <p class="hk__unter">Say, choose, adjust, print. All your pieces are under «Overview» at the top. Tour and video are always under «Help».</p>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="los">Get started${PFEIL}</button>
        <button class="hk__video" data-hk="video">${PLAY}<span>Watch the demo video</span></button>
      </div>
    </div>`, true);
  }

  /* ---------- Video ---------- */
  async function video() {
    let kapitel = [];
    try { kapitel = await (await fetch('hilfe/kapitel.json', { cache: 'no-store' })).json(); } catch (e) { }
    const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    schicht(`<div class="hk hk--video" role="dialog" aria-modal="true" aria-label="Demo video">
      <div class="hk__kopf"><h2>How the workshop works</h2><button class="hk__x" data-hk="los" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <video src="hilfe/demo.mp4" poster="hilfe/demo-poster.jpg" controls playsinline preload="metadata"></video>
      ${kapitel.length ? `<div class="hk__kapitel">${kapitel.map(k => `<button data-hk="kapitel" data-t="${k.t}"><b>${k.titel}</b><span>${fmt(k.t)}</span></button>`).join('')}</div>` : ''}
      <div class="hk__knoepfe hk__knoepfe--zeile"><button class="leicht" data-hk="fuehrung">Start the tour in the workshop</button><button class="knopf" data-hk="los">Try it yourself${PFEIL}</button></div>
    </div>`, true);
    const v = ebene.querySelector('video');
    v.addEventListener('error', () => { v.replaceWith(Object.assign(document.createElement('p'), { className: 'hk__unter', textContent: 'The video could not be loaded. The tour in the workshop shows the same step by step.' })); });
    v.play().catch(() => { });
    document.addEventListener('keydown', taste);
  }

  /* ---------- Hilfe-Menü ---------- */
  function hilfeMenue() {
    schicht(`<div class="hk hk--menue" role="dialog" aria-modal="true" aria-label="Help">
      <div class="hk__kopf"><h2>Help</h2><button class="hk__x" data-hk="los" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <button class="hk__zeile" data-hk="video"><span class="hk__ic">${PLAY}</span><span><b>Watch the demo video</b><small>Two minutes: a photo frame from the line to the PDF</small></span></button>
      <button class="hk__zeile" data-hk="fuehrung"><span class="hk__ic"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span><span><b>Tour in the workshop</b><small>Ten short steps, right at the buttons</small></span></button>
      <h3>On the keyboard</h3>
      <dl class="hk__tasten">
        <dt>Double-click</dt><dd>Write text or move the photo crop</dd>
        <dt>Arrow keys</dt><dd>Move the selection by half a millimetre, with ⇧ by five</dd>
        <dt>⌘ Z · ⇧ ⌘ Z</dt><dd>Undo · Redo</dd>
        <dt>⌘ D</dt><dd>Duplicate the selection</dd>
        <dt>⌫</dt><dd>Delete the selection</dd>
        <dt>Esc</dt><dd>Clear the selection, stop writing</dd>
        <dt>Alt while dragging</dt><dd>no snapping to edges and centre</dd>
      </dl>
    </div>`, true);
    document.addEventListener('keydown', taste);
  }

  function los() {
    $('#btnHilfe').addEventListener('click', hilfeMenue);
    const q = new URLSearchParams(location.search);
    if (q.get('hilfe') === 'video') video();
    else if (q.get('hilfe') === 'fuehrung') starte(0);
    /* Keine Begrüssung von selbst beim ersten Öffnen (Robert 07.11.2026: «Keine Tour direkt am Anfang als Zwang»): Begrüssung, Rundgang und Film
       stehen unter «Help and tour» (Seitenleiste) und dem «?» im Editor. */
  }
  if (window.__ST) los(); else document.addEventListener('ds:bereit', los, { once: true });
  window.DSHilfe = { willkommen, starte, video, hilfeMenue, zu };
})();
