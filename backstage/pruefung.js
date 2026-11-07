/* Prüfung · Backstage txtme.social. Braucht nichts vom Panel (kein backstage.js). Prüft von drei Seiten: Browser, Server, Seiten.
   Dazu Reparaturen mit Doppelklick-Bestätigung und das Lexikon. Neue Fehlermeldung im Server → Stichwort in _backstage/pruefung.py
   (LEX_MUSTER) und Eintrag mit derselben id hier im LEXIKON. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const LEXIKON = [
  ['server-aus', 'Backstage antwortet nicht', 'Beim Öffnen steht «Backstage antwortet nicht» oder die Seite lädt endlos.', 'Der Server backstage.py läuft nicht (Rechner neu gestartet, Fenster geschlossen).', 'Im Projektordner ein Terminal öffnen und «python3 _backstage/backstage.py» starten. Dann Backstage neu laden.'],
  ['serverfehler', 'Serverfehler', 'Eine Meldung mit «Serverfehler» und einem Fachwort.', 'Im Server ist etwas Unerwartetes passiert; die Einzelheit steht im Fehlerprotokoll.', 'Noch einmal versuchen. Bleibt es, das Fehlerprotokoll hier unten lesen und Robert schicken.'],
  ['langsam', 'Zeitüberschreitung', 'Eine Anfrage hat zu lange gedauert.', 'Der Bau der Seite war gerade sehr beschäftigt oder der Rechner im Stromsparmodus.', 'Kurz warten, dann noch einmal. Stromsparmodus ausschalten hilft.'],
  ['anfrage', 'Ungültige Anfrage', '«Ungültige Anfrage» oder «Unbekannte Eingabe».', 'Browser und Server passen nicht zusammen, meist nach einer Aktualisierung von Backstage.', 'Backstage neu laden (Umschalt + Neu laden).'],
  ['anmeldung', 'Anmeldung', '«Bitte anmelden» oder «Das Passwort stimmt nicht».', 'Die Sitzung ist abgelaufen (12 Stunden) oder das Passwort war falsch.', 'Neu anmelden. Passwort vergessen: die Datei «offen» im Datenordner inhalt/ anlegen, dann ist Backstage ohne Passwort offen.'],
  ['gesperrt', 'Zu viele Versuche', 'Nach mehreren falschen Passwörtern ist die Anmeldung zehn Minuten gesperrt.', 'Schutz gegen Raten.', 'Zehn Minuten warten.'],
  ['passwort-kurz', 'Passwort zu kurz', 'Beim Setzen eines Passworts: «mindestens 8 Zeichen».', 'Kürzere Passwörter nimmt Backstage nicht an.', 'Ein längeres Passwort wählen.'],
  ['zugang', 'Schon eingerichtet', '«Backstage ist schon eingerichtet».', 'Ein Passwort gibt es schon; ein neues setzt man angemeldet unter Zugang.', 'Anmelden, dann unter Zugang ein neues Passwort setzen.'],
  ['stand-kaputt', 'Stand beschädigt', '«stand.json ist beschädigt» oder «lässt sich nicht lesen».', 'Die Datei mit dem Stand wurde beim Schreiben unterbrochen (Rechner aus, Platte voll).', 'Reparatur «Stand aus der Sicherung zurückholen». Backstage hält immer zwei Sicherungen (.gut, .vorher).'],
  ['bau-fehler', 'Bau fehlgeschlagen', 'Unten in der Leiste steht «Bau fehlgeschlagen» oder beim Veröffentlichen «Die Seite ließ sich nicht bauen».', 'Der Bau der Seite (next build) ist abgebrochen: Platz voll, node_modules fehlt, oder eine Angabe im Stand passt nicht.', 'Reparatur «Entwurf neu bauen». Bleibt es, die Meldung dahinter lesen: «node_modules» → im Projektordner «npm install».'],
  ['bau-laeuft', 'Bau läuft', '«Gerade läuft ein Bau» beim Veröffentlichen, oder der Entwurf ist noch nicht gebaut.', 'Backstage baut nach jeder Änderung den Entwurf neu, das dauert 10 bis 30 Sekunden.', 'Kurz warten, die Leiste unten zeigt, wann es fertig ist.'],
  ['datei-gross', 'Datei zu groß', '«größer als 25 MB» oder «zu groß».', 'Fotos direkt aus der Kamera sind oft sehr groß.', 'Das Bild vorher verkleinern (Vorschau: Werkzeuge → Größe anpassen, 2400 Pixel reichen).'],
  ['datei-art', 'Keine Bilddatei', '«Das ist kein Bild, das wir lesen können».', 'Nur JPG, PNG und WebP gehen; HEIC vom iPhone und PDF nicht.', 'Das Bild als JPG oder PNG sichern (Vorschau: Ablage → Exportieren).'],
  ['link-format', 'Adresse falsch', '«muss mit https:// beginnen» oder «Die Bildadresse muss mit / beginnen».', 'Links brauchen die volle Adresse, Bilder einen Pfad auf der Seite.', 'Adresse mit https:// eintragen, bei Bildern hochladen statt tippen.'],
  ['mail-format', 'E-Mail-Adresse falsch', '«keine gültige E-Mail-Adresse».', 'Tippfehler oder Leerzeichen.', 'Adresse prüfen: name@txtme.social.'],
  ['zahl-format', 'Zahl falsch', '«muss eine Zahl sein» bei Preis oder Versandkosten.', 'Buchstaben oder zwei Kommas im Feld.', 'Nur Ziffern und ein Komma: 39,50.'],
  ['doppelt', 'Gibt es schon', '«Die Adresse … gibt es schon».', 'Zwei Produkte mit derselben Adresse (slug) gehen nicht.', 'Eine andere Adresse wählen, zum Beispiel hoodie-black-2.'],
  ['pflichtfeld', 'Angabe fehlt', '«braucht einen Namen», «mindestens eine Größe», «Jede Frage braucht Frage und Antwort».', 'Ein Pflichtfeld ist leer.', 'Das Feld ausfüllen oder den leeren Eintrag löschen.'],
  ['nichts-offen', 'Nichts zu veröffentlichen', '«Der Entwurf ist gleich dem veröffentlichten Stand».', 'Es gibt keine Änderung.', 'Nichts zu tun.'],
  ['veraltet', 'Gibt es nicht', '«Diesen Stand gibt es nicht» oder «ist nicht bekannt».', 'Der Eintrag wurde inzwischen gelöscht oder die Ansicht ist alt.', 'Backstage neu laden.'],
  ['host', 'Falscher Host', '«Falscher Host».', 'Backstage ist über eine andere Adresse als 127.0.0.1 aufgerufen worden.', 'http://127.0.0.1:3213/backstage/ benutzen.'],
  ['chat-aus', 'Chat-Funktion nicht erreichbar', '«txtme-backstage.vercel.app ist gerade nicht erreichbar» bei Fragen, Zahlen oder Eingang.', 'Keine Verbindung ins Netz, oder das Vercel-Projekt antwortet gerade nicht.', 'Netz prüfen, später noch einmal. Der Chat auf der Website antwortet in der Zeit mit dem Weg zum Team.'],
  ['skript', 'Skriptfehler im Browser', 'Backstage bleibt leer oder eine Ansicht lädt nicht; im Fehlerprotokoll steht «skript».', 'Ein alter Stand von backstage.js im Zwischenspeicher oder ein Fehler in der Oberfläche.', 'Backstage mit Umschalt + Neu laden öffnen. Bleibt es, das Fehlerprotokoll Robert schicken.'],
  ['kekse', 'Kekse gesperrt', 'Anmeldung klappt, beim nächsten Klick heißt es wieder «Bitte anmelden».', 'Der Browser nimmt keine Kekse von 127.0.0.1 an (privates Fenster, strenge Einstellung).', 'Normales Fenster benutzen oder Kekse für 127.0.0.1 erlauben. Oder die Datei «offen» anlegen.'],
];

const P = { browser: $('#p-browser'), server: $('#p-server'), seiten: $('#p-seiten'), reparaturen: $('#p-reparaturen'), fehler: $('#p-fehler'), lex: $('#p-lexikon') };
function punkt(wirt, id, titel, grad, text, mehr) {
  const el = document.createElement('div'); el.className = 'punkt ' + grad; el.id = 'pp-' + id;
  el.innerHTML = `<i></i><div><b>${h(titel)}</b><span>${h(text)}</span>${mehr ? `<small>${mehr}</small>` : ''}</div>`;
  wirt.appendChild(el); return el;
}
function setz(el, grad, text, mehr) { el.className = 'punkt ' + grad; $('span', el).textContent = text; if (mehr !== undefined) { let s = $('small', el); if (!s) { s = document.createElement('small'); $('div', el).appendChild(s); } s.innerHTML = mehr; } }
const lexLink = id => `<a href="#${h(id)}">Was tun?</a>`;

/* ---------- Lexikon ---------- */
P.lex.innerHTML = LEXIKON.map(([id, t, sehen, grund, tun]) => `<details id="${h(id)}"><summary><span>${h(t)}</span><code>${h(id)}</code></summary><dl><dt>Sehen</dt><dd>${h(sehen)}</dd><dt>Grund</dt><dd>${h(grund)}</dd><dt>Tun</dt><dd>${h(tun)}</dd></dl></details>`).join('');
function lexAuf() { const id = location.hash.slice(1); const d = id && document.getElementById(id); if (d && d.tagName === 'DETAILS') { d.open = true; d.scrollIntoView({ block: 'center' }); } }
addEventListener('hashchange', lexAuf);

