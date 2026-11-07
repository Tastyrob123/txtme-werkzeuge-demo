/* Markenbuch · txtme.social. Kopie von marke/livre.js der Vorlage (Le Livre): die Marke zum Arbeiten. Bildarchiv mit fertigen
   Grössen, Dateien (Logo, Farben, Schrift), Ton und feste Sätze, Markenprüfung für Entwürfe, das Markenbuch als Kapitel (buch/).
   Daten: livre.json (gebaut von livre_bau.py), Downloads und Prüfung über den Server-Teil livre.py (serve.py, /werkzeuge/markenbuch/api/…).
   Oberfläche Englisch und Deutsch. Gespeichert wird nichts, ausser «Save result» legt auf Wunsch eine Datei auf diesem Rechner ab. Kleid: livre.css. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const PU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M3.8 7 8 11.2 12.2 7M3 14h10"/></svg>';
const PO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12V3M3.8 7 8 2.8 12.2 7M3 14h10"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const KOPIE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="1.6"/><path d="M3 10.5V3.8A1.3 1.3 0 0 1 4.3 2.5H10.5"/></svg>';
const PRUEF = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="m5.5 8 1.8 1.8L10.8 6"/></svg>';
const BUCH_I = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4.2C6.6 3 4.6 2.6 2.5 2.8v9.4c2.1-.2 4.1.2 5.5 1.4 1.4-1.2 3.4-1.6 5.5-1.4V2.8C11.4 2.6 9.4 3 8 4.2zM8 4.2v9.4"/></svg>';
const HAUS_I = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 7.2 8 2.8l5.5 4.4V13.5h-11z"/><path d="M6.4 13.5V9.6h3.2v3.9"/></svg>';
const PFEIL = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5"/></svg>';
const LOGO = '<span class="logo" aria-hidden="true"></span>';

/* ---------------------------------------------------------------- Sprachen der Oberfläche: Englisch zuerst, Deutsch als zweite */
const SPRACHEN = [['en', 'EN', 'English'], ['de', 'DE', 'Deutsch']];
const T = {
en: {
  unter: 'Brand · txtme.social', start: 'Overview', arbeiten: 'Work', nachschlagen: 'Reference', bilder: 'Photo archive', dateien: 'Logo & files', ton: 'Voice & lines', pruefung: 'Brand check', buch: 'Brand guidelines',
  pruefseite: 'Check page', anleitung: 'Guide', website: 'View website', sprache: 'Language', wege: 'Other tools',
  morgen: 'Good morning.', tag: 'Good afternoon.', abend: 'Good evening.', frage: 'What do you need today?',
  start_satz: 'The brand of txtme.social to work with: every photo in ready-made sizes for Instagram, the website and print, logo, colours and typeface as files, the voice with its fixed lines, and a check for drafts. For ambassadors, partners, shops and the team.',
  k_bilder: 'All photos of the brand, by area, format and source. Every photo as a post, a story, for the website or for print.',
  k_dateien: 'The logo for dark and light surfaces, the pixel versions, the colour values to copy and the typeface.',
  k_pruefung: 'A draft as an image or PDF. The brand check says what fits txtme and what does not, point by point.',
  k_ton: 'The voice of the brand, word for word, and the lines that are already in use. Copy them as they are.',
  k_buch: 'Logo, colours and where they come from, typeface, space, images, motion and the voice: the rules behind every design.',
  oeffnen: 'Open', lesen: 'Read',
  z_haus: 'photos of the brand', z_montage: 'montages', z_ki: 'created with AI', z_dateien: 'files',
  stand: '{0} photos · {1} files',
  recht_t: 'Image rights', recht: 'The photos belong to txtme.social and its photographers. Montages were made from txtme.social’s own material. Images created with AI are marked. For use by ambassadors, partners and shops of txtme.social only.',
  alles_zip: 'All files (ZIP)',
  b_titel: 'Photo archive', b_satz: 'Click a photo to open it. There you download it in the size you need and, for posts and stories, choose the crop.',
  suchen: 'Search, e.g. «tram» or «tee»', bereich: 'Area', format: 'Format', herkunft: 'Source', alle: 'All',
  b_shoot: 'Shoot', b_merch: 'Merch', b_app: 'App', b_hero: 'Hero', b_social: 'Instagram', b_code: 'QR code',
  f_hoch: 'Portrait', f_quer: 'Landscape', f_quadrat: 'Square',
  h_haus: 'Photos of the brand', h_montage: 'Montages', h_ki: 'Created with AI',
  im_titel: 'Design in the print workshop', im_beitrag: 'As Instagram post', im_story: 'As story', im_satz: 'Opens the print workshop with this photo and your crop.',
  treffer: '{0} of {1} photos', keine: 'No photo matches. Try one filter less.', mehr: 'Show more', zuruecksetzen: 'Reset filters',
  ki: 'AI', ki_lang: 'Created with AI', ki_satz: 'This figure was generated from studio photos of txtme.social. The back print and the QR code are real. Use it only with this note.',
  montage_satz: 'A montage from txtme.social’s own material, not a photograph.',
  quelle: 'Source', original: 'File', laden: 'Download', grossen: 'Sizes', ausschnitt: 'Crop: drag the frame in the picture.', aus_mitte: 'Reset crop',
  g_instagram: 'Instagram post', g_story: 'Story', g_web: 'Website', g_druck: 'Print',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'longest side 2000 px, JPG', i_druck: 'largest version, {0} × {1}, JPG',
  ohne_server: 'Ready-made sizes are not available right now. The button downloads the photo in website size.',
  d_titel: 'Logo & files', d_satz: 'Everything an agency, a shop or a printer needs. SVG stays sharp at any size, PNG has a transparent background.',
  d_logo: 'Logo', d_logo_s: 'The vector logo of txtme.social, three versions. Never redrawn, never reset in type.', d_pixel: 'Pixel versions', d_pixel_s: 'PNG and WebP as they are used in the shop: for places that cannot take a vector.',
  d_farben: 'Colours', d_farben_s: 'Click to copy the value. Two surfaces carry every page; cyan and pink are a word, a dot or a gradient, never a surface.', verlauf: 'Gradient',
  d_schriften: 'Typeface', d_schriften_s: 'One typeface, variable from 300 to 700, served locally. Licence: SIL Open Font License.',
  hell: 'for light surfaces', dunkel: 'for dark surfaces', kopiert: 'Copied', regeln: 'Rules in the guidelines', lizenz: 'Licence',
  t_titel: 'Voice & lines', t_satz: 'The Brand Voice of txtme.social, word for word, and the lines already in use on the site and on Instagram. Nothing is added here.',
  t_stimme: 'The voice is', t_saetze: 'Lines in use', t_kopie: 'Copy', t_buch: 'The whole voice in the guidelines',
  p_titel: 'Brand check', p_satz: 'Upload a draft, such as a poster, a post or a partner’s flyer. The colours are measured against the palette of the brand; type, logo, image and tone are not assessed here.', p_satz_ki: 'Upload a draft, such as a poster, a post or a partner’s flyer. The colours are measured against the palette of the brand, and type, logo, image and tone are assessed as well.',
  p_feld: 'Drag a draft here', p_feld2: 'or choose · image or PDF, up to 30 MB', p_waehlen: 'Choose file', p_pruefen: 'Check', p_beispiel: 'See an example',
  p_beispiel_h: 'Example: this draft was made on purpose, the way a partner might send it. The feedback is the unchanged result of the check.',
  p_probe_h: 'Only the colours were measured. Type, logo, image and tone were not assessed.',
  p_privat: 'Nothing is stored. The draft goes to the server only for the check and is gone afterwards.',
  p_schritt1: 'Measuring colours', p_schritt2: 'Looking at the draft', p_schritt3: 'Writing feedback', p_dauer: 'This takes a few seconds.',
  p_gesamt: 'Overall', p_punkte: 'Point by point', p_farben: 'Measured colours', p_farben_s: 'Measured without AI, against the palette of the brand. Photos in the draft count too.',
  p_rahmen: '{0} % of the surface in the colours of the brand', p_ton: 'In the tone of the brand', p_neu: 'Check a new draft', p_sichern: 'Save result', p_kopie: 'Copy as text',
  p_gleich: 'same', p_nah: 'close', p_fremd: 'foreign', p_naechste: 'nearest brand colour',
  p_weiss: 'Pure white on {0} % of the surface. The light surface is bone #EFECE6, text on black is off-white #F4F2EE.',
  p_grell: 'Loud foreign tones on {0} % of the surface. The brand knows no signal colours besides cyan and pink.',
  p_marke: 'Cyan and pink on {0} % of the surface. They are a word, a dot or a gradient line, never a surface.',
  u_passt: 'fits', u_achten: 'check', u_passt_nicht: 'does not fit',
  ber: { farben: 'Colours', schrift: 'Type', zeichen: 'Logo', abstand: 'Spacing', bild: 'Image', ton: 'Tone' },
  p_ki_fehler: 'The assessment was not possible just now ({0}). The colour measurement is below.', p_fehler: 'The check did not go through',
  p_seiten: '{0} pages, checked the first {1}', p_text: 'Text read', fehler_verb: 'The Brand Book does not answer right now. Reload the page in a moment and try again.',
  p_typ: 'This file cannot be checked. Choose an image (JPG, PNG or WebP) or a PDF.', p_gross: 'The file is larger than 30 MB. Save it smaller and choose it again.',
  p_riesig: 'The image is too large to check (more than 100 megapixels). Save it smaller and choose it again.', p_kaputt: 'The file cannot be read. It is empty or not a real image.',
  schliessen: 'Close', daten_fehlen: 'The data of the Brand Book could not be loaded.'
},
de: {
  unter: 'Marke · txtme.social', start: 'Übersicht', arbeiten: 'Arbeiten', nachschlagen: 'Nachschlagen', bilder: 'Bildarchiv', dateien: 'Logo & Dateien', ton: 'Ton & Sätze', pruefung: 'Markenprüfung', buch: 'Markenrichtlinien',
  pruefseite: 'Prüfseite', anleitung: 'Anleitung', website: 'Website ansehen', sprache: 'Sprache', wege: 'Andere Werkzeuge',
  morgen: 'Guten Morgen.', tag: 'Guten Tag.', abend: 'Guten Abend.', frage: 'Was brauchst du heute?',
  start_satz: 'Die Marke von txtme.social zum Arbeiten: alle Fotos in fertigen Grössen für Instagram, Website und Druck, Logo, Farben und Schrift als Dateien, die Stimme mit ihren festen Sätzen und eine Prüfung für Entwürfe. Für Botschafter, Partner, Läden und das Team.',
  k_bilder: 'Alle Fotos der Marke, nach Bereich, Format und Herkunft. Jedes Foto als Beitrag, Story, für die Website oder den Druck.',
  k_dateien: 'Das Logo für dunkle und helle Flächen, die Pixelfassungen, die Farbwerte zum Kopieren und die Schrift.',
  k_pruefung: 'Ein Entwurf als Bild oder PDF. Die Markenprüfung sagt, was zu txtme passt und was nicht, Punkt für Punkt.',
  k_ton: 'Die Stimme der Marke, Wort für Wort, und die Sätze, die schon in Gebrauch sind. So kopieren, wie sie sind.',
  k_buch: 'Logo, Farben und ihre Herkunft, Schrift, Raum, Bilder, Bewegung und die Stimme: die Regeln hinter jeder Gestaltung.',
  oeffnen: 'Öffnen', lesen: 'Lesen',
  z_haus: 'Fotos der Marke', z_montage: 'Montagen', z_ki: 'mit KI erzeugt', z_dateien: 'Dateien',
  stand: '{0} Fotos · {1} Dateien',
  recht_t: 'Bildrechte', recht: 'Die Fotos gehören txtme.social und seinen Fotografen. Montagen sind aus eigenem Material von txtme.social entstanden. Mit KI erzeugte Bilder sind gekennzeichnet. Nur für Botschafter, Partner und Läden von txtme.social.',
  alles_zip: 'Alle Dateien (ZIP)',
  b_titel: 'Bildarchiv', b_satz: 'Ein Klick auf ein Foto öffnet es. Dort lädst du es in der Grösse, die du brauchst, und wählst bei Beitrag und Story den Ausschnitt.',
  suchen: 'Suchen, z. B. «Tram» oder «Tee»', bereich: 'Bereich', format: 'Format', herkunft: 'Herkunft', alle: 'Alle',
  b_shoot: 'Shooting', b_merch: 'Merch', b_app: 'App', b_hero: 'Hero', b_social: 'Instagram', b_code: 'QR-Code',
  f_hoch: 'Hochformat', f_quer: 'Querformat', f_quadrat: 'Quadrat',
  h_haus: 'Fotos der Marke', h_montage: 'Montagen', h_ki: 'Mit KI erzeugt',
  im_titel: 'In der Druckwerkstatt gestalten', im_beitrag: 'Als Instagram-Beitrag', im_story: 'Als Story', im_satz: 'Öffnet die Druckwerkstatt mit diesem Foto und deinem Ausschnitt.',
  treffer: '{0} von {1} Fotos', keine: 'Kein Foto passt. Ein Filter weniger hilft.', mehr: 'Mehr zeigen', zuruecksetzen: 'Filter zurücksetzen',
  ki: 'KI', ki_lang: 'Mit KI erzeugt', ki_satz: 'Diese Figur ist aus Studio-Fotos von txtme.social erzeugt. Rückenprint und QR-Code sind echt. Nur mit diesem Hinweis verwenden.',
  montage_satz: 'Eine Montage aus eigenem Material von txtme.social, kein Foto.',
  quelle: 'Quelle', original: 'Datei', laden: 'Laden', grossen: 'Grössen', ausschnitt: 'Ausschnitt: das Feld im Bild ziehen.', aus_mitte: 'Ausschnitt zurücksetzen',
  g_instagram: 'Instagram-Beitrag', g_story: 'Story', g_web: 'Website', g_druck: 'Druck',
  i_instagram: '1080 × 1350, JPG', i_story: '1080 × 1920, JPG', i_web: 'längste Seite 2000 px, JPG', i_druck: 'grösste Fassung, {0} × {1}, JPG',
  ohne_server: 'Fertige Grössen sind gerade nicht verfügbar. Der Knopf lädt das Foto in Website-Grösse.',
  d_titel: 'Logo & Dateien', d_satz: 'Alles, was eine Agentur, ein Laden oder eine Druckerei braucht. SVG bleibt in jeder Grösse scharf, PNG hat einen durchsichtigen Grund.',
  d_logo: 'Logo', d_logo_s: 'Das Vektorlogo von txtme.social, drei Fassungen. Nie nachgezeichnet, nie in Schrift nachgesetzt.', d_pixel: 'Pixelfassungen', d_pixel_s: 'PNG und WebP, wie sie im Shop verwendet werden: für Stellen, die keinen Vektor nehmen.',
  d_farben: 'Farben', d_farben_s: 'Ein Klick kopiert den Wert. Zwei Flächen tragen jede Seite; Türkis und Pink sind ein Wort, ein Punkt oder ein Verlauf, nie eine Fläche.', verlauf: 'Verlauf',
  d_schriften: 'Schrift', d_schriften_s: 'Eine Schrift, variabel von 300 bis 700, lokal ausgeliefert. Lizenz: SIL Open Font License.',
  hell: 'für helle Flächen', dunkel: 'für dunkle Flächen', kopiert: 'Kopiert', regeln: 'Regeln in den Richtlinien', lizenz: 'Lizenz',
  t_titel: 'Ton & Sätze', t_satz: 'Die Brand Voice von txtme.social, Wort für Wort im Original, und die Sätze, die schon auf der Website und auf Instagram stehen. Hier wird nichts dazugedichtet.',
  t_stimme: 'Die Stimme ist', t_saetze: 'Sätze in Gebrauch', t_kopie: 'Kopieren', t_buch: 'Die ganze Stimme in den Richtlinien',
  p_titel: 'Markenprüfung', p_satz: 'Lade einen Entwurf hoch, etwa ein Plakat, einen Beitrag oder den Flyer eines Partners. Die Farben werden gegen die Palette der Marke gemessen; Schrift, Logo, Bild und Ton werden hier nicht beurteilt.', p_satz_ki: 'Lade einen Entwurf hoch, etwa ein Plakat, einen Beitrag oder den Flyer eines Partners. Die Farben werden gegen die Palette der Marke gemessen, Schrift, Logo, Bild und Ton werden ebenfalls beurteilt.',
  p_feld: 'Entwurf hierher ziehen', p_feld2: 'oder wählen · Bild oder PDF, bis 30 MB', p_waehlen: 'Datei wählen', p_pruefen: 'Prüfen', p_beispiel: 'Beispiel ansehen',
  p_beispiel_h: 'Beispiel: Dieser Entwurf ist eigens gebaut, so wie ihn ein Partner schicken könnte. Die Rückmeldung stammt unverändert von der Prüfung.',
  p_probe_h: 'Nur die Farben wurden gemessen. Schrift, Logo, Bild und Ton wurden nicht beurteilt.',
  p_privat: 'Nichts wird gespeichert. Der Entwurf geht nur für die Prüfung an den Server und ist danach weg.',
  p_schritt1: 'Farben messen', p_schritt2: 'Entwurf ansehen', p_schritt3: 'Rückmeldung schreiben', p_dauer: 'Das dauert ein paar Sekunden.',
  p_gesamt: 'Insgesamt', p_punkte: 'Punkt für Punkt', p_farben: 'Gemessene Farben', p_farben_s: 'Ohne KI gemessen, gegen die Palette der Marke. Fotos im Entwurf zählen mit.',
  p_rahmen: '{0} % der Fläche in den Farben der Marke', p_ton: 'Im Ton der Marke', p_neu: 'Neuen Entwurf prüfen', p_sichern: 'Ergebnis sichern', p_kopie: 'Als Text kopieren',
  p_gleich: 'gleich', p_nah: 'nah', p_fremd: 'fremd', p_naechste: 'nächste Markenfarbe',
  p_weiss: 'Reinweiss auf {0} % der Fläche. Die helle Fläche ist Knochenweiss #EFECE6, Text auf Schwarz ist Off-White #F4F2EE.',
  p_grell: 'Grelle fremde Töne auf {0} % der Fläche. Die Marke kennt neben Türkis und Pink keine Signalfarben.',
  p_marke: 'Türkis und Pink auf {0} % der Fläche. Sie sind ein Wort, ein Punkt oder eine Verlaufslinie, nie eine Fläche.',
  u_passt: 'passt', u_achten: 'achten', u_passt_nicht: 'passt nicht',
  ber: { farben: 'Farben', schrift: 'Schrift', zeichen: 'Logo', abstand: 'Abstand', bild: 'Bild', ton: 'Ton' },
  p_ki_fehler: 'Die Beurteilung war gerade nicht möglich ({0}). Die Messung der Farben steht unten.', p_fehler: 'Die Prüfung ging nicht durch',
  p_seiten: '{0} Seiten, geprüft die ersten {1}', p_text: 'Gelesener Text', fehler_verb: 'Das Markenbuch antwortet gerade nicht. Lade die Seite gleich neu und versuche es noch einmal.',
  p_typ: 'Diese Datei lässt sich nicht prüfen. Bitte ein Bild (JPG, PNG oder WebP) oder ein PDF wählen.', p_gross: 'Die Datei ist grösser als 30 MB. Kleiner sichern und noch einmal wählen.',
  p_riesig: 'Das Bild ist zu gross zum Prüfen (mehr als 100 Megapixel). Kleiner sichern und noch einmal wählen.', p_kaputt: 'Die Datei lässt sich nicht lesen. Sie ist leer oder kein echtes Bild.',
  schliessen: 'Schliessen', daten_fehlen: 'Die Daten des Markenbuchs liessen sich nicht laden.'
}
};
let SP = (() => { try { const q = new URLSearchParams(location.search).get('sprache'); if (q && T[q]) return q; const m = localStorage.getItem('markenbuch-sprache'); return m && T[m] ? m : 'en'; } catch (e) { return 'en'; } })();
const t = (k, ...a) => { let s = (T[SP] && T[SP][k] != null ? T[SP][k] : T.en[k]); if (typeof s === 'string') a.forEach((x, i) => { s = s.split('{' + i + '}').join(x); }); return s; };
const zahl = n => Number(n).toLocaleString(SP === 'de' ? 'de-CH' : 'en-GB');
const NAME = () => (S.d && S.d.name && (S.d.name[SP] || S.d.name.en)) || 'Brand Book';
const sp2 = x => (x && typeof x === 'object') ? (x[SP] || x.en || '') : (x || '');

