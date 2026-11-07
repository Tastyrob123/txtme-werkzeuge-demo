/* Chat Team · txtme.social. The tool of the team behind the txtme chat (copy of reception.js of La Réception, hotel template, Robert 12.10.2026;
   here in English, in the txtme dress and attached to the existing chat: /api/eingang and /api/fragen of backstage-online).
   Inbox: what customers send through the site and the chat window (waiting list, press, partner, support, message), with a draft reply.
   What was asked: every question to the chat, by topic; where the chat had no answer, the team adds it once, from then on the chat answers with it.
   Server part: _gast/rezeption.py via server.py (/api/…). Nothing is sent from here. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
/* The one logo of txtme.social (public/media): white on dark, ink on light; never typeset as text (Fehlerbuch Culinarium 28.10.2026) */
const ZEICHEN = '<img src="media/logo-white.svg" width="120" height="106" alt="">';
const ZEICHEN_H = '<img src="media/logo-ink.svg" width="120" height="106" alt="">';
const SYM = {
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  haus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.2 8 2.8l5.5 4.4V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z"/><path d="M6.5 13.5v-4h3v4"/></svg>',
  pruef: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m5.5 8 1.8 1.8L10.8 6"/></svg>',
  chat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5.5A1.5 1.5 0 0 1 12 11H7l-3 2.5V11a1.5 1.5 0 0 1-1.5-1.5z"/></svg>',
  korb: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>',
  kopie: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5"/><path d="M11 5V3.5A1 1 0 0 0 10 2.5H3.5a1 1 0 0 0-1 1V10a1 1 0 0 0 1 1H5"/></svg>',
  post: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/></svg>',
  haken: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>' };
/* House values: everything with a name or an address comes from haus.json (one place), loaded at start */
const HAUS = { namen: { werkzeug: 'Chat Team', unterzeile: 'Questions & requests · txtme.social', chat: 'txtme chat', team: 'Team txtme.social' }, haus: 'txtme.social',
  brief: { zeile: 'Amsterdam · See you offline.', fuss: '' }, support: 'customer-support@txtme.social', website: '', arten: {}, sprachen: ['en', 'de', 'nl', 'fr', 'es'] };
const N = HAUS.namen;
const ART = HAUS.arten;
const SPRACHE = { en: 'English', de: 'German', nl: 'Dutch', fr: 'French', es: 'Spanish' };
const S = { ue: null, ansicht: 'start', anfragen: null, fragen: null, nachgetragen: null, wahl: '', filter: 'alle', schreibt: {}, bearbeiten: '', wissen: null, wissenDa: true, such: '', offen: {}, verlauf: {} };
const ART_LANG = { support: 'Support & orders', warteliste: 'Waiting list for the app', presse: 'Press', partner: 'Partners & business', newsletter: 'Newsletter', nachricht: 'Messages' };
/* One photo of txtme.social per kind of request (public/media/shoot, the editorial shooting of the customer), never a drawn symbol */
const ARTBILD = { support: 'media/shoot/desk-900.webp', warteliste: 'media/shoot/friends-900.webp', presse: 'media/shoot/print-900.webp', partner: 'media/shoot/cube-800.webp', newsletter: 'media/shoot/subway-700.webp', nachricht: 'media/shoot/glance-800.webp' };
const bild = (art, kl) => `<span class="${kl}" aria-hidden="true"><img src="${ARTBILD[art] || ARTBILD.nachricht}" alt="" width="900" height="675" decoding="async"></span>`;
const uhr = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };

