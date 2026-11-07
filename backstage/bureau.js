/* Bureau-Ergänzungen zu Backstage · txtme.social (Le Bureau, Master 4.2 und Rahmen R01–R24). Lädt nach backstage.js, baut nichts um, hängt sich an:
   Kopfleiste (R05), Startbild mit Gruss (R16), Leiste mit «n Eingaben nicht gespeichert» + Cmd/Ctrl+S + Nachfrage beim Verlassen (R08/R09/R13),
   Veröffentlichen mit Schritten, «Ist online.» / «Nicht veröffentlicht.» (R12), Konflikt bei zwei Fenstern (L13), Vorher durchgestrichen / Nachher markiert (K),
   Frühere Fassungen mit «Ursprünglicher Stand» und Beispielen (R14/R20), Hinweis-Leiste (H), Sprachen (J), Bildarchiv mit Suche und Hochladen (D),
   Angaben «steht n× auf m Seiten» (E), Google-Zähler 60/155 mit Vorschau (I), Benutzer und Rollen (5.3), Rundgang (R18), «Zur Werkbank» (R19),
   Klick in der Vorschau öffnet die Stelle (C), Sprache der Oberfläche Englisch/Deutsch (R24, Auftrag Regel 3). */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
  const Q = new URLSearchParams(location.search);
  const lesen = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const merken = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* privat */ } };
  let SP = lesen('bs_sprache') || (Q.get('lang') === 'de' ? 'de' : Q.get('lang') === 'en' ? 'en' : 'en');
  if (Q.get('lang')) merken('bs_sprache', SP);
  const EN = SP === 'en';

  /* ---------- Wörterbuch: eigene Texte (de/en) ---------- */
  const W = {
    de: {
      website: 'Website · txtme.social', pruefung: 'Prüfung', anleitung: 'Anleitung', ansehen: 'Website ansehen', entwurf_ansehen: 'Entwurf ansehen', sprache: 'English',
      im_entwurf: n => `${n} im Entwurf`, veroeff: d => 'Veröffentlicht ' + d, wie_gebaut: 'Wie gebaut', morgen: 'Guten Morgen.', tag: 'Guten Tag.', abend: 'Guten Abend.',
      was_heute: 'Was ändern wir heute?', offen_n: n => `${n} Eingabe${n > 1 ? 'n' : ''} nicht gespeichert`, speichern: 'Speichern', erst_speichern: 'Erst speichern', erst_speichern_t: 'Es gibt Eingaben, die noch nicht gespeichert sind. Speichern legt sie in den Entwurf, dann lässt sich veröffentlichen.',
      jetzt_speichern: 'Jetzt speichern', verlassen: 'Es gibt Eingaben, die nicht gespeichert sind.',
      pub_titel: 'Veröffentlichen', pub_satz: n => `${n} Änderung${n === 1 ? ' geht' : 'en gehen'} auf die Website. Vorher wird alles auf einer Probe gesetzt und geprüft; der jetzige Stand kommt in den Verlauf.`,
      notiz: 'Notiz zu dieser Veröffentlichung (für den Verlauf)', notiz_bsp: 'zum Beispiel: neue Frage zum Versand', verlauf_bleibt: 'Jeder frühere Stand bleibt im Verlauf und lässt sich zurückholen.',
      vorher_nachher: 'Vorher/Nachher', abbrechen: 'Abbrechen', jetzt_pub: 'Jetzt veröffentlichen', wird_pub: 'Wird veröffentlicht …', ist_online: 'Ist online.', online_satz: (n, d) => `${n} Änderung${n === 1 ? ' ist' : 'en sind'} auf der Website, ${d} Dateien gesetzt und Byte für Byte nachgeprüft.`,
      nicht_pub: 'Nicht veröffentlicht.', unveraendert: 'Die Website ist unverändert. Der Entwurf ist noch da.', was_tun: 'Was tun?', fertig: 'Fertig', schliessen: 'Schliessen', hinweise: 'Hinweise',
      konflikt: 'In einem anderen Fenster wurde gespeichert. Die Liste ist neu geladen, die gelben Eingaben bleiben.',
      vorher: 'Vorher', nachher: 'Nachher', beispiel: 'Beispiel', so_sieht: 'So sieht das aus, sobald etwas im Entwurf liegt:', bsp_aend: [['Text auf /about/', 'Worn in real life.', 'Worn in real life, not for the feed.'], ['Hinweis-Leiste', '', 'Free shipping this week'], ['Bild auf /merch/', 'piece-tee-front.webp', 'tee-front-2026.webp']],
      ursprung: 'Ursprünglicher Stand', ursprung_t: 'Die Website, wie Tasty Studios sie gebaut hat, ohne jede Änderung in Backstage.', holen: 'In den Entwurf holen', holen_frage: 'Ursprünglichen Stand in den Entwurf holen?', holen_t: 'Der jetzige Entwurf wird ersetzt. Die Website bleibt, bis du veröffentlichst.', holen_kn: 'Holen',
      verlauf_bsp: 'Noch nichts veröffentlicht. Nach der ersten Veröffentlichung steht hier jede Fassung, die neueste oben. So sieht das dann aus:',
      bsp_verlauf: [['3 Änderungen · neue Frage zum Versand, Hinweis-Leiste', 'Neueste'], ['1 Änderung · Foto auf der Startseite getauscht', ''], ['5 Änderungen · FAQ Versand, Impressum', '']],
      von: 'von',
      hw_nav: 'Hinweis-Leiste', hw_titel: 'Ein Satz <span class="soft">oben auf jeder Seite.</span>', hw_satz: 'Ein Band über dem Kopf der Website: Versandpause, neuer Drop, ein Abend. Mit Zeitraum erscheint und verschwindet es von selbst. Erst im Entwurf, auf der Website nach dem Veröffentlichen.',
      hw_an: 'Hinweis-Leiste zeigen', hw_text: 'Text (Englisch)', hw_text_bsp: 'Free shipping on all orders until Sunday.', hw_link: 'Link (freiwillig)', hw_link_bsp: '/merch/ oder https://…', hw_lt: 'Linktext', hw_lt_bsp: 'Shop now', hw_von: 'Ab (freiwillig)', hw_bis: 'Bis (freiwillig)',
      hw_farbe: 'Farbe', hw_groesse: 'Grösse', farben: [['ink', 'Schwarz'], ['bone', 'Knochenweiss'], ['brand', 'Türkis → Pink'], ['cyan', 'Türkis'], ['pink', 'Pink']], groessen: [['klein', 'Klein'], ['mittel', 'Mittel'], ['gross', 'Gross']],
      hw_so: 'So sieht es aus', hw_leer: 'Noch kein Text: so sähe die Leiste aus. Sie steht oben auf jeder Seite, über dem Menü.', hw_aus: 'Ausgeschaltet: steht noch nirgends. Oben «Hinweis-Leiste zeigen» einschalten.', hw_zeit: (v, b) => `Steht oben auf jeder Seite${v ? ' ab ' + v : ''}${b ? ' bis ' + b : ''}.`, hw_immer: 'Steht oben auf jeder Seite, sobald du veröffentlichst.',
      sp_nav: 'Sprachen', sp_titel: 'Englisch zuerst, <span class="soft">Deutsch dazu.</span>', sp_satz: 'Die Website steht auf Englisch. Jeder Text, den du änderst, steht hier mit einem Feld für die deutsche Fassung (die deutsche Arbeitsfassung des Shops). Nichts wird geraten: leer bleibt leer.',
      sp_leer: 'Nichts zu übersetzen. Sobald du einen Text änderst und speicherst, steht er hier mit einem Feld je Sprache. So sieht das dann aus:', sp_bsp_en: 'Free shipping on all orders until Sunday.', sp_bsp_de: 'Versandkostenfrei bis Sonntag.', sp_de: 'Deutsch', sp_wo: 'Wo:', sp_vorher: 'Vorher', sp_platz: 'steht englisch, bis hier etwas steht',
      bib_nav: 'Bildarchiv', bib_titel: 'Alle Bilder <span class="soft">der Website.</span>', bib_satz: 'Jedes Bild aus dem Fundus der Website und alles, was du hochlädst, mit Mass und Seiten. Suchen, ansehen, hochladen; zum Tauschen auf einer Seite gibt es dort den Knopf «Archiv».',
      bib_suche: 'Bilder suchen: shoot, product, hero …', bib_hoch: 'Eigenes Bild hochladen', bib_hoch_t: 'JPG, PNG oder WebP, mindestens 900 Pixel breit, höchstens 25 MB. Wird als WebP neu gesetzt (2000 / 1400 / 900).', bib_eigen: 'Hochgeladen', bib_alle: 'Alle', bib_benutzt: n => `auf ${n} Seite${n === 1 ? '' : 'n'}`, bib_unbenutzt: 'nicht auf den Seiten', bib_leer: 'Nichts gefunden.',
      bib_waehlen: 'Bild wählen', bib_waehlen_t: src => `Ersetzt ${src} überall, wo es vorkommt. Erst im Entwurf.`, uebernehmen: 'Übernehmen', archiv: 'Archiv', hochgeladen: (w, hh) => `Hochgeladen: ${w} × ${hh} Pixel, jetzt im Bildarchiv.`,
      steht: (n, m) => n ? `steht ${n}× auf ${m} Seite${m === 1 ? '' : 'n'}` : 'steht so auf keiner Seite (leer im Code)',
      zaehler: (n, max) => `${n}/${max}`, google_vor: 'So erscheint es bei Google', medusa: 'Produkte, Preise und Kategorien pflegt das txtme-Team im Medusa-Panel. Diese Liste zeigt den Katalog nur zum Nachsehen.',
      rollen_titel: 'Benutzer und Rollen', rollen_satz: 'admin: alles, auch Zugang und Reparaturen · redaktion: ändern und veröffentlichen · lesen: nur ansehen. Solange kein Benutzer angelegt ist, ist Backstage ohne Passwort offen (bis zur Auslieferung).',
      name: 'Name', rolle: 'Rolle', seit: 'Seit', weg: 'Löschen', neu_benutzer: 'Benutzer anlegen', passwort: 'Passwort (mindestens 8 Zeichen)', anlegen: 'Anlegen', du: 'Du', angemeldet_als: (n, r) => `Angemeldet als ${n} (${r})`, offen_als: 'Offen, ohne Passwort (Rolle admin an diesem Rechner)',
      benutzer_weg: n => `Benutzer «${n}» löschen?`, benutzer_weg_t: 'Die Person kann sich danach nicht mehr anmelden.', anmelden: 'Anmelden', anmelden_satz: 'Das Kontrollpanel von txtme.social. Bitte anmelden.', einrichten_satz: 'Das Kontrollpanel von txtme.social. Beim ersten Mal legst du ein Passwort fest.', pw: 'Passwort', pw_neu: 'Neues Passwort (mindestens 8 Zeichen)', pw_setzen: 'Passwort setzen',
      rundgang: [['Bereiche', 'Links liegen die Bereiche: Seiten und Texte, Bilder, Fragen, Presse, Angaben, Rechtliches. Produkte und Preise bleiben im Medusa-Panel.'], ['Entwurf', 'Alles, was du speicherst, landet erst im Entwurf. Die Website ändert sich noch nicht.'], ['Vorher, nachher', 'Jede Änderung siehst du Seite für Seite nebeneinander, bevor sie auf die Website geht.'], ['Veröffentlichen', 'Ein Knopf setzt alles auf einer Probe, prüft es und schaltet dann um. Der alte Stand bleibt im Verlauf.'], ['Prüfung', 'Läuft etwas nicht, sagt die Prüfung woran es liegt, mit Reparatur und Lexikon.']],
      rundgang_menue: 'Hinter «Menü» liegen die Bereiche: Seiten und Texte, Bilder, Fragen, Presse, Angaben, Rechtliches. Produkte und Preise bleiben im Medusa-Panel.',
      weiter: 'Weiter', rundgang_zu: 'Rundgang beenden', rundgang_kn: 'Kurzer Rundgang', schritt: (i, n) => `${i} von ${n}`, zur_werkbank: 'Zur Werkbank',
      stelle_nicht: 'Diese Stelle steht nicht in der Liste dieser Seite.', zum_bereich: 'Dieser Satz gehört zu', ok: 'OK',
      teils_online: 'Teilweise online.', nichts_online: 'Auf der Website hat sich nichts geändert.', seiten_neu: n => `${n} Seite${n === 1 ? '' : 'n'} der Website ${n === 1 ? 'ist' : 'sind'} neu gesetzt.`,
      nichts_satz: 'Gespeichert und im Verlauf, aber keine dieser Änderungen steht auf einer gebauten Seite:', nicht_auf: 'Nicht auf der Website', kommt_nicht: 'Kommt so nicht auf die Website',
      antwortet_nicht: 'Backstage antwortet nicht mehr. Ob veröffentlicht wurde, zeigt der Verlauf, sobald der Server wieder läuft.', keine_antwort: 'Keine Antwort von Backstage.',
      aus_versand: 'Auf die Website kommt hier nur die Rückgabefrist (Seite «Shipping & Payments» und jede Produktseite). Versandkosten, Versandkostenfrei ab, Bearbeitung, Versichert und Länder werden gespeichert, stehen aber auf keiner Seite; die Seite behält ihren Wortlaut. Bei den Zahlarten kommen Name, Hinweis und Länder auf die Seite, das Ausschalten nicht.',
      aus_fragen: 'Geänderte Fragen und Antworten kommen auf die Support-Seite. Neue Fragen und Gruppen, gelöschte und eine neue Reihenfolge werden gespeichert, kommen aber nicht auf die Website. Deutsche Fragen erscheinen nicht, die Website steht auf Englisch.',
      aus_presse: 'Geänderte Meldungen und Material kommen auf die Presse-Seite. Neue, gelöschte und eine neue Reihenfolge werden gespeichert, kommen aber nicht auf die Website. Deutsche Meldungen erscheinen nicht.',
      aus_recht: 'Geänderter Wortlaut von Überschriften, Absätzen und Listenpunkten kommt auf die Seite; die Nummer vor der Überschrift setzt die Website selbst. Neue oder gelöschte Abschnitte, Absätze und Listenpunkte werden gespeichert, kommen aber nicht auf die Website.',
      aus_sprachen: 'Deutsche Fassungen werden gespeichert, aber die Website steht nur auf Englisch: sie erscheinen nirgends.',
      ausblenden: 'Ausblenden', zeigen: 'Wieder zeigen', ausgeblendet: 'ausgeblendet', geraet_rechner: 'Rechner 1440', geraet_handy: 'Handy 390', live_vorschau: 'So steht es auf der Seite, während du tippst',
      zahlen_satz: 'txtme.social zählt nichts: keine Besucher-Auswertung, keine Kekse, keine Zähler (Entscheidung Marouan). Diese Ansicht bleibt bewusst leer.', zahlen_kachel: 'Keine Zählung (Entscheidung Marouan).', keine: 'keine',
      prod_satz: 'Produkte, Preise, Bestand und Kategorien pflegt das txtme-Team im Medusa-Panel. Hier steht der Katalog nur zum Nachsehen, nichts lässt sich ändern.', prod_folgt: 'Preis folgt', prod_kein_bild: 'kein Bild', prod_leer: 'noch leer', prod_bald: 'erscheint auf der Seite als «bald»', prod_zurueck: 'Alle Produkte', prod_nicht: 'Dieses Produkt gibt es nicht.', prod_ausgeblendet: 'ausgeblendet',
      groessen_t: 'Grössen', farben_t: 'Farben', kategorie: 'Kategorie', preis: 'Preis', datum_waehlen: 'Datum wählen', kein_datum: 'kein Datum', heute: 'Heute', leeren: 'Leeren',
      rolle_name: { admin: 'Admin', redaktion: 'Redaktion', lesen: 'Lesen' },
    },
    en: {
      website: 'Website · txtme.social', pruefung: 'Check', anleitung: 'Guide', ansehen: 'View website', entwurf_ansehen: 'View draft', sprache: 'Deutsch',
      im_entwurf: n => `${n} in the draft`, veroeff: d => 'Published ' + d, wie_gebaut: 'As built', morgen: 'Good morning.', tag: 'Good afternoon.', abend: 'Good evening.',
      was_heute: 'What are we changing today?', offen_n: n => `${n} unsaved ${n > 1 ? 'entries' : 'entry'}`, speichern: 'Save', erst_speichern: 'Save first', erst_speichern_t: 'There are entries that are not saved yet. Saving puts them in the draft; then you can publish.',
      jetzt_speichern: 'Save now', verlassen: 'There are unsaved entries.',
      pub_titel: 'Publish', pub_satz: n => `${n} change${n === 1 ? ' goes' : 's go'} to the website. Everything is set on a trial copy and checked first; the current state goes to the history.`,
      notiz: 'Note for this release (for the history)', notiz_bsp: 'for example: new shipping question', verlauf_bleibt: 'Every earlier state stays in the history and can be brought back.',
      vorher_nachher: 'Before / after', abbrechen: 'Cancel', jetzt_pub: 'Publish now', wird_pub: 'Publishing …', ist_online: 'It is online.', online_satz: (n, d) => `${n} change${n === 1 ? ' is' : 's are'} on the website, ${d} files set and verified byte by byte.`,
      nicht_pub: 'Not published.', unveraendert: 'The website is unchanged. Your draft is still there.', was_tun: 'What to do?', fertig: 'Done', schliessen: 'Close', hinweise: 'Notes',
      konflikt: 'Someone saved in another window. The list has been reloaded; your yellow entries stay.',
      vorher: 'Before', nachher: 'After', beispiel: 'Example', so_sieht: 'This is what it looks like once something is in the draft:', bsp_aend: [['Text on /about/', 'Worn in real life.', 'Worn in real life, not for the feed.'], ['Notice bar', '', 'Free shipping this week'], ['Image on /merch/', 'piece-tee-front.webp', 'tee-front-2026.webp']],
      ursprung: 'Original state', ursprung_t: 'The website as Tasty Studios built it, without any change made in Backstage.', holen: 'Load into draft', holen_frage: 'Load the original state into the draft?', holen_t: 'The current draft is replaced. The website stays as it is until you publish.', holen_kn: 'Load',
      verlauf_bsp: 'Nothing published yet. After the first release every version is listed here, newest first. It will look like this:',
      bsp_verlauf: [['3 changes · new shipping question, notice bar', 'Latest'], ['1 change · photo on the home page swapped', ''], ['5 changes · FAQ shipping, imprint', '']],
      von: 'by',
      hw_nav: 'Notice bar', hw_titel: 'One line <span class="soft">on top of every page.</span>', hw_satz: 'A bar above the website header: shipping pause, new drop, an evening. With a date range it appears and disappears by itself. In the draft first, on the website after publishing.',
      hw_an: 'Show the notice bar', hw_text: 'Text (English)', hw_text_bsp: 'Free shipping on all orders until Sunday.', hw_link: 'Link (optional)', hw_link_bsp: '/merch/ or https://…', hw_lt: 'Link text', hw_lt_bsp: 'Shop now', hw_von: 'From (optional)', hw_bis: 'Until (optional)',
      hw_farbe: 'Colour', hw_groesse: 'Size', farben: [['ink', 'Black'], ['bone', 'Bone white'], ['brand', 'Cyan → pink'], ['cyan', 'Cyan'], ['pink', 'Pink']], groessen: [['klein', 'Small'], ['mittel', 'Medium'], ['gross', 'Large']],
      hw_so: 'Preview', hw_leer: 'No text yet: this is what the bar would look like. It sits on top of every page, above the menu.', hw_aus: 'Switched off: shown nowhere yet. Turn on “Show the notice bar” above.', hw_zeit: (v, b) => `Shown on top of every page${v ? ' from ' + v : ''}${b ? ' until ' + b : ''}.`, hw_immer: 'Shown on top of every page as soon as you publish.',
      sp_nav: 'Languages', sp_titel: 'English first, <span class="soft">German alongside.</span>', sp_satz: 'The website is in English. Every text you change is listed here with a field for the German version (the German working build of the shop). Nothing is guessed: empty stays empty.',
      sp_leer: 'Nothing to translate. As soon as you change a text and save it, it appears here with a field per language. It will look like this:', sp_bsp_en: 'Free shipping on all orders until Sunday.', sp_bsp_de: 'Versandkostenfrei bis Sonntag.', sp_de: 'German', sp_wo: 'Where:', sp_vorher: 'Before', sp_platz: 'stays English until something is entered here',
      bib_nav: 'Image archive', bib_titel: 'All images <span class="soft">of the website.</span>', bib_satz: 'Every image from the website’s collection and everything you upload, with size and pages. Search, inspect, upload; to swap an image on a page use the “Archive” button there.',
      bib_suche: 'Search images: shoot, product, hero …', bib_hoch: 'Upload an image', bib_hoch_t: 'JPG, PNG or WebP, at least 900 pixels wide, up to 25 MB. Re-encoded as WebP (2000 / 1400 / 900).', bib_eigen: 'Uploaded', bib_alle: 'All', bib_benutzt: n => `on ${n} page${n === 1 ? '' : 's'}`, bib_unbenutzt: 'not on the pages', bib_leer: 'Nothing found.',
      bib_waehlen: 'Choose an image', bib_waehlen_t: src => `Replaces ${src} everywhere it appears. In the draft first.`, uebernehmen: 'Use this image', archiv: 'Archive', hochgeladen: (w, hh) => `Uploaded: ${w} × ${hh} pixels, now in the image archive.`,
      steht: (n, m) => n ? `appears ${n}× on ${m} page${m === 1 ? '' : 's'}` : 'appears on no page (empty in the code)',
      zaehler: (n, max) => `${n}/${max}`, google_vor: 'How it appears on Google', medusa: 'Products, prices and categories are managed by the txtme team in the Medusa panel. This list shows the catalogue for reference only.',
      rollen_titel: 'Users and roles', rollen_satz: 'Admin: everything, including access and repairs · Editor: edit and publish · Viewer: view only. As long as no user exists, Backstage is open without a password (until hand-over).',
      name: 'Name', rolle: 'Role', seit: 'Since', weg: 'Delete', neu_benutzer: 'Add a user', passwort: 'Password (at least 8 characters)', anlegen: 'Add', du: 'You', angemeldet_als: (n, r) => `Signed in as ${n} (${r})`, offen_als: 'Open, no password (role admin on this computer)',
      benutzer_weg: n => `Delete user “${n}”?`, benutzer_weg_t: 'This person can no longer sign in afterwards.', anmelden: 'Sign in', anmelden_satz: 'The control panel of txtme.social. Please sign in.', einrichten_satz: 'The control panel of txtme.social. The first time, you set a password.', pw: 'Password', pw_neu: 'New password (at least 8 characters)', pw_setzen: 'Set password',
      rundgang: [['Sections', 'On the left are the sections: pages and texts, images, questions, press, details, legal. Products and prices stay in the Medusa panel.'], ['Draft', 'Everything you save lands in the draft first. The website does not change yet.'], ['Before, after', 'You see every change page by page, side by side, before it goes to the website.'], ['Publish', 'One button sets everything on a trial copy, checks it, then switches. The old state stays in the history.'], ['Check', 'If something does not work, the check page says why, with repairs and a glossary.']],
      rundgang_menue: 'Behind “Menu” are the sections: pages and texts, images, questions, press, details, legal. Products and prices stay in the Medusa panel.',
      weiter: 'Next', rundgang_zu: 'End the tour', rundgang_kn: 'Short tour', schritt: (i, n) => `${i} of ${n}`, zur_werkbank: 'Back to the workbench',
      stelle_nicht: 'This text is not in the list of this page.', zum_bereich: 'This sentence belongs to', ok: 'OK',
      teils_online: 'Partly online.', nichts_online: 'Nothing changed on the website.', seiten_neu: n => `${n} page${n === 1 ? '' : 's'} of the website ${n === 1 ? 'is' : 'are'} set anew.`,
      nichts_satz: 'Saved and in the history, but none of these changes appears on a built page:', nicht_auf: 'Not on the website', kommt_nicht: 'Does not reach the website like this',
      antwortet_nicht: 'Backstage is no longer answering. Whether it was published shows in the history as soon as the server runs again.', keine_antwort: 'No answer from Backstage.',
      aus_versand: 'Only the return period reaches the website here (page “Shipping & Payments” and every product page). Shipping cost, free shipping from, handling, insured and countries are saved but appear on no page; the page keeps its wording. For payment methods, name, note and countries reach the page; switching one off does not.',
      aus_fragen: 'Changed questions and answers go onto the support page. New questions and groups, deleted ones and a new order are saved but do not reach the website. German questions do not appear; the website is in English.',
      aus_presse: 'Changed press releases and material go onto the press page. New, deleted ones and a new order are saved but do not reach the website. German releases do not appear.',
      aus_recht: 'Changed wording of headings, paragraphs and list items goes onto the page; the website sets the number in front of a heading itself. New or deleted sections, paragraphs and list items are saved but do not reach the website.',
      aus_sprachen: 'German versions are saved, but the website is in English only: they appear nowhere.',
      ausblenden: 'Hide', zeigen: 'Show again', ausgeblendet: 'hidden', geraet_rechner: 'Desktop 1440', geraet_handy: 'Phone 390', live_vorschau: 'How it reads on the page while you type',
      zahlen_satz: 'txtme.social counts nothing: no visitor statistics, no cookies, no counters (Marouan’s decision). This view stays empty on purpose.', zahlen_kachel: 'No counting (Marouan’s decision).', keine: 'none',
      prod_satz: 'Products, prices, stock and categories are managed by the txtme team in the Medusa panel. The catalogue is shown here for reference only; nothing can be changed.', prod_folgt: 'Price to follow', prod_kein_bild: 'no image', prod_leer: 'empty so far', prod_bald: 'shows on the site as “soon”', prod_zurueck: 'All products', prod_nicht: 'This product does not exist.', prod_ausgeblendet: 'hidden',
      groessen_t: 'Sizes', farben_t: 'Colours', kategorie: 'Category', preis: 'Price', datum_waehlen: 'Choose a date', kein_datum: 'no date', heute: 'Today', leeren: 'Clear',
      rolle_name: { admin: 'Admin', redaktion: 'Editor', lesen: 'Viewer' },
    },
  };
  const t = (k, ...a) => { const v = (W[SP] || W.de)[k]; return typeof v === 'function' ? v(...a) : (v === undefined ? k : v); };

  /* ---------- Übersetzungs-Schicht für die bestehende Oberfläche (Deutsch → Englisch), nur Text, kein Umbau ---------- */
  const UE = {
    'Übersicht': 'Overview', 'Änderungen': 'Changes', 'Shop': 'Shop', 'Produkte': 'Products', 'Versand & Zahlung': 'Shipping & payment', 'Seiten': 'Pages', 'Seiten & Texte': 'Pages & texts', 'Bilder': 'Images',
    'Fragen & Antworten': 'Questions & answers', 'Presse': 'Press', 'Google & Teilen': 'Google & sharing', 'Firma': 'Company', 'Angaben': 'Details', 'Rechtliches': 'Legal', 'Draußen': 'Outside', 'Zahlen': 'Numbers', 'Im Chat': 'In the chat', 'Eingang': 'Inbox',
    'Werkzeug': 'Tool', 'Verlauf': 'History', 'Zugang': 'Access', 'Entwurf ansehen': 'View draft', 'Website ansehen': 'View website', 'Prüfung': 'Check', 'Backstage lädt …': 'Backstage is loading …', 'Prüfung öffnen': 'Open the check',
    'noch nichts veröffentlicht': 'nothing published yet', 'Liste': 'List', 'Veröffentlichen': 'Publish', 'Entwurf wird gebaut …': 'Draft is being built …', 'Entwurf und Website sind gleich': 'Draft and website are the same',
    'im Entwurf, noch nicht veröffentlicht': 'in the draft, not published yet', 'Bau fehlgeschlagen.': 'Build failed.',
    'Hier pflegst du den Shop und die Seiten von txtme.social selbst: Produkte, Texte, Bilder, Fragen, Presse, Versand, Angaben. Alles landet erst im Entwurf, dann auf der Seite.': 'Here you maintain the pages of txtme.social yourself: texts, images, questions, press, shipping, details. Everything lands in the draft first, then on the site. Products and prices stay in the Medusa panel.',
    'Entwurf': 'Draft', 'Änderung': 'change', 'noch nicht veröffentlicht': 'not published yet', 'Liste und Veröffentlichen →': 'List and publish →', 'im Shop': 'in the shop', 'Name, Preis, Text, Größen, Farben, Bestand, Bilder, Sichtbarkeit.': 'Catalogue for reference; managed by the txtme team in the Medusa panel.',
    'Produkte →': 'Products →', 'Jeder Satz auf jeder Seite, an einer Stelle oder überall.': 'Every sentence on every page, in one place or everywhere.', 'Seiten & Texte →': 'Pages & texts →', 'Zahlen · 7 Tage': 'Numbers · 7 days', 'Aufrufe': 'Views', 'Zahlen gerade nicht erreichbar.': 'No counting: txtme has no analytics.',
    'Zahlen →': 'Numbers →', 'offen': 'open', 'Fragen, die der Chat nicht aus der Seite beantworten konnte. Mit einem Klick zur Frage & Antwort.': 'Questions the chat could not answer from the site. One click turns them into a FAQ entry.', 'Fragen →': 'Questions →', 'Stände': 'releases',
    'Jede Veröffentlichung bleibt und lässt sich zurückholen.': 'Every release stays and can be brought back.', 'Verlauf →': 'History →', 'Zuletzt geändert': 'Last changed', 'So geht es': 'How it works',
    'Ändern, speichern, im Entwurf ansehen, Vorher/Nachher prüfen, veröffentlichen. Was du speicherst, siehst nur du im Entwurf. Erst «Veröffentlichen» ändert die Seite. Online geht der neue Stand beim nächsten Hochladen (das macht Robert, bis die Seite bei euch liegt).': 'Change, save, view the draft, check before/after, publish. What you save is visible only in the draft. Only “Publish” changes the site. The new state goes online with the next upload (Robert does that until the site lives with you).',
    'Anleitung': 'Guide', 'Jede Zeile ist eine Stelle, die sich vom veröffentlichten Stand unterscheidet. Ansehen, zurücknehmen oder alles zusammen veröffentlichen.': 'Every line is a place that differs from the published state. View it, take it back, or publish everything together.',
    'Alles verwerfen': 'Discard all', 'Ansehen': 'View', 'Rückgängig': 'Undo', 'Nichts offen. Entwurf und Website sind gleich.': 'Nothing open. Draft and website are the same.', 'Der Entwurf liegt unter': 'The draft lives at', 'und ist nur hier am Rechner zu sehen. Die Website ändert sich erst beim Veröffentlichen.': 'and is visible only on this computer. The website changes only when you publish.',
    'Alles verwerfen?': 'Discard everything?', 'Verwerfen': 'Discard', 'Zurücknehmen?': 'Take back?', 'Zurücknehmen': 'Take back', 'Abbrechen': 'Cancel',
    'Tippe ein Produkt an, um Name, Preis, Text, Größen, Farben, Bestand und Bilder zu ändern. Neue Stücke legst du mit «Neu anlegen» an.': 'Tap a product to see name, price, text, sizes, colours, stock and images. Changes are made in the Medusa panel.', 'Neu anlegen': 'Add new', 'Kategorien': 'Categories', 'noch leer': 'still empty', 'Speichern': 'Save', 'Gespeichert': 'Saved', 'Nichts zu speichern': 'Nothing to save',
    'Tippe eine Seite an. Dort stehen alle Texte in Leserichtung; jeden kannst du ändern, an dieser Stelle oder überall, wo er vorkommt. Preise, Produktnamen, Fragen und Angaben haben eigene Bereiche.': 'Tap a page. All its texts are listed in reading order; each can be changed in this place or everywhere it appears. Prices, product names, questions and details have their own sections.',
    'Die Texte kommen aus dem gebauten Entwurf.': 'The texts come from the built site.', 'Der Entwurf ist noch nicht gebaut, die Texte kommen aus der veröffentlichten Seite.': 'The texts come from the built site; the draft is laid over it live.', 'Alle Seiten': 'All pages', 'Im Entwurf ansehen': 'View in draft',
    'Titel und Beschreibung, wie sie bei Google und beim Teilen auf WhatsApp oder Instagram erscheinen.': 'Title and description as they appear on Google and when sharing on WhatsApp or Instagram.', 'Titel': 'Title', 'Beschreibung': 'Description', 'Text suchen …': 'Search text …', 'Inhalt': 'Content', 'Kopf': 'Header', 'Fuß': 'Footer', 'Alles': 'All',
    'Ändern': 'Change', 'Dort ändern': 'Change there', 'nur hier': 'only here', 'gehört zu': 'belongs to', 'Nichts gefunden.': 'Nothing found.', 'Text ändern': 'Change text', 'Neuer Text': 'New text', 'Wo': 'Where', 'Nur auf dieser Seite': 'Only on this page', 'Zurück auf den Ursprung': 'Back to the original',
    'Bilder auf dieser Seite': 'Images on this page', 'Tauschen oder Beschreibung ändern (die Beschreibung lesen Google und Vorlese-Programme).': 'Swap or change the description (Google and screen readers read the description).', 'Tauschen': 'Swap', 'Anderes': 'Another', 'Zurück': 'Back', 'Text': 'Text', 'getauscht': 'swapped', 'Bildbeschreibung': 'Image description', 'Was auf dem Bild zu sehen ist, in einem Satz.': 'What the image shows, in one sentence.',
    'Jedes Bild einmal, mit den Seiten, auf denen es steht. Tauschen gilt überall, wo das Bild vorkommt. Produktbilder pflegst du beim Produkt.': 'Every image once, with the pages it appears on. Swapping applies everywhere the image appears. Product images live in the Medusa panel.',
    'Eine Angabe, viele Stellen: Impressum, Fuß, Support, Presse, Rechtstexte. Leer = Wert aus dem Code.': 'One detail, many places: imprint, footer, support, press, legal texts. Empty = value from the code.', 'Firma und Adressen': 'Company and addresses', 'Firma (Impressum, Verkäufer)': 'Company (imprint, seller)', 'Vertretung': 'Representative', 'Straße': 'Street', 'PLZ': 'Postcode', 'Ort': 'City', 'Land': 'Country',
    'KvK-Nummer': 'KvK number', 'USt-IdNr.': 'VAT ID', 'Telefon': 'Phone', 'E-Mail allgemein': 'E-mail general', 'E-Mail Support': 'E-mail support', 'E-Mail Marketing': 'E-mail marketing', 'E-Mail Business': 'E-mail business', 'E-Mail Presse': 'E-mail press', 'E-Mail Datenschutz': 'E-mail privacy', 'E-Mail Sicherheit (Meldungen)': 'E-mail safety (reports)', 'E-Mail Sicherheitslücken': 'E-mail security issues', 'Adresse der Website': 'Website address',
    'Ein Satz über txtme.social': 'One sentence about txtme.social', 'Steht im Kopf der Seite und beim Teilen.': 'Appears in the page head and when sharing.', 'Claim': 'Tagline', 'Entwurfs-Hinweis': 'Draft notice', 'Solange die Texte von txtme.social nicht endgültig sind, zeigen einige Seiten einen kleinen Hinweis «Entwurf». Vor dem Livegang ausschalten.': 'While the texts from txtme.social are not final, some pages show a small “Draft” notice. Switch it off before going live.', 'Hinweis «Entwurf» auf den Seiten zeigen': 'Show the “Draft” notice on the pages',
    'Titel und Beschreibung je Seite, wie sie bei Google und beim Teilen erscheinen. Leer = Fassung aus dem Code.': 'Title and description per page, as they appear on Google and when sharing. Empty = version from the code.',
    'Die FAQ auf der Support-Seite (die Startseite zeigt immer die englischen). Gruppen, Fragen und Antworten; Reihenfolge mit den Pfeilen.': 'The FAQ on the support page (the home page always shows the English ones). Groups, questions and answers; order with the arrows.', 'Englisch': 'English', 'Deutsch': 'German', 'Gruppe': 'Group', 'Gruppe weg': 'Remove group', 'Frage': 'Question', 'Antwort': 'Answer', 'Frage weg': 'Remove question', 'Frage dazu': 'Add question', 'Gruppe dazu': 'Add group', 'Zurück auf den Code': 'Back to the code',
    'Meldungen auf der Presse-Seite (neueste oben) und das Material zum Herunterladen. Bis Medusa angeschlossen ist, kommen die Meldungen von hier.': 'Releases on the press page (newest first) and the material for download.', 'Meldungen': 'Releases', 'Meldung dazu': 'Add release', 'Material zum Herunterladen': 'Material for download', 'Datum': 'Date', 'Medium (bei Fremdbericht)': 'Outlet (for third-party coverage)', 'Ein Absatz': 'One paragraph', 'Link (optional)': 'Link (optional)', 'Weg': 'Remove', 'Beschriftung': 'Label', 'Datei oder Link': 'File or link', 'Datei hochladen': 'Upload file', 'Eintrag dazu': 'Add entry', 'Keine Meldungen.': 'No releases.', 'Kein Material.': 'No material.',
    'Was auf der Seite «Shipping & Payments» und in der Kasse steht. Länder und Laufzeiten trägst du ein, sobald sie feststehen; bis dahin bleibt die Seite beim Wortlaut «noch festzulegen».': 'What the “Shipping & Payments” page and the checkout say. Enter countries and delivery times once they are fixed; until then the page keeps the wording “to be defined”.', 'Versand': 'Shipping', 'Versandkosten in Euro': 'Shipping cost in euros', 'Versandkostenfrei ab': 'Free shipping from', 'Bearbeitung': 'Handling', 'Rückgabefrist in Tagen': 'Return period in days', 'Versichert': 'Insured', 'Jedes Paket versichert': 'Every parcel insured', 'Länder und Laufzeiten': 'Countries and delivery times', 'Land oder Region': 'Country or region', 'Laufzeit': 'Delivery time', 'Kosten €': 'Cost €', 'Zeile dazu': 'Add row', 'Zahlarten': 'Payment methods',
    'Alle über Mollie. Ausgeschaltete Zahlarten verschwinden von der Seite. Hinweis und Länder stehen so auf der Seite.': 'All via Mollie. Switched-off methods disappear from the page. Note and countries appear on the page as entered.', 'An': 'On', 'Hinweis (Englisch)': 'Note (English)', 'Länder': 'Countries',
    'Terms of Service und Privacy Policy, Abschnitt für Abschnitt. Die Texte liefert txtme.social; hier trägst du die endgültige Fassung ein. Überschrift mit [] lässt die Seite so stehen.': 'Terms of Service and Privacy Policy, section by section. txtme.social supplies the texts; enter the final version here.', 'Stand': 'Status', 'Abschnitt dazu': 'Add section', 'Überschrift': 'Heading', 'Absatz': 'Paragraph', 'Absatz dazu': 'Add paragraph', 'Liste dazu': 'Add list', 'Abschnitt weg': 'Remove section', 'Abschnitt löschen?': 'Delete section?', 'Löschen': 'Delete',
    'Jede Frage mit Antwort, neueste oben. Rot = der Chat hatte dazu nichts auf der Seite gefunden. Mit einem Klick wird daraus eine Frage für die Support-Seite.': 'Every question with its answer, newest first. Red = the chat found nothing on the site. One click turns it into a question for the support page.', 'Offen': 'Open', 'Alle': 'All', 'Erledigt': 'Done', 'Antwort entwerfen': 'Draft a reply', 'Zur Frage & Antwort': 'To the FAQ', 'Wieder offen': 'Reopen', 'Nichts hier.': 'Nothing here.',
    'Einsendungen über die Seite, solange euer Backend den Endpunkt noch nicht übernimmt: Warteliste der Landingpage, Anfragen aus dem Chat. Später zieht das zu euch um.': 'Submissions via the site as long as your backend does not take over the endpoint: waiting list of the landing page, requests from the chat. Later this moves to you.', 'Wann': 'When', 'Art': 'Type', 'Wer': 'Who', 'Noch nichts eingegangen.': 'Nothing received yet.', 'Warteliste': 'Waiting list', 'Newsletter': 'Newsletter', 'Partner': 'Partner', 'Support': 'Support', 'Nachricht': 'Message',
    'Jede Veröffentlichung mit Zeit, Notiz und dem, was sich geändert hat. «In den Entwurf holen» legt den alten Stand als Entwurf an; veröffentlicht wird er erst, wenn du es sagst.': 'Every release with time, note and what changed. “Load into draft” makes the old state the draft; it is published only when you say so.', 'In den Entwurf holen': 'Load into draft', 'Noch nichts veröffentlicht.': 'Nothing published yet.', 'Stand in den Entwurf holen?': 'Load this state into the draft?', 'Der jetzige Entwurf wird durch diesen Stand ersetzt. Die Website bleibt, bis du veröffentlichst.': 'The current draft is replaced by this state. The website stays as it is until you publish.', 'Holen': 'Load',
    'Backstage ist gerade ohne Passwort offen (nur an diesem Rechner erreichbar). Mit einem Passwort fragt es beim Öffnen danach.': 'Backstage is open without a password (reachable only on this computer). With a password it asks when opening.', 'Backstage ist mit Passwort geschützt.': 'Backstage is protected with a password.', 'Passwort setzen': 'Set password', 'Passwort ändern': 'Change password', 'Neues Passwort (mindestens 8 Zeichen)': 'New password (at least 8 characters)', 'Ohne Passwort öffnen': 'Open without password', 'Abmelden': 'Sign out', 'Ohne Passwort öffnen?': 'Open without password?', 'Jeder an diesem Rechner kann Backstage dann öffnen.': 'Anyone on this computer can then open Backstage.', 'Öffnen': 'Open',
    'Aufrufe, Stücke, Warenkorb, Kasse, Chat. Gezählt ohne Kekse, ohne Adressen, ohne Namen: nur Seite, Sprache, Gerät und Land. Prüfläufe zählen nicht mit.': 'txtme.social counts nothing: no analytics, no cookies (Marouan’s decision). This view stays empty on purpose.',
    'Vorher / Nachher': 'Before / after', 'Entwurf bedienbar öffnen': 'Open the draft', 'Schließen': 'Close', 'Vorher · so ist die Seite jetzt': 'Before · the page as it is now', 'Nachher · der Entwurf': 'After · the draft', 'Lädt …': 'Loading …', 'Andere Seite wählen.': 'Choose another page.', 'Was tun?': 'What to do?',
    'Vorher/Nachher ansehen': 'View before/after', 'Vorher/Nachher': 'Before/after', 'Jetzt veröffentlichen': 'Publish now', 'Baut …': 'Building …', 'Notiz zu dieser Veröffentlichung (für den Verlauf)': 'Note for this release (for the history)', 'Jeder frühere Stand bleibt im Verlauf und lässt sich zurückholen.': 'Every earlier state stays in the history and can be brought back.',
    'Speichern legt die Änderung in den Entwurf. Auf die Seite kommt sie beim Veröffentlichen.': 'Saving puts the change in the draft. It reaches the site when you publish.', 'Menü': 'Menu', 'Bitte anmelden': 'Please sign in', 'Beispiel': 'Example',
    'Gespeichert, im Entwurf.': 'Saved, in the draft.', 'Nichts geändert, nichts gespeichert.': 'Nothing changed, nothing saved.', 'Zurückgenommen.': 'Taken back.', 'Entwurf verworfen.': 'Draft discarded.', 'Der Entwurf ist wieder der veröffentlichte Stand. «Rückgängig» holt ihn aus den Schritten zurück.': 'The draft is the published state again. “Undo” brings it back from the steps.',
    'In den Entwurf geholt.': 'Loaded into the draft.', 'Hinweis-Leiste: band': 'Notice bar', 'Sprachen: de': 'Languages: German', 'Passwort gesetzt.': 'Password set.', 'Benutzer angelegt.': 'User added.', 'Benutzer gelöscht.': 'User deleted.', 'Backstage ist offen.': 'Backstage is open.', 'Kein Passwort mehr, alle Benutzer gelöscht.': 'No password any more, all users deleted.',
    'Gilt ab der nächsten Anmeldung.': 'Applies from the next sign-in.', 'Bild hochgeladen': 'Image uploaded', 'Gelöscht.': 'Deleted.', 'Rückgängig gemacht.': 'Undone.', 'Der Entwurf ist wie vor diesem Speichern.': 'The draft is as before this save.',
  };
  const UE_MUSTER = [
    [/^(\d+) Änderung(?:en)?$/, m => `${m[1]} change${m[1] === '1' ? '' : 's'}`], [/^(\d+) (Text|Texte)$/, m => `${m[1]} text${m[1] === '1' ? '' : 's'}`], [/^(\d+) (Bild|Bilder)$/, m => `${m[1]} image${m[1] === '1' ? '' : 's'}`],
    [/^(\d+) (Stück|Stücke)$/, m => `${m[1]} piece${m[1] === '1' ? '' : 's'}`], [/^(\d+) (Seite|Seiten)$/, m => `${m[1]} page${m[1] === '1' ? '' : 's'}`], [/^(\d+) (Frage|Fragen)$/, m => `${m[1]} question${m[1] === '1' ? '' : 's'}`],
    [/^(\d+) Änderung(?:en)?: ([\s\S]*)$/, m => `${m[1]} change${m[1] === '1' ? '' : 's'}: ${m[2]}`], [/^(\d+) Änderung(?:en)?$/, m => `${m[1]} change${m[1] === '1' ? '' : 's'}`],
    [/^(\d+)× auf dieser Seite · $/, m => `${m[1]}× on this page · `], [/^steht auch auf (.+)$/, m => `also on ${m[1]}`], [/^(\d+) Fragen gespeichert\. (.*)$/, m => `${m[1]} questions stored. Customer e-mail addresses and numbers are masked before saving; deleted after twelve months.`],
    [/^Stand (.+)$/, m => `Status ${m[1]}`], [/^(.+) · (\d+) (Text|Texte) · (\d+) (Bild|Bilder)$/, m => `${m[1]} · ${m[2]} text${m[2] === '1' ? '' : 's'} · ${m[4]} image${m[4] === '1' ? '' : 's'}`],
    [/^(\d+) Änderung(?:en)? im Entwurf gehen verloren\. Die Website bleibt, wie sie ist\.$/, m => `${m[1]} change${m[1] === '1' ? '' : 's'} in the draft will be lost. The website stays as it is.`],
    [/^(.+) · (\d+) Texte\. Tippe einen Text an, um ihn zu ändern\.$/, m => `${m[1]} · ${m[2]} texts. Tap a text to change it.`], [/^(\d+) Änderung(?:en)? (?:geht|gehen) auf die Seite\. (.*)$/, m => `${m[1]} change${m[1] === '1' ? ' goes' : 's go'} to the site. Before that you can view every place side by side.`],
    [/^Jeder Satz auf jeder Seite/, () => 'Every sentence on every page, in one place or everywhere.'],
    [/^Text überall$/, () => 'Text everywhere'], [/^Text auf (\S+)$/, m => `Text on ${m[1]}`], [/^Text überall: (.*)$/, m => `Text everywhere: ${m[1]}`], [/^Text auf ([^:]+): (.*)$/, m => `Text on ${m[1]}: ${m[2]}`], [/^Text zurückgesetzt: (.*)$/, m => `Text reset: ${m[1]}`], [/^Text wie ursprünglich: (.*)$/, m => `Text as original: ${m[1]}`],
    [/^Angaben: (\w+)( zurückgesetzt)?$/, m => `Details: ${m[1]}${m[2] ? ' reset' : ''}`], [/^Google & Teilen: (.*)$/, m => `Google & sharing: ${m[1]}`], [/^Bilder: (.*)$/, m => `Images: ${m[1]}`], [/^Bildbeschreibungen: (.*)$/, m => `Image descriptions: ${m[1]}`],
    [/^(Fragen|Presse|Rechtliches|Zahlarten|Versand) geändert$/, m => ({ Fragen: 'Questions', Presse: 'Press', Rechtliches: 'Legal', Zahlarten: 'Payment methods', Versand: 'Shipping' }[m[1]]) + ' changed'], [/^(Fragen|Presse|Rechtliches|Zahlarten|Versand) zurück auf den Code$/, m => ({ Fragen: 'Questions', Presse: 'Press', Rechtliches: 'Legal', Zahlarten: 'Payment methods', Versand: 'Shipping' }[m[1]]) + ' back to the code'],
    [/^Der Stand vom (.+) liegt jetzt als Entwurf\. Prüfen, dann veröffentlichen\.$/, m => `The state from ${m[1]} is now the draft. Check, then publish.`], [/^Die Website, wie sie gebaut wurde, ohne jede Änderung, liegt jetzt als Entwurf\. Prüfen, dann veröffentlichen\.$/, () => 'The website as built, without any change, is now the draft. Check, then publish.'],
    [/^Backstage fragt ab jetzt beim Öffnen danach\. Benutzer «(.+)» \(admin\)\.$/, m => `Backstage asks for it from now on. User “${m[1]}” (admin).`],
  ];
  /* Nach der Abnahme 06.11.2026: deutsche Reste der englischen Oberfläche (A3) */
  Object.assign(UE, {
    '0 = im Preis enthalten': '0 = included in the price', '0 = immer frei': '0 = always free',
    'Noch keine Länder eingetragen. Die Seite sagt dann «Länderliste und Laufzeiten folgen».': 'No countries yet. The page then says “Countries and delivery times to follow.”',
    'Leer = Titel aus dem Code. «— txtme.social» hängt die Seite selbst an.': 'Empty = title from the code. The page adds “— txtme.social” itself.',
    'Ein bis zwei Sätze, bis etwa 160 Zeichen.': 'One or two sentences, up to about 160 characters.',
    'Beschriftung und Datei (Adresse unter /media/u/… nach dem Hochladen, oder ein Link). «Folgt» zeigt den Eintrag ohne Link.': 'Label and file (address under /media/u/… after uploading, or a link). “To follow” shows the entry without a link.',
    '/media/u/… oder https://…': '/media/u/… or https://…', 'Folgt': 'To follow', '(ohne Überschrift)': '(no heading)', 'Liste (eine Zeile je Punkt)': 'List (one line per item)', 'Absatz': 'Paragraph', 'Liste': 'List',
    'Die Landingpage schickt Wartelisten-Einträge an die Adresse, die in ihrem Formular steht. Soll sie bis zum eigenen Backend hierher senden:': 'The landing page sends waiting-list entries to the address in its form. To send them here until your own backend takes over:',
    '(JSON mit art «warteliste», name, email, consent).': '(JSON with art “warteliste”, name, email, consent).',
    'Backstage antwortet nicht. Läuft backstage.py noch?': 'Backstage is not answering. Is backstage.py still running?', 'Was tun?': 'What to do?', 'Prüfung öffnen': 'Open the check',
    'Lädt …': 'Loading …', 'Schreibt …': 'Writing …', 'Baut …': 'Building …', 'Nichts zu speichern': 'Nothing to save', 'Gespeichert': 'Saved', 'Zurück auf den Ursprung.': 'Back to the original.', 'geändert': 'changed', 'geändert, überall': 'changed, everywhere', 'getauscht': 'swapped', 'Anderes': 'Another', 'Beschreibung geändert': 'Description changed',
    'Alle über Mollie. Ausgeschaltete Zahlarten verschwinden von der Seite. Hinweis und Länder stehen so auf der Seite.': 'All via Mollie. Name, note and countries appear on the page as written here. Switching a method off does not remove it from the page.',
    'Rückgabefrist in Tagen': 'Return period in days', 'Bearbeitung': 'Handling', 'Versandkosten in Euro': 'Shipping cost in euros', 'Versandkostenfrei ab': 'Free shipping from', 'Versichert': 'Insured', 'Jedes Paket versichert': 'Every parcel insured',
    'Länder und Laufzeiten': 'Countries and delivery times', 'Land oder Region': 'Country or region', 'Laufzeit': 'Delivery time', 'Kosten €': 'Cost €', 'Zeile dazu': 'Add row', 'Weg': 'Remove', 'Versand': 'Shipping', 'Zahlarten': 'Payment methods',
    'Name': 'Name', 'Hinweis (Englisch)': 'Note (English)', 'Länder': 'Countries', 'An': 'On', 'Zurück auf den Code': 'Back to the original', 'Im Code:': 'In the code:', '(leer)': '(empty)',
    'Wann': 'When', 'Art': 'Type', 'Wer': 'Who', 'Einwilligung ja': 'Consent yes', 'Erledigt': 'Done', 'Wieder offen': 'Open again', 'Offen': 'Open', 'Alle': 'All', 'Antwort entwerfen': 'Draft a reply', 'Zur Frage & Antwort': 'To questions & answers',
    'Auf dieser Seite ist nichts anders.': 'Nothing is different on this page.', 'Andere Seite wählen.': 'Choose another page.', 'Keine Gruppen. «Gruppe dazu» legt die erste an.': 'No groups. “Add group” creates the first one.',
    'Als Frage & Antwort': 'As question & answer', 'Kommt in die englischen Fragen auf der Support-Seite, Gruppe «Merch and orders». Antwort bitte prüfen und ergänzen.': 'Goes into the English questions on the support page, group “Merch and orders”. Please check and complete the answer.',
    'In die Fragen': 'Into the questions', 'Entwurf schreiben': 'Write a draft', 'Text kopieren': 'Copy text', 'Das Bild ist größer als 25 MB.': 'The image is larger than 25 MB.', 'Die Datei ließ sich nicht lesen.': 'The file could not be read.',
    'Das Kontrollpanel von txtme.social. Beim ersten Mal legst du ein Passwort fest.': 'The control panel of txtme.social. The first time, you set a password.', 'Gruppe löschen?': 'Delete group?', 'Zurück auf den Code?': 'Back to the original?',
    'Alle Änderungen an den Fragen in dieser Sprache gehen verloren.': 'All changes to the questions in this language will be lost.', 'Zurücksetzen': 'Reset', 'Alle Änderungen an Presse in dieser Sprache gehen verloren.': 'All changes to press in this language will be lost.',
    'Alle Änderungen an diesem Rechtstext gehen verloren.': 'All changes to this legal text will be lost.', 'Nur auf dieser Seite': 'Only on this page', 'Wo': 'Where', 'Bildbeschreibung': 'Image description', 'Was auf dem Bild zu sehen ist, in einem Satz.': 'What the image shows, in one sentence.',
    'Nachricht eines Kunden, einer Journalistin oder eines Partners einfügen. Der Entwurf nennt nur, was auf der Seite steht; was ihr prüfen müsst, steht in eckigen Klammern.': 'Paste a message from a customer, a journalist or a partner. The draft only states what is on the site; what you need to check is in square brackets.',
    'Hinweis vom Team (optional)': 'Note from the team (optional)', 'zum Beispiel: Rückgabe genehmigen': 'for example: approve the return', 'Die Nachricht': 'The message',
    'Gruppe dazu': 'Add group', 'Frage dazu': 'Add question', 'Gruppe': 'Group', 'Frage': 'Question', 'Antwort': 'Answer', 'Löschen': 'Delete', 'Englisch': 'English', 'Deutsch': 'German',
    texte: 'texts', versand: 'shipping', fragen: 'questions', presse: 'press', recht: 'legal', seo: 'google', band: 'notice bar', bilder: 'images', alt: 'image text', angaben: 'details', woerter: 'languages', zahlarten: 'payment', hinweis: 'draft note', aus: 'hidden',
    'Warteliste': 'Waiting list', 'Newsletter': 'Newsletter', 'Partner': 'Partner', 'Support': 'Support', 'Nachricht': 'Message', 'Nichts hier.': 'Nothing here.', 'Noch nichts eingegangen.': 'Nothing received yet.',
  });
  UE_MUSTER.unshift(
    [/^Stand (.+)$/, m => `Status: ${UE[m[1]] || m[1]}`],
    [/^(\d+)× auf dieser Seite · (?:steht auch auf (.+?)|(nur hier))( · )?$/, m => `${m[1]}× on this page · ${m[3] ? 'only here' : 'also on ' + m[2]}${m[4] || ''}`],
    [/^steht auch auf (.+?)( · )?$/, m => `also on ${m[1]}${m[2] || ''}`], [/^nur hier( · )?$/, m => `only here${m[1] || ''}`],
    [/^(\d+) (?:Block|Blöcke)$/, m => `${m[1]} block${m[1] === '1' ? '' : 's'}`], [/^auf (\/\S*)$/, m => `on ${m[1]}`],
    [/^(Überschrift|Absatz|Link|Listenpunkt|Knopf|Beschriftung|Zitat|Bildzeile|Begriff|Erklärung|Spaltenkopf|Zelle|Text) auf (.+?)(?:, steht auch auf (.+))?\.$/, m => `${({ 'Überschrift': 'Heading', 'Absatz': 'Paragraph', 'Link': 'Link', 'Listenpunkt': 'List item', 'Knopf': 'Button', 'Beschriftung': 'Label', 'Zitat': 'Quote', 'Bildzeile': 'Caption', 'Begriff': 'Term', 'Erklärung': 'Description', 'Spaltenkopf': 'Column heading', 'Zelle': 'Cell', 'Text': 'Text' })[m[1]]} on ${m[2]}${m[3] ? ', also on ' + m[3] : ''}.`], [/^Vorher: (.*)$/s, m => `Before: ${m[1]}`],
    [/^Überall \((\d+) Seiten\)$/, m => `Everywhere (${m[1]} pages)`], [/^(\d+) (?:Stelle|Stellen) auf dieser Seite anders\.$/, m => `${m[1]} place${m[1] === '1' ? '' : 's'} different on this page.`],
    [/^(\d+) (?:Bild|Bilder) getauscht$/, m => `${m[1]} image${m[1] === '1' ? '' : 's'} swapped`], [/^(.+) mit (\d+) (?:Frage|Fragen)\.$/, m => `${m[1]} with ${m[2]} question${m[2] === '1' ? '' : 's'}.`],
    [/^Unerwartete Antwort vom Server \((\d+)\)\.$/, m => `Unexpected answer from the server (${m[1]}).`], [/^Fehler (\d+)$/, m => `Error ${m[1]}`],
    [/^(\d+) Fragen gespeichert\. (.*)$/, m => `${m[1]} questions stored. Customers’ e-mail addresses and numbers are masked before saving; deleted after twelve months.`],
  );
  const H1 = { 'Alles hinter dem Shirt.': 'Everything behind the <span class="soft">shirt.</span>', 'Was im Entwurf anders ist.': 'What differs <span class="soft">in the draft.</span>', 'Die Stücke im Shop.': 'The pieces <span class="soft">in the shop.</span>', 'Versand und Zahlung.': 'Shipping <span class="soft">and payment.</span>',
    'Jede Seite, jeder Satz.': 'Every page, <span class="soft">every sentence.</span>', 'Alle Bilder der Seiten.': 'All images <span class="soft">of the pages.</span>', 'Fragen und Antworten.': 'Questions <span class="soft">and answers.</span>', 'Presse.': 'Press<span class="soft">.</span>', 'Google und Teilen.': 'Google <span class="soft">and sharing.</span>',
    'Angaben der Firma.': 'Company <span class="soft">details.</span>', 'Rechtstexte.': 'Legal <span class="soft">texts.</span>', 'Was die Seite bringt.': 'What the site <span class="soft">brings.</span>', 'Was im Chat gefragt wird.': 'What the chat <span class="soft">is asked.</span>', 'Was reinkommt.': 'What <span class="soft">comes in.</span>', 'Jeder Stand bleibt.': 'Every state <span class="soft">stays.</span>', 'Zugang.': 'Access<span class="soft">.</span>' };
  const uebersetzt = new WeakSet();
  function uebersetze(root) {
    if (!EN || !root) return;
    $$('h1', root).forEach(e => { if (uebersetzt.has(e)) return; const k = e.textContent.trim(); if (H1[k]) { e.innerHTML = H1[k]; uebersetzt.add(e); } });
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (uebersetzt.has(n) || !n.nodeValue.trim()) continue;
      const p = n.parentElement; if (!p || p.closest('[data-de], script, style, .bu-kopf, .bu-band-probe, .bu-google, .bu-mini, .bu-ue__en, .bu-bild, .tx, textarea')) continue;
      const s = n.nodeValue, k = s.trim();
      let neu = UE[k];
      if (neu === undefined) { for (const [re, f] of UE_MUSTER) { const m = k.match(re); if (m) { neu = f(m); break; } } }
      if (neu !== undefined) { n.nodeValue = s.replace(k, neu); }
      uebersetzt.add(n);
    }
    $$('[placeholder], [title], [aria-label]', root).forEach(e => { if (uebersetzt.has(e)) return; ['placeholder', 'title', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v && UE[v]) e.setAttribute(a, UE[v]); }); uebersetzt.add(e); });
  }
  if (EN) {
    document.documentElement.lang = 'en';
    let uhr = 0;
    /* sofort, noch bevor der Browser das Neue zeigt (ein Fenster erschien unter Last kurz deutsch), dazu ein voller Durchgang danach */
    new MutationObserver(recs => {
      const neu = new Set(); recs.forEach(r => r.addedNodes.forEach(n => { const el = n.nodeType === 1 ? n : n.parentElement; if (el && el.isConnected) neu.add(el); }));
      neu.forEach(el => { if (el.tagName === 'H1' && el.parentElement) uebersetze(el.parentElement); else uebersetze(el); });
      clearTimeout(uhr); uhr = setTimeout(() => uebersetze(document.body), 0);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- Helfer ---------- */
  const ladeBild = src => `<img src="${h(src)}" alt="" loading="lazy" decoding="async">`;
  const datumKurz = z => { if (!z) return ''; const d = new Date(z); return isNaN(d) ? String(z).slice(0, 10) : d.toLocaleDateString(EN ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  function api2(weg, daten) { return window.api(weg, daten); }
  function sag2(text, fehler, lex) { window.sag(text, fehler, lex); }
  function offenZahl() { return $$('#sicht .kn--speichern.offen').length; }

  /* ---------- Konflikt (L13) und Fingerabdruck: jede ändernde Anfrage trägt die Basis ---------- */
  const SCHREIBT = ['aendern', 'zuruecknehmen', 'verwerfen', 'veroeffentlichen', 'zurueckholen', 'rueckgaengig'];
  const apiAlt = window.api;
  window.api = async function (weg, daten) {
    const w = String(weg).split('?')[0];
    if (daten !== undefined && SCHREIBT.includes(w) && daten && typeof daten === 'object' && !daten.basis && Z && Z.basis) daten = { ...daten, basis: Z.basis };
    try {
      const r = await apiAlt(weg, daten);
      if (r && r.basis && Z) Z.basis = r.basis;
      return r;
    } catch (e) {
      if (e && e.lex === 'konflikt') {
        try { Z = await apiAlt('ueberblick'); window.rand(); window.leiste(); } catch (e2) { /* Meldung unten */ }
        e.message = t('konflikt');
      }
      throw e;
    }
  };

  /* ---------- Kopfleiste (R05) und Stand ---------- */
  function kopfleiste() {
    let k = $('#bu-kopf');
    if (!k) {
      k = document.createElement('header'); k.id = 'bu-kopf'; k.className = 'bu-kopf bu';
      const haupt = $('.haupt'); if (!haupt) return; haupt.prepend(k);
    }
    const z = Z || {}; const n = z.entwurf ? z.entwurf.n : 0;
    const titel = randTitel();
    const stand = n ? t('im_entwurf', n) : (z.stand && z.stand.stand ? t('veroeff', datumKurz(z.stand.stand)) : t('wie_gebaut'));
    k.innerHTML = `<a class="bu-marke" href="#uebersicht"><span class="bu-ring"><span class="logo"></span></span><span><b>Backstage</b><small>${h(t('website'))}</small></span></a>
      <div class="bu-mitte"><b>${h(titel.trim())}</b><small>${h(stand)}</small></div>
      <div class="bu-werk">
        <a class="bu-rund" href="pruefung.html" target="_blank" rel="noopener" data-tip="${h(t('pruefung'))}" aria-label="${h(t('pruefung'))}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 2.8 4v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V4z"/><path d="m5.6 8 1.7 1.7 3.2-3.4"/></svg></a>
        <a class="bu-rund" href="/werkbank/anleitung/" target="_blank" rel="noopener" data-tip="${h(t('anleitung'))}" aria-label="${h(t('anleitung'))}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg></a>
        <button class="bu-rund bu-sprache" type="button" data-tip="${h(t('sprache'))}" aria-label="${h(t('sprache'))}">${EN ? 'DE' : 'EN'}</button>
        <span class="bu-trenn"></span>
        <a class="kn kn--klein kn--linie hell" href="/entwurf/" target="_blank" rel="noopener">${h(t('entwurf_ansehen'))} ${PF}</a>
        <a class="kn kn--klein kn--brand" href="/" target="_blank" rel="noopener">${h(t('ansehen'))} ${PF}</a>
      </div>`;
    $('.bu-sprache', k).onclick = () => { merken('bs_sprache', EN ? 'de' : 'en'); location.reload(); };
  }

  /* ---------- Startbild mit Gruss (R16, Master 3) ---------- */
  function startbild() {
    const kopf = $('#sicht > .in > .kopf'); if (!kopf || (location.hash && location.hash !== '#uebersicht') || $('.bu-buehne')) return;
    const st = new Date().getHours(); const gruss = st >= 5 && st < 11 ? t('morgen') : st >= 11 && st < 18 ? t('tag') : t('abend');
    const b = document.createElement('section'); b.className = 'bu-buehne bu';
    b.innerHTML = `<div class="bu-buehne__t"><p class="bu-gruss">${h(gruss)} <em>${h(t('was_heute'))}</em></p><div data-kopf></div><div class="bu-buehne__kn"><a class="kn kn--klein kn--linie" href="/werkbank/anleitung/" target="_blank" rel="noopener">${h(t('anleitung'))} ${PF}</a></div></div><div class="bu-buehne__b">${ladeBild('/media/shoot/friends-900.webp')}</div>`;
    kopf.parentNode.insertBefore(b, kopf);
    $('[data-kopf]', b).appendChild(kopf);
  }

  /* ---------- Leiste: offene Eingaben, Speichern, Cmd+S, Verlassen (R08, R09, R13) ---------- */
  function leisteErgaenzen() {
    const l = $('#leiste'); if (!l) return;
    let o = $('.bu-offen', l);
    const n = offenZahl();
    knoepfeLeiste();
    if (!n) { if (o) o.remove(); return; }
    if (!o) { o = document.createElement('div'); o.className = 'bu-offen bu'; const r = $('.r', l); l.insertBefore(o, r || null); }
    o.innerHTML = `<i class="punkt gelb"></i><span>${h(t('offen_n', n))}</span><button class="kn kn--klein bu-sp" type="button">${h(t('speichern'))}</button>`;
    $('.bu-sp', o).onclick = alleSpeichern;
    const pub = $('[data-pub]', l); if (pub) pub.title = t('erst_speichern');
  }
  async function alleSpeichern() {
    for (const b of $$('#sicht .kn--speichern.offen')) { b.click(); await new Promise(r => setTimeout(r, 350)); }
  }
  document.addEventListener('input', () => setTimeout(leisteErgaenzen, 0), true);
  document.addEventListener('change', () => setTimeout(leisteErgaenzen, 0), true);
  document.addEventListener('click', () => setTimeout(leisteErgaenzen, 120), true);
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (offenZahl()) alleSpeichern(); else sag2(EN ? 'Nothing changed, nothing saved.' : 'Nichts geändert, nichts gespeichert.'); } });
  window.addEventListener('beforeunload', e => { if (offenZahl()) { e.preventDefault(); e.returnValue = t('verlassen'); } });

  /* ---------- Veröffentlichen mit Schritten (R12) ---------- */
  window.veroeffentlichen = function () {
    if (offenZahl()) { sag2(t('erst_speichern') + ' · ' + t('erst_speichern_t')); const o = $('#leiste .bu-offen'); if (o) { o.classList.add('bu-puls'); setTimeout(() => o.classList.remove('bu-puls'), 1600); } return; }
    const n = Z.entwurf.n;
    const k = window.fenster(`<h2>${h(t('pub_titel'))}</h2><p class="hin">${h(t('pub_satz', n))}</p>
      <div class="texte bu-publiste">${Z.entwurf.aenderungen.map(a => `<div class="textz"><span class="tag">${h(a.teil)}</span><div><div class="tx"><b>${h(a.titel)}</b></div><span class="wo">${aendText(a)}</span>${aussenHtml(a.aussen)}</div></div>`).join('')}</div>
      <label class="feld" style="margin-top:16px"><span>${h(t('notiz'))}</span><input name="notiz" placeholder="${h(t('notiz_bsp'))}"></label>
      <div class="fenster__f"><span class="links">${h(t('verlauf_bleibt'))}</span><button class="kn kn--linie" type="button" data-vgl>${h(t('vorher_nachher'))}</button><button class="kn kn--linie" type="button" data-nein>${h(t('abbrechen'))}</button><button class="kn kn--brand" type="button" data-ja>${h(t('jetzt_pub'))}</button></div>`);
    $('[data-nein]', k).onclick = window.fensterZu;
    $('[data-vgl]', k).onclick = () => window.vergleich('');
    $('[data-ja]', k).onclick = async () => {
      const notiz = $('[name=notiz]', k).value; const b = $('[data-ja]', k); b.disabled = true; b.textContent = t('wird_pub');
      try { await api2('veroeffentlichen', { notiz }); fortschritt(); }
      catch (e) { b.disabled = false; b.textContent = t('jetzt_pub'); sag2(e.message, true, e.lex); }
    };
  };
  function aussenHtml(L) { return L && L.length ? `<span class="bu-aussen"><b>${h(t('nicht_auf'))}:</b> ${L.map(h).join(' · ')}</span>` : ''; }
  function aendText(a) {
    if (a.vorher !== undefined && a.nachher !== undefined && a.teil === 'texte') return `<del>${h(a.vorher)}</del> <mark>${h(a.nachher)}</mark>`;
    return h(a.text);
  }
  async function fortschritt() {
    const f = $('#fenster'); f.hidden = false;
    f.innerHTML = `<div class="fenster__k bu" role="dialog" aria-modal="true"><h2>${h(t('wird_pub'))}</h2><ol class="bu-schritte" id="bu-sch"></ol></div>`;
    let fehlt = 0;
    for (;;) {
      await new Promise(r => setTimeout(r, 650));
      let d; try { d = await api2('bau'); fehlt = 0; } catch (e) {
        if (++fehlt < 24) continue;   /* rund 15 s ohne Antwort: ehrlich sagen statt endlos fragen */
        const k = f.firstElementChild; k.innerHTML = `<h2>${h(t('keine_antwort'))}</h2><p class="hin">${h(t('antwortet_nicht'))}</p><div class="fenster__f"><a class="kn kn--linie" href="pruefung.html#server-aus" target="_blank" rel="noopener">${h(t('was_tun'))}</a><button class="kn kn--brand" type="button" data-zu>${h(t('schliessen'))}</button></div>`;
        $('[data-zu]', k).onclick = window.fensterZu; return;
      }
      const sch = d.schritte || [];
      const ol = $('#bu-sch'); if (ol) ol.innerHTML = sch.map((x, i) => `<li class="${i < sch.length - 1 || !d.laeuft ? 'fertig' : 'jetzt'}">${h(x.t)}</li>`).join('');
      if (!d.laeuft) {
        const k = f.firstElementChild;
        if (d.fehler) {
          const lex = d.lex || (d.fehler.split(' · ')[0] || 'bau-fehler').toLowerCase();
          k.innerHTML = `<h2>${h(t('nicht_pub'))}</h2><p class="hin">${h(d.fehler.replace(/^[A-ZÄÖÜ]+ · /, ''))}</p><p class="hinweis">${h(t('unveraendert'))}</p><div class="fenster__f"><a class="kn kn--linie" href="pruefung.html#${h(lex)}" target="_blank" rel="noopener">${h(t('was_tun'))}</a><button class="kn kn--brand" type="button" data-zu>${h(t('schliessen'))}</button></div>`;
        } else if (d.fertig) {
          const F = d.fertig, hw = F.hinweise || [], geaendert = F.seiten_geaendert === undefined ? 1 : F.seiten_geaendert;
          const titel = !geaendert ? t('nichts_online') : hw.length ? t('teils_online') : t('ist_online');
          const satz = !geaendert ? t('nichts_satz') : (hw.length ? t('seiten_neu', geaendert) : t('online_satz', F.zahl, F.dateien));
          k.innerHTML = `<h2>${h(titel)}</h2><p class="hin">${h(satz)}</p><ol class="bu-schritte">${(F.aenderungen || []).slice(0, 12).map(a => `<li class="${a.aussen && a.aussen.length ? 'aussen' : 'fertig'}">${h(a.titel)}</li>`).join('')}</ol>
            ${hw.length ? `<div class="bu-aussen bu-aussen--gross"><b>${h(t('nicht_auf'))}</b><ul>${hw.map(x => `<li>${h(x)}</li>`).join('')}</ul></div>` : ''}
            <div class="fenster__f"><a class="kn kn--linie" href="/" target="_blank" rel="noopener">${h(t('ansehen'))} ${PF}</a><button class="kn kn--brand" type="button" data-zu>${h(t('fertig'))}</button></div>`;
        } else { k.innerHTML = `<h2>${h(t('nicht_pub'))}</h2><div class="fenster__f"><button class="kn kn--brand" type="button" data-zu>${h(t('schliessen'))}</button></div>`; }
        $$('[data-zu]', k).forEach(b => b.onclick = window.fensterZu);
        try { Z = await api2('ueberblick'); } catch (e) { /* bleibt */ }
        window.zeige(true);
        return;
      }
    }
  }

  /* ---------- Änderungen: Vorher durchgestrichen, Nachher markiert; Beispiel statt Leere (K, R20) ---------- */
  const aendAlt = SICHTEN.aenderungen;
  SICHTEN.aenderungen = async function (rest) {
    await aendAlt(rest);
    const L = Z.entwurf.aenderungen;
    $$('#sicht .textz').forEach((z, i) => { const a = L[i]; if (!a) return; const wo = $('.wo', z); if (wo && a.teil === 'texte' && a.vorher !== undefined) wo.innerHTML = `<del>${h(a.vorher)}</del> <mark>${h(a.nachher)}</mark>`; });
    const leer = $('#sicht .leer');
    if (leer && !L.length) {
      leer.insertAdjacentHTML('afterend', `<div class="bu bu-bsp" aria-label="${h(t('beispiel'))}"><p class="hinweis">${h(t('so_sieht'))}</p><div class="texte">${t('bsp_aend').map(([wo, v, n]) => `<div class="textz"><span class="tag">${h(t('beispiel'))}</span><div><div class="tx"><b>${h(wo)}</b></div><span class="wo">${v ? `<del>${h(v)}</del> ` : ''}<mark>${h(n)}</mark></span></div><div class="chips"><span class="kn kn--klein kn--linie" aria-disabled="true">${EN ? 'View' : 'Ansehen'}</span></div></div>`).join('')}</div></div>`);
    }
  };

  /* ---------- Verlauf: Ursprünglicher Stand, Beispiele, wer (R14, R20) ---------- */
  const verlaufAlt = SICHTEN.verlauf;
  SICHTEN.verlauf = async function (rest) {
    await verlaufAlt(rest);
    const in_ = $('#sicht > .in'); if (!in_) return;
    const leer = $('.leer', in_);
    if (leer) {
      leer.insertAdjacentHTML('afterend', `<div class="bu bu-bsp" aria-label="${h(t('beispiel'))}"><p class="hinweis">${h(t('verlauf_bsp'))}</p>${t('bsp_verlauf').map(([x, m], i) => `<div class="blatt bu-vl"><div class="zeile" style="border:0;padding:0"><div class="t"><b>${h(datumKurz(new Date(Date.now() - (i + 1) * 5 * 864e5).toISOString()))} · ${h(t('beispiel'))}</b><small>${h(x)}</small></div>${m ? `<span class="marke neu">${h(m)}</span>` : ''}<span class="kn kn--klein kn--linie" aria-disabled="true">${h(t('holen'))}</span></div></div>`).join('')}</div>`);
    }
    const u = document.createElement('div'); u.className = 'blatt bu bu-ursprung';
    u.innerHTML = `<div class="zeile" style="border:0;padding:0"><div class="t"><b>${h(t('ursprung'))}</b><small>${h(t('ursprung_t'))}</small></div><button class="kn kn--klein kn--linie" type="button" data-ursprung>${h(t('holen'))}</button></div>`;
    in_.appendChild(u);
    $('[data-ursprung]', u).onclick = () => window.frage(t('holen_frage'), t('holen_t'), t('holen_kn'), async () => { const r = await api2('zurueckholen', { id: 'ursprung' }); sag2(r.titel + ' ' + r.text); location.hash = '#aenderungen'; window.zeige(true); });
  };

  /* ---------- Hinweis-Leiste (H) ---------- */
  async function hinweisS() {
    D = await api2('daten');
    const b = Object.assign({ an: false, text: '', link: '', linktext: '', von: '', bis: '', farbe: 'ink', groesse: 'mittel' }, (D.entwurf.band || {}).band || {});
    const wahl = (k, liste) => `<div class="chips" data-hw="${k}">${liste.map(([v, n]) => `<button type="button" data-v="${h(v)}" aria-pressed="${b[k] === v}">${k === 'farbe' ? `<i class="bu-farbe bu-farbe--${h(v)}"></i>` : ''}${h(n)}</button>`).join('')}</div>`;
    sicht.innerHTML = `<div class="in bu">${window.kopf(t('hw_titel'), t('hw_satz'))}<div data-q></div>
      <div class="bu-zwei"><div class="blatt" data-form>
        <label class="schalter" style="margin-bottom:18px"><input type="checkbox" name="an"${b.an ? ' checked' : ''}><i></i><span>${h(t('hw_an'))}</span></label>
        <div class="felder eins"><label class="feld"><span>${h(t('hw_text'))}</span><textarea name="text" rows="2" placeholder="${h(t('hw_text_bsp'))}">${h(b.text)}</textarea></label></div>
        <div class="felder" style="margin-top:14px"><label class="feld"><span>${h(t('hw_link'))}</span><input name="link" value="${h(b.link)}" placeholder="${h(t('hw_link_bsp'))}"></label><label class="feld"><span>${h(t('hw_lt'))}</span><input name="linktext" value="${h(b.linktext)}" placeholder="${h(t('hw_lt_bsp'))}"></label>
        <label class="feld"><span>${h(t('hw_von'))}</span><input name="von" type="date" value="${h(b.von)}"></label><label class="feld"><span>${h(t('hw_bis'))}</span><input name="bis" type="date" value="${h(b.bis)}"></label></div>
        <div class="feld" style="margin-top:14px"><span>${h(t('hw_farbe'))}</span>${wahl('farbe', t('farben'))}</div>
        <div class="feld" style="margin-top:14px"><span>${h(t('hw_groesse'))}</span>${wahl('groesse', t('groessen'))}</div>
        <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>${h(t('speichern'))}</button></div></div>
      <div class="blatt bu-band-probe"><h2>${h(t('hw_so'))}</h2><div class="bu-mini"><div class="bu-mini__leiste"><i></i><i></i><i></i><span>txtme.social</span></div><div id="bu-band"></div><div class="bu-mini__seite"><div class="bu-mini__nav"><span class="logo"></span><span></span><span></span></div><div class="bu-mini__t"><b>The platform that wants you offline.</b></div></div></div><p class="hinweis" id="bu-band-satz"></p></div></div></div>`;
    const form = $('[data-form]', sicht);
    const lies = () => ({ an: $('[name=an]', form).checked, text: $('[name=text]', form).value.trim(), link: $('[name=link]', form).value.trim(), linktext: $('[name=linktext]', form).value.trim(), von: $('[name=von]', form).value, bis: $('[name=bis]', form).value, farbe: ($('[data-hw=farbe] [aria-pressed=true]', form) || {}).dataset?.v || 'ink', groesse: ($('[data-hw=groesse] [aria-pressed=true]', form) || {}).dataset?.v || 'mittel' });
    const FA = { ink: ['#0b0b0c', '#f4f2ee', '#60c4e3'], bone: ['#efece6', '#0b0b0c', '#d9467a'], brand: ['linear-gradient(100deg,#60c4e3,#eb5986)', '#0b0b0c', '#0b0b0c'], cyan: ['#60c4e3', '#0b0b0c', '#0b0b0c'], pink: ['#eb5986', '#0b0b0c', '#0b0b0c'] };
    const GR = { klein: 11, mittel: 13, gross: 15.5 };
    const zeig = () => {
      const d = lies(); const bsp = !d.text; const txt = d.text || t('hw_text_bsp'); const fa = FA[d.farbe] || FA.ink;
      $('#bu-band').innerHTML = `<div class="bu-mini__band${d.an && !bsp ? '' : ' aus'}" style="background:${fa[0]};color:${fa[1]};font-size:${GR[d.groesse] || 13}px;--lk:${fa[2]}">${bsp ? `<em>${h(t('beispiel'))}</em>` : ''}${h(txt)}${d.link || bsp ? ` <u>${h(d.linktext || 'Learn more')}</u>` : ''}</div>`;
      $('#bu-band-satz').textContent = bsp ? t('hw_leer') : d.an ? (d.von || d.bis ? t('hw_zeit', d.von, d.bis) : t('hw_immer')) : t('hw_aus');
    };
    $$('input, textarea', form).forEach(i => i.addEventListener('input', zeig));
    $$('[data-hw] button', form).forEach(x => x.onclick = () => { $$('button', x.parentNode).forEach(y => y.setAttribute('aria-pressed', y === x)); zeig(); form.dispatchEvent(new Event('input', { bubbles: true })); });
    zeig();
    window.speichernKnopf(form, async () => { const q = await api2('aendern', { teil: 'band', daten: lies() }); window.quittung($('[data-q]', sicht), q, { seiteK: '', seite: '/entwurf/', zurueck: { teil: 'band', schluessel: 'band' } }); Z = await api2('ueberblick'); window.leiste(); return q; });
  }

  /* ---------- Sprachen (J): je geändertes englisches Stück ein Feld je zweiter Sprache ---------- */
  async function sprachenS() {
    const [d, dd] = await Promise.all([api2('sprachen'), api2('daten')]); D = dd;
    const L = d.liste || [];
    sicht.innerHTML = `<div class="in bu">${window.kopf(t('sp_titel'), t('sp_satz'))}<div data-q></div>
      ${L.length ? `<div data-liste>${L.map((e, i) => `<div class="blatt bu-ue" data-i="${i}"><span class="k-etik">${h(t('sp_wo'))} ${h(e.wo)}</span><div class="bu-ue__en">${h(e.en)}</div>${e.vorher_en ? `<div class="hinweis">${h(t('sp_vorher'))}: ${h(e.vorher_en)}</div>` : ''}
        <div class="felder eins" style="margin-top:12px">${Object.entries(e.sp).map(([sp, x]) => `<label class="feld"><span>${h(t('sp_de'))}</span><input data-sp="${h(sp)}" data-en="${h(e.en)}" value="${h(x.wert)}" placeholder="${h(t('sp_platz'))}"></label>`).join('')}</div></div>`).join('')}</div>
      <div class="fenster__f"><button class="kn kn--speichern" type="button" data-speichern>${h(t('speichern'))}</button></div>`
      : `<div class="leer">${h(t('sp_leer'))}</div><div class="bu-bsp" aria-label="${h(t('beispiel'))}"><div class="blatt bu-ue"><span class="k-etik">${h(t('beispiel'))} · ${h(t('sp_wo'))} /</span><div class="bu-ue__en">${h(t('sp_bsp_en'))}</div><div class="felder eins" style="margin-top:12px"><label class="feld"><span>${h(t('sp_de'))}</span><input value="${h(t('sp_bsp_de'))}" disabled tabindex="-1"></label></div></div></div>`}</div>`;
    if (!L.length) return;
    window.speichernKnopf(sicht, async () => {
      const w = JSON.parse(JSON.stringify(D.entwurf.woerter || {}));
      $$('input[data-sp]', sicht).forEach(i => { const sp = i.dataset.sp; w[sp] = w[sp] || {}; const v = i.value.trim(); if (v) w[sp][i.dataset.en] = v; else delete w[sp][i.dataset.en]; if (!Object.keys(w[sp]).length) delete w[sp]; });
      const daten = {}; ['de'].forEach(sp => { daten[sp] = w[sp] || ''; });
      const q = await api2('aendern', { teil: 'woerter', daten }); window.quittung($('[data-q]', sicht), q, { seiteK: '', seite: '/entwurf/' }); Z = await api2('ueberblick'); window.leiste(); D.entwurf.woerter = w; return q;
    });
  }

  /* ---------- Bildarchiv (D, M19): Suche, Hochladen, Wahl zum Tauschen ---------- */
  let BIB = null;
  async function ladeBib(frisch) { if (!BIB || frisch) BIB = (await api2('bilder')).bilder; return BIB; }
  function bibRaster(L, wahl) {
    return `<div class="bu-raster">${L.map(b => `<button type="button" class="bu-bild${wahl && wahl === b.src ? ' an' : ''}" data-src="${h(b.src)}" title="${h(b.src)}"><span class="bu-bild__b">${ladeBild(b.klein || b.src)}</span><b>${h(b.name)}</b><small>${b.w ? `${b.w} × ${b.h} · ` : ''}${b.kb} KB${b.eigen ? ` · ${h(t('bib_eigen'))}` : ''}</small><small>${b.benutzt.length ? h(t('bib_benutzt', b.benutzt.length)) : h(t('bib_unbenutzt'))}</small></button>`).join('') || `<div class="leer">${h(t('bib_leer'))}</div>`}</div>`;
  }
  async function bibliothekS() {
    const L = await ladeBib(true);
    const ordner = [...new Set(L.map(b => b.ordner).filter(Boolean))];
    let q = '', ord = '';
    sicht.innerHTML = `<div class="in bu">${window.kopf(t('bib_titel'), t('bib_satz'), `<button class="kn kn--brand" type="button" data-hoch>${h(t('bib_hoch'))}</button>`)}<div data-q></div>
      <div class="suche"><input placeholder="${h(t('bib_suche'))}" data-suche><div class="chips region-chips"><button type="button" data-ord="" aria-pressed="true">${h(t('bib_alle'))}</button><button type="button" data-ord="u" aria-pressed="false">${h(t('bib_eigen'))}</button>${ordner.filter(o => o !== 'u').map(o => `<button type="button" data-ord="${h(o)}" aria-pressed="false">${h(o)}</button>`).join('')}</div></div>
      <p class="hinweis">${h(t('bib_hoch_t'))}</p><div data-raster></div></div>`;
    const zeigen = () => { const l = L.filter(b => (!ord || b.ordner === ord) && (!q || (b.src + ' ' + b.name).toLowerCase().includes(q))); $('[data-raster]', sicht).innerHTML = bibRaster(l.slice(0, 400)); $$('.bu-bild', sicht).forEach(b => b.onclick = () => bildFenster(b.dataset.src)); };
    $('[data-suche]', sicht).oninput = e => { q = e.target.value.trim().toLowerCase(); zeigen(); };
    $$('[data-ord]', sicht).forEach(b => b.onclick = () => { ord = b.dataset.ord; $$('[data-ord]', sicht).forEach(x => x.setAttribute('aria-pressed', x === b)); zeigen(); });
    $('[data-hoch]', sicht).onclick = () => window.waehleDatei(async f => { try { sag2(EN ? 'Uploading …' : 'Lädt hoch …'); const r = await window.hochladen(f); sag2(t('hochgeladen', r.breite, r.hoehe)); await ladeBib(true); window.zeige(true); } catch (e) { sag2(e.message, true, e.lex); } });
    zeigen();
  }
  function bildFenster(src) {
    const b = (BIB || []).find(x => x.src === src) || { src, name: src.split('/').pop(), benutzt: [], w: 0, h: 0, kb: 0 };
    const k = window.fenster(`<h2>${h(b.name)}</h2><p class="hin">${h(src)} · ${b.w ? `${b.w} × ${b.h} · ` : ''}${b.kb} KB · ${b.benutzt.length ? h(t('bib_benutzt', b.benutzt.length)) + ': ' + b.benutzt.map(h).join(', ') : h(t('bib_unbenutzt'))}</p><div class="bu-gross">${ladeBild(src)}</div><div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>${h(t('schliessen'))}</button></div>`, true);
    $('[data-nein]', k).onclick = window.fensterZu;
  }
  async function waehlBild(alt, nachher) {
    const L = await ladeBib();
    let q = '', wahl = '';
    const k = window.fenster(`<h2>${h(t('bib_waehlen'))}</h2><p class="hin">${h(t('bib_waehlen_t', alt))}</p><div class="suche"><input placeholder="${h(t('bib_suche'))}" data-suche><label class="kn kn--klein kn--linie" style="cursor:pointer">${h(t('bib_hoch'))}<input type="file" accept="image/jpeg,image/png,image/webp" data-hoch hidden></label></div><div data-raster class="bu-wahlraster"></div>
      <div class="fenster__f"><button class="kn kn--linie" type="button" data-nein>${h(t('abbrechen'))}</button><button class="kn kn--brand" type="button" data-ja disabled>${h(t('uebernehmen'))}</button></div>`, true);
    const zeigen = () => { const l = L.filter(b => !q || (b.src + ' ' + b.name).toLowerCase().includes(q)).slice(0, 240); $('[data-raster]', k).innerHTML = bibRaster(l, wahl); $$('.bu-bild', k).forEach(b => b.onclick = () => { wahl = b.dataset.src; $$('.bu-bild', k).forEach(x => x.classList.toggle('an', x === b)); $('[data-ja]', k).disabled = false; }); };
    $('[data-suche]', k).oninput = e => { q = e.target.value.trim().toLowerCase(); zeigen(); };
    $('[data-hoch]', k).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { sag2(EN ? 'Uploading …' : 'Lädt hoch …'); const r = await window.hochladen(f); await ladeBib(true); L.length = 0; BIB.forEach(x => L.push(x)); wahl = r.pfad; zeigen(); $('[data-ja]', k).disabled = false; sag2(t('hochgeladen', r.breite, r.hoehe)); } catch (er) { sag2(er.message, true, er.lex); } };
    $('[data-nein]', k).onclick = window.fensterZu;
    $('[data-ja]', k).onclick = async () => { if (!wahl) return; try { const r = await api2('aendern', { teil: 'bilder', daten: { [alt]: wahl } }); window.fensterZu(); nachher && nachher(r); } catch (e) { sag2(e.message, true, e.lex); } };
    zeigen();
  }
  function archivKnoepfe() {
    $$('#sicht .bildf [data-tausch]').forEach(b => {
      if (b.parentNode.querySelector('.bu-archiv')) return;
      const src = (b.closest('.bildf').querySelector('img') || {}).getAttribute?.('src');
      const a = document.createElement('button'); a.type = 'button'; a.className = 'bu-archiv'; a.textContent = t('archiv');
      b.after(document.createTextNode(' · '), a);
      a.onclick = () => {
        const i = +b.dataset.tausch; let s = null;
        if (INV && location.hash.startsWith('#seiten/')) s = ((INV.seiten.find(x => x.k === decodeURIComponent(location.hash.slice(8))) || {}).bilder || [])[i]?.src;
        else if (INV && location.hash === '#bilder') { const alle = []; INV.seiten.forEach(x => x.bilder.forEach(y => { if (!alle.includes(y.src) && !y.src.includes('/_next/')) alle.push(y.src); })); s = alle[i]; }
        waehlBild(s || src, async r => { window.quittung($('[data-q]', sicht) || sicht.firstElementChild, r, {}); D = await api2('daten'); Z = await api2('ueberblick'); window.zeige(true); });
      };
    });
  }

  /* ---------- Angaben «steht n× auf m Seiten» (E) ---------- */
  const angabenAlt = SICHTEN.angaben;
  SICHTEN.angaben = async function (rest) {
    await angabenAlt(rest);
    try {
      const a = (await api2('angaben')).angaben;
      Object.entries(a).forEach(([k, v]) => { const f = $(`#sicht [name="${k}"]`); if (!f) return; const s = document.createElement('small'); s.className = 'bu-mal'; s.textContent = t('steht', v.mal, v.seiten); f.parentNode.appendChild(s); });
    } catch (e) { /* Zählung fehlt, Felder bleiben */ }
  };

  /* ---------- Google-Zähler 60/155 und Vorschau (I) ---------- */
  function googleZaehler() {
    $$('#sicht [data-p], #sicht [data-seo]').forEach(bl => {
      if ($('.bu-google', bl)) return;
      const ti = $('[name=title]', bl), de = $('[name=description]', bl); if (!ti || !de) return;
      const pfad = bl.dataset.p || (INV && location.hash.startsWith('#seiten/') ? (INV.seiten.find(x => x.k === decodeURIComponent(location.hash.slice(8))) || {}).pfad : '') || '/';
      const g = document.createElement('div'); g.className = 'bu-google'; g.innerHTML = `<small class="k-etik">${h(t('google_vor'))}</small><div class="bu-google__k"><small>txtme.social${h(pfad.replace(/\/$/, '') || '')}</small><b></b><span></span></div>`;
      const zt = document.createElement('i'); zt.className = 'bu-zaehler'; const zd = document.createElement('i'); zd.className = 'bu-zaehler';
      ti.parentNode.querySelector('span').appendChild(zt); de.parentNode.querySelector('span').appendChild(zd);
      bl.appendChild(g);
      const zeig = () => { const tt = ti.value.trim() || ti.placeholder || '', dd = de.value.trim() || de.placeholder || ''; $('b', g).textContent = (tt.length > 62 ? tt.slice(0, 60) + ' …' : tt) + ' — txtme.social'; $('span', g).textContent = dd.length > 158 ? dd.slice(0, 155) + ' …' : dd; zt.textContent = t('zaehler', tt.length, 60); zt.classList.toggle('zu', tt.length > 60); zd.textContent = t('zaehler', dd.length, 155); zd.classList.toggle('zu', dd.length > 155); };
      ti.addEventListener('input', zeig); de.addEventListener('input', zeig); zeig();
    });
  }

  /* ---------- Benutzer und Rollen (5.3) ---------- */
  const zugangAlt = SICHTEN.zugang;
  SICHTEN.zugang = async function (rest) {
    await zugangAlt(rest);
    const z = await api2('zugang');
    const in_ = $('#sicht > .in'); if (!in_) return;
    const admin = z.rolle === 'admin';
    const b = document.createElement('div'); b.className = 'blatt bu bu-rollen';
    b.innerHTML = `<h2>${h(t('rollen_titel'))}</h2><p class="hin">${h(t('rollen_satz'))}</p><p class="hinweis">${h(z.offen ? t('offen_als') : t('angemeldet_als', z.name, rolleName(z.rolle)))}</p>
      ${z.benutzer.length ? `<table class="tabelle"><thead><tr><th>${h(t('name'))}</th><th>${h(t('rolle'))}</th><th>${h(t('seit'))}</th><th></th></tr></thead><tbody>${z.benutzer.map(u => `<tr><td>${h(u.name)}${u.name === z.name ? ` <span class="marke">${h(t('du'))}</span>` : ''}</td><td><span class="marke ${u.rolle === 'admin' ? 'neu' : ''}">${h(rolleName(u.rolle))}</span></td><td>${h(datumKurz(u.seit))}</td><td class="r">${admin ? `<button class="kn kn--klein kn--linie" type="button" data-weg="${h(u.name)}">${h(t('weg'))}</button>` : ''}</td></tr>`).join('')}</tbody></table>` : ''}
      ${admin ? `<h3 class="k-etik" style="margin:22px 0 8px">${h(t('neu_benutzer'))}</h3><div class="felder"><label class="feld"><span>${h(t('name'))}</span><input name="bu-name" autocomplete="off"></label><label class="feld"><span>${h(t('passwort'))}</span><input name="bu-pw" type="password" autocomplete="new-password"></label><label class="feld"><span>${h(t('rolle'))}</span><select name="bu-rolle">${z.rollen.map(r => `<option value="${h(r)}"${r === 'redaktion' ? ' selected' : ''}>${h(r)}</option>`).join('')}</select></label></div><div class="fenster__f"><button class="kn kn--brand" type="button" data-anlegen>${h(t('anlegen'))}</button></div>` : ''}`;
    in_.insertBefore(b, in_.children[1] || null);
    $$('[data-weg]', b).forEach(x => x.onclick = () => window.frage(t('benutzer_weg', x.dataset.weg), t('benutzer_weg_t'), t('weg'), async () => { const r = await api2('zugang', { tun: 'benutzer_weg', name: x.dataset.weg }); sag2(r.titel + ' ' + r.text); window.zeige(true); }, true));
    const an = $('[data-anlegen]', b); if (an) an.onclick = async () => { try { const r = await api2('zugang', { tun: 'benutzer_neu', name: $('[name=bu-name]', b).value, pw: $('[name=bu-pw]', b).value, rolle: $('[name=bu-rolle]', b).value }); sag2(r.titel + ' ' + r.text); window.zeige(true); } catch (e) { sag2(e.message, true, e.lex); } };
  };
  window.tor = async function (z) {
    document.documentElement.classList.remove('bu-wartet');
    const tor = $('#tor'); tor.hidden = false;
    tor.innerHTML = `<div class="tor__k bu"><span class="logo"></span><h1>Backstage</h1><p>${h(z.eingerichtet ? t('anmelden_satz') : t('einrichten_satz'))}</p>
      <form>${z.eingerichtet ? `<label><span>${h(t('name'))}</span><input type="text" name="name" autocomplete="username" ${z.benutzer && z.benutzer.length === 1 ? `value="${h(z.benutzer[0].name)}"` : ''}></label>` : ''}<label><span>${h(z.eingerichtet ? t('pw') : t('pw_neu'))}</span><input type="password" name="pw" autocomplete="${z.eingerichtet ? 'current-password' : 'new-password'}" required></label>
      <div class="tor__f"><a href="pruefung.html">${h(t('pruefung'))}</a><button class="kn kn--brand" type="submit">${h(z.eingerichtet ? t('anmelden') : t('pw_setzen'))}</button></div></form></div>`;
    $('form', tor).onsubmit = async e => {
      e.preventDefault();
      try {
        const pw = $('[name=pw]', tor).value, name = ($('[name=name]', tor) || {}).value || '';
        if (z.eingerichtet) await api2('zugang', { tun: 'anmelden', pw, name }); else { await api2('zugang', { tun: 'einrichten', neu: pw, name: 'admin' }); }
        tor.hidden = true; window.start();
      } catch (err) { sag2(err.message, true, err.lex); }
    };
  };

  /* ---------- Produkte: ruhige Zeile im Fluss (M26), Medusa ---------- */
  const produkteAlt = SICHTEN.produkte;
  SICHTEN.produkte = async function (rest) { await produkteAlt(rest); const k = $('#sicht .kopf'); if (k) k.insertAdjacentHTML('afterend', `<p class="bu bu-zeile">${h(t('medusa'))}</p>`); };
  const eingangAlt = SICHTEN.eingang;
  SICHTEN.eingang = async function (rest) { await eingangAlt(rest); const k = $('#sicht .kopf'); if (k) k.insertAdjacentHTML('afterend', `<p class="bu bu-zeile">${EN ? 'Examples: until the team’s backend takes over the endpoint. This is what the list looks like.' : 'Beispiele: bis das Backend des Teams den Endpunkt übernimmt. So sieht die Liste aus.'}</p>`); };

  /* ---------- Neue Bereiche in Rand und Ansichten ---------- */
  SICHTEN.hinweis = hinweisS; SICHTEN.sprachen = sprachenS; SICHTEN.bibliothek = bibliothekS;
  const seitenGr = NAV.find(g => g[0] === 'Seiten'); if (seitenGr) { seitenGr[1].splice(2, 0, ['bibliothek', t('bib_nav')]); seitenGr[1].push(['hinweis', t('hw_nav')], ['sprachen', t('sp_nav')]); }

  /* ---------- Klick in der Vorschau öffnet die Stelle (C) ---------- */
  window.addEventListener('message', async ev => {
    if (ev.origin !== location.origin) return;   /* nur aus den eigenen Vorschau-Rahmen */
    const d = ev.data || {}; if (!d.bureau) return;
    if (d.bureau === 'text' && d.text) {
      const inv = INV || await api2('inventar'); INV = inv;
      const pfad = (d.seite || '/').replace(/index\.html$/, '');
      const s = inv.seiten.find(x => x.pfad === pfad) || inv.seiten.find(x => x.texte.some(y => y.text === d.text));
      if (!s) { sag2(t('stelle_nicht')); return; }
      if (!$('#vergleich').hidden) window.vglZu();
      location.hash = '#seiten/' + encodeURIComponent(s.k);
      let i = 0; const warte = setInterval(() => { const z = $$('#sicht .textz').find(x => ($('.tx', x) || {}).textContent?.trim() === d.text); if (z || ++i > 20) { clearInterval(warte); if (z) { z.scrollIntoView({ block: 'center' }); z.classList.add('bu-blink'); const b = $('[data-edit]', z); if (b) b.click(); else { const q = $('.q a', z); sag2(t('zum_bereich') + ' ' + (q ? q.textContent : '') + '.'); } } else sag2(t('stelle_nicht')); } }, 150);
    }
    if (d.bureau === 'bild' && d.src) { if (!$('#vergleich').hidden) window.vglZu(); waehlBild(d.src, async r => { sag2(r.titel + ' ' + r.text); D = await api2('daten'); Z = await api2('ueberblick'); window.zeige(true); }); }
  });

  /* ---------- Rundgang (R18) ---------- */
  /* Der Rundgang startet nie von selbst, nur auf Klick («Kurzer Rundgang» unten in der linken Leiste) oder mit ?rundgang (Robert 07.11.2026) */
  function rundgang(geklickt) {
    if (Q.get('pruef') === '1' || window !== window.top || $('.bu-rg')) return;
    if (!geklickt && !Q.has('rundgang')) return;
    /* Je Schritt das Stück, von dem der Text spricht; am Handy (Rand hinter «Menu») das, was dort sichtbar ist (B-2) */
    const ZIELE = [['#rand', 'button.menue-kn'], ['#sicht .karte.klick[href="#aenderungen"]', '#sicht'], ['#rand a[data-k="aenderungen"]', '#leiste a[href="#aenderungen"]'],
      ['#leiste [data-pub]:not([hidden])', '#leiste'], ['.bu-kopf a[href="pruefung.html"]', '#rand .rand__f a[href="pruefung.html"]']];
    const sichtbar = el => { if (!el) return false; const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth && s.visibility !== 'hidden' && s.display !== 'none'; };
    const ziel = n => { for (const s of ZIELE[n]) { const el = $(s); if (!el) continue; try { el.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (e) { /* alt */ } if (sichtbar(el)) return el; } return $('#sicht'); };
    const S = t('rundgang'); let i = 0;
    const schl = document.createElement('div'); schl.className = 'bu-rg bu'; schl.innerHTML = `<div class="bu-rg__licht"></div><div class="bu-rg__k"><small></small><b></b><p></p><div class="bu-rg__f"><button type="button" class="link" data-zu>${h(t('rundgang_zu'))}</button><button type="button" class="kn kn--klein kn--brand" data-weiter>${h(t('weiter'))}</button></div></div>`;
    document.body.appendChild(schl);
    const zu = () => { schl.remove(); merken('bs_rundgang', '1'); };
    const zeig = () => {
      if (i >= S.length) return zu();
      const el = ziel(i);
      const r = el.getBoundingClientRect();
      const l = $('.bu-rg__licht', schl); l.style.left = (r.left - 8) + 'px'; l.style.top = (r.top - 8) + 'px'; l.style.width = (r.width + 16) + 'px'; l.style.height = (r.height + 16) + 'px';
      const k = $('.bu-rg__k', schl); $('small', k).textContent = t('schritt', i + 1, S.length); $('b', k).textContent = S[i][0]; $('p', k).textContent = i === 0 && el.matches('button.menue-kn') ? t('rundgang_menue') : S[i][1];
      /* Das Schild steht fest unten rechts über der Leiste und verdeckt nie, was es zeigt (Fehlerbuch 20.10.2026) */
      const leisteH = ($('#leiste') || {}).offsetHeight || 0;
      k.style.top = 'auto'; k.style.left = 'auto'; k.style.right = '16px'; k.style.bottom = (leisteH + 16) + 'px';
      $('[data-weiter]', k).textContent = i === S.length - 1 ? t('fertig') : t('weiter');
    };
    $('[data-zu]', schl).onclick = zu; $('[data-weiter]', schl).onclick = () => { i++; zeig(); };
    window.addEventListener('resize', zeig);
    setTimeout(zeig, 400);
  }

  /* ---------- «Zur Werkbank» (R19) ---------- */
  if (Q.get('wb') !== null && Q.get('wb') !== undefined) {
    /* fest oben in der linken Leiste (am Handy hinter «Menu»), nicht schwebend: so deckt sie nie Leiste, Hinweis oder Links ab */
    const setz = () => { const r = $('#rand'), m = r && $('.rand__m', r); if (!m || $('.bu-werkbank', r)) return; const a = document.createElement('a'); a.className = 'bu-werkbank bu'; a.href = Q.get('wbo') || '/werkbank/'; a.textContent = t('zur_werkbank'); m.after(a); };
    setz(); if ($('#rand')) new MutationObserver(setz).observe($('#rand'), { childList: true });
  }
  /* Höhe der Leiste unten (am Handy zweizeilig) für den Hinweis darüber */
  const hoehenSetzen = () => { const l = $('#leiste'); document.documentElement.style.setProperty('--leiste-h', ((l && l.offsetHeight) || 0) + 'px'); };
  hoehenSetzen(); window.addEventListener('resize', hoehenSetzen); if ($('#leiste')) new ResizeObserver(hoehenSetzen).observe($('#leiste'));

  /* =====================================================================================================================
     Nach der Abnahme (06.11.2026): ehrlich sagen, was nicht auf die Website kommt (A1), Produkte nur zum Nachsehen (A2),
     Zahlen ohne Zählung (A7), Kopf-Titel (A6), Auswahl und Datum im Hausstil (B1), Knöpfe nur, wenn sie etwas tun (B3),
     Quittung mit × und 9 s (B4), Fehlermelder ohne Netz- und Eingabefehler (B5), Auftakt (B6), Bühne in jeder Ansicht (B7),
     Rundgang-Schild fest unten rechts (B8), Ausblenden / Vorschau Rechner und Handy / Tippen in der Seite (B2), Herkunft prüfen (C).
     ===================================================================================================================== */

  /* ---------- Fehlermelder (R03): Netzfehler und gewöhnliche Eingabefehler sind keine Fehler von Backstage ---------- */
  const KEIN_FEHLER = new Set(['server-aus', 'langsam', 'mail-format', 'link-format', 'tel-format', 'zahl-format', 'datum-format', 'bild-klein', 'datei-art', 'datei-gross', 'pflichtfeld', 'zu-lang',
    'konflikt', 'nichts-offen', 'medusa', 'zahlen-aus', 'ki-aus', 'veraltet', 'doppelt', 'anmeldung', 'gesperrt', 'passwort-kurz', 'zuviele', 'rolle', 'bau-laeuft', 'zugang', 'aus-geht-nicht']);
  const merkAlt = window.merkFehler;
  let gemeldet = 0;
  window.merkFehler = function (text, wo, lex) {
    if (KEIN_FEHLER.has(lex || '') || /^(Failed to fetch|NetworkError|Load failed|Fetch API cannot load|Backstage antwortet nicht|Backstage is not answering)|access control checks/i.test(String(text || ''))) return;
    if (++gemeldet > 20) return;   /* höchstens 20 je Seite, nie eine Schleife */
    merkAlt(text, wo, lex);
  };

  /* ---------- Quittung (R11): was nicht auf die Website kommt, Schliessen ×, nach 9 s weg ---------- */
  const quittungAlt = window.quittung;
  window.quittung = function (wirt, q, o) {
    quittungAlt(wirt, q, o);
    const el = wirt && $('.quittung', wirt); if (!el) return;
    if (q && q.aussen && q.aussen.length) $('div', el).insertAdjacentHTML('beforeend', aussenHtml(q.aussen));
    const x = document.createElement('button'); x.type = 'button'; x.className = 'bu-quittung-zu'; x.setAttribute('aria-label', t('schliessen')); x.textContent = '×';
    x.onclick = () => el.remove(); el.appendChild(x);
    /* nach 9 s weg (R11); was nicht auf die Website kommt, steht weiter unter «Änderungen» und im Fenster «Veröffentlichen» */
    setTimeout(() => { if (!el.isConnected) return; el.classList.add('bu-weg'); setTimeout(() => el.remove(), 400); }, 9000);
  };

  /* ---------- Bereiche, die nicht ganz auf die Website kommen: vor dem Speichern sagen (A1) ---------- */
  function aussenZeile(schl) { const k = $('#sicht .kopf'); if (k && !$('#sicht .bu-zeile--aussen')) k.insertAdjacentHTML('afterend', `<p class="bu bu-zeile bu-zeile--aussen"><b>${h(t('kommt_nicht'))}.</b> ${h(t(schl))}</p>`); }
  [['versand', 'aus_versand'], ['fragen', 'aus_fragen'], ['presse', 'aus_presse'], ['recht', 'aus_recht']].forEach(([k, schl]) => {
    const alt = SICHTEN[k]; SICHTEN[k] = async function (rest) { await alt(rest); aussenZeile(schl); };
  });
  const sprachenAlt = SICHTEN.sprachen; SICHTEN.sprachen = async function (rest) { await sprachenAlt(rest); aussenZeile('aus_sprachen'); };
  /* Änderungen: je Stelle, was nicht ankommt */
  const aend2 = SICHTEN.aenderungen;
  SICHTEN.aenderungen = async function (rest) {
    await aend2(rest);
    const L = Z.entwurf.aenderungen;
    $$('#sicht .textz').forEach((z, i) => { const a = L[i]; if (a && a.aussen && a.aussen.length && !$('.bu-aussen', z)) { const d = $('.tx', z); (d ? d.parentNode : z).insertAdjacentHTML('beforeend', aussenHtml(a.aussen)); } });
  };

  /* ---------- Produkte: nur zum Nachsehen, keine Formulare (A2, Medusa) ---------- */
  const eur = x => (x === null || x === undefined || x === '') ? '' : new Intl.NumberFormat(EN ? 'en-IE' : 'de-DE', { style: 'currency', currency: 'EUR' }).format(x);
  SICHTEN.produkte = async function () {
    const k = await api2('katalog'); K = k; const P = k.code.produkte || [], KAT = k.code.kategorien || [];
    sicht.innerHTML = `<div class="in bu">${window.kopf(EN ? 'The pieces <span class="soft">in the shop.</span>' : 'Die Stücke <span class="soft">im Shop.</span>', t('prod_satz'))}
      ${KAT.map(c => { const l = P.filter(p => p.category === c.slug); return `<div class="blatt"><h2>${h(c.label)} <small class="bu-klein">${l.length ? (EN ? `${l.length} piece${l.length === 1 ? '' : 's'}` : `${l.length} Stück${l.length === 1 ? '' : 'e'}`) : h(t('prod_leer'))}${c.empty ? ' · ' + h(t('prod_bald')) : ''}</small></h2>
        ${l.length ? `<div class="produkte">${l.map(p => `<a class="prod" href="#produkte/${encodeURIComponent(p.slug)}"><span class="b">${p.image ? `<img src="${h(p.image)}" alt="" loading="lazy" decoding="async">` : `<span class="kein">${h(t('prod_kein_bild'))}</span>`}</span><b>${h(p.name)}</b><span class="p">${p.priceTbd ? h(t('prod_folgt')) : h(eur(p.price))}</span><small>${h((p.sizes || []).join(' · '))}${(p.colors || []).length ? ' · ' + h(p.colors.map(c => c.name).join(', ')) : ''}</small></a>`).join('')}</div>` : ''}</div>`; }).join('')}</div>`;
  };
  window.produktS = async function (slug) {
    const k = K || await api2('katalog'); K = k; const p = (k.code.produkte || []).find(x => x.slug === slug);
    if (!p) { sicht.innerHTML = `<div class="in bu"><div class="leer">${h(t('prod_nicht'))} <a href="#produkte">${h(t('prod_zurueck'))}</a></div></div>`; return; }
    const kat = (k.code.kategorien || []).find(c => c.slug === p.category) || {};
    const zeile = (n, w) => w ? `<div class="zeile"><div class="t"><small>${h(n)}</small><b>${w}</b></div></div>` : '';
    sicht.innerHTML = `<div class="in bu">${window.kopf(h(p.name), t('prod_satz'), `<a class="kn kn--linie" href="#produkte">${h(t('prod_zurueck'))}</a><a class="kn kn--linie" href="/product/${h(p.slug)}/" target="_blank" rel="noopener">${h(t('ansehen'))} ${PF}</a>`)}
      <div class="bu-zwei"><div class="blatt">${zeile(t('preis'), p.priceTbd ? h(t('prod_folgt')) : h(eur(p.price)))}${zeile(t('kategorie'), h(kat.label || p.category))}${zeile(t('groessen_t'), h((p.sizes || []).join(' · ')))}${zeile(t('farben_t'), h((p.colors || []).map(c => c.name).join(', ')))}
        ${p.line ? `<p class="hin" style="margin-top:14px">${h(p.line)}</p>` : ''}${p.description ? `<p class="hin">${h(p.description)}</p>` : ''}</div>
        <div class="blatt bu-prodbild">${p.image ? `<img src="${h(p.image)}" alt="" decoding="async">` : `<span class="kein">${h(t('prod_kein_bild'))}</span>`}</div></div></div>`;
  };

  /* ---------- Zahlen: keine Zählung, kein Satz über eine Zählung (A7, Auftrag Regel 7) ---------- */
  SICHTEN.zahlen = async function () {
    sicht.innerHTML = `<div class="in bu">${window.kopf(EN ? 'Numbers<span class="soft">.</span>' : 'Zahlen<span class="soft">.</span>', t('zahlen_satz'))}<div class="leer">${h(t('zahlen_satz'))}</div></div>`;
  };
  function zahlenKachel() {
    const a = $('#sicht .karte.klick[href="#zahlen"]'); if (!a || a.dataset.bu) return; a.dataset.bu = '1';
    a.innerHTML = `<span class="k-etik">${EN ? 'Numbers' : 'Zahlen'}</span><span class="zahl">–<small>${h(t('keine'))}</small></span><p>${h(t('zahlen_kachel'))}</p><span class="pf">${EN ? 'Numbers →' : 'Zahlen →'}</span>`;
  }

  /* ---------- Rollen: Namen in der Oberfläche (A3), Wert bleibt admin / redaktion / lesen ---------- */
  const rolleName = r => (t('rolle_name') || {})[r] || r;

  /* ---------- Auswahl und Datum im Hausstil (R21, B1): nie die Liste oder den Kalender des Betriebssystems ---------- */
  const MON = EN ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] : ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const WT = EN ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const zeigDatum = v => { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return t('kein_datum'); const [y, m, d] = v.split('-').map(Number); return `${d} ${MON[m - 1].slice(0, 3)} ${y}`; };
  let aufKlapp = null;
  function zuKlapp() { if (aufKlapp) { aufKlapp.remove(); aufKlapp = null; } }
  document.addEventListener('click', e => { if (aufKlapp && !e.target.closest('.bu-klapp, .bu-wahl, .bu-datum')) zuKlapp(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && aufKlapp) { e.stopPropagation(); zuKlapp(); } }, true);
  function klapp(knopf, inhalt) {
    zuKlapp(); const k = document.createElement('div'); k.className = 'bu-klapp bu'; k.setAttribute('role', 'dialog'); k.innerHTML = inhalt; document.body.appendChild(k); aufKlapp = k;
    k._knopf = knopf; lage(k);
    return k;
  }
  /* über oder unter dem Feld, je nachdem wo Platz ist; die Leiste unten zählt nicht als Platz */
  function lage(k) {
    const r = k._knopf.getBoundingClientRect(); const unten_ = innerHeight - (($('#leiste') || {}).offsetHeight || 0);
    k.style.minWidth = Math.max(r.width, 248) + 'px'; k.style.left = Math.max(8, Math.min(r.left, innerWidth - k.offsetWidth - 8)) + 'px';
    const h_ = k.offsetHeight; const passtUnten = r.bottom + h_ + 8 < unten_; const passtOben = r.top - h_ - 6 > 8;
    k.style.top = (passtUnten || !passtOben ? Math.max(8, Math.min(r.bottom + 6, unten_ - h_ - 8)) : r.top - h_ - 6) + 'px';
  }
  function wahlHausstil(sel) {
    if (sel.dataset.bu) return; sel.dataset.bu = '1';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bu-wahl'; b.setAttribute('aria-haspopup', 'listbox');
    const name = () => { const o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; };
    const setz = () => { b.innerHTML = `<span>${h(name())}</span><i aria-hidden="true"></i>`; };
    setz(); sel.classList.add('bu-versteckt'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true'); sel.after(b);
    sel.addEventListener('change', setz);
    b.onclick = e => {
      e.stopPropagation(); if (aufKlapp && aufKlapp._von === b) return zuKlapp();
      const k = klapp(b, `<div role="listbox">${[...sel.options].map((o, i) => `<button type="button" role="option" data-i="${i}" aria-selected="${i === sel.selectedIndex}">${h(o.textContent)}</button>`).join('')}</div>`); k._von = b;
      $$('[data-i]', k).forEach(x => x.onclick = () => { sel.selectedIndex = +x.dataset.i; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); zuKlapp(); b.focus(); });
      const an = $('[aria-selected=true]', k) || $('[data-i]', k); an && an.focus();
    };
  }
  function datumHausstil(inp) {
    if (inp.dataset.bu) return; inp.dataset.bu = '1';
    inp.type = 'hidden';   /* Wert bleibt JJJJ-MM-TT, alles Bestehende liest ihn weiter */
    const b = document.createElement('button'); b.type = 'button'; b.className = 'bu-datum'; b.setAttribute('aria-label', t('datum_waehlen'));
    const setz = () => { b.innerHTML = `<i aria-hidden="true"></i><span>${h(zeigDatum(inp.value))}</span>`; b.classList.toggle('leer', !inp.value); };
    setz(); inp.after(b);
    const gib = v => { inp.value = v; setz(); inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); };
    b.onclick = e => {
      e.stopPropagation(); if (aufKlapp && aufKlapp._von === b) return zuKlapp();
      let ansicht = /^\d{4}-\d{2}-\d{2}$/.test(inp.value) ? new Date(inp.value + 'T12:00') : new Date();
      const k = klapp(b, '<div data-kal></div>'); k._von = b;
      const mal_ = () => {
        const y = ansicht.getFullYear(), m = ansicht.getMonth(); const erst = new Date(y, m, 1); const vor = (erst.getDay() + 6) % 7; const tage = new Date(y, m + 1, 0).getDate();
        let zellen = ''; for (let i = 0; i < vor; i++) zellen += '<span></span>';
        for (let d = 1; d <= tage; d++) { const v = iso(new Date(y, m, d)); zellen += `<button type="button" data-v="${v}" aria-pressed="${v === inp.value}"${v === iso(new Date()) ? ' class="heute"' : ''}>${d}</button>`; }
        $('[data-kal]', k).innerHTML = `<div class="bu-kal__k"><button type="button" data-m="-1" aria-label="‹">‹</button><b>${h(MON[m])} ${y}</b><button type="button" data-m="1" aria-label="›">›</button></div>
          <div class="bu-kal__w">${WT.map(w => `<span>${w}</span>`).join('')}</div><div class="bu-kal__t">${zellen}</div>
          <div class="bu-kal__f"><button type="button" data-heute>${h(t('heute'))}</button><button type="button" data-leer>${h(t('leeren'))}</button></div>`;
        $$('[data-m]', k).forEach(x => x.onclick = ev => { ev.stopPropagation(); ansicht = new Date(y, m + +x.dataset.m, 1); mal_(); });
        $$('[data-v]', k).forEach(x => x.onclick = () => { gib(x.dataset.v); zuKlapp(); b.focus(); });
        $('[data-heute]', k).onclick = () => { gib(iso(new Date())); zuKlapp(); };
        $('[data-leer]', k).onclick = () => { gib(''); zuKlapp(); };
        lage(k);
      };
      mal_();
    };
  }
  function hausstil(root) {
    if (!root) return;
    $$('select', root).forEach(s => { if (s.dataset.bu) return; if (s.name === 'bu-rolle') [...s.options].forEach(o => { if (o.textContent !== rolleName(o.value)) o.textContent = rolleName(o.value); }); wahlHausstil(s); });
    $$('input[type=date]', root).forEach(datumHausstil);
  }
  new MutationObserver(() => { hausstil($('#fenster')); hausstil($('#vergleich')); hausstil($('#sicht')); }).observe(document.body, { childList: true, subtree: true });

  /* ---------- Kopf-Titel ohne die Zahl am Rand (A6) ---------- */
  function randTitel() { const a = $('#rand a.an'); if (!a) return ''; const c = a.cloneNode(true); $$('span', c).forEach(x => x.remove()); return c.textContent.trim(); }

  /* ---------- Leiste: nur Knöpfe, die gerade etwas tun (R08/R12, Fehlerbuch 20.10.2026) ---------- */
  function knoepfeLeiste() {
    const l = $('#leiste'); if (!l) return; const pub = $('[data-pub]', l); if (!pub) return;
    const n = Z && Z.entwurf ? Z.entwurf.n : 0;
    pub.hidden = !n || offenZahl() > 0;   /* ohne Entwurf nichts zu veröffentlichen, mit offenen Eingaben zuerst «Speichern» */
    $$('#sicht .kopf__r button[data-pub], #sicht .kopf__r button[data-verwerfen]').forEach(b => { b.hidden = !n; });
  }

  /* ---------- Bühne im Kopf jeder Ansicht (R16): Foto rechts, Zierzeile mit Zeichen, Titel mit Akzent ---------- */
  const BUEHNE_FOTO = { aenderungen: 'desk-900', produkte: 'print-900', versand: 'front-800', seiten: 'hero-900', bilder: 'cube-800', bibliothek: 'cube-800', fragen: 'glance-800', presse: 'face-800', google: 'code-800',
    hinweis: 'night-900', sprachen: 'laugh-1200', angaben: 'desk-900', recht: 'bw3-700', zahlen: 'blur-800', chat: 'party-1000', eingang: 'stairs-800', verlauf: 'bw11-700', zugang: 'roof-1000' };
  let vorgeladen = false;
  function fotosVorladen() {   /* nach dem Auftakt still im Hintergrund: beim Wechsel der Ansicht steht das Foto sofort da (zusammen rund 600 KB) */
    if (vorgeladen) return; vorgeladen = true;
    const los = () => [...new Set(Object.values(BUEHNE_FOTO))].forEach(n => { const i = new Image(); i.decoding = 'async'; i.src = '/media/shoot/' + n + '.webp'; });
    (window.requestIdleCallback || (f => setTimeout(f, 1200)))(los);
  }
  async function buehne() {
    const k = (location.hash || '#uebersicht').slice(1).split('/')[0];
    const kopf = $('#sicht > .in > .kopf'); if (!kopf || k === 'uebersicht' || $('#sicht .bu-buehne')) return;
    const src = '/media/shoot/' + (BUEHNE_FOTO[k] || 'friends-900') + '.webp';
    const b = document.createElement('section'); b.className = 'bu-buehne bu-buehne--klein bu';
    b.innerHTML = `<div class="bu-buehne__t"><p class="bu-zier"><span class="logo" aria-hidden="true"></span>${h(randTitel())}</p><div data-kopf></div></div><div class="bu-buehne__b"><img src="${h(src)}" alt="" decoding="sync" fetchpriority="high"></div>`;
    kopf.parentNode.insertBefore(b, kopf); $('[data-kopf]', b).appendChild(kopf);
  }

  /* ---------- Vorher/Nachher: Rechner 1440 und Handy 390 (Le Bureau C) ---------- */
  const vglAlt = window.vergleich;
  window.vergleich = function (seiteK) {
    vglAlt(seiteK);
    const v = $('#vergleich'); const r = $('.vgl__k .r', v); if (!r || $('.bu-geraet', v)) return;
    let geraet = 'rechner';
    r.insertAdjacentHTML('afterbegin', `<div class="chips bu-geraet">${[['rechner', t('geraet_rechner')], ['handy', t('geraet_handy')]].map(([g, n]) => `<button type="button" data-g="${g}" aria-pressed="${g === geraet}">${h(n)}</button>`).join('')}</div>`);
    const setz = () => {
      const breite = geraet === 'handy' ? 390 : 1440;
      $$('.vgl__b > div', v).forEach(d => { const f = $('iframe', d); if (!f) return; const w = d.clientWidth, hh = d.clientHeight; const sk = Math.min(1, w / breite);
        f.style.width = breite + 'px'; f.style.height = (hh / sk) + 'px'; f.style.transform = `scale(${sk})`; f.style.transformOrigin = '0 0'; f.style.marginLeft = geraet === 'handy' && w > breite ? ((w - breite) / 2) + 'px' : '0'; });
    };
    $$('[data-g]', v).forEach(b => b.onclick = () => { geraet = b.dataset.g; $$('[data-g]', v).forEach(x => x.setAttribute('aria-pressed', x === b)); setz(); });
    setz(); window.addEventListener('resize', setz);
  };

  /* ---------- Text ändern: Tippen zeigt sich sofort in der Seite (Le Bureau C) ---------- */
  function tippenVorschau() {
    const f = $('#fenster'); if (f.hidden || $('.bu-live', f)) return;
    const ta = $('[name=neu]', f); const h2 = $('h2', f); if (!ta || !h2 || !location.hash.startsWith('#seiten/')) return;
    const vorher = (($('.hinweis', f) || {}).textContent || '').replace(/^(Vorher|Before): /, '');
    const k = decodeURIComponent(location.hash.slice(8));
    const box = document.createElement('div'); box.className = 'bu-live';
    box.innerHTML = `<small class="k-etik">${h(t('live_vorschau'))}</small><div class="bu-live__r"><iframe title="${h(t('live_vorschau'))}"></iframe></div>`;
    $('.fenster__f', f).before(box);
    const fr = $('iframe', box); let zuletzt = ta.value;
    /* erst laden, wenn das Fenster steht: das Fenster öffnet so schnell wie vorher, die Seite kommt gleich danach */
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => { fr.src = `/${k ? encodeURIComponent(k).replace(/%2F/g, '/') + '/' : ''}?bs_rahmen=entwurf&nomotion=1&zeig=${encodeURIComponent(ta.value)}${window.bsZeigNr != null ? '&zeign=' + window.bsZeigNr : ''}`; window.bsZeigNr = null; }, 120)));
    const schick = () => { try { fr.contentWindow.postMessage({ bureau: 'tippen', alt: [vorher, zuletzt], neu: ta.value }, location.origin); } catch (e) { /* lädt noch */ } zuletzt = ta.value; };
    fr.addEventListener('load', () => setTimeout(() => { try { fr.contentWindow.postMessage({ bureau: 'zeigen', text: [ta.value, vorher] }, location.origin); } catch (e) { /* */ } }, 200));
    ta.addEventListener('input', schick);
  }
  new MutationObserver(() => tippenVorschau()).observe($('#fenster'), { childList: true });

  /* ---------- Ausblenden, nicht löschen · Wieder zeigen (Le Bureau C) ---------- */
  const AUSB = {};
  async function ausblendenKnoepfe() {
    if (!location.hash.startsWith('#seiten/')) return;
    const k = decodeURIComponent(location.hash.slice(8)); const s = INV && INV.seiten.find(x => x.k === k); if (!s) return;
    const aus = (D && D.entwurf && D.entwurf.aus) || {};
    if (!AUSB[k]) { try { AUSB[k] = new Set((await api2('ausblendbar?seite=' + encodeURIComponent(k))).texte); } catch (e) { AUSB[k] = new Set(); } }
    $$('#sicht [data-texte] .textz').forEach(z => {
      if ($('.bu-aus', z)) return; const tx = s.texte[+z.dataset.i]; if (!tx) return;
      if (!AUSB[k].has(tx.text) && !aus[s.pfad + '|' + tx.text]) return;   /* nur wo Ausblenden wirklich geht */
      const schl = s.pfad + '|' + tx.text, ist = !!aus[schl];
      const chips = $('.chips', z); if (!chips) return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'kn kn--klein kn--linie bu-aus'; b.textContent = ist ? t('zeigen') : t('ausblenden');
      if (ist) { z.classList.add('bu-ist-aus'); const m = document.createElement('span'); m.className = 'marke'; m.textContent = t('ausgeblendet'); ($('.tx', z) || z).prepend(m, ' '); }
      chips.prepend(b);
      b.onclick = async () => { try { const q = await api2('aendern', { teil: 'aus', daten: { [schl]: ist ? '' : true } }); D = await api2('daten'); Z = await api2('ueberblick'); window.quittung($('[data-q]', sicht), q, { seiteK: k, seite: '/entwurf' + s.pfad, zurueck: { teil: 'aus', schluessel: schl } }); window.leiste(); $$('#sicht .bu-aus').forEach(x => x.remove()); $$('#sicht .bu-ist-aus').forEach(x => { x.classList.remove('bu-ist-aus'); const m = $('.marke', x); m && m.remove(); }); await ausblendenKnoepfe(); } catch (e) { sag2(e.message, true, e.lex); } };
    });
  }
  let ausUhr = 0;
  new MutationObserver(() => { if (!location.hash.startsWith('#seiten/') || !$('#sicht [data-texte] .textz:not([data-bu-aus])')) return; clearTimeout(ausUhr); ausUhr = setTimeout(async () => { await ausblendenKnoepfe(); $$('#sicht [data-texte] .textz').forEach(z => z.dataset.buAus = '1'); }, 30); }).observe($('#sicht'), { childList: true, subtree: true });

  /* ---------- Auftakt (R02): erst zeigen, wenn Daten und die Fotos im ersten Bild da sind (höchstens 2,5 s) ---------- */
  if ($('#app').hidden && $('#tor').hidden) document.documentElement.classList.add('bu-wartet');   /* nur, wenn noch nichts gezeichnet ist */
  let auftaktFertig = false;
  function auftakt() {
    if (auftaktFertig) return; auftaktFertig = true;
    const imgs = $$('#app img').filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width; });
    imgs.forEach(i => { i.loading = 'eager'; i.decoding = 'sync'; });
    const fertig = () => document.documentElement.classList.remove('bu-wartet');
    Promise.race([Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))), new Promise(r => setTimeout(r, 2500))]).then(fertig);
  }
  setTimeout(() => document.documentElement.classList.remove('bu-wartet'), 4000);   /* Rückfall: nie unsichtbar stehen bleiben */

  /* ---------- Nach jedem Zeichnen ---------- */
  const zeigeAlt = window.zeige;
  let erst = true;
  window.zeige = async function (frisch) {
    await zeigeAlt(frisch);
    kopfleiste(); startbild(); leisteErgaenzen(); archivKnoepfe(); googleZaehler(); zahlenKachel(); hausstil($('#sicht'));
    uebersetze($('#sicht')); uebersetze($('#rand')); uebersetze($('#leiste'));
    await buehne(); knoepfeLeiste();
    if (erst) { erst = false; auftakt(); rundgang(); fotosVorladen(); }
  };
  const leisteAlt = window.leiste;
  window.leiste = function () { leisteAlt(); leisteErgaenzen(); kopfleiste(); uebersetze($('#leiste')); knoepfeLeiste(); };
  const randAlt = window.rand;
  window.rand = function () { randAlt(); kopfleiste(); const f = $('#rand .rand__f'); if (f && !$('.bu-tour', f)) f.insertAdjacentHTML('afterbegin', `<a href="#" class="bu-tour" data-de>${h(t('rundgang_kn'))}</a>`); uebersetze($('#rand')); };
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('.bu-tour'); if (!a) return; e.preventDefault(); $('#rand').classList.remove('auf'); rundgang(true); });
  uebersetze(document.body);
  /* Lädt dieses Skript erst nach der ersten Antwort des Servers (langsames Netz), hat backstage.js schon ohne die Ergänzungen gezeichnet: neu zeichnen */
  if (!$('#app').hidden) window.zeige(true);
  else if (!$('#tor').hidden) api2('zugang').then(z => { if (!z.angemeldet) window.tor(z); }).catch(() => { /* Tür bleibt, wie sie ist */ });
})();