/* ---------------------------------------------------------------- Zustand */
const S = { d: null, server: null, ansicht: 'start', f: { q: '', b: 'alle', f: 'alle', h: 'alle' }, n: 48, datei: null, lauf: null, ergebnis: null };
const ANSICHTEN = ['start', 'bilder', 'dateien', 'ton', 'pruefung'];
const GRENZE = 30e6;
const FORMATE = { instagram: [1080, 1350], story: [1080, 1920] };
const BUCH = () => 'buch/' + (SP === 'de' ? 'de.html' : '');
const ANLEITUNG = () => 'anleitung/' + (SP === 'de' ? 'de.html' : '');
/* Bühne R16: je Ansicht ein Foto der Marke, das in dieser Ansicht nicht schon im ersten Bild steht (Fehlerbuch 20.10.: kein Foto zweimal auf einem Bildschirm) */
const BUEHNE = { start: 'shoot-hero-wide', bilder: 'shoot-night', dateien: 'shoot-desk', ton: 'shoot-laugh', pruefung: 'shoot-print' };

/* ---------------------------------------------------------------- Grundgerüst */
function kopf() {
  const titel = { start: t('start'), bilder: t('bilder'), dateien: t('dateien'), ton: t('ton'), pruefung: t('pruefung') }[S.ansicht];
  const st = S.d ? t('stand', zahl(S.d.stand.fotos), zahl(S.d.stand.dateien)) : '';
  const akt = SPRACHEN.find(x => x[0] === SP);
  const W = S.d.wege || {};
  $('#kopf').innerHTML = `
    <button class="kopf__marke" type="button" data-gehe="start" aria-label="${esc(t('start'))}">${LOGO}<span><b>${esc(NAME())}</b><small>${esc(t('unter'))}</small></span></button>
    <div class="kopf__mitte"><div class="kopf__titel">${esc(titel)}</div><div class="kopf__stand">${esc(st)}</div></div>
    <div class="kopf__werk">
      <div class="li-sp"><button class="li-sp__k" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(t('sprache'))}">${esc(akt[1])}<i>${PFEIL}</i></button>
        <ul role="listbox">${SPRACHEN.map(([k, kurz, name]) => `<li><button type="button" role="option" data-sp="${k}" ${k === SP ? 'aria-selected="true"' : ''}><span>${esc(name)}</span><small>${esc(kurz)}</small></button></li>`).join('')}</ul></div>
      <a class="rund" href="${ANLEITUNG()}" target="_blank" rel="noopener" data-tip="${esc(t('anleitung'))}" aria-label="${esc(t('anleitung'))}">${BUCH_I}</a>
      <a class="rund" href="pruefung.html" target="_blank" rel="noopener" data-tip="${esc(t('pruefseite'))}" aria-label="${esc(t('pruefseite'))}">${PRUEF}</a>
      ${W.backstage ? `<a class="rund" href="${esc(W.backstage.url)}" data-tip="${esc(sp2(W.backstage))}" aria-label="${esc(sp2(W.backstage))}">${HAUS_I}</a>` : ''}
      <span class="kopf__trenn"></span>
      <a class="kn kn--klein" href="${BUCH()}">${esc(t('buch'))}<i>${PF}</i></a>
    </div>`;
  $$('#kopf [data-gehe]').forEach(x => x.onclick = () => gehe(x.dataset.gehe));
  const sp = $('.li-sp'), k = $('.li-sp__k');
  k.onclick = e => { e.stopPropagation(); const o = sp.classList.toggle('offen'); k.setAttribute('aria-expanded', o); };
  $$('[data-sp]', sp).forEach(b => b.onclick = () => wechsle(b.dataset.sp));
}
document.addEventListener('click', () => { const sp = $('.li-sp'); if (sp) { sp.classList.remove('offen'); $('.li-sp__k').setAttribute('aria-expanded', false); } });

