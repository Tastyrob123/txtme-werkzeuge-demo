/* Check page of Partner Pack (R23): state from the server, repairs with a second click, browser errors, lexicon (see · why · do). */
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LEX = [
  ['verbindung', 'The tool does not answer.', 'Partner Pack is not running on this computer, or the computer slept.', 'Start Partner Pack again, as Tasty Studios set it up for you, then reload this page.'],
  ['server', 'Something went wrong in the tool.', 'An unexpected error; it is noted under «State».', 'Reload once. If it stays, send the error line to Tasty Studios.'],
  ['host', 'Only 127.0.0.1 or localhost.', 'The tool only answers on this computer.', 'Open it as http://localhost:3222/.'],
  ['herkunft', 'Writing only from this page.', 'Another page tried to change something here.', 'Change things only in Partner Pack itself.'],
  ['grenze', 'Too many requests in one minute.', 'A protection against runaway scripts.', 'Wait half a minute, then go on.'],
  ['form', 'The request is not readable.', 'The page in the browser is older than the tool.', 'Reload the page.'],
  ['groesse', 'The request is too large.', 'More than 1 MB of text at once.', 'Shorten the texts.'],
  ['weg', 'Not served.', 'This address does not exist or is closed on purpose (data, code).', 'Use the buttons of the tool.'],
  ['laenge', 'A text is too long.', 'Every field has a limit so the page stays in shape.', 'Shorten the text in that field.'],
  ['weich', 'An underscore is missing.', 'In headlines the quiet part stands between two underscores: Nicht sponsern. _Festhalten._', 'Add the missing underscore or remove the single one.'],
  ['bild', 'This photo is not there.', 'Only photos of the template can be chosen.', 'Choose a photo with «Choose a photo».'],
  ['typ', 'Unknown kind of creator.', 'Only the kinds of the template exist: travel, YouTube, niche, NGO, local.', 'Choose one of the buttons.'],
  ['liste', 'Too many lines or entries.', 'The page has room for a fixed number.', 'Remove a line.'],
  ['name', 'The name is missing.', 'A recipient needs a name, the address of the page comes from it.', 'Write the name, then create.'],
  ['empfaenger', 'This recipient does not exist.', 'It was removed, maybe in another window.', 'Go to the overview.'],
  ['konflikt', 'Changed in another window.', 'Two windows saved the same recipient. Nothing was overwritten.', 'Reload. Then type your change again if it is missing.'],
  ['schritt', 'This step can no longer be undone.', 'Only the last 80 saves can be undone.', 'Use «Earlier versions» or change the field by hand.'],
  ['offen', 'Fields are still empty or placeholders.', 'Required fields, or text still in [brackets] from the template, would be shown pink on the page.', 'Fill in the fields named in the message, save, publish again.'],
  ['laeuft', 'Something is being published or printed.', 'Only one page is built at a time.', 'Wait a moment. If it stays for minutes: «Free publishing again» above.'],
  ['bau', 'The page could not be built.', 'The template stopped while putting the page together.', 'Look at the message; usually a field. Your draft is still there, the page is unchanged.'],
  ['pruefung', 'The built page did not pass the check.', 'It had open fields, did not end cleanly, shrank by more than 40 % or lacked the name.', 'Nothing was switched. Check the fields and publish again.'],
  ['pdf', 'No PDF.', 'The PDF is printed with Google Chrome from the published page, on A4. If a picture does not load, something would be cut at a page edge or some text would be hidden, nothing is changed.', 'Publish first, then make the PDF again. If Chrome is missing, install it; the pages work without it.'],
  ['link', 'This is not a web address.', 'Links on a page only open web addresses that start with https://. Anything else could run on the page.', 'Paste the full address from the browser, for example https://cal.com/…, or leave the field empty.'],
  ['fassung', 'This version is no longer there.', 'Only the last 40 publications are kept.', 'Choose another version.'],
  ['entfernen', 'The name does not match.', 'Removing asks for the name so nothing goes by mistake.', 'Type the name exactly as shown.'],
  ['vorlage', 'A part of the template is missing.', 'The pages are built from the finished partner and ambassador templates, with their texts and photos.', 'Ask Tasty Studios to put the templates back.'],
  ['ablage', 'A saved recipient is not readable.', 'The tool keeps a last good copy of every recipient and uses it.', 'Nothing to do unless it repeats.'],
  ['seite', 'A published page is missing.', 'The page file was moved or deleted by hand.', 'Publish the recipient again.'],
  ['demo', 'Demo.', 'Everything stays in this browser. Nothing is uploaded or sent.', 'Nothing to do.']
];
function ic() { return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>'; }
document.querySelectorAll('.kn i').forEach(i => { i.innerHTML = ic(); });
$('#lexikon').innerHTML = LEX.map(([k, s, g, t]) => `<div class="pr-lex" id="m-${k}"><span class="mono">${k}</span><div><b>${esc(s)}</b><p><small>Why</small>${esc(g)}</p><p><small>What to do</small>${esc(t)}</p></div></div>`).join('');
async function zustand() {
  try {
    const r = await fetch('api/pruefung', { cache: 'no-store' }); const d = await r.json();
    if (!r.ok) throw new Error(d.fehler || r.status);
    $('#zustand').innerHTML = `<div class="pr-z pr-z--ok"><span>Server</span><b>Answers</b><small>Partner Pack in this browser (demo).</small></div>` +
      d.zeilen.map(z => `<div class="pr-z ${z.ok ? 'pr-z--ok' : 'pr-z--rot'}"><span>${esc(z.name)}</span><b>${z.ok ? 'All right' : 'Look here'}</b><small>${esc(z.satz)}${z.ok ? '' : ` <a href="#m-${esc(z.stichwort)}">What to do?</a>`}</small></div>`).join('') +
      (d.fehler.length ? `<h3>Noted by the tool</h3>` + d.fehler.slice().reverse().map(f => `<div class="pr-f"><span class="mono">${esc(f.zeit)}</span>${esc(f.text)}</div>`).join('') : '');
  } catch (e) {
    $('#zustand').innerHTML = `<div class="pr-z pr-z--rot"><span>Tool</span><b>Does not answer</b><small>Start Partner Pack again. <a href="#m-verbindung">What to do?</a></small></div>`;
  }
}
function fehlerBrowser() {
  let l = [];
  try { l = JSON.parse(localStorage.getItem('partner-pack-fehler') || '[]'); } catch (e) { /* private */ }
  $('#fehler').innerHTML = l.length ? l.slice().reverse().map(f => `<div class="pr-f"><span class="mono">${esc(f.zeit)}</span>${esc(f.text)}</div>`).join('') + '<p><button class="link" type="button" id="f-weg">Clear this list</button></p>' : '<p class="leise">No errors noted in this browser.</p>';
  const w = $('#f-weg'); if (w) w.onclick = () => { try { localStorage.removeItem('partner-pack-fehler'); } catch (e) { /* private */ } fehlerBrowser(); };
}
document.querySelectorAll('[data-rep]').forEach(b => {
  b.onclick = async () => {
    if (!b.classList.contains('nochmal')) { b.classList.add('nochmal'); b.firstChild.textContent = 'Click again to confirm '; setTimeout(() => { b.classList.remove('nochmal'); b.firstChild.textContent = b.dataset.t; }, 4000); return; }
    b.classList.remove('nochmal'); b.firstChild.textContent = b.dataset.t;
    try {
      const r = await fetch('api/reparieren', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ was: b.dataset.rep }) }); const d = await r.json();
      $('#rep-satz').textContent = r.ok ? d.satz : String(d.fehler || '').replace(/^[A-Z]+ · /, '');
    } catch (e) { $('#rep-satz').textContent = 'The tool does not answer.'; }
    zustand();
  };
  b.dataset.t = b.firstChild.textContent;
});
zustand(); fehlerBrowser();
if (location.hash) setTimeout(() => { const z = document.querySelector(location.hash); if (z) { z.classList.add('an'); z.scrollIntoView({ block: 'center' }); } }, 60);
