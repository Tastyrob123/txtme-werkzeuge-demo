/* Print Workshop txtme.social · Katalog des Hauses (Kopie der Vorlage katalog.js von L’Imprimerie, Inhalt txtme).
   Jede Vorlage ist sofort fertig gesetzt (Vorlage + Grund + Format + Inhalt), öffnet ohne KI und ohne Kosten.
   Quellen: Nacht «RKN.OFC × TXTME.SOCIAL × ADE» = _cloud/txtme-quellen/rkn-rahmen-werkzeug (rahmen4.py, 04.10.2026: 24.10.2026, Wanakam, Amsterdam,
   «See you offline.», «Special Edition», «Shot on film», «Admit one»). Alles, was nicht belegt ist, steht in [eckigen Klammern] und wird vor dem Druck ersetzt.
   NAECHTE und TEAMS sind die eine Stelle für Namen (Robert wählt). */
(function () {

  /* ---------- Die Nächte (Anlässe). k = Schlüssel, t = Name, z = Zeile mit Datum, von/bis = Datum ISO (für die Reihenfolge), ort, fotos ---------- */
  const NAECHTE = [
    { k: 'rkn-ade-2026', t: 'RKN.OFC × TXTME.SOCIAL × ADE', kurz: 'RKN × txtme', z: '24.10.2026 · Wanakam, Amsterdam', von: '2026-10-24', bis: '2026-10-24', wo: 'stadt', ort: 'Wanakam, Amsterdam',
      datum: '24.10.2026', satz: 'The special edition night with RKN during Amsterdam Dance Event. Disposable cameras, 35 mm film, see you offline.', fotos: ['ade', 'party', 'cube', 'friends'] },
    { k: 'naechste', t: '[Next night]', kurz: '[Next night]', z: '[Date] · [Venue, City]', von: '2099-12-01', bis: '2099-12-31', wo: 'stadt', ort: '[Venue, City]',
      datum: '[Date]', satz: 'The next night: enter name, date and place, pick a photo, and every piece is set in one go.', fotos: ['night', 'blur', 'laugh', 'subway'] },
  ];
  window.NAECHTE = NAECHTE;

  /* ---------- Die 50 Vorlagen des Hauses (Robert 07.11.2026: «Mach 50 verschiedene Vorlagen.») ----------
     Eine Liste, eine Wahrheit: jede Vorlage steht hier genau einmal; Nächte, Teams, Schilder und «Types & templates» zeigen Auszüge daraus.
     Keine zwei sehen gleich aus: innerhalb einer Art unterscheidet sich jede im Aufbau (Vorlage, Rahmen, Ausrichtung, Bildanteil) oder im Format.
     Wortlaut nur aus dem Repo (RKN-Kit, lib/site.ts, lib/press.ts, Projektbriefing: «See you offline.», «The platform that wants you offline.»,
     «Scan the shirt. Meet first.», «Scan, don’t search.», «Meet first. App second.», «Who did you meet tonight?», «Scan before you lose them.»,
     «No algorithm, no ads, no infinite scroll, no tracking.»), alles andere in [eckigen Klammern].
     Felder: art (Schlüssel in ARTEN von start.js), nacht (Motiv jeder Nacht, [Night]/[Date]/[Venue, City] werden eingesetzt), team, schild. */
  const k = (art, n, wo, format, vorlage, ton, inhalt, extra) => Object.assign({ art, n, wo, format, vorlage, ton, inhalt }, extra || {});
  const N = '[Night]', D = '[Date]', O = '[Venue, City]', DO = `${D} · ${O}`;
  const drinks = z => Array.from({ length: z }, () => ({ name: '[Drink]', detail: '[Detail]', preis: '€ [Price]' }));
  const acts = z => Array.from({ length: z }, () => ({ wann: '[time]', was: '[Act]', wo: '[Floor]' }));
  const GRUSS = { vorlage: 'kartengruss', inhalt: { titel: 'Amsterdam · see you offline', text: 'Greetings from the night.' } };
  const VORLAGEN = [
    // Fotorahmen
    k('rahmen', 'Photo frame, portrait', 'print 10 × 15 in the frame', 'rahmenh', 'rahmenfoto', 'dunkel', { bild: 'ade', ueber: N, titel: 'See you offline.', unter: `Disposable camera · 35 mm film · ${DO}`, nummer: 'N°', aktion: 'ONE NIGHT ONLY' }, { nacht: 1 }),
    k('rahmen', 'Photo frame, landscape', 'print 15 × 10 in the frame', 'rahmenq', 'rahmenfoto', 'hell', { bild: 'party', ueber: N, titel: 'See you offline.', unter: `Disposable camera · 35 mm film · ${DO}`, nummer: 'N°', aktion: 'ONE NIGHT ONLY' }, { nacht: 2 }),
    k('rahmen', 'Photo frame, feed 4:5', 'Instagram', 'insta', 'rahmenfoto', 'dunkel', { bild: 'ade', ueber: N, titel: 'See you offline.', unter: DO, nummer: '', aktion: 'SPECIAL EDITION' }, { nacht: 3 }),
    k('rahmen', 'Photo frame, story 9:16', 'Instagram and WhatsApp', 'story', 'rahmenfoto', 'creme', { bild: 'night', ueber: N, titel: 'See you offline.', unter: `Shot on film · ${D}`, nummer: '', aktion: 'ONE NIGHT ONLY' }),
    // Sticker
    k('sticker', 'Sticker, the night', 'die-cut, trimmed to the ink', 'sticker', 'sticker', 'dunkel', { titel: 'See you\noffline.', ueber: N, unter: DO }, { nacht: 4 }),
    k('sticker', 'Logo sticker', 'die-cut, trimmed to the ink', 'sticker', 'stickerlogo', 'creme', { ueber: 'See you offline.' }, { nacht: 5 }),
    k('sticker', 'Sticker wide, the claim', 'die-cut, wide', 'stickerq', 'sticker', 'dunkel', { titel: 'The platform that\nwants you offline.', ueber: 'txtme.social', unter: '' }, { team: 'promo' }),
    k('sticker', 'Logo sticker, wide', 'die-cut, wide', 'stickerq', 'stickerlogo', 'dunkel', { ueber: 'Scan, don’t search.' }, { team: 'promo' }),
    // Tickets
    k('ticket', 'Ticket', 'DL, with tear-off', 'dlq', 'ticket', 'dunkel', { bild: 'ade', ueber: N, titel: 'See you offline.', wann: D, wo: O, nummer: '0001', aktion: 'SEE YOU OFFLINE.' }, { nacht: 6 }),
    k('ticket', 'Guest list ticket', 'A6 portrait, at the door', 'a6h', 'ticket', 'hell', { bild: 'friends', ueber: N, titel: 'You’re on the list.', wann: `${D} · doors [time]`, wo: O, nummer: '0001', aktion: 'ADMIT ONE' }, { team: 'door' }),
    // Plakate
    k('plakat', 'Poster A3', 'for the venue and the street', 'a3h', 'buehne', 'dunkel', { bild: 'cube', ueber: N, titel: 'See you\noffline.', text: DO, aktion: 'SPECIAL EDITION', fuss: '' }, { nacht: 7 }),
    k('plakat', 'Poster A3, big title', 'for the street', 'a3h', 'deckel', 'dunkel', { ueber: N, titel: 'See you\noffline.', unter: DO, text: 'Special edition' }, { stil: { ausr: 'l', titel: 1.2 }, team: 'promo' }),
    k('plakat', 'Poster A3, photo and text', 'for the venue', 'a3h', 'geteilt', 'dunkel', { bild: 'crowd', ueber: 'txtme.social', titel: 'Who did you\nmeet tonight?', text: 'Scan before you lose them.', aktion: 'Scan the shirt. Meet first.', fuss: '' }),
    k('plakat', 'Poster A4, full-bleed photo', 'for the window', 'a4h', 'ansicht', 'dunkel', { bild: 'hero', titel: N, unter: DO }),
    // Flyer
    k('flyer', 'Flyer A6', 'to hand out', 'a6h', 'buehne', 'dunkel', { bild: 'night', ueber: N, titel: 'See you\noffline.', text: DO, aktion: 'Doors [time]', fuss: '' }, { stil: { ausr: 'l', bild: .62 }, team: 'promo' }),
    k('flyer', 'Flyer DL, framed photo', 'to hand out', 'dlh', 'fenster', 'dunkel', { bild: 'friends', ueber: N, titel: 'See you offline.', unter: DO, text: 'Disposable cameras at the door.' }, { team: 'promo' }),
    k('flyer', 'Flyer A5 landscape', 'photo and text side by side', 'a5q', 'geteilt', 'hell', { bild: 'party', ueber: N, titel: 'Meet first.\nApp second.', text: DO, aktion: 'txtme.social', fuss: '' }),
    k('flyer', 'Flyer A5, title', 'to hand out', 'a5h', 'deckel', 'hell', { ueber: N, titel: 'Scan the shirt.\nMeet first.', unter: DO, text: 'Doors [time]' }, { stil: { ausr: 'l', rahmen: 'doppelt' } }),
    // Schilder
    k('aushang', 'Doors open', 'at the door', 'a4h', 'aushang', 'dunkel', { ueber: N, titel: 'Doors [time]', text: 'Tickets at the door: [yes / no]\nID required.', aktion: 'See you offline.', fuss: '' }, { schild: 1 }),
    k('aushang', 'Guest list', 'at the door', 'a4h', 'aushang', 'dunkel', { ueber: N, titel: 'Guest list', text: 'Name on the list?\nShow your ID at the door.', aktion: 'Doors [time]', fuss: '' }, { stil: { ausr: 'l' }, schild: 2, team: 'door' }),
    k('aushang', 'Sold out', 'at the door', 'a4h', 'deckel', 'creme', { ueber: N, titel: 'Sold out', unter: 'No tickets at the door tonight.', text: 'See you at the next one.' }, { schild: 3, team: 'door' }),
    k('aushang', 'Cloakroom', 'cloakroom', 'a5h', 'aushang', 'hell', { ueber: N, titel: 'Cloakroom', text: '€ [Price] per item.\nKeep your tag.', aktion: '', fuss: '' }, { stil: { rahmen: 'doppelt' }, schild: 4 }),
    k('aushang', 'No photos', 'inside', 'a4h', 'aushang', 'creme', { ueber: N, titel: 'No photos.', text: 'Disposable cameras only.\nBe here, not on your phone.', aktion: 'See you offline.', fuss: '' }, { stil: { rahmen: 'ohne', titel: 1.25 }, schild: 5 }),
    k('aushang', 'Smoking area', 'outside', 'a5q', 'aushang', 'hell', { ueber: N, titel: 'Smoking area', text: 'Outside, [where].\nKeep the neighbours asleep.', aktion: '', fuss: '' }, { schild: 6 }),
    k('aushang', 'Scan here', 'at the merch table', 'a5h', 'fenster', 'dunkel', { bild: 'scan', ueber: 'txtme.social', titel: 'Scan,\ndon’t search.', unter: '', text: 'Meet first. App second.' }, { schild: 7 }),
    k('aushang', 'Photo wall', 'at the photo wall', 'a3h', 'buehne', 'hell', { bild: 'friends', ueber: N, titel: 'Photo wall', text: 'Disposable cameras only.', aktion: 'See you offline.', fuss: '' }, { stil: { bild: .62, rahmen: 'doppelt' }, schild: 8 }),
    // Instagram
    k('instagram', 'Instagram post', 'feed 4:5', 'insta', 'geteilt', 'dunkel', { bild: 'party', ueber: N, titel: 'See you offline.', text: DO, aktion: 'Scan the shirt. Meet first.', fuss: '' }, { nacht: 8 }),
    k('instagram', 'Post, full-bleed photo', 'feed 4:5', 'insta', 'ansicht', 'dunkel', { bild: 'ade-live', titel: N, unter: DO }, { team: 'social' }),
    k('instagram', 'Post, statement', 'feed 4:5', 'insta', 'deckel', 'creme', { ueber: 'txtme.social', titel: 'The platform that\nwants you offline.', unter: 'No algorithm, no ads, no infinite scroll, no tracking.', text: '' }, { team: 'social' }),
    k('instagram', 'Carousel, three images', 'feed 4:5, swipe', 'insta', 'buehne', 'dunkel', { bild: 'party', ueber: N, titel: 'Who did you\nmeet tonight?', text: DO, aktion: 'txtme.social', fuss: '' }, { team: 'social', seiten: [
      { vorlage: 'ansicht', ton: 'dunkel', inhalt: { bild: 'crowd', titel: N, unter: D } },
      { vorlage: 'geteilt', ton: 'hell', inhalt: { bild: 'scan', ueber: 'txtme.social', titel: 'Scan before you\nlose them.', text: 'Scan the shirt. Meet first.', aktion: 'txtme.social', fuss: '' } }] }),
    // Story
    k('story', 'Story', '9:16', 'story', 'fenster', 'dunkel', { bild: 'ade', ueber: N, titel: 'See you offline.', unter: DO, text: 'Disposable cameras at the door.' }, { nacht: 9 }),
    k('story', 'Story, photo on top', '9:16', 'story', 'buehne', 'dunkel', { bild: 'laugh', ueber: N, titel: 'Doors [time]', text: DO, aktion: 'See you offline.', fuss: '' }, { team: 'social' }),
    k('story', 'Story, title', '9:16', 'story', 'deckel', 'creme', { ueber: N, titel: 'See you\noffline.', unter: DO, text: '' }),
    // Getränke
    k('getraenke', 'Drinks card', 'on the bar, DL', 'dlh', 'karte', 'dunkel', { ueber: N, titel: 'Drinks', text: '', liste: drinks(3), fuss: '' }, { team: 'bar' }),
    k('getraenke', 'Drinks list A5', 'on the bar', 'a5h', 'karte', 'hell', { ueber: 'txtme.social', titel: 'Bar', text: '', liste: drinks(5), fuss: '' }, { team: 'bar' }),
    k('getraenke', 'Bar, A4', 'above the bar', 'a4h', 'deckel', 'hell', { ueber: N, titel: 'Bar', unter: 'Open until [time]', text: '' }, { team: 'bar' }),
    // Einladungen
    k('einladung', 'Invitation, square', 'for the guest list', 'q148', 'einladung', 'dunkel', { ueber: N, titel: 'You’re on the list.', wann: `${D} · doors [time]`, wo: O, text: 'Disposable cameras at the door. Leave the phone in your pocket.', aktion: 'RSVP [contact] until [date]' }, { team: 'door' }),
    k('einladung', 'Invitation A5 landscape', 'for the guest list', 'a5q', 'einladung', 'hell', { ueber: N, titel: 'You’re on the list.', wann: `${D} · doors [time]`, wo: O, text: 'Disposable cameras at the door. Leave the phone in your pocket.', aktion: 'RSVP [contact] until [date]' }),
    k('einladung', 'Invitation with photo', 'for the guest list', 'a6h', 'fenster', 'creme', { bild: 'subway', ueber: N, titel: 'You’re on the list.', unter: DO, text: 'RSVP [contact] until [date]' }, { stil: { ausr: 'l' } }),
    // Line-up
    k('programm', 'Line-up A5', 'times, acts, floors', 'a5h', 'programm', 'dunkel', { ueber: N, titel: 'Line-up', termine: acts(3) }),
    k('programm', 'Line-up DL', 'times, acts, floors', 'dlh', 'programm', 'creme', { ueber: N, titel: 'Line-up', termine: acts(5) }),
    k('programm', 'Line-up post', 'feed 4:5', 'insta', 'programm', 'dunkel', { ueber: N, titel: 'Line-up', termine: acts(3) }, { team: 'social' }),
    // Postkarten (mit Rückseite)
    k('postkarte', 'Postcard', 'photo on the front, note on the back', 'a6q', 'ansicht', 'dunkel', { bild: 'night', titel: 'Amsterdam', unter: 'txtme.social · see you offline' }, { rueck: GRUSS }),
    k('postkarte', 'Postcard, photo in a frame', 'photo on the front, note on the back', 'a6q', 'fenster', 'hell', { bild: 'tram', ueber: N, titel: 'See you offline.', unter: DO, text: '' }, { rueck: GRUSS }),
    // Gutscheine
    k('gutschein', 'Voucher', 'DL landscape', 'dlq', 'gutschein', 'dunkel', { titel: 'Voucher', unter: 'One night, one piece.', wert: '€ [Value]', text: 'For a piece from the drop or a night with us.' }),
    k('gutschein', 'Voucher, portrait', 'A6 portrait', 'a6h', 'gutschein', 'creme', { titel: 'Voucher', unter: 'One night, one piece.', wert: '€ [Value]', text: 'For a piece from the drop or a night with us.' }),
    // Tischkarten
    k('tischkarte', 'Reserved', 'table card', 'a7q', 'deckel', 'dunkel', { ueber: N, titel: 'Reserved', unter: '[Name]', text: '' }, { team: 'bar' }),
    k('tischkarte', 'Table number', 'table card A6', 'a6q', 'aushang', 'creme', { ueber: N, titel: 'Table [No.]', text: '', aktion: '', fuss: '' }, { stil: { rahmen: 'doppelt' }, team: 'bar' }),
    // Crew- und Gästepässe
    k('namensschild', 'Crew pass', 'badge 90 × 55', 'schild', 'deckel', 'dunkel', { ueber: 'Crew', titel: '[Name]', unter: N, text: '' }, { stil: { ausr: 'l' }, team: 'door' }),
    k('namensschild', 'Guest pass', 'badge 90 × 55', 'schild', 'aushang', 'hell', { ueber: 'Guest list', titel: '[Name]', text: N, aktion: '', fuss: '' }, { stil: { ausr: 'l', rahmen: 'ohne' }, team: 'door' }),
  ];
  const v = x => ({ n: x.n, wo: x.wo, format: x.format, vorlage: x.vorlage, ton: x.ton, inhalt: x.inhalt, rueck: x.rueck, stil: x.stil, seiten: x.seiten, art: x.art });

  /* Die Motive einer Nacht: die Vorlagen mit «nacht», Name, Datum und Ort der Nacht schon eingesetzt (Sticker mit dem kurzen Namen), Fotos der Nacht */
  function motive(a) {
    const tausch = (o, kurz) => JSON.parse(JSON.stringify(o), (key, w) => typeof w === 'string' ? w.split(N).join(kurz ? a.kurz : a.t).split(DO).join(`${a.datum} · ${a.ort}`).split(O).join(a.ort).split(D).join(a.datum) : w);
    return VORLAGEN.filter(x => x.nacht).sort((x, y) => x.nacht - y.nacht).map((x, i) => {
      const m = v(x); m.inhalt = tausch(x.inhalt, x.vorlage === 'sticker');
      if (m.inhalt.bild) m.inhalt.bild = a.fotos[i % 2] || a.fotos[0];
      return m;
    });
  }

  /* ---------- Teams (für die Freigabe «sofort verwendbar» und die Übersicht). Platzhalter, Robert/Marouan benennen sie. ---------- */
  const TEAMS = [
    { k: 'door', t: 'Door & guest list', satz: 'Everything the team at the door hands out or hangs up: tickets, guest list, sold out.', foto: 'friends' },
    { k: 'bar', t: 'Bar', satz: 'Signs and cards for the bar.', foto: 'party' },
    { k: 'promo', t: 'Promo & street team', satz: 'Stickers, flyers and posters for the street and the venue.', foto: 'cube' },
    { k: 'social', t: 'Social media', satz: 'Posts, a carousel and stories for the feed, set in the brand.', foto: 'hero' },
  ];
  TEAMS.forEach(t => { t.vorlagen = VORLAGEN.filter(x => x.team === t.k).map(v); });

  /* ---------- Schilder für die Nacht: alle Vorlagen der Art «Sign» ---------- */
  const SCHILDER = VORLAGEN.filter(x => x.schild).sort((x, y) => x.schild - y.schild).map(v);

  window.DSKATALOG = { ABTEILUNGEN: TEAMS, HINWEISE: SCHILDER, ANLAESSE: NAECHTE, motive, NEWSLETTER: [], VORLAGEN: VORLAGEN.map(v) };
})();