function rand() {
  const nw = (key, name, zahl = '') => `<button class="nw" type="button" data-gehe="${key}" ${S.ansicht === key ? 'aria-current="true"' : ''}><span>${esc(name)}</span>${zahl ? `<em>${esc(zahl)}</em>` : ''}</button>`;
  const W = S.d.wege || {};
  $('#rand').innerHTML = `
    <button class="rand__auf" type="button" aria-expanded="false">${esc(NAME())}<i></i></button>
    <nav class="nav" aria-label="${esc(NAME())}">
      ${nw('start', t('start'))}
      <p>${esc(t('arbeiten'))}</p>
      ${nw('bilder', t('bilder'), S.d ? zahl(S.d.stand.fotos) : '')}${nw('dateien', t('dateien'), S.d ? zahl(S.d.stand.dateien) : '')}${nw('pruefung', t('pruefung'))}
      <p>${esc(t('nachschlagen'))}</p>
      ${nw('ton', t('ton'))}
      <a class="nw" href="${BUCH()}"><span>${esc(t('buch'))}</span><em>${PF}</em></a>
    </nav>
    <div class="wege">
      <a href="${ANLEITUNG()}" target="_blank" rel="noopener">${esc(t('anleitung'))}${PF}</a>
      <a href="${esc(S.d.haus.website)}" target="_blank" rel="noopener">${esc(t('website'))}${PF}</a>
      ${Object.keys(W).map(k => `<a href="${esc(W[k].url)}" target="_blank" rel="noopener">${esc(sp2(W[k]))}${PF}</a>`).join('')}
      <a href="pruefung.html" target="_blank" rel="noopener">${esc(t('pruefseite'))}${PF}</a>
    </div>`;
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => { gehe(b.dataset.gehe); $('#rand').classList.remove('auf'); });
  $('#rand .rand__auf').onclick = e => { const auf = $('#rand').classList.toggle('auf'); e.currentTarget.setAttribute('aria-expanded', auf); };
}