/* ---------- Browser ---------- */
function browser() {
  P.browser.innerHTML = '';
  punkt(P.browser, 'netz', 'Verbindung', navigator.onLine ? 'gruen' : 'rot', navigator.onLine ? 'Der Browser hat eine Netzverbindung.' : 'Der Browser meldet: kein Netz. Backstage läuft am Rechner trotzdem, Chat, Zahlen und Eingang nicht.');
  let kekse = false; try { document.cookie = 'txtme_probe=1; SameSite=Lax'; kekse = document.cookie.includes('txtme_probe'); document.cookie = 'txtme_probe=; Max-Age=0'; } catch (e) {}
  punkt(P.browser, 'kekse', 'Kekse', kekse ? 'gruen' : 'gelb', kekse ? 'Der Browser nimmt Kekse an (nötig für die Anmeldung, wenn ein Passwort gesetzt ist).' : 'Der Browser nimmt keine Kekse an. Mit Passwort klappt die Anmeldung dann nicht.', kekse ? '' : lexLink('kekse'));
  let speicher = false; try { localStorage.setItem('txtme_probe', '1'); speicher = localStorage.getItem('txtme_probe') === '1'; localStorage.removeItem('txtme_probe'); } catch (e) {}
  punkt(P.browser, 'speicher', 'Speicher im Browser', speicher ? 'gruen' : 'gelb', speicher ? 'Backstage kann sich Fehler im Browser merken (für diese Seite).' : 'Kein Speicher im Browser: Fehler werden nur auf dem Server protokolliert.');
  punkt(P.browser, 'adresse', 'Adresse', /^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? 'gruen' : 'gelb', `Aufgerufen über ${location.host}. ` + (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? 'So soll es sein.' : 'Backstage ist nur am eigenen Rechner gedacht (127.0.0.1:3213).'));
  let eigene = []; try { eigene = JSON.parse(localStorage.getItem('txtme_backstage_fehler') || '[]'); } catch (e) {}
  punkt(P.browser, 'eigene', 'Fehler, die Backstage im Browser gesehen hat', eigene.length ? 'gelb' : 'gruen', eigene.length ? `${eigene.length} gemerkt, der letzte: ${eigene[eigene.length - 1].text}` : 'Keine.', eigene.length ? eigene.slice(-5).reverse().map(f => `${h(f.zeit.slice(0, 16).replace('T', ' '))} · ${h(f.text)} ${f.lex ? lexLink(f.lex) : ''}`).join('<br>') + ' · <a href="#" id="eigene-weg">Vergessen</a>' : '');
  const w = $('#eigene-weg'); if (w) w.onclick = e => { e.preventDefault(); localStorage.removeItem('txtme_backstage_fehler'); browser(); };
  punkt(P.browser, 'skripte', 'Diese Prüfseite', (window.__pruefung && window.__pruefung.fehler.length) ? 'rot' : 'gruen', (window.__pruefung && window.__pruefung.fehler.length) ? 'Fehler beim Laden der Prüfseite: ' + window.__pruefung.fehler.join('; ') : 'Lädt und läuft.');
}

