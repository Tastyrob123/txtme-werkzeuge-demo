/* Partner Pack · txtme.social. The mask in front of the partner and ambassador templates (_cloud/txtme-quellen/partner|ambassador).
   The team fills in the fields for one recipient, saves them as a draft, looks at the draft as a page, publishes it and makes the PDF.
   The pages themselves come unchanged from build.py of the templates; this page only writes their fields (server part: _mappe/mappe.py).
   Frame (head, sidebar, bar, save / draft / history, receipts, windows) copied from the Bureau of the hotel template (studio/studio.js),
   in the txtme dress of Chat Team. Nothing is sent or uploaded from here. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const HAKEN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
const ZEICHEN = '<img src="media/logo-white.svg" width="120" height="106" alt="">';
const SYM = {
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  pruef: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m5.5 8 1.8 1.8L10.8 6"/></svg>',
  welt: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.6 1.6 2.3 3.5 2.3 5.5S9.6 11.9 8 13.5M8 2.5C6.4 4.1 5.7 6 5.7 8s.7 3.9 2.3 5.5"/></svg>' };
const HAUS = { namen: { werkzeug: 'Partner Pack', unterzeile: 'Partners & ambassadors · txtme.social', team: 'Team txtme.social' }, arten: {}, typen: {}, website: '' };
const S = { ue: null, ansicht: 'start', filter: 'alle', e: null, felder: null, basis: '', bilder: {}, offeneGr: {} };
const ART = { partner: 'Partner', ambassador: 'Ambassador' };
const ZUSTAND = { neu: 'Not published', entwurf: 'Draft waiting', online: 'Published' };

/* ---------- Server ---------- */
async function api(was, daten) {
  let r;
  try {
    r = await fetch('api/' + was, daten === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
  } catch (e) { throw new Error('VERBINDUNG · The server part does not answer. Is server.py running?'); }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('SERVER · Answer not readable (' + r.status + ').'); }
  if (!r.ok) throw new Error(d.fehler || ('SERVER · Error ' + r.status));
  return d;
}
/* Receipts (R11): at most three, gone after 9 s, errors with keyword and «What to do?» → lexicon of the check page */
function fehler(e) {
  const t = String((e && e.message) || e), m = /^([A-ZÄÖÜ-]+) · /.exec(t), kw = m ? m[1].toLowerCase() : '';
  const kn = kw ? [['What to do?', () => window.open('pruefung.html#m-' + kw, '_blank')]] : [];
  if (kw === 'konflikt') kn.unshift(['Reload', () => { S.basis = ''; location.reload(); }]);
  quit(t.replace(/^[A-ZÄÖÜ-]+ · /, ''), '', kn, true, 12000);
}
function quit(titel, text, knoepfe = [], fehl = false, dauer = 9000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  knoepfe.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { q.remove(); f(); }; q.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '×'; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (dauer) setTimeout(() => q.remove(), dauer);
}
const datum = iso => { const d = new Date(iso); return isNaN(d) || !iso ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
const mal = (n, eins, viele) => n === 1 ? eins : n + ' ' + viele;
const gruss = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

/* ---------- Frame: head, sidebar, bar ---------- */
function titelJetzt() {
  if (S.ansicht.startsWith('e:') || S.ansicht.startsWith('v:') || S.ansicht.startsWith('c:')) return (S.e && S.e.kurz.name) || 'Recipient';
  return { start: 'Overview', partner: 'Partners', ambassador: 'Ambassadors' }[S.ansicht] || HAUS.namen.werkzeug;
}
function kopfLeiste() {
  const z = S.ue.zahlen;
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="To the overview">${ZEICHEN}<span><b>${esc(HAUS.namen.werkzeug)}</b><small>${esc(HAUS.namen.unterzeile)}</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(titelJetzt())}</div><div class="kopf__stand">${z.wartet ? mal(z.wartet, 'One recipient waits', 'recipients wait') + ' to be published' : 'Everything is published'}</div></div>
    <div class="kopf__werk">
      ${HAUS.website ? `<a class="rund" href="${esc(HAUS.website)}" target="_blank" rel="noopener" data-tip="txtme.social website" aria-label="txtme.social website">${SYM.welt}</a>` : ''}
      <a class="rund" href="anleitung.html" target="_blank" rel="noopener" data-tip="Guide" aria-label="Guide">${SYM.buch}</a>
      <a class="rund" href="pruefung.html" target="_blank" rel="noopener" data-tip="Check" aria-label="Check">${SYM.pruef}</a>
      <span class="kopf__trenn"></span>
      <button class="kn kn--klein" type="button" id="k-neu">New recipient<i>${PLUS}</i></button>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
  $('#k-neu').onclick = () => neuFenster();
}
function rand() {
  const z = S.ue.zahlen, an = S.ansicht;
  const nw = (key, name, zahl = 0) => `<button class="nw" type="button" data-gehe="${key}" ${an === key ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<i>${zahl}</i>` : ''}</button>`;
  const warte = a => S.ue.empfaenger.filter(x => x.art === a && x.zustand !== 'online').length;
  const jetzt = S.e && /^[evc]:/.test(an) ? `<p>Open now</p>${nw('e:' + S.e.id, S.e.kurz.name)}${S.e.verlauf.length ? nw('v:' + S.e.id, 'Earlier versions') : ''}` : '';
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="false">Sections<i></i></button>
    <nav class="nav" aria-label="Sections">
      ${nw('start', 'Overview')}
      <p>Recipients</p>
      ${nw('partner', 'Partners', warte('partner'))}${nw('ambassador', 'Ambassadors', warte('ambassador'))}
      ${jetzt}
    </nav>
    <div class="wege">
      <a href="${esc(HAUS.website || '#')}" target="_blank" rel="noopener">txtme.social website${PF}</a>
      <a href="anleitung.html" target="_blank" rel="noopener">Guide${PF}</a>
      <a href="pruefung.html" target="_blank" rel="noopener">Check${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
  kopfLeiste();
}
function offenZahl() { return S.felder && S.basis ? aenderungenMaske().length : 0; }
function aenderungenMaske() {
  if (!S.felder || !S.basis) return [];
  const alt = JSON.parse(S.basis), l = [];
  Object.keys(S.felder).forEach(k => { if (JSON.stringify(S.felder[k]) !== JSON.stringify(alt[k])) l.push(k); });
  return l;
}
function leiste(gruen = false) {
  const L = $('#leiste');
  if (!S.e || !/^[evc]:/.test(S.ansicht)) {
    const z = S.ue.zahlen;
    L.innerHTML = `<div class="leiste__t"><b>${z.wartet ? mal(z.wartet, 'One recipient waits', 'recipients wait') + ' to be published' : 'Every page is published'}</b>
      <span>${mal(z.partner, 'One partner', 'partners')} and ${mal(z.ambassador, 'one ambassador', 'ambassadors')}. Each gets a personal page and a PDF.</span></div>
      <button class="kn" type="button" id="l-neu">New recipient<i>${PLUS}</i></button>`;
    $('#l-neu').onclick = () => neuFenster();
    return;
  }
  const n = offenZahl(), k = S.e.kurz, a = k.aenderungen || (k.zustand === 'neu' ? 1 : 0);
  const klasse = gruen ? 'gruen' : n ? 'gelb' : 'grau';
  L.innerHTML = `
    <div class="leiste__t"><b>${n ? mal(n, 'One field', 'fields') + ' not saved yet' : k.zustand === 'neu' ? 'Draft saved, not published yet' : a ? 'Draft: ' + mal(a, 'one change waits', 'changes wait') : 'Everything is published'}</b>
      <span>${n ? 'Save puts them into the draft. The page only changes when you publish.' : k.zustand === 'online' && !a ? 'Published ' + datum(k.veroeffentlicht) + '.' : 'Saved, not on the page yet.' + (k.geaendert ? ' Last saved ' + datum(k.geaendert) + '.' : '')}</span></div>
    <button class="kn sp ${klasse}" type="button" id="l-sp">${gruen ? 'Saved' : 'Save'}<i>${gruen ? HAKEN : PF}</i></button>
    ${a && !n ? `<button class="kn kn--linie" type="button" id="l-vgl">Before, after<i>${PF}</i></button>
    <button class="kn kn--gold glanz-kn" type="button" id="l-raus">Publish<i>${PF}</i></button>` : ''}`;
  // only buttons that do something right now (Fehlerbuch 20.10.2026): before saving or with nothing waiting there is nothing to compare or publish
  $('#l-sp').onclick = speichern;
  if ($('#l-vgl')) $('#l-vgl').onclick = () => gehe('c:' + S.e.id);
  if ($('#l-raus')) $('#l-raus').onclick = veroeffentlichenFenster;
}
function kopf(mono, titel, satz, knoepfe = '', foto = '') {
  return `<header class="titel"${foto ? ` data-kb="${esc(foto)}"` : ''}><span class="zier"><i></i>${ZEICHEN}<span>${esc(mono)}</span><i></i></span><h1>${titel}</h1>${satz ? `<p class="satz">${satz}</p>` : ''}${knoepfe ? `<div class="titel__kn">${knoepfe}</div>` : ''}</header>`;
}
function demoZeile() { return `<p class="demo-zeile"><b>Demo</b> · pages and PDFs are made in this browser only, nothing is uploaded or sent. Entries marked «Example» are invented.</p>`; }

/* ---------- Navigation ---------- */
async function gehe(ziel, still = false) {
  if (offenZahl() && S.e && !ziel.endsWith(S.e.id)) {
    fenster(`<h2>Not <em>saved yet.</em></h2><p class="satz">${mal(offenZahl(), 'One field', 'fields')} of ${esc(S.e.kurz.name)} changed since the last save.</p>
      <div class="fenster__kn"><button class="link" type="button" id="w-weg">Leave without saving</button><button class="kn" type="button" id="w-sp">Save and go on<i>${PF}</i></button></div>`, true);
    $('#w-weg').onclick = () => { fensterZu(); S.basis = ''; S.felder = null; gehe(ziel); };
    $('#w-sp').onclick = async () => { fensterZu(); if (await speichern()) gehe(ziel); };
    return;
  }
  S.ansicht = ziel;
  try { localStorage.setItem('partner-pack-ansicht', ziel); } catch (e) { /* private */ }
  if (location.hash.slice(1) !== ziel) history.replaceState(null, '', '#' + ziel);
  $('#rand').classList.remove('auf');
  const ra = $('#rand .rand__auf'); if (ra) ra.setAttribute('aria-expanded', 'false');
  await zeichne();
  if (!still) window.scrollTo(0, 0);
}
async function zeichne() {
  const an = S.ansicht;
  const lade = setTimeout(() => { $('#ansicht').innerHTML = '<div class="lade"><div class="lade__r"></div><p class="leise">Loading …</p></div>'; }, 280);
  try {
    if (/^[evc]:/.test(an)) {
      const id = an.slice(2);
      if (!S.e || S.e.id !== id || !S.felder) { S.e = await api('empfaenger?id=' + encodeURIComponent(id)); S.felder = JSON.parse(JSON.stringify(S.e.felder)); S.basis = JSON.stringify(S.e.felder); }
    } else { S.e = null; S.felder = null; S.basis = ''; }
    clearTimeout(lade);
    rand(); leiste();
    if (an.startsWith('e:')) zeichneEditor();
    else if (an.startsWith('v:')) zeichneVerlauf();
    else if (an.startsWith('c:')) await zeichneVergleich();
    else zeichneListe(an === 'start' ? '' : an);
  } catch (e) {
    clearTimeout(lade);
    if (/EMPFAENGER/.test(e.message)) { S.e = null; S.felder = null; S.basis = ''; S.ansicht = 'start'; rand(); leiste(); zeichneListe(''); fehler(e); return; }
    fehler(e);
  }
}
async function frisch() {
  S.ue = await api('ueberblick');
  if (S.e) { const k = S.ue.empfaenger.find(x => x.id === S.e.id); if (k) S.e.kurz = k; }
}

/* ---------- Overview and lists (pictures in every list, R20 examples instead of emptiness) ---------- */
function zeile(x, i) {
  return `<button class="pp-a re-auf" type="button" data-oeffne="${esc(x.id)}" style="--i:${i}">
      <span class="pp-a__bild"><img src="${esc(x.bild)}" alt="" width="104" height="78" loading="lazy" decoding="async"></span>
      <span class="pp-a__n"><span class="pp-a__k">${esc(ART[x.art])}${x.typ ? ' · ' + esc((HAUS.typen[x.typ] || {}).name || x.typ) : ''}${x.beispiel ? ' · Example' : ''}</span><b>${esc(x.name)}</b>
        <small>${x.zustand === 'online' ? 'Published ' + datum(x.veroeffentlicht) : 'Saved ' + datum(x.geaendert)}${x.offen ? ' · ' + mal(x.offen, 'one field still open', 'fields still open') : ''}</small></span>
      <span class="pp-a__st pp-st--${x.zustand}">${ZUSTAND[x.zustand]}</span>
    </button>`;
}
function zeichneListe(art) {
  const L = S.ue.empfaenger.filter(x => !art || x.art === art);
  const arten = ['partner', 'ambassador'].filter(a => !art || a === art).map((a, i) => `<button class="pp-art re-auf" type="button" data-neu="${a}" style="--i:${i}">
      <span class="pp-art__bild"><img src="${esc((HAUS.arten[a] || {}).bild || '')}" alt="" width="640" height="420" decoding="async"></span>
      <span class="pp-art__t"><b>New ${esc(ART[a].toLowerCase())}</b><small>${esc((HAUS.arten[a] || {}).satz || '')}</small></span><i>${PLUS}</i></button>`).join('');
  const titel = art ? kopf(ART[art] + 's', art === 'partner' ? 'Proposals for <em>partners.</em>' : 'Invitations for <em>creators.</em>',
      art === 'partner' ? 'One page and one PDF per partner, from the general version of the partner proposal.' : 'One page and one PDF per creator, from the invitation template.', '', (HAUS.arten[art] || {}).bild)
    : kopf(HAUS.namen.werkzeug, `${gruss()}. <em>Who is next?</em>`, 'Fill in the fields for one partner or creator, save, look at the page, publish. The page and the PDF come from the finished templates.', '<a class="kn kn--linie kn--klein" href="anleitung.html" target="_blank" rel="noopener">Guide<i>' + PF + '</i></a>');
  $('#ansicht').innerHTML = titel + demoZeile() +
    `<div class="pp-arten${art ? ' pp-arten--eins' : ''}">${arten}</div>` +
    `<h2 class="zw">${art ? 'All ' + esc(ART[art].toLowerCase()) + 's' : 'All <em>recipients</em>'}</h2>` +
    (L.length ? `<div class="pp-liste">${L.map(zeile).join('')}</div>`
      : `<div class="re-leer"><b>No ${esc((ART[art] || 'recipient').toLowerCase())} yet.</b><p>Start with «New ${esc((ART[art] || 'recipient').toLowerCase())}» above. Each one starts from the template with all texts filled in.</p></div>`);
  $$('[data-oeffne]').forEach(b => b.onclick = () => gehe('e:' + b.dataset.oeffne));
  $$('[data-neu]').forEach(b => b.onclick = () => neuFenster(b.dataset.neu));
}

/* ---------- New recipient ---------- */
function neuFenster(art = '') {
  const typen = Object.entries(HAUS.typen);
  fenster(`<h2>New <em>recipient.</em></h2><p class="satz">The page starts from the template with all texts filled in. Then you change what is written for this one recipient.</p>
    <div class="wahl2 pp-wahl" role="group" aria-label="Kind" id="n-art">${['partner', 'ambassador'].map(a => `<button type="button" data-v="${a}" aria-pressed="${a === (art || 'partner')}">${ART[a]}</button>`).join('')}</div>
    <label class="feld"><span id="n-l">${art === 'ambassador' ? 'Full name of the creator' : 'Name of the partner'}</span><input type="text" id="n-name" maxlength="80" autocomplete="off"></label>
    <div id="n-typ" ${art === 'ambassador' ? '' : 'hidden'}><span class="pp-label">Kind of creator</span><div class="wahl2 pp-wahl pp-wahl--typ" role="group" aria-label="Kind of creator">${typen.map(([k, t]) => `<button type="button" data-v="${esc(k)}" aria-pressed="${k === ''}">${esc(t.name)}</button>`).join('')}</div></div>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Not now</button><button class="kn" type="button" id="n-ja">Create<i>${PF}</i></button></div>`, true);
  let wahl = art || 'partner', typ = '';
  $$('#n-art button').forEach(b => b.onclick = () => { wahl = b.dataset.v; $$('#n-art button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#n-typ').hidden = wahl !== 'ambassador'; $('#n-l').textContent = wahl === 'ambassador' ? 'Full name of the creator' : 'Name of the partner'; });
  $$('#n-typ button').forEach(b => b.onclick = () => { typ = b.dataset.v; $$('#n-typ button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#n-name').focus();
  const los = async () => {
    try {
      const r = await api('neu', { art: wahl, name: $('#n-name').value, typ });
      fensterZu(); await frisch(); await gehe('e:' + r.id);
      quit('Created', 'Draft from the template. Change what is written for this recipient, then save.', [], false, 6000);
    } catch (e) { fehler(e); }
  };
  $('#n-ja').onclick = los;
  $('#n-name').onkeydown = e => { if (e.key === 'Enter') los(); };
}

/* ---------- The mask ---------- */
const weg = p => p.split('.').map(x => /^\d+$/.test(x) ? +x : x);
function holen(p) { return weg(p).reduce((o, k) => (o == null ? o : o[k]), S.felder); }
function setzen(p, v) { const w = weg(p), l = w.pop(); const o = w.reduce((o, k) => o[k], S.felder); o[l] = v; }
const istPlatzhalter = v => typeof v === 'string' && /^\s*\[.*\]\s*$/s.test(v);
function feldHtml(f, p, v) {
  const id = 'f-' + p.replace(/\W/g, '-'), hilfe = f.h ? `<small>${esc(f.h)}</small>` : '', pfl = f.pflicht ? ' <em class="pp-pfl">required</em>' : '';
  const ph = istPlatzhalter(v) ? ' offen' : '';
  if (f.t === 'text' || f.t === 'roh') return `<label class="feld pp-f${ph}" for="${id}"><span>${esc(f.l)}${pfl}</span><input type="${f.art === 'email' ? 'email' : 'text'}" id="${id}" data-p="${p}" maxlength="${f.max || 400}" value="${esc(v)}">${hilfe}${ph ? '<small class="pp-ph">Still a placeholder: shown pink on the page.</small>' : ''}</label>`;
  if (f.t === 'lang') return `<label class="feld pp-f${ph}" for="${id}"><span>${esc(f.l)}${pfl}</span><textarea id="${id}" data-p="${p}" maxlength="${f.max || 2000}" rows="3">${esc(v)}</textarea>${hilfe}${ph ? '<small class="pp-ph">Still a placeholder: shown pink on the page.</small>' : ''}</label>`;
  if (f.t === 'ja') return `<label class="haken pp-f pp-ja"><input type="checkbox" data-p="${p}" ${v ? 'checked' : ''}><span>${esc(f.l)}${f.h ? `<small>${esc(f.h)}</small>` : ''}</span></label>`;
  if (f.t === 'typ') return `<div class="pp-f"><span class="pp-label">${esc(f.l)}</span><div class="wahl2 pp-wahl pp-wahl--typ" role="group" aria-label="${esc(f.l)}" data-typ="${p}">${Object.entries(HAUS.typen).map(([k, t]) => `<button type="button" data-v="${esc(k)}" aria-pressed="${k === (v || '')}">${esc(t.name)}</button>`).join('')}</div>${hilfe}</div>`;
  if (f.t === 'bild') {
    const basis = 'vorlage/' + S.e.art + '/media/';
    return `<div class="pp-f pp-bild"><span class="pp-label">${esc(f.l)}</span><button class="pp-bild__k" type="button" data-bild="${p}" aria-label="Choose ${esc(f.l)}">${v ? `<img src="${basis + esc(v)}" alt="" width="208" height="156" loading="lazy" decoding="async">` : '<span class="pp-bild__leer">No photo</span>'}<span class="pp-bild__t"><b>${v ? 'Change the photo' : 'Choose a photo'}</b><small>From the photos of the template</small></span></button></div>`;
  }
  if (f.t === 'liste') {
    const l = v || [];
    return `<div class="pp-f pp-liste-f"><span class="pp-label">${esc(f.l)}</span>${f.h ? `<small class="pp-h">${esc(f.h)}</small>` : ''}
      <div class="pp-zeilen">${l.map((x, i) => `<div class="pp-z">${f.lang ? `<textarea rows="3" data-p="${p}.${i}" maxlength="${f.zeile || 400}" aria-label="${esc(f.l)} ${i + 1}">${esc(x)}</textarea>` : `<input type="text" data-p="${p}.${i}" maxlength="${f.zeile || 200}" value="${esc(x)}" aria-label="${esc(f.l)} ${i + 1}">`}<button class="rund pp-weg" type="button" data-weg="${p}.${i}" aria-label="Remove line ${i + 1}">${ZU}</button></div>`).join('')}</div>
      ${l.length < (f.max || 20) ? `<button class="kn kn--linie kn--klein pp-dazu" type="button" data-dazu="${p}" data-leer='""'>Add line<i>${PLUS}</i></button>` : ''}</div>`;
  }
  if (f.t === 'gruppe') {
    const l = v || [], leer = {}; f.felder.forEach(u => { leer[u.k || '_bild'] = u.t === 'ja' ? false : ''; });
    const fest = f.min && f.min === f.max;
    return `<div class="pp-f pp-gruppe"><span class="pp-label">${esc(f.l)}</span>
      <div class="pp-karten">${l.map((x, i) => `<div class="pp-karte"><div class="pp-karte__k"><span class="mono">${esc(f.einzel || 'Entry')} ${i + 1}</span>${fest ? '' : `<button class="link rot" type="button" data-weg="${p}.${i}">Remove</button>`}</div>
        ${f.felder.map(u => feldHtml(u, `${p}.${i}.${u.k || '_bild'}`, x[u.k || '_bild'])).join('')}</div>`).join('')}</div>
      ${!fest && l.length < (f.max || 20) ? `<button class="kn kn--linie kn--klein pp-dazu" type="button" data-dazu="${p}" data-leer='${esc(JSON.stringify(leer))}'>Add ${esc((f.einzel || 'entry').toLowerCase())}<i>${PLUS}</i></button>` : ''}</div>`;
  }
  return '';
}
function zeichneEditor() {
  const e = S.e, k = e.kurz, sch = e.schema;
  const offen = e.offen || [];
  const kn = [
    k.url ? `<a class="kn kn--klein" href="${esc(k.url)}" target="_blank" rel="noopener" id="e-seite">Open the page<i>${PF}</i></a>` : '',
    `<button class="kn kn--linie kn--klein" type="button" id="e-vorschau">Draft as a page<i>${PF}</i></button>`,
    k.url ? (k.pdf ? `<a class="kn kn--linie kn--klein" href="${esc(k.pdf)}" target="_blank" rel="noopener" id="e-pdf-auf">Open PDF<i>${PF}</i></a>` : `<button class="kn kn--linie kn--klein" type="button" id="e-pdf">Make PDF<i>${PF}</i></button>`) : '',
    k.aenderungen && k.zustand !== 'neu' ? `<button class="kn kn--linie kn--klein" type="button" data-gehe="c:${esc(e.id)}" id="e-vgl">Before, after<i>${PF}</i></button>` : '',
    e.verlauf.length ? `<button class="kn kn--linie kn--klein" type="button" data-gehe="v:${esc(e.id)}">Earlier versions<i>${PF}</i></button>` : ''].join('');
  $('#ansicht').innerHTML = kopf(ART[e.art] + (k.typ ? ' · ' + ((HAUS.typen[k.typ] || {}).name || '') : '') + (e.beispiel ? ' · Example' : ''), esc(k.name) + ' <em>' + (k.zustand === 'online' ? 'is published.' : k.zustand === 'entwurf' ? 'has a draft.' : 'is a draft.') + '</em>',
      k.zustand === 'online' ? `Published ${esc(datum(k.veroeffentlicht))}. Changes wait in the draft until you publish again.` : k.zustand === 'entwurf' ? 'The page shows the published version. Your saved changes wait in the draft.' : 'Not on a page yet. Fill in, save, then publish: the page and the PDF are made from these fields.', kn, k.bild) +
    demoZeile() +
    (offen.length ? `<div class="pp-offen"><b>${mal(offen.length, 'One field is', 'fields are')} still empty or a placeholder</b><span>${offen.map(esc).join(' · ')}</span><small>Publishing waits until they are filled in.</small></div>` : '') +
    ((e.namen || []).length ? `<div class="pp-offen pp-namen" id="e-namen"><b>${e.namen.length === 1 ? 'One text still names' : e.namen.length + ' texts still name'} an earlier contact</b><span>${e.namen.map(x => `«${esc(x.feld)}» names ${esc(x.name)}`).join(' · ')}</span><small>The contact is now ${esc(S.felder.contact_name || '')}. Change the text if it should name the new contact; publishing does not wait for this.</small></div>` : '') +
    `<div class="pp-maske">${sch.gruppen.map((g, gi) => `<details class="gr pp-gr" data-gr="${esc(g.key)}" ${S.offeneGr[e.id + g.key] !== undefined ? (S.offeneGr[e.id + g.key] ? 'open' : '') : gi < 2 ? 'open' : ''}>
        <summary><b>${esc(g.titel)}</b><small>${esc(g.satz || '')}</small></summary>
        <div class="pp-gr__i">${g.felder.map(f => feldHtml(f, f.k || '_bild', S.felder[f.k || '_bild'])).join('')}</div></details>`).join('')}</div>
    <div class="pp-fuss">
      <div class="pp-prot"><h2 class="zw">What <em>happened</em></h2>${(e.protokoll || []).map(p => `<div class="pp-prot__z"><span class="mono">${esc(datum(p.zeit))}</span><span>${esc(p.was)}</span><small>${esc(p.wer)}</small></div>`).join('') || '<p class="leise">Nothing yet.</p>'}</div>
      <div class="pp-ende"><button class="link rot" type="button" id="e-weg">Remove this recipient</button></div>
    </div>`;
  verbindeEditor();
}
function verbindeEditor() {
  const e = S.e;
  $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  $$('.pp-gr').forEach(d => d.ontoggle = () => { S.offeneGr[e.id + d.dataset.gr] = d.open; });
  $$('.pp-maske [data-p]').forEach(el => {
    const p = el.dataset.p;
    if (el.type === 'checkbox') el.onchange = () => { setzen(p, el.checked); leiste(); };
    else el.oninput = () => { setzen(p, el.value); if (el.tagName === 'TEXTAREA') wachsen(el); leiste(); };
    if (el.tagName === 'TEXTAREA') wachsen(el);
  });
  $$('.pp-maske [data-typ]').forEach(g => $$('button', g).forEach(b => b.onclick = () => { setzen(g.dataset.typ, b.dataset.v); $$('button', g).forEach(x => x.setAttribute('aria-pressed', x === b)); leiste(); }));
  $$('.pp-maske [data-dazu]').forEach(b => b.onclick = () => { const l = holen(b.dataset.dazu) || []; l.push(JSON.parse(b.dataset.leer)); setzen(b.dataset.dazu, l); neuZeichnen(); });
  $$('.pp-maske [data-weg]').forEach(b => b.onclick = () => { const w = b.dataset.weg.split('.'), i = +w.pop(), p = w.join('.'); const l = holen(p); l.splice(i, 1); neuZeichnen(); });
  $$('.pp-maske [data-bild]').forEach(b => b.onclick = () => bildFenster(b.dataset.bild));
  $('#e-vorschau').onclick = entwurfSeite;
  const pdf = $('#e-pdf'); if (pdf) pdf.onclick = pdfMachen;
  $('#e-weg').onclick = entfernenFenster;
}
function wachsen(t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, 520) + 'px'; }
function neuZeichnen() { const y = scrollY; zeichneEditor(); window.scrollTo(0, y); leiste(); }

/* Photo from the photos of the template: library window with every photo, search by name */
async function bildFenster(p) {
  const art = S.e.art;
  try { if (!S.bilder[art]) S.bilder[art] = (await api('bilder?art=' + art)).bilder; } catch (e) { fehler(e); return; }
  const jetzt = holen(p) || '', basis = 'vorlage/' + art + '/media/';
  fenster(`<h2>Choose a <em>photo.</em></h2><p class="satz">The photos of the ${art === 'partner' ? 'partner proposal' : 'invitation'}. Only photos of txtme.social, nothing from outside.</p>
    <label class="suche"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><input type="search" id="b-such" placeholder="Search by name" aria-label="Search photos"></label>
    <div class="bibl pp-bibl" id="b-liste">${S.bilder[art].map(b => `<button type="button" data-n="${esc(b.n)}" aria-pressed="${b.n === jetzt}"><img src="${basis + esc(b.n)}" alt="" loading="lazy" decoding="async" width="${b.w}" height="${b.h}"></button>`).join('')}</div>
    <div class="fenster__kn">${jetzt ? '<button class="link rot" type="button" id="b-ohne">No photo</button>' : ''}<button class="link" type="button" data-zu>Close</button></div>`);
  $$('#b-liste button').forEach(b => b.onclick = () => { setzen(p, b.dataset.n); fensterZu(); neuZeichnen(); });
  const o = $('#b-ohne'); if (o) o.onclick = () => { setzen(p, ''); fensterZu(); neuZeichnen(); };
  $('#b-such').oninput = e => { const q = e.target.value.toLowerCase(); $$('#b-liste button').forEach(b => { b.hidden = q && !b.dataset.n.includes(q); }); };
}

/* ---------- Save, receipt, undo (R09–R11) ---------- */
async function speichern() {
  if (!S.e) return false;
  if (!offenZahl()) { quit('Nothing changed, nothing saved.', '', [], false, 4000); return true; }
  try {
    const r = await api('speichern', { id: S.e.id, fassung: S.e.fassung, felder: S.felder });
    if (!r.geaendert) { S.basis = JSON.stringify(S.felder); leiste(); quit(r.meldung || 'Nothing changed, nothing saved.', '', [], false, 4000); return true; }
    await nachladen();
    leiste(true); setTimeout(() => leiste(), 2600);
    quit('Saved', r.was.slice(0, 3).join(' · ') + (r.was.length > 3 ? ` · and ${r.was.length - 3} more` : ''), [
      ['Draft as a page', entwurfSeite],
      ['Undo', async () => { try { await api('rueckgaengig', { id: S.e.id, schritt: r.schritt }); await nachladen(); quit('Undone', 'The draft is as before this save.', [], false, 5000); } catch (e) { fehler(e); } }]]);
    return true;
  } catch (e) { fehler(e); return false; }
}
async function nachladen() {
  const id = S.e.id;
  S.e = await api('empfaenger?id=' + encodeURIComponent(id));
  S.felder = JSON.parse(JSON.stringify(S.e.felder)); S.basis = JSON.stringify(S.e.felder);
  await frisch(); rand();
  if (S.ansicht.startsWith('e:')) neuZeichnen(); else await zeichne();
}
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (S.ansicht.startsWith('e:')) speichern(); }
  if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu();
});
window.addEventListener('beforeunload', e => { if (offenZahl()) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Draft as a page, before and after ---------- */
async function entwurfSeite() {
  if (offenZahl()) { quit('Save first', 'The draft page is made from the saved fields.', [['Save now', async () => { if (await speichern()) entwurfSeite(); }]], false, 7000); return; }
  const w = window.open('', '_blank');
  try {
    const r = await api('vorschau', { id: S.e.id });
    if (w) w.location = r.url + '?t=' + Date.now(); else quit('Draft page ready', '', [['Open', () => window.open(r.url, '_blank')]], false, 9000);
  } catch (e) { if (w) w.close(); fehler(e); }
}
async function zeichneVergleich() {
  const e = S.e, k = e.kurz, L = e.aenderungen || [];
  $('#ansicht').innerHTML = kopf('Before, after', 'What <em>changes.</em>', L.length ? `${mal(L.length, 'One field changes', 'fields change')} when you publish. First the published page, then the draft.` : 'The draft is the same as the published page.', `<button class="kn kn--linie kn--klein" type="button" data-gehe="e:${esc(e.id)}">Back to the fields<i>${PF}</i></button>`, k.bild) +
    `<div class="pp-ae">${L.map(a => `<div class="ae"><span class="mono">${esc(a.was)}</span><div class="vor"><small>Before</small><del>${esc(a.vorher || '(empty)')}</del></div><div class="nach"><small>After</small><mark>${esc(a.nachher || '(empty)')}</mark></div></div>`).join('')}</div>
    <div class="vgl2 pp-vgl"><div class="vorschau"><div class="vorschau__k"><span class="mono">Published</span>${k.url ? `<a href="${esc(k.url)}" target="_blank" rel="noopener">Open${PF}</a>` : ''}</div><div class="rahmen" id="v-a">${k.url ? `<iframe title="Published page" src="${esc(k.url)}" loading="lazy"></iframe>` : '<p class="leise pp-nicht">Not published yet.</p>'}</div></div>
      <div class="vorschau"><div class="vorschau__k"><span class="mono">Draft</span><a href="#" id="v-b-auf">Open${PF}</a></div><div class="rahmen laedt" id="v-b"><div class="lade-schleier"></div></div></div></div>`;
  $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  rahmenMass();
  try {
    const r = await api('vorschau', { id: e.id });
    const box = $('#v-b'); if (!box) return;
    box.innerHTML = `<iframe title="Draft page" src="${esc(r.url)}?t=${Date.now()}" loading="lazy"></iframe>`; box.classList.remove('laedt');
    $('#v-b-auf').href = r.url; $('#v-b-auf').target = '_blank';
  } catch (err) { fehler(err); }
}

/* The page is laid out at 1440 px and scaled into its frame (studio.css .rahmen) */
function rahmenMass() { $$('#ansicht .rahmen').forEach(r => r.style.setProperty('--wz', (r.clientWidth / 1440).toFixed(4))); }
addEventListener('resize', rahmenMass);

/* ---------- Publish (R12, Master 2.3): try on a test build, check, then switch ---------- */
async function veroeffentlichenFenster() {
  if (offenZahl()) { quit('Save first', 'Some fields are not saved yet.', [['Save now', speichern]], false, 6000); return; }
  const e = S.e, L = e.aenderungen || [];
  if (e.offen && e.offen.length) { quit('Not yet', 'Still empty or a placeholder: ' + e.offen.slice(0, 4).join(', ') + (e.offen.length > 4 ? ' …' : ''), [], true, 9000); return; }
  fenster(`<h2>Publish <em>${esc(e.kurz.name)}.</em></h2><p class="satz">${e.kurz.zustand === 'neu' ? 'The page is made for the first time.' : mal(L.length, 'One field changes', 'fields change') + ' on the page.'} It is built on a test copy first and checked; only then it replaces the page. The current page is kept as an earlier version.</p>
    <div class="pp-raus-liste">${L.map(a => `<div class="zl"><div><small>${esc(a.was)}</small><span>${esc(a.nachher || 'removed')}</span></div></div>`).join('')}</div>
    <label class="feld" style="margin-top:16px"><span>Note for the history (optional)</span><input type="text" id="r-notiz" maxlength="160" placeholder="for example: new idea after the call"></label>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Not yet</button><button class="kn" type="button" id="r-ja">Publish now<i>${PF}</i></button></div>`);
  $('#r-ja').onclick = async () => {
    try {
      const r = await api('veroeffentlichen', { id: e.id, notiz: $('#r-notiz').value });
      if (!r.laeuft) { fensterZu(); quit(r.meldung || 'Nothing published.', '', [], false, 4000); return; }
      fortschritt('raus');
    } catch (err) { fensterZu(); fehler(err); }
  };
}
async function pdfMachen() {
  try { await api('pdf', { id: S.e.id }); fenster('<div></div>', true); fortschritt('pdf'); } catch (e) { fehler(e); }
}
async function fortschritt(was) {
  const k0 = $('#fenster').firstElementChild;
  k0.innerHTML = `<div class="lade"><div class="lade__r"></div><h2>${was === 'pdf' ? 'Printing the <em>PDF …</em>' : 'Publishing <em>…</em>'}</h2><ol class="schritte" id="r-sch"></ol></div>`;
  for (let n = 0; n < 400; n++) {
    await new Promise(r => setTimeout(r, 600));
    let d;
    try { d = await api('lauf'); } catch (e) { continue; }
    const sch = d.schritte || [];
    if ($('#r-sch')) $('#r-sch').innerHTML = sch.map((x, i) => `<li class="${i < sch.length - 1 || !d.aktiv ? 'fertig' : 'jetzt'}">${esc(x.t)}</li>`).join('');
    if (d.aktiv) continue;
    const k = $('#fenster').firstElementChild; if (!k) return;
    if (d.fehler) {
      const kw = (d.fehler.split(' · ')[0] || 'bau').toLowerCase();
      k.innerHTML = `<h2>Not <em>${was === 'pdf' ? 'printed' : 'published'}.</em></h2><p class="satz">${esc(d.fehler.replace(/^[A-ZÄÖÜ-]+ · /, ''))}</p><p class="leise">${was === 'pdf' ? 'The page is unchanged.' : 'The page is unchanged. Your draft is still there.'}</p>
        <div class="fenster__kn"><a class="link" href="pruefung.html#m-${esc(kw)}" target="_blank" rel="noopener">What to do?</a><button class="kn" type="button" data-zu>Close<i>${PF}</i></button></div>`;
    } else if (d.fertig && was === 'pdf') {
      // the window that only watches (opened on the overview) has no open recipient: take the name from the list
      const wer = (S.e && S.e.id === d.id && S.e.kurz) || ((S.ue && S.ue.empfaenger) || []).find(x => x.id === d.id) || { name: 'The recipient' };
      k.innerHTML = `<h2>The PDF <em>is ready.</em></h2><p class="satz">${esc(wer.name)}: the published page set on A4 pages. Your browser prints it: choose «Save as PDF».</p>
        <div class="fenster__kn"><button class="link" type="button" data-zu>Close</button><a class="kn" href="${esc(d.fertig.pdf)}" target="_blank" rel="noopener" id="r-pdf">Open PDF<i>${PF}</i></a></div>`;
    } else if (d.fertig) {
      k.innerHTML = `<h2>Is <em>published.</em></h2><p class="satz">${d.fertig.zahl ? mal(d.fertig.zahl, 'One field is', 'fields are') + ' on the page, built and checked.' : 'The page is built and checked.'} The PDF follows the published page: make it again when you need it.</p>
        <ol class="schritte">${(d.fertig.aenderungen || []).map(a => `<li class="fertig">${esc(a.was)}</li>`).join('')}</ol>
        <div class="fenster__kn"><a class="kn kn--linie" href="${esc(d.fertig.url)}" target="_blank" rel="noopener" id="r-seite">Open the page<i>${PF}</i></a><button class="kn" type="button" data-zu>Done<i>${PF}</i></button></div>`;
    }
    $$('[data-zu]', k).forEach(b => b.onclick = fensterZu);
    if (S.e) await nachladen(); else await frisch();
    return;
  }
}

/* ---------- Earlier versions (R14): back into the draft only, never straight onto the page ---------- */
function zeichneVerlauf() {
  const e = S.e;
  $('#ansicht').innerHTML = kopf('Earlier versions', esc(e.kurz.name) + ', <em>earlier.</em>', 'Every publication is kept. An earlier version goes into the draft first: you see before and after and then publish.', `<button class="kn kn--linie kn--klein" type="button" data-gehe="e:${esc(e.id)}">Back to the fields<i>${PF}</i></button>`, e.kurz.bild) +
    (e.verlauf.length ? e.verlauf.map(v => `<div class="vl"><div><b>${esc(datum(v.zeit))}</b><span>Version ${v.nr}${v.notiz ? ' · ' + esc(v.notiz) : ''}</span></div><button class="kn kn--linie kn--klein" type="button" data-nr="${v.nr}">Into the draft<i>${PF}</i></button></div>`).join('')
      : `<div class="leer-hinweis"><b>Nothing earlier yet.</b>After the second publication every earlier version stands here, newest first.</div>`) +
    `<div class="vl vl--ursprung"><div><b>First version</b><span>The fields as they were when this recipient was created.</span></div><button class="kn kn--linie kn--klein" type="button" data-nr="ursprung">Into the draft<i>${PF}</i></button></div>`;
  $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  $$('[data-nr]').forEach(b => b.onclick = async () => {
    try {
      const r = await api('zurueckholen', { id: e.id, nr: b.dataset.nr === 'ursprung' ? 'ursprung' : +b.dataset.nr });
      S.felder = null; await frisch(); await gehe('e:' + e.id);
      quit('In the draft', r.offen ? `${mal(r.offen, 'One field differs', 'fields differ')} from the page. Check, then publish.` : 'The draft is now the same as the page.', [], false, 7000);
    } catch (err) { fehler(err); }
  });
}

/* ---------- Remove (with the name as confirmation; kept in daten/entfernt) ---------- */
function entfernenFenster() {
  const e = S.e;
  fenster(`<h2>Remove <em>${esc(e.kurz.name)}?</em></h2><p class="satz">The recipient leaves the list and the page and PDF are no longer served here. Nothing is deleted: everything is kept in the archive folder of the tool.</p>
    <label class="feld"><span>Type the name to confirm: ${esc(e.kurz.name)}</span><input type="text" id="x-name" autocomplete="off"></label>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Keep</button><button class="kn kn--gefahr" type="button" id="x-ja">Remove<i>${ZU}</i></button></div>`, true);
  $('#x-name').focus();
  $('#x-ja').onclick = async () => {
    try { await api('entfernen', { id: e.id, name: $('#x-name').value.trim() }); fensterZu(); S.e = null; S.felder = null; S.basis = ''; await frisch(); await gehe(e.art); quit('Removed', e.kurz.name + ' is removed.', [], false, 6000); }
    catch (err) { fehler(err); }
  };
}

/* ---------- Window ---------- */
function fenster(html, schmal = false) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Close">${ZU}</button>${html}</div>`;
  f.hidden = false;
  document.body.classList.add('fenster-offen');
  $$('#meldung .quit:not(.fehl)').forEach(q => q.remove());   // receipts of the last step never cover the buttons of the window
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
}
function fensterZu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; document.body.classList.remove('fenster-offen'); }