function leiste() {
  $('#leiste').innerHTML = `<span class="li-recht__z">${LOGO}</span><div class="leiste__t"><b>${esc(t('recht_t'))}</b><span>${esc(t('recht'))}</span></div>
    <a class="kn kn--klein kn--brand" href="dateien/${esc(S.d.zip)}" download>${esc(t('alles_zip'))}<i>${PU}</i></a>`;
}

function gehe(a) {
  S.ansicht = a;
  try { localStorage.setItem('markenbuch-ansicht', a); } catch (e) { /* privat */ }
  history.replaceState(null, '', '#' + a);
  kopf(); rand(); zeichne();
  scrollTo({ top: 0 });
}
function wechsle(sp) {
  SP = sp;
  try { localStorage.setItem('markenbuch-sprache', sp); } catch (e) { /* privat */ }
  document.documentElement.lang = sp === 'de' ? 'de-CH' : sp;
  kopf(); rand(); leiste(); zeichne(true);
}

function titel(mono, h1, satz, kn = '') {
  const f = fotoVon(BUEHNE[S.ansicht]);
  return `<header class="titel" data-r${f ? ` data-kb="${esc(f.klein)}"` : ''}><span class="zier"><i></i><span>${esc(mono)}</span><i></i></span><h1>${h1}</h1>${satz ? `<p class="satz">${esc(satz)}</p>` : ''}${kn ? `<div class="titel__kn">${kn}</div>` : ''}</header>`;
}
function zwei(s) { const i = s.lastIndexOf(' '); return i > 0 ? `${esc(s.slice(0, i))} <em>${esc(s.slice(i + 1))}</em>` : esc(s); }

function zeichne(still = false) {
  if (S.mehrIO) { S.mehrIO.disconnect(); S.mehrIO = null; }
  const el = $('#ansicht');
  const a = S.ansicht;
  el.innerHTML = a === 'bilder' ? bilder() : a === 'dateien' ? dateien() : a === 'ton' ? ton() : a === 'pruefung' ? pruefung() : start();
  if (a === 'bilder') bilderLeben(); else if (a === 'dateien') dateienLeben(); else if (a === 'ton') dateienLeben(); else if (a === 'pruefung') pruefungLeben(); else startLeben();
  auftritte(el, still);
}

/* Auftritte: von unten herein, sobald im Bild (nur transform und opacity, der Takt des Shops) */
let IO = null, IO2 = null;
function auftritte(r, still) {
  const alle = $$('[data-r]', r).filter(x => !x.classList.contains('da'));
  if (still || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { alle.forEach(x => x.classList.add('da')); return; }
  if (!IO) IO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('da'); IO.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .01 });
  if (!IO2) IO2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('da'); IO2.unobserve(e.target); } }), { rootMargin: '0px 0px 320px 0px', threshold: 0 });
  alle.forEach(x => (x.classList.contains('li-f') ? IO2 : IO).observe(x));
}

/* ---------------------------------------------------------------- Übersicht */
function fotoVon(k) { return S.d.fotos.find(x => x.k === k); }
function bildKlein(k) { const f = fotoVon(k); return f ? f.klein : ''; }
function start() {
  const h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? t('morgen') : h >= 11 && h < 18 ? t('tag') : t('abend');
  const st = S.d.stand;
  const karte = (ziel, mono, name, satz, inhalt, i) => `<button class="li-k" type="button" data-gehe="${ziel}" data-r style="--i:${i}">
      <span class="li-k__b">${inhalt}</span>
      <span class="li-k__n"><small>${esc(mono)}</small><b>${esc(name)}</b><span>${esc(satz)}</span><i class="li-k__p">${PF}</i></span></button>`;
  return `${titel(`${NAME()} · ${S.d.haus.name}`, `${esc(gruss)} <em>${esc(t('frage'))}</em>`, t('start_satz'), `<a class="kn kn--linie" href="${ANLEITUNG()}" target="_blank" rel="noopener">${esc(t('anleitung'))}<i>${PF}</i></a>`)}
    <div class="li-karten">
      ${karte('bilder', zahl(st.fotos), t('bilder'), t('k_bilder'), `<span class="li-stapel"><img src="${bildKlein('shoot-friends')}" alt="" decoding="sync"><img src="${bildKlein('shoot-hero')}" alt="" decoding="sync"><img src="${bildKlein('products-tee-fp-black-back')}" alt="" decoding="sync"></span>`, 0)}
      ${karte('dateien', zahl(st.dateien), t('dateien'), t('k_dateien'), `<span class="li-logo"><img src="dateien/txtme-logo-white.svg" alt="" decoding="sync"></span>`, 1)}
      ${karte('pruefung', 'ΔE 2000', t('pruefung'), t('k_pruefung'), `<span class="li-pr-bild"><span class="li-pr-f">${S.d.farben.slice(0, 10).map(x => `<i style="background:${x.h}"></i>`).join('')}</span><span class="li-pr-de"><b>ΔE</b><small>2000</small></span></span>`, 2)}
      ${karte('ton', '«»', t('ton'), t('k_ton'), `<span class="li-ton-bild"><q>${esc(S.d.saetze[0].satz)}</q></span>`, 3)}
    </div>
    <div class="platte li-zahlen" data-r>
      <div><b>${zahl(st.haus)}</b><span>${esc(t('z_haus'))}</span></div>
      <div><b>${zahl(st.montage)}</b><span>${esc(t('z_montage'))}</span></div>
      <div><b>${zahl(st.ki)}</b><span>${esc(t('z_ki'))}</span></div>
      <div><b>${zahl(st.dateien)}</b><span>${esc(t('z_dateien'))}</span></div>
    </div>
    <a class="platte li-buch" href="${BUCH()}" data-r>
      <span class="li-buch__b"><img src="${bildKlein('shoot-print')}" alt="" loading="lazy" decoding="async"></span>
      <span class="li-buch__t"><small class="mono">${esc(t('nachschlagen'))}</small><b>${esc(t('buch'))}</b><span>${esc(t('k_buch'))}</span></span>
      <span class="kn">${esc(t('lesen'))}<i>${PF}</i></span>
    </a>`;
}
function startLeben() { $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe)); }