/* ---------- Server ---------- */
async function api(was, daten, halten = false) {
  let r;
  try {
    r = await fetch('api/' + was, daten === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten), keepalive: !!halten });
  } catch (e) { throw new Error('VERBINDUNG · The server part does not answer. Is server.py running?'); }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('SERVER · Answer not readable (' + r.status + ').'); }
  if (!r.ok) throw new Error(d.fehler || ('SERVER · Error ' + r.status));
  return d;
}
/* Error receipt with keyword and «What to do?» → lexicon of the check page (R11) */
function fehler(e) {
  const t = String((e && e.message) || e), m = /^([A-ZÄÖÜ-]+) · /.exec(t), kw = m ? m[1] : '';
  quit(t.replace(/^[A-ZÄÖÜ-]+ · /, ''), kw ? kw.toLowerCase() : '', kw ? [['What to do?', () => window.open('pruefung.html#m-' + kw.toLowerCase(), '_blank')]] : [], true, 9000);
}
function quit(titel, text, knoepfe = [], fehl = false, dauer = 7000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  knoepfe.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { f(); q.remove(); }; q.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '×'; x.onclick = () => q.remove(); q.appendChild(x);
  /* With a window open, the receipt stands in the window itself, right above its buttons: it never lies over a field or a button (Abnahme 07.11.2026 C5) */
  const fk = $('#fenster') && !$('#fenster').hidden ? $('#fenster .fenster__k') : null, kn = fk && fk.querySelector('.fenster__kn'), m = $('#meldung');
  if (kn && m.nextElementSibling !== kn) { kn.parentNode.insertBefore(m, kn); m.classList.add('im-fenster'); }
  m.appendChild(q);
  if (kn) kn.scrollIntoView({ block: 'nearest' });   // the receipt and the buttons under it in view
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (dauer) setTimeout(() => q.remove(), dauer);
}
const datum = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const zeit = iso => { const d = new Date(iso); return isNaN(d) ? '' : datum(iso) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
const mal = (n, eins, viele) => n === 1 ? eins : n + ' ' + viele;

/* ---------- Frame: head, sidebar, bar ---------- */
const TITEL = { start: 'Overview', eingang: 'Inbox', gefragt: 'What was asked', nachgetragen: 'Added by the team', wissen: 'What the chat knows' };
function kopfLeiste() {
  const u = S.ue;
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="To the overview">${ZEICHEN}<span><b>${esc(N.werkzeug)}</b><small>${esc(N.unterzeile)}</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(TITEL[S.ansicht] || N.werkzeug)}</div><div class="kopf__stand">${u.anfragen_neu ? mal(u.anfragen_neu, 'One new request', 'new requests') : 'No new requests'}</div></div>
    <div class="kopf__werk">
      <a class="rund" href="anleitung.html" target="_blank" rel="noopener" data-tip="Guide" aria-label="Guide">${SYM.buch}</a>
      <a class="rund" href="pruefung.html" target="_blank" rel="noopener" data-tip="Check" aria-label="Check">${SYM.pruef}</a>
      <span class="kopf__trenn"></span>
      <button class="kn kn--klein" type="button" id="k-probe">Try the chat<i>${SYM.chat}</i></button>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
  const kp = $('#k-probe'); if (kp) kp.onclick = probe;
}
function rand() {
  const u = S.ue, an = S.ansicht;
  const nw = (key, name, zahl = 0) => `<button class="nw" type="button" data-gehe="${key}" ${an === key ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<i>${zahl}</i>` : ''}</button>`;
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="false">Sections<i></i></button>
    <nav class="nav" aria-label="Sections">
      ${nw('start', 'Overview')}
      <p>For the team</p>
      ${nw('eingang', 'Inbox', u.anfragen_neu)}${nw('gefragt', 'What was asked', u.ohne_antwort)}${nw('nachgetragen', 'Added by the team')}${S.wissenDa ? nw('wissen', 'What the chat knows', S.wissenNeu || 0) : ''}
    </nav>
    <div class="wege">
      <a href="${esc(HAUS.website || '#')}" target="_blank" rel="noopener">Chat on the website${PF}</a>
      <a href="anleitung.html" target="_blank" rel="noopener">Guide${PF}</a>
      <a href="pruefung.html" target="_blank" rel="noopener">Check${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
  kopfLeiste();
}
function leiste() {
  const u = S.ue;
  $('#leiste').innerHTML = `
    <div class="leiste__t"><b>${u.anfragen_neu ? mal(u.anfragen_neu, 'One new request', 'new requests') + ' in the inbox' : u.anfragen_offen ? mal(u.anfragen_offen, 'One request', 'requests') + ' still open' : 'The inbox is empty'}</b>
      <span>${u.ohne_antwort ? mal(u.ohne_antwort, 'One question', 'questions') + ' without an answer. Add it once, then the chat ' + (S.ue && !S.ue.online ? 'in this tool ' : '') + 'answers itself.' : 'Every question to the chat had an answer.'}${u.letzte_frage ? ' Last question ' + zeit(u.letzte_frage) + '.' : ''}</span></div>
    <button class="kn kn--linie" type="button" id="l-neu">Reload<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.8h-2.8"/></svg></i></button>
    <button class="kn${u.anfragen_neu ? ' kn--gold glanz-kn' : ''}" type="button" id="l-eingang">To the inbox<i>${PF}</i></button>`;
  $('#l-neu').onclick = () => frisch(true);
  $('#l-eingang').onclick = () => gehe('eingang');
}
function kopf(mono, titel, satz, knoepfe = '', foto = '') {
  return `<header class="titel"${foto ? ` data-kb="${foto}"` : ''}><span class="zier"><i></i>${ZEICHEN}<span>${mono}</span><i></i></span><h1>${titel}</h1>${satz ? `<p class="satz">${satz}</p>` : ''}${knoepfe ? `<div class="titel__kn">${knoepfe}</div>` : ''}</header>`;
}
/* Demo line as its own quiet line in the flow, never floating over content (M26) */
function demoZeile() { return S.ue && S.ue.demo ? `<p class="demo-zeile"><b>Demo</b> · the chat answers without a model and nothing is sent or uploaded. The entries marked «Example» are invented.${S.ue.online ? '' : ' What the team adds works in the chat of this tool, not yet in the chat on the website.'}</p>` : ''; }
/* Where added answers work (Abnahme 07.11.2026 C8): while the online part is off, only in the chat of this tool */
function nurHier() { return S.ue && !S.ue.online ? ' For now that is the chat of this tool; the chat on the website gets it once the online part is switched on.' : ''; }
function gehe(ziel, wahl = '') {
  if (textOffen()) return textVorher(() => gehe(ziel, wahl));   // «Text only»: store the change first, then switch (E17)
  const gs = $('#gs-seite'); if (gs) gs.hidden = true; document.body.classList.remove('gs-seite-offen');
  if (ziel === 'eingang' && S.ansicht === 'eingang' && wahl && $('#detail')) {   // in the inbox only switch the letter, the list stays
    const a = S.anfragen.find(x => x.id === wahl);
    if (a) {
      S.wahl = wahl; S.bearbeiten = '';
      $$('.re-a.aktiv').forEach(k => k.classList.remove('aktiv'));
      const k = $(`.re-a[data-wahl="${CSS.escape(wahl)}"]`); if (k) k.classList.add('aktiv');
      ruhigTauschen($('#detail'), detail(a)); verbindeEingang();
      if (innerWidth <= 1180) $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
  S.ansicht = ziel; S.wahl = wahl;
  try { localStorage.setItem('chat-team-ansicht', ziel); } catch (e) { /* private */ }
  if (location.hash.slice(1) !== ziel) history.replaceState(null, '', '#' + ziel);
  rand(); zeichne(); window.scrollTo(0, 0);
  $('#rand').classList.remove('auf');
}
async function frisch(neu = false) {
  if (textOffen()) return textVorher(() => frisch(neu));
  try {
    S.ue = await api('ueberblick');
    if (neu) { S.anfragen = null; S.fragen = null; }
    rand(); leiste(); await zeichne();
    if (neu) quit('Reloaded', '', [], false, 2500);
  } catch (e) { fehler(e); }
}

/* ---------- Views ---------- */
async function zeichne() {
  const el = $('#ansicht');
  try {
    if (S.ansicht === 'start') { await ladeAlles(); el.innerHTML = start(); }
    else if (S.ansicht === 'eingang') { await ladeAlles(); el.innerHTML = eingang(); verbindeEingang(); }
    else if (S.ansicht === 'gefragt') { await ladeAlles(); el.innerHTML = gefragt(); verbindeGefragt(); }
    else if (S.ansicht === 'nachgetragen') { await ladeAlles(); el.innerHTML = nachgetragenS(); verbindeNachgetragen(); }
    else if (S.ansicht === 'wissen') { await ladeWissen(); el.innerHTML = wissenS(); verbindeWissen(); }
    $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl || ''));
    $$('#ansicht .re-n').forEach((x, i) => { x.classList.add('re-auf'); x.style.setProperty('--i', Math.min(i, 12)); });
  } catch (e) { fehler(e); }
}
async function ladeAlles() {
  if (!S.anfragen) { const d = await api('anfragen'); S.anfragen = d.anfragen; }
  if (!S.fragen) { const d = await api('fragen'); S.fragen = d.fragen; S.nachgetragen = d.nachgetragen; }
}

function start() {
  const u = S.ue, h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? 'Good morning.' : h >= 11 && h < 18 ? 'Good afternoon.' : 'Good evening.';
  const neueste = S.anfragen.slice(0, 4), fragen = S.fragen.slice(0, 5);
  return kopf(esc(N.werkzeug) + ' · ' + esc(HAUS.haus), `${gruss} <em>Who wrote?</em>`,
    'Here you see what customers ask the chat on the website. Whoever writes through the site or the chat window, for the waiting list, as press or partner, for an order or a return, is in the inbox, with a letter drafted for your reply. Only what you send yourself is sent.',
    `<a class="kn kn--linie" href="anleitung.html" target="_blank" rel="noopener">Guide<i>${PF}</i></a>`) + demoZeile() +
    `<div class="lage platte">
      <div class="lg"><span class="mono">Inbox</span><b>${u.anfragen_neu ? mal(u.anfragen_neu, 'One new request', 'new requests') : u.anfragen_offen ? mal(u.anfragen_offen, 'One open', 'open') : 'Nothing new'}</b><span>${u.anfragen_gesamt ? mal(u.anfragen_gesamt, 'One request', 'requests') + ' from the website so far.' : 'As soon as a customer writes through the site, it is here.'}</span><button type="button" data-gehe="eingang">To the inbox</button></div>
      <div class="lg"><span class="mono">Without answer</span><b>${u.ohne_antwort ? mal(u.ohne_antwort, 'One question', 'questions') : 'No gap'}</b><span>${u.ohne_antwort ? 'Nothing about it on the website. Adding it once is enough.' : 'Every question had an answer.'}</span><button type="button" data-gehe="gefragt" data-wahl="luecke">See the questions</button></div>
      <div class="lg"><span class="mono">Asked</span><b>${mal(u.fragen_gesamt, 'One question', 'questions')}</b><span>${u.letzte_frage ? 'Last on ' + zeit(u.letzte_frage) + '.' : 'No question to the chat yet.'}${u.nachgetragen_gesamt ? ' ' + mal(u.nachgetragen_gesamt, 'One answer', 'answers') + ' added by the team.' : ''}</span><button type="button" data-gehe="gefragt">All questions</button></div>
    </div>
    ${S.anfragen.length ? arten() : ''}
    <div class="re-start">
      <section class="re-start__sp"><h2 class="zw">Latest <em>requests</em></h2>
        ${neueste.length ? `<div class="re-liste">${neueste.map((a, i) => karteAnfrage(a, i + 1)).join('')}</div><button class="link re-mehr" type="button" data-gehe="eingang">All ${S.anfragen.length} requests in the inbox</button>`
          : `<div class="re-leer platte">${ZEICHEN_H}<b>The inbox is empty.</b><p>When a customer writes through the site or the chat window and gives a name and an e-mail address, the request is here.</p></div>`}
      </section>
      <section class="re-start__sp"><h2 class="zw">Latest <em>questions</em></h2>
        ${fragen.length ? `<div class="re-liste re-qliste">${fragen.slice(0, 4).map(frageKarte).join('')}</div><button class="link re-mehr" type="button" data-gehe="gefragt">See all ${S.fragen.length} questions</button>`
          : `<div class="re-leer platte">${ZEICHEN_H}<b>No question yet.</b><p>As soon as customers ask the chat, it is here.</p></div>`}
      </section>
    </div>`;
}
/* «Latest questions» as cards like the requests (Robert 15.10.2026): photo of the topic, language as a mark, question large, answer in one line, state right */
const THEMABILD = { 'Orders & shipping': 'media/shoot/print-900.webp', 'Sizes & pieces': 'media/pieces/tee-front.webp', 'Returns & payment': 'media/shop/tee-fp-back-480.webp',
  'The app & the code': 'media/shoot/code-800.webp', 'Press & partners': 'media/shoot/desk-900.webp', 'Account & privacy': 'media/shoot/face-800.webp', 'Contact & company': 'media/shoot/hero-900.webp', 'Other questions': 'media/shoot/stairs-800.webp' };
// an answer in one line: each line of a list and each paragraph becomes a sentence (Blick 07.11.2026 Fund 6)
function antwortZeile(t) {
  return String(t || '').split('\n').map(l => l.trim().replace(/^- /, '')).filter(Boolean).map(l => /[.!?:;…»"']$/.test(l) ? l : l + '.').join(' ');
}
function frageKarte(f) {
  const offen = !f.belegt && !f.erledigt, d = new Date(f.zeit);
  const wann = isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `<button class="re-a re-q${offen ? ' re-q--offen' : ''}" type="button" data-gehe="gefragt"${offen ? ' data-wahl="luecke"' : ''}>
    <span class="re-a__bild" aria-hidden="true"><img src="${THEMABILD[f.gruppe] || THEMABILD['Other questions']}" alt="" width="900" height="675" decoding="async"></span>
    <span class="re-a__n"><span class="re-a__k"><i class="re-q__sp">${esc((f.sprache || '').toUpperCase())}</i>${esc(f.gruppe || 'Other questions')}${f.beispiel ? ' · Example' : ''}</span><b dir="auto">${esc(f.frage)}</b><small dir="auto">${offen ? 'Nothing about it on the website. Add it once, then the chat answers itself.' : esc(antwortZeile(f.antwort))}</small></span>
    <span class="re-a__st">${offen ? 'Without answer' : 'Answered'}<small>${esc(wann)}</small></span></button>`;
}
function arten() {   // the kinds of request and how many of each lie in the inbox
  return `<div class="re-arten">${Object.keys(ART).map((k, i) => { const l = S.anfragen.filter(a => a.art === k), o = l.filter(a => a.status !== 'erledigt').length;
    return `<button class="re-art re-auf" style="--i:${i + 1}" type="button" data-gehe="eingang">${bild(k, 're-art__bild')}<b>${esc(ART_LANG[k] || ART[k])}</b><span>${l.length ? mal(l.length, 'one request', 'requests') + (o ? ' · ' + o + ' open' : '') : 'none yet'}</span></button>`; }).join('')}</div>`;
}

/* ---------- Inbox ---------- */
function karteAnfrage(a, i = 0) {
  const st = a.status === 'neu' ? 'New' : a.status === 'erledigt' ? 'Done' : a.entwurf ? 'Letter ready' : 'Read';
  return `<button class="re-a${a.status === 'neu' ? ' neu' : ''}${a.status === 'erledigt' ? ' erledigt' : ''}${S.wahl === a.id && S.ansicht === 'eingang' ? ' aktiv' : ''}" style="--i:${i}" type="button" data-gehe="eingang" data-wahl="${esc(a.id)}">
    ${bild(a.art, 're-a__bild')}
    <span class="re-a__n"><span class="re-a__k">${esc(ART[a.art] || a.art)} · ${esc(uhr(a.zeit))}${a.beispiel ? ' · Example' : ''}</span><b><bdi>${esc(a.name || 'Without a name')}</bdi></b><small>${[a.seite ? 'Page ' + a.seite : '', SPRACHE[a.sprache] || a.sprache, a.verlauf && a.verlauf.length > 1 ? 'via the chat' : 'via the form'].filter(Boolean).map(x => `<bdi>${esc(x)}</bdi>`).join(' · ')}</small></span>
    <span class="re-a__st">${st}</span></button>`;
}
function tagVon(iso) {   // Today, Yesterday, weekday, otherwise Earlier
  const d = new Date(iso), h = new Date(); h.setHours(0, 0, 0, 0);
  const t = Math.round((h - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
  return t <= 0 ? 'Today' : t === 1 ? 'Yesterday' : t < 7 ? d.toLocaleDateString('en-GB', { weekday: 'long' }) : 'Earlier';
}
function eingang() {
  const alle = S.anfragen, f = S.filter;
  const l = f === 'offen' ? alle.filter(a => a.status !== 'erledigt') : f === 'erledigt' ? alle.filter(a => a.status === 'erledigt') : alle;
  if ((!S.wahl || !alle.some(a => a.id === S.wahl)) && alle.length) S.wahl = (l.find(a => a.status === 'neu') || l[0] || alle[0]).id;
  const a = alle.find(x => x.id === S.wahl);
  const tage = []; l.forEach(x => { const t = tagVon(x.zeit); const g = tage.find(y => y.t === t); g ? g.l.push(x) : tage.push({ t, l: [x] }); });
  let n = 0;
  const zahl = k => k === 'offen' ? alle.filter(a => a.status !== 'erledigt').length : k === 'erledigt' ? alle.filter(a => a.status === 'erledigt').length : alle.length;
  return kopf('Inbox', 'Requests <em>from the website.</em>',
    'Waiting list, press, partners, support and messages that customers sent through the site or the chat window. For every request the assistant drafts a letter in the tone of txtme.social. You read, change and send yourself.' + (alle.some(x => x.beispiel) ? ' The requests marked «Example» are invented and show how the inbox works.' : '')) + demoZeile() +
    (alle.length ? `<div class="re-eingang"><div class="re-spalte">
        <div class="wahl2 re-filter" role="group" aria-label="Selection">${[['alle', 'All'], ['offen', 'Open'], ['erledigt', 'Done']].map(([k, t]) => `<button type="button" data-filter="${k}" aria-pressed="${f === k}">${t}<i>${zahl(k)}</i></button>`).join('')}</div>
        <div class="re-liste">${tage.map(g => `<p class="re-tag"><span>${esc(g.t)}</span></p>${g.l.map(x => karteAnfrage(x, n++)).join('')}`).join('') || '<p class="re-tag"><span>Nothing in this selection</span></p>'}</div></div>
        <div class="re-detail" id="detail">${a ? detail(a) : ''}</div></div>`
      : `<div class="re-leer platte">${ZEICHEN_H}<b>The inbox is empty.</b><p>As soon as a customer writes through the site and gives a name and an e-mail address, the request is here.</p></div>`);
}
/* Contact details are plain text to copy, never a mailto: or tel: link (Fehlerbuch Schlössli 21.10.2026) */
function kontaktText(k) { return `<bdi class="re-kontakt">${esc(String(k || '').trim()).replace('@', '<wbr>@')}</bdi>`; }   // an e-mail breaks only before the @ (Blick 07.11.2026 Fund 3)
const KLAMMER = /\[[^\]\n]+\]/g;
function briefText(t) {   // paragraphs, lines, and the parts in [brackets] as open fields
  return esc(t).split(/\n{2,}/).map(abs => `<p>${abs.replace(/\[([^\]\n]+)\]/g, '<mark class="offen-feld"><i>open</i>$1</mark>').replace(/\n/g, '<br>')}</p>`).join('');
}
/* Answer of the chat as a set answer: sender, paragraphs, lines «- keyword: fact» as a list with the keyword in bold (Fehlerbuch Schlössli 20.10.2026) */
function antwortHTML(t) {
  const abs = String(t || '').split(/\n{2,}/).map(x => x.trim()).filter(Boolean);
  return abs.map(a => {
    const z = a.split('\n');
    if (z.every(l => /^- /.test(l))) return '<ul>' + z.map(l => { const m = /^- ([^:]{1,40}):\s*(.+)$/.exec(l); return m ? `<li><b>${esc(m[1])}:</b> ${esc(m[2])}</li>` : `<li>${esc(l.slice(2))}</li>`; }).join('') + '</ul>';
    return `<p>${esc(a).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
function textBrief(a, e, rtl) {   // «Text only»: subject and text as fields; the subject wraps like in the set letter (Fehlerbuch 20.10.2026)
  return `<article class="brief brief--bearb">
          <header class="brief__kopf">${ZEICHEN_H}<span>${esc(HAUS.brief.zeile)}</span></header>
          <dl class="brief__an">
            <div><dt>To</dt><dd><bdi>${esc(a.name || '')}</bdi><small>${esc(a.kontakt || '')}</small></dd></div>
            <div><dt>From</dt><dd>${esc(e.absender || HAUS.support)}<small>${esc(ART[a.art] || a.art)}</small></dd></div>
            <div class="brief__betreff"><dt>Subject</dt><dd><textarea id="e-betreff" rows="1" dir="auto">${esc(e.betreff)}</textarea></dd></div>
          </dl>
          <div class="brief__text"${rtl}><textarea id="e-text"${rtl} dir="auto" spellcheck="true">${esc(e.text)}</textarea></div>
          <footer class="brief__fuss">${esc(HAUS.brief.fuss).replace(/\n/g, '<br>')}</footer>
        </article>`;
}

/* ---------- The letter as a design surface (Robert 15.10.2026: «edit like in Canva … move, enlarge, write directly in the field»). Every part of the letter is a block (data-b):
   one click selects it (frame with corners and bar), dragging moves it, corners scale the type, sides change the width, double click or second click writes into it.
   Arrangement per letter in entwurf.gestalt, text in entwurf.text/betreff; saved by itself. Moved only via transform. */
const GKOPF = { zeile: HAUS.brief.zeile, fuss: HAUS.brief.fuss };
/* Photos of txtme.social to put into the letter (public/media/shoot) */
const BRIEFBILDER = [['shoot/hero-900', 'The shirt with the code'], ['shoot/code-800', 'The code on the back'], ['shoot/friends-900', 'Friends in Amsterdam'], ['shoot/print-900', 'The print table'],
  ['shoot/desk-900', 'At the desk'], ['shoot/cube-800', 'The ADE cube'], ['shoot/tram-800', 'In the tram'], ['shoot/night-900', 'Amsterdam at night'],
  ['pieces/tee-front', 'T-Shirt Festival Print, front'], ['pieces/tee-back', 'T-Shirt Festival Print, back'], ['pieces/tank-front', 'Tank Top, front'], ['pieces/crop-front', 'Cropped Top, front'], ['shop/cap-front-480', 'Cap']];
/* One typeface: Space Grotesk in its weights (DESIGN.md); the keys stay those of the template so saved arrangements keep working */
const SCHRIFT = { serif: 'font-family:var(--serif);font-weight:600', sans: 'font-family:var(--sans);font-weight:400', mono: 'font-family:var(--mono);font-weight:500', cinzel: 'font-family:var(--caps);font-weight:700', versal: 'font-family:var(--caps);font-weight:600;letter-spacing:.16em;text-transform:uppercase' };
const SCHRIFTNAME = { serif: 'Bold', sans: 'Regular', mono: 'Medium', cinzel: 'Black' };
const TEXTART = { normal: 'font-style:normal;text-transform:none;letter-spacing:0', kursiv: 'font-style:italic', versal: 'text-transform:uppercase;letter-spacing:.16em', medium: 'font-weight:500' };
/* House palette of txtme.social (DESIGN.md, the only colours) */
const HFARBE = { ink: '#0b0b0c', surface: '#131315', tinte2: '#5b5954', muted: '#9d9b96', bone: '#efece6', bright: '#f4f2ee', cyan: '#60c4e3', pink: '#eb5986' };
const HNAME = { ink: 'Ink', surface: 'Surface', tinte2: 'Dark grey', muted: 'Muted', bone: 'Bone', bright: 'Bright', cyan: 'Cyan', pink: 'Pink' };
const LFARBE = { taupe: 'rgba(11,11,12,.28)', gold: '#60c4e3', navy: '#0b0b0c' };
const LNAME = { taupe: 'Line', gold: 'Cyan', navy: 'Ink' };
const GNAME = { linie1: 'Line under the head', linie2: 'Line above the subject', linie3: 'Line above the footer', zeichen: 'Logo', zeile: 'Subline', an: 'Recipient', von: 'Sender', betreff: 'Subject', fuss: 'Footer' };
const gName = k => GNAME[k] || (/^p\d+$/.test(k) ? 'Paragraph ' + (+k.slice(1) + 1) : 'Photo');
function gStil(g, bild = false) {
  if (!g) return '';
  const l = [];
  if (bild && g.al) l.push(`margin-left:${g.al === 'left' ? 0 : 'auto'}`, `margin-right:${g.al === 'right' ? 0 : 'auto'}`);
  if (g.dx || g.dy) l.push(`--dx:${g.dx || 0}px`, `--dy:${g.dy || 0}px`);
  if (g.s && g.s !== 1) l.push(`--s:${g.s}`);
  if (g.w) l.push(`width:${g.w}px`, 'max-width:none');
  if (g.al) l.push(`text-align:${g.al}`);
  if (g.mb) l.push(`--mb:${g.mb}px`);
  if (g.f && SCHRIFT[g.f]) l.push(SCHRIFT[g.f]);
  if (g.st) l.push(`--lst:${g.st}px`);
  if (g.fb && (LFARBE[g.fb] || HFARBE[g.fb])) l.push(`--lfb:${LFARBE[g.fb] || HFARBE[g.fb]}`);
  if (g.ta && TEXTART[g.ta]) l.push(TEXTART[g.ta]);
  if (g.c && HFARBE[g.c]) l.push(`color:${HFARBE[g.c]}`);
  if (g.lh) l.push(`line-height:${g.lh}`);
  if (g.ls != null) l.push(`letter-spacing:${g.ls}em`);
  if (g.op != null && g.op < 1) l.push(`opacity:${g.op}`);
  if (g.z) l.push(`z-index:${g.z + 2}`);
  if (g.mt) l.push(`--mt:${g.mt}px`);
  if (g.ar) l.push(`--ar:${g.ar}`);
  if (g.ox != null || g.oy != null) l.push(`--ox:${g.ox == null ? 50 : g.ox}%`, `--oy:${g.oy == null ? 50 : g.oy}%`);
  return l.length ? ` style="${l.join(';')}"` : '';
}
function feldHTML(t) {   // text with lines and open parts, editable
  return esc(t).replace(/\[([^\]\n]+)\]/g, '<mark class="offen-feld">$1</mark>').replace(/\n/g, '<br>');
}
function gestaltBrief(a, e, rtl) {
  const G = e.gestalt || {}, ab = e.text.split(/\n{2,}/), bilder = G._bilder || [];
  const bk = (k, cls, inhalt, schreib = true, extra = '') => `<div class="gs ${cls}" data-b="${k}"${schreib ? ' data-schreib' : ''}${extra}${gStil(G[k], cls === 'gs--bild' || cls === 'gs--linie')}>${inhalt}</div>`;
  const linie = k => (G[k] && G[k].aus) ? '' : bk(k, 'gs--linie', '<i></i>', false);
  const kt = k => feldHTML((G[k] && typeof G[k].t === 'string') ? G[k].t : GKOPF[k]);
  const fotos = nach => bilder.filter(b => b.nach === nach).map(b => bk(b.id, 'gs--bild', `<img src="media/${esc(b.k)}.webp" alt="${esc(b.n || '')}" draggable="false">`, false)).join('');
  return `<div class="gs-flaeche"><div class="gs-werk" role="toolbar" aria-label="Design the letter">
          <div class="gs-werk__grp"><button class="gs-werk__k" type="button" data-w="zurueck" aria-label="Undo" data-tip="Undo (⌘Z)"><svg viewBox="0 0 16 16"><path d="M5.5 4 2.5 7l3 3M2.8 7H10a3.5 3.5 0 0 1 0 7H8"/></svg></button><button class="gs-werk__k" type="button" data-w="vor" aria-label="Redo" data-tip="Redo (⇧⌘Z)"><svg viewBox="0 0 16 16"><path d="M10.5 4l3 3-3 3M13.2 7H6a3.5 3.5 0 0 0 0 7h2"/></svg></button></div>
          <div class="gs-werk__grp gs-werk__schrift" role="group" aria-label="Weight"><button class="gs-werk__k gs-sel" type="button" data-g="f-serif" data-tip="Bold"><b style="font-weight:700;font-size:15px">Aa</b></button><button class="gs-werk__k gs-sel" type="button" data-g="f-mono" data-tip="Medium"><b style="font-weight:500;font-size:14px">Aa</b></button><button class="gs-werk__k gs-sel" type="button" data-g="f-sans" data-tip="Regular"><b style="font-weight:400;font-size:14px">Aa</b></button></div>
          <div class="gs-werk__grp"><button class="gs-werk__k gs-sel" type="button" data-g="kleiner" aria-label="Smaller" data-tip="Smaller"><svg viewBox="0 0 16 16"><path d="M3.5 8h9"/></svg></button><span class="gs-werk__wert" id="gs-gr">–</span><button class="gs-werk__k gs-sel" type="button" data-g="groesser" aria-label="Larger" data-tip="Larger"><svg viewBox="0 0 16 16"><path d="M3.5 8h9M8 3.5v9"/></svg></button></div>
          <div class="gs-werk__grp"><button class="gs-werk__k gs-sel" type="button" data-g="left" aria-label="Align left" data-tip="Align left"><svg viewBox="0 0 16 16"><path d="M3 4h10M3 8h6M3 12h8"/></svg></button><button class="gs-werk__k gs-sel" type="button" data-g="center" aria-label="Centre" data-tip="Centre"><svg viewBox="0 0 16 16"><path d="M3 4h10M5 8h6M4 12h8"/></svg></button><button class="gs-werk__k gs-sel" type="button" data-g="right" aria-label="Align right" data-tip="Align right"><svg viewBox="0 0 16 16"><path d="M3 4h10M7 8h6M5 12h8"/></svg></button></div>
          <div class="gs-werk__grp gs-werk__farbe" role="group" aria-label="Line colour"><button class="gs-werk__k gs-sel" type="button" data-g="fb-taupe" data-tip="Line grey"><i style="background:rgba(11,11,12,.35)"></i></button><button class="gs-werk__k gs-sel" type="button" data-g="fb-gold" data-tip="Line cyan"><i style="background:#60c4e3"></i></button><button class="gs-werk__k gs-sel" type="button" data-g="fb-navy" data-tip="Line ink"><i style="background:#0b0b0c"></i></button></div>
          <div class="gs-werk__grp"><button class="gs-werk__k gs-sel" type="button" data-g="enger" aria-label="Less space below" data-tip="Less space"><svg viewBox="0 0 16 16"><path d="M3 3h10M3 13h10M8 5.5v5M6 8.5l2 2 2-2"/></svg></button><button class="gs-werk__k gs-sel" type="button" data-g="weiter" aria-label="More space below" data-tip="More space"><svg viewBox="0 0 16 16"><path d="M3 3h10M3 13h10M8 5.5v5M6 7.5l2-2 2 2"/></svg></button></div>
          <div class="gs-werk__grp"><button class="gs-werk__k gs-sel" type="button" data-g="schreiben" aria-label="Edit text" data-tip="Edit text"><svg viewBox="0 0 16 16"><path d="M10.5 3.5l2 2L6 12H4v-2z"/></svg></button><button class="gs-werk__k gs-sel" type="button" data-g="zurueck" aria-label="Reset this part" data-tip="Reset part"><svg viewBox="0 0 16 16"><path d="M4 8a4 4 0 1 0 1.2-2.9M4 3v2.6h2.6"/></svg></button><button class="gs-werk__k gs-sel" type="button" data-g="weg" aria-label="Remove photo" data-tip="Remove photo"><svg viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg></button></div>
          <span class="gs-werk__t"></span>
          <div class="gs-werk__grp"><button class="gs-werk__k gs-werk__k--text" type="button" data-w="foto"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="m2.5 11 3.5-3.5 3 3 2-2 2.5 2.5"/><circle cx="10.5" cy="6" r="1"/></svg>Photo</button><button class="gs-werk__k gs-werk__k--text" type="button" data-w="vorlage"><svg viewBox="0 0 16 16"><path d="M4 8a4 4 0 1 0 1.2-2.9M4 3v2.6h2.6"/></svg>Original</button></div>
        </div>
        <p class="gs-hinweis"><span id="gs-name">Click a part of the letter to design it.</span><span class="gs-werk__stand" id="gs-stand">Saved</span></p>
        <article class="brief brief--gestalt" id="brief" data-id="${esc(a.id)}">
          ${bk('zeichen', 'gs--zeichen', ZEICHEN_H, false)}
          ${bk('zeile', 'gs--zeile', kt('zeile'))}
          ${linie('linie1')}
          <div class="brief__an">
            ${bk('an', 'gs--an', `<dt>To</dt><dd><bdi>${esc(a.name || '')}</bdi><small>${esc(a.kontakt || '')}</small></dd>`, false)}
            ${bk('von', 'gs--an', `<dt>From</dt><dd>${esc(e.absender || HAUS.support)}<small>${esc(ART[a.art] || a.art)}</small></dd>`, false)}
          </div>
          ${linie('linie2')}
          <div class="brief__betreff"><span class="gs-mono">Subject</span>${bk('betreff', 'gs--betreff', feldHTML(e.betreff), true, ' dir="auto"')}</div>
          ${fotos('kopf')}
          <div class="brief__text"${rtl}>${ab.map((x, n) => bk('p' + n, 'gs--p', feldHTML(x), true, ' dir="auto"') + fotos('p' + n)).join('')}</div>
          ${linie('linie3')}
          ${bk('fuss', 'gs--fuss', kt('fuss'))}
          <div class="gw" id="gw" hidden>
            <i class="gw__e" data-h="nw"></i><i class="gw__e" data-h="ne"></i><i class="gw__e" data-h="sw"></i><i class="gw__e" data-h="se"></i>
            <i class="gw__s" data-h="w"></i><i class="gw__s" data-h="e"></i>
            <span class="gw__name" id="gw-name"></span>
          </div>
        </article></div>`;
}
function textAus(el) {   // block → text: <br> and lines become \n, open fields become [brackets] again
  let t = '';
  el.childNodes.forEach(n => {
    if (n.nodeType === 3) t += n.nodeValue;
    else if (n.nodeName === 'BR') t += '\n';
    else if (n.nodeName === 'MARK') { const x = n.textContent.trim(); if (x) t += '[' + x + ']'; }
    else if (n.nodeName === 'DIV' || n.nodeName === 'P') t += (t && !t.endsWith('\n') ? '\n' : '') + textAus(n);
    else t += n.textContent;
  });
  return t.replace(/ /g, ' ');
}
/* The letter as a mail: the same sizes, alignment, spaces and photos, with tables and inline styles so mail programs show it the same.
   Free moves a mail does not know: downwards becomes space, to the right becomes indent. Exactly the same is only the PDF. */