/* ---------- Start (R15: last view remembered, from outside always the overview) ---------- */
(async function () {
  try {
    const [h, ue] = await Promise.all([api('haus'), api('ueberblick')]);
    Object.assign(HAUS, h); S.ue = ue;
  } catch (e) {
    $('#tuer').hidden = false;
    $('#tuer-t').textContent = String(e.message || e).replace(/^[A-ZÄÖÜ-]+ · /, '');
    window.werkzeugMerk && window.werkzeugMerk('Start: ' + (e.message || e));
    return;
  }
  let ziel = location.hash.slice(1);
  const nav = (performance.getEntriesByType('navigation')[0] || {}).type;
  if (!ziel && nav === 'reload') try { ziel = localStorage.getItem('partner-pack-ansicht') || ''; } catch (e) { /* private */ }
  if (!/^(start|partner|ambassador|[evc]:(partner|ambassador)--[a-z0-9-]+)$/.test(ziel)) ziel = 'start';
  S.ansicht = ziel;
  rand(); leiste();
  await zeichne();
  if (S.ue.lauf && S.ue.lauf.aktiv) { fenster('<div></div>', true); fortschritt(S.ue.lauf.was === 'pdf' ? 'pdf' : 'raus'); }
  /* back and forward of the browser, links with #e:<id> */
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== S.ansicht && /^(start|partner|ambassador|[evc]:(partner|ambassador)--[a-z0-9-]+)$/.test(h)) gehe(h); });
})();