/* ---------------------------------------------------------------- Bildarchiv */
function titelVon(f) { return (f.t && (f.t[SP] || f.t.en)) || f.k; }
function gefiltert() {
  const F = S.f, q = F.q.trim().toLowerCase();
  return S.d.fotos.filter(f => (F.b === 'alle' || f.b === F.b) && (F.f === 'alle' || f.f === F.f || (F.f === 'quer' && f.f === 'quadrat'))
    && (F.h === 'alle' || f.art === F.h) && (!q || Object.values(f.t).join(' ').toLowerCase().includes(q) || f.k.includes(q) || t('b_' + f.b).toLowerCase().includes(q)));
}
function wahl(key, werte) {
  return `<div class="li-wahl"><span class="mono">${esc(t(key === 'b' ? 'bereich' : key === 'f' ? 'format' : 'herkunft'))}</span><div class="wahl2" role="group">
    ${[['alle', t('alle')], ...werte].map(([w, n]) => `<button type="button" data-f="${key}" data-w="${w}" aria-pressed="${S.f[key] === w}">${esc(n)}</button>`).join('')}</div></div>`;
}
function bilder() {
  return `${titel(t('bilder'), zwei(t('b_titel')), t('b_satz'))}
    <div class="platte li-filter" data-r>
      <label class="suche li-suche">${LUPE}<input type="search" id="li-q" value="${esc(S.f.q)}" placeholder="${esc(t('suchen'))}" autocomplete="off"></label>
      ${wahl('b', S.d.bereiche.map(b => [b, t('b_' + b)]))}
      <div class="li-wahl-reihe">${wahl('f', [['hoch', t('f_hoch')], ['quer', t('f_quer')]])}${wahl('h', [['haus', t('h_haus')], ['montage', t('h_montage')], ['ki', t('h_ki')]])}</div>
      <p class="li-treffer"><span id="li-n"></span><button class="link" type="button" id="li-reset">${esc(t('zuruecksetzen'))}</button></p>
    </div>
    <div class="li-raster" id="li-raster"></div>
    <div class="li-mehr" id="li-mehr"></div>`;
}
function kachel(f, i) {
  return `<button class="li-f li-f--${f.f} li-f--${f.b}" type="button" data-k="${f.k}" data-r style="--i:${i % 6}" aria-label="${esc(titelVon(f))}">
    <img src="${esc(f.klein)}" alt="" loading="lazy" decoding="async">
    ${f.ki ? `<span class="li-ki" title="${esc(t('ki_lang'))}">${esc(t('ki'))}</span>` : ''}
    <span class="li-f__n">${esc(titelVon(f))}</span></button>`;
}
function raster(neu = false, mehr = false) {
  if (!$('#li-raster') || !$('#li-n')) { if (S.mehrIO) S.mehrIO.disconnect(); return; }   /* Ansicht schon gewechselt: der Nachlade-Beobachter darf nicht ins Leere schreiben */
  const L = gefiltert();
  if (neu) S.n = 48;
  $('#li-n').textContent = t('treffer', zahl(L.length), zahl(S.d.fotos.length));
  const r = $('#li-raster');
  const vor = mehr && !r.querySelector('.li-leer') ? r.children.length : 0;
  if (vor) r.insertAdjacentHTML('beforeend', L.slice(vor, S.n).map((f, i) => kachel(f, vor + i)).join(''));
  else r.innerHTML = L.length ? L.slice(0, S.n).map(kachel).join('') : `<p class="li-leer">${esc(t('keine'))}</p>`;
  $('#li-mehr').innerHTML = L.length > S.n ? `<button class="kn kn--linie" type="button" id="li-mehr-k">${esc(t('mehr'))}<i>${PF}</i></button>` : '';
  if ($('#li-mehr-k')) $('#li-mehr-k').onclick = () => { S.n += 48; raster(false, true); };
  [].slice.call(r.children, vor).forEach(b => { if (b.dataset.k) b.onclick = () => detail(b.dataset.k); });
  auftritte(r);
  if (S.mehrIO) S.mehrIO.disconnect();
  if ($('#li-mehr-k') && 'IntersectionObserver' in window) { S.mehrIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { S.n += 48; raster(false, true); } }, { rootMargin: '600px' }); S.mehrIO.observe($('#li-mehr-k')); }
}
function bilderLeben() {
  raster(true);
  let uhr;
  $('#li-q').oninput = e => { clearTimeout(uhr); uhr = setTimeout(() => { S.f.q = e.target.value; raster(true); }, 160); };
  $$('[data-f]').forEach(b => b.onclick = () => {
    S.f[b.dataset.f] = b.dataset.w;
    $$(`[data-f="${b.dataset.f}"]`).forEach(x => x.setAttribute('aria-pressed', x === b));
    raster(true);
  });
  $('#li-reset').onclick = () => { S.f = { q: '', b: 'alle', f: 'alle', h: 'alle' }; zeichne(true); };
}

/* Detail: grosses Bild, Herkunft, Grössen, Ausschnitt für Beitrag und Story */
function detail(k) {
  const f = fotoVon(k); if (!f) return;
  const fx = { instagram: { x: .5, y: .5 }, story: { x: .5, y: .5 } };
  let aktiv = 'instagram';
  const DRUCK = (S.d.wege && S.d.wege.druck && S.d.wege.druck.url) || '';
  const imp = g => `${DRUCK}?foto=${encodeURIComponent(k)}&art=${g === 'story' ? 'story' : 'insta'}&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}`;
  const link = g => S.server ? `api/bild?k=${encodeURIComponent(k)}&f=${g}${fx[g] ? `&x=${fx[g].x.toFixed(3)}&y=${fx[g].y.toFixed(3)}` : ''}` : f.gross;
  const zeile = g => `<li class="li-gr" data-g="${g}"><span><b>${esc(t('g_' + g))}</b><small>${esc(g === 'druck' ? t('i_druck', zahl(f.w), zahl(f.h)) : t('i_' + g))}</small></span>
    <a class="kn kn--klein" href="${link(g)}" download data-laden="${g}">${esc(t('laden'))}<i>${PU}</i></a></li>`;
  const art = f.art === 'ki' ? `<p class="li-hinweis li-hinweis--ki"><b>${esc(t('ki_lang'))}</b>${esc(t('ki_satz'))}</p>` : f.art === 'montage' ? `<p class="li-hinweis li-hinweis--leise">${esc(t('montage_satz'))}</p>` : '';
  fenster(`<div class="li-det">
    <div class="li-det__b"><div class="li-det__bild li-det__bild--${f.b}" id="li-bild"><img src="${esc(f.gross)}" alt="${esc(titelVon(f))}" decoding="async" draggable="false"><span class="li-rahmen" id="li-rahmen" hidden></span></div>
      <p class="leise li-det__hilfe">${esc(t('ausschnitt'))} <button class="link" type="button" id="li-mitte" hidden>${esc(t('aus_mitte'))}</button></p></div>
    <div class="li-det__t">
      <p class="mono">${esc(t('b_' + f.b))} · ${esc(t('f_' + f.f))}</p>
      <h2>${esc(titelVon(f))}</h2>
      ${art}
      <dl class="li-meta"><dt>${esc(t('quelle'))}</dt><dd>${esc(sp2(f.q))}</dd><dt>${esc(t('original'))}</dt><dd>${zahl(f.w)} × ${zahl(f.h)} px · ${esc(f.gross.split('/').pop())}</dd></dl>
      <p class="mono li-det__gr">${esc(t('grossen'))}</p>
      <ul class="li-grl">${['instagram', 'story', 'web', 'druck'].map(zeile).join('')}</ul>
      ${S.server ? '' : `<p class="leise">${esc(t('ohne_server'))}</p>`}
      ${DRUCK ? `<div class="li-imp"><p class="mono li-det__gr">${esc(t('im_titel'))}</p>
        <div class="li-imp__k"><a class="kn kn--klein" data-imp="instagram" href="${imp('instagram')}" target="_blank" rel="noopener">${esc(t('im_beitrag'))}<i>${PF}</i></a><a class="kn kn--klein kn--linie" data-imp="story" href="${imp('story')}" target="_blank" rel="noopener">${esc(t('im_story'))}<i>${PF}</i></a></div>
        <p class="leise">${esc(t('im_satz'))}</p></div>` : ''}
    </div></div>`);
  const bildEl = $('#li-bild'), rahmen = $('#li-rahmen'), img = $('img', bildEl);
  img.addEventListener('dragstart', e => e.preventDefault());
  function setze() {
    const g = FORMATE[aktiv];
    if (!img.naturalWidth) { rahmen.hidden = true; return; }
    const W = bildEl.clientWidth, H = bildEl.clientHeight, ziel = g ? g[0] / g[1] : W / H;
    let w = W, h = H;
    if (W / H > ziel) w = H * ziel; else h = W / ziel;
    const p = fx[aktiv] || { x: .5, y: .5 };
    rahmen.classList.toggle('li-rahmen--ganz', !g);
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    rahmen.style.transform = `translate(${(W - w) * p.x}px,${(H - h) * p.y}px)`;
    const lang = 2000, sk = Math.min(1, lang / Math.max(f.w, f.h)), masse = g ? `${g[0]} × ${g[1]}` : aktiv === 'web' ? `${Math.round(f.w * sk)} × ${Math.round(f.h * sk)}` : `${zahl(f.w)} × ${zahl(f.h)}`;
    if (w > W - 6 && h > H - 6) { w -= 12; h -= 12; rahmen.style.transform = `translate(6px,6px)`; }
    rahmen.style.width = w + 'px'; rahmen.style.height = h + 'px';
    rahmen.dataset.g = t('g_' + aktiv) + ' · ' + masse + ' px';
    rahmen.classList.remove('blitz'); void rahmen.offsetWidth; rahmen.classList.add('blitz');
    rahmen.hidden = false;
    $$('[data-laden]').forEach(a => a.href = link(a.dataset.laden));
    $$('[data-imp]').forEach(a => a.href = imp(a.dataset.imp));
    $('#li-mitte').hidden = Object.values(fx).every(q => Math.abs(q.x - .5) < .002 && Math.abs(q.y - .5) < .002);
  }
  /* Ausschnitt zurück auf die Mitte, für Beitrag und Story (Abnahme 2 N12) */
  $('#li-mitte').onclick = () => { fx.instagram = { x: .5, y: .5 }; fx.story = { x: .5, y: .5 }; setze(); };
  img.complete ? setze() : img.addEventListener('load', setze);
  $$('.li-gr').forEach(li => {
    const an = () => { aktiv = li.dataset.g; $$('.li-gr').forEach(x => x.classList.toggle('an', x === li)); setze(); };
    li.addEventListener('mouseenter', an); li.addEventListener('focusin', an);
  });
  $('.li-gr').classList.add('an');
  let zug = null;
  rahmen.addEventListener('pointerdown', e => { e.preventDefault(); zug = { x: e.clientX, y: e.clientY, p: { ...fx[aktiv] } }; rahmen.setPointerCapture(e.pointerId); rahmen.classList.add('zieht'); });
  rahmen.addEventListener('pointermove', e => {
    if (!zug) return;
    const W = bildEl.clientWidth, H = bildEl.clientHeight, w = rahmen.offsetWidth, h = rahmen.offsetHeight;
    fx[aktiv] = { x: W - w > 1 ? Math.min(1, Math.max(0, zug.p.x + (e.clientX - zug.x) / (W - w))) : .5, y: H - h > 1 ? Math.min(1, Math.max(0, zug.p.y + (e.clientY - zug.y) / (H - h))) : .5 };
    setze();
  });
  const los = () => { zug = null; rahmen.classList.remove('zieht'); };
  rahmen.addEventListener('pointerup', los); rahmen.addEventListener('pointercancel', los);
  addEventListener('resize', setze, { once: true });
}