/* ---------- Server ---------- */
async function server() {
  P.server.innerHTML = '';
  const warte = punkt(P.server, 'server', 'Backstage-Server', 'laeuft', 'Fragt den Server …');
  let d = null;
  try {
    const r = await fetch('/backstage/api/pruefung', { cache: 'no-store' });
    d = await r.json();
    if (!r.ok || (d.fehler && !Array.isArray(d.fehler))) throw new Error(d.fehler || 'Fehler ' + r.status);   // d.fehler ist die Liste des Fehlerprotokolls (06.11.2026)
    setz(warte, 'gruen', `Antwortet in ${d.dauer} s. ${d.offen ? 'Ohne Passwort offen.' : 'Mit Passwort.'}`);
  } catch (e) {
    setz(warte, 'rot', 'Der Server antwortet nicht: ' + e.message, lexLink('server-aus'));
    return null;
  }
  d.punkte.forEach(p => punkt(P.server, p.id, p.titel, p.grad, p.text, p.ok ? '' : (p.tun ? `Reparatur unten: «${h(REP[p.tun] || p.tun)}»` : '')));
  P.fehler.innerHTML = '';
  if (!d.fehler || !d.fehler.length) punkt(P.fehler, 'f0', 'Fehlerprotokoll', 'gruen', 'Keine Fehler protokolliert.');
  else d.fehler.forEach((f, i) => punkt(P.fehler, 'f' + i, `${f.zeit.replace('T', ' ')} · ${f.art}`, f.art === 'browser' ? 'gelb' : 'rot', f.text, (f.wo ? 'bei ' + h(f.wo) + ' · ' : '') + (f.lex ? lexLink(f.lex) : '')));
  return d;
}

