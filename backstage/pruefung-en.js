/* Prüfseite auf Englisch (Auftrag Regel 3): die Oberfläche von Backstage ist englisch, Deutsch per Knopf «DE» (localStorage bs_sprache).
   Setzt die festen Texte, die Punkte und das Lexikon um; baut die Prüfseite nicht um. Läuft nach pruefung.js und pruefung-bureau.js. */
(function () {
  'use strict';
  let sp = 'en'; try { sp = localStorage.getItem('bs_sprache') || 'en'; } catch (e) { /* privat */ }
  if (sp === 'de') return;
  document.documentElement.lang = 'en';
  document.title = 'Check · Backstage txtme.social';
  const LEX = {
    'server-aus': ['Backstage is not answering', 'On opening it says “Backstage is not answering”, or the page keeps loading.', 'The server backstage.py is not running (computer restarted, window closed).', 'Open a terminal in the project folder and start “python3 _backstage/backstage.py”. Then reload Backstage.'],
    serverfehler: ['Server error', 'A message with “SERVER” and a technical word.', 'Something unexpected happened in the server; the detail is in the error log.', 'Try again. If it stays, read the error log below and send it to Robert.'],
    langsam: ['Time-out', 'A request took too long.', 'The computer was very busy or in power-saving mode.', 'Wait a moment, then try again. Switching power saving off helps.'],
    anfrage: ['Invalid request', '“Unknown request”.', 'Browser and server do not match, usually after Backstage was updated.', 'Reload Backstage (Shift + reload).'],
    anmeldung: ['Sign-in', '“Please sign in” or “Name or password is wrong”.', 'The session has expired (12 hours) or the password was wrong.', 'Sign in again. Forgot the password: create the file “offen” in the data folder inhalt/; Backstage is then open without a password.'],
    gesperrt: ['Too many attempts', 'After several wrong passwords, sign-in is locked for ten minutes.', 'Protection against guessing.', 'Wait ten minutes.'],
    'passwort-kurz': ['Password too short', 'When setting a password: “at least 8 characters”.', 'Backstage does not accept shorter passwords.', 'Choose a longer password.'],
    zugang: ['Already set up', '“Backstage is already set up”.', 'A password already exists; a new one is set under Access after signing in.', 'Sign in, then set a new password under Access.'],
    'stand-kaputt': ['State damaged', '“The file … is damaged” or “cannot be read”.', 'The file with the state was interrupted while being written (computer off, disk full).', 'Repair “Restore state from the backup”. Backstage always keeps the last good version (.gut).'],
    'bau-fehler': ['No built website', '“BUILD · There is no built website (out/ is missing)”.', 'Backstage lays the state and the draft over the built pages in out/; without a build there is nothing to show.', 'Run “npm install” and “npm run build” in the project folder, then reload Backstage.'],
    'bau-laeuft': ['Publishing in progress', '“RUNNING · Publishing is in progress” when publishing.', 'One publishing run is still going; a second waits.', 'Wait a moment; the window shows when it is done.'],
    'datei-gross': ['File too large', '“larger than 25 MB” or “too large”.', 'Photos straight from the camera are often very large.', 'Make the image smaller first (Preview: Tools → Adjust Size, 2400 pixels are enough).'],
    'datei-art': ['Not an image file', '“This is not an image we can read”.', 'Only JPG, PNG and WebP work; HEIC from the iPhone and PDF do not.', 'Save the image as JPG or PNG (Preview: File → Export).'],
    'link-format': ['Address wrong', '“must start with https://” or “The image address must start with /media/”.', 'Links need the full address, images a path on the site.', 'Enter the address with https://; for images, upload instead of typing.'],
    'mail-format': ['E-mail address wrong', '“not a valid e-mail address”.', 'A typo or a space.', 'Check the address: name@txtme.social.'],
    'zahl-format': ['Number wrong', '“must be a number” for shipping cost.', 'Letters or two commas in the field.', 'Digits and one decimal point only: 39.50.'],
    doppelt: ['Already exists', '“This name already exists”.', 'Two users with the same name are not possible.', 'Choose another name.'],
    pflichtfeld: ['Detail missing', '“must not be empty” or “needs a text”.', 'A required field is empty.', 'Fill in the field or delete the empty entry.'],
    'nichts-offen': ['Nothing to publish', '“The draft is the same as the published state”.', 'There is no change.', 'Nothing to do.'],
    veraltet: ['Does not exist', '“This state no longer exists” or “This step is no longer there”.', 'The entry was deleted in the meantime or the view is old.', 'Reload Backstage.'],
    host: ['Wrong host', '“Wrong host”.', 'Backstage was opened through an address other than 127.0.0.1.', 'Use http://127.0.0.1:3213/backstage/.'],
    'chat-aus': ['Chat function not reachable', 'The online chat services do not answer.', 'The chat has its own tool (Chat team) and is not connected in this version; or there is no network.', 'Nothing to do in Backstage. The chat is set up in its own tool.'],
    skript: ['Script error in the browser', 'Backstage stays empty or a view does not load; the error log says “skript”.', 'An old version of backstage.js in the cache or an error in the interface.', 'Open Backstage with Shift + reload. If it stays, send the error log to Robert.'],
    kekse: ['Cookies blocked', 'Sign-in works, but the next click says “Please sign in” again.', 'The browser does not accept cookies from 127.0.0.1 (private window, strict setting).', 'Use a normal window or allow cookies for 127.0.0.1. Or create the file “offen”.'],
    medusa: ['Products in the Medusa panel', '“MEDUSA · Products, prices and categories are managed by the txtme team in the Medusa panel”.', 'Backstage shows the catalogue for reference only; it is changed in the team’s shop system (Medusa).', 'Change price, name, stock or category in the Medusa panel. Page texts, images, questions, press and details stay here.'],
    konflikt: ['Two windows', '“CONFLICT · Someone saved in another window in the meantime”.', 'Two windows (or two people) work on the same draft; the second save would overwrite the first.', 'The list is reloaded and your yellow entries stay: press Save again.'],
    herkunft: ['Foreign origin', '“ORIGIN · The request does not come from Backstage itself” (403).', 'A request came from another page or without Backstage’s mark (protection against foreign pages in the same browser).', 'Use Backstage at http://127.0.0.1:3213/backstage/; send nothing from other pages.'],
    zuviele: ['Too many requests', '“TOO MANY · Too many requests in one minute” (429).', 'More than 600 reads or 60 writes in one minute from one sender (protection against loops and scripts).', 'Wait a minute, then continue. If it stays, close test runs and open windows.'],
    rolle: ['Role without permission', '“ROLE · The role viewer may not do this” (403).', 'The signed-in person has the role Viewer (view only) or is not an admin (access, repairs).', 'Sign in with an Editor or Admin account; an admin assigns roles under Access.'],
    'bild-klein': ['Image too small', '“IMAGE · The image is only … pixels wide”.', 'The website needs at least 900 pixels width, better 2000; smaller images look blurry.', 'Export the original in a larger size and upload it again.'],
    'zu-lang': ['Text too long', '“INPUT · … is too long”.', 'A sentence of the website has more than 5000 characters, a Google text more than 120/400.', 'Shorten it; long texts belong in sections (Legal, Questions).'],
    'tel-format': ['Phone number wrong', '“The phone number may only contain digits, spaces, brackets and +”.', 'Letters or special characters in the field.', 'Format like +31 6 28 53 63 72.'],
    'datum-format': ['Date wrong', '“Choose the date as year-month-day” or “Until is before From”.', 'From/Until of the notice bar are not a valid date or in the wrong order.', 'Use the calendar in the field; “Until” after “From”.'],
    'pruefung-rot': ['Trial not passed', '“CHECK · …” or “VERIFY · …” when publishing; “The website is unchanged”.', 'The trial before switching found an error: a page does not end cleanly, has shrunk a lot, carries preview marks, or a change did not find its place (the site was rebuilt in the meantime).', 'Take back or redo the named place under “Changes”; after a rebuild of the website, repair “Rebuild the draft” (reads the inventory again). Nothing went onto the website.'],
    'zahlen-aus': ['No counting', '“NUMBERS · txtme.social counts nothing”.', 'Marouan wants no visitor statistics and no cookies; the view “Numbers” stays empty on purpose.', 'Nothing to do.'],
    'ki-aus': ['AI off', '“AI · Draft a reply is switched off in this version (ki=0)”.', 'No model and no key in this version; the connection stays in the code.', 'Robert decides on model and costs; until then write replies yourself.'],
    'aus-geht-nicht': ['Cannot hide here', '“HIDE · This sentence does not stand alone in its element”.', 'The sentence shares its element with a link or another text; hiding always hides the whole element, so it does not work here.', 'Change or shorten the sentence instead of hiding it.'],
  };
  const REP = {
    'Stand aus der Sicherung zurückholen': 'Restore state from the backup', 'Entwurf aus der Sicherung zurückholen': 'Restore draft from the backup', 'Leeren Stand anlegen': 'Create an empty state', 'Entwurf verwerfen': 'Discard the draft',
    'Entwurf neu bauen': 'Rebuild the draft', 'Veröffentlichte Seite neu bauen': 'Rebuild the published site', 'Liegengebliebene Bau-Ordner löschen': 'Delete leftover build folders', 'Nicht mehr benutzte Uploads löschen': 'Delete uploads no longer used', 'Fehlerprotokoll leeren': 'Clear the error log',
    'Holt stand.json aus der letzten guten Sicherung. Die beschädigte Datei bleibt als .kaputt liegen.': 'Restores stand.json from the last good backup. The damaged file is kept as .kaputt.', 'Holt entwurf.json aus der letzten guten Sicherung.': 'Restores entwurf.json from the last good backup.',
    'Legt eine leere stand.json an, falls sie fehlt. Ändert nichts Vorhandenes.': 'Creates an empty stand.json if it is missing. Changes nothing that exists.', 'Setzt den Entwurf auf den veröffentlichten Stand zurück. Offene Änderungen gehen verloren.': 'Resets the draft to the published state. Open changes are lost.',
    'Baut den Entwurf neu (10 bis 30 Sekunden).': 'Reads the inventory of the built pages again (the draft is laid over them on every request).', 'Baut die veröffentlichte Seite aus stand.json neu. Ändert keine Inhalte.': 'Sets the published pages again from stand.json. Changes no content.',
    'Löscht Ordner, die ein abgebrochener Bau hinterlassen hat.': 'Deletes folders left behind by an aborted run.', 'Löscht hochgeladene Bilder, die weder im Stand, noch im Entwurf, noch im Verlauf vorkommen.': 'Deletes uploaded images that appear neither in the state, nor in the draft, nor in the history.', 'Leert das Fehlerprotokoll auf dem Server.': 'Clears the error log on the server.',
  };
  const T = Object.assign({
    'Backstage-Server': 'Backstage server', 'Prüfung': 'Check', 'Seiten': 'Pages', 'Reparaturen': 'Repairs', 'Lexikon': 'Lexicon', 'Zurück zu Backstage': 'Back to Backstage', 'Läuft alles?': 'Is everything running?',
    'Diese Seite braucht nichts von Backstage. Sie prüft den Browser, fragt den Server und geht alle Seiten der Website durch. Läuft Backstage nicht, sagt sie, woran es liegt, und repariert das meiste mit einem Knopf.': 'This page needs nothing from Backstage. It checks the browser, asks the server and goes through every page of the website. If Backstage does not run, it says why and repairs most things with one button.',
    'Jetzt prüfen': 'Check now', 'noch nicht geprüft': 'not checked yet', 'prüft …': 'checking …', 'Alles läuft.': 'Everything is running.', '01 · Browser': '01 · Browser', '02 · Server und Daten': '02 · Server and data', '03 · Seiten der Website': '03 · Pages of the website',
    '04 · Reparaturen': '04 · Repairs', '05 · Fehlerprotokoll': '05 · Error log', '06 · Lexikon': '06 · Lexicon',
    'Jede Seite der veröffentlichten Fassung und des Entwurfs wird aufgerufen, dazu Stil, Skripte, Katalog und Chat-Dateien.': 'Every page of the published version is called, plus style, scripts, catalogue and chat files.',
    'Jede Reparatur fragt zweimal. Sie ändert nur, was sie sagt.': 'Every repair asks twice. It changes only what it says.', 'Was Backstage im Browser und auf dem Server an Fehlern gesehen hat, neueste zuerst.': 'The errors Backstage has seen in the browser and on the server, newest first.',
    'Jede bekannte Fehlerquelle: was man sieht, warum, was zu tun ist. Fehlermeldungen in Backstage führen mit «Was tun?» hierher.': 'Every known source of errors: what you see, why, what to do. Error messages in Backstage lead here with “What to do?”.',
    'Prüfung · Backstage txtme.social': 'Check · Backstage txtme.social', 'Verbindung': 'Connection', 'Der Browser hat eine Netzverbindung.': 'The browser has a network connection.', 'Kekse': 'Cookies',
    'Der Browser nimmt Kekse an (nötig für die Anmeldung, wenn ein Passwort gesetzt ist).': 'The browser accepts cookies (needed for signing in once a password is set).', 'Speicher im Browser': 'Browser storage',
    'Backstage kann sich Fehler im Browser merken (für diese Seite).': 'Backstage can remember errors in the browser (for this page).', 'Adresse': 'Address', 'Fehler, die Backstage im Browser gesehen hat': 'Errors Backstage has seen in the browser', 'Keine.': 'None.',
    'Diese Prüfseite': 'This check page', 'Lädt und läuft.': 'Loads and runs.', 'Fragt den Server …': 'Asking the server …', 'Fehlerprotokoll': 'Error log', 'Keine Fehler protokolliert.': 'No errors logged.',
    'Veröffentlichte Seite (/)': 'Published site (/)', 'Ruft die Seiten auf …': 'Calling the pages …', 'Produktseiten': 'Product pages', 'Ruft jede Produktseite auf …': 'Calling every product page …', 'Fragt …': 'Asking …',
    'Chat-Funktion (online)': 'Chat function (online)', 'Fragen-Speicher (online)': 'Question store (online)', 'Ausführen': 'Run', 'Wirklich? Noch einmal klicken': 'Really? Click again', 'Läuft …': 'Running …', 'Fertig.': 'Done.',
    'Sehen': 'You see', 'Grund': 'Why', 'Tun': 'What to do', 'Was tun?': 'What to do?', 'löschen': 'clear',
    'Der Browser meldet: kein Netz. Backstage läuft am Rechner trotzdem, Chat, Zahlen und Eingang nicht.': 'The browser reports: no network. Backstage still runs on this computer.',
  }, REP);
  const M = [
    [/^Aufgerufen über (\S+)\. So soll es sein\.$/, m => `Opened via ${m[1]}. That is how it should be.`], [/^Aufgerufen über (\S+)\. (.*)$/, m => `Opened via ${m[1]}. Use 127.0.0.1.`],
    [/^Antwortet in ([\d.]+) s\. Ohne Passwort offen\.$/, m => `Answers in ${m[1]} s. Open without a password.`], [/^Antwortet in ([\d.]+) s\. Mit Passwort\.$/, m => `Answers in ${m[1]} s. With password.`],
    [/^Der Server antwortet nicht: (.*)$/, m => `The server does not answer: ${m[1]}`], [/^Alle (\d+) Adressen antworten, jede Seite mit Titel und Chat\.$/, m => `All ${m[1]} addresses answer, every page with a title.`],
    [/^Alle (\d+) Produktseiten antworten, jedes Bild ist da\.$/, m => `All ${m[1]} product pages answer, every image is there.`], [/^(\d+) von (\d+) in Ordnung\. Nicht in Ordnung: (.*)$/, m => `${m[1]} of ${m[2]} fine. Not fine: ${m[3]}`],
    [/^Nicht in Ordnung: (.*)$/, m => `Not fine: ${m[1]}`], [/^Nicht erreichbar: (.*)$/, m => `Not reachable: ${m[1]}`], [/^Katalog nicht lesbar: (.*)$/, m => `Catalogue not readable: ${m[1]}`],
    [/^(\d+) rot, (\d+) gelb: oben nachsehen\.$/, m => `${m[1]} red, ${m[2]} yellow: see above.`], [/^Alles läuft, (\d+) Hinweise?\.$/, m => `Everything is running, ${m[1]} note${m[1] === '1' ? '' : 's'}.`],
    [/^Geprüft (.+)$/, m => `Checked ${m[1]}`], [/^(\d+) gemerkt, der letzte: (.*)$/, m => `${m[1]} remembered, the last: ${m[2]}`], [/^Reparatur unten: «(.*)»$/, m => `Repair below: “${REP[m[1]] || m[1]}”`],
    [/^bei (.*) · $/, m => `at ${m[1]} · `], [/^Nicht ausgeführt: (.*)$/, m => `Not run: ${m[1]}`], [/^Fehler beim Laden der Prüfseite: (.*)$/, m => `Error while loading the check page: ${m[1]}`],
  ];
  const fertig = new WeakSet();
  function um(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (fertig.has(n)) continue; const k = n.nodeValue.trim(); if (!k) continue;
      let neu = T[k]; if (neu === undefined) for (const [re, f] of M) { const m = k.match(re); if (m) { neu = f(m); break; } }
      if (neu !== undefined) n.nodeValue = n.nodeValue.replace(k, neu); fertig.add(n);
    }
  }
  function lexikon() {
    Object.entries(LEX).forEach(([id, [t, sehen, grund, tun]]) => {
      const d = document.getElementById(id); if (!d || d.dataset.en) return; d.dataset.en = '1';
      const s = d.querySelector('summary span'); if (s) s.textContent = t;
      const c = d.querySelector('summary code'); if (c) c.hidden = true;   /* der Schlüssel ist deutsch und nur der Sprungpunkt (#id), auf Englisch nicht zeigen */
      const dd = d.querySelectorAll('dd'); if (dd.length >= 3) { dd[0].textContent = sehen; dd[1].textContent = grund; dd[2].textContent = tun; }
    });
  }
  let uhr = 0;
  const lauf = () => { lexikon(); document.querySelectorAll('#p-lexikon summary code').forEach(c => { c.hidden = true; }); um(document.body); };
  new MutationObserver(() => { clearTimeout(uhr); uhr = setTimeout(lauf, 0); }).observe(document.body, { childList: true, subtree: true, characterData: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lauf); else lauf();
  /* Datum der Prüfung englisch */
  const zt = document.getElementById('zeit'); if (zt) new MutationObserver(() => { const m = zt.textContent.match(/^Geprüft (.+)$/); if (m) zt.textContent = 'Checked ' + new Date().toLocaleString('en-GB'); }).observe(zt, { childList: true });
})();