function briefMail(a, e) {
  const G = e.gestalt || {}, bilder = G._bilder || [], basis = new URL('.', location.href).href;
  const fam = "font-family:'Space Grotesk',Helvetica,Arial,sans-serif";
  const st = (k, fs, extra = '') => { const g = G[k] || {}; const l = [`font-size:${Math.round(fs * (g.s || 1) * 10) / 10}px`, extra];
    if (g.al) l.push(`text-align:${g.al}`); if (g.f === 'versal') l.push('letter-spacing:.16em;text-transform:uppercase;font-weight:600'); if (g.f === 'sans') l.push('font-weight:400'); if (g.f === 'serif') l.push('font-weight:600'); if (g.f === 'cinzel') l.push('font-weight:700'); if (g.f === 'mono') l.push('font-weight:500'); if (g.ta && TEXTART[g.ta]) l.push(TEXTART[g.ta]); if (g.c && HFARBE[g.c]) l.push(`color:${HFARBE[g.c]}`); if (g.lh) l.push(`line-height:${g.lh}`); if (g.ls != null) l.push(`letter-spacing:${g.ls}em`); const oben = Math.max(0, (g.dy || 0) + (g.mt || 0)), unten = (g.mb || 0); if (oben) l.push(`padding-top:${oben}px`); if (unten > 0) l.push(`padding-bottom:${unten}px`);
    if ((g.dx || 0) > 0) l.push(`padding-left:${g.dx}px`); return l.filter(Boolean).join(';'); };
  const t = x => esc(x).replace(/\n/g, '<br>');
  const kt = k => t((G[k] && typeof G[k].t === 'string') ? G[k].t : GKOPF[k]);
  const fotos = nach => bilder.filter(b => b.nach === nach).map(b => { const g = G[b.id] || {}; const w = Math.round(Math.min(560, (g.w || 560) * (g.s || 1)));
    return `<tr><td style="padding:6px 0 18px;${g.al ? 'text-align:' + g.al : 'text-align:center'}"><img src="${basis}media/${b.k}.webp" width="${w}" alt="${esc(b.n || '')}" style="display:inline-block;width:${w}px;max-width:100%;height:auto;border:0"></td></tr>`; }).join('');
  const mLinie = (k, pad) => { const g = G[k] || {}; if (g.aus) return ''; const w = g.w ? Math.min(504, g.w) + 'px' : '100%', al = g.al || 'center', farbe = { taupe: '#d9d6d0', gold: '#60c4e3', navy: '#0b0b0c' }[g.fb || 'taupe'] || HFARBE[g.fb];
    return `<tr><td style="padding:${pad};text-align:${al}"><div style="display:inline-block;width:${w};height:${g.st || 1}px;background:${farbe};line-height:1px;font-size:1px">&nbsp;</div></td></tr>`; };
  const ab = e.text.split(/\n{2,}/);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#f7f5f1;border:1px solid #d9d6d0">
<tr><td style="padding:44px 48px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding-bottom:8px"><img src="${basis}media/logo.png" width="${Math.round(72 * ((G.zeichen || {}).s || 1))}" alt="txtme.social" style="height:auto;border:0"></td></tr>
<tr><td style="${st('zeile', 9.5, `text-align:center;letter-spacing:.22em;text-transform:uppercase;${fam};font-weight:600;color:#5b5954;padding-top:6px`)}">${kt('zeile')}</td></tr>
${mLinie('linie1', '22px 0 24px')}
${mLinie('linie2', '0 0 14px')}
<tr><td style="${fam};font-size:9.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#5b5954">Subject</td></tr>
<tr><td style="${st('betreff', 21, fam + ';font-weight:600;color:#0b0b0c;padding:4px 0 28px;line-height:1.25')}">${t(e.betreff)}</td></tr>
${fotos('kopf')}
${ab.map((x, n) => `<tr><td dir="auto" style="${st('p' + n, 16, fam + ';line-height:1.65;color:#0b0b0c;padding-bottom:' + (16 + Math.max(0, (G['p' + n] || {}).mb || 0)) + 'px')}">${t(x)}</td></tr>${fotos('p' + n)}`).join('\n')}
${mLinie('linie3', '30px 0 0')}
<tr><td style="${st('fuss', 9.5, `text-align:center;letter-spacing:.14em;text-transform:uppercase;${fam};font-weight:500;color:#5b5954;line-height:1.9;padding-top:14px`)}">${kt('fuss')}</td></tr>
</table></td></tr></table></td></tr></table>`;
}
function briefPDF() {   // only the letter, as designed, through the print dialog of the browser («Save as PDF»)
  const br = $('#brief'); if (!br) return;
  const k = br.cloneNode(true); k.querySelector('#gw')?.remove(); $$('.gs--wahl,.gs--schreib', k).forEach(x => x.classList.remove('gs--wahl', 'gs--schreib'));
  const css = $$('link[rel="stylesheet"]').map(l => `<link rel="stylesheet" href="${l.href}">`).join('');
  $('#brief-druck')?.remove();
  const f = document.createElement('iframe'); f.id = 'brief-druck'; f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(f); const w = f.contentWindow;
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(document.querySelector('.gs--betreff')?.textContent || 'Letter')}</title>${css}
    <style>@page{size:A4;margin:12mm}html,body{background:#fff!important}body{padding:0;margin:0}.brief{margin:0 auto!important;box-shadow:none!important;max-width:none!important}.brief::before{inset:10px}.gs{cursor:default!important;box-shadow:none!important}</style></head>
    <body class="bu re">${k.outerHTML}</body></html>`);
  w.document.close();
  const los = () => setTimeout(() => { w.focus(); w.print(); }, 350);
  if (w.document.readyState === 'complete') los(); else f.onload = los;
  quit('Print window', 'In the print window choose «Save as PDF».', [], false, 6000);
}
function verbindeBrief(a) {
  const br = $('#brief'); if (!br) return;
  const e = a.entwurf; e.gestalt = e.gestalt || {};
  let G = e.gestalt;
  S.gesichert = S.gesichert || {};
  if (!G._orig) G._orig = { text: e.text, betreff: e.betreff };
  S.gesichert[a.id] = JSON.stringify([e.betreff, e.text, G]);   // as loaded or last saved   // for «Back to the original»
  const gw = $('#gw', br), stand = $('#gs-stand');
  const V = S.verlauf[a.id] = S.verlauf[a.id] || { hist: [], zukunft: [] };
  let wahl = null, uhr = null, vorher = null;
  const schnapp = () => JSON.stringify({ text: e.text, betreff: e.betreff, gestalt: G });
  const merke = alt => { if (alt && alt !== schnapp()) { V.hist.push(alt); if (V.hist.length > 80) V.hist.shift(); V.zukunft = []; knoepfe(); } };
  const knoepfe = () => { const z = $('.gs-werk [data-w="zurueck"]'), v = $('.gs-werk [data-w="vor"]'); if (z) z.disabled = !V.hist.length; if (v) v.disabled = !V.zukunft.length; };
  const lies = () => {   // DOM → text of the letter
    const ab = $$('.gs--p', br).map(textAus).map(x => x.replace(/\n{3,}/g, '\n\n').trim()).filter(Boolean);
    e.text = ab.join('\n\n'); e.betreff = textAus($('.gs--betreff', br)).replace(/\s*\n\s*/g, ' ').trim();
    ['zeile', 'fuss'].forEach(k => { const el = $(`[data-b="${k}"]`, br); const t = textAus(el).trim(); if (t !== GKOPF[k]) (G[k] = G[k] || {}).t = t; else if (G[k]) delete G[k].t; });
  };
  /* Saving with the version number: a second window with an older number gets KONFLIKT, nothing is overwritten (E21); after a failed save it tries again up to five times (E17) */
  const sichern = (sofort = false) => {
    clearTimeout(uhr); if (stand) { stand.textContent = 'Saving …'; stand.classList.add('laeuft'); }
    const los = async (versuch = 0) => {
      const vorText = e.betreff + '\n' + e.text;
      if (br.isConnected) lies();
      if (vorText !== e.betreff + '\n' + e.text && S.en && S.en[a.id] && e.englisch && !(S.enAlt && S.enAlt[a.id])) {   // reading copy is now outdated
        S.enAlt = S.enAlt || {}; S.enAlt[a.id] = true;
        const k = $('.re-de__kopf');
        if (k) { k.insertAdjacentHTML('afterend', '<p class="re-de__hinweis">The letter was changed since the reading copy. <button class="link" type="button">Translate again</button></p>'); k.nextElementSibling.querySelector('button').onclick = () => englischHolen(a); }
      }
      const jetzt = JSON.stringify([e.betreff, e.text, G]);
      if (jetzt === S.gesichert[a.id]) { if (stand) { stand.textContent = 'Saved'; stand.classList.remove('laeuft'); } return; }   // nothing new: no resend that could overwrite a later change
      try { const d = await api('anfrage', { id: a.id, betreff: e.betreff, entwurf_text: e.text, gestalt: G, fassung: a.fassung || 0 }); a.fassung = d.fassung; S.gesichert[a.id] = jetzt; if (stand) { stand.textContent = 'Saved'; stand.classList.remove('laeuft'); } }
      catch (x) {
        if (/^KONFLIKT/.test(String(x.message))) { if (stand) stand.textContent = 'Not saved'; return quit('Another window was faster', 'This letter was saved elsewhere. Reload to see the newer version; your text stays here until then.', [['Reload', () => { S.anfragen = null; frisch(); }]], true, 12000); }
        if (versuch < 5) { if (stand) stand.textContent = 'Saving again …'; return setTimeout(() => los(versuch + 1), 1500 * (versuch + 1)); }
        if (stand) stand.textContent = 'Not saved'; fehler(x);
      }
    };
    if (sofort) return los();
    uhr = setTimeout(los, 700);
  };
  S.briefSichern = () => sichern(true);
  const neu = () => { e.gestalt = G; neuDetail(a); };
  const lade = j => { const d = JSON.parse(j); e.text = d.text; e.betreff = d.betreff; G = e.gestalt = d.gestalt; neu(); api('anfrage', { id: a.id, betreff: e.betreff, entwurf_text: e.text, gestalt: G, fassung: a.fassung || 0 }).then(d2 => { a.fassung = d2.fassung; }).catch(fehler); };
  S.briefZurueck = () => { if (!V.hist.length) return; V.zukunft.push(schnapp()); lade(V.hist.pop()); };
  S.briefVor = () => { if (!V.zukunft.length) return; V.hist.push(schnapp()); lade(V.zukunft.pop()); };
  const setze = (el, k) => { const st = gStil(G[k] || {}, el.classList.contains('gs--bild') || el.classList.contains('gs--linie')); el.setAttribute('style', st ? st.slice(8, -1) : ''); };
  const rahmen = () => {
    if (!wahl) { gw.hidden = true; werk(); return; }
    const r = wahl.getBoundingClientRect(), b = br.getBoundingClientRect();
    gw.hidden = false;
    gw.style.transform = `translate(${r.left - b.left - 6}px,${r.top - b.top - 6}px)`;
    gw.style.width = r.width + 12 + 'px'; gw.style.height = r.height + 12 + 'px';
    gw.classList.toggle('gw--unten', r.top - b.top < 70);
    werk();
  };
  const werk = () => {   // fixed bar on top: what works with the selected part
    const k = wahl && wahl.dataset.b, g = (k && G[k]) || {}, bild = !!wahl && wahl.classList.contains('gs--bild'), lin = !!wahl && wahl.classList.contains('gs--linie');
    $$('.gs-werk .gs-sel').forEach(b => { const z = b.dataset.g; b.disabled = !wahl || (z === 'schreiben' && !wahl.hasAttribute('data-schreib')) || (z === 'weg' && !bild && !lin) || (bild && /^f-|kleiner|groesser/.test(z)) || (lin && /^f-|schreiben/.test(z)) || (!lin && /^fb-/.test(z)) || (k === 'zeichen' && /^f-/.test(z));
      b.setAttribute('aria-pressed', !!wahl && ((z === 'f-' + (g.f || '')) || z === g.al || (lin && z === 'fb-' + (g.fb || 'taupe')))); });
    const gr = $('#gs-gr'); if (gr) gr.textContent = lin ? (g.st || 1) + ' px' : wahl && !bild ? Math.round((g.s || 1) * 100) + ' %' : '–';
    const n = $('#gs-name'); if (n) n.textContent = wahl ? gName(k) + (wahl.hasAttribute('data-schreib') ? ' · double click to write, drag to move, corners for the size' : ' · drag to move, corners for the size') : 'Click a part of the letter to design it.';
    const gn = $('#gw-name'); if (gn) gn.textContent = wahl ? gName(k) : '';
    seite();
  };
  const waehle = el => { if (el && el !== wahl) S.seiteZu = ''; if (wahl && wahl !== el) { wahl.classList.remove('gs--wahl'); schluss(); } wahl = el; if (el) el.classList.add('gs--wahl'); rahmen(); };
  const schreib = el => {
    if (!el.hasAttribute('data-schreib')) return;
    vorher = vorher || schnapp();
    el.contentEditable = 'true'; el.classList.add('gs--schreib'); el.focus();
    const sel = getSelection(); if (sel && !el.contains(sel.anchorNode)) { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
  };
  const schluss = () => { $$('.gs--schreib', br).forEach(x => { x.contentEditable = 'false'; x.classList.remove('gs--schreib'); }); if (vorher) { lies(); merke(vorher); vorher = null; } };
  /* Guides and snapping: edges and centres of the paper and the other parts, 7 px; Alt holds the snapping off */
  const linien = l => { $$('.hl', br).forEach(n => n.remove()); const b = br.getBoundingClientRect();
    l.forEach(x => { const n = document.createElement('i'); n.className = 'hl ' + (x.x != null ? 'hl--x' : 'hl--y'); n.style.transform = x.x != null ? `translateX(${x.x - b.left}px)` : `translateY(${x.y - b.top}px)`; br.appendChild(n); }); };
  const fang = (el, r) => {
    const b = br.getBoundingClientRect(), cs = getComputedStyle(br), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
    const gx = [b.left + pl, b.left + b.width / 2, b.right - pr], gy = [];
    $$('.gs', br).forEach(o => { if (o === el) return; const q = o.getBoundingClientRect(); gx.push(q.left, q.left + q.width / 2, q.right); gy.push(q.top, q.top + q.height / 2, q.bottom); });
    const best = (werte, kand) => { let bd = 7, bv = null, bk = null; for (const w of werte) for (const k of kand) { const d = Math.abs(w - k); if (d < bd) { bd = d; bv = k - w; bk = k; } } return bv === null ? null : { d: bv, k: bk }; };
    const sx = best([r.left, r.left + r.width / 2, r.right], gx), sy = best([r.top, r.top + r.height / 2, r.bottom], gy);
    return { dx: sx ? sx.d : 0, dy: sy ? sy.d : 0, l: [...(sx ? [{ x: sx.k }] : []), ...(sy ? [{ y: sy.k }] : [])] };
  };
  $$('.gs', br).forEach(el => {
    el.addEventListener('input', () => { rahmen(); sichern(); });
    el.addEventListener('blur', () => { if (el.isContentEditable) setTimeout(() => { if (document.activeElement !== el) { schluss(); rahmen(); } }, 0); });
    el.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { el.blur(); schluss(); waehle(null); }
      if (ev.key === 'Enter' && !ev.shiftKey && el.dataset.b === 'betreff') ev.preventDefault();
      if (ev.key === 'Enter' && !ev.shiftKey && el.classList.contains('gs--p')) { ev.preventDefault(); document.execCommand('insertLineBreak'); }
    });
    el.addEventListener('paste', ev => { ev.preventDefault(); document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain')); });
    el.addEventListener('dblclick', () => { waehle(el); schreib(el); rahmen(); });
    el.addEventListener('pointerdown', ev => {
      if (el.isContentEditable || ev.button !== 0) return;
      ev.preventDefault();
      const k = el.dataset.b, g = G[k] = G[k] || {}, x0 = ev.clientX, y0 = ev.clientY, dx0 = g.dx || 0, dy0 = g.dy || 0, alt = schnapp();
      const b = br.getBoundingClientRect(), r = el.getBoundingClientRect();
      let zog = false;
      const zug = mv => {
        if (mv.buttons === 0) return los();   // released outside the window: end the drag (Master 9)
        let dx = mv.clientX - x0, dy = mv.clientY - y0;
        if (!zog && Math.hypot(dx, dy) < 4) return;
        if (!zog) { zog = true; waehle(el); br.classList.add('zieht'); }
        let f = { dx: 0, dy: 0, l: [] };
        if (!mv.altKey) f = fang(el, { left: r.left + dx, right: r.right + dx, top: r.top + dy, bottom: r.bottom + dy, width: r.width, height: r.height });
        dx += f.dx; dy += f.dy;
        g.dx = Math.round(Math.max(b.left - r.left + dx0 + 8, Math.min(b.right - r.right + dx0 - 8, dx0 + dx)));
        g.dy = Math.round(Math.max(b.top - r.top + dy0 + 8, Math.min(b.bottom - r.bottom + dy0 - 8, dy0 + dy)));
        el.style.setProperty('--dx', g.dx + 'px'); el.style.setProperty('--dy', g.dy + 'px'); rahmen(); linien(f.l);
      };
      const los = () => {
        removeEventListener('pointermove', zug); removeEventListener('pointerup', los); br.classList.remove('zieht'); linien([]);
        if (zog) { merke(alt); return sichern(); }
        if (wahl === el) { schreib(el); rahmen(); } else waehle(el);
      };
      addEventListener('pointermove', zug); addEventListener('pointerup', los);
    });
  });
  // corners: size (type or photo) · sides: width; snaps to edges and centres
  $$('[data-h]', gw).forEach(h => h.addEventListener('pointerdown', ev => {
    if (!wahl) return; ev.preventDefault(); ev.stopPropagation();
    const el = wahl, k = el.dataset.b, g = G[k] = G[k] || {}, x0 = ev.clientX, s0 = g.s || 1, r = el.getBoundingClientRect(), w0 = r.width, art = h.dataset.h, alt = schnapp();
    const links = art === 'w' || art === 'nw' || art === 'sw';
    const zug = mv => {
      let d = (mv.clientX - x0) * (links ? -1 : 1), l = [];
      if (!mv.altKey) { const kante = links ? r.left - d : r.right + d; const f = fang(el, { left: kante, right: kante, top: -1e5, bottom: -1e5, width: 0, height: 0 }); if (f.dx) { d += links ? -f.dx : f.dx; l = f.l.filter(x => x.x != null); } }
      if (art === 'w' || art === 'e' || el.classList.contains('gs--bild') || el.classList.contains('gs--linie')) { g.w = Math.round(Math.max(60, Math.min(br.clientWidth - 40, w0 + d))); }
      else { g.s = Math.round(Math.max(.3, Math.min(3.2, s0 * (w0 + d) / w0)) * 100) / 100; }
      setze(el, k); rahmen(); linien(l);
    };
    const los = () => { removeEventListener('pointermove', zug); removeEventListener('pointerup', los); linien([]); merke(alt); sichern(); };
    addEventListener('pointermove', zug); addEventListener('pointerup', los);
  }));
  $$('.gs-werk [data-g]').forEach(b => { b.onpointerdown = ev => ev.stopPropagation(); b.onclick = () => {
    if (!wahl) return; const k = wahl.dataset.b, g = G[k] = G[k] || {}, z = b.dataset.g, alt = schnapp();
    if (z === 'schreiben') return schreib(wahl);
    if (wahl.classList.contains('gs--linie') && (z === 'groesser' || z === 'kleiner')) { g.st = Math.max(1, Math.min(8, (g.st || 1) + (z === 'groesser' ? 1 : -1))); setze(wahl, k); rahmen(); merke(alt); return sichern(); }
    if (z.startsWith('fb-')) g.fb = z.slice(3);
    if (z === 'weg' && wahl.classList.contains('gs--linie')) { g.aus = true; merke(alt); sichern(); return neu(); }
    if (z === 'groesser') g.s = Math.min(3.2, Math.round((g.s || 1) * 1.1 * 100) / 100);
    if (z === 'kleiner') g.s = Math.max(.3, Math.round((g.s || 1) / 1.1 * 100) / 100);
    if (z === 'left' || z === 'center' || z === 'right') g.al = z;
    if (z.startsWith('f-')) g.f = z.slice(2);
    if (z === 'weiter') g.mb = Math.min(160, (g.mb || 0) + 8);
    if (z === 'enger') g.mb = Math.max(-40, (g.mb || 0) - 8);
    if (z === 'zurueck') { const t = g.t; G[k] = typeof t === 'string' ? { t } : {}; }
    if (z === 'weg') { G._bilder = (G._bilder || []).filter(x => x.id !== k); delete G[k]; merke(alt); sichern(); return neu(); }
    setze(wahl, k); rahmen(); merke(alt); sichern();
  }; });
  // bar above the letter
  $$('.gs-werk [data-w]').forEach(b => b.onclick = () => {
    const w = b.dataset.w;
    if (w === 'zurueck') return S.briefZurueck();
    if (w === 'vor') return S.briefVor();
    if (w === 'vorlage') return fenster(`<h2>Back to <em>the original?</em></h2><p>Text, arrangement and inserted photos go back to how the assistant wrote the letter. With «Undo» you get your version back.</p>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Back to the original<i>${SYM.haken}</i></button></div>`, true, () => {
        fensterZu(); const alt = schnapp(), o = G._orig; e.text = o.text; e.betreff = o.betreff; G = e.gestalt = { _orig: o }; merke(alt); neu();
        api('anfrage', { id: a.id, betreff: e.betreff, entwurf_text: e.text, gestalt: G, fassung: a.fassung || 0 }).then(d2 => { a.fassung = d2.fassung; S.gesichert[a.id] = JSON.stringify([e.betreff, e.text, G]); quit('Back to the original', 'Stored. With «Undo» you get your version back.', [], false, 4000); }).catch(fehler); });
    if (w === 'foto') {
      return fenster(`<h2>Insert <em>a photo.</em></h2><p>A photo of txtme.social for this letter. It goes under ${wahl && /^p\d+$/.test(wahl.dataset.b) ? 'the selected paragraph' : 'the text before the sign-off'}; after that you can move it and drag the corners to make it larger or smaller.</p>
        <div class="gs-fotos">${BRIEFBILDER.map(([k, n]) => `<button type="button" data-foto="${k}"><img src="media/${k}.webp" alt="" loading="lazy"><span>${esc(n)}</span></button>`).join('')}</div>`, false);
    }
  });
  document.addEventListener('click', S.fotoKlick || (S.fotoKlick = ev => {
    const f = ev.target.closest && ev.target.closest('.gs-fotos [data-foto]'); if (!f || !S.fotoZiel) return; S.fotoZiel(f.dataset.foto, f.querySelector('span').textContent);
  }));
  S.fotoZiel = (k, n) => {
    const nach = wahl && /^p\d+$/.test(wahl.dataset.b) ? wahl.dataset.b : wahl && wahl.dataset.b === 'betreff' ? 'kopf' : 'p' + Math.max(0, $$('.gs--p', br).length - 2);
    const alt = schnapp(), id = 'bild' + Date.now().toString(36);
    G._bilder = (G._bilder || []).concat([{ id, k, n, nach }]); G[id] = { w: Math.round(br.clientWidth * .62), al: 'center' };
    fensterZu(); merke(alt); neu(); sichern(true);
    requestAnimationFrame(() => { const el = $(`[data-b="${id}"]`); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  };
  br.addEventListener('pointerdown', ev => { if (!ev.target.closest('.gs') && !ev.target.closest('#gw')) { schluss(); waehle(null); } });
  if (S.briefAussen) document.removeEventListener('pointerdown', S.briefAussen);
  /* only deselect when something is selected or being written (F47: on the phone every tap redrew the bar and moved the page) */
  document.addEventListener('pointerdown', S.briefAussen = ev => { if (!br.isConnected || (!wahl && !$('.gs--schreib', br))) return; if (!br.contains(ev.target) && !ev.target.closest('#fenster') && !ev.target.closest('.gs-werk') && !ev.target.closest('#gs-seite')) { schluss(); waehle(null); } });
  if (S.briefTasten) document.removeEventListener('keydown', S.briefTasten);
  document.addEventListener('keydown', S.briefTasten = ev => {
    if (!br.isConnected || !$('#fenster').hidden) return;
    const inFeld = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    const cmd = ev.metaKey || ev.ctrlKey;
    if (cmd && ev.key.toLowerCase() === 'z' && !inFeld) { ev.preventDefault(); return ev.shiftKey ? S.briefVor() : S.briefZurueck(); }
    if (ev.key === 'Escape' && wahl && !inFeld && $('#gs-seite') && !$('#gs-seite').hidden) { S.seiteZu = wahl.dataset.b; return seite(); }
    if (inFeld || !wahl) return;
    const k = wahl.dataset.b, g = G[k] = G[k] || {};
    const sch = ev.shiftKey ? 10 : 1, p = { ArrowLeft: [-sch, 0], ArrowRight: [sch, 0], ArrowUp: [0, -sch], ArrowDown: [0, sch] }[ev.key];
    if (p) { ev.preventDefault(); const alt = schnapp(); g.dx = (g.dx || 0) + p[0]; g.dy = (g.dy || 0) + p[1]; setze(wahl, k); rahmen(); merke(alt); sichern(); }
    if ((ev.key === 'Backspace' || ev.key === 'Delete') && (wahl.classList.contains('gs--bild') || wahl.classList.contains('gs--linie'))) { ev.preventDefault(); $('.gs-werk [data-g="weg"]').click(); }
    if (ev.key === 'Enter' && wahl.hasAttribute('data-schreib')) { ev.preventDefault(); schreib(wahl); }
  });
  /* Side panel «Design» on the right (Robert 16.10.2026: «a small side menu that opens»): opens when selecting, closes with × or Esc, the document moves left. */
  let altS = null;
  const seite = jetzt => {
    let p = $('#gs-seite');
    if (!wahl || !br.isConnected || S.seiteZu === wahl.dataset.b) { clearTimeout(S.seiteT); if (p) p.hidden = true; document.body.classList.remove('gs-seite-offen'); return; }
    /* Phone and tablet (Abnahme 07.11.2026 C1): the panel comes up from below. It waits for a second tap (double tap writes, as on the computer)
       and then moves the chosen part above itself, so the panel never lies over what one just tapped. */
    const schmal = innerWidth <= 1100, neu = !p || p.hidden;
    if (schmal && neu && jetzt !== true) { clearTimeout(S.seiteT); S.seiteT = setTimeout(() => seite(true), 380); return; }
    if (!p) { p = document.createElement('aside'); p.id = 'gs-seite'; p.className = 'gs-seite'; p.setAttribute('aria-label', 'Design'); document.body.appendChild(p); }
    p.hidden = false; document.body.classList.add('gs-seite-offen');
    if (schmal && neu) {
      const pr = p.getBoundingClientRect(), rr = wahl.getBoundingClientRect(), werk = $('.gs-werk'), wr = werk && werk.getBoundingClientRect();
      const oben = Math.max(($('.kopf') || document.body).getBoundingClientRect().bottom, wr && wr.bottom < innerHeight / 2 ? wr.bottom : 0) + 12;
      const um = Math.min(rr.bottom + 16 - pr.top, rr.top - oben);
      if (rr.bottom + 16 > pr.top && um > 0) scrollBy({ top: um, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
    }
    const sp = $('.re-spalte'); if (sp && innerWidth > 1180) { const rr = sp.getBoundingClientRect(); p.style.left = Math.round(rr.left) + 'px'; p.style.width = Math.round(Math.max(300, rr.width)) + 'px'; p.style.right = 'auto'; } else { p.style.left = ''; p.style.width = ''; p.style.right = ''; }
    const k = wahl.dataset.b, g = G[k] || {}, bild = wahl.classList.contains('gs--bild'), lin = wahl.classList.contains('gs--linie'), text = !bild && !lin && k !== 'zeichen';
    const schreibbar = wahl.hasAttribute('data-schreib');
    const cs = getComputedStyle(wahl), fs = parseFloat(cs.fontSize) || 16, lh = g.lh || Math.round((parseFloat(cs.lineHeight) / fs || 1.4) * 20) / 20;
    const pt = Math.round(fs * .75 * 2) / 2, ls = g.ls != null ? g.ls : Math.round((parseFloat(cs.letterSpacing) || 0) / fs * 100) / 100, op = g.op != null ? g.op : 1;
    const r = wahl.getBoundingClientRect();
    const kn = (z, v, inhalt, aktiv, tip = '', aus = false) => `<button type="button" class="${aktiv ? 'an' : ''}" data-s="${z}" data-v="${v}" aria-pressed="${!!aktiv}"${tip ? ` title="${tip}" aria-label="${tip}"` : ''}${aus ? ' disabled' : ''}>${inhalt}</button>`;
    const gruppe = (t, inhalt) => `<div class="gs-gruppe"><span class="gs-gruppe__t">${t}</span>${inhalt}</div>`;
    const regler = (z, wert, min, max, schritt, anzeige) => `<div class="gs-regler"><input type="range" data-s="${z}" min="${min}" max="${max}" step="${schritt}" value="${wert}"><output>${anzeige}</output></div>`;
    const groesse = (z, wert, min, max, schritt, einheit) => `<div class="gs-groesse">${kn(z, -schritt, '−', false, 'Smaller')}<input type="number" data-s="${z}" min="${min}" max="${max}" step="${schritt}" value="${wert}"><span>${einheit}</span>${kn(z, schritt, '+', false, 'Larger')}</div>`;
    const farben = (z, wert, std) => `<div class="gs-farben">${Object.entries(HFARBE).map(([v, c]) => `<button type="button" class="${(wert || std) === v ? 'an' : ''}" data-s="${z}" data-v="${v}" style="background:${c}" title="${HNAME[v] || v}" aria-label="${HNAME[v] || v}"></button>`).join('')}</div>`;
    const lfarben = (z, wert, std) => `<div class="gs-farben">${Object.entries(LFARBE).map(([v, c]) => `<button type="button" class="${(wert || std) === v ? 'an' : ''}" data-s="${z}" data-v="${v}" style="background:${c}" title="${LNAME[v]}" aria-label="${LNAME[v]}"></button>`).join('')}</div>`;
    const seg = (inhalt, extra = '') => `<div class="gs-seg${extra}">${inhalt}</div>`;
    const ausr = () => seg([['left', 'Left'], ['center', 'Centre'], ['right', 'Right']].map(([v, t]) => kn('al', v, t, (g.al || (k === 'zeile' || k === 'fuss' ? 'center' : 'left')) === v)).join(''));
    const lage = (breite) => `<div class="gs-lage"><label><span>Left</span><input type="number" data-s="dx" step="1" value="${g.dx || 0}"></label><label><span>Top</span><input type="number" data-s="dy" step="1" value="${g.dy || 0}"></label><label><span>${breite}</span><input type="number" data-s="wl" min="40" step="2" value="${Math.round(r.width)}"></label><em>px</em></div>`;
    const anordnen = () => `<div class="gs-anordnen">${kn('mitte', '', 'Centre horizontally')}${kn('vorn', '', 'To the front')}${kn('hinten', '', 'To the back')}</div>`;
    let h = `<header><span class="gs-gruppe__t">Design</span><h2>${esc(gName(k))}</h2><button class="gs-seite__zu" type="button" data-s="zu" data-v="" aria-label="Close">${ZU}</button></header><div class="gs-seite__inhalt">`;
    if (text) {
      const fam = g.f === 'versal' ? 'cinzel' : (g.f || (k === 'zeile' || k === 'fuss' ? 'mono' : 'sans'));
      h += gruppe('Weight', seg([['sans', 'Regular', '400'], ['mono', 'Medium', '500'], ['serif', 'Bold', '600'], ['cinzel', 'Black', '700']].map(([v, n, w]) => kn('f', v, `<span style="font-weight:${w}">${n}</span>`, fam === v)).join(''), ' gs-seg--schrift'));
      const ta = g.ta || (g.f === 'versal' || /uppercase/.test(cs.textTransform) ? 'versal' : 'normal');
      h += gruppe('Type size', groesse('pt', pt, 4, 72, .5, 'pt') + regler('pt', pt, 4, 72, .5, pt + ' pt'));
      h += gruppe('Style', seg([['normal', 'Normal'], ['kursiv', 'Italic'], ['versal', 'Spaced capitals']].map(([v, n]) => kn('ta', v, n, ta === v)).join('')));
      h += gruppe('Colour', farben('c', g.c, ''));
      h += gruppe('Alignment', ausr());
      h += gruppe('Spacing', `<div class="gs-lage gs-lage--zwei"><label><span>Before</span><input type="number" data-s="mt" min="-60" max="200" step="2" value="${g.mt || 0}"></label><label><span>After</span><input type="number" data-s="mb" min="-60" max="200" step="2" value="${g.mb || 0}"></label><em>px</em></div>`);
      if (schreibbar) h += gruppe('Content', `<textarea class="gs-inhalt" data-s="inhalt" rows="${Math.min(8, Math.max(2, Math.ceil(textAus(wahl).length / 34)))}" dir="auto">${esc(textAus(wahl))}</textarea>`);
      h += gruppe('Fine tuning', regler('ls', ls, 0, .5, .01, 'Tracking ' + ls.toFixed(2)) + regler('lh', lh, 1, 2.4, .05, 'Line ' + lh.toFixed(2)) + regler('op', op, .1, 1, .05, 'Opacity ' + Math.round(op * 100) + ' %'));
      h += gruppe('Position', lage('Width'));
      h += gruppe('Arrange', anordnen());
    }
    if (k === 'zeichen') {
      h += gruppe('Size', groesse('pz', Math.round((g.s || 1) * 100), 30, 320, 10, '%'));
      h += gruppe('Fine tuning', regler('op', op, .1, 1, .05, 'Opacity ' + Math.round(op * 100) + ' %'));
      h += gruppe('Position', lage('Width'));
      h += gruppe('Arrange', anordnen());
    }
    if (lin) {
      const st = g.st || 1;
      h += gruppe('Weight', groesse('stp', st * .75, .75, 6, .75, 'pt'));
      h += gruppe('Length', lage('Length'));
      h += gruppe('Colour', lfarben('fb', g.fb, 'taupe'));
      h += gruppe('Fine tuning', regler('op', op, .1, 1, .05, 'Opacity ' + Math.round(op * 100) + ' %'));
      h += gruppe('Alignment', ausr());
      h += gruppe('Arrange', anordnen());
    }
    if (bild) {
      h += gruppe('Size', regler('wl', Math.round(r.width), 80, br.clientWidth - 40, 2, Math.round(r.width) + ' px'));
      h += gruppe('Crop', seg([['', 'Whole'], ['4/3', '4:3'], ['1/1', '1:1'], ['16/9', '16:9'], ['3/4', '3:4']].map(([v, n]) => kn('ar', v, n, (g.ar || '') === v)).join(''))
        + (g.ar ? regler('ox', g.ox == null ? 50 : g.ox, 0, 100, 1, 'horizontal') + regler('oy', g.oy == null ? 50 : g.oy, 0, 100, 1, 'vertical') : ''));
      h += gruppe('Fine tuning', regler('op', op, .1, 1, .05, 'Opacity ' + Math.round(op * 100) + ' %'));
      h += gruppe('Position', lage('Width'));
      h += gruppe('Alignment', ausr());
      h += gruppe('Arrange', anordnen());
    }
    h += `</div><footer>${kn('zurueck', '', 'Reset part')}${bild || lin ? kn('weg', '', 'Remove').replace('class=""', 'class="rot"') : ''}</footer>`;
    p.innerHTML = h;
    const fertig = () => { setze(wahl, k); rahmen(); };
    p.onpointerdown = () => { altS = schnapp(); };
    p.onfocusin = () => { if (!altS) altS = schnapp(); };
    p.onclick = ev => {
      const b = ev.target.closest('button[data-s]'); if (!b || b.disabled) return;
      const z = b.dataset.s, v = b.dataset.v, alt = altS || schnapp(); altS = null;
      const gg = G[k] = G[k] || {};
      if (z === 'zu') { S.seiteZu = k; return seite(); }
      if (z === 'weg') return $('.gs-werk [data-g="weg"]').click();
      if (z === 'zurueck') { const t = gg.t; G[k] = typeof t === 'string' ? { t } : {}; }
      if (z === 'f') { gg.f = v; }
      if (z === 'ta') gg.ta = v;
      if (z === 'c') gg.c = v;
      if (z === 'fb') gg.fb = v;
      if (z === 'al') gg.al = v;
      if (z === 'ar') { if (v) gg.ar = v; else { delete gg.ar; delete gg.ox; delete gg.oy; } }
      if (z === 'pt') { const neu = Math.max(4, pt + +v) / .75; gg.s = Math.round(neu / (fs / (g.s || 1)) * 1000) / 1000; }
      if (z === 'pz') gg.s = Math.max(.3, Math.min(3.2, Math.round(((gg.s || 1) * 100 + +v)) / 100));
      if (z === 'stp') gg.st = Math.max(1, Math.min(8, Math.round(((gg.st || 1) * .75 + +v) / .75)));
      if (z === 'mitte') { gg.dx = 0; gg.al = 'center'; }
      if (z === 'vorn') gg.z = (gg.z || 0) + 1;
      if (z === 'hinten') gg.z = (gg.z || 0) - 1;
      fertig(); merke(alt); sichern(); seite();
    };
    p.oninput = ev => {
      const el = ev.target, z = el.dataset.s; if (!z) return;
      const gg = G[k] = G[k] || {};
      if (z === 'inhalt') { wahl.innerHTML = feldHTML(el.value); rahmen(); return sichern(); }
      const v = parseFloat(el.value); if (isNaN(v)) return;
      const out = el.parentElement.querySelector('output');
      if (z === 'pt') { gg.s = Math.round(Math.max(4, v) / .75 / (fs / (g.s || 1)) * 1000) / 1000; $$('[data-s="pt"]', p).forEach(x => { if (x !== el && x.tagName === 'INPUT') x.value = v; }); const o = $('.gs-regler output', p); if (o && el.type === 'range') o.textContent = v + ' pt'; }
      if (z === 'pz') gg.s = Math.max(.3, Math.min(3.2, v / 100));
      if (z === 'stp') gg.st = Math.max(1, Math.min(8, Math.round(v / .75)));
      if (z === 'ls') { gg.ls = v; if (out) out.textContent = 'Tracking ' + v.toFixed(2); }
      if (z === 'lh') { gg.lh = v; if (out) out.textContent = 'Line ' + v.toFixed(2); }
      if (z === 'op') { gg.op = v; if (out) out.textContent = 'Opacity ' + Math.round(v * 100) + ' %'; }
      if (z === 'wl') { gg.w = Math.max(40, Math.round(v)); if (out) out.textContent = Math.round(v) + ' px'; }
      if (z === 'ox' || z === 'oy') gg[z] = v;
      if (z === 'dx' || z === 'dy' || z === 'mt' || z === 'mb') gg[z] = Math.round(v);
      fertig();
    };
    p.onchange = ev => { if (ev.target.dataset.s === 'inhalt') { lies(); } merke(altS); altS = null; sichern(); };
  };
  knoepfe(); werk();
  addEventListener('resize', rahmen);
}
/* Read in English (Robert 16.10.2026: the colleague must be able to see what a letter in another language says before sending it).
   Reading copy in place of the letter, does not change it; conversation in English too. Probes bring their copy, otherwise the assistant translates
   (rezeption.uebersetzen; in the demo the original, marked). */
function englischBlatt(a) {
  const e = a.entwurf, d = e && e.englisch, sp = SPRACHE[a.sprache] || a.sprache;
  if (S.enLaedt && S.enLaedt[a.id]) return `<div class="re-de"><div class="lade"><div class="lade__r"></div><b>Translating …</b><span class="leise">The assistant translates the letter and the conversation into English. This takes about twenty seconds.</span></div></div>`;
  if (!d) return `<div class="re-de"><p class="re-de__hinweis">No reading copy yet. <button class="link" type="button" data-akt="englisch-neu">Translate now</button></p></div>`;
  const vd = a.verlauf_en || [];
  return `<div class="re-de">
      <div class="re-de__band"><b>Reading copy in English</b><span>Only to read along. The letter is sent in ${esc(sp)}. To edit, «Hide English».</span></div>
      <div class="re-de__kopf"><span class="mono">Subject</span></div>
      ${S.enAlt && S.enAlt[a.id] ? `<p class="re-de__hinweis">The letter was changed since the reading copy. <button class="link" type="button" data-akt="englisch-neu">Translate again</button></p>` : ''}
      <b class="re-de__betreff">${esc(d.betreff)}</b>
      <div class="re-de__text">${briefText(d.text)}</div>
      ${vd.length ? `<details class="re-de__gespraech"><summary>The chat conversation in English</summary>${(a.verlauf || []).map((v, i) => vd[i] ? `<p class="${v.rolle === 'user' ? 'gast' : 'haus'}"><small>${v.rolle === 'user' ? 'Customer' : N.chat}</small>${esc(vd[i])}</p>` : '').join('')}</details>` : ''}
    </div>`;
}
async function englischHolen(a) {
  S.enLaedt = S.enLaedt || {}; S.enAlt = S.enAlt || {};
  S.enLaedt[a.id] = true; neuDetail(a);
  try {
    const d = await api('uebersetzen', { id: a.id });
    a.entwurf.englisch = d.englisch; a.verlauf_en = d.verlauf_en;
    S.enAlt[a.id] = false;
  } catch (x) { fehler(x); }
  delete S.enLaedt[a.id];
  if (S.ansicht === 'eingang' && S.wahl === a.id) neuDetail(a);
}
/* Details of a request in groups, nothing split mid-word (Fehlerbuch Schlössli 20.10.2026): When and what · Customer · Where from */
function detail(a) {
  const e = a.entwurf, laeuft = S.schreibt[a.id], bearb = S.bearbeiten === a.id, offen = e ? (e.text.match(KLAMMER) || []).length : 0;
  const rtl = a.sprache === 'ar' ? ' dir="rtl"' : '';
  const team = e && e.team ? e.team.split('\n').map(x => x.trim()).filter(Boolean) : [];
  const fremd = !!a.sprache && a.sprache !== 'en', en = !!(S.en && S.en[a.id]);
  const viaChat = (a.verlauf || []).length > 1;
  const gruppen = [['When and what', [['Received', zeit(a.zeit)], ['Kind', ART[a.art] || a.art]]],
    ['Customer', [['Name', a.name || 'not given'], ['E-mail', a.kontakt || 'not given']]],
    ['Where from', [['Way', viaChat ? 'Chat window' : 'Form of the website'], ['Page', a.seite || 'not stated'], ['Language', SPRACHE[a.sprache] || a.sprache]]]];
  return `<section class="re-d re-auf" style="--i:0">
      <div class="re-d__kopf">${bild(a.art, 're-d__bild')}
        <div class="re-d__n"><span class="re-d__k">${esc(ART_LANG[a.art] || a.art)}${a.beispiel ? ' · Example' : ''}</span><h2><bdi>${esc(a.name || 'Without a name')}</bdi></h2></div>
        <div class="re-d__kn"><button class="rund" type="button" data-akt="weg" data-tip="Delete" aria-label="Delete request">${SYM.korb}</button>
        <button class="kn kn--klein${a.status === 'erledigt' ? ' kn--linie' : ' kn--gold'}" type="button" data-akt="${a.status === 'erledigt' ? 'offen' : 'erledigt'}">${a.status === 'erledigt' ? 'Open again' : 'Done'}<i>${SYM.haken}</i></button></div></div>
      <div class="re-angaben">${gruppen.map(([t, l]) => `<div class="re-angaben__g"><span class="mono">${t}</span><dl>${l.map(([k, v]) => `<div><dt>${k}</dt><dd dir="auto">${k === 'E-mail' ? kontaktText(v) : esc(v)}</dd></div>`).join('')}</dl></div>`).join('')}</div>
      ${String(a.anliegen || '').trim() ? `<blockquote class="re-anliegen" dir="auto">${esc(a.anliegen)}</blockquote>` : `<p class="re-anliegen-leer">No message: only the e-mail address was sent${a.art === 'warteliste' || a.art === 'newsletter' ? ', which is all this sign-up asks for' : ''}.</p>`}
      ${a.anliegen_en && fremd ? `<p class="re-anliegen-en"><span class="mono">In English</span>${esc(a.anliegen_en)}</p>` : ''}
      ${viaChat ? `<details class="re-gespraech"><summary><span>The chat conversation</span><i>${mal((a.verlauf || []).length, 'one message', 'messages')}</i></summary><div class="re-gespraech__l">${(a.verlauf || []).map(v => `<p class="${v.rolle === 'user' ? 'gast' : 'haus'}" dir="auto"><small>${v.rolle === 'user' ? 'Customer' : N.chat}</small>${esc(v.text)}</p>`).join('')}</div></details>` : ''}
    </section>
    <section class="re-post re-auf" style="--i:1">
      <div class="re-post__kopf"><div><span class="mono">Reply to the customer</span><h2>The <em>letter</em></h2></div>
        ${e && !laeuft && fremd ? `<button class="kn kn--klein ${en ? 'kn--gold' : 'kn--linie'} re-de-kn" type="button" data-akt="englisch">${en ? 'Hide English' : 'Read in English'}<i>${SYM.buch}</i></button>` : ''}
        ${e && !laeuft ? `<div class="wahl2 re-modus" role="group" aria-label="View"><button type="button" data-akt="lesen" aria-pressed="${!bearb}">Design</button><button type="button" data-akt="bearbeiten" aria-pressed="${bearb}">Text only</button></div>` : ''}</div>
      ${laeuft ? `<div class="brief brief--lade"><div class="lade"><div class="lade__r"></div><b>The letter is being written.</b><span class="leise">The assistant reads the request and the pages of the website. This takes about twenty seconds.</span></div></div>`
      : e ? `${bearb ? textBrief(a, e, rtl) : fremd && en ? englischBlatt(a) : gestaltBrief(a, e, rtl)}
        <div class="re-post__unten">
          <aside class="re-notiz">
            <span class="mono">Before sending</span>
            <b>${offen ? mal(offen, 'One part', 'parts') + ' of the letter ' + (offen === 1 ? 'is' : 'are') + ' open' : 'The letter is complete'}</b>
            <p>${offen ? 'The marked fields are for your team: order status, dates, prices, decisions.' : 'Read it once and send it from your mail program.'}${e.demo ? ' This draft is a demo without a model: it quotes no facts; with the model switched on it uses the wording of the website.' : ''}</p>
            ${team.length ? `<ul>${team.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          </aside>
          <div class="re-post__kn">
            <button class="kn kn--gold" type="button" data-akt="kopieren">Copy text<i>${SYM.kopie}</i></button>
            ${bearb ? `<button class="kn kn--linie" type="button" data-akt="sichern">Save change<i>${SYM.haken}</i></button><p class="tx-stand" id="tx-stand" role="status" aria-live="polite">Saved</p>` : `<button class="kn kn--linie" type="button" data-akt="pdf">Save as PDF<i>${SYM.post}</i></button>`}
            <button class="link" type="button" data-akt="neu">Write it again</button>
            <p class="re-hinweis">${bearb ? '«Save change» or ⌘S stores what you typed; switching to another request or view, or leaving the page, stores it first. ' : 'Work in the letter like in Canva: click selects, drag moves (snaps to edges and centres, Alt holds it off), corners change the size, double click writes, ⌘Z undoes. Everything is saved by itself. «Copy text» puts subject and letter on the clipboard, «Save as PDF» exactly as it stands here. '}Nothing is sent from here and no mail program opens. You paste the letter into your mail program and send it yourself.</p>
          </div>
        </div>`
      : `<div class="brief brief--leer"><header class="brief__kopf">${ZEICHEN_H}<span>${esc(HAUS.brief.zeile)}</span></header>
        <p>No letter yet. The assistant writes it from the request and the pages of the website.</p>
        <label class="feld"><span>Note for the letter (optional)</span><input id="e-hinweis" placeholder="For example: offer the black tee in M, the white one is out"></label>
        <button class="kn kn--gold" type="button" data-akt="schreiben">Write the letter<i>${PF}</i></button></div>`}
    </section>`;
}
function verbindeEingang() {
  $$('.re-filter [data-filter]').forEach(b => b.onclick = () => { S.filter = b.dataset.filter; zeichne(); });
  const a = S.anfragen.find(x => x.id === S.wahl);
  if (!a) return;
  if (a.status === 'neu') {   // opened means read
    api('anfrage', { id: a.id, status: 'gelesen' }).then(d => { a.status = 'gelesen'; S.ue = { ...S.ue, ...d }; rand(); leiste(); const k = $(`.re-a[data-wahl="${CSS.escape(a.id)}"]`); if (k) { const c = k.className; k.outerHTML = karteAnfrage(a); const n = $(`.re-a[data-wahl="${CSS.escape(a.id)}"]`); if (n && /sw-da/.test(c)) n.classList.add('sw-da'); } $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.wahl || '')); }).catch(() => {});
    if (!a.entwurf && !S.schreibt[a.id]) return schreiben(a, '');
  }
  $$('#detail [data-akt]').forEach(b => b.onclick = () => aktion(a, b.dataset.akt));
  kopfFest();
  if (a.entwurf && $('#brief')) verbindeBrief(a);
  $$('#e-text, #e-betreff').forEach(t => { const hoch = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 4 + 'px'; }; t.oninput = () => { hoch(); textStand(); }; hoch(); });
}
/* Swap quietly (Robert 16.10.2026: «every time I switch the column the screen snaps»): scroll position stays, the area does not shrink below the old height, nothing fades in anew. */
function ruhigTauschen(el, html) {
  const y = scrollY, h = el.offsetHeight;
  el.style.minHeight = h + 'px';
  el.innerHTML = html;
  $$('.re-auf', el).forEach(x => x.classList.add('still'));
  if (scrollY !== y) scrollTo({ top: y, behavior: 'instant' });
  requestAnimationFrame(() => { if (scrollY !== y) scrollTo({ top: y, behavior: 'instant' }); });
}
/* Request card above the letter always the same height: measured once per width at the tallest entry, so the letter does not jump when switching */
/* No card is stretched to the height of another (Fehlerbuch Schlössli 20.10.2026): the template measured the tallest request and set that height everywhere,
   which left a dark empty area under short messages. Here the card takes its own height; ruhigTauschen keeps the scroll position. */
function kopfFest() { const k = $('#detail .re-d'); if (k) k.style.minHeight = ''; }
function neuDetail(a) { ruhigTauschen($("#detail"), detail(a)); verbindeEingang(); }
async function schreiben(a, hinweis) {
  S.schreibt[a.id] = true; S.bearbeiten = ''; $('#detail').innerHTML = detail(a);
  try {
    const d = await api('entwurf', { id: a.id, hinweis });
    a.entwurf = d.entwurf; a.fassung = d.entwurf.fassung || a.fassung; if (a.status === 'neu') a.status = 'gelesen';
    S.ue = { ...S.ue, ...d };
  } catch (e) { fehler(e); }
  delete S.schreibt[a.id];
  if (S.ansicht === 'eingang' && S.wahl === a.id) { $('#detail').innerHTML = detail(a); verbindeEingang(); rand(); leiste(); }
}
async function aktion(a, akt) {
  try {
    if (akt === 'schreiben') return schreiben(a, ($('#e-hinweis') || {}).value || '');
    if (akt === 'neu') return fenster(`<h2>Write it <em>again.</em></h2><p>The current draft is replaced. Do you want to give the assistant a note?</p>
      <label class="feld"><span>Note (optional)</span><input id="f-hinweis" placeholder="For example: shorter, mention the 14 days"></label>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Write again<i>${PF}</i></button></div>`, true, () => { const h = $('#f-hinweis').value; fensterZu(); schreiben(a, h); });
    if ($('#brief') && S.briefSichern && ['kopieren', 'neu', 'erledigt', 'offen', 'pdf', 'englisch', 'englisch-neu'].includes(akt)) await S.briefSichern();   // nothing is lost when switching (E17)
    if (textOffen() && ['neu', 'erledigt', 'offen', 'englisch', 'englisch-neu'].includes(akt)) await textSichern();   // the same for «Text only»
    if ($('#brief') && S.briefSichern && akt === 'bearbeiten') S.briefSichern();   // switch at once, saving continues
    if (akt === 'englisch') {
      S.en = S.en || {}; S.en[a.id] = !S.en[a.id]; if (S.en[a.id]) return englischHolen(a); return neuDetail(a);
    }
    if (akt === 'englisch-neu') return englischHolen(a);
    if (akt === 'pdf') return briefPDF();
    if (akt === 'lesen' || akt === 'bearbeiten') {
      if (akt === 'lesen' && textOffen()) await textSichern();
      S.bearbeiten = akt === 'bearbeiten' ? a.id : ''; neuDetail(a);
      if (akt === 'bearbeiten') { const t = $('#e-text'); if (t) t.focus({ preventScroll: true }); }
      return;
    }
    if (akt === 'kopieren' || akt === 'sichern') {
      const betreff = $('#e-betreff') ? $('#e-betreff').value : a.entwurf.betreff, text = $('#e-text') ? $('#e-text').value : a.entwurf.text;
      if (textOffen()) await textSichern();
      else if (betreff !== a.entwurf.betreff || text !== a.entwurf.text) { const d = await api('anfrage', { id: a.id, betreff, entwurf_text: text, fassung: a.fassung || 0 }); a.fassung = d.fassung; a.entwurf.betreff = betreff; a.entwurf.text = text; }
      if (akt === 'kopieren') { try { const plain = 'Subject: ' + betreff + '\n\n' + text; if (window.ClipboardItem && $('#brief')) await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([briefMail(a, a.entwurf)], { type: 'text/html' }), 'text/plain': new Blob([plain], { type: 'text/plain' }) })]); else await navigator.clipboard.writeText(plain); } catch (e) { return quit('Not copied', 'The browser did not release the clipboard. Select the text and copy it by hand.', [], true); } return quit('Copied', $('#brief') ? 'The designed letter is on the clipboard. Paste it into your mail program, it appears with head and photos.' : 'Subject and letter are on the clipboard.', [], false, 6000); }
      S.bearbeiten = ''; neuDetail(a);
      return quit('Saved', 'Your change to the letter is stored.', [], false, 4000);
    }
    if (akt === 'erledigt' || akt === 'offen') {
      const d = await api('anfrage', { id: a.id, status: akt === 'erledigt' ? 'erledigt' : 'gelesen' });
      a.status = akt === 'erledigt' ? 'erledigt' : 'gelesen'; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne();
      return quit(akt === 'erledigt' ? 'Done' : 'Open again', '', [], false, 3000);
    }
    if (akt === 'weg') return fenster(`<h2>Delete <em>the request?</em></h2><p>The request of ${esc(a.name || 'this customer')} with draft and conversation is deleted for good. That is right when the customer asks for it or everything is settled.</p>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gefahr" type="button" id="f-los">Delete for good<i>${SYM.korb}</i></button></div>`, true, async () => {
        fensterZu();
        try { const d = await api('weg', { id: a.id }); S.anfragen = S.anfragen.filter(x => x.id !== a.id); S.wahl = ''; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne(); quit('Deleted', '', [], false, 3000); } catch (e) { fehler(e); }
      });
  } catch (e) { fehler(e); }
}

/* ---------- What was asked ---------- */
// the page as words, not as a path: «/» → home, «/shipping-payments/» → shipping payments, «/product/t-shirt-festival-print/» → t-shirt festival print (Blick 07.11.2026 Fund 5)
function seiteName(p) {
  const t = String(p || '').split(/[?#]/)[0].split('/').filter(Boolean).pop() || 'home';
  return t.replace(/(^|[^a-z])([a-z])-/gi, '$1$2\u2011').replace(/[-_]+/g, ' ');
}
function gefragt() {
  const alle = S.fragen, luecken = alle.filter(f => !f.belegt && !f.erledigt);
  const liste = S.wahl === 'luecke' ? luecken : alle;
  const gruppen = {};
  liste.forEach(f => { (gruppen[f.gruppe] = gruppen[f.gruppe] || []).push(f); });
  const reihe = Object.keys(gruppen).sort((x, y) => gruppen[y].filter(f => !f.belegt && !f.erledigt).length - gruppen[x].filter(f => !f.belegt && !f.erledigt).length || gruppen[y].length - gruppen[x].length);
  const frage = f => `<div class="re-f${!f.belegt && !f.erledigt ? ' luecke' : ''}${f.erledigt ? ' erledigt' : ''}" data-id="${esc(f.id)}">
      <div class="re-f__k"><span class="mono">${esc(zeit(f.zeit))} · ${esc(SPRACHE[f.sprache] || f.sprache)}${f.seite ? ' · page ' + esc(seiteName(f.seite)) : ''}${f.finder ? ' · with «Find your piece»' : ''}${f.beispiel ? ' · Example' : ''}</span>
        ${!f.belegt ? `<em>${f.erledigt ? 'added' : 'without answer'}${f.thema ? ' · ' + esc(f.thema) : ''}</em>` : ''}</div>
      <p class="re-f__q" dir="auto">${esc(f.frage)}</p>
      <details><summary>Answer of the chat</summary><div class="re-f__a" dir="auto"><span class="mono">${esc(N.chat)}</span>${antwortHTML(f.antwort)}</div></details>
      ${!f.belegt && !f.erledigt ? `<div class="re-f__kn"><button class="kn kn--klein kn--gold" type="button" data-akt="nachtragen">Add the answer<i>${PF}</i></button><button class="link" type="button" data-akt="erledigt">Tick off without answer</button></div>` : ''}
    </div>`;
  return kopf('What was asked', 'What customers <em>want to know.</em>',
    `Every question to the chat, by topic. ${luecken.length ? `<b>${mal(luecken.length, 'One question had', 'questions had')} no answer,</b> because nothing about it stands on the website. Add the answer once, from then on the chat answers itself.${nurHier()}` : 'Every question had an answer.'}`) + demoZeile() +
    `<div class="re-zahlen platte"><div><b>${alle.length}</b><span>questions</span></div><div><b>${luecken.length}</b><span>without answer</span></div><div><b>${S.nachgetragen.length}</b><span>added by the team</span></div><div><b>${alle.filter(f => f.finder).length}</b><span>with «Find your piece»</span></div></div>
    <div class="filter"><div class="wahl2" role="group" aria-label="Selection"><button type="button" data-gehe="gefragt" aria-pressed="${S.wahl !== 'luecke'}">All questions</button><button type="button" data-gehe="gefragt" data-wahl="luecke" aria-pressed="${S.wahl === 'luecke'}">Without answer${luecken.length ? ' · ' + luecken.length : ''}</button></div></div>
    ${reihe.length ? reihe.map(g => `<details class="gr re-gr" open><summary><span class="re-gr__bild" aria-hidden="true"><img src="${THEMABILD[g] || THEMABILD['Other questions']}" alt="" loading="lazy"></span><b>${esc(g)}</b><small>${mal(gruppen[g].length, 'one question', 'questions')}${gruppen[g].filter(f => !f.belegt && !f.erledigt).length ? ' · ' + gruppen[g].filter(f => !f.belegt && !f.erledigt).length + ' without answer' : ''}</small></summary>${gruppen[g].map(frage).join('')}</details>`).join('')
      : `<div class="re-leer platte">${ZEICHEN_H}<b>${S.wahl === 'luecke' ? 'No gap.' : 'No question yet.'}</b><p>${S.wahl === 'luecke' ? 'Every question of the customers could be answered.' : 'As soon as customers ask the chat, it is here.'}</p></div>`}`;
}
function verbindeGefragt() {
  $$('.re-f [data-akt]').forEach(b => b.onclick = async () => {
    const f = S.fragen.find(x => x.id === b.closest('.re-f').dataset.id);
    if (b.dataset.akt === 'nachtragen') return nachtragenFenster({ frage: f.frage, antwort: '', quelle: f.id });
    try { const d = await api('frage', { id: f.id, erledigt: true }); f.erledigt = true; S.ue = { ...S.ue, ...d }; rand(); leiste(); zeichne(); quit('Ticked off', 'The question stays in the log, without the mark.', [], false, 3500); } catch (e) { fehler(e); }
  });
}
function nachtragenFenster(x) {
  fenster(`<h2>Add <em>the answer.</em></h2><p>The way the team would say it to a customer. From the next question on, the chat answers with it, in every language.${nurHier()}</p>
    <label class="feld"><span>Question</span><input id="f-frage" value="${esc(x.frage)}"></label>
    <label class="feld"><span>Answer of the team</span><textarea id="f-antwort" rows="5" placeholder="In whole sentences, the way you would say it to a customer.">${esc(x.antwort)}</textarea></label>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Add<i>${SYM.haken}</i></button></div>`, true, async () => {
    try {
      const d = await api('nachtragen', { nid: x.nid, frage: $('#f-frage').value, antwort: $('#f-antwort').value, quelle: x.quelle || '' });
      fensterZu(); S.fragen = null; S.wissen = null; S.ue = { ...S.ue, ...d }; rand(); leiste(); if (S.ansicht === 'wissen') await zeichneHalten(); else await zeichne();
      quit('Added', 'The chat answers with it from the next question on.', [['See it', () => gehe('nachgetragen')]], false, 6000);
    } catch (e) { fehler(e); }
  });
  setTimeout(() => { const t = $('#f-antwort'); if (t) t.focus(); }, 60);
}

/* ---------- Added by the team ---------- */
function nachgetragenS() {
  const l = S.nachgetragen;
  return kopf('Added by the team', 'What the chat <em>knows from you.</em>',
    'Answers your team wrote to questions without an answer. The chat uses them like the website. Change or remove them here when something changes.' + (S.nachgetragen.some(x => x.beispiel) ? ' The entries marked «Example» are invented, the chat does not know them.' : ''),
    `<button class="kn kn--linie" type="button" id="n-neu">Add an answer without a question<i>${PF}</i></button>`) + demoZeile() +
    (l.length ? `<div class="re-nliste">${l.slice().reverse().map(x => { const tag = datum(x.zeit);
      return `<article class="re-n" data-nid="${esc(x.nid)}">
        <header class="re-n__kopf"><span>Added on ${esc(tag)}</span>${x.beispiel ? '<em>Example</em>' : ''}</header>
        <span class="re-n__l">Question of the customers</span>
        <h3 class="re-n__q" dir="auto">${esc(x.frage)}</h3>
        <div class="re-n__zier" aria-hidden="true"><i></i>${ZEICHEN_H}<i></i></div>
        <span class="re-n__l">Answer of the team</span>
        <p class="re-n__a" dir="auto">${esc(x.antwort).replace(/\n/g, '<br>')}</p>
        <footer class="re-n__kn"><button class="re-n__k" type="button" data-akt="aendern"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 3.5l2 2L6 12H4v-2z"/></svg>Change</button><button class="re-n__k re-n__k--weg" type="button" data-akt="weg"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>Remove</button></footer>
      </article>`; }).join('')}</div>`
      : `<div class="re-leer platte">${ZEICHEN_H}<b>Nothing added yet.</b><p>If the chat had no answer to a question, it is under «What was asked» with the button «Add the answer».</p></div>`);
}
function verbindeNachgetragen() {
  $('#n-neu').onclick = () => nachtragenFenster({ frage: '', antwort: '' });
  $$('.re-n [data-akt]').forEach(b => b.onclick = async () => {
    const x = S.nachgetragen.find(y => y.nid === b.closest('.re-n').dataset.nid);
    if (b.dataset.akt === 'aendern') return nachtragenFenster(x);
    fenster(`<h2>Remove <em>the answer?</em></h2><p>The chat then no longer knows it and points to the team again for this question.</p>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gefahr" type="button" id="f-los">Remove<i>${SYM.korb}</i></button></div>`, true, async () => {
      fensterZu();
      try { const d = await api('nachtragen_weg', { nid: x.nid }); S.fragen = null; S.ue = { ...S.ue, ...d }; rand(); leiste(); await zeichne(); quit('Removed', '', [], false, 3000); } catch (e) { fehler(e); }
    });
  });
}

/* ---------- What the chat knows (Robert 16.10.2026: «a kind of brain you can look at») ----------
   Everything the chat knows about txtme.social, by area: the sections of the website and the catalogue, what the team added
   (written itself or read from a link) and the added answers. Changing works from the next question on; the website itself stays as it is. Server part: _gast/gedaechtnis.py. */
const BER_BILD = { 'The company': 'media/shoot/hero-900.webp', 'The app': 'media/app/profile-480.webp', 'Merch & pieces': 'media/pieces/tee-back.webp', 'Shipping & payment': 'media/shoot/print-900.webp',
  'Press': 'media/shoot/desk-900.webp', 'Contact': 'media/shoot/face-800.webp', 'Events': 'media/shoot/party-1000.webp', 'Questions & answers': 'media/shoot/glance-800.webp' };
const W_ART = { neu: 'Newly added', geaendert: 'Changed', aus: 'Hidden', an: 'Shown again', zurueck: 'Back to the website', link: 'Taken from a link', entfernt: 'Removed', nachgetragen: 'Answer added', offen: 'Asked the department' };
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>';
const vorTagen = (iso, n) => { const d = new Date(iso); return !isNaN(d) && (Date.now() - d) < n * 864e5; };
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
let wachUhr = 0;
const VON = () => N.team;   // who entered it: the fixed team name, no prompt (Fehlerbuch 20.10.2026)

async function ladeWissen(neu = false) {
  if (!S.wissen || neu) S.wissen = await api('wissen');
  if (!S.fragen) { const d = await api('fragen'); S.fragen = d.fragen; S.nachgetragen = d.nachgetragen; }
  S.wissenNeu = wissenPosten().filter(x => x.neu).length;
}
/* Fact sheet instead of website snippets (Robert 16.10.2026: «clear, so that you see at a glance what is what»): one board per area, one row per fact «keyword — statement».
   Below, what the team added or read from links, and the added answers. A click on a row shows where it stands on the website and lets you change or switch it off. */
function wissenZeilen() {   // all rows flat, for search, counters and windows
  const W = S.wissen, l = [];
  (W.steckbrief || []).forEach(b => b.gruppen.forEach(g => g.zeilen.forEach(z => {
    const t = z.team || null;
    l.push({ id: 'f:' + z.fid, typ: 'fakt', z, bereich: b.bereich, gruppe: g.gruppe, was: z.was, angabe: t && t.angabe ? t.angabe : z.angabe, orig: z.angabe,
      geaendert: !!(t && t.angabe), aus: !!(t && t.aus), neu: !!t && vorTagen(t.zeit, 7), zeit: t ? t.zeit : '', von: t ? t.von || '' : '',
      quelle: t ? (t.von ? t.von + ' · ' : '') + datum(t.zeit) : '' });
  })));
  W.eintraege.forEach(e => { const q = e.quelle || {}, link = q.art === 'link';
    l.push({ id: 'e:' + e.wid, typ: 'eintrag', e, bereich: e.bereich, gruppe: link ? 'Read from links' : 'Added by the team', was: e.titel, angabe: e.text,
      quelle: (e.von ? e.von + ' · ' : '') + (link ? host(q.url) + ' · ' + datum(q.gelesen) : datum(e.geaendert || e.zeit)), aus: !!e.aus || e.abgelaufen, abgelaufen: e.abgelaufen,
      neu: vorTagen(e.geaendert || e.zeit, 7), zeit: e.geaendert || e.zeit, lang: true }); });
  (S.nachgetragen || []).forEach(x => l.push({ id: 'n:' + x.nid, typ: 'antwort', x, bereich: 'Questions & answers', gruppe: x.beispiel ? 'Examples (the chat does not know them)' : 'Added by the team',
    was: x.frage, angabe: x.antwort, quelle: datum(x.zeit), beispiel: !!x.beispiel, neu: !x.beispiel && vorTagen(x.zeit, 7), zeit: x.zeit, lang: true }));
  return l;
}
function wissenPosten() { return wissenZeilen(); }
function wissenS() {
  const W = S.wissen, alle = wissenZeilen(), q = S.such.trim().toLowerCase();
  const passt = p => !q || (p.was + ' ' + p.angabe + ' ' + p.gruppe + ' ' + p.bereich).toLowerCase().includes(q);
  const liste = alle.filter(passt);
  const team = alle.filter(p => (p.typ === 'fakt' && (p.geaendert || p.aus)) || p.typ === 'eintrag' || (p.typ === 'antwort' && !p.beispiel)).length;
  const zeile = p => {
    const marke = p.aus ? (p.abgelaufen ? 'expired' : 'switched off') : p.geaendert ? 'changed' : p.typ === 'eintrag' && p.e.gueltig_bis ? 'until ' + datum(p.e.gueltig_bis) : '';
    return `<button class="sb-z${p.aus ? ' aus' : ''}${p.geaendert || p.typ !== 'fakt' ? ' team' : ''}${p.lang ? ' lang' : ''}" type="button" data-id="${esc(p.id)}">
      <span class="sb-z__was" dir="auto">${esc(p.was)}</span><span class="sb-z__angabe" dir="auto">${esc(p.angabe)}${p.quelle ? `<small>${esc(p.quelle)}</small>` : ''}</span>
      ${marke ? `<em>${esc(marke)}</em>` : ''}</button>`;
  };
  const tafel = b => {
    const l = liste.filter(p => p.bereich === b);
    if (!l.length && (q || !['Events', 'Questions & answers'].includes(b))) return '';
    const gruppen = []; l.forEach(p => { let g = gruppen.find(x => x.n === p.gruppe); if (!g) gruppen.push(g = { n: p.gruppe, l: [] }); g.l.push(p); });
    const leer = b === 'Events' ? 'None yet. Write the event into the field above with the area «Events», then the chat knows it.' : 'No answer of the team yet. Questions without answer are under «What was asked».';
    const n = l.filter(p => !p.beispiel).length;
    return `<section class="platte sb-t" data-bereich="${esc(b)}">
      <header class="sb-t__k">${BER_BILD[b] ? `<span class="sb-t__bild" aria-hidden="true"><img src="${BER_BILD[b]}" alt="" width="900" height="675" loading="lazy" decoding="async"></span>` : ''}
        <h2>${esc(b)}</h2><small>${n ? mal(n, 'one entry', 'entries') : 'still empty'}</small>
        <button class="rund sb-t__neu" type="button" data-neu="${esc(b)}" data-tip="Add" aria-label="Add to ${esc(b)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button></header>
      ${gruppen.length ? gruppen.map(g => `<div class="sb-g"><p class="sb-g__n mono">${esc(g.n)}</p>${g.l.map(zeile).join('')}</div>`).join('') : `<p class="wi__leer">${leer}</p>`}
    </section>`;
  };
  const verlauf = W.verlauf.map(v => ({ zeit: v.zeit, art: v.art, titel: v.titel, bereich: v.bereich, wer: v.wer && v.wer !== 'Team' && v.wer !== 'Link' ? v.wer : '' }))
    .concat((S.nachgetragen || []).filter(x => !x.beispiel).map(x => ({ zeit: x.zeit, art: 'nachgetragen', titel: x.frage, bereich: 'Questions & answers' })))
    .sort((x, y) => String(y.zeit).localeCompare(String(x.zeit)));
  const links = W.links.slice(0, 4);
  const sb = W.steckbrief || [], bereiche = sb.map(b => b.bereich).concat(['Events', 'Questions & answers']);
  W.eintraege.forEach(e => { if (!bereiche.includes(e.bereich)) bereiche.splice(bereiche.length - 2, 0, e.bereich); });
  return kopf('What the chat knows', 'Everything the chat <em>knows about txtme.social.</em>',
    `The chat answers only with what stands on the website, in the catalogue and here. If a statement is no longer right, tap it and change it. The chat answers with it from the next question on, the website itself stays as it is.${team ? ` <b>${mal(team, 'One entry comes', 'entries come')} from your team.</b>` : ''}`,
    `<button class="kn kn--gold glanz-kn" type="button" id="w-link-auf">New knowledge<i>${PF}</i></button><button class="kn kn--linie" type="button" id="w-neu">Add an entry<i>${PF}</i></button>`, 'media/shoot/desk-900.webp') + demoZeile() +
    `<div class="wi-oben">
      <section class="platte wi-neu" id="w-ein">
        <span class="mono">New knowledge</span>
        <h2>What else should the chat <em>know?</em></h2>
        <p>Write it in, paste a link or add a file: a new price list as PDF, a photo of a notice, the programme of an event. The chat takes only what stands there, with the date.${S.ue && S.ue.demo ? ' In the demo only written text goes in (links and files need the model).' : ''}</p>
        <div class="wi-neu__feld" id="w-feld">
          <textarea id="w-text" rows="3" placeholder="For example: From 1 December the cap also comes in white. Or simply paste a link.">${esc(S.entwurf || '')}</textarea>
          <div class="wi-neu__dateien" id="w-dateien">${dateienS()}</div>
          <div class="wi-neu__leiste">
            <button class="rund" type="button" id="w-doc" data-tip="Add a document" aria-label="Add a document">${DOK}</button>
            <button class="rund" type="button" id="w-bild" data-tip="Add a photo" aria-label="Add a photo">${FOTO}</button>
            <input type="file" id="w-datei-doc" accept=".pdf,.docx,.txt,.md,.csv,application/pdf" multiple hidden>
            <input type="file" id="w-datei-bild" accept="image/*" multiple hidden>
            <select class="sel wi-neu__ber" id="w-ber" aria-label="Area"><option value="">Area: automatic</option>${(S.wissen.bereiche || []).filter(b => b !== 'Questions & answers').map(b => `<option value="${esc(b)}"${S.entwurfBer === b ? ' selected' : ''}>Area: ${esc(b)}</option>`).join('')}</select>
            <span></span>
            <button class="kn kn--gold" type="button" id="w-los">Take over<i>${PF}</i></button>
          </div>
          <div class="wi-neu__ziehen" aria-hidden="true">Drop the file here</div>
        </div>
        <p class="wi-neu__hinweis">PDF, Word, text and photos up to 20 MB. Own text with a chosen area stands in the knowledge at once; links, documents and photos are read in the background.</p>
        ${links.length ? `<div class="wi-links">${links.map(x => `<div class="wi-l wi-l--${x.status}" data-lid="${esc(x.lid)}"><span class="wi-l__z" aria-hidden="true"></span>
          <div><b>${esc(x.titel || host(x.url) || 'Own text')}</b><small>${x.von ? esc(x.von) + ' · ' : ''}${x.status === 'liest' ? 'Being read …' : x.status === 'fertig' ? mal(x.wids.length, 'One entry', 'entries') + ' taken over · ' + zeit(x.fertig) : x.status === 'leer' ? 'Nothing for customers found' + (x.meldung ? ': ' + esc(x.meldung) : '') : esc(x.meldung || 'Could not be read.')}</small></div>
          ${x.status === 'liest' ? '' : `<span class="wi-l__kn"><button class="link" type="button" data-akt="neu">Read again</button><button class="link rot" type="button" data-akt="weg">Remove</button></span>`}</div>`).join('')}</div>` : ''}
      </section>
      <section class="platte wi-probe">
        <span class="mono">Check the chat</span>
        <h2>Ask <em>like a customer.</em></h2>
        <p>The answer comes from the knowledge as it stands here now. This question does not go into the log.</p>
        <form class="wi-ein__f" id="w-probe-f" autocomplete="off"><label class="suche wi-ein__feld">${SYM.chat.replace('<svg', '<svg fill="none" stroke="currentColor" stroke-width="1.4"')}<input type="text" id="w-probe" placeholder="Do you ship to Switzerland?"></label>
          <button class="kn kn--linie" type="submit">Ask<i>${SYM.chat}</i></button></form>
        <div class="wi-antwort" id="w-antwort" hidden></div>
      </section>
    </div>
    ${verlauf.length ? `<section class="platte sb-verlauf"><span class="mono">Last changed</span><ol>${verlauf.slice(0, 6).map(v => `<li><span class="mono">${esc(datum(v.zeit))}</span><b>${esc(W_ART[v.art] || v.art)}${v.wer ? ' · ' + esc(v.wer) : ''}</b><p dir="auto">${esc(v.titel)}</p></li>`).join('')}</ol></section>` : ''}
    <label class="suche wi-such">${LUPE}<input type="search" id="w-such" placeholder="Search, for example shipping, sizes, press" value="${esc(S.such)}" autocomplete="off"></label>
    <div id="w-ergebnis"${q ? ' class="sucht"' : ''}>${q && !liste.length ? fehltS(S.such.trim()) : !q && (W.offen || []).length ? offenS(W.offen) : ''}
    ${q && !liste.length ? '' : (() => {   /* ordered instead of staggered (Robert 16.10.2026): left the areas as a table of contents, right the chosen area in full width. When searching, right all hits one below the other. */
      const da = bereiche.filter(b => liste.some(p => p.bereich === b) || (!q && ['Events', 'Questions & answers'].includes(b)));
      if (!da.includes(S.bereich)) S.bereich = da[0] || '';
      const idx = da.map(b => { const n = liste.filter(p => p.bereich === b && !p.beispiel).length, t = liste.filter(p => p.bereich === b && (p.geaendert || p.aus || p.typ === 'eintrag' || (p.typ === 'antwort' && !p.beispiel))).length;
        return `<button class="sb-i" type="button" data-bereich="${esc(b)}"${!q && S.bereich === b ? ' aria-current="true"' : ''}>${BER_BILD[b] ? `<span class="sb-i__bild" aria-hidden="true"><img src="${BER_BILD[b]}" alt="" width="900" height="675" decoding="async"></span>` : ''}
          <span class="sb-i__n"><b>${esc(b)}</b><small>${n ? mal(n, 'one entry', 'entries') : 'still empty'}${t ? ' · ' + t + ' from the team' : ''}</small></span></button>`; }).join('');
      return `<div class="sb"><nav class="platte sb-idx" aria-label="Areas of the knowledge">${idx}</nav><div class="sb-rechts">${q ? da.map(tafel).join('') : tafel(S.bereich)}</div></div>`;
    })()}</div>`;
}
/* Nothing in the knowledge for a search word: not refused, but led to the answer (Robert 16.10.2026: «solution-oriented … a request to the department in charge»).
   Enter it yourself, or ask the department with a form (E27: no mail program); the topic then stands at the top as open. */
const ABTEILUNG = ['Customer support', 'Sales B2B', 'Marketing', 'Press', 'Founder'];
function fehltS(wort) {
  const thema = wort.charAt(0).toUpperCase() + wort.slice(1), ber = S.wissen.bereiche.filter(b => b !== 'Questions & answers');
  return `<section class="platte sb-fehlt" data-thema="${esc(thema)}">
    <span class="mono">Not in the knowledge yet</span>
    <h2>Nothing about «${esc(thema)}» yet. <em>What should the chat say?</em></h2>
    <p>Until then the chat points customers to ${esc(HAUS.support)} when they ask. Enter the answer yourself, or ask the colleague who knows it.</p>
    <div class="sb-fehlt__wege">
      <div class="sb-fehlt__w"><b>Enter it yourself</b>
        <label class="feld"><span>Area</span><select class="sel" id="fe-ber">${ber.map(b => `<option>${esc(b)}</option>`).join('')}</select></label>
        <label class="feld"><span>What the chat should say about «${esc(thema)}»</span><textarea id="fe-text" rows="4" placeholder="In whole sentences, the way you would say it to a customer."></textarea></label>
        <button class="kn kn--gold" type="button" id="fe-los">Into the knowledge<i>${SYM.haken}</i></button></div>
      <div class="sb-fehlt__w"><b>Ask the department</b>
        <p>The question stays here under «Open with your team» until the answer is entered. No mail program opens.</p>
        <label class="feld"><span>Who knows it?</span><select class="sel" id="fe-an">${ABTEILUNG.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join('')}</select></label>
        <label class="feld"><span>The question</span><textarea id="fe-frage" rows="3">Customers ask the chat about «${esc(thema)}». What should they know about it (rules, prices, times, exceptions)?</textarea></label>
        <button class="kn kn--linie" type="button" id="fe-frag">Ask<i>${PF}</i></button></div>
    </div></section>`;
}
function offenS(l) {
  return `<section class="platte sb-offen"><span class="mono">Open with your team</span>
    ${l.map(x => `<div class="sb-offen__z" data-oid="${esc(x.oid)}"><div><b>${esc(x.thema)}</b><small>${x.an ? esc(x.an) + ' asked' : 'open'}${x.von ? ' by ' + esc(x.von) : ''} · ${esc(datum(x.zeit))}</small>${x.frage ? `<p dir="auto">${esc(x.frage)}</p>` : ''}</div>
      <button class="kn kn--klein kn--gold" type="button" data-akt="antwort">Enter the answer<i>${PF}</i></button><button class="link" type="button" data-akt="weg">No longer needed</button></div>`).join('')}</section>`;
}
function verbindeFehlt() {
  const f = $('.sb-fehlt');
  if (f) {
    const thema = f.dataset.thema;
    $('#fe-los').onclick = async () => {
      const text = $('#fe-text').value.trim(); if (text.length < 3) return $('#fe-text').focus();
      try { const b = $('#fe-ber').value; await api('wissen_eintrag', { bereich: b, titel: thema, text, gueltig_bis: null, von: VON() });
        S.such = ''; S.bereich = b; await wissenNeu(); quit('Taken over', `The chat answers about «${thema}» with it from the next question on.`, [], false, 4500); } catch (e) { fehler(e); }
    };
    $('#fe-frag').onclick = async () => {
      const an = ABTEILUNG[+$('#fe-an').value], frage = $('#fe-frage').value.trim();
      try { await api('wissen_offen', { thema, an, von: VON(), frage }); } catch (e) { return fehler(e); }
      S.such = ''; await wissenNeu(); quit('Noted as open', `«${thema}» stands at the top until the answer is entered.`, [], false, 5000);
    };
  }
  $$('.sb-offen__z [data-akt]').forEach(b => b.onclick = async () => {
    const x = (S.wissen.offen || []).find(y => y.oid === b.closest('.sb-offen__z').dataset.oid);
    if (b.dataset.akt === 'antwort') return eintragFenster({ titel: x.thema, oid: x.oid });
    try { await api('wissen_offen_weg', { oid: x.oid }); await wissenNeu(); } catch (e) { fehler(e); }
  });
}
function nurErgebnis() {   // when searching only the hits are redrawn: search field and page stay
  const tmp = document.createElement('div'); tmp.innerHTML = wissenS();
  $('#w-ergebnis').replaceWith(tmp.querySelector('#w-ergebnis')); verbindeWissen();
}
/* New knowledge: one field for text, links, documents and photos (Robert 16.10.2026). Draft and files stay in memory until taken over; photos are shrunk to 2000 px before upload. */
const DOK = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 1.8h5l3 3v9.4H4z"/><path d="M9 1.8v3h3M6 8.5h4M6 11h4"/></svg>';
const FOTO = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><circle cx="5.6" cy="6.6" r="1.2"/><path d="m2.5 12 4-4 3 3 2-2 2.5 2.5"/></svg>';
const groesse = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
function dateienS() {
  return (S.dateien || []).map((f, i) => `<span class="wi-d">${f.vorschau ? `<img src="${f.vorschau}" alt="" width="40" height="40">` : `<i>${DOK}</i>`}<span><b>${esc(f.name)}</b><small>${groesse(f.groesse)}</small></span><button type="button" data-weg="${i}" aria-label="Remove ${esc(f.name)}">${ZU}</button></span>`).join('');
}
function zeigeDateien() { $('#w-dateien').innerHTML = dateienS(); $$('#w-dateien [data-weg]').forEach(b => b.onclick = () => { S.dateien.splice(+b.dataset.weg, 1); zeigeDateien(); }); }
function verkleinere(datei) {   // photo → JPEG, longest side 2000 px
  return new Promise((ok, nein) => { const u = URL.createObjectURL(datei), im = new Image();
    im.onload = () => { const m = Math.min(1, 2000 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * m); c.height = Math.round(im.height * m); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      const d = c.toDataURL('image/jpeg', 0.86); ok({ daten: d, typ: 'image/jpeg', groesse: Math.round(d.length * 0.75), vorschau: d }); };
    im.onerror = () => nein(new Error('DATEI · ' + datei.name + ' cannot be opened as a photo.')); im.src = u; });
}
function alsDaten(datei) { return new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => nein(new Error('DATEI · ' + datei.name + ' could not be read.')); r.readAsDataURL(datei); }); }
async function legeDazu(liste) {
  S.dateien = S.dateien || [];
  for (const d of [...liste]) {
    if (S.dateien.length >= 10) { quit('At most ten files at once', '', [], true, 3500); break; }
    try {
      if (/^image\//.test(d.type) && d.type !== 'image/gif') { const v = await verkleinere(d); S.dateien.push({ name: d.name.replace(/\.\w+$/, '') + '.jpg', ...v }); }
      else if (/\.(pdf|docx|txt|md|csv)$/i.test(d.name) || d.type === 'image/gif') {
        if (d.size > 20 * 1048576) { quit(d.name + ' is larger than 20 MB', '', [], true, 4000); continue; }
        S.dateien.push({ name: d.name, typ: d.type || (/\.pdf$/i.test(d.name) ? 'application/pdf' : ''), groesse: d.size, daten: await alsDaten(d), vorschau: d.type === 'image/gif' ? await alsDaten(d) : '' });
      } else quit(d.name + ' cannot be read', 'PDF, Word, text or photos.', [], true, 4000);
    } catch (e) { fehler(e); }
  }
  zeigeDateien();
}
function verbindeNeu() {
  const feld = $('#w-feld'), t = $('#w-text');
  const hoehe = () => { t.style.height = 'auto'; t.style.height = Math.min(Math.max(t.scrollHeight, 96), 320) + 'px'; };
  t.oninput = () => { S.entwurf = t.value; hoehe(); }; hoehe();
  t.onpaste = e => { const f = e.clipboardData && e.clipboardData.files; if (f && f.length) { e.preventDefault(); legeDazu(f); } };
  $('#w-ber').onchange = e => { S.entwurfBer = e.target.value; };
  $('#w-doc').onclick = () => $('#w-datei-doc').click(); $('#w-bild').onclick = () => $('#w-datei-bild').click();
  $('#w-datei-doc').onchange = e => { legeDazu(e.target.files); e.target.value = ''; };
  $('#w-datei-bild').onchange = e => { legeDazu(e.target.files); e.target.value = ''; };
  feld.ondragover = e => { e.preventDefault(); feld.classList.add('zieht'); };
  feld.ondragleave = e => { if (!feld.contains(e.relatedTarget)) feld.classList.remove('zieht'); };
  feld.ondrop = e => { e.preventDefault(); feld.classList.remove('zieht'); if (e.dataTransfer.files.length) legeDazu(e.dataTransfer.files); };
  $$('#w-dateien [data-weg]').forEach(b => b.onclick = () => { S.dateien.splice(+b.dataset.weg, 1); zeigeDateien(); });
  $('#w-los').onclick = async () => {
    const text = t.value.trim(), dateien = S.dateien || [];
    if (!text && !dateien.length) { t.focus(); return quit('Please write something or add a file', '', [], true, 3500); }
    await einlesen({ text, bereich: $('#w-ber').value, dateien: dateien.map(f => ({ name: f.name, typ: f.typ, daten: f.daten })) });
  };
}
async function einlesen(d) {
  const k = $('#w-los'); if (k) k.disabled = true;
  try { const r = await api('wissen_einlesen', { ...d, von: VON() });
    if (!d.lid) { S.entwurf = ''; S.dateien = []; }
    if (r.direkt) { S.bereich = r.direkt.bereich; await wissenNeu(); quit('Taken over', `Now stands under «${r.direkt.bereich}». The chat answers with it from the next question on.`, [], false, 5000); }
    else { await wissenNeu(); quit('Being read', 'This usually takes half a minute. You can keep working.', [], false, 4500); wachen(); }
  } catch (e) { fehler(e); } finally { if (k && document.body.contains(k)) k.disabled = false; }
}
function wissenNeu(d) { if (d) S.ue = { ...S.ue, ...d }; S.wissen = null; return zeichneHalten(); }
async function zeichneHalten() {   // redraw and stay at the same place
  const y = scrollY;
  await ladeWissen(); $('#ansicht').innerHTML = wissenS(); verbindeWissen(); rand(); window.scrollTo(0, y);
}
function posten(id) { return wissenZeilen().find(p => p.id === id); }
function verbindeWissen() {
  $('#w-neu').onclick = () => eintragFenster({});
  $$('[data-neu]').forEach(b => b.onclick = () => b.dataset.neu === 'Questions & answers' ? nachtragenFenster({ frage: '', antwort: '' }) : eintragFenster({ bereich: b.dataset.neu }));
  $('#w-link-auf').onclick = () => { $('#w-ein').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#w-text').focus(), 350); };
  verbindeNeu();
  $('#w-probe-f').onsubmit = async e => {
    e.preventDefault(); const f = $('#w-probe').value.trim(); if (!f) return $('#w-probe').focus();
    const a = $('#w-antwort'); a.hidden = false; a.className = 'wi-antwort lade'; a.innerHTML = '<span class="mono">The chat answers …</span>';
    try { const d = await api('wissen_probe', { frage: f });
      a.className = 'wi-antwort' + (d.belegt ? '' : ' luecke');
      a.innerHTML = `<span class="mono">${d.belegt ? 'Answer of the chat' : 'The chat knows nothing about it'}</span><div dir="auto">${antwortHTML(d.text)}</div>${d.belegt ? '' : `<button class="kn kn--klein kn--gold" type="button" id="w-probe-luecke">Add the answer<i>${PF}</i></button>`}`;
      if (!d.belegt) $('#w-probe-luecke').onclick = () => nachtragenFenster({ frage: f, antwort: '' });
    } catch (err) { a.hidden = true; fehler(err); }
  };
  let t = 0;
  $('#w-such').oninput = e => { clearTimeout(t); t = setTimeout(() => { S.such = e.target.value; nurErgebnis(); }, 200); };
  verbindeFehlt();
  $$('.sb-z').forEach(b => b.onclick = () => zeileFenster(posten(b.dataset.id)));
  $$('.sb-i').forEach(b => b.onclick = () => { S.bereich = b.dataset.bereich; if (S.such) S.such = '';
    $('#ansicht').innerHTML = wissenS(); verbindeWissen(); const r = $('.sb').getBoundingClientRect().top; if (r < 120) window.scrollTo(0, scrollY + r - 120); });
  $$('.wi-l [data-akt]').forEach(b => b.onclick = async () => {
    const x = S.wissen.links.find(y => y.lid === b.closest('.wi-l').dataset.lid);
    if (b.dataset.akt === 'neu') return einlesen({ lid: x.lid });
    fenster(`<h2>Remove <em>the link?</em></h2><p>${x.wids.length ? mal(x.wids.length, 'The entry', 'The ' + x.wids.length + ' entries') + ' from this link go with it, the chat then no longer knows them.' : 'Nothing from this link stands in the knowledge.'}</p>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gefahr" type="button" id="f-los">Remove<i>${SYM.korb}</i></button></div>`, true, async () => {
      fensterZu(); try { await api('wissen_link_weg', { lid: x.lid }); await wissenNeu(); quit('Removed', '', [], false, 3000); } catch (e) { fehler(e); } });
  });
}
/* Open a row: read, change, switch off */
function zeileFenster(p) {
  if (p.typ === 'antwort') {
    if (p.beispiel) {
      fenster(`<span class="mono">Example</span><h2 dir="auto">${esc(p.was)}</h2><p dir="auto">${esc(p.angabe)}</p><p>This example is invented and only shows how added answers look. The chat does not know it.</p>
        <div class="fenster__kn"><button class="link rot" type="button" id="f-weg">Remove</button><button class="kn kn--linie" type="button" data-zu>Close<i>${ZU}</i></button></div>`, true);
      $('#f-weg').onclick = async () => { try { const d = await api('nachtragen_weg', { nid: p.x.nid }); fensterZu(); S.fragen = null; await wissenNeu(d); quit('Removed', '', [], false, 3000); } catch (e) { fehler(e); } };
      return;
    }
    return nachtragenFenster(p.x);
  }
  if (p.typ === 'eintrag') return eintragFenster(p.e);
  const f = p.z, beleg = f.beleg;
  fenster(`<span class="mono">${esc(p.bereich)} · ${esc(p.gruppe)}</span><h2>${esc(p.was)}</h2>
    <label class="feld"><span>This is what the chat says</span><textarea id="f-angabe" rows="3">${esc(p.aus ? p.orig : p.angabe)}</textarea></label>
    <div class="sb-beleg"><span class="mono">This is how it stands on the website</span><p>«${esc(beleg)}»</p>${(f.mehr || []).map(m => `<p>«${esc(m)}»</p>`).join('')}</div>
    ${p.geaendert ? `<p class="sb-hinweis">Changed${p.von ? ' by ' + esc(p.von) : ''} on ${esc(datum(p.zeit))}. Before: «${esc(p.orig)}»</p>` : ''}${p.aus ? `<p class="sb-hinweis">Switched off${p.von ? ' by ' + esc(p.von) : ''} on ${esc(datum(p.zeit))}: the chat no longer mentions it.</p>` : ''}
    <div class="fenster__kn sb-kn">${p.geaendert || p.aus ? '<button class="link" type="button" id="f-zurueck">As on the website</button>' : ''}${p.aus ? '' : '<button class="link rot" type="button" id="f-aus">No longer mention</button>'}
      <span></span><button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">Take over<i>${SYM.haken}</i></button></div>`, true, async () => fakt({ angabe: $('#f-angabe').value }, 'Changed'));
  const z = $('#f-zurueck'); if (z) z.onclick = () => fakt({ zurueck: true }, 'As on the website');
  const a = $('#f-aus'); if (a) a.onclick = () => fakt({ aus: true }, 'Switched off');
  async function fakt(d, titel) {
    try { await api('wissen_fakt', { fid: f.fid, ...d, von: VON() }); fensterZu(); await wissenNeu(); quit(titel, 'The chat answers with it from the next question on.', [], false, 4000); } catch (e) { fehler(e); }
  }
  setTimeout(() => { const t = $('#f-angabe'); if (t) t.focus(); }, 60);
}
function eintragFenster(e) {
  const bereiche = S.wissen.bereiche.filter(b => b !== 'Questions & answers');
  fenster(`<h2>${e.wid ? 'Change <em>the entry.</em>' : 'Add <em>an entry.</em>'}</h2>
    <p>What the chat should know about txtme.social: a new piece, a changed price, an event. ${e.quelle && e.quelle.art === 'link' ? 'Taken from a link; your change stays until the link is read again.' : 'From the next question on, the chat answers with it.'}</p>
    <div class="wi-fz"><label class="feld"><span>Area</span><select class="sel" id="f-ber">${bereiche.map(b => `<option${(e.bereich || 'The company') === b ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></label>
      <label class="feld"><span>Valid until (empty = no end)</span><input type="date" id="f-bis" value="${esc(e.gueltig_bis || '')}"></label></div>
    <label class="feld"><span>Title</span><input id="f-titel" value="${esc(e.titel || '')}" placeholder="The way a customer would ask"></label>
    <label class="feld"><span>What the chat should know</span><textarea id="f-text" rows="7" placeholder="In whole sentences, with date, time, place and price where known.">${esc(e.text || '')}</textarea></label>
    ${e.von ? `<p class="sb-hinweis">Last entered by ${esc(e.von)} on ${esc(datum(e.geaendert || e.zeit))}.</p>` : ''}
    <div class="fenster__kn sb-kn">${e.wid ? '<button class="link rot" type="button" id="f-weg">Remove</button><span></span>' : ''}<button class="link" type="button" data-zu>Cancel</button><button class="kn kn--gold" type="button" id="f-los">${e.wid ? 'Take over' : 'Add'}<i>${SYM.haken}</i></button></div>`, true, async () => {
    try { const b = $('#f-ber').value;
      await api('wissen_eintrag', { wid: e.wid || '', bereich: b, titel: $('#f-titel').value, text: $('#f-text').value, gueltig_bis: $('#f-bis').value || null, von: VON() });
      if (e.oid) await api('wissen_offen_weg', { oid: e.oid }).catch(() => {});
      fensterZu(); S.offen[b] = true; S.bereich = b; await wissenNeu(); quit(e.wid ? 'Changed' : 'Added', 'The chat answers with it from the next question on.', [], false, 4500); } catch (err) { fehler(err); }
  });
  const w = $('#f-weg'); if (w) w.onclick = async () => {
    try { await api('wissen_eintrag_weg', { wid: e.wid, von: VON() }); fensterZu(); await wissenNeu(); quit('Removed', 'The chat no longer knows it from the next question on.', [], false, 3500); } catch (err) { fehler(err); } };
  setTimeout(() => { const t = $(e.wid ? '#f-text' : '#f-titel'); if (t) t.focus(); }, 60);
}
function wachen() {   // while a link is being read, look every three seconds
  clearInterval(wachUhr);
  wachUhr = setInterval(async () => {
    try { const d = await api('wissen_links'), offen = d.links.filter(x => x.status === 'liest');
      const fertig = (S.wissen ? S.wissen.links : []).filter(x => x.status === 'liest').map(x => d.links.find(y => y.lid === x.lid)).filter(x => x && x.status !== 'liest');
      if (fertig.length || !offen.length) {
        if (!offen.length) clearInterval(wachUhr);
        if (S.ansicht === 'wissen' && !$('#fenster').innerHTML) await wissenNeu(); else S.wissen = null;
        fertig.forEach(x => x.status === 'fertig'
          ? quit(mal(x.wids.length, 'One entry', x.wids.length + ' entries') + ' taken over', (x.titel || host(x.url)) + '. The chat knows them from now on.', [['See it', () => { S.such = ''; gehe('wissen'); }]], false, 8000)
          : quit(x.status === 'leer' ? 'Nothing for customers found' : 'Could not be read', x.meldung || '', [], true, 9000));
      }
    } catch (e) { /* quiet */ }
  }, 3000);
}

/* ---------- Try the chat (Robert 16.10.2026: «lands on the website and has no idea what to do») ----------
   Window in Chat Team: left what to do, with tappable customer questions; right an own chat window in the dress of txtme.social, in the form of a phone
   (E32: no page of the shop needed), asking the same way /api/gast (?probe=1 marks questions as examples). */
const PROBEFRAGEN = ['Do you ship to Switzerland?', 'Which size should I take for the Festival Print tee?', 'How does the code on the shirt work?', 'Can I return a piece if it does not fit?'];
function probe() {
  let o = $('#probe');
  if (!o) { o = document.createElement('div'); o.id = 'probe'; o.className = 'probe'; document.body.appendChild(o); }
  o.innerHTML = `<div class="probe__k" role="dialog" aria-modal="true" aria-label="Try the chat">
      <aside class="probe__links">
        <button class="rund probe__zu" type="button" aria-label="Close">${ZU}</button>
        <span class="mono">Try the chat</span>
        <h2>This is how <em>a customer asks.</em></h2>
        <p><span class="probe__wo">On the right</span><span class="probe__wo probe__wo--unten">Below</span> you see the chat the way customers open it on the website. Tap a question or write into the field yourself.</p>
        <div class="probe__fragen">${PROBEFRAGEN.map(f => `<button type="button" data-frage="${esc(f)}"><i>${SYM.chat}</i><span>${esc(f)}</span></button>`).join('')}</div>
        <p class="probe__klein">Questions from here count as examples in «What was asked».${S.ue && S.ue.demo ? ' In the demo the chat answers from the recorded answers and the knowledge, without a model.' : ''}</p>
        <div class="probe__kn"><button class="kn kn--gold" type="button" id="probe-eingang">To what was asked<i>${PF}</i></button></div>
      </aside>
      <div class="probe__rechts"><div class="probe__handy"><iframe id="probe-f" title="The chat" src="probe.html?probe=1"></iframe></div></div>
    </div>`;
  o.hidden = false; document.documentElement.classList.add('probe-offen');
  const f = $('#probe-f');
  $$('.probe__fragen [data-frage]', o).forEach(b => b.onclick = () => { try { f.contentWindow.postMessage({ frage: b.dataset.frage }, location.origin); } catch (e) { /* not ready yet */ } });
  const zu = () => { o.hidden = true; o.innerHTML = ''; document.documentElement.classList.remove('probe-offen'); };
  $('.probe__zu', o).onclick = zu;
  o.onclick = e => { if (e.target === o) zu(); };
  $('#probe-eingang').onclick = () => { zu(); S.anfragen = null; S.fragen = null; frisch(); gehe('gefragt'); };
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape' && !o.hidden) { zu(); document.removeEventListener('keydown', esc); } });
}

/* ---------- Windows ---------- */
function meldungZurueck() {   // the receipts go back to their place on the page before the window changes or closes (C5)
  const m = $('#meldung'); if (!m.classList.contains('im-fenster')) return;
  m.classList.remove('im-fenster'); m.innerHTML = ''; document.body.insertBefore(m, $('#fenster').nextSibling);
}
function fenster(html, schmal = false, los = null) {
  const f = $('#fenster'); meldungZurueck();
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Close">${ZU}</button>${html}</div>`;
  f.hidden = false;
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
  if (los && $('#f-los')) $('#f-los').onclick = los;
}
function fensterZu() { meldungZurueck(); $('#fenster').hidden = true; $('#fenster').innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu(); });
/* Leaving with an unsaved letter: the browser asks (R13) */
addEventListener('beforeunload', e => {
  const st = $('#gs-stand'); let halt = !!(st && /Saving/.test(st.textContent));
  if (halt && S.briefSichern) S.briefSichern();
  if (textOffen()) { textSichern(true).catch(() => {}); halt = true; }   // «Text only»: stored while leaving, and the browser asks (R13, E17)
  if (halt) { e.preventDefault(); e.returnValue = ''; }
});
addEventListener('pagehide', () => { if (textOffen()) textSichern(true).catch(() => {}); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && textOffen()) textSichern(true).catch(() => {}); });
/* ⌘S / Ctrl+S saves the letter in both views (R09) */
document.addEventListener('keydown', e => {
  if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 's') return;
  if ($('#e-text')) { e.preventDefault(); textSichern().then(() => quit('Saved', 'Your change to the letter is stored.', [], false, 3000)).catch(fehler); }
  else if ($('#brief') && S.briefSichern) { e.preventDefault(); Promise.resolve(S.briefSichern()).then(() => quit('Saved', 'The letter is stored.', [], false, 2500)); }
});

/* ---------- Limits of the fields: shown from 70 % on, and in red when too long; the server refuses with a clear message instead of cutting (Abnahme 06.11.2026 Fund 4) ---------- */
const GRENZE = { 'f-frage': 400, 'f-antwort': 2000, 'f-angabe': 600, 'f-titel': 140, 'f-text': 4000, 'fe-text': 4000, 'fe-frage': 600, 'w-text': 4000, 'w-probe': 600,
  'e-betreff': 300, 'e-text': 12000, 'e-hinweis': 2000, 'f-hinweis': 2000 };
const zahl = n => n.toLocaleString('en-GB');
function grenzeZeigen(el) {
  const g = el && GRENZE[el.id]; if (!g) return;
  const n = el.value.length, ort = el.closest('label, dd, .brief__text') || el.parentNode;
  let z = ort.querySelector(':scope > .grenze');
  if (n < g * .7) { if (z) z.remove(); return; }
  if (!z) { z = document.createElement('small'); z.className = 'grenze'; z.setAttribute('aria-live', 'polite'); ort.appendChild(z); }
  z.textContent = n > g ? `${zahl(n)} characters, at most ${zahl(g)} fit · ${zahl(n - g)} too many` : `${zahl(n)} of at most ${zahl(g)} characters`;
  z.classList.toggle('zu-lang', n > g);
}
document.addEventListener('input', e => grenzeZeigen(e.target));
document.addEventListener('focusin', e => grenzeZeigen(e.target));

/* ---------- «Text only»: what is typed counts as not saved until it is stored (R09, R10, R13, E17; Abnahme 06.11.2026 Fund 1) ---------- */
function textOffen() {
  const b = $('#e-betreff'), t = $('#e-text'); if (!b || !t || !S.anfragen) return null;
  const a = S.anfragen.find(x => x.id === S.bearbeiten); if (!a || !a.entwurf) return null;
  return b.value !== a.entwurf.betreff || t.value !== a.entwurf.text ? { a, betreff: b.value, text: t.value } : null;
}
/* A copy of an unsaved change in «Text only» for this tab (Abnahme 07.11.2026 C6: once in Firefox the save while reloading did not arrive).
   After the reload the tool looks: if the letter on the server is still the version the change was made on, the change comes back and is stored. */
function textMerken() {
  const o = textOffen();
  try { if (o) sessionStorage.setItem('ct-text', JSON.stringify({ id: o.a.id, fassung: o.a.fassung || 0, betreff: o.betreff, text: o.text })); else sessionStorage.removeItem('ct-text'); } catch (e) { /* private */ }
}
async function textZurueck() {
  let m = null; try { m = JSON.parse(sessionStorage.getItem('ct-text') || 'null'); } catch (e) { return; }
  if (!m || !m.id) return;
  try {
    if (!S.anfragen) S.anfragen = (await api('anfragen')).anfragen;
    const a = S.anfragen.find(x => x.id === m.id);
    if (!a || !a.entwurf || (a.fassung || 0) !== m.fassung || (a.entwurf.betreff === m.betreff && a.entwurf.text === m.text)) { sessionStorage.removeItem('ct-text'); return; }
    S.ansicht = 'eingang'; S.wahl = m.id; S.bearbeiten = m.id;
    if (location.hash !== '#eingang') history.replaceState(null, '', '#eingang');
    rand(); await zeichne();
    const b = $('#e-betreff'), t = $('#e-text'); if (!b || !t) return;
    b.value = m.betreff; t.value = m.text; [b, t].forEach(x => x.dispatchEvent(new Event('input')));
    await textSichern();
    quit('Your change is back', 'It had not arrived before the page was reloaded. It is stored now.', [], false, 6000);
  } catch (e) { fehler(e); }
}
function textStand(t) {
  if ($('#e-text')) textMerken();   // only while «Text only» is open: drawing another view must not drop the copy before it can come back
  const s = $('#tx-stand'); if (!s) return;
  if (t === undefined) t = textOffen() ? 'Not saved yet · ⌘S saves' : 'Saved';
  s.textContent = t; s.classList.toggle('offen', /^Not saved/.test(t)); s.classList.toggle('laeuft', /^Saving/.test(t));
}
function textSichern(halten = false) {
  const o = textOffen(); if (!o) return Promise.resolve(true);
  const inhalt = o.a.id + '\n' + o.betreff + '\n' + o.text;
  if (S.txLauf && S.txLauf.inhalt === inhalt) return S.txLauf.p;   // the same change is already on its way
  textStand('Saving …');
  const p = api('anfrage', { id: o.a.id, betreff: o.betreff, entwurf_text: o.text, fassung: o.a.fassung || 0 }, halten)
    .then(d => { o.a.fassung = d.fassung; o.a.entwurf.betreff = o.betreff; o.a.entwurf.text = o.text; textStand(); return true; })
    .catch(x => { textStand('Not saved'); throw x; })
    .finally(() => { if (S.txLauf && S.txLauf.p === p) S.txLauf = null; });
  S.txLauf = { inhalt, p };
  return p;
}
function textVorher(weiter) {   // store first; if that fails the letter stays open with the text, and the receipt says why
  textSichern().then(() => weiter()).catch(x => {
    fehler(x);
    quit('The letter stays open', 'Your change is not stored, so nothing was switched. Try «Save change» again, or discard the change.', [['Discard change', () => {
      const o = textOffen(); if (o) { $('#e-betreff').value = o.a.entwurf.betreff; $('#e-text').value = o.a.entwurf.text; textStand(); } weiter(); }]], true, 15000);
  });
}

/* ---------- Start ---------- */
(async function () {
  try {
    const h = await api('haus'); Object.assign(HAUS, h); Object.assign(N, h.namen || {}); Object.assign(ART, h.arten || {});
    GKOPF.zeile = HAUS.brief.zeile; GKOPF.fuss = HAUS.brief.fuss; document.title = N.werkzeug + ' · ' + HAUS.haus;
    S.ue = await api('ueberblick');
  }
  catch (e) { $('#tuer').hidden = false; $('#tuer-t').textContent = String(e.message || e).replace(/^[A-ZÄÖÜ-]+ · /, ''); return; }
  const h = location.hash.slice(1);
  try { const l = await api('wissen_links'); S.wissenDa = true; S.wissenNeu = 0; if (l.links.some(x => x.status === 'liest')) wachen(); } catch (e) { S.wissenDa = false; }
  try { S.ansicht = ['start', 'eingang', 'gefragt', 'nachgetragen', 'wissen'].includes(h) ? h : ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload' && !document.referrer.includes(location.host)) ? 'start' : localStorage.getItem('chat-team-ansicht') || 'start'; }   /* opened from outside: always the overview (R15); on reload the last view stays */ catch (e) { S.ansicht = 'start'; }
  if (!TITEL[S.ansicht] || (S.ansicht === 'wissen' && !S.wissenDa)) S.ansicht = 'start';
  rand(); leiste(); await zeichne();
  await textZurueck();
  window.addEventListener('hashchange', () => { const z = location.hash.slice(1); if (TITEL[z] && z !== S.ansicht) gehe(z); });
  setInterval(async () => {   // every two minutes look whether something new is there (without disturbing the view, E14)
    try { const u = await api('ueberblick'); if (u.anfragen_gesamt !== S.ue.anfragen_gesamt || u.fragen_gesamt !== S.ue.fragen_gesamt || u.anfragen_neu !== S.ue.anfragen_neu) { S.ue = u; S.anfragen = null; S.fragen = null; rand(); leiste(); if (S.ansicht !== 'eingang' || !($('#e-text') || $('.gs--schreib'))) zeichne(); } } catch (e) { /* quiet */ }
  }, 120000);
})();