/* ---------- Seiten ---------- */
async function seiten() {
  P.seiten.innerHTML = '';
  const liste = ['/', '/merch/', '/accessories/', '/add-ons/', '/about/', '/support/', '/shipping-payments/', '/press/', '/vulnerability-disclosure/', '/checkout/', '/terms/', '/privacy/', '/cookie-settings/', '/katalog.json', '/backstage.json', '/fonts/SpaceGrotesk.woff2', '/media/logo-white.svg'];
  window.__chatDa = false;   // der Chat ist ein eigenes Werkzeug (Chat-Team); fehlt er im Stand, ist das kein Fehler der Seiten (06.11.2026)
  for (const wurzel of ['']) {
    const el = punkt(P.seiten, 'w' + wurzel, wurzel ? 'Entwurf (/entwurf/)' : 'Veröffentlichte Seite (/)', 'laeuft', 'Ruft die Seiten auf …');
    const schlecht = [];
    let n = 0;
    for (const p of liste) {
      try {
        const r = await fetch(wurzel + p + (p.includes('.') ? '' : ''), { cache: 'no-store' });
        if (!r.ok) schlecht.push(`${p} → ${r.status}`); else n++;
        if (r.ok && p.endsWith('/') && !/\.\w+$/.test(p)) { const t = await r.text(); if (window.__chatDa && !t.includes('chat/chat.js')) schlecht.push(`${p}: Chat fehlt`); if (!t.includes('<title>')) schlecht.push(`${p}: ohne Titel`); }
      } catch (e) { schlecht.push(`${p} → ${e.message}`); }
    }
    setz(el, schlecht.length ? (wurzel ? 'gelb' : 'rot') : 'gruen', schlecht.length ? `${n} von ${liste.length} in Ordnung. Nicht in Ordnung: ${schlecht.join(', ')}` : `Alle ${liste.length} Adressen antworten, jede Seite mit Titel und Chat.`, schlecht.length && wurzel ? lexLink('bau-laeuft') : '');
  }
  // Produktseiten aus dem Katalog
  try {
    const k = await (await fetch('/katalog.json', { cache: 'no-store' })).json();
    const el = punkt(P.seiten, 'produkte', 'Produktseiten', 'laeuft', 'Ruft jede Produktseite auf …');
    const schlecht = [];
    for (const p of k.produkte) { const r = await fetch('/product/' + p.slug + '/', { cache: 'no-store' }); if (!r.ok) schlecht.push(p.slug); if (p.image) { const b = await fetch(p.image, { method: 'HEAD', cache: 'no-store' }); if (!b.ok) schlecht.push(p.slug + ': Bild fehlt'); } }
    setz(el, schlecht.length ? 'rot' : 'gruen', schlecht.length ? `Nicht in Ordnung: ${schlecht.join(', ')}` : `Alle ${k.produkte.length} Produktseiten antworten, jedes Bild ist da.`);
  } catch (e) { punkt(P.seiten, 'produkte', 'Produktseiten', 'rot', 'Katalog nicht lesbar: ' + e.message); }
  // Online-Dienste
  for (const [name, url] of []) {
    const el = punkt(P.seiten, name, name + ' (online)', 'laeuft', 'Fragt …');
    try { const r = await fetch(url, { cache: 'no-store' }); const d = await r.json(); setz(el, r.ok ? 'gruen' : 'rot', r.ok ? (d.modell ? `Antwortet, Modell ${d.modell}, Wissen ${d.wissen_zeichen} Zeichen.` : `Antwortet, ${d.gesamt} Fragen gespeichert.`) : 'Antwort ' + r.status); } catch (e) { setz(el, 'gelb', 'Nicht erreichbar: ' + e.message, lexLink('chat-aus')); }
  }
}

