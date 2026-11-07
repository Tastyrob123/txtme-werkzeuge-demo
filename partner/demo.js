/* Online-Fassung Partner Pack (Demo): ersetzt server.py + _mappe/mappe.py im Browser.
   Jeder Aufruf an api/… wird hier beantwortet, mit derselben Logik wie mappe.py (Felder säubern, ableiten, offene Felder,
   Änderungsliste, Schritte, Verlauf, Veröffentlichen mit Prüfung). Gespeichert wird nur im Browser des Besuchers (localStorage).
   Nichts geht an einen Server. Daten der Vorlagen: demo-daten.js (bau_online.py). */
(function () {
  'use strict';
  const D = window.DEMO_DATEN;
  const HAUS = D.haus, SCHEMA = D.schema, TEAM = HAUS.namen.team, ARTEN = ['partner', 'ambassador'];
  const VORLAGE = { partner: 'master', ambassador: 'template' };
  const TYPEN = Object.keys(HAUS.typen);
  const SCHL = 'partner-pack-demo-v1';
  const echtFetch = window.fetch.bind(window);

  // ---------- Ablage im Browser ----------
  let SPEICHER = null;   // Ersatz, wenn localStorage gesperrt ist (privates Fenster): dann gilt es nur bis zum Neuladen
  function laden_alle() {
    try { const t = localStorage.getItem(SCHL); if (t) return JSON.parse(t); } catch (e) { /* gesperrt */ }
    return SPEICHER;
  }
  function schreiben_alle(db) {
    SPEICHER = db;
    try { localStorage.setItem(SCHL, JSON.stringify(db)); } catch (e) { /* gesperrt oder voll: bleibt im Speicher */ }
  }
  const kopie = x => x === undefined ? undefined : JSON.parse(JSON.stringify(x));
  const zwei = n => String(n).padStart(2, '0');
  function jetzt() { const t = new Date(); return t.getFullYear() + '-' + zwei(t.getMonth() + 1) + '-' + zwei(t.getDate()) + 'T' + zwei(t.getHours()) + ':' + zwei(t.getMinutes()) + ':' + zwei(t.getSeconds()); }
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const monat_jetzt = () => MONATE[new Date().getMonth()] + ' ' + new Date().getFullYear();

  // Python-Gleichheit (Dicts ohne Reihenfolge) und Wahrheit
  function gleich(a, b) {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => gleich(x, b[i]));
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && gleich(a[k], b[k]));
  }
  const leer = v => v === null || v === undefined || v === '' || v === 0 || v === false || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
  const laenge = s => Array.from(s).length;
  const ersteWort = n => (String(n == null ? '' : n).trim().split(/\s+/).filter(Boolean)[0]) || '';
  const pyQuote = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const ascii = s => s.normalize('NFKD').replace(/[^\x00-\x7f]/g, '');
  const umlaute = s => String(s).replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue');
  const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escHtmlQ = s => escHtml(s).replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  function unescHtml(s) { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }
  const F = (kw, t) => new Error(kw + ' · ' + t);

  // ---------- Fotos der Vorlage ----------
  const bilder = art => D.bilder[art];

  // ---------- Felder (mappe.py) ----------
  const STEUER = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
  function sauber(s, maxi, zeilen) {
    s = String(s === null || s === undefined ? '' : s).replace(STEUER, '');
    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!zeilen) s = s.replace(/\s*\n\s*/g, ' ');
    s = s.replace(/[ \t]+/g, ' ').trim();
    if (laenge(s) > maxi) throw F('LAENGE', `«${Array.from(s).slice(0, 40).join('')}…» is longer than ${maxi} characters. Please shorten it.`);
    return s;
  }
  function roh_rein(s) {
    const e = escHtml(s);
    if ((e.split('_').length - 1) % 2) throw F('WEICH', 'An underscore is missing: put the quiet part of the headline between two underscores, like _this_.');
    return e.replace(/_([^_]+)_/g, '<em class="soft">$1</em>');
  }
  function roh_raus(s) {
    s = String(s || '').replace(/<em class="soft">([\s\S]*?)<\/em>/g, '_$1_');
    return unescHtml(s.replace(/<[^>]+>/g, ''));
  }
  function* felder_von(art) { for (const g of SCHEMA[art].gruppen) for (const f of g.felder) yield [g, f]; }
  const bild_keys = k => !k ? ['img', 'w', 'h'] : [k + '_img', k + '_w', k + '_h'];
  const LINK_OK = /^https:\/\/[^\s<>"'`\\]+$/;
  const KLAMMER = /^\s*\[[\s\S]*\]\s*$/;

  function zur_maske(art, d) {
    const aus = {};
    const eins = (f, q) => {
      const t = f.t, k = f.k;
      if (t === 'roh') return roh_raus(q[k] === undefined ? '' : q[k]);
      if (t === 'bild') return q[bild_keys(k)[0]] === undefined ? '' : q[bild_keys(k)[0]];
      if (t === 'ja') return !leer(q[k]);
      if (t === 'liste') return (q[k] || []).map(x => String(x));
      if (t === 'gruppe') return (q[k] || []).map(it => { const o = {}; for (const u of f.felder) o[u.k || '_bild'] = eins(u, it); return o; });
      return String(q[k] !== undefined && q[k] !== null ? q[k] : '');
    };
    for (const [, f] of felder_von(art)) aus[f.k || '_bild'] = eins(f, d);
    return aus;
  }

  function aus_maske(art, ein, alt) {
    if (!ein || typeof ein !== 'object' || Array.isArray(ein)) throw F('FORM', 'The fields are missing.');
    const namen = {}; bilder(art).forEach(b => { namen[b.n] = b; });
    const d = kopie(alt);
    const bild = (f, wert, ziel) => {
      const [ki, kw, kh] = bild_keys(f.k);
      wert = String(wert || '').trim();
      if (!wert) { ziel[ki] = ''; ziel[kw] = 0; ziel[kh] = 0; return; }
      if (!namen[wert]) throw F('BILD', `The photo «${wert.slice(0, 60)}» is not in the photos of the template.`);
      ziel[ki] = wert; ziel[kw] = namen[wert].w; ziel[kh] = namen[wert].h;
    };
    const eins = (f, wert, ziel) => {
      const t = f.t, k = f.k, maxi = f.max === undefined ? 400 : f.max;
      if (t === 'bild') return bild(f, wert, ziel);
      if (t === 'ja') { ziel[k] = !leer(wert); return; }
      if (t === 'typ') { const w = String(wert || ''); if (!TYPEN.includes(w)) throw F('TYP', 'Unknown kind of creator.'); ziel[k] = w; return; }
      if (t === 'liste') {
        const l = (wert || []).filter(x => String(x || '').trim()).map(x => sauber(x, f.zeile === undefined ? 200 : f.zeile, !!f.lang));
        if (l.length > (f.max === undefined ? 20 : f.max)) throw F('LISTE', `«${f.l}» takes at most ${f.max === undefined ? 20 : f.max} lines.`);
        ziel[k] = l; return;
      }
      if (t === 'gruppe') {
        const l = [];
        for (const it of (wert || [])) {
          if (!it || typeof it !== 'object' || Array.isArray(it)) continue;
          const neu = {};
          for (const u of f.felder) eins(u, it[u.k || '_bild'], neu);
          if (Object.entries(neu).some(([kk, v]) => kk !== 'w' && kk !== 'h' && typeof v !== 'boolean' && String(v).trim())) l.push(neu);
        }
        if (l.length > (f.max === undefined ? 20 : f.max)) throw F('LISTE', `«${f.l}» takes at most ${f.max === undefined ? 20 : f.max} entries.`);
        ziel[k] = l; return;
      }
      let s = sauber(wert, maxi, t === 'lang');
      if (t === 'roh') s = roh_rein(s);
      if (f.art === 'link' && s && !KLAMMER.test(s) && !LINK_OK.test(s)) throw F('LINK', `«${f.l}» must be a web address starting with https:// (or stay empty).`);
      ziel[k] = s;
    };
    for (const [, f] of felder_von(art)) { const key = f.k || '_bild'; if (key in ein) eins(f, ein[key], d); }
    if (d.contact_name !== alt.contact_name && d.contact_first === alt.contact_first && ['', ersteWort(alt.contact_name)].includes(String(alt.contact_first || '')))
      d.contact_first = ersteWort(d.contact_name);
    return ableiten(art, d);
  }

  function slug_aus(name) {
    let s = ascii(umlaute(name)).toLowerCase();
    s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/^-+|-+$/g, '');
    return s || 'empfaenger';
  }
  const datei_wort = (name, ersatz) => ascii(umlaute(name)).replace(/[^A-Za-z0-9]+/g, '').slice(0, 60) || ersatz;

  function ableiten(art, d) {
    if (art === 'partner') {
      const p = String(d.partner || '').trim();
      d.label = p || 'Partner';
      d.title = p ? `${p} × txtme.social` : 'Partnerschaft mit txtme.social';
      d.ttl2 = p || 'Partnerschaft';
      d.foot_left = d.title; d.mq_first = d.title;
      d.mail_subject = pyQuote(d.title);
      d.pdf_name = datei_wort(p, 'Partner') + '-x-txtme.social.pdf';
      if (leer(d.vals_left)) d.vals_left = p;
      for (const k of ['concept_name', 'concept_one', 'concept_img', 'concept_alt', 'concept_quote', 'concept_quote_p']) if (!(k in d)) d[k] = '';
      for (const k of ['concept_paras', 'concept_steps']) if (!(k in d)) d[k] = [];
      if (!('concept_w' in d)) d.concept_w = 0;
      if (!('concept_h' in d)) d.concept_h = 0;
      if (!('contact_first' in d)) d.contact_first = ersteWort(d.contact_name);
      if (!('date' in d)) d.date = monat_jetzt();
    } else {
      d.label = String(d.creator_name || '').trim() || 'Ambassador';
      const link = String(d.meeting_link || '').trim();
      if (/^\[[\s\S]*\]$/.test(link) || (link && !LINK_OK.test(link))) d.meeting_link = '';
    }
    return d;
  }

  function offen_felder(art, d) {
    const l = [];
    for (const [, f] of felder_von(art)) {
      if (!['text', 'lang', 'roh'].includes(f.t)) continue;
      const v = d[f.k] === undefined ? '' : d[f.k];
      const s = f.t === 'roh' ? roh_raus(v) : String(v || '');
      if ((f.pflicht && !s.trim()) || (KLAMMER.test(s) && !f.frei)) l.push(f.l);
    }
    if (art === 'partner') {
      if (!leer(d.concept_name) && leer(d.concept_img)) l.push('Photo of the idea');
      (d.vals || []).forEach((v, i) => { if (leer(v.img)) l.push(`Photo of value ${i + 1}`); });
      if ((d.vals || []).length !== 3) l.push('Exactly three shared values');
      if ((d.pilot_steps || []).length !== 3) l.push('Exactly three pilot steps');
      for (const k of ['they', 'we', 'pilot']) if (leer(d[k + '_img'])) l.push({ they: 'Partner photo', we: 'txtme.social photo', pilot: 'Pilot photo' }[k]);
    }
    if (!/@/.test(d.contact_email || '')) l.push('E-mail address');
    return Array.from(new Set(l));
  }

  function namen_hinweise(art, d, r) {
    const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const jetzt_ = new Set([ersteWort(d.contact_name).toLowerCase(), String(d.contact_first || '').trim().toLowerCase()].filter(Boolean));
    let quellen = [D.vorlagen[art][VORLAGE[art]]];
    if (r) quellen = quellen.concat([r.ursprung || {}, r.stand || {}], (r.verlauf || []).map(v => v.felder || {}));
    const frueher = new Set();
    for (const q of quellen) for (const n of [ersteWort(q.contact_name), String(q.contact_first || '').trim()])
      if (laenge(n) > 1 && !jetzt_.has(n.toLowerCase()) && !/^\[/.test(n)) frueher.add(n);
    if (!frueher.size) return [];
    const out = [];
    function* texte(f, wert) {
      if (typeof wert === 'string') yield f.t === 'roh' ? roh_raus(wert) : wert;
      else if (Array.isArray(wert)) for (const x of wert) {
        if (typeof x === 'string') yield x;
        else if (x && typeof x === 'object') for (const u of (f.felder || [])) yield* texte(u, x[u.k || '_bild']);
      }
    }
    for (const [, f] of felder_von(art)) {
      if (['contact_name', 'contact_first', 'contact_email', 'contact_phone'].includes(f.k) || ['bild', 'ja', 'typ'].includes(f.t)) continue;
      for (const t of texte(f, d[f.k])) for (const n of Array.from(frueher).sort())
        if (new RegExp('(?<![\\p{L}\\p{N}_])' + reEsc(n) + '(?![\\p{L}\\p{N}_])', 'u').test(t || '')) out.push({ feld: f.l, name: n });
    }
    const seen = new Set();
    return out.filter(x => { const k = x.feld + '\u0000' + x.name; if (seen.has(k)) return false; seen.add(k); return true; });
  }

  function beschriften(art) {
    const m = {};
    for (const [, f] of felder_von(art)) { if (f.t === 'bild') m[bild_keys(f.k)[0]] = f.l; else m[f.k] = f.l; }
    return m;
  }
  function aenderungen(art, vorher, nachher) {
    if (vorher === null || vorher === undefined) return [{ was: 'New page', vorher: '', nachher: nachher.label || '' }];
    const lab = beschriften(art), l = [];
    const kurz = v => (typeof v === 'string' ? roh_raus(v) : Array.isArray(v) ? v.map(x => x && typeof x === 'object' ? String(x.word || x.b || x.k || '') : String(x)).join(', ') : v === true ? 'on' : v === false ? 'off' : String(leer(v) ? '' : v)).slice(0, 160);
    for (const [k, name] of Object.entries(lab)) {
      const a = vorher[k], b = nachher[k];
      if (gleich(leer(a) ? '' : a, leer(b) ? '' : b) || (leer(a) && leer(b))) continue;
      l.push({ was: name, vorher: kurz(a), nachher: kurz(b) });
    }
    return l;
  }

  // ---------- Empfänger ----------
  function db() {
    let d = laden_alle();
    if (!d || !d.empfaenger) { d = anfang(); schreiben_alle(d); }
    return d;
  }
  function laden(id) {
    if (!/^(partner|ambassador)--[a-z0-9-]{1,40}$/.test(String(id || ''))) throw F('EMPFAENGER', 'This recipient does not exist.');
    const r = db().empfaenger[id];
    if (!r) throw F('EMPFAENGER', 'This recipient does not exist (any more).');
    return kopie(r);
  }
  function sichern(r) { const d = db(); d.empfaenger[r.id] = r; schreiben_alle(d); }
  function protokoll(r, was) { (r.protokoll = r.protokoll || []).unshift({ zeit: jetzt(), wer: TEAM, was }); r.protokoll = r.protokoll.slice(0, 200); }
  const alle = () => Object.keys(db().empfaenger).sort().map(k => db().empfaenger[k]);

  // Seiten: seite.html baut die veröffentlichte Fassung (stand) bzw. den Entwurf (vorschau) aus den Feldern
  const seite_url = (art, slug, vorschau) => 'seite.html?seite=' + (vorschau ? 'vorschau/' : '') + art + '/' + slug;
  const pdf_url = (art, slug) => 'druck.html?seite=' + art + '/' + slug;

  function kurz(r) {
    const art = r.art, e = r.entwurf, s = r.stand;
    let bild;
    if (art === 'partner') { const b = e.they_img || ((e.vals || [{}])[0] || {}).img; bild = b ? 'vorlage/partner/media/' + b : HAUS.arten.partner.bild; }
    else bild = (HAUS.typen[e.type || ''] || {}).bild || HAUS.arten.ambassador.bild;
    const pdf = r.pdf || {};
    return {
      id: r.id, art, slug: r.slug, name: e.label || '', beispiel: !!r.beispiel, typ: art === 'ambassador' ? (e.type || '') : '', bild,
      zustand: s === null || s === undefined ? 'neu' : (!gleich(s, e) ? 'entwurf' : 'online'),
      geaendert: r.geaendert || '', veroeffentlicht: r.veroeffentlicht || '',
      url: s !== null && s !== undefined ? seite_url(art, r.slug) : '', pdf: pdf.fassung === r.veroeffentlicht ? (pdf.url || '') : '',
      offen: offen_felder(art, e).length, aenderungen: !gleich(s, e) ? aenderungen(art, s, e).length : 0
    };
  }

  // Erster Besuch: die Empfänger der Vorlagen, damit keine Liste leer ist (wie anfang() in mappe.py)
  function anfang() {
    const out = { empfaenger: {} };
    let q = ableiten('partner', kopie(D.vorlagen.partner.custom95));
    out.empfaenger['partner--custom95'] = { id: 'partner--custom95', art: 'partner', slug: 'custom95', angelegt: jetzt(), geaendert: jetzt(),
      entwurf: q, stand: kopie(q), ursprung: kopie(q), fassung: 1, veroeffentlicht: jetzt(), verlauf: [], schritte: [],
      protokoll: [{ zeit: jetzt(), wer: 'Tasty Studios', was: 'Taken over from the template (recipients/custom95.json)' }] };
    q = ableiten('ambassador', kopie(D.vorlagen.ambassador.example));
    out.empfaenger['ambassador--example'] = { id: 'ambassador--example', art: 'ambassador', slug: 'example', beispiel: true, angelegt: jetzt(), geaendert: jetzt(),
      entwurf: q, stand: null, ursprung: kopie(q), fassung: 1, veroeffentlicht: '', verlauf: [], schritte: [],
      protokoll: [{ zeit: jetzt(), wer: 'Tasty Studios', was: 'Example of the template (invented recipient)' }] };
    return out;
  }

  function links_sicher(art, rec) {
    rec = kopie(rec);
    const pruef = (felder, ziel) => {
      for (const f of felder) {
        const k = f.k; if (!k || !(k in ziel)) continue;
        if (f.t === 'gruppe' && Array.isArray(ziel[k])) ziel[k].forEach(it => { if (it && typeof it === 'object') pruef(f.felder || [], it); });
        else if (f.art === 'link') { const w = String(ziel[k] || '').trim(); if (w && !LINK_OK.test(w)) ziel[k] = ''; }
      }
    };
    pruef(Array.from(felder_von(art)).map(x => x[1]), rec);
    return rec;
  }

  async function bauen(art, rec) {
    try { return await window.PartnerSeite.seite(art, links_sicher(art, rec)); }
    catch (e) { if (/^[A-Z]+ · /.test(e.message)) throw e; throw F('BAU', 'The page could not be built: ' + String(e.message).slice(0, 240)); }
  }
  function pruefe_seite(text, d, alt) {
    if (text.includes('{{')) throw F('PRUEFUNG', 'The page still has open fields of the template.');
    if (!text.slice(-200).includes('</html>')) throw F('PRUEFUNG', 'The page does not end cleanly.');
    if (text.length < 40000) throw F('PRUEFUNG', 'The page is much smaller than expected.');
    if (alt && text.length < alt * 0.6) throw F('PRUEFUNG', 'The page shrank by more than 40 %. Nothing was switched.');
    const name = escHtmlQ(d.partner || d.creator_name || '');
    if (name && !text.includes(name)) throw F('PRUEFUNG', 'The name of the recipient is not on the page.');
  }

  // ---------- Lauf (Veröffentlichen, PDF) ----------
  let LAUF = { aktiv: false };
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const schritt = t => (LAUF.schritte = LAUF.schritte || []).push({ t, zeit: jetzt() });
  function starte(was, id, ziel, ...args) {
    if (LAUF.aktiv) throw F('LAEUFT', 'Something is being published or printed right now. Wait a moment.');
    LAUF = { aktiv: true, was, id, schritte: [], start: jetzt() };
    setTimeout(() => ziel(id, ...args), 0);
  }
  async function _veroeffentlichen(id, notiz) {
    try {
      let r = laden(id); const art = r.art, slug = r.slug, e = r.entwurf;
      schritt('Building the page from the draft'); await pause(350);
      const text = await bauen(art, e);
      schritt('Checking the page'); await pause(300);
      const alt = r.stand ? (await bauen(art, r.stand)).length : 0;
      pruefe_seite(text, e, alt);
      schritt('Keeping the current page as an earlier version'); await pause(250);
      schritt('Switching to the new page'); await pause(250);
      schritt('Checked again: the page is the one that was tested');
      r = laden(id);
      if (!gleich(r.entwurf, e)) throw F('KONFLIKT', 'Someone saved while publishing. Nothing was switched.');
      let liste = aenderungen(art, r.stand, e);
      if (r.stand !== null && r.stand !== undefined) {
        r.verlauf = r.verlauf || [];
        r.verlauf.unshift({ nr: r.verlauf.length ? r.verlauf[0].nr + 1 : 1, zeit: r.veroeffentlicht || jetzt(), notiz: r.notiz || '', felder: r.stand });
        r.verlauf = r.verlauf.slice(0, 40);
      }
      r.stand = kopie(e); r.veroeffentlicht = jetzt(); r.notiz = sauber(notiz, 160); r.fassung = (r.fassung || 1) + 1;
      protokoll(r, `Published (${liste.length} change${liste.length !== 1 ? 's' : ''})` + (r.notiz ? ` · ${r.notiz}` : ''));
      sichern(r);
      if (liste.length && liste[0].was === 'New page') liste = [];
      LAUF.fertig = { zahl: liste.length, aenderungen: liste.slice(0, 12), url: seite_url(art, slug) };
    } catch (ex) { LAUF.fehler = /^[A-Z]+ · /.test(ex.message) ? ex.message : 'SERVER · ' + String(ex.message).slice(0, 200); }
    finally { LAUF.aktiv = false; }
  }
  // PDF: die veröffentlichte Seite selbst, auf A4 gesetzt (druck.html: umbruch.js wie lokal, dann druckt der Browser)
  async function _pdf(id) {
    try {
      let r = laden(id);
      schritt('Opening the published page'); await pause(300);
      const text = await bauen(r.art, r.stand);
      pruefe_seite(text, r.stand, 0);
      schritt('Setting the page on A4: your browser prints it, choose «Save as PDF»'); await pause(400);
      r = laden(id);
      r.pdf = { url: pdf_url(r.art, r.slug), fassung: r.veroeffentlicht, zeit: jetzt() };
      protokoll(r, 'PDF made');
      sichern(r);
      LAUF.fertig = { pdf: r.pdf.url };
    } catch (ex) { LAUF.fehler = /^[A-Z]+ · /.test(ex.message) ? ex.message : 'SERVER · ' + String(ex.message).slice(0, 200); }
    finally { LAUF.aktiv = false; }
  }

  function ueberblick() {
    const l = alle().map(kurz).sort((a, b) => a.geaendert < b.geaendert ? 1 : a.geaendert > b.geaendert ? -1 : 0);
    return { empfaenger: l, demo: true, lauf: { aktiv: LAUF.aktiv, was: LAUF.was, id: LAUF.id },
      zahlen: { partner: l.filter(x => x.art === 'partner').length, ambassador: l.filter(x => x.art === 'ambassador').length,
        wartet: l.filter(x => x.zustand !== 'online').length, online: l.filter(x => x.zustand === 'online').length } };
  }
  function empfaenger(id) {
    const r = laden(id), art = r.art, e = r.entwurf, s = r.stand;
    return { id: r.id, art, slug: r.slug, beispiel: !!r.beispiel, kurz: kurz(r), felder: zur_maske(art, e), fassung: r.fassung || 1,
      offen: offen_felder(art, e), namen: namen_hinweise(art, e, r), aenderungen: !gleich(s, e) ? aenderungen(art, s, e) : [],
      protokoll: (r.protokoll || []).slice(0, 12), verlauf: (r.verlauf || []).map(v => ({ nr: v.nr, zeit: v.zeit, notiz: v.notiz || '' })),
      schema: SCHEMA[art], url: s !== null && s !== undefined ? seite_url(art, r.slug) : '' };
  }

  function get(was, q) {
    const eins = k => q.get(k) || '';
    if (was === 'ueberblick') return ueberblick();
    if (was === 'empfaenger') return empfaenger(eins('id'));
    if (was === 'bilder') { const art = eins('art'); if (!ARTEN.includes(art)) throw F('FORM', 'Unknown kind.'); return { bilder: bilder(art), basis: 'vorlage/' + art + '/media/' }; }
    if (was === 'lauf') return { aktiv: LAUF.aktiv, was: LAUF.was, id: LAUF.id, schritte: LAUF.schritte, fehler: LAUF.fehler, fertig: LAUF.fertig };
    if (was === 'pruefung') return pruefung();
    if (was === 'haus') { const o = {}; for (const k of ['namen', 'haus', 'ort', 'website', 'arten', 'typen']) o[k] = HAUS[k]; return o; }
    throw F('WEG', 'Unknown way.');
  }

  async function post(was, d) {
    if (was === 'neu') {
      const art = d.art; if (!ARTEN.includes(art)) throw F('FORM', 'Unknown kind.');
      const name = sauber(d.name, 80); if (!name) throw F('NAME', 'Please write the name of the recipient first.');
      const basis = kopie(D.vorlagen[art][VORLAGE[art]]); delete basis.slug;
      const slug = slug_aus(name);
      const vorhanden = new Set(alle().filter(r => r.art === art).map(r => r.slug));
      let n = 2, frei = slug;
      while (vorhanden.has(frei) || ['media', 'img', 'out', 'system', 'src', 'recipients', '_print'].includes(frei)) { frei = `${slug.slice(0, 36)}-${n}`; n++; }
      if (art === 'partner') { basis.partner = name; basis.vals_left = name; basis.desc = `Ein Vorschlag für ${name}.`; }
      else { basis.creator_name = name; basis.first_name = name.split(/\s+/)[0]; const t = String(d.typ || ''); basis.type = TYPEN.includes(t) ? t : ''; }
      basis.slug = frei;
      const b2 = ableiten(art, basis);
      const r = { id: `${art}--${frei}`, art, slug: frei, angelegt: jetzt(), geaendert: jetzt(), entwurf: b2, stand: null, ursprung: kopie(b2), fassung: 1,
        veroeffentlicht: '', verlauf: [], schritte: [], protokoll: [] };
      protokoll(r, 'Created from the ' + (art === 'partner' ? 'general version' : 'template'));
      sichern(r);
      return { id: r.id };
    }
    if (was === 'speichern') {
      const r = laden(d.id);
      if (parseInt(d.fassung || 0, 10) !== (r.fassung || 1)) throw F('KONFLIKT', 'This recipient was changed in another window. Reload to see the newest version; your input stays here until then.');
      const neu = aus_maske(r.art, d.felder, r.entwurf); neu.slug = r.slug;
      const liste = aenderungen(r.art, r.entwurf, neu);
      if (gleich(neu, r.entwurf) || !liste.length) return { geaendert: false, meldung: 'Nothing changed, nothing saved.', fassung: r.fassung || 1 };
      const nr = r.schritte && r.schritte.length ? r.schritte[0].nr + 1 : 1;
      (r.schritte = r.schritte || []).unshift({ nr, zeit: jetzt(), vorher: r.entwurf }); r.schritte = r.schritte.slice(0, 80);
      r.entwurf = neu; r.fassung = (r.fassung || 1) + 1; r.geaendert = jetzt();
      protokoll(r, 'Saved: ' + liste.slice(0, 3).map(a => a.was).join(', ') + (liste.length > 3 ? ` and ${liste.length - 3} more` : ''));
      sichern(r);
      return { geaendert: true, was: liste.map(a => a.was), schritt: nr, fassung: r.fassung };
    }
    if (was === 'rueckgaengig') {
      const r = laden(d.id); const s = (r.schritte || []).find(x => x.nr === d.schritt);
      if (!s) throw F('SCHRITT', 'This step can no longer be undone.');
      r.entwurf = s.vorher; r.schritte = r.schritte.filter(x => x.nr < s.nr); r.fassung = (r.fassung || 1) + 1; r.geaendert = jetzt();
      protokoll(r, 'Undone'); sichern(r);
      return { ok: true, fassung: r.fassung };
    }
    if (was === 'vorschau') {
      const r = laden(d.id);
      pruefe_seite(await bauen(r.art, r.entwurf), r.entwurf, 0);
      return { url: seite_url(r.art, r.slug, true), zeit: jetzt() };
    }
    if (was === 'veroeffentlichen') {
      const r = laden(d.id);
      if (gleich(r.stand, r.entwurf)) return { laeuft: false, meldung: 'Nothing changed, nothing published.' };
      const o = offen_felder(r.art, r.entwurf);
      if (o.length) throw F('OFFEN', 'Still empty or a placeholder: ' + o.slice(0, 5).join(', ') + (o.length > 5 ? ` and ${o.length - 5} more` : '') + '.');
      starte('raus', r.id, _veroeffentlichen, String(d.notiz || ''));
      return { laeuft: true };
    }
    if (was === 'pdf') {
      const r = laden(d.id);
      if (r.stand === null || r.stand === undefined) throw F('PDF', 'Publish the page first: the PDF is made from the published version.');
      starte('pdf', r.id, _pdf);
      return { laeuft: true };
    }
    if (was === 'zurueckholen') {
      const r = laden(d.id), nr = d.nr;
      let felder;
      if (nr === 'ursprung') felder = r.ursprung; else { const v = (r.verlauf || []).find(x => x.nr === nr); felder = v && v.felder; }
      if (!felder) throw F('FASSUNG', 'This version is no longer there.');
      const nrS = r.schritte && r.schritte.length ? r.schritte[0].nr + 1 : 1;
      (r.schritte = r.schritte || []).unshift({ nr: nrS, zeit: jetzt(), vorher: r.entwurf });
      r.entwurf = kopie(felder); r.fassung = (r.fassung || 1) + 1; r.geaendert = jetzt();
      protokoll(r, nr !== 'ursprung' ? 'Earlier version taken into the draft' : 'First version taken into the draft');
      sichern(r);
      return { offen: !gleich(r.stand, r.entwurf) ? aenderungen(r.art, r.stand, r.entwurf).length : 0, fassung: r.fassung };
    }
    if (was === 'entfernen') {
      const r = laden(d.id);
      if (d.name !== r.entwurf.label) throw F('ENTFERNEN', 'The name does not match. Nothing was removed.');
      protokoll(r, 'Removed');
      const b = db(); b.entfernt = (b.entfernt || []).concat([r]).slice(-40); delete b.empfaenger[r.id]; schreiben_alle(b);
      return { ok: true };
    }
    if (was === 'fehler') { fehler_merken(sauber(d.text, 600)); return { ok: true }; }
    if (was === 'reparieren') return reparieren(String(d.was || ''));
    throw F('WEG', 'Unknown way.');
  }

  function fehler_merken(text) { const b = db(); b.fehler = (b.fehler || []).concat([{ zeit: jetzt(), text: String(text).slice(0, 600) }]).slice(-60); schreiben_alle(b); }

  function pruefung() {
    const p = [], zeile = (name, ok, satz, stichwort) => p.push({ name, ok, satz, stichwort: stichwort || '' });
    zeile('Partner template', true, 'There, with its texts and photos.', 'vorlage');
    zeile('Ambassador template', true, 'There, with its texts and photos.', 'vorlage');
    let gespeichert = true; try { localStorage.setItem(SCHL + '-probe', '1'); localStorage.removeItem(SCHL + '-probe'); } catch (e) { gespeichert = false; }
    zeile('Recipients', gespeichert, gespeichert ? `${alle().length} recipients, saved in this browser.` : 'This browser does not keep data (private window): changes stay until the page is reloaded.', 'ablage');
    zeile('PDF printer', true, 'Your browser prints the PDF from the published page: choose «Save as PDF».', 'pdf');
    zeile('Upload', true, 'Off. Nothing leaves this browser (demo).', 'demo');
    zeile('Publishing', !LAUF.aktiv, !LAUF.aktiv ? 'Nothing running.' : 'Running now: ' + ({ raus: 'publishing a page', pdf: 'printing a PDF' }[LAUF.was] || 'a job') + '.', 'laeuft');
    return { zeilen: p, fehler: (db().fehler || []).slice(-20), zeit: jetzt() };
  }
  function reparieren(was) {
    if (was === 'lauf') { LAUF = { aktiv: false }; return { ok: true, satz: 'Publishing is free again.' }; }
    if (was === 'vorschau') return { ok: true, satz: 'Previews and build folders cleared. Published pages are untouched.' };
    throw F('WEG', 'Unknown repair.');
  }

  // ---------- fetch: api/… beantwortet die Demo, alles andere geht normal ----------
  const antwort = (code, d) => new Response(JSON.stringify(d), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  window.fetch = async function (eingabe, opt) {
    const roh = typeof eingabe === 'string' ? eingabe : (eingabe && eingabe.url) || '';
    let u; try { u = new URL(roh, location.href); } catch (e) { return echtFetch(eingabe, opt); }
    const basis = new URL('api/', location.href);
    if (u.origin !== location.origin || !u.pathname.startsWith(basis.pathname)) return echtFetch(eingabe, opt);
    const was = u.pathname.slice(basis.pathname.length);
    const methode = String((opt && opt.method) || 'GET').toUpperCase();
    try {
      if (methode === 'GET') return antwort(200, get(was, u.searchParams));
      let d = {};
      try { d = JSON.parse((opt && opt.body) || '{}'); } catch (e) { return antwort(400, { fehler: 'FORM · The request is not readable JSON.' }); }
      if (!d || typeof d !== 'object' || Array.isArray(d)) return antwort(400, { fehler: 'FORM · The request must be an object.' });
      return antwort(200, await post(was, d));
    } catch (e) {
      const t = String(e && e.message || e);
      if (/^[A-Z]+ · /.test(t)) return antwort(/^(KONFLIKT|LAEUFT)/.test(t) ? 409 : 400, { fehler: t });
      try { fehler_merken('SERVER · ' + t.slice(0, 300)); } catch (e2) { /* egal */ }
      return antwort(500, { fehler: 'SERVER · ' + t.slice(0, 200) });
    }
  };
  // «Download all data»: was dieser Browser gespeichert hat, als eine JSON-Datei (lokal: ZIP vom Server)
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-demo-export]'); if (!a) return;
    e.preventDefault();
    const t = new Date(), name = 'partner-pack-' + t.getFullYear() + zwei(t.getMonth() + 1) + zwei(t.getDate()) + '-' + zwei(t.getHours()) + zwei(t.getMinutes()) + '.json';
    const url = URL.createObjectURL(new Blob([JSON.stringify(db(), null, 1)], { type: 'application/json' }));
    const l = document.createElement('a'); l.href = url; l.download = name; document.body.appendChild(l); l.click(); l.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
  // für seite.html und druck.html: Felder eines Empfängers (veröffentlicht oder Entwurf)
  window.PartnerDemo = { felder(art, slug, vorschau) { const r = db().empfaenger[art + '--' + slug]; if (!r) return null; return vorschau ? r.entwurf : r.stand; } };
})();
