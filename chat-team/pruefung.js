/* Check page of Chat Team: state from api/zustand, errors from api/fehler, repairs with a second click, lexicon of the keywords. Runs without the tool. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LEX = [
    ['VERBINDUNG', 'The page cannot reach the server part.', 'server.py is not running, or it runs on another port.', 'Start it in the tool folder: python3 server.py 3224, then reload.'],
    ['SERVER', 'A request failed inside the server with a technical message.', 'A file is unreadable or a module stopped; the trace is in the error list above.', 'Read the error list, try again; if it stays, back up and report it with the message.'],
    ['ANFRAGE', 'A request no longer exists or the view is unknown.', 'It was deleted in another window, or the address is old.', 'Reload the inbox.'],
    ['FRAGE', 'A question no longer exists.', 'Deleted or older than twelve months.', 'Reload «What was asked».'],
    ['EINGABE', 'A field is empty or too short.', 'Question and answer, title and text or the topic are needed.', 'Fill in the field and try again.'],
    ['LAENGE', 'A field is longer than what fits.', 'Every field has a limit (answer 2,000, statement 600, entry 4,000, letter 12,000 characters); nothing is cut short, so nothing was saved.', 'Shorten the text, the counter under the field shows how much. Then save again.'],
    ['FORMULAR', 'A request from the website form was refused.', 'A valid e-mail address, the message (for a request) or a known kind of request is missing.', 'Nothing to do in the tool; the form on the website asks for it.'],
    ['KONFLIKT', 'Another window saved this letter first; nothing was overwritten.', 'Two windows worked on the same letter; the later one carried an older version number.', 'Reload to see the newer version. Your text stays in the window until then; copy it if you want to keep it.'],
    ['DEMO', 'This step needs the model, which is off in the demo.', 'Reading links, documents and photos, translating and drafting with facts all call the model; the demo does not.', 'Paste the text and choose an area instead. The model is switched on only with CHAT_TEAM_KI=1 and a key in the environment, never in a file.'],
    ['KI', 'The chat service did not answer.', 'No connection, or the service is down for a moment.', 'Try again in a few minutes.'],
    ['KI-GUTHABEN', 'The chat has used up its credit for this month.', 'The account of the model is empty.', 'Nothing in the tool; the account needs credit. Until then the chat on the website also stops answering.'],
    ['WISSEN', 'A row, entry or link of the knowledge no longer exists.', 'It was removed in another window, or the website text changed.', 'Reload «What the chat knows».'],
    ['LINK', 'The link could not be used.', 'No https://, the address does not exist, or it is not public.', 'Paste the full address, or paste the text of the page instead.'],
    ['SEITE', 'The page behind the link could not be read.', 'It answered with an error, was not reachable, or shows its content only in a browser.', 'Try later or paste the text of the page.'],
    ['PDF', 'A PDF behind a link cannot be read.', 'Links to PDFs are not followed.', 'Add the PDF as a file, or paste its text.'],
    ['DATEI', 'A file could not be read or is too large.', 'More than 20 MB, or not a PDF, Word, text or photo.', 'Shrink it or add it as text.'],
    ['AUSZUG', 'The model could not pull entries out of the material.', 'The answer of the model was unusable.', 'Try again; if it stays, paste the text and choose an area.'],
    ['ENTWURF', 'The draft could not be written.', 'The model refused the message or the request is incomplete.', 'Write the reply yourself in «Text only».'],
    ['TRANSLATE', 'The reading copy could not be made.', 'There is no letter yet, or the translation came back incomplete.', 'Write the letter first, then try again.'],
    ['CHAT', 'The assistant is not loaded.', 'The server part did not bind the chat module.', 'Restart server.py.'],
    ['HERKUNFT', 'Writing was refused because the request did not come from this page.', 'Another origin or site tried to write.', 'Nothing to do; use the tool from its own address only.'],
    ['HOST', 'The address of the request is not local.', 'The tool runs on 127.0.0.1 only.', 'Open http://127.0.0.1:3224/.'],
    ['GRENZE', 'Too many requests in one minute.', '600 reads or 60 writes per minute and sender.', 'Wait half a minute.'],
    ['GROESSE', 'The request is larger than allowed.', '3 MB for changes, 25 MB for reading knowledge.', 'Shrink photos, split documents.'],
    ['FORM', 'The request is not JSON.', 'Another content type was sent.', 'Nothing to do in the tool; the page sends JSON.'],
    ['WEG', 'The way does not exist or is not served.', 'Private files (_gast, daten, proben, *.py) are never served.', 'Nothing to do.'],
    ['REPARATUR', 'A repair was refused.', 'Real entries lie in the inbox, so the examples are not re-created; or the repair is unknown.', 'Delete the real entries first if you really want the examples again.'],
    ['ONLINE', 'The online part of the chat did not answer.', 'The connection is switched on but the address or the key is wrong, or the service is down.', 'Check haus.json → online and GAST_GEHEIM in the environment; switch the connection off to work with the probes.']];
  $('#pr-lex').innerHTML = LEX.map(([k, s, g, t]) => `<div id="m-${k.toLowerCase()}"><dt>${k}</dt><dd><b>See:</b> ${esc(s)}</dd><dd><b>Reason:</b> ${esc(g)}</dd><dd><b>Do:</b> ${esc(t)}</dd></div>`).join('');
  if (location.hash) { const z = $(location.hash); if (z) z.scrollIntoView({ block: 'center' }); }
  const zeile = (ok, t) => `<li class="${ok === true ? 'gut' : ok === false ? 'rot' : 'gelb'}">${t}</li>`;
  async function zustand() {
    try {
      const r = await fetch('api/zustand', { cache: 'no-store' }); const z = await r.json(); if (!r.ok) throw new Error(z.fehler || r.status);
      const l = [];
      l.push(zeile(true, '<b>Server</b> answers on this address.'));
      l.push(zeile(z.schreibbar, `<b>Data folder</b> ${esc(z.daten)}/ ${z.schreibbar ? 'is writable' : 'is NOT writable'}.`));
      l.push(zeile(/model on/.test(z.assistent) ? true : null, `<b>Assistant:</b> ${esc(z.assistent)}.`));
      l.push(zeile(true, `<b>Inbox:</b> ${z.anfragen} requests (${z.beispiele} examples) · <b>questions:</b> ${z.fragen} · <b>added by the team:</b> ${z.nachgetragen}.`));
      Object.entries(z.dateien).forEach(([n, s]) => l.push(zeile(/DAMAGED/.test(s) ? false : true, `<b>${esc(n)}</b> ${esc(s)}.`)));
      l.push(zeile(true, `<b>Backups:</b> ${z.sicherungen} last good copies (.gut) next to the files.`));
      l.push(zeile(z.wissen.steckbrief > 0, `<b>Knowledge:</b> ${z.wissen.zeichen.toLocaleString('en-GB')} characters of the website, ${z.wissen.steckbrief} rows in the fact sheet, state ${esc(z.wissen.stand).replace('T', ' ')}.`));
      l.push(zeile(z.online.an ? true : null, `<b>Online part:</b> ${z.online.an ? 'connected to ' + esc(z.online.basis) : 'switched off, the tool reads the probes (no call, no upload)'}.`));
      l.push(zeile(null, `<b>Login:</b> ${esc(z.anmeldung)}.`));
      l.push(zeile(true, `<b>Limits:</b> ${z.grenzen.anfrage_mb} MB per change, ${z.grenzen.einlesen_mb} MB for reading knowledge, ${z.grenzen.lesen_min} reads and ${z.grenzen.schreiben_min} writes per minute.`));
      l.push(zeile(z.fehler === 0 ? true : null, `<b>Browser errors:</b> ${z.fehler} recorded.`));
      $('#pr-zustand').innerHTML = l.join('');
      $('#pr-satz').textContent = z.schreibbar && !Object.values(z.dateien).some(s => /DAMAGED/.test(s)) ? 'Everything the tool needs is there.' : 'Something needs attention, see the red points.';
    } catch (e) { $('#pr-zustand').innerHTML = zeile(false, '<b>Server</b> does not answer: ' + esc(e.message)); $('#pr-satz').textContent = 'The server part is not reachable. Start it with: python3 server.py 3224'; }
  }
  async function fehler() {
    try {
      const r = await fetch('api/fehler', { cache: 'no-store' }); const d = await r.json();
      let lok = []; try { lok = JSON.parse(localStorage.getItem('chat-team-fehler') || '[]'); } catch (e) { /* private */ }
      const l = (d.fehler || []).map(x => `<li>${esc(String(x.zeit).replace('T', ' ').slice(0, 16))} · ${esc(x.text)}</li>`);
      $('#pr-fehler').innerHTML = (l.length ? l.join('') : '<li class="gut">No error recorded on the server.</li>') + (lok.length ? `<li>${lok.length} in this browser (localStorage), last: ${esc(lok[lok.length - 1].text)}</li>` : '');
    } catch (e) { $('#pr-fehler').innerHTML = '<li class="rot">Could not load.</li>'; }
  }
  let warte = null;
  document.querySelectorAll('[data-rep]').forEach(b => b.onclick = async () => {
    const w = b.dataset.rep;
    if (warte !== w) { warte = w; b.classList.add('warte'); $('#pr-rep-satz').textContent = 'Click again within five seconds to confirm.'; setTimeout(() => { if (warte === w) { warte = null; b.classList.remove('warte'); $('#pr-rep-satz').textContent = ''; } }, 5000); return; }
    warte = null; b.classList.remove('warte');
    try {
      const r = await fetch('api/reparatur', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was: w }) }); const d = await r.json();
      if (!r.ok) throw new Error(d.fehler || r.status);
      $('#pr-rep-satz').textContent = w === 'sicherung' ? 'Backed up to ' + d.datei + '.' : 'Done.';
      try { localStorage.removeItem('chat-team-fehler'); } catch (e) { /* private */ }
      zustand(); fehler();
    } catch (e) { $('#pr-rep-satz').textContent = String(e.message); }
  });
  zustand(); fehler();
})();