/* ---------- Reparaturen ---------- */
const REP = { 'zurueck-stand.json': 'Stand aus der Sicherung zurückholen', 'zurueck-entwurf.json': 'Entwurf aus der Sicherung zurückholen', 'stand-anlegen': 'Leeren Stand anlegen', 'entwurf-verwerfen': 'Entwurf verwerfen', 'bau-entwurf': 'Entwurf neu bauen', 'bau-stand': 'Veröffentlichte Seite neu bauen', 'bau-aufraeumen': 'Liegengebliebene Bau-Ordner löschen', 'uploads-aufraeumen': 'Nicht mehr benutzte Uploads löschen', 'fehler-leeren': 'Fehlerprotokoll leeren' };
const REP_TEXT = { 'zurueck-stand.json': 'Holt stand.json aus der letzten guten Sicherung. Die beschädigte Datei bleibt als .kaputt liegen.', 'zurueck-entwurf.json': 'Holt entwurf.json aus der letzten guten Sicherung.', 'stand-anlegen': 'Legt eine leere stand.json an, falls sie fehlt. Ändert nichts Vorhandenes.', 'entwurf-verwerfen': 'Setzt den Entwurf auf den veröffentlichten Stand zurück. Offene Änderungen gehen verloren.', 'bau-entwurf': 'Baut den Entwurf neu (10 bis 30 Sekunden).', 'bau-stand': 'Baut die veröffentlichte Seite aus stand.json neu. Ändert keine Inhalte.', 'bau-aufraeumen': 'Löscht Ordner, die ein abgebrochener Bau hinterlassen hat.', 'uploads-aufraeumen': 'Löscht hochgeladene Bilder, die weder im Stand, noch im Entwurf, noch im Verlauf vorkommen.', 'fehler-leeren': 'Leert das Fehlerprotokoll auf dem Server.' };
function reparaturen() {
  P.reparaturen.innerHTML = '';
  Object.entries(REP).forEach(([id, t]) => {
    const el = punkt(P.reparaturen, 'r-' + id, t, '', REP_TEXT[id]);
    const b = document.createElement('button'); b.className = 'kn kn--linie'; b.type = 'button'; b.textContent = 'Ausführen';
    let bereit = false, t0 = 0;
    b.onclick = async () => {
      if (!bereit) { bereit = true; b.textContent = 'Wirklich? Noch einmal klicken'; b.className = 'kn kn--rot'; t0 = setTimeout(() => { bereit = false; b.textContent = 'Ausführen'; b.className = 'kn kn--linie'; }, 5000); return; }
      clearTimeout(t0); bereit = false; b.disabled = true; b.textContent = 'Läuft …';
      try {
        const r = await fetch('/backstage/api/reparieren', { method: 'POST', headers: { 'content-type': 'application/json', 'X-Backstage': '1' }, body: JSON.stringify({ tun: id }) });
        const d = await r.json();
        setz(el, d.ok ? 'gruen' : 'rot', d.text || d.fehler || 'Fertig.');
      } catch (e) { setz(el, 'rot', 'Nicht ausgeführt: ' + e.message); }
      b.disabled = false; b.textContent = 'Ausführen'; b.className = 'kn kn--linie';
    };
    el.appendChild(b);
  });
}

async function alles() {
  const los = $('#los'); los.disabled = true; $('#stand').textContent = 'prüft …';
  browser(); reparaturen();
  const d = await server();
  await seiten();
  const rot = document.querySelectorAll('.punkt.rot').length, gelb = document.querySelectorAll('.punkt.gelb').length;
  $('#stand').textContent = rot ? `${rot} rot, ${gelb} gelb: oben nachsehen.` : gelb ? `Alles läuft, ${gelb} Hinweise.` : 'Alles läuft.';
  $('#zeit').textContent = 'Geprüft ' + new Date().toLocaleString('de-DE');
  los.disabled = false;
}
$('#los').onclick = alles;
lexAuf();
alles();
