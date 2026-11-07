/* Backstage · txtme.social: die Oberfläche des Kontrollpanels. Ohne Bibliothek. Spricht mit backstage.py unter /backstage/api/.
   Fester Rahmen (Robert 09.10.2026): nichts speichert still, jede Änderung hat einen Knopf und eine Quittung, Speichern ist immer zu sehen
   (grau, gelb bei offenen Eingaben, grün nach dem Speichern), unten die Entwurfs-Leiste, Vorher/Nachher vor dem Veröffentlichen, Rückholen. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const sicht = $('#sicht');
const FEHLERLOG = 'txtme_backstage_fehler';
function merkFehler(text, wo, lex) {
  try {
    const l = JSON.parse(localStorage.getItem(FEHLERLOG) || '[]');
    l.push({ zeit: new Date().toISOString(), text: String(text).slice(0, 400), wo: String(wo || '').slice(0, 80), lex: lex || '' });
    localStorage.setItem(FEHLERLOG, JSON.stringify(l.slice(-40)));
  } catch (e) {}
  fetch('/backstage/api/fehler', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Backstage': '1' }, body: JSON.stringify({ text, wo, lex }) }).catch(() => {});
}
window.addEventListener('error', e => merkFehler(e.message, e.filename + ':' + e.lineno, 'skript'));
window.addEventListener('unhandledrejection', e => merkFehler(e.reason && e.reason.message || e.reason, 'promise', e.reason && e.reason.lex || ''));

let Z = null, D = null, K = null, INV = null, OFFEN = false;
const LEX_STATUS = { 400: 'anfrage', 401: 'anmeldung', 403: 'anmeldung', 413: 'datei-gross', 500: 'serverfehler', 502: 'server-aus', 503: 'server-aus', 504: 'langsam' };
const fehlerMit = (text, lex) => Object.assign(new Error(text), { lex });

async function api(weg, daten) {
  const r = await fetch('/backstage/api/' + weg, daten === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json', 'X-Backstage': '1' }, body: JSON.stringify(daten) })
    .catch(() => { throw fehlerMit('Backstage antwortet nicht. Läuft backstage.py noch?', 'server-aus'); });
  let d = null;
  try { d = await r.json(); } catch (e) { throw fehlerMit('Unerwartete Antwort vom Server (' + r.status + ').', LEX_STATUS[r.status] || 'serverfehler'); }
  if (!r.ok || d.fehler) throw fehlerMit(d.fehler || ('Fehler ' + r.status), d.lex || LEX_STATUS[r.status] || 'serverfehler');
  return d;
}
let meldT = 0;
function sag(text, fehler, lex) {
  const m = $('#meldung');
  m.innerHTML = h(text) + (fehler && lex ? ` <a href="pruefung.html#${h(lex)}" target="_blank" rel="noopener">Was tun?</a>` : '');
  m.classList.toggle('fehler', !!fehler); m.classList.add('da');
  clearTimeout(meldT); meldT = setTimeout(() => m.classList.remove('da'), fehler ? 9000 : 4200);
  if (fehler) merkFehler(text, location.hash, lex);
}
const mal = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;
function datum(z) { if (!z) return ''; const d = new Date(z); return isNaN(d) ? z : d.toLocaleString(/^en/.test(document.documentElement.lang) ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
const eur = n => (n === 0 || n) ? new Intl.NumberFormat(/^en/.test(document.documentElement.lang) ? 'en-IE' : 'de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: Number(n) % 1 ? 2 : 0 }).format(Number(n)) : '';
const preisfeld = n => (n === 0 || n) ? String(n).replace('.', ',') : '';

/* ---------- Fenster, Fragen, Quittung ---------- */
function fenster(html, breit) {
  const f = $('#fenster'); f.innerHTML = `<div class="fenster__k${breit ? ' breit' : ''}" role="dialog" aria-modal="true">${html}</div>`; f.hidden = false;
  f.onclick = e => { if (e.target === f) fensterZu(); };
  const erst = $('input,textarea,select,button', f); if (erst) setTimeout(() => erst.focus(), 60);
  return $('.fenster__k', f);
}
function fensterZu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#vergleich').hidden) vglZu(); else if (!$('#fenster').hidden) fensterZu(); } });
function frage(titel, text, knopf, tun, rot) {
  const k = fenster(`<h2>${h(titel)}</h2><p class="hin">${h(text)}</p><div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>Abbrechen</button><button class="kn ${rot ? 'kn--rot' : 'kn--brand'}" type="button" data-ja>${h(knopf)}</button></div>`);
  $('[data-nein]', k).onclick = fensterZu;
  let geklickt = false;
  $('[data-ja]', k).onclick = async () => { if (geklickt) return; geklickt = true; fensterZu(); try { await tun(); } catch (e) { sag(e.message, true, e.lex); } };
}
function quittung(wirt, q, o = {}) {
  const alt = $('.quittung', wirt); if (alt) alt.remove();
  const el = document.createElement('div'); el.className = 'quittung' + (q.nichts ? ' leise' : '');
  el.innerHTML = `<i>${q.nichts ? '·' : '✓'}</i><div><b>${h(q.titel)}</b><p>${h(q.text || '')}</p>` +
    (q.nichts ? '' : `<div class="kn-reihe"><button class="kn kn--klein kn--linie hell" type="button" data-vgl>Vorher/Nachher ansehen</button>` +
      (o.zurueck ? `<button class="kn kn--klein kn--linie hell" type="button" data-zurueck>Rückgängig</button>` : '') +
      `<a class="kn kn--klein kn--linie hell" href="${h(o.seite || '/entwurf/')}" target="_blank" rel="noopener">Entwurf ansehen ${PF}</a></div>`) + '</div>';
  wirt.prepend(el);
  const v = $('[data-vgl]', el); if (v) v.onclick = () => vergleich(o.seiteK || '');
  const z = $('[data-zurueck]', el); if (z) z.onclick = async () => { try { const r = await api('zuruecknehmen', o.zurueck); sag(r.titel + ' ' + r.text); zeige(true); } catch (e) { sag(e.message, true, e.lex); } };
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/* Speichern-Knopf: grau → gelb (offene Eingaben) → grün (gespeichert) */
function speichernKnopf(wirt, tun, text = 'Speichern') {
  const b = $('[data-speichern]', wirt);
  if (!b) return;
  b.classList.remove('offen', 'gespeichert'); b.textContent = text;
  /* Text nur beim Wechsel auf «offen» neu setzen: Safari verwirft sonst den Klick auf Speichern, wenn das Verlassen eines Feldes den Knopf neu beschriftet (06.11.2026) */
  wirt.addEventListener('input', () => { if (!b.classList.contains('offen')) b.textContent = text; b.classList.add('offen'); b.classList.remove('gespeichert'); });
  wirt.addEventListener('change', () => { if (!b.classList.contains('offen')) b.textContent = text; b.classList.add('offen'); b.classList.remove('gespeichert'); });
  b.onclick = async () => {
    b.disabled = true;
    try {
      const q = await tun();
      b.classList.remove('offen'); b.classList.add('gespeichert'); b.textContent = q && q.nichts ? 'Nichts zu speichern' : 'Gespeichert';
      setTimeout(() => { b.classList.remove('gespeichert'); b.textContent = text; }, 2600);
    } catch (e) { sag(e.message, true, e.lex); }
    b.disabled = false;
  };
}
const feld = (name, label, wert, o = {}) => `<label class="feld${o.breit ? ' breit' : ''}"><span>${h(label)}${o.hinweis ? `<i>${h(o.hinweis)}</i>` : ''}</span>` +
  (o.art === 'lang' ? `<textarea name="${h(name)}" ${o.rows ? `rows="${o.rows}"` : ''}>${h(wert)}</textarea>`
    : o.art === 'wahl' ? `<select name="${h(name)}">${o.optionen.map(([v, t]) => `<option value="${h(v)}"${String(v) === String(wert) ? ' selected' : ''}>${h(t)}</option>`).join('')}</select>`
    : `<input name="${h(name)}" type="${o.typ || 'text'}" value="${h(wert)}" ${o.platz ? `placeholder="${h(o.platz)}"` : ''}>`) +
  (o.code !== undefined && String(o.code) !== String(wert) ? `<span class="code">Im Code: <b>${h(o.code === '' ? '(leer)' : o.code)}</b></span>` : '') + (o.klein ? `<small>${h(o.klein)}</small>` : '') + '</label>';
const werte = wirt => Object.fromEntries($$('[name]', wirt).filter(e => !e.closest('[data-aus]')).map(e => [e.name, e.type === 'checkbox' ? e.checked : e.value]));

/* ---------- Bilder hochladen ---------- */
function waehleDatei(dann) {
  const i = $('#datei'); i.value = '';
  i.onchange = () => { const f = i.files[0]; if (f) dann(f); };
  i.click();
}
function hochladen(f) {
  return new Promise((ok, nein) => {
    if (f.size > 25 * 1024 * 1024) return nein(fehlerMit('Das Bild ist größer als 25 MB.', 'datei-gross'));
    const r = new FileReader();
    r.onload = async () => { try { ok(await api('bild', { name: f.name, daten: r.result })); } catch (e) { nein(e); } };
    r.onerror = () => nein(fehlerMit('Die Datei ließ sich nicht lesen.', 'datei-art'));
    r.readAsDataURL(f);
  });
}

/* ---------- Tor ---------- */
async function tor(z) {
  const t = $('#tor'); t.hidden = false;
  t.innerHTML = `<div class="tor__k"><span class="logo"></span><h1>Backstage</h1><p>${z.eingerichtet ? 'Das Kontrollpanel von txtme.social. Bitte anmelden.' : 'Das Kontrollpanel von txtme.social. Beim ersten Mal legst du ein Passwort fest.'}</p>
    <form><label><span>${z.eingerichtet ? 'Passwort' : 'Neues Passwort (mindestens 8 Zeichen)'}</span><input type="password" name="pw" autocomplete="${z.eingerichtet ? 'current-password' : 'new-password'}" required></label>
    <div class="tor__f"><a href="pruefung.html">Prüfung</a><button class="kn kn--brand" type="submit">${z.eingerichtet ? 'Anmelden' : 'Passwort setzen'}</button></div></form></div>`;
  $('form', t).onsubmit = async e => {
    e.preventDefault();
    try {
      const pw = $('input', t).value;
      if (z.eingerichtet) await api('zugang', { tun: 'anmelden', pw }); else { await api('zugang', { tun: 'einrichten', neu: pw }); await api('zugang', { tun: 'anmelden', pw }); }
      t.hidden = true; start();
    } catch (err) { sag(err.message, true, err.lex); }
  };
}

/* ---------- Navigation ---------- */
const NAV = [
  ['Übersicht', [['uebersicht', 'Übersicht'], ['aenderungen', 'Änderungen', 'entwurf']]],
  ['Shop', [['produkte', 'Produkte'], ['versand', 'Versand & Zahlung']]],
  ['Seiten', [['seiten', 'Seiten & Texte'], ['bilder', 'Bilder'], ['fragen', 'Fragen & Antworten'], ['presse', 'Presse'], ['google', 'Google & Teilen']]],
  ['Firma', [['angaben', 'Angaben'], ['recht', 'Rechtliches']]],
  ['Draußen', [['zahlen', 'Zahlen'], ['chat', 'Im Chat', 'fragen'], ['eingang', 'Eingang']]],
  ['Werkzeug', [['verlauf', 'Verlauf'], ['zugang', 'Zugang']]],
];
function rand() {
  const r = $('#rand');
  const z = Z || {};
  r.innerHTML = `<div class="rand__m"><span class="logo"></span><div><b>Backstage</b><small>txtme.social</small></div></div>` +
    NAV.map(([g, l]) => `<div class="grp">${h(g)}</div>` + l.map(([k, t, zk]) => {
      const n = zk === 'entwurf' ? (z.entwurf ? z.entwurf.n : 0) : zk === 'fragen' ? (z.fragen_offen || 0) : 0;
      return `<a href="#${k}" data-k="${k}">${h(t)}${n ? `<span class="z${zk === 'fragen' ? '' : ''}">${n}</span>` : ''}</a>`;
    }).join('')).join('') +
    `<div class="rand__f"><a href="/entwurf/" target="_blank" rel="noopener">Entwurf ansehen ${PF}</a><a href="/" target="_blank" rel="noopener">Website ansehen ${PF}</a><a href="pruefung.html" target="_blank" rel="noopener">Prüfung ${PF}</a><span>Stand ${h((z.stand || {}).stand ? datum(z.stand.stand) : 'noch nichts veröffentlicht')}</span></div>`;
  markiere();
}
function markiere() { const k = (location.hash || '#uebersicht').slice(1).split('/')[0]; $$('#rand a[data-k]').forEach(a => a.classList.toggle('an', a.dataset.k === k)); }
function kopf(titel, text, rechts = '') {
  return `<div class="kopf"><div><h1>${titel}</h1><p>${h(text)}</p></div><div class="kopf__r">${rechts}</div></div>`;
}

/* ---------- Ansichten ---------- */
const SICHTEN = { uebersicht, aenderungen: aenderungenS, produkte: produkteS, versand: versandS, seiten: seitenS, bilder: bilderS, fragen: fragenS, presse: presseS, google: googleS, angaben: angabenS, recht: rechtS, zahlen: zahlenS, chat: chatS, eingang: eingangS, verlauf: verlaufS, zugang: zugangS };
let hier = '';
async function zeige(frisch) {
  const hash = location.hash || '#uebersicht';
  const [k, ...rest] = hash.slice(1).split('/');
  hier = hash; markiere();
  sicht.innerHTML = '<div class="in"><p class="hinweis">Lädt …</p></div>';
  try {
    if (frisch || !Z) Z = await api('ueberblick');
    if (k === 'produkte' && rest.length) await produktS(decodeURIComponent(rest.join('/')));
    else if (k === 'seiten' && rest.length) await seiteS(decodeURIComponent(rest.join('/')));
    else if (SICHTEN[k]) await SICHTEN[k](rest);
    else location.hash = '#uebersicht';
    rand(); leiste();
  } catch (e) {
    sicht.innerHTML = `<div class="in"><div class="leer">${h(e.message)} <a href="pruefung.html#${h(e.lex || '')}">Was tun?</a></div></div>`;
    sag(e.message, true, e.lex);
  }
  window.scrollTo(0, 0);
}
addEventListener('hashchange', () => zeige());

/* ---------- Leiste unten: Entwurf, Bau, Veröffentlichen ---------- */
let bauT = 0;
function leiste() {
  const l = $('#leiste'); if (!Z) return;
  const b = Z.bau || {}; const n = Z.entwurf ? Z.entwurf.n : 0;
  l.innerHTML = `<div class="st"><i class="punkt ${b.laeuft ? 'laeuft' : b.fehler ? 'rot' : n ? 'gelb' : ''}"></i>` +
    (b.laeuft ? `<span>Entwurf wird gebaut …</span>` : b.fehler ? `<span><b>Bau fehlgeschlagen.</b> ${h(b.fehler.slice(0, 90))}</span>` : n ? `<span><b>${mal(n, 'Änderung', 'Änderungen')}</b> im Entwurf, noch nicht veröffentlicht</span>` : '<span>Entwurf und Website sind gleich</span>') + '</div>' +
    `<div class="r"><a class="kn kn--klein kn--linie hell" href="#aenderungen">Liste</a><a class="kn kn--klein kn--linie hell" href="/entwurf/" target="_blank" rel="noopener">Entwurf ansehen ${PF}</a><button class="kn kn--klein ${n ? 'kn--brand' : ''}" type="button" data-pub ${n ? '' : 'disabled'}>Veröffentlichen</button></div>`;
  $('[data-pub]', l).onclick = veroeffentlichen;
  clearTimeout(bauT);
  if (b.laeuft) bauT = setTimeout(async () => { try { Z.bau = await api('bau'); if (!Z.bau.laeuft) { Z = await api('ueberblick'); } leiste(); } catch (e) {} }, 2000);
}
async function bauWarten() {
  for (let i = 0; i < 60; i++) {
    const b = await api('bau'); Z.bau = b; leiste();
    if (!b.laeuft) return b;
    await new Promise(r => setTimeout(r, 1500));
  }
  return Z.bau;
}
function veroeffentlichen() {
  const n = Z.entwurf.n;
  const k = fenster(`<h2>Veröffentlichen</h2><p class="hin">${mal(n, 'Änderung geht', 'Änderungen gehen')} auf die Seite. Vorher kannst du jede Stelle nebeneinander ansehen.</p>
    <div class="texte">${Z.entwurf.aenderungen.map(a => `<div class="textz"><span class="tag">${h(a.teil)}</span><div><div class="tx"><b>${h(a.titel)}</b></div><span class="wo">${h(a.text)}</span></div></div>`).join('')}</div>
    <label class="feld" style="margin-top:16px"><span>Notiz zu dieser Veröffentlichung (für den Verlauf)</span><input name="notiz" placeholder="zum Beispiel: neue Frage zum Versand"></label>
    <div class="fenster__f"><span class="links">Jeder frühere Stand bleibt im Verlauf und lässt sich zurückholen.</span><button class="kn kn--linie" type="button" data-vgl>Vorher/Nachher</button><button class="kn kn--linie" type="button" data-nein>Abbrechen</button><button class="kn kn--brand" type="button" data-ja>Jetzt veröffentlichen</button></div>`);
  $('[data-nein]', k).onclick = fensterZu;
  $('[data-vgl]', k).onclick = () => vergleich('');
  $('[data-ja]', k).onclick = async () => {
    const notiz = $('[name=notiz]', k).value; const b = $('[data-ja]', k); b.disabled = true; b.textContent = 'Baut …';
    try { const r = await api('veroeffentlichen', { notiz }); fensterZu(); Z = await api('ueberblick'); sag(r.titel + ' ' + r.text); zeige(true); }
    catch (e) { b.disabled = false; b.textContent = 'Jetzt veröffentlichen'; sag(e.message, true, e.lex); }
  };
}

/* ---------- Vergleich: zwei Abbilder nebeneinander, Stellen markiert ---------- */
function vergleich(seiteK) {
  const v = $('#vergleich'); v.hidden = false;
  const seiten = (Z.seiten || []).map(s => s.k);
  if (!seiten.includes(seiteK)) seiteK = seiten[0] || '';
  v.innerHTML = `<div class="vgl__k"><b>Vorher / Nachher</b><select>${(Z.seiten || []).map(s => `<option value="${h(s.k)}"${s.k === seiteK ? ' selected' : ''}>${h(s.name)}</option>`).join('')}</select>
    <div class="r"><a class="kn kn--klein kn--linie hell" target="_blank" rel="noopener" data-offen>Entwurf bedienbar öffnen ${PF}</a><button class="kn kn--klein" type="button" data-zu>Schließen</button></div></div>
    <div class="vgl__b"><div><span class="e">Vorher · so ist die Seite jetzt</span><iframe title="Vorher"></iframe></div><div><span class="e">Nachher · der Entwurf</span><iframe title="Nachher"></iframe></div></div><div class="vgl__l">Lädt …</div>`;
  $('[data-zu]', v).onclick = vglZu;
  async function lade(k) {
    const [a, b] = $$('iframe', v);
    a.src = '/vorher/' + (k ? k + '/' : ''); b.src = '/entwurf/' + (k ? k + '/' : '') + '?marken=1';
    $('[data-offen]', v).href = '/entwurf/' + (k ? k + '/' : '');
    try {
      const d = await api('vergleich?seite=' + encodeURIComponent(k));
      const n = d.vorher.length + d.nachher.length + d.bilder_vorher.length + d.bilder_nachher.length;
      $('.vgl__l', v).innerHTML = n ? `<b>${mal(n, 'Stelle', 'Stellen')} auf dieser Seite anders.</b>` + d.nachher.slice(0, 6).map(t => `<span>${h(t.slice(0, 60))}</span>`).join('') + (d.bilder_nachher.length ? `<span>${mal(d.bilder_nachher.length, 'Bild', 'Bilder')} getauscht</span>` : '') : '<b>Auf dieser Seite ist nichts anders.</b> Andere Seite wählen.';
    } catch (e) { $('.vgl__l', v).textContent = e.message; }
  }
  $('select', v).onchange = e => lade(e.target.value);
  lade(seiteK);
}
function vglZu() { const v = $('#vergleich'); v.hidden = true; v.innerHTML = ''; }

/* ================= Übersicht ================= */
async function uebersicht() {
  const z = Z; const n = z.entwurf.n;
  const zahl = z.zahlen && z.zahlen.summe;
  sicht.innerHTML = `<div class="in">${kopf('Alles hinter dem <span class="soft">Shirt.</span>', 'Hier pflegst du den Shop und die Seiten von txtme.social selbst: Produkte, Texte, Bilder, Fragen, Presse, Versand, Angaben. Alles landet erst im Entwurf, dann auf der Seite.', `<a class="kn kn--linie" href="/entwurf/" target="_blank" rel="noopener">Entwurf ansehen ${PF}</a><a class="kn" href="/" target="_blank" rel="noopener">Website ansehen ${PF}</a>`)}
    <div class="karten">
      <a class="karte klick" href="#aenderungen"><span class="k-etik">Entwurf</span><span class="zahl">${n}<small>${n === 1 ? 'Änderung' : 'Änderungen'}</small></span><p>${n ? 'noch nicht veröffentlicht' : 'Entwurf und Website sind gleich'}</p><span class="pf">Liste und Veröffentlichen →</span></a>
      <a class="karte klick" href="#produkte"><span class="k-etik">Produkte</span><span class="zahl">${z.produkte}<small>im Shop</small></span><p>Name, Preis, Text, Größen, Farben, Bestand, Bilder, Sichtbarkeit.</p><span class="pf">Produkte →</span></a>
      <a class="karte klick" href="#seiten"><span class="k-etik">Seiten</span><span class="zahl">${(z.seiten || []).length}<small>Seiten</small></span><p>Jeder Satz auf jeder Seite, an einer Stelle oder überall.</p><span class="pf">Seiten & Texte →</span></a>
      <a class="karte klick" href="#zahlen"><span class="k-etik">Zahlen · 7 Tage</span><span class="zahl">${zahl ? zahl.aufruf : '–'}<small>Aufrufe</small></span><p>${zahl ? `${zahl.korb} in den Warenkorb · ${zahl.kasse} zur Kasse · ${zahl.chat} Chats` : 'Zahlen gerade nicht erreichbar.'}</p><span class="pf">Zahlen →</span></a>
      <a class="karte klick" href="#chat"><span class="k-etik">Im Chat</span><span class="zahl">${z.fragen_offen === null ? '–' : z.fragen_offen}<small>offen</small></span><p>Fragen, die der Chat nicht aus der Seite beantworten konnte. Mit einem Klick zur Frage & Antwort.</p><span class="pf">Fragen →</span></a>
      <a class="karte klick" href="#verlauf"><span class="k-etik">Verlauf</span><span class="zahl">${z.verlauf}<small>Stände</small></span><p>Jede Veröffentlichung bleibt und lässt sich zurückholen.</p><span class="pf">Verlauf →</span></a>
    </div>
    ${z.entwurf.letzte.length ? `<div class="blatt" style="margin-top:18px"><h2>Zuletzt geändert</h2>${z.entwurf.letzte.map(a => `<div class="zeile"><div class="t"><b>${h(a.was.join(' · '))}</b><small>${h(datum(a.zeit))}${a.notiz ? ' · ' + h(a.notiz) : ''}</small></div></div>`).join('')}</div>` : ''}
    <div class="blatt" style="margin-top:18px"><h2>So geht es</h2><p class="hin">Ändern, speichern, im Entwurf ansehen, Vorher/Nachher prüfen, veröffentlichen. Was du speicherst, siehst nur du im Entwurf. Erst «Veröffentlichen» ändert die Seite. Online geht der neue Stand beim nächsten Hochladen (das macht Robert, bis die Seite bei euch liegt).</p>
    <div class="chips"><a class="kn kn--klein kn--linie" href="/werkbank/anleitung/" target="_blank" rel="noopener">Anleitung ${PF}</a><a class="kn kn--klein kn--linie" href="pruefung.html" target="_blank" rel="noopener">Prüfung ${PF}</a></div></div></div>`;
}

/* ================= Änderungen ================= */
async function aenderungenS() {
  const z = Z; const l = z.entwurf.aenderungen;
  sicht.innerHTML = `<div class="in">${kopf('Was im Entwurf <span class="soft">anders ist.</span>', 'Jede Zeile ist eine Stelle, die sich vom veröffentlichten Stand unterscheidet. Ansehen, zurücknehmen oder alles zusammen veröffentlichen.', `<button class="kn kn--linie" type="button" data-verwerfen ${l.length ? '' : 'disabled'}>Alles verwerfen</button><button class="kn kn--brand" type="button" data-pub ${l.length ? '' : 'disabled'}>Veröffentlichen</button>`)}
    ${l.length ? `<div class="texte">${l.map((a, i) => `<div class="textz"><span class="tag">${h(a.teil)}</span><div><div class="tx"><b>${h(a.titel)}</b></div><span class="wo">${h(a.text)}</span></div><div class="chips"><button class="kn kn--klein kn--linie" type="button" data-vgl="${i}">Ansehen</button><button class="kn kn--klein kn--linie" type="button" data-weg="${i}">Rückgängig</button></div></div>`).join('')}</div>` : '<div class="leer">Nichts offen. Entwurf und Website sind gleich.</div>'}
    <p class="hinweis">Der Entwurf liegt unter <b>/entwurf/</b> und ist nur hier am Rechner zu sehen. Die Website ändert sich erst beim Veröffentlichen.</p></div>`;
  $('[data-pub]', sicht).onclick = veroeffentlichen;
  $('[data-verwerfen]', sicht).onclick = () => frage('Alles verwerfen?', `${mal(l.length, 'Änderung', 'Änderungen')} im Entwurf gehen verloren. Die Website bleibt, wie sie ist.`, 'Verwerfen', async () => { const r = await api('verwerfen', {}); sag(r.titel + ' ' + r.text); zeige(true); }, true);
  $$('[data-vgl]', sicht).forEach(b => b.onclick = () => { const a = l[+b.dataset.vgl]; vergleich(seiteFuer(a)); });
  $$('[data-weg]', sicht).forEach(b => b.onclick = () => { const a = l[+b.dataset.weg]; frage('Zurücknehmen?', a.titel + ': ' + a.text, 'Zurücknehmen', async () => { const r = await api('zuruecknehmen', { teil: a.teil, schluessel: a.schluessel }); sag(r.titel + ' ' + r.text); zeige(true); }); });
}
function seiteFuer(a) {
  if (a.teil === 'produkte' || a.teil === 'neu_produkte') return 'product/' + a.schluessel;
  if (a.teil === 'texte' && Array.isArray(a.schluessel) && a.schluessel[0] !== '*') return a.schluessel[0].replace(/^\/|\/$/g, '');
  if (a.teil === 'seo') return String(a.schluessel).replace(/^\/|\/$/g, '');
  if (a.teil === 'fragen') return 'support';
  if (a.teil === 'presse') return 'press';
  if (a.teil === 'versand' || a.teil === 'zahlarten') return 'shipping-payments';
  if (a.teil === 'angaben') return 'about';
  if (a.teil === 'recht') return 'terms';
  return '';
}

/* ================= Produkte ================= */
async function ladeKatalog() { K = await api('katalog'); return K; }
function produktListe() {
  const code = K.code.produkte, ent = (K.entwurf && K.entwurf.produkte) || null;
  const st = (D && D.entwurf && D.entwurf.produkte) || {};
  const neu = (D && D.entwurf && D.entwurf.neu_produkte) || [];
  const liste = code.map(p => ({ ...p, _code: p, _st: st[p.slug] || {}, _hidden: !!(st[p.slug] || {}).hidden, _neu: false }));
  neu.forEach(n => { if (!liste.some(p => p.slug === n.slug)) liste.push({ slug: n.slug, name: n.name, line: typeof n.line === 'object' ? (n.line.en || '') : (n.line || ''), price: n.price, priceTbd: !!n.priceTbd, category: n.category, type: n.type, sizes: n.sizes || [], colors: (n.colors || []).map(id => ({ id, name: id })), variants: [], image: n.bilder && n.bilder[(n.colors || [])[0]] && (n.bilder[(n.colors || [])[0]].front || n.bilder[(n.colors || [])[0]].cutout) || '', badge: n.badge || '', _st: n, _hidden: !!n.hidden, _neu: true }); });
  // wirksame Werte aus dem gebauten Entwurf
  if (ent) liste.forEach(p => { const e = ent.find(x => x.slug === p.slug); if (e) Object.assign(p, { name: e.name, line: e.line, price: e.price, priceTbd: e.priceTbd, sizes: e.sizes, colors: e.colors, variants: e.variants, image: e.image || p.image, badge: e.badge }); });
  return liste;
}
async function produkteS() {
  await ladeKatalog(); D = await api('daten');
  const liste = produktListe();
  const kat = K.code.kategorien;
  sicht.innerHTML = `<div class="in">${kopf('Die Stücke <span class="soft">im Shop.</span>', 'Tippe ein Produkt an, um Name, Preis, Text, Größen, Farben, Bestand und Bilder zu ändern. Neue Stücke legst du mit «Neu anlegen» an.', `<button class="kn kn--brand" type="button" data-neu>Neu anlegen</button>`)}
    <div data-q></div>
    ${kat.map(c => { const l = liste.filter(p => p.category === c.slug); return `<div class="blatt"><h2>${h(c.label)} <small style="color:var(--tinte-3);font-weight:400;font-size:13px">${l.length ? mal(l.length, 'Stück', 'Stücke') : 'noch leer'}${c.empty ? ' · Kategorie steht als «leer»' : ''}</small></h2>
      <div class="produkte">${l.map(p => `<button class="prod${p._hidden ? ' weg' : ''}" type="button" data-slug="${h(p.slug)}"><span class="b">${p.image ? `<img src="${h(p.image)}" alt="">` : '<span class="kein">kein Bild</span>'}</span><b>${h(p.name)}</b><span class="p">${p.priceTbd ? 'Preis folgt' : eur(p.price)}</span><small>${h((p.sizes || []).join(' · '))} · ${h((p.colors || []).map(c => c.name).join(', '))}</small><span class="marken">${p._hidden ? '<span class="marke rot">ausgeblendet</span>' : ''}${p._neu ? '<span class="marke neu">neu</span>' : (Object.keys(p._st).length ? '<span class="marke gelb">geändert</span>' : '')}${p.badge ? `<span class="marke">${h(p.badge)}</span>` : ''}</span></button>`).join('')}</div></div>`; }).join('')}
    <div class="blatt"><h2>Kategorien</h2><p class="hin">Eine Kategorie «leer» zu setzen zeigt sie auf der Seite als «bald». Die Beschriftung erscheint im Menü und in der Leiste.</p>
      <div class="felder">${kat.map(c => `<div class="feld"><span>${h(c.slug)}</span><input name="label-${h(c.slug)}" value="${h(((D.entwurf.kategorien || {})[c.slug] || {}).label || c.label)}"><small><label class="schalter" style="margin-top:8px"><input type="checkbox" name="leer-${h(c.slug)}"${((D.entwurf.kategorien || {})[c.slug] || {}).empty ?? c.empty ? ' checked' : ''}><i></i><span>Kategorie ist leer («bald»)</span></label></small></div>`).join('')}</div>
      <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div></div>`;
  $$('.prod', sicht).forEach(b => b.onclick = () => { location.hash = '#produkte/' + encodeURIComponent(b.dataset.slug); });
  $('[data-neu]', sicht).onclick = neuesProdukt;
  speichernKnopf($('.blatt:last-child', sicht), async () => {
    const daten = {};
    kat.forEach(c => { const label = $(`[name="label-${c.slug}"]`, sicht).value.trim(), leer = $(`[name="leer-${c.slug}"]`, sicht).checked; daten[c.slug] = (label !== c.label || leer !== c.empty) ? { label: label !== c.label ? label : undefined, empty: leer } : ''; });
    const q = await api('aendern', { teil: 'kategorien', daten }); quittung($('[data-q]', sicht), q, { seiteK: 'merch' }); Z = await api('ueberblick'); leiste(); return q;
  });
}
const GROESSEN = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size'];
const ARTEN = [['t-shirts', 'T-Shirt'], ['tank-tops', 'Tank Top'], ['tops', 'Cropped Top'], ['caps', 'Cap'], ['bags', 'Bag'], ['stickers', 'Sticker'], ['patches', 'Patch'], ['add-ons', 'Add-on']];
const SICHT_B = [['front', 'vorn'], ['back', 'hinten'], ['detail', 'Aufdruck'], ['worn', 'getragen'], ['cutout', 'freigestellt']];
const sw = v => (v && typeof v === 'object') ? v : { en: v || '', de: '' };
async function produktS(slug) {
  if (!K) await ladeKatalog(); if (!D) D = await api('daten');
  const liste = produktListe(); const p = liste.find(x => x.slug === slug);
  if (!p) { sicht.innerHTML = `<div class="in"><div class="leer">Dieses Produkt gibt es nicht. <a href="#produkte">Zurück</a></div></div>`; return; }
  const c = p._code || {}, st = p._st || {}, neu = p._neu;
  const farben = D.daten.farben || {};
  const farbIds = st.colors || (c.colors ? c.colors.map(x => x.id) : (p.colors || []).map(x => x.id));
  const groessen = st.sizes || c.sizes || p.sizes || [];
  const line = sw(st.line), desc = sw(st.description), mat = sw(st.material);
  const stock = st.stock || {};
  const bestandVon = (cid, s) => stock[cid] && stock[cid][s] !== undefined ? stock[cid][s] : ((c.variants || []).find(v => v.colorId === cid && v.size === s) || { inStock: true }).inStock;
  const bilder = st.bilder || {};
  const codeBild = (cid, view) => { const i = (c.images || []); return ''; };
  sicht.innerHTML = `<div class="in">${kopf(`${h(p.name)}`, `${neu ? 'Neu angelegt in Backstage.' : 'Aus dem Code des Shops.'} Leere Felder lassen den Wert aus dem Code stehen. Adresse: /product/${h(slug)}/`, `<a class="kn kn--linie" href="#produkte">Alle Produkte</a><a class="kn kn--linie" href="/entwurf/product/${h(slug)}/" target="_blank" rel="noopener">Im Entwurf ansehen ${PF}</a>`)}
    <div data-q></div>
    <div class="blatt"><h2>Name, Preis, Text</h2>
      <div class="felder">
        ${feld('name', 'Name', st.name ?? '', { code: c.name ?? p.name, platz: c.name ?? p.name })}
        ${feld('price', 'Preis in Euro', preisfeld(st.price), { code: c.price !== undefined ? preisfeld(c.price) : preisfeld(p.price), platz: c.price !== undefined ? preisfeld(c.price) : '', klein: 'Mit Komma, zum Beispiel 39,50. Preise auf der Seite enthalten Mehrwertsteuer und Versand.' })}
        ${feld('compareAt', 'Streichpreis', preisfeld(st.compareAt), { code: c.compareAt !== undefined ? preisfeld(c.compareAt) : '', klein: 'Leer = kein Streichpreis' })}
        <div class="feld"><span>Preis noch offen</span><label class="schalter"><input type="checkbox" name="priceTbd"${(st.priceTbd ?? c.priceTbd) ? ' checked' : ''}><i></i><span>Preis folgt, nicht kaufbar</span></label></div>
        ${feld('badge', 'Etikett', st.badge ?? c.badge ?? '', { art: 'wahl', optionen: [['', 'keins'], ['new', 'new'], ['last pieces', 'last pieces']] })}
        <div class="feld"><span>Sichtbar</span><label class="schalter"><input type="checkbox" name="sichtbar"${st.hidden ? '' : ' checked'}><i></i><span>Auf der Seite zeigen</span></label></div>
        ${feld('line_en', 'Satz auf der Karte (Englisch)', line.en, { breit: true, code: c.line, platz: c.line })}
        ${feld('line_de', 'Satz auf der Karte (Deutsch, für die deutsche Fassung)', line.de, { breit: true })}
        ${feld('description_en', 'Beschreibung (Englisch)', desc.en, { art: 'lang', breit: true, code: c.description, platz: c.description })}
        ${feld('description_de', 'Beschreibung (Deutsch)', desc.de, { art: 'lang', breit: true })}
        ${feld('material_en', 'Material (Englisch)', mat.en, { code: c.material ?? '', klein: 'Leer = «noch nicht angegeben»' })}
        ${feld('material_de', 'Material (Deutsch)', mat.de, {})}
        ${feld('releasedAt', 'Erscheint am', st.releasedAt ?? c.releasedAt ?? '', { typ: 'date', klein: 'Reihenfolge bei «Neuheiten»' })}
      </div></div>
    <div class="blatt"><h2>Größen und Farben</h2><p class="hin">Angetippt = das Produkt gibt es in dieser Größe oder Farbe. Der Bestand darunter sagt je Farbe und Größe, ob es gerade lieferbar ist.</p>
      <div class="felder"><div class="feld"><span>Größen</span><div class="chips" data-chips="sizes">${[...new Set([...GROESSEN, ...groessen])].map(s => `<button type="button" data-v="${h(s)}" aria-pressed="${groessen.includes(s)}">${h(s)}</button>`).join('')}</div></div>
      <div class="feld"><span>Farben</span><div class="chips" data-chips="colors">${Object.values(farben).map(f => `<button type="button" data-v="${h(f.id)}" aria-pressed="${farbIds.includes(f.id)}"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${h(f.hex)};margin-right:7px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)"></i>${h(f.name)}</button>`).join('')}</div></div></div>
      <div class="feld" style="margin-top:18px"><span>Bestand (lieferbar)</span><div class="bestand" data-bestand></div></div></div>
    <div class="blatt"><h2>Bilder</h2><p class="hin">Je Farbe: vorn, hinten, Aufdruck, getragen, und ein freigestelltes Bild für die Kategorieseite. Eigene Bilder ersetzen die aus dem Code. JPG, PNG oder WebP, wird automatisch verkleinert.</p><div data-bilder></div></div>
    <div class="fenster__f" style="margin-top:-6px"><span class="links">Speichern legt die Änderung in den Entwurf. Auf die Seite kommt sie beim Veröffentlichen.</span>${neu ? '<button class="kn kn--linie" type="button" data-loeschen>Produkt löschen</button>' : ''}<button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  const stand = { sizes: [...groessen], colors: [...farbIds], stock: JSON.parse(JSON.stringify(stock)), bilder: JSON.parse(JSON.stringify(bilder)) };
  function bestand() {
    const b = $('[data-bestand]', sicht);
    b.innerHTML = stand.colors.map(cid => { const f = farben[cid] || { name: cid, hex: '#888' }; return `<div class="reihe"><span><i style="background:${h(f.hex)}"></i>${h(f.name)}</span><div class="chips">${stand.sizes.map(s => { const da = stand.stock[cid] && stand.stock[cid][s] !== undefined ? stand.stock[cid][s] : bestandVon(cid, s); return `<button type="button" data-c="${h(cid)}" data-s="${h(s)}" aria-pressed="${da}">${h(s)}</button>`; }).join('')}</div></div>`; }).join('') || '<small>Erst Farben und Größen wählen.</small>';
    $$('button[data-c]', b).forEach(x => x.onclick = () => { const v = x.getAttribute('aria-pressed') !== 'true'; x.setAttribute('aria-pressed', v); (stand.stock[x.dataset.c] = stand.stock[x.dataset.c] || {})[x.dataset.s] = v; sicht.dispatchEvent(new Event('input')); });
  }
  function bilderZeigen() {
    const w = $('[data-bilder]', sicht);
    w.innerHTML = stand.colors.map(cid => { const f = farben[cid] || { name: cid }; const eigene = stand.bilder[cid] || {}; return `<div class="feld" style="margin-bottom:14px"><span>${h(f.name)}</span><div class="bilder-raster">${SICHT_B.map(([v, t]) => { const src = eigene[v] || ((c.images || []).find(i => i.colorId === cid && (v === 'cutout' ? i.cutout : (i.view === v && !i.cutout))) || {}).src || ''; return `<div class="bildf"><div class="f">${src ? `<img src="${h(src)}" alt="">` : '<span>–</span>'}</div><b>${h(t)}</b>${eigene[v] ? 'eigenes Bild' : (src ? 'aus dem Code' : 'kein Bild')}<br><button type="button" data-up="${h(cid)}|${v}">${eigene[v] ? 'Tauschen' : 'Hochladen'}</button>${eigene[v] ? ` · <button type="button" data-weg="${h(cid)}|${v}">Zurück</button>` : ''}</div>`; }).join('')}</div></div>`; }).join('') || '<small>Erst Farben wählen.</small>';
    $$('[data-up]', w).forEach(b => b.onclick = () => waehleDatei(async f => { try { b.textContent = 'Lädt …'; const r = await hochladen(f); const [cid, v] = b.dataset.up.split('|'); (stand.bilder[cid] = stand.bilder[cid] || {})[v] = r.pfad; bilderZeigen(); sicht.dispatchEvent(new Event('input')); sag('Bild hochgeladen: ' + r.breite + ' × ' + r.hoehe + ' Pixel.'); } catch (e) { sag(e.message, true, e.lex); bilderZeigen(); } }));
    $$('[data-weg]', w).forEach(b => b.onclick = () => { const [cid, v] = b.dataset.weg.split('|'); delete stand.bilder[cid][v]; if (!Object.keys(stand.bilder[cid]).length) delete stand.bilder[cid]; bilderZeigen(); sicht.dispatchEvent(new Event('input')); });
  }
  $$('[data-chips] button', sicht).forEach(b => b.onclick = () => { const art = b.parentNode.dataset.chips, v = b.dataset.v, an = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', an); stand[art] = an ? [...stand[art], v] : stand[art].filter(x => x !== v); if (art === 'sizes') stand.sizes.sort((a, b2) => GROESSEN.indexOf(a) - GROESSEN.indexOf(b2)); bestand(); bilderZeigen(); sicht.dispatchEvent(new Event('input')); });
  bestand(); bilderZeigen();
  const loesch = $('[data-loeschen]', sicht); if (loesch) loesch.onclick = () => frage('Produkt löschen?', `${p.name} wird aus dem Entwurf entfernt.`, 'Löschen', async () => { await api('aendern', { teil: 'neu_produkte', daten: { loeschen: slug } }); sag('Gelöscht.'); location.hash = '#produkte'; }, true);
  speichernKnopf(sicht, async () => {
    const w = werte(sicht);
    const sprach = (en, de) => (en || de) ? { en, de } : '';
    const patch = { name: w.name.trim(), price: w.price.trim(), compareAt: w.compareAt.trim() || null, priceTbd: w.priceTbd, badge: w.badge, hidden: !w.sichtbar, line: sprach(w.line_en.trim(), w.line_de.trim()), description: sprach(w.description_en.trim(), w.description_de.trim()), material: sprach(w.material_en.trim(), w.material_de.trim()), releasedAt: w.releasedAt, sizes: stand.sizes, colors: stand.colors, stock: stand.stock, bilder: stand.bilder };
    // Felder, die dem Code gleichen, nicht als Änderung speichern
    if (!neu) {
      if (patch.priceTbd === !!c.priceTbd) patch.priceTbd = '';
      if (patch.badge === (c.badge || '')) patch.badge = '';
      if (JSON.stringify(patch.sizes) === JSON.stringify(c.sizes)) delete patch.sizes;
      if (JSON.stringify(patch.colors) === JSON.stringify((c.colors || []).map(x => x.id))) delete patch.colors;
      if (patch.releasedAt === (c.releasedAt || '')) patch.releasedAt = '';
      if (!patch.hidden) patch.hidden = '';
      const q = await api('aendern', { teil: 'produkte', daten: { [slug]: patch } });
      quittung($('[data-q]', sicht), q, { seiteK: 'product/' + slug, seite: '/entwurf/product/' + slug + '/', zurueck: { teil: 'produkte', schluessel: slug } });
      Z = await api('ueberblick'); leiste(); return q;
    }
    const q = await api('aendern', { teil: 'neu_produkte', daten: { ...st, ...patch, slug, name: patch.name || st.name, price: patch.price || st.price, priceTbd: w.priceTbd, hidden: !w.sichtbar, badge: w.badge } });
    quittung($('[data-q]', sicht), q, { seiteK: 'product/' + slug, seite: '/entwurf/product/' + slug + '/', zurueck: { teil: 'neu_produkte', schluessel: slug } });
    Z = await api('ueberblick'); leiste(); return q;
  });
}
function neuesProdukt() {
  const farben = (D && D.daten.farben) || {};
  const kat = K.code.kategorien;
  let schritt = 0; const st = { category: 'merch', type: 't-shirts', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['black'], bilder: {}, price: '', priceTbd: false, name: '', line_en: '', slug: '' };
  const slugVon = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function mal() {
    const k = fenster(`<h2>Neues Produkt</h2><p class="hin">Drei Schritte: was es ist, was es kostet, wie es aussieht. Rechts siehst du die Karte, wie sie im Shop stehen würde.</p>
      <div class="schritte">${['Was', 'Preis & Größen', 'Bild & Vorschau'].map((t, i) => `<span class="${i === schritt ? 'an' : i < schritt ? 'fertig' : ''}">${i + 1} ${t}</span>`).join('')}</div>
      <div class="vorschau"><div data-form></div><div class="pv"><div class="b">${st.bild ? `<img src="${h(st.bild)}" alt="">` : '<span class="kein" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--tinte-3)">Bild folgt</span>'}</div><h4>${h(st.name || 'Name')}</h4><small>${h(st.line_en || 'Ein Satz zum Stück')}</small><span class="preis">${st.priceTbd ? 'Price to follow' : (st.price ? eur(st.price.replace(',', '.')) : '€ –')}</span><small>${h(st.sizes.join(' · '))}</small></div></div>
      <div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>Abbrechen</button>${schritt ? '<button class="kn kn--linie" type="button" data-zurueck>Zurück</button>' : ''}<button class="kn kn--brand" type="button" data-weiter>${schritt < 2 ? 'Weiter' : 'Anlegen'}</button></div>`, true);
    const f = $('[data-form]', k);
    if (schritt === 0) f.innerHTML = `<div class="felder eins">${feld('name', 'Name', st.name, { platz: 'Hoodie Festival Print' })}${feld('slug', 'Adresse', st.slug, { klein: 'Kleinbuchstaben und Bindestriche. Daraus wird /product/…/' })}${feld('category', 'Kategorie', st.category, { art: 'wahl', optionen: kat.map(c => [c.slug, c.label]) })}${feld('type', 'Produktart', st.type, { art: 'wahl', optionen: ARTEN })}${feld('line_en', 'Satz auf der Karte (Englisch)', st.line_en, {})}</div>`;
    if (schritt === 1) f.innerHTML = `<div class="felder eins">${feld('price', 'Preis in Euro', st.price, { platz: '69', klein: 'Mit Komma, zum Beispiel 39,50' })}<div class="feld"><span>Preis noch offen</span><label class="schalter"><input type="checkbox" name="priceTbd"${st.priceTbd ? ' checked' : ''}><i></i><span>Preis folgt, nicht kaufbar</span></label></div><div class="feld"><span>Größen</span><div class="chips" data-chips="sizes">${GROESSEN.map(s => `<button type="button" data-v="${h(s)}" aria-pressed="${st.sizes.includes(s)}">${h(s)}</button>`).join('')}</div></div><div class="feld"><span>Farben</span><div class="chips" data-chips="colors">${Object.values(farben).map(x => `<button type="button" data-v="${h(x.id)}" aria-pressed="${st.colors.includes(x.id)}">${h(x.name)}</button>`).join('')}</div></div></div>`;
    if (schritt === 2) f.innerHTML = `<div class="felder eins"><div class="feld"><span>Bild vorn (${h((farben[st.colors[0]] || { name: st.colors[0] }).name)})</span><button class="kn kn--linie" type="button" data-up>${st.bild ? 'Anderes Bild' : 'Bild hochladen'}</button><small>Weitere Ansichten und Farben lädst du danach auf der Produktseite hoch.</small></div>${feld('description_en', 'Beschreibung (Englisch)', st.description_en || '', { art: 'lang' })}</div>`;
    $$('[name]', f).forEach(e => e.oninput = e.onchange = () => { st[e.name] = e.type === 'checkbox' ? e.checked : e.value; if (e.name === 'name' && !st.slugHand) { st.slug = slugVon(st.name); const s = $('[name=slug]', f); if (s) s.value = st.slug; } if (e.name === 'slug') st.slugHand = true; live(); });
    $$('[data-chips] button', f).forEach(b => b.onclick = () => { const art = b.parentNode.dataset.chips, v = b.dataset.v, an = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', an); st[art] = an ? [...st[art], v] : st[art].filter(x => x !== v); if (art === 'sizes') st.sizes.sort((a, b2) => GROESSEN.indexOf(a) - GROESSEN.indexOf(b2)); live(); });
    const up = $('[data-up]', f); if (up) up.onclick = () => waehleDatei(async d => { try { up.textContent = 'Lädt …'; const r = await hochladen(d); st.bild = r.pfad; (st.bilder[st.colors[0]] = st.bilder[st.colors[0]] || {}).front = r.pfad; mal(); } catch (e) { sag(e.message, true, e.lex); mal(); } });
    function live() { const pv = $('.pv', k); $('h4', pv).textContent = st.name || 'Name'; $$('small', pv)[0].textContent = st.line_en || 'Ein Satz zum Stück'; $('.preis', pv).textContent = st.priceTbd ? 'Price to follow' : (st.price ? eur(st.price.replace(',', '.')) : '€ –'); $$('small', pv)[1].textContent = st.sizes.join(' · '); }
    $('[data-nein]', k).onclick = fensterZu;
    const z = $('[data-zurueck]', k); if (z) z.onclick = () => { schritt--; mal(); };
    $('[data-weiter]', k).onclick = async () => {
      if (schritt === 0) { if (!st.name.trim()) return sag('Das Produkt braucht einen Namen.', true, 'pflichtfeld'); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(st.slug)) return sag('Die Adresse braucht Kleinbuchstaben, Zahlen und Bindestriche.', true, 'pflichtfeld'); }
      if (schritt === 1) { if (!st.priceTbd && !st.price.trim()) return sag('Bitte einen Preis eintragen oder «Preis folgt» wählen.', true, 'pflichtfeld'); if (!st.sizes.length) return sag('Mindestens eine Größe.', true, 'pflichtfeld'); if (!st.colors.length) return sag('Mindestens eine Farbe.', true, 'pflichtfeld'); }
      if (schritt < 2) { schritt++; mal(); return; }
      try {
        const q = await api('aendern', { teil: 'neu_produkte', daten: { slug: st.slug, name: st.name.trim(), category: st.category, type: st.type, price: st.priceTbd ? 0 : st.price, priceTbd: st.priceTbd, line: { en: st.line_en.trim(), de: '' }, description: { en: (st.description_en || '').trim(), de: '' }, sizes: st.sizes, colors: st.colors, bilder: st.bilder, releasedAt: new Date().toISOString().slice(0, 10) } });
        fensterZu(); sag(q.titel + ' ' + q.text); Z = await api('ueberblick'); location.hash = '#produkte/' + encodeURIComponent(st.slug);
      } catch (e) { sag(e.message, true, e.lex); }
    };
  }
  mal();
}

/* ================= Versand & Zahlung ================= */
async function versandS() {
  D = await api('daten');
  const w = D.daten.wirksam || {}, c = D.daten.code || {}; const v = w.versand || {}, cv = c.versand || {};
  const za = w.zahlarten || [], cz = c.zahlarten || []; const stz = D.entwurf.zahlarten || null;
  const regionen = (D.entwurf.versand && D.entwurf.versand.regions) || v.regions || [];
  sicht.innerHTML = `<div class="in">${kopf('Versand <span class="soft">und Zahlung.</span>', 'Was auf der Seite «Shipping & Payments» und in der Kasse steht. Länder und Laufzeiten trägst du ein, sobald sie feststehen; bis dahin bleibt die Seite beim Wortlaut «noch festzulegen».')}
    <div data-q></div>
    <div class="blatt"><h2>Versand</h2><div class="felder">
      ${feld('cost', 'Versandkosten in Euro', preisfeld(v.cost), { code: preisfeld(cv.cost), klein: '0 = im Preis enthalten' })}
      ${feld('freeFrom', 'Versandkostenfrei ab', preisfeld(v.freeFrom), { code: preisfeld(cv.freeFrom), klein: '0 = immer frei' })}
      ${feld('handlingDays', 'Bearbeitung', v.handlingDays || '', { code: cv.handlingDays || '', platz: '1–2 working days' })}
      ${feld('returnDays', 'Rückgabefrist in Tagen', v.returnDays ?? '', { code: cv.returnDays ?? '' })}
      <div class="feld"><span>Versichert</span><label class="schalter"><input type="checkbox" name="insured"${v.insured ? ' checked' : ''}><i></i><span>Jedes Paket versichert</span></label></div>
    </div>
    <h3 class="k-etik" style="margin:22px 0 8px">Länder und Laufzeiten</h3><table class="tabelle" data-regionen><thead><tr><th>Land oder Region</th><th>Laufzeit</th><th class="r">Kosten €</th><th></th></tr></thead><tbody></tbody></table>
    <div class="chips" style="margin-top:10px"><button class="kn kn--klein kn--linie" type="button" data-region-neu>Zeile dazu</button></div>
    <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>
    <div class="blatt" data-zahl><h2>Zahlarten</h2><p class="hin">Alle über Mollie. Ausgeschaltete Zahlarten verschwinden von der Seite. Hinweis und Länder stehen so auf der Seite.</p>
      <table class="tabelle"><thead><tr><th>An</th><th>Name</th><th>Hinweis (Englisch)</th><th>Länder</th></tr></thead><tbody>${cz.map(z => { const s = (stz || []).find(x => x.id === z.id) || {}; const an = s.aktiv !== false; return `<tr data-id="${h(z.id)}"><td><label class="schalter"><input type="checkbox" name="an"${an ? ' checked' : ''}><i></i></label></td><td><input name="label" value="${h(s.label || z.label)}" style="width:140px"></td><td><input name="note" value="${h((typeof s.note === 'object' ? s.note.en : s.note) || z.note)}" style="width:100%"></td><td><input name="avail" value="${h(s.avail ?? z.avail)}" style="width:100%"></td></tr>`; }).join('')}</tbody></table>
      <div class="fenster__f"><button class="kn kn--linie" type="button" data-zurueck-code>Zurück auf den Code</button><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div></div>`;
  const tb = $('[data-regionen] tbody', sicht);
  function regionenZeigen() { tb.innerHTML = regionen.map((r, i) => `<tr><td><input name="rn" value="${h(r.name || '')}" placeholder="Germany"></td><td><input name="rt" value="${h(r.time || '')}" placeholder="2–4 days"></td><td class="r"><input name="rc" value="${h(preisfeld(r.cost))}" style="width:80px;text-align:right"></td><td class="r"><button type="button" data-weg="${i}" class="kn kn--klein kn--linie">Weg</button></td></tr>`).join('') || '<tr><td colspan="4"><small>Noch keine Länder eingetragen. Die Seite sagt dann «Länderliste und Laufzeiten folgen».</small></td></tr>'; $$('[data-weg]', tb).forEach(b => b.onclick = () => { regionen.splice(+b.dataset.weg, 1); regionenZeigen(); sicht.dispatchEvent(new Event('input')); }); }
  regionenZeigen();
  $('[data-region-neu]', sicht).onclick = () => { lies(); regionen.push({ name: '', time: '', cost: 0 }); regionenZeigen(); sicht.dispatchEvent(new Event('input')); };
  function lies() { $$('tr', tb).forEach((tr, i) => { if (!regionen[i] || !$('[name=rn]', tr)) return; regionen[i] = { name: $('[name=rn]', tr).value.trim(), time: $('[name=rt]', tr).value.trim(), cost: Number(($('[name=rc]', tr).value || '0').replace(',', '.')) || 0 }; }); }
  const b1 = $$('.blatt', sicht)[0];
  speichernKnopf(b1, async () => {
    lies(); const w2 = werte(b1);
    const daten = { cost: w2.cost, freeFrom: w2.freeFrom, handlingDays: w2.handlingDays.trim(), returnDays: w2.returnDays, insured: w2.insured, regions: regionen.filter(r => r.name) };
    // gleich wie Code → nicht speichern
    if (String(daten.cost) === preisfeld(cv.cost)) daten.cost = ''; if (String(daten.freeFrom) === preisfeld(cv.freeFrom)) daten.freeFrom = ''; if (daten.handlingDays === (cv.handlingDays || '')) daten.handlingDays = ''; if (String(daten.returnDays) === String(cv.returnDays ?? '')) daten.returnDays = ''; if (daten.insured === !!cv.insured) daten.insured = ''; if (!daten.regions.length && !(cv.regions || []).length) daten.regions = '';
    const q = await api('aendern', { teil: 'versand', daten }); quittung($('[data-q]', sicht), q, { seiteK: 'shipping-payments', seite: '/entwurf/shipping-payments/' }); Z = await api('ueberblick'); leiste(); return q;
  });
  const b2 = $('[data-zahl]', sicht);
  speichernKnopf(b2, async () => {
    const liste = $$('tbody tr', b2).map(tr => ({ id: tr.dataset.id, aktiv: $('[name=an]', tr).checked, label: $('[name=label]', tr).value.trim(), note: { en: $('[name=note]', tr).value.trim() }, avail: $('[name=avail]', tr).value.trim() }));
    const gleich = liste.every(l => { const z = cz.find(x => x.id === l.id); return l.aktiv && l.label === z.label && l.note.en === z.note && l.avail === z.avail; });
    const q = await api('aendern', { teil: 'zahlarten', daten: gleich ? null : liste }); quittung($('[data-q]', sicht), q, { seiteK: 'shipping-payments', seite: '/entwurf/shipping-payments/' }); Z = await api('ueberblick'); leiste(); return q;
  });
  $('[data-zurueck-code]', b2).onclick = async () => { try { const q = await api('aendern', { teil: 'zahlarten', daten: null }); sag(q.titel); zeige(true); } catch (e) { sag(e.message, true, e.lex); } };
}

/* ================= Seiten & Texte ================= */
function tagWort(tag) { return /^h[1-6]$/.test(tag) ? 'Überschrift' : ({ p: 'Absatz', a: 'Link', li: 'Listenpunkt', button: 'Knopf', label: 'Beschriftung', blockquote: 'Zitat', figcaption: 'Bildzeile', dt: 'Begriff', dd: 'Erklärung', th: 'Spaltenkopf', td: 'Zelle' })[tag] || 'Text'; }
async function ladeInventar() { INV = await api('inventar'); return INV; }
async function seitenS() {
  await ladeInventar(); if (!D) D = await api('daten');
  const texte = D.entwurf.texte || [];
  sicht.innerHTML = `<div class="in">${kopf('Jede Seite, <span class="soft">jeder Satz.</span>', sp('Klicke eine Seite an. Sie öffnet sich so, wie sie auf der Website aussieht. Fahre über einen Text und klicke ihn an, um ihn zu ändern. Preise, Produktnamen, Fragen und Angaben haben eigene Bereiche.', 'Click a page. It opens the way it looks on the website. Point at a text and click it to change it. Prices, product names, questions and details have their own sections.'), `<a class="kn kn--linie" href="#google">Google & Teilen</a>`)}
    <div class="seiten-liste seiten-bilder">${INV.seiten.map(s => { const n = texte.filter(t => t.seite === s.pfad || (t.seite === '*' && s.texte.some(x => x.text === t.alt))).length; return `<button class="seitek" type="button" data-k="${h(s.k)}"><span class="seitek__bild"><iframe src="/entwurf${h(s.pfad)}?nomotion=1" loading="lazy" tabindex="-1" aria-hidden="true" title=""></iframe></span><b>${h(s.name)}</b><small>${sp(`${mal(s.texte.length, 'Text', 'Texte')} · ${mal(s.bilder.length, 'Bild', 'Bilder')}`, `${s.texte.length} text${s.texte.length === 1 ? '' : 's'} · ${s.bilder.length} image${s.bilder.length === 1 ? '' : 's'}`)}</small>${n ? `<span class="marke gelb">${mal(n, 'Änderung', 'Änderungen')}</span>` : ''}</button>`; }).join('')}</div>
    <p class="hinweis">${INV.wurzel === 'entwurf' ? 'Die Texte kommen aus dem gebauten Entwurf.' : 'Der Entwurf ist noch nicht gebaut, die Texte kommen aus der veröffentlichten Seite.'}</p></div>`;
  $$('.seitek', sicht).forEach(b => b.onclick = () => { location.hash = '#seiten/' + encodeURIComponent(b.dataset.k); });
  /* Bildkachel: die Seite in 1440 gesetzt und auf die Kachel verkleinert */
  const kacheln = () => $$('.seitek__bild', sicht).forEach(r => { const f = $('iframe', r); if (f) f.style.transform = `scale(${r.clientWidth / 1440})`; });
  kacheln(); new ResizeObserver(kacheln).observe($('.seiten-bilder', sicht));
}
/* Sprache der Oberfläche für neue Sätze (bureau.js setzt <html lang="en">) */
const sp = (de, en) => (document.documentElement.lang || '').startsWith('en') ? en : de;
const TAG_EN = { 'Überschrift': 'Heading', 'Absatz': 'Paragraph', 'Link': 'Link', 'Listenpunkt': 'List item', 'Knopf': 'Button', 'Beschriftung': 'Label', 'Zitat': 'Quote', 'Bildzeile': 'Caption', 'Begriff': 'Term', 'Erklärung': 'Description', 'Spaltenkopf': 'Column head', 'Zelle': 'Cell', 'Text': 'Text' };
const tagName = tag => sp(tagWort(tag), TAG_EN[tagWort(tag)] || 'Text');
/* Wo ein Text steht, in Alltagssprache: «Menü, auf allen Seiten» oder der Name der Seite */
function ortKurz(t, s) {
  const n = t.seiten.length, alle = n >= INV.seiten.length;
  const ber = t.region === 'header' ? sp('Menü', 'Menu') : t.region === 'footer' ? sp('Fuß', 'Footer') : '';
  if (ber) return `${ber}, ${alle ? sp('auf allen Seiten', 'on every page') : n > 1 ? sp(`auf ${n} Seiten`, `on ${n} pages`) : sp(`nur auf ${s.name}`, `only on ${s.name}`)}`;
  if (n <= 1) return s.name;
  return alle ? sp('Auf allen Seiten', 'On every page') : sp(`${s.name} und ${n - 1} ${n - 1 === 1 ? 'weitere Seite' : 'weitere Seiten'}`, `${s.name} and ${n - 1} other page${n - 1 === 1 ? '' : 's'}`);
}
function ortSatz(t, s) {
  const n = t.seiten.length, alle = n >= INV.seiten.length, w = tagName(t.tag);
  const ber = t.region === 'header' ? sp('im Menü', 'in the menu') : t.region === 'footer' ? sp('im Fuß', 'in the footer') : '';
  if (ber) return n > 1 ? sp(`${w}, steht ${ber} ${alle ? 'auf allen Seiten' : `auf ${n} Seiten`}.`, `${w}, ${ber} ${alle ? 'on every page' : `on ${n} pages`}.`) : sp(`${w} ${ber} auf ${s.name}.`, `${w} ${ber} on ${s.name}.`);
  if (n <= 1) return sp(`${w} auf ${s.name}.`, `${w} on ${s.name}.`);
  return alle ? sp(`${w} auf ${s.name}, steht auf allen Seiten.`, `${w} on ${s.name}, on every page.`) : sp(`${w} auf ${s.name}, steht auch auf ${n - 1} ${n - 1 === 1 ? 'weiteren Seite' : 'weiteren Seiten'}.`, `${w} on ${s.name}, also on ${n - 1} other page${n - 1 === 1 ? '' : 's'}.`);
}
let SEITE_ART = 'seite', SEITE_GERAET = innerWidth < 700 ? 'handy' : 'rechner', SEITE_KLICK = null;
window.addEventListener('message', ev => { if (ev.origin !== location.origin) return; const d = ev.data || {}; if (d.bureau === 'seitentext' && SEITE_KLICK) SEITE_KLICK(d); });
const QUELLE_NAME = { produkte: 'Produkte', kategorien: 'Produkte', farben: 'Produkte', fragen: 'Fragen & Antworten', presse: 'Presse', angaben: 'Angaben', versand: 'Versand & Zahlung', zahlarten: 'Versand & Zahlung', recht: 'Rechtliches' };
const QUELLE_HASH = { produkte: '#produkte', kategorien: '#produkte', farben: '#produkte', fragen: '#fragen', presse: '#presse', angaben: '#angaben', versand: '#versand', zahlarten: '#versand', recht: '#recht' };
async function seiteS(k) {
  if (!INV) await ladeInventar(); if (!D) D = await api('daten');
  const s = INV.seiten.find(x => x.k === k);
  if (!s) { sicht.innerHTML = `<div class="in"><div class="leer">Diese Seite gibt es nicht. <a href="#seiten">Zurück</a></div></div>`; return; }
  const texte = D.entwurf.texte || [];
  const seo = (D.entwurf.seo || {})[s.pfad] || {};
  try { sessionStorage.removeItem('bs_menue_auf'); } catch (e) { /* privat */ }   /* jede Seite öffnet mit geschlossenem Menü */
  let region = 'main', suche = '';
  sicht.innerHTML = `<div class="in">${kopf(h(s.name), sp(`${s.name} · ${mal(s.texte.length, 'Text', 'Texte')}. Klicke einen Text in der Seite an, um ihn zu ändern.`, `${s.name} · ${s.texte.length} text${s.texte.length === 1 ? '' : 's'}. Click a text on the page to change it.`), `<a class="kn kn--linie" href="#seiten">Alle Seiten</a><a class="kn kn--linie" href="/entwurf${h(s.pfad)}" target="_blank" rel="noopener">Im Entwurf ansehen ${PF}</a>`)}
    <div data-q></div>
    <div class="seite-wahl"><div class="chips" data-art>${[['seite', sp('Seite', 'Page')], ['liste', sp('Liste', 'List')]].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${v === SEITE_ART}">${n}</button>`).join('')}</div><div class="chips" data-geraet${SEITE_ART === 'liste' ? ' hidden' : ''}>${[['rechner', sp('Rechner 1440', 'Desktop 1440')], ['handy', sp('Handy 390', 'Phone 390')]].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${v === SEITE_GERAET}">${n}</button>`).join('')}</div></div>
    <div class="seite-rahmen" data-rahmen${SEITE_ART === 'liste' ? ' hidden' : ''}><iframe title="${h(s.name)}" src="${h(s.pfad)}?bs_rahmen=entwurf&nomotion=1&klick=1"></iframe></div>
    <div class="blatt" data-seo><h2>Google & Teilen</h2><p class="hin">Titel und Beschreibung, wie sie bei Google und beim Teilen auf WhatsApp oder Instagram erscheinen.</p><div class="felder">${feld('title', 'Titel', seo.title || '', { platz: s.titel.replace(/ — txtme\.social$/, ''), klein: 'Leer = Titel aus dem Code. «— txtme.social» hängt die Seite selbst an.' })}${feld('description', 'Beschreibung', seo.description || '', { art: 'lang', rows: 2, klein: 'Ein bis zwei Sätze, bis etwa 160 Zeichen.' })}</div><div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>
    <div class="suche" data-listenteil${SEITE_ART === 'liste' ? '' : ' hidden'}><input placeholder="Text suchen …" data-suche><div class="chips region-chips">${[['main', 'Inhalt'], ['header', 'Kopf'], ['footer', 'Fuß'], ['alle', 'Alles']].map(([v, t]) => `<button type="button" data-region="${v}" aria-pressed="${v === region}">${t}</button>`).join('')}</div></div>
    <div class="texte" data-texte data-listenteil${SEITE_ART === 'liste' ? '' : ' hidden'}></div>
    ${s.bilder.length ? `<div class="blatt" style="margin-top:18px"><h2>Bilder auf dieser Seite</h2><p class="hin">Tauschen oder Beschreibung ändern (die Beschreibung lesen Google und Vorlese-Programme).</p><div class="bilder-raster" data-bilder>${s.bilder.map((b, i) => { const neu = (D.entwurf.bilder || {})[b.src]; const alt = (D.entwurf.alt || {})[b.src]; return `<div class="bildf"><div class="f"><img src="${h(neu || b.src)}" alt="" loading="lazy"></div><b style="text-transform:none;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h((b.src.split('/').pop() || '').slice(0, 24))}</b>${neu ? 'getauscht' : h(b.region)}<br><button type="button" data-tausch="${i}">${neu ? 'Anderes' : 'Tauschen'}</button>${neu ? ` · <button type="button" data-zurueck="${i}">Zurück</button>` : ''} · <button type="button" data-alt="${i}">Text</button>${alt ? '<br><small>Beschreibung geändert</small>' : ''}</div>`; }).join('')}</div></div>` : ''}</div>`;
  speichernKnopf($('[data-seo]', sicht), async () => { const w = werte($('[data-seo]', sicht)); const q = await api('aendern', { teil: 'seo', daten: { [s.pfad]: (w.title.trim() || w.description.trim()) ? { title: w.title.trim() || undefined, description: w.description.trim() || undefined } : '' } }); quittung($('[data-q]', sicht), q, { seiteK: k, seite: '/entwurf' + s.pfad, zurueck: { teil: 'seo', schluessel: s.pfad } }); Z = await api('ueberblick'); leiste(); return q; });
  function listeZeigen() {
    const w = $('[data-texte]', sicht); const q = suche.toLowerCase();
    const l = s.texte.filter(t => (region === 'alle' || t.region === region) && (!q || t.text.toLowerCase().includes(q)));
    w.innerHTML = l.map((t, i) => { const ae = texte.find(x => x.alt === t.text && (x.seite === s.pfad || x.seite === '*')); const kopfz = /^h[1-4]$/.test(t.tag); return `<div class="textz${ae ? ' geaendert' : ''}" data-i="${s.texte.indexOf(t)}"><span class="tag${kopfz ? ' h' : ''}">${h(tagName(t.tag))}</span><div><div class="tx${kopfz ? ' h' : ''}">${h(ae ? ae.neu : t.text)}</div>${ae ? `<span class="wo"><b>geändert${ae.seite === '*' ? ', überall' : ''}</b> · vorher: ${h(t.text.slice(0, 80))}</span>` : ''}<span class="wo">${t.n > 1 ? sp(`${t.n}× auf dieser Seite · `, `${t.n}× on this page · `) : ''}${h(ortKurz(t, s))}${t.quelle ? ` · <span class="q">gehört zu <a href="${QUELLE_HASH[t.quelle] || '#'}">${h(QUELLE_NAME[t.quelle] || t.quelle)}</a></span>` : ''}</span></div><div class="chips">${t.quelle ? `<a class="kn kn--klein kn--linie" href="${QUELLE_HASH[t.quelle] || '#'}">Dort ändern</a>` : `<button class="kn kn--klein kn--linie" type="button" data-edit>Ändern</button>`}</div></div>`; }).join('') || '<div class="leer">Nichts gefunden.</div>';
    $$('[data-edit]', w).forEach(b => b.onclick = () => textFenster(s.texte[+b.closest('.textz').dataset.i]));
  }
  function textFenster(t) {
    const ae = texte.find(x => x.alt === t.text && (x.seite === s.pfad || x.seite === '*'));
    const mehr = t.seiten.length > 1;
    const k = fenster(`<h2>Text ändern</h2><p class="hin">${h(ortSatz(t, s))}</p>
      <div class="felder eins">${feld('neu', 'Neuer Text', ae ? ae.neu : t.text, { art: 'lang', rows: Math.min(10, Math.max(2, Math.ceil(t.text.length / 70))) })}
      ${mehr ? `<div class="feld"><span>Wo</span><div class="chips" data-chips="wo"><button type="button" data-v="${h(s.pfad)}" aria-pressed="${ae ? ae.seite !== '*' : true}">Nur auf dieser Seite</button><button type="button" data-v="*" aria-pressed="${ae ? ae.seite === '*' : false}">Überall (${t.seiten.length} Seiten)</button></div></div>` : ''}</div>
      <p class="hinweis">Vorher: ${h(t.text)}</p>
      <div class="fenster__f">${ae ? '<button class="kn kn--linie" type="button" data-zurueck>Zurück auf den Ursprung</button>' : ''}<button class="kn kn--linie" type="button" data-nein>Abbrechen</button><button class="kn kn--brand" type="button" data-ja>Speichern</button></div>`);
    $$('[data-chips] button', k).forEach(b => b.onclick = () => $$('[data-chips] button', k).forEach(x => x.setAttribute('aria-pressed', x === b)));
    $('[data-nein]', k).onclick = fensterZu;
    const zr = $('[data-zurueck]', k); if (zr) zr.onclick = async () => { try { const q = await api('texte', undefined); } catch (e) {} try { const q = await api('aendern', { teil: 'texte', daten: [{ seite: ae.seite, alt: t.text, neu: null }] }); fensterZu(); D = await api('daten'); Object.assign(texte, D.entwurf.texte || []); texte.length = (D.entwurf.texte || []).length; quittung($('[data-q]', sicht), { titel: 'Zurück auf den Ursprung.', text: t.text.slice(0, 80) }, { seiteK: k, seite: '/entwurf' + s.pfad }); listeZeigen(); seiteNeu(); Z = await api('ueberblick'); leiste(); } catch (e) { sag(e.message, true, e.lex); } };
    $('[data-ja]', k).onclick = async () => {
      const neu = $('[name=neu]', k).value; const wo = mehr ? ($$('[data-chips] button[aria-pressed=true]', k)[0] || {}).dataset.v : s.pfad;
      try {
        const q = await api('aendern', { teil: 'texte', daten: [{ seite: wo, alt: t.text, neu }] });
        fensterZu(); D = await api('daten'); texte.length = 0; (D.entwurf.texte || []).forEach(x => texte.push(x));
        quittung($('[data-q]', sicht), q, { seiteK: k, seite: '/entwurf' + s.pfad, zurueck: { teil: 'texte', schluessel: [wo, t.text] } }); listeZeigen(); seiteNeu(); Z = await api('ueberblick'); leiste();
      } catch (e) { sag(e.message, true, e.lex); }
    };
  }
  /* Die Seite gross, wie auf der Website: Rechner 1440 oder Handy 390, verkleinert auf die Breite; Texte zum Anklicken */
  const anzeige = t => { const ae = texte.find(x => x.alt === t.text && (x.seite === s.pfad || x.seite === '*')); return String(ae ? ae.neu : t.text).replace(/\s+/g, ' ').trim(); };
  const rahmen = $('[data-rahmen]', sicht), rf = $('iframe', rahmen); let merkY = 0;
  function rahmenSetzen() {
    if (!rahmen.isConnected || rahmen.hidden) return;
    const breite = SEITE_GERAET === 'handy' ? 390 : 1440, w = rahmen.clientWidth, hh = rahmen.clientHeight, sk = Math.min(1, w / breite);
    rf.style.width = breite + 'px'; rf.style.height = (hh / sk) + 'px'; rf.style.transform = `scale(${sk})`; rf.style.marginLeft = Math.max(0, (w - breite * sk) / 2) + 'px';
  }
  function klickbarSchicken() { try { rf.contentWindow.postMessage({ bureau: 'klickbar', texte: s.texte.filter(t => !t.quelle).map(anzeige) }, location.origin); } catch (e) { /* lädt noch */ } }
  function seiteNeu() { try { merkY = rf.contentWindow.scrollY; rf.src = rf.src; } catch (e) { rf.src = rf.src; } }
  rf.addEventListener('load', () => { klickbarSchicken(); setTimeout(klickbarSchicken, 600); if (merkY) { try { rf.contentWindow.scrollTo(0, merkY); } catch (e) { /* */ } merkY = 0; } });
  SEITE_KLICK = d => { if (!rahmen.isConnected) return; const l = s.texte.filter(x => !x.quelle && anzeige(x) === d.text); const t = l.find(x => x.region === d.region) || l[0]; if (t) { window.bsZeigNr = d.nr; textFenster(t); } };
  new ResizeObserver(rahmenSetzen).observe(rahmen); rahmenSetzen();
  $$('[data-art] button', sicht).forEach(b => b.onclick = () => { SEITE_ART = b.dataset.v; $$('[data-art] button', sicht).forEach(x => x.setAttribute('aria-pressed', x === b));
    const liste = SEITE_ART === 'liste'; rahmen.hidden = liste; $('[data-geraet]', sicht).hidden = liste; $$('[data-listenteil]', sicht).forEach(x => x.hidden = !liste); rahmenSetzen(); });
  $$('[data-geraet] button', sicht).forEach(b => b.onclick = () => { SEITE_GERAET = b.dataset.v; $$('[data-geraet] button', sicht).forEach(x => x.setAttribute('aria-pressed', x === b)); rahmenSetzen(); });
  $('[data-suche]', sicht).oninput = e => { suche = e.target.value; listeZeigen(); };
  $$('[data-region]', sicht).forEach(b => b.onclick = () => { region = b.dataset.region; $$('[data-region]', sicht).forEach(x => x.setAttribute('aria-pressed', x === b)); listeZeigen(); });
  listeZeigen();
  const bw = $('[data-bilder]', sicht);
  if (bw) {
    $$('[data-tausch]', bw).forEach(b => b.onclick = () => waehleDatei(async f => { const src = s.bilder[+b.dataset.tausch].src; try { b.textContent = 'Lädt …'; const r = await hochladen(f); const q = await api('aendern', { teil: 'bilder', daten: { [src]: r.pfad } }); quittung($('[data-q]', sicht), q, { seiteK: k, seite: '/entwurf' + s.pfad, zurueck: { teil: 'bilder', schluessel: src } }); D = await api('daten'); Z = await api('ueberblick'); leiste(); seiteS(k); } catch (e) { sag(e.message, true, e.lex); } }));
    $$('[data-zurueck]', bw).forEach(b => b.onclick = async () => { const src = s.bilder[+b.dataset.zurueck].src; try { const q = await api('aendern', { teil: 'bilder', daten: { [src]: '' } }); quittung($('[data-q]', sicht), q, { seiteK: k }); D = await api('daten'); Z = await api('ueberblick'); leiste(); seiteS(k); } catch (e) { sag(e.message, true, e.lex); } });
    $$('[data-alt]', bw).forEach(b => b.onclick = () => { const bl = s.bilder[+b.dataset.alt]; const alt = (D.entwurf.alt || {})[bl.src]; const kf = fenster(`<h2>Bildbeschreibung</h2><p class="hin">Was auf dem Bild zu sehen ist, in einem Satz.</p><div class="felder eins">${feld('alt', 'Beschreibung', alt ?? bl.alt, {})}</div><div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>Abbrechen</button><button class="kn kn--brand" type="button" data-ja>Speichern</button></div>`); $('[data-nein]', kf).onclick = fensterZu; $('[data-ja]', kf).onclick = async () => { const v = $('[name=alt]', kf).value.trim(); try { const q = await api('aendern', { teil: 'alt', daten: { [bl.src]: v === bl.alt ? '' : v } }); fensterZu(); quittung($('[data-q]', sicht), q, { seiteK: k }); D = await api('daten'); Z = await api('ueberblick'); leiste(); } catch (e) { sag(e.message, true, e.lex); } }; });
  }
}

/* ================= Bilder (alle) ================= */
async function bilderS() {
  await ladeInventar(); if (!D) D = await api('daten');
  const alle = new Map();
  INV.seiten.forEach(s => s.bilder.forEach(b => { if (!alle.has(b.src)) alle.set(b.src, { ...b, seiten: [] }); alle.get(b.src).seiten.push(s); }));
  const liste = [...alle.values()].filter(b => !b.src.includes('/_next/'));
  sicht.innerHTML = `<div class="in">${kopf('Alle Bilder <span class="soft">der Seiten.</span>', 'Jedes Bild einmal, mit den Seiten, auf denen es steht. Tauschen gilt überall, wo das Bild vorkommt. Produktbilder pflegst du beim Produkt.')}
    <div data-q></div><div class="bilder-raster" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${liste.map((b, i) => { const neu = (D.entwurf.bilder || {})[b.src]; return `<div class="bildf"><div class="f"><img src="${h(neu || b.src)}" alt="" loading="lazy"></div><b style="text-transform:none;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h((b.src.split('/').pop() || '').slice(0, 26))}</b>${neu ? 'getauscht' : mal(b.seiten.length, 'Seite', 'Seiten')}<br><button type="button" data-tausch="${i}">${neu ? 'Anderes' : 'Tauschen'}</button>${neu ? ` · <button type="button" data-zurueck="${i}">Zurück</button>` : ''}</div>`; }).join('')}</div></div>`;
  $$('[data-tausch]', sicht).forEach(b => b.onclick = () => waehleDatei(async f => { const src = liste[+b.dataset.tausch].src; try { b.textContent = 'Lädt …'; const r = await hochladen(f); const q = await api('aendern', { teil: 'bilder', daten: { [src]: r.pfad } }); sag(q.titel + ' ' + q.text); D = await api('daten'); Z = await api('ueberblick'); zeige(); } catch (e) { sag(e.message, true, e.lex); } }));
  $$('[data-zurueck]', sicht).forEach(b => b.onclick = async () => { const src = liste[+b.dataset.zurueck].src; try { const q = await api('aendern', { teil: 'bilder', daten: { [src]: '' } }); sag(q.titel); D = await api('daten'); Z = await api('ueberblick'); zeige(); } catch (e) { sag(e.message, true, e.lex); } });
}

/* ================= Fragen & Antworten ================= */
async function fragenS(rest) {
  D = await api('daten');
  const sp = (rest && rest[0]) || 'en';
  const w = D.daten.wirksam.fragen || { en: [], de: [] };
  const gruppen = JSON.parse(JSON.stringify((D.entwurf.fragen && D.entwurf.fragen[sp]) || w[sp] || []));
  sicht.innerHTML = `<div class="in">${kopf('Fragen <span class="soft">und Antworten.</span>', 'Die FAQ auf der Support-Seite (die Startseite zeigt immer die englischen). Gruppen, Fragen und Antworten; Reihenfolge mit den Pfeilen.', `<div class="chips">${[['en', 'Englisch'], ['de', 'Deutsch']].map(([v, t]) => `<a class="kn kn--klein ${v === sp ? '' : 'kn--linie'}" href="#fragen/${v}">${t}</a>`).join('')}</div>`)}
    <div data-q></div><div data-gruppen></div>
    <div class="chips" style="margin:6px 0 18px"><button class="kn kn--klein kn--linie" type="button" data-gruppe-neu>Gruppe dazu</button><button class="kn kn--klein kn--linie" type="button" data-zurueck-code>Zurück auf den Code</button></div>
    <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  function zeigen() {
    $('[data-gruppen]', sicht).innerHTML = gruppen.map((g, gi) => `<div class="blatt" data-g="${gi}"><div class="felder"><label class="feld"><span>Gruppe</span><input name="title" value="${h(g.title)}"></label><div class="feld"><span>&nbsp;</span><div class="chips"><button class="kn kn--klein kn--linie" type="button" data-up>↑</button><button class="kn kn--klein kn--linie" type="button" data-down>↓</button><button class="kn kn--klein kn--linie" type="button" data-weg>Gruppe weg</button></div></div></div>
      ${g.items.map((it, ii) => `<div class="abschnitt" data-i="${ii}"><div class="felder eins"><label class="feld"><span>Frage</span><input name="q" value="${h(it.q)}"></label><label class="feld"><span>Antwort</span><textarea name="a" rows="3">${h(it.a)}</textarea></label></div><div class="chips" style="margin-top:8px"><button class="kn kn--klein kn--linie" type="button" data-iup>↑</button><button class="kn kn--klein kn--linie" type="button" data-idown>↓</button><button class="kn kn--klein kn--linie" type="button" data-iweg>Frage weg</button></div></div>`).join('')}
      <div class="chips"><button class="kn kn--klein kn--linie" type="button" data-frage-neu>Frage dazu</button></div></div>`).join('') || '<div class="leer">Keine Gruppen. «Gruppe dazu» legt die erste an.</div>';
    $$('[data-g]', sicht).forEach(bl => {
      const gi = +bl.dataset.g;
      $('[data-up]', bl).onclick = () => { lies(); if (gi) [gruppen[gi - 1], gruppen[gi]] = [gruppen[gi], gruppen[gi - 1]]; zeigen(); dirty(); };
      $('[data-down]', bl).onclick = () => { lies(); if (gi < gruppen.length - 1) [gruppen[gi + 1], gruppen[gi]] = [gruppen[gi], gruppen[gi + 1]]; zeigen(); dirty(); };
      $('[data-weg]', bl).onclick = () => frage('Gruppe löschen?', `${gruppen[gi].title} mit ${mal(gruppen[gi].items.length, 'Frage', 'Fragen')}.`, 'Löschen', async () => { lies(); gruppen.splice(gi, 1); zeigen(); dirty(); }, true);
      $('[data-frage-neu]', bl).onclick = () => { lies(); gruppen[gi].items.push({ id: 'f-' + Date.now().toString(36), q: '', a: '' }); zeigen(); dirty(); };
      $$('[data-i]', bl).forEach(ab => { const ii = +ab.dataset.i; $('[data-iup]', ab).onclick = () => { lies(); const l = gruppen[gi].items; if (ii) [l[ii - 1], l[ii]] = [l[ii], l[ii - 1]]; zeigen(); dirty(); }; $('[data-idown]', ab).onclick = () => { lies(); const l = gruppen[gi].items; if (ii < l.length - 1) [l[ii + 1], l[ii]] = [l[ii], l[ii + 1]]; zeigen(); dirty(); }; $('[data-iweg]', ab).onclick = () => { lies(); gruppen[gi].items.splice(ii, 1); zeigen(); dirty(); }; });
    });
  }
  function lies() { $$('[data-g]', sicht).forEach(bl => { const gi = +bl.dataset.g; gruppen[gi].title = $('[name=title]', bl).value; $$('[data-i]', bl).forEach(ab => { const it = gruppen[gi].items[+ab.dataset.i]; it.q = $('[name=q]', ab).value; it.a = $('[name=a]', ab).value; }); }); }
  function dirty() { sicht.dispatchEvent(new Event('input')); }
  zeigen();
  $('[data-gruppe-neu]', sicht).onclick = () => { lies(); gruppen.push({ id: 'g-' + Date.now().toString(36), title: '', items: [] }); zeigen(); dirty(); };
  $('[data-zurueck-code]', sicht).onclick = () => frage('Zurück auf den Code?', 'Alle Änderungen an den Fragen in dieser Sprache gehen verloren.', 'Zurücksetzen', async () => { const f = { ...(D.entwurf.fragen || {}) }; delete f[sp]; const q = await api('aendern', { teil: 'fragen', daten: Object.keys(f).length ? f : null }); sag(q.titel); zeige(true); }, true);
  speichernKnopf(sicht, async () => {
    lies();
    const gl = JSON.stringify(gruppen) === JSON.stringify(w[sp] || []) && !(D.entwurf.fragen && D.entwurf.fragen[sp]);
    const daten = { ...(D.entwurf.fragen || {}), [sp]: gruppen.map(g => ({ ...g, title: g.title.trim(), items: g.items.map(i => ({ ...i, q: i.q.trim(), a: i.a.trim() })) })) };
    const code = D.daten.code.fragen || {}; if (JSON.stringify(daten[sp]) === JSON.stringify(code[sp])) delete daten[sp];
    const q = await api('aendern', { teil: 'fragen', daten: Object.keys(daten).length ? daten : null }); quittung($('[data-q]', sicht), q, { seiteK: 'support', seite: '/entwurf/support/' }); Z = await api('ueberblick'); leiste(); D = await api('daten'); return q;
  });
}

/* ================= Presse ================= */
async function presseS(rest) {
  D = await api('daten');
  const sp = (rest && rest[0]) || 'en';
  const w = D.daten.wirksam.presse || {}; const ew = D.entwurf.presse || {};
  const eintraege = JSON.parse(JSON.stringify((ew.eintraege && ew.eintraege[sp]) || (w.eintraege || {})[sp] || []));
  const kit = JSON.parse(JSON.stringify((ew.kit && ew.kit[sp]) || (w.kit || {})[sp] || []));
  sicht.innerHTML = `<div class="in">${kopf('Presse<span class="soft">.</span>', 'Meldungen auf der Presse-Seite (neueste oben) und das Material zum Herunterladen. Bis Medusa angeschlossen ist, kommen die Meldungen von hier.', `<div class="chips">${[['en', 'Englisch'], ['de', 'Deutsch']].map(([v, t]) => `<a class="kn kn--klein ${v === sp ? '' : 'kn--linie'}" href="#presse/${v}">${t}</a>`).join('')}</div>`)}
    <div data-q></div><div class="blatt" data-e><h2>Meldungen</h2><div data-liste></div><div class="chips" style="margin-top:10px"><button class="kn kn--klein kn--linie" type="button" data-neu>Meldung dazu</button></div></div>
    <div class="blatt" data-k><h2>Material zum Herunterladen</h2><p class="hin">Beschriftung und Datei (Adresse unter /media/u/… nach dem Hochladen, oder ein Link). «Folgt» zeigt den Eintrag ohne Link.</p><div data-kit></div><div class="chips" style="margin-top:10px"><button class="kn kn--klein kn--linie" type="button" data-kit-neu>Eintrag dazu</button></div></div>
    <div class="fenster__f"><button class="kn kn--linie" type="button" data-zurueck-code>Zurück auf den Code</button><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  function zeigen() {
    $('[data-liste]', sicht).innerHTML = eintraege.map((e, i) => `<div class="abschnitt" data-i="${i}"><div class="felder"><label class="feld"><span>Datum</span><input name="date" type="date" value="${h(e.date)}"></label><label class="feld"><span>Medium (bei Fremdbericht)</span><input name="outlet" value="${h(e.outlet || '')}"></label><label class="feld breit"><span>Titel</span><input name="title" value="${h(e.title)}"></label><label class="feld breit"><span>Ein Absatz</span><textarea name="summary" rows="2">${h(e.summary)}</textarea></label><label class="feld breit"><span>Link (optional)</span><input name="href" value="${h(e.href || '')}" placeholder="https://…"></label></div><div class="chips" style="margin-top:8px"><button class="kn kn--klein kn--linie" type="button" data-weg>Weg</button></div></div>`).join('') || '<div class="leer">Keine Meldungen.</div>';
    $('[data-kit]', sicht).innerHTML = kit.map((k, i) => `<div class="abschnitt" data-k="${i}"><div class="felder"><label class="feld"><span>Beschriftung</span><input name="label" value="${h(k.label)}"></label><label class="feld"><span>Datei oder Link</span><input name="href" value="${h(k.href === '#' ? '' : k.href)}" placeholder="/media/u/… oder https://…"></label></div><div class="chips" style="margin-top:8px"><button class="kn kn--klein kn--linie" type="button" data-up>Datei hochladen</button><button class="kn kn--klein kn--linie" type="button" data-weg>Weg</button></div></div>`).join('') || '<div class="leer">Kein Material.</div>';
    $$('[data-i] [data-weg]', sicht).forEach(b => b.onclick = () => { lies(); eintraege.splice(+b.closest('[data-i]').dataset.i, 1); zeigen(); sicht.dispatchEvent(new Event('input')); });
    $$('[data-k] [data-weg]', sicht).forEach(b => b.onclick = () => { lies(); kit.splice(+b.closest('[data-k]').dataset.k, 1); zeigen(); sicht.dispatchEvent(new Event('input')); });
    $$('[data-k] [data-up]', sicht).forEach(b => b.onclick = () => waehleDatei(async f => { try { const r = await hochladen(f); lies(); kit[+b.closest('[data-k]').dataset.k].href = r.pfad; zeigen(); sicht.dispatchEvent(new Event('input')); } catch (e) { sag(e.message, true, e.lex); } }));
  }
  function lies() { $$('[data-i]', sicht).forEach(ab => { const e = eintraege[+ab.dataset.i]; ['date', 'outlet', 'title', 'summary', 'href'].forEach(k => { e[k] = $(`[name=${k}]`, ab).value.trim(); }); if (!e.outlet) delete e.outlet; if (!e.href) delete e.href; }); $$('[data-k]', sicht).forEach(ab => { const k = kit[+ab.dataset.k]; k.label = $('[name=label]', ab).value.trim(); const href = $('[name=href]', ab).value.trim(); k.href = href || '#'; k.pending = !href; }); }
  zeigen();
  $('[data-neu]', sicht).onclick = () => { lies(); eintraege.unshift({ id: 'pr-' + Date.now().toString(36), date: new Date().toISOString().slice(0, 10), title: '', summary: '' }); zeigen(); sicht.dispatchEvent(new Event('input')); };
  $('[data-kit-neu]', sicht).onclick = () => { lies(); kit.push({ label: '', href: '#', pending: true }); zeigen(); sicht.dispatchEvent(new Event('input')); };
  $('[data-zurueck-code]', sicht).onclick = () => frage('Zurück auf den Code?', 'Alle Änderungen an Presse in dieser Sprache gehen verloren.', 'Zurücksetzen', async () => { const p = JSON.parse(JSON.stringify(ew)); if (p.eintraege) delete p.eintraege[sp]; if (p.kit) delete p.kit[sp]; const leer = !(p.eintraege && Object.keys(p.eintraege).length) && !(p.kit && Object.keys(p.kit).length); const q = await api('aendern', { teil: 'presse', daten: leer ? null : p }); sag(q.titel); zeige(true); }, true);
  speichernKnopf(sicht, async () => {
    lies(); const code = D.daten.code.presse || {};
    const p = JSON.parse(JSON.stringify(ew));
    const ee = eintraege.filter(e => e.title); const kk = kit.filter(k => k.label);
    p.eintraege = { ...(p.eintraege || {}) }; p.kit = { ...(p.kit || {}) };
    if (JSON.stringify(ee) === JSON.stringify((code.eintraege || {})[sp])) delete p.eintraege[sp]; else p.eintraege[sp] = ee;
    if (JSON.stringify(kk) === JSON.stringify((code.kit || {})[sp])) delete p.kit[sp]; else p.kit[sp] = kk;
    if (!Object.keys(p.eintraege).length) delete p.eintraege; if (!Object.keys(p.kit).length) delete p.kit;
    const q = await api('aendern', { teil: 'presse', daten: Object.keys(p).length ? p : null }); quittung($('[data-q]', sicht), q, { seiteK: 'press', seite: '/entwurf/press/' }); Z = await api('ueberblick'); leiste(); D = await api('daten'); return q;
  });
}

/* ================= Google & Teilen ================= */
async function googleS() {
  await ladeInventar(); D = await api('daten');
  const seo = D.entwurf.seo || {};
  sicht.innerHTML = `<div class="in">${kopf('Google <span class="soft">und Teilen.</span>', 'Titel und Beschreibung je Seite, wie sie bei Google und beim Teilen erscheinen. Leer = Fassung aus dem Code.')}
    <div data-q></div>${INV.seiten.map(s => `<div class="blatt" data-p="${h(s.pfad)}"><h2>${h(s.name)} <small style="color:var(--tinte-3);font-weight:400;font-size:13px">${h(s.pfad)}</small></h2><div class="felder">${feld('title', 'Titel', (seo[s.pfad] || {}).title || '', { platz: s.titel.replace(/ — txtme\.social$/, '') })}${feld('description', 'Beschreibung', (seo[s.pfad] || {}).description || '', { art: 'lang', rows: 2 })}</div></div>`).join('')}
    <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  speichernKnopf(sicht, async () => { const daten = {}; $$('[data-p]', sicht).forEach(b => { const w = werte(b); daten[b.dataset.p] = (w.title.trim() || w.description.trim()) ? { title: w.title.trim() || undefined, description: w.description.trim() || undefined } : ''; }); const q = await api('aendern', { teil: 'seo', daten }); quittung($('[data-q]', sicht), q, {}); Z = await api('ueberblick'); leiste(); return q; });
}

/* ================= Angaben ================= */
const ANGABEN = [['legalName', 'Firma (Impressum, Verkäufer)'], ['representative', 'Vertretung'], ['street', 'Straße'], ['postal', 'PLZ'], ['city', 'Ort'], ['country', 'Land'], ['kvk', 'KvK-Nummer'], ['vat', 'USt-IdNr.'], ['phone', 'Telefon'], ['email', 'E-Mail allgemein'], ['supportEmail', 'E-Mail Support'], ['marketingEmail', 'E-Mail Marketing'], ['salesEmail', 'E-Mail Business'], ['pressEmail', 'E-Mail Presse'], ['privacyEmail', 'E-Mail Datenschutz'], ['safetyEmail', 'E-Mail Sicherheit (Meldungen)'], ['securityEmail', 'E-Mail Sicherheitslücken'], ['url', 'Adresse der Website']];
async function angabenS() {
  D = await api('daten');
  const w = D.daten.wirksam.angaben || {}, c = D.daten.code.angaben || {}, site = D.daten.wirksam.site || {}, e = D.entwurf.angaben || {};
  sicht.innerHTML = `<div class="in">${kopf('Angaben <span class="soft">der Firma.</span>', 'Eine Angabe, viele Stellen: Impressum, Fuß, Support, Presse, Rechtstexte. Leer = Wert aus dem Code.')}
    <div data-q></div><div class="blatt"><h2>Firma und Adressen</h2><div class="felder">${ANGABEN.map(([k, t]) => feld(k, t, e[k] ?? '', { code: c[k] ?? '', platz: (c[k] ?? '') })).join('')}</div></div>
    <div class="blatt"><h2>Ein Satz über txtme.social</h2><p class="hin">Steht im Kopf der Seite und beim Teilen.</p><div class="felder">${feld('tagline', 'Claim', (e.tagline && e.tagline.en) || e.tagline || '', { breit: true, platz: site.tagline, code: site.tagline })}${feld('description', 'Beschreibung', (e.description && e.description.en) || e.description || '', { art: 'lang', breit: true, rows: 2, platz: site.description })}</div></div>
    <div class="blatt"><h2>Entwurfs-Hinweis</h2><p class="hin">Solange die Texte von txtme.social nicht endgültig sind, zeigen einige Seiten einen kleinen Hinweis «Entwurf». Vor dem Livegang ausschalten.</p><label class="schalter"><input type="checkbox" name="hinweis"${(D.entwurf.hinweis ? D.entwurf.hinweis.entwurf : (D.daten.wirksam.hinweis || {}).entwurf) ? ' checked' : ''}><i></i><span>Hinweis «Entwurf» auf den Seiten zeigen</span></label></div>
    <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  speichernKnopf(sicht, async () => {
    const wv = werte(sicht); const daten = {};
    ANGABEN.forEach(([k]) => { daten[k] = wv[k].trim() === String(c[k] ?? '') ? '' : wv[k].trim(); });
    daten.tagline = wv.tagline.trim() === site.tagline ? '' : wv.tagline.trim(); daten.description = wv.description.trim() === site.description ? '' : wv.description.trim();
    const q1 = await api('aendern', { teil: 'angaben', daten });
    const q2 = await api('aendern', { teil: 'hinweis', daten: { entwurf: wv.hinweis === true ? (wv.hinweis === ((D.daten.code.hinweis || { entwurf: true }).entwurf) ? '' : true) : false } });
    const q = q1.nichts && q2.nichts ? q1 : { ...(q1.nichts ? q2 : q1), text: [q1.text, q2.text].filter(Boolean).join(' · ') };
    quittung($('[data-q]', sicht), q, { seiteK: 'about', seite: '/entwurf/about/' }); Z = await api('ueberblick'); leiste(); D = await api('daten'); return q;
  });
}

/* ================= Rechtliches ================= */
async function rechtS(rest) {
  D = await api('daten');
  const art = (rest && rest[0]) || 'terms';
  const w = D.daten.wirksam.recht || {}; const ew = D.entwurf.recht || {};
  const doc = JSON.parse(JSON.stringify(ew[art] || w[art] || { title: '', updated: '', sections: [] }));
  sicht.innerHTML = `<div class="in">${kopf('Rechts<span class="soft">texte.</span>', 'Terms of Service und Privacy Policy, Abschnitt für Abschnitt. Die Texte liefert txtme.social; hier trägst du die endgültige Fassung ein. Überschrift mit [] lässt die Seite so stehen.', `<div class="chips">${[['terms', 'Terms'], ['privacy', 'Privacy']].map(([v, t]) => `<a class="kn kn--klein ${v === art ? '' : 'kn--linie'}" href="#recht/${v}">${t}</a>`).join('')}</div>`)}
    <div data-q></div><div class="blatt"><div class="felder">${feld('title', 'Titel', doc.title, {})}${feld('updated', 'Stand', doc.updated, { platz: 'Updated: 15 October 2026' })}</div></div>
    <div data-abschnitte></div>
    <div class="chips" style="margin:6px 0 18px"><button class="kn kn--klein kn--linie" type="button" data-neu>Abschnitt dazu</button><button class="kn kn--klein kn--linie" type="button" data-zurueck-code>Zurück auf den Code</button></div>
    <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>Speichern</button></div></div>`;
  function zeigen() {
    $('[data-abschnitte]', sicht).innerHTML = doc.sections.map((s, i) => `<details class="abschnitt" data-s="${i}"><summary><span>${h(s.heading || '(ohne Überschrift)')}</span><small>${mal(s.blocks.length, 'Block', 'Blöcke')}</small></summary><div class="bl"><label class="feld"><span>Überschrift</span><input name="heading" value="${h(s.heading)}"></label>${s.blocks.map((b, bi) => `<label class="feld" data-b="${bi}"><span>${'ul' in b ? 'Liste (eine Zeile je Punkt)' : 'Absatz'}</span><textarea name="b">${h('ul' in b ? b.ul.join('\n') : b.p)}</textarea></label>`).join('')}<div class="chips"><button class="kn kn--klein kn--linie" type="button" data-p>Absatz dazu</button><button class="kn kn--klein kn--linie" type="button" data-ul>Liste dazu</button><button class="kn kn--klein kn--linie" type="button" data-weg>Abschnitt weg</button></div></div></details>`).join('');
    $$('[data-s]', sicht).forEach(d => { const i = +d.dataset.s; $('[data-p]', d).onclick = () => { lies(); doc.sections[i].blocks.push({ p: '' }); zeigen(); $$('[data-s]', sicht)[i].open = true; dirty(); }; $('[data-ul]', d).onclick = () => { lies(); doc.sections[i].blocks.push({ ul: [''] }); zeigen(); $$('[data-s]', sicht)[i].open = true; dirty(); }; $('[data-weg]', d).onclick = () => frage('Abschnitt löschen?', doc.sections[i].heading, 'Löschen', async () => { lies(); doc.sections.splice(i, 1); zeigen(); dirty(); }, true); });
  }
  function lies() { doc.title = $('[name=title]', sicht).value; doc.updated = $('[name=updated]', sicht).value; $$('[data-s]', sicht).forEach(d => { const s = doc.sections[+d.dataset.s]; s.heading = $('[name=heading]', d).value; $$('[data-b]', d).forEach(l => { const b = s.blocks[+l.dataset.b]; const v = $('textarea', l).value; if ('ul' in b) b.ul = v.split('\n').map(x => x.trim()).filter(Boolean); else b.p = v; }); s.blocks = s.blocks.filter(b => ('ul' in b ? b.ul.length : b.p.trim())); }); }
  function dirty() { sicht.dispatchEvent(new Event('input')); }
  zeigen();
  $('[data-neu]', sicht).onclick = () => { lies(); doc.sections.push({ id: 's-' + Date.now().toString(36), heading: '', blocks: [{ p: '' }] }); zeigen(); dirty(); };
  $('[data-zurueck-code]', sicht).onclick = () => frage('Zurück auf den Code?', 'Alle Änderungen an diesem Rechtstext gehen verloren.', 'Zurücksetzen', async () => { const r = { ...ew }; delete r[art]; const q = await api('aendern', { teil: 'recht', daten: Object.keys(r).length ? r : null }); sag(q.titel); zeige(true); }, true);
  speichernKnopf(sicht, async () => { lies(); const code = D.daten.code.recht || {}; const r = { ...ew }; if (JSON.stringify(doc) === JSON.stringify(code[art])) delete r[art]; else r[art] = doc; const q = await api('aendern', { teil: 'recht', daten: Object.keys(r).length ? r : null }); quittung($('[data-q]', sicht), q, { seiteK: art, seite: '/entwurf/' + art + '/' }); Z = await api('ueberblick'); leiste(); D = await api('daten'); return q; });
}

/* ================= Zahlen ================= */
async function zahlenS(rest) {
  const tage = +((rest && rest[0]) || 30);
  let d = null, fehler = '';
  try { d = await api('zahlen?tage=' + tage); } catch (e) { fehler = e.message; }
  const s = d && d.summe;
  const balken = (liste, name) => liste.length ? `<div class="balken">${liste.map(([k, v]) => `<div class="z"><span title="${h(k)}">${h(name ? name(k) : k)}</span><i style="transform:scaleX(${(v / liste[0][1]).toFixed(3)})"></i><b>${v}</b></div>`).join('')}</div>` : '<small>Noch nichts.</small>';
  sicht.innerHTML = `<div class="in">${kopf('Was die Seite <span class="soft">bringt.</span>', 'Aufrufe, Stücke, Warenkorb, Kasse, Chat. Gezählt ohne Kekse, ohne Adressen, ohne Namen: nur Seite, Sprache, Gerät und Land. Prüfläufe zählen nicht mit.', `<div class="chips">${[7, 30, 90].map(t => `<a class="kn kn--klein ${t === tage ? '' : 'kn--linie'}" href="#zahlen/${t}">${t} Tage</a>`).join('')}</div>`)}
    ${fehler ? `<div class="leer">${h(fehler)}</div>` : `<div class="karten">${[['Aufrufe', s.aufruf], ['Stück angesehen', s.stueck], ['In den Warenkorb', s.korb], ['Zur Kasse', s.kasse], ['Chat geöffnet', s.chat], ['Stück gesucht', s.finder]].map(([t, v]) => `<div class="karte"><span class="k-etik">${t}</span><span class="zahl">${v}</span></div>`).join('')}</div>
    <div class="blatt" style="margin-top:18px"><h2>Je Tag</h2><div class="reihe-tage">${d.reihe.map(r => `<i style="height:${Math.max(2, (r.aufruf / Math.max(1, ...d.reihe.map(x => x.aufruf))) * 100)}%" data-t="${h(r.tag)}: ${r.aufruf} Aufrufe, ${r.korb} Warenkorb, ${r.kasse} Kasse"></i>`).join('') || '<small>Noch keine Tage.</small>'}</div></div>
    <div class="karten"><div class="karte"><h3>Seiten</h3>${balken(d.seiten)}</div><div class="karte"><h3>Stücke</h3>${balken(d.stuecke)}</div><div class="karte"><h3>Länder</h3>${balken(d.laender)}</div><div class="karte"><h3>Sprachen</h3>${balken(d.sprachen)}</div><div class="karte"><h3>Geräte</h3>${balken(d.geraete, k => k === 'schmal' ? 'Handy' : 'Rechner und Tablet')}</div></div>`}
    <p class="hinweis">Die Zählung läuft im Projekt txtme-backstage (Frankfurt) und speichert je Tag eine Datei. Was ein Besucher ist, sagt sie nicht, nur was passiert ist.</p></div>`;
}

/* ================= Im Chat ================= */
async function chatS(rest) {
  const reiter = (rest && rest[0]) || 'offen';
  let d = { fragen: [] };
  try { d = await api('fragen'); } catch (e) { sag(e.message, true, e.lex); }
  const l = d.fragen.filter(f => reiter === 'alle' || (reiter === 'offen' ? (!f.belegt && !f.erledigt) : f.erledigt));
  sicht.innerHTML = `<div class="in">${kopf('Was im Chat <span class="soft">gefragt wird.</span>', 'Jede Frage mit Antwort, neueste oben. Rot = der Chat hatte dazu nichts auf der Seite gefunden. Mit einem Klick wird daraus eine Frage für die Support-Seite.', `<div class="chips">${[['offen', 'Offen'], ['alle', 'Alle'], ['erledigt', 'Erledigt']].map(([v, t]) => `<a class="kn kn--klein ${v === reiter ? '' : 'kn--linie'}" href="#chat/${v}">${t}</a>`).join('')}<button class="kn kn--klein kn--brand" type="button" data-antwort>Antwort entwerfen</button></div>`)}
    ${d.hinweis ? `<div class="leer" style="margin-bottom:14px">${h(d.hinweis)}</div>` : ''}
    <div class="texte">${l.map(f => `<div class="frage${!f.belegt ? ' offen' : ''}"><div class="q">${h(f.frage)}</div><div class="a">${h(f.antwort)}</div><div class="m"><span>${h(datum(f.zeit))}</span><span>${h(f.sprache || '')}</span>${f.seite ? `<span>auf ${h(f.seite)}</span>` : ''}${f.thema ? `<span class="marke rot">${h(f.thema)}</span>` : ''}${f.finder ? '<span class="marke">Finder</span>' : ''}${!f.belegt ? `<button class="kn kn--klein kn--linie" type="button" data-faq="${h(f.id)}">Zur Frage & Antwort</button>` : ''}<button class="kn kn--klein ${f.erledigt ? 'kn--linie' : ''}" type="button" data-erl="${h(f.id)}" data-tun="${f.erledigt ? 'offen' : 'erledigt'}">${f.erledigt ? 'Wieder offen' : 'Erledigt'}</button></div></div>`).join('') || '<div class="leer">Nichts hier.</div>'}</div>
    <p class="hinweis">${d.gesamt || 0} Fragen gespeichert. Mail-Adressen und Nummern der Kunden werden vor dem Speichern abgedeckt; nach zwölf Monaten wird gelöscht.</p></div>`;
  $$('[data-erl]', sicht).forEach(b => b.onclick = async () => { try { await api('fragen', { tun: b.dataset.tun, id: b.dataset.erl }); zeige(true); } catch (e) { sag(e.message, true, e.lex); } });
  $$('[data-faq]', sicht).forEach(b => b.onclick = () => { const f = d.fragen.find(x => x.id === b.dataset.faq); const k = fenster(`<h2>Als Frage & Antwort</h2><p class="hin">Kommt in die englischen Fragen auf der Support-Seite, Gruppe «Merch and orders». Antwort bitte prüfen und ergänzen.</p><div class="felder eins">${feld('q', 'Frage', f.frage, {})}${feld('a', 'Antwort', f.antwort.replace(/^- /gm, ''), { art: 'lang', rows: 5 })}</div><div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>Abbrechen</button><button class="kn kn--brand" type="button" data-ja>In die Fragen</button></div>`); $('[data-nein]', k).onclick = fensterZu; $('[data-ja]', k).onclick = async () => { try { const D2 = await api('daten'); const fr = JSON.parse(JSON.stringify(D2.entwurf.fragen || {})); const en = fr.en || JSON.parse(JSON.stringify((D2.daten.wirksam.fragen || {}).en || [])); let g = en.find(x => x.id === 'merch') || en[en.length - 1]; if (!g) { g = { id: 'merch', title: 'Merch and orders', items: [] }; en.push(g); } g.items.push({ id: 'f-' + Date.now().toString(36), q: $('[name=q]', k).value.trim(), a: $('[name=a]', k).value.trim() }); fr.en = en; const q = await api('aendern', { teil: 'fragen', daten: fr }); await api('fragen', { tun: 'erledigt', id: f.id }); fensterZu(); sag(q.titel + ' Die Frage steht jetzt im Entwurf der Support-Seite.'); zeige(true); } catch (e) { sag(e.message, true, e.lex); } }; });
  $('[data-antwort]', sicht).onclick = () => { const k = fenster(`<h2>Antwort entwerfen</h2><p class="hin">Nachricht eines Kunden, einer Journalistin oder eines Partners einfügen. Der Entwurf nennt nur, was auf der Seite steht; was ihr prüfen müsst, steht in eckigen Klammern.</p><div class="felder eins">${feld('mail', 'Die Nachricht', '', { art: 'lang', rows: 8 })}${feld('hinweis', 'Hinweis vom Team (optional)', '', { platz: 'zum Beispiel: Rückgabe genehmigen' })}</div><div data-erg></div><div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>Schließen</button><button class="kn kn--brand" type="button" data-ja>Entwurf schreiben</button></div>`, true); $('[data-nein]', k).onclick = fensterZu; $('[data-ja]', k).onclick = async () => { const b = $('[data-ja]', k); b.disabled = true; b.textContent = 'Schreibt …'; try { const r = await api('antwort', { mail: $('[name=mail]', k).value, hinweis: $('[name=hinweis]', k).value }); $('[data-erg]', k).innerHTML = r.fehler ? `<div class="leer">${h(r.fehler)}</div>` : `<div class="blatt" style="margin:14px 0 0"><h2>${h(r.betreff || 'Entwurf')}</h2><div class="entwurf-box">${h(r.text)}</div>${r.team ? `<p class="hinweis" style="white-space:pre-wrap">${h(r.team)}</p>` : ''}<div class="chips" style="margin-top:10px"><button class="kn kn--klein kn--linie" type="button" data-kopie>Text kopieren</button></div></div>`; const kp = $('[data-kopie]', k); if (kp) kp.onclick = () => { navigator.clipboard.writeText((r.betreff ? 'Subject: ' + r.betreff + '\n\n' : '') + r.text).then(() => sag('Kopiert.')); }; } catch (e) { sag(e.message, true, e.lex); } b.disabled = false; b.textContent = 'Entwurf schreiben'; }; };
}

/* ================= Eingang ================= */
async function eingangS() {
  let d = { eintraege: [] }, fehler = '';
  try { d = await api('eingang'); } catch (e) { fehler = e.message; }
  const ART = { warteliste: 'Warteliste', newsletter: 'Newsletter', presse: 'Presse', partner: 'Partner', support: 'Support', nachricht: 'Nachricht' };
  sicht.innerHTML = `<div class="in">${kopf('Was <span class="soft">reinkommt.</span>', 'Einsendungen über die Seite, solange euer Backend den Endpunkt noch nicht übernimmt: Warteliste der Landingpage, Anfragen aus dem Chat. Später zieht das zu euch um.')}
    ${fehler ? `<div class="leer">${h(fehler)}</div>` : `<table class="tabelle"><thead><tr><th>Wann</th><th>Art</th><th>Wer</th><th>Text</th><th></th></tr></thead><tbody>${d.eintraege.map(e => `<tr style="${e.erledigt ? 'opacity:.55' : ''}"><td>${h(datum(e.zeit))}</td><td><span class="marke">${h(ART[e.art] || e.art)}</span></td><td>${h(e.name)}<br><small>${h(e.email)}</small></td><td>${h(e.text || '')}${e.consent ? '<br><small>Einwilligung ja</small>' : ''}</td><td class="r"><button class="kn kn--klein ${e.erledigt ? 'kn--linie' : ''}" type="button" data-erl="${h(e.id)}" data-tun="${e.erledigt ? 'offen' : 'erledigt'}">${e.erledigt ? 'Wieder offen' : 'Erledigt'}</button></td></tr>`).join('') || '<tr><td colspan="5"><div class="leer">Noch nichts eingegangen.</div></td></tr>'}</tbody></table>`}
    <p class="hinweis">Die Landingpage schickt Wartelisten-Einträge an die Adresse, die in ihrem Formular steht. Soll sie bis zum eigenen Backend hierher senden: <b>https://txtme-backstage.vercel.app/api/eingang</b> (JSON mit art «warteliste», name, email, consent).</p></div>`;
  $$('[data-erl]', sicht).forEach(b => b.onclick = async () => { try { await api('eingang', { tun: b.dataset.tun, id: b.dataset.erl }); zeige(true); } catch (e) { sag(e.message, true, e.lex); } });
}

/* ================= Verlauf ================= */
async function verlaufS() {
  const d = await api('verlauf');
  sicht.innerHTML = `<div class="in">${kopf('Jeder Stand <span class="soft">bleibt.</span>', 'Jede Veröffentlichung mit Zeit, Notiz und dem, was sich geändert hat. «In den Entwurf holen» legt den alten Stand als Entwurf an; veröffentlicht wird er erst, wenn du es sagst.')}
    ${d.verlauf.map(v => `<div class="blatt"><div class="zeile" style="border:0;padding:0"><div class="t"><b>${h(datum(v.zeit))}${v.notiz ? ' · ' + h(v.notiz) : ''}</b><small>${mal(v.anzahl, 'Änderung', 'Änderungen')}: ${h(v.aenderungen.map(a => a.titel).slice(0, 6).join(' · '))}${v.aenderungen.length > 6 ? ' …' : ''}</small></div><button class="kn kn--klein kn--linie" type="button" data-hol="${h(v.id)}">In den Entwurf holen</button></div></div>`).join('') || '<div class="leer">Noch nichts veröffentlicht.</div>'}</div>`;
  $$('[data-hol]', sicht).forEach(b => b.onclick = () => frage('Stand in den Entwurf holen?', 'Der jetzige Entwurf wird durch diesen Stand ersetzt. Die Website bleibt, bis du veröffentlichst.', 'Holen', async () => { const r = await api('zurueckholen', { id: b.dataset.hol }); sag(r.titel + ' ' + r.text); location.hash = '#aenderungen'; zeige(true); }));
}

/* ================= Zugang ================= */
async function zugangS() {
  const z = await api('zugang');
  sicht.innerHTML = `<div class="in">${kopf('Zugang<span class="soft">.</span>', z.offen ? 'Backstage ist gerade ohne Passwort offen (nur an diesem Rechner erreichbar). Mit einem Passwort fragt es beim Öffnen danach.' : 'Backstage ist mit Passwort geschützt.')}
    <div class="blatt"><h2>${z.offen ? 'Passwort setzen' : 'Passwort ändern'}</h2><div class="felder">${feld('neu', 'Neues Passwort (mindestens 8 Zeichen)', '', { typ: 'password' })}</div><div class="fenster__f">${z.offen ? '' : '<button class="kn kn--linie" type="button" data-offen>Ohne Passwort öffnen</button>'}<button class="kn kn--brand" type="button" data-setzen>Passwort setzen</button></div></div>
    <div class="blatt"><h2>Werkzeug</h2><div class="chips"><a class="kn kn--klein kn--linie" href="pruefung.html" target="_blank" rel="noopener">Prüfung ${PF}</a><a class="kn kn--klein kn--linie" href="/werkbank/anleitung/" target="_blank" rel="noopener">Anleitung ${PF}</a><button class="kn kn--klein kn--linie" type="button" data-ab>Abmelden</button></div></div></div>`;
  $('[data-setzen]', sicht).onclick = async () => { try { const r = await api('zugang', { tun: 'einrichten', neu: $('[name=neu]', sicht).value }); sag(r.titel + ' ' + r.text); zeige(true); } catch (e) { sag(e.message, true, e.lex); } };
  const o = $('[data-offen]', sicht); if (o) o.onclick = () => frage('Ohne Passwort öffnen?', 'Jeder an diesem Rechner kann Backstage dann öffnen.', 'Öffnen', async () => { const r = await api('zugang', { tun: 'oeffnen' }); sag(r.titel + ' ' + r.text); zeige(true); });
  $('[data-ab]', sicht).onclick = async () => { await api('zugang', { tun: 'abmelden' }); location.reload(); };
}

/* ---------- Start ---------- */
async function start() {
  $('#notausgang').hidden = true;
  const app = $('#app'); app.hidden = false;
  if (!$('.menue-kn')) { const m = document.createElement('button'); m.className = 'menue-kn'; m.type = 'button'; m.textContent = 'Menü'; m.onclick = () => $('#rand').classList.toggle('auf'); document.body.appendChild(m); $('#rand').addEventListener('click', e => { if (e.target.closest('a')) $('#rand').classList.remove('auf'); }); }
  await zeige(true);
}
(async () => {
  try {
    const z = await api('zugang');
    if (z.angemeldet) start(); else tor(z);
  } catch (e) {
    $('#notausgang').innerHTML = `${h(e.message)}<br><a href="pruefung.html#${h(e.lex || '')}">Prüfung öffnen</a>`;
    merkFehler(e.message, 'start', e.lex);
  }
})();