/* ---------------------------------------------------------------- Dateien */
function gr(n) { const b = S.d.groessen[n]; return b ? (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB') : ''; }
function knoepfe(liste) {
  return liste.map(n => `<a class="kn kn--klein ${/\.(png|webp|json|txt)$/.test(n) ? 'kn--linie' : ''}" href="dateien/${esc(n)}" download title="${esc(n)} · ${gr(n)}">${esc(n.split('.').pop().toUpperCase())}<i>${PU}</i></a>`).join('');
}
function block(k, titel, satz, inhalt, i) { return `<section class="li-d" id="d-${k}" data-r style="--i:${i % 2}"><header><h2 class="li-d__t">${zwei(titel)}</h2><p class="leise">${esc(satz)}</p></header>${inhalt}</section>`; }
function dateien() {
  const D = Object.fromEntries(S.d.dateien.map(x => [x.k, x]));
  const tafeln = e => `<div class="li-tafeln">${e.var.map(v => `<figure class="li-tafel li-tafel--${v.grund}">
      <div class="li-tafel__f"><img src="dateien/${esc(v.dateien[0])}" alt="" loading="lazy" decoding="async"></div>
      <figcaption><span><b>${esc(sp2(v.n) || v.dateien[0])}</b><small>${esc(v.s ? sp2(v.s) : (v.px ? v.px[0] + ' × ' + v.px[1] + ' px · ' : '') + v.dateien[0])}</small></span><span class="li-kn">${knoepfe(v.dateien)}</span></figcaption></figure>`).join('')}</div>`;
  const farbe = (f, i) => `<button class="li-farbe" type="button" data-kopie="${f.h}" style="--c:${f.h};--i:${i % 6}" data-r>
      <span class="li-farbe__f"><span class="li-farbe__ok">${esc(t('kopiert'))}</span></span>
      <span class="li-farbe__n"><b>${esc(f.n)}</b><small>${esc(sp2(f.r))}</small></span>
      <span class="li-farbe__w"><span data-kopie-w="${f.h}">${f.h}</span><span data-kopie-w="rgb(${f.rgb.join(', ')})">RGB ${f.rgb.join(' · ')}</span></span></button>`;
  const gruppen = [];
  S.d.farben.forEach(f => { let g = gruppen.find(x => x.k === f.g); if (!g) { g = { k: f.g, n: f.gn, s: f.gs, l: [] }; gruppen.push(g); } g.l.push(f); });
  const farben = gruppen.map(g => `<div class="li-fg"><div class="li-fg__k"><b>${esc(sp2(g.n))}</b><small>${esc(sp2(g.s))}</small></div><div class="li-farben">${g.l.map(farbe).join('')}</div></div>`).join('')
    + `<div class="li-fg"><div class="li-fg__k"><b>${esc(SP === 'de' ? 'Text auf Knochenweiss' : 'Text on bone')}</b><small>${esc(SP === 'de' ? 'Die helle Fläche dreht die Tokens.' : 'The light surface turns the tokens.')}</small></div><div class="li-farben">${S.d.bone_text.map((f, i) => farbe({ ...f, r: SP === 'de' ? 'Text auf Knochenweiss' : 'text on bone', rgb: hexRgb(f.h) }, i)).join('')}</div></div>`
    + `<div class="li-fg"><div class="li-fg__k"><b>${esc(t('verlauf'))}</b><small>${esc(sp2(S.d.verlauf_satz))}</small></div><div class="li-farben">${S.d.verlaeufe.map((f, i) => `<button class="li-farbe li-farbe--glanz" type="button" data-kopie="${esc(f.v)}" style="--c:${esc(f.v)};--i:${i % 6}" data-r>
      <span class="li-farbe__f"><span class="li-farbe__ok">${esc(t('kopiert'))}</span></span>
      <span class="li-farbe__n"><b>${esc(sp2(f.n))}</b><small>${esc(sp2(f.r))}</small></span>
      <span class="li-farbe__w"><span data-kopie-w="${esc(f.v)}">${f.s.join(' → ')}</span><span>${esc(t('verlauf'))}</span></span></button>`).join('')}</div></div>`;
  const sch = S.d.schrift;
  const schrift = `<ul class="li-schriften"><li class="li-schrift"><span class="li-schrift__p">${esc(S.d.haus.name)} · 300 → 700</span><span><b>${esc(sch.name)}</b><small>${esc(sch.gewichte)} · ${esc(sp2(sch.satz))}</small></span>
      <span class="li-kn"><a class="kn kn--klein kn--linie" href="dateien/${esc(sch.datei)}" download>WOFF2<i>${PU}</i></a><a class="kn kn--klein kn--linie" href="dateien/SpaceGrotesk-OFL.txt" download>${esc(t('lizenz'))}<i>${PU}</i></a></span></li></ul>
    <ul class="li-rollen">${sch.rollen.map(r => `<li><span class="li-rolle__p" style="font-weight:${r.w.split(',')[0]};letter-spacing:${r.l.replace('−', '-').split(',')[0]};${/capitals|Versalien/.test(r.w) ? 'text-transform:uppercase;' : ''}">Aa</span><span><b>${esc(sp2(r.e))}</b><small>${esc(r.p || r.g)} · ${esc(r.w)} · ${esc(r.z)} · ${esc(r.l)}</small></span></li>`).join('')}</ul>`;
  return `${titel(t('dateien'), zwei(t('d_titel')), t('d_satz'), `<a class="kn kn--brand" href="dateien/${esc(S.d.zip)}" download>${esc(t('alles_zip'))}<i>${PU}</i></a><a class="kn kn--linie" href="${BUCH()}#k2">${esc(t('regeln'))}<i>${PF}</i></a>`)}
    ${block('logo', t('d_logo'), t('d_logo_s'), tafeln(D.logo), 0)}
    ${block('pixel', t('d_pixel'), t('d_pixel_s'), tafeln(D.pixel), 1)}
    ${block('farben', t('d_farben'), t('d_farben_s'), `${farben}<div class="li-kn li-kn--mitte">${knoepfe(D.farben.dateien)}</div>`, 0)}
    ${block('schrift', t('d_schriften'), t('d_schriften_s'), schrift, 1)}`;
}
function hexRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function kopiere(w, el) {
  const ok = () => { if (el) { el.classList.add('kopiert'); setTimeout(() => el.classList.remove('kopiert'), 1400); } melde(t('kopiert') + ' · ' + w.slice(0, 80)); };
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(w).then(ok, () => alt());
  else alt();
  function alt() { const x = document.createElement('textarea'); x.value = w; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); ok(); } catch (e) { /* nichts */ } x.remove(); }
}
function dateienLeben() {
  $$('[data-kopie]').forEach(b => b.onclick = e => { const w = e.target.closest('[data-kopie-w]'); kopiere(w ? w.dataset.kopieW : b.dataset.kopie, b); });
}

/* ---------------------------------------------------------------- Ton & feste Sätze (Brand Voice wörtlich, Sätze in Gebrauch) */
function ton() {
  const bv = S.d.voice;
  const li = l => `<ul class="li-vl">${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const saetze = S.d.saetze.map((s, i) => `<li class="li-satz" data-r style="--i:${i}"><q>${esc(s.satz)}</q><span><small>${esc(sp2(s.wo))}</small><button class="kn kn--klein kn--linie" type="button" data-kopie="${esc(s.satz)}">${esc(t('t_kopie'))}<i>${KOPIE}</i></button></span></li>`).join('');
  return `${titel(t('ton'), zwei(t('t_titel')), t('t_satz'), `<a class="kn kn--linie" href="${BUCH()}#k1">${esc(t('t_buch'))}<i>${PF}</i></a>`)}
    <section class="platte li-voice" data-r>
      <p class="mono">${esc(bv.titel)}</p>
      <p class="li-voice__kern">${esc(bv.kern)}</p>
      <div class="li-voice__r">
        <div><p class="mono">${esc(t('t_stimme'))}</p>${li(bv.stimme)}</div>
        <div><p class="li-voice__haltung">${bv.haltung.map(esc).join('<br>')}</p></div>
        <div><p class="mono">${esc(bv.ton_titel)}</p><p class="li-voice__ton">${esc(bv.ton)}</p><p class="leise">${esc(bv.gefuehl_vor)}</p>${li(bv.gefuehl)}<p class="leise">${esc(bv.grenze)}</p></div>
        <div><p class="mono">${esc(bv.themen_titel)}</p>${li(bv.themen)}</div>
        <div><p class="mono">${esc(bv.stil_titel)}</p>${li(bv.stil)}</div>
        <div><p class="mono">${esc(bv.wirkung_titel)}</p><p class="leise">${esc(bv.wirkung_vor)}</p>${li(bv.wirkung)}</div>
      </div>
      <p class="li-voice__schluss">${bv.schluss.map(esc).join('<br>')}</p>
    </section>
    <h2 class="zw" data-r>${esc(t('t_saetze'))}</h2>
    <ul class="li-saetze">${saetze}</ul>`;
}

/* ---------------------------------------------------------------- Markenprüfung */
function pruefung() {
  return `${titel(t('pruefung'), zwei(t('p_titel')), t(S.ki ? 'p_satz_ki' : 'p_satz'))}<div id="li-pr"></div><div id="li-bsp-erg"></div>`;
}
function pruefungLeben() { S.ergebnis ? ergebnis(S.ergebnis) : feld(); if (!S.ergebnis && /[?&]beispiel=1/.test(location.search)) beispielPruefung(); }
/* Beispiel: ein eigens gebauter Entwurf (beispiel/entwurf.html → entwurf.png) und die unveränderte Rückmeldung der Prüfung dazu (beispiel/pruefung.json).
   Überall als Beispiel beschriftet; ?beispiel=1#pruefung öffnet es gleich. */
async function beispielPruefung() {
  try {
    const r = await fetch('beispiel/pruefung.json', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
    const j = await r.json(); j.beispiel = true;
    S.ergebnis = j; if (S.ansicht === 'pruefung') ergebnis(j);
  } catch (e) { melde(t('p_fehler'), true); }
}
function feld() {
  const d = S.datei;
  $('#li-pr').innerHTML = `<div class="platte li-feld" id="li-feld" data-r>
      <input type="file" id="li-datei" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
      <div class="li-feld__in">
        ${d ? `<div class="li-feld__vor">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}</div><p class="li-feld__name"><b>${esc(d.name)}</b><small>${(d.groesse / 1e6).toFixed(1)} MB</small></p>`
          : `<span class="li-feld__z">${LOGO}</span><p class="li-feld__t">${esc(t('p_feld'))}</p><p class="leise">${esc(t('p_feld2'))}</p>`}
        <div class="li-feld__kn"><button class="kn ${d ? 'kn--linie' : ''}" type="button" id="li-waehle">${esc(t('p_waehlen'))}<i>${PO}</i></button>${d ? `<button class="kn kn--brand" type="button" id="li-los">${esc(t('p_pruefen'))}<i>${PF}</i></button>` : ''}</div>
        ${d ? '' : `<p class="li-bsp"><button class="link" type="button" id="li-bsp">${esc(t('p_beispiel'))}</button></p>`}
      </div>
      <p class="li-privat">${esc(t('p_privat'))}</p>
    </div>`;
  const inp = $('#li-datei'), fl = $('#li-feld');
  $('#li-waehle').onclick = () => inp.click();
  inp.onchange = () => inp.files[0] && nimm(inp.files[0]);
  ['dragenter', 'dragover'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.add('ueber'); }));
  ['dragleave', 'drop'].forEach(n => fl.addEventListener(n, e => { e.preventDefault(); fl.classList.remove('ueber'); }));
  fl.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) nimm(f); });
  if ($('#li-los')) $('#li-los').onclick = pruefe;
  if ($('#li-bsp')) $('#li-bsp').onclick = () => { const u = $('#li-bsp-erg'); if (u && u.firstChild) u.scrollIntoView({ behavior: 'smooth', block: 'start' }); else beispielPruefung(); };
  auftritte($('#li-pr'), true);
  beispielUnten(!d);
}
/* Unter dem leeren Feld steht immer eine fertige Beispiel-Prüfung, deutlich als Beispiel beschriftet (M27: in der Demo nie leer) */
async function beispielUnten(an) {
  const u = $('#li-bsp-erg'); if (!u) return;
  if (!an) { u.innerHTML = ''; return; }
  try {
    if (!S.bspJ) { const r = await fetch('beispiel/pruefung.json'); if (!r.ok) throw new Error(r.status); S.bspJ = await r.json(); S.bspJ.beispiel = true; }
    if (S.datei || S.ergebnis || S.ansicht !== 'pruefung' || !$('#li-bsp-erg')) return;
    $('#li-bsp-erg').innerHTML = '<div class="li-bsp-unten"></div>'; ergebnis(S.bspJ, $('#li-bsp-erg .li-bsp-unten'));
  } catch (e) { /* ohne Beispiel bleibt das Feld */ }
}
/* Grosse Bilder vor dem Senden auf 2'400 px verkleinern (L10) */
function verkleinert(f, dann) {
  if (f.type === 'application/pdf') { const r = new FileReader(); r.onload = () => dann(r.result, ''); r.readAsDataURL(f); return; }
  const url = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    const m = Math.max(im.naturalWidth, im.naturalHeight), s = Math.min(1, 2400 / m);
    if (im.naturalWidth * im.naturalHeight > 100e6) { URL.revokeObjectURL(url); melde(t('p_riesig'), true); return; }
    const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const d = s < 1 || f.type === 'image/webp' ? c.toDataURL('image/jpeg', .92) : null;
    if (d) dann(d, d); else { const r = new FileReader(); r.onload = () => dann(r.result, r.result); r.readAsDataURL(f); }
  };
  im.onerror = () => { URL.revokeObjectURL(url); melde(t('p_kaputt'), true); };
  im.src = url;
}
function nimm(f) {
  if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) { melde(t('p_typ'), true); return; }   /* eigene Meldungen je Grund (Master L10, Abnahme F05) */
  if (f.size > GRENZE) { melde(t('p_gross'), true); return; }   /* 30 MB so, wie die Grösse angezeigt wird (Abnahme 2 N9: 30,9 MB ging durch) */
  if (!f.size) { melde(t('p_kaputt'), true); return; }
  verkleinert(f, (daten, bild) => { S.datei = { name: f.name, typ: f.type === 'application/pdf' ? f.type : 'image/jpeg', groesse: f.size, daten, bild }; feld(); });
}
async function pruefe() {
  const d = S.datei; if (!d) return;
  const schritte = [t('p_schritt1'), t('p_schritt2'), t('p_schritt3')];
  $('#li-pr').innerHTML = `<div class="platte li-lauf" data-r><div class="li-lauf__b">${d.bild ? `<img src="${d.bild}" alt="">` : `<span class="li-pdf">PDF</span>`}<span class="li-scan"></span></div>
    <div><ol class="li-schritte">${schritte.map((s, i) => `<li data-i="${i}"><i></i><span>${esc(s)}</span></li>`).join('')}</ol><p class="leise">${esc(t('p_dauer'))}</p></div></div>`;
  auftritte($('#li-pr'), true);
  const li = $$('.li-schritte li');
  let n = 0; li[0].classList.add('an');
  const uhr = setInterval(() => { if (n < 2) { li[n].classList.replace('an', 'fertig'); n++; li[n].classList.add('an'); } }, 1200);
  try {
    const r = await fetch('api/pruefen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name, typ: d.typ, daten: d.daten, sprache: SP }) });
    let j = {}; try { j = await r.json(); } catch (e) { /* leer */ }
    if (!r.ok) throw new Error(String(j.fehler || r.status).replace(/^[A-ZÄÖÜ-]+ · /, ''));
    clearInterval(uhr); li.forEach(x => { x.classList.remove('an'); x.classList.add('fertig'); });
    S.ergebnis = j;
    setTimeout(() => ergebnis(j), 380);
  } catch (e) {
    clearInterval(uhr);
    melde(t('p_fehler') + ': ' + (e.message === 'Failed to fetch' ? t('fehler_verb') : e.message), true);
    feld();
  }
}
function ergebnis(j, ziel) {
  const Z = ziel || $('#li-pr');
  const m = j.messung, k = j.ki || {};
  const pr = x => Math.round(x * 100);
  const toene = m.toene.map((x, i) => `<li class="li-ton li-ton--${x.urteil}" style="--i:${i}">
      <span class="li-ton__f" style="background:${x.hex}"></span>
      <span class="li-ton__a"><i style="width:${Math.max(2, pr(x.anteil))}%"></i><b>${x.anteil < .01 ? '&lt;1' : pr(x.anteil)} %</b></span>
      <span class="li-ton__n"><b>${x.hex.toUpperCase()}</b><small>${esc(t('p_naechste'))}: <i style="background:${x.palette}"></i>${esc(x.name)} · ΔE ${String(x.de).replace('.', SP === 'de' ? ',' : '.')}</small></span>
      <em>${esc(t('p_' + x.urteil))}</em></li>`).join('');
  const sonder = [m.weiss > .08 ? t('p_weiss', pr(m.weiss)) : '', m.grell > .02 ? t('p_grell', pr(m.grell)) : '', m.marke > .25 ? t('p_marke', pr(m.marke)) : ''].filter(Boolean);
  const reihe = { passt_nicht: 0, achten: 1, passt: 2 };
  const punkte = (k.punkte || []).slice().sort((a, b) => (reihe[a.urteil] ?? 1) - (reihe[b.urteil] ?? 1)).map((p, i) => `<li class="li-pk li-pk--${esc(p.urteil)}" data-r style="--i:${i}">
      <span class="li-pk__m"><em>${esc(t('u_' + p.urteil) || p.urteil)}</em><small>${esc((t('ber')[p.bereich]) || p.bereich)}</small></span>
      <span class="li-pk__t"><b>${esc(p.titel)}</b><span>${esc(p.text)}</span></span></li>`).join('');
  const tonv = (k.ton || []).filter(x => x.stelle && x.vorschlag).map(x => `<li><s>${esc(x.stelle)}</s><span>${esc(x.vorschlag)}</span></li>`).join('');
  if (!ziel) { const u = $('#li-bsp-erg'); if (u) u.innerHTML = ''; }
  Z.innerHTML = `<div class="li-erg">
    <aside class="li-erg__l">
      <figure class="platte li-erg__bild" data-r><img src="${j.vorschau}" alt="${esc(j.name)}"><figcaption><b>${esc(j.name)}</b>${j.seiten > 1 ? `<small>${esc(t('p_seiten', j.seiten, Math.min(j.seiten, 3)))}</small>` : ''}</figcaption></figure>
      <section class="platte li-erg__farben" data-r><h3>${esc(t('p_farben'))}</h3><p class="leise">${esc(t('p_farben_s'))}</p>
        <p class="li-rahmen-z"><span class="li-rahmen-z__b"><i style="width:${pr(m.im_rahmen)}%"></i></span>${esc(t('p_rahmen', pr(m.im_rahmen)))}</p>
        <ol class="li-toene">${toene}</ol>${sonder.length ? `<ul class="li-sonder">${sonder.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}</section>
    </aside>
    <div class="li-erg__r">
      ${j.beispiel ? `<p class="platte li-hinweis li-hinweis--bsp" data-r>${esc(t('p_beispiel_h'))}</p>` : ''}
      ${k.probe ? `<p class="platte li-hinweis li-hinweis--probe" data-r><b>${esc(SP === 'de' ? 'Probe ohne KI' : 'Probe without AI')}</b>${esc(t('p_probe_h'))}</p>` : ''}
      ${j.ki_fehler ? `<p class="platte li-hinweis li-hinweis--ki" data-r>${esc(t('p_ki_fehler', j.ki_fehler))}</p>` : `
      <section class="platte li-gesamt" data-r><p class="mono">${esc(t('p_gesamt'))}${k.art ? ' · ' + esc(k.art) : ''}</p><p class="li-gesamt__s">${esc(k.gesamt || '')}</p></section>
      <h3 class="li-erg__h">${esc(t('p_punkte'))}</h3><ol class="li-punkte">${punkte}</ol>
      ${tonv ? `<section class="platte li-tonvor" data-r><h3>${esc(t('p_ton'))}</h3><ul>${tonv}</ul></section>` : ''}
      ${k.text ? `<details class="li-gelesen"><summary class="mono">${esc(t('p_text'))}</summary><p>${esc(k.text)}</p></details>` : ''}`}
      <div class="li-erg__kn"><button class="kn" type="button" id="li-neu">${esc(t('p_neu'))}<i>${PU}</i></button><button class="kn kn--linie" type="button" id="li-kopie">${esc(t('p_kopie'))}<i>${KOPIE}</i></button><button class="kn kn--linie" type="button" id="li-sichern">${esc(t('p_sichern'))}<i>${PU}</i></button></div>
    </div></div>`;
  auftritte(Z);
  const kn = x => Z.querySelector(x);
  kn('#li-neu').onclick = () => { S.ergebnis = null; S.datei = null; feld(); scrollTo({ top: 0, behavior: 'smooth' }); };
  kn('#li-kopie').onclick = () => kopiere(alsText(j));
  kn('#li-sichern').onclick = () => sichere(j);
}
function alsText(j) {
  const m = j.messung, k = j.ki || {};
  const z = [`${NAME()} · ${t('pruefung')} · ${j.name}`, ''];
  if (k.gesamt) z.push(k.gesamt, '');
  (k.punkte || []).forEach(p => z.push(`· ${(t('ber')[p.bereich]) || p.bereich} – ${t('u_' + p.urteil) || p.urteil}: ${p.titel}. ${p.text}`));
  z.push('', t('p_farben') + ':');
  m.toene.forEach(x => z.push(`  ${x.hex.toUpperCase()} ${Math.round(x.anteil * 100)} % → ${x.name} ${x.palette.toUpperCase()}, ΔE ${x.de} (${t('p_' + x.urteil)})`));
  (k.ton || []).forEach(x => z.push('', `«${x.stelle}» → «${x.vorschlag}»`));
  return z.join('\n');
}
function sichere(j) {
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(NAME())} · ${esc(j.name)}</title><body style="font:15px/1.6 'Space Grotesk',system-ui,sans-serif;max-width:820px;margin:40px auto;color:#0b0b0c;background:#efece6;padding:0 20px">
    <h1 style="font-weight:600;font-size:34px;letter-spacing:-.03em">${esc(t('pruefung'))}: ${esc(j.name)}</h1><img src="${j.vorschau}" style="max-width:360px"><pre style="white-space:pre-wrap;font:14px/1.6 'Space Grotesk',system-ui,sans-serif">${esc(alsText(j))}</pre>
    <p style="color:#5b5954;font-size:12px">${esc(NAME())} · ${esc(S.d.haus.name)} · ${new Date().toLocaleString(SP === 'de' ? 'de-CH' : 'en-GB')}</p></body>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = 'txtme-brand-check-' + j.name.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9äöü_-]+/gi, '-').toLowerCase() + '.html';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ---------------------------------------------------------------- Fenster, Meldung */
function fenster(html) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k li-fk" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="${esc(t('schliessen'))}">${ZU}</button>${html}</div>`;
  f.hidden = false; document.body.classList.add('li-zu');
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
}
function fensterZu() { $('#fenster').hidden = true; $('#fenster').innerHTML = ''; document.body.classList.remove('li-zu'); }
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu(); });
function melde(text, fehl = false) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(text)}</b></div>`;
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  setTimeout(() => q.remove(), fehl ? 7000 : 2600);
}

/* ---------------------------------------------------------------- Start */
(async function () {
  document.documentElement.lang = SP === 'de' ? 'de-CH' : SP;
  const vorgeladen = document.querySelector('link[rel="preload"][as="fetch"]');
  try { S.d = await (await fetch(vorgeladen ? vorgeladen.getAttribute('href') : 'livre.json', vorgeladen ? {} : { cache: 'no-store' })).json(); }
  catch (e) { $('#ansicht').innerHTML = `<p class="li-leer">${esc(t('daten_fehlen'))}</p>`; window.__werkzeugBereit = true; if (window.werkzeugTuer) window.werkzeugTuer(t('daten_fehlen')); return; }
  const h = location.hash.slice(1);
  try { S.ansicht = ANSICHTEN.includes(h) ? h : ((/:3213\//.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload')) ? (localStorage.removeItem('markenbuch-ansicht'), 'start') : localStorage.getItem('markenbuch-ansicht') || 'start'); } catch (e) { S.ansicht = 'start'; }
  if (!ANSICHTEN.includes(S.ansicht)) S.ansicht = 'start';
  kopf(); rand(); leiste(); zeichne();
  window.__werkzeugBereit = true;
  addEventListener('hashchange', () => { const a = location.hash.slice(1); if (ANSICHTEN.includes(a) && a !== S.ansicht) gehe(a); });
  fetch('api/stand', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject()).then(j => { S.server = true; S.ki = !!(j && j.ki); if (S.ki && S.ansicht === 'pruefung' && $('#ansicht .satz')) $('#ansicht .satz').textContent = t('p_satz_ki'); }).catch(() => { S.server = false; });
})();
