/* Demo-Schicht der Online-Fassung (gebaut von _bau/online.py): ersetzt den lokalen Server (serve.py) im Browser.
   Nichts geht an einen Server, die KI ist aus. Gespeichert wird nur in diesem Browser. */
(function () {
  'use strict';
  var D = {"vorlagen": {"frame": [["rahmenfoto", "dunkel", "rahmenh"], ["rahmenfoto", "hell", "rahmenh"], ["rahmenfoto", "dunkel", "rahmenq"], ["rahmenfoto", "creme", "rahmenh"], ["rahmenfoto", "hell", "rahmenq"]], "sticker": [["sticker", "dunkel", "sticker"], ["stickerlogo", "dunkel", "sticker"], ["sticker", "creme", "stickerq"], ["stickerlogo", "creme", "sticker"], ["sticker", "hell", "sticker"]], "ticket": [["ticket", "dunkel", "dlq"], ["ticket", "hell", "dlq"], ["ticket", "creme", "dlq"], ["ticket", "dunkel", "a6q"], ["ticket", "hell", "a6q"]], "poster": [["buehne", "dunkel", "a3h"], ["deckel", "dunkel", "a3h"], ["fenster", "hell", "a3h"], ["geteilt", "creme", "a3h"], ["buehne", "hell", "a3h"]], "post": [["geteilt", "dunkel", "insta"], ["buehne", "dunkel", "insta"], ["fenster", "creme", "insta"], ["deckel", "hell", "insta"], ["ansicht", "dunkel", "insta"]], "story": [["fenster", "dunkel", "story"], ["buehne", "dunkel", "story"], ["deckel", "creme", "story"], ["geteilt", "hell", "story"], ["fenster", "creme", "story"]], "flyer": [["buehne", "dunkel", "a6h"], ["geteilt", "hell", "a6h"], ["fenster", "dunkel", "a6h"], ["deckel", "creme", "a6h"], ["buehne", "hell", "a6h"]], "sign": [["aushang", "dunkel", "a4h"], ["aushang", "hell", "a4h"], ["aushang", "creme", "a4h"], ["deckel", "dunkel", "a4h"], ["aushang", "hell", "a5h"]]}, "ton": {"dunkel": "Ink", "hell": "Bone", "creme": "RKN yellow"}, "aufbau": {"rahmenfoto": "Photo frame", "sticker": "Sticker", "stickerlogo": "Logo sticker", "ticket": "Ticket", "buehne": "Photo on top", "deckel": "Title page", "fenster": "Photo in a frame", "geteilt": "Photo and text", "aushang": "Sign", "ansicht": "Full-bleed photo"}, "fotos": ["cube", "ade", "ade-live", "story-ade"]};
  var echt = window.fetch.bind(window);
  function json(code, d) { return Promise.resolve(new Response(JSON.stringify(d), { status: code, headers: { 'content-type': 'application/json; charset=utf-8' } })); }
  function leer() { return Promise.resolve(new Response(null, { status: 204 })); }
  function zufall(s) { var x = (s * 2654435761) >>> 0 || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }

  function probe(d) {
    if (d.bildtext) {
      var b = d.bildtext, sp = ['de', 'en', 'fr', 'zh', 'ko', 'ar'].indexOf(b.sprache) >= 0 ? b.sprache : 'en';
      var text = sp !== 'de' ? '[Night] · [Date] · [Venue, City]\n\nSee you offline. Disposable cameras at the door, the phone stays in your pocket.\n\nScan the shirt. Meet first.'
        : '[Nacht] · [Datum] · [Ort]\n\nSee you offline. Einwegkameras an der Tür, das Handy bleibt in der Tasche.';
      return [200, { bildtext: { text: text, hashtags: ['#txtmesocial', '#seeyouoffline', '#amsterdam', '#ade', '#offlinefirst'], sprache: sp,
        hinweise: ['Demo: the AI is off, this caption is a start. Replace [Night], [Date] and [Venue, City].'] }, probe: true }];
    }
    var auftrag = String(d.auftrag || '').trim().slice(0, 1500);
    if (auftrag.length < 4) return [400, { fehler: 'Please describe in a few words what you need.' }];
    var a = auftrag.toLowerCase(), art = null;
    Object.keys(D.vorlagen).some(function (k) { if (a.indexOf(k) >= 0) { art = k; return true; } });
    art = art || (a.indexOf('instagram') >= 0 ? 'post' : 'frame');
    var fmt = d.format || null, rnd = zufall(auftrag.length), varianten = [];
    D.vorlagen[art].forEach(function (v) {
      var vorlage = v[0], ton = v[1], foto = D.fotos[Math.floor(rnd() * D.fotos.length)];
      var inhalt = { bild: foto, ueber: '[Night]', titel: 'See you offline.', unter: '[Date] · [Venue, City]', text: auftrag.slice(0, 120), aktion: 'SPECIAL EDITION',
        wann: '[Date]', wo: '[Venue, City]', nummer: 'N°', fuss: '' };
      if (vorlage === 'sticker' || vorlage === 'stickerlogo') inhalt = { titel: 'See you\noffline.', ueber: '[Night]', unter: '[Date] · [Venue, City]', text: 'The connection doesn’t have to.' };
      varianten.push({ titel: (D.aufbau[vorlage] || vorlage) + ', ' + D.ton[ton], seiten: [{ vorlage: vorlage, ton: ton, inhalt: inhalt }] });
    });
    var name = auftrag.slice(0, 40).replace(/^[ .]+|[ .]+$/g, '');
    var out = { name: name.charAt(0).toUpperCase() + name.slice(1), format: fmt || D.vorlagen[art][0][2], varianten: varianten,
      hinweise: ['Demo: these five drafts come from the templates of the house, the AI is switched off. Replace [Night], [Date] and [Venue, City] before printing.'] };
    if (d.varianten) return [200, { entwuerfe: out, probe: true }];
    var n = parseInt(d.karussell || 0, 10);
    if (isNaN(n)) return [400, { fehler: 'FORM · «karussell» must be a number.' }];
    var seiten = varianten[0].seiten;
    if (n > 1) {
      var s0 = seiten[0]; seiten = [];
      for (var i = 0; i < Math.min(n, 10); i++) seiten.push({ vorlage: s0.vorlage, ton: s0.ton, inhalt: Object.assign({}, s0.inhalt, { bild: D.fotos[i % D.fotos.length] }) });
    }
    return [200, { entwurf: { name: out.name, format: out.format, seiten: seiten, hinweise: out.hinweise }, probe: true }];
  }

  window.fetch = function (eingabe, opt) {
    var url = typeof eingabe === 'string' ? eingabe : (eingabe && eingabe.url) || String(eingabe);
    var methode = ((opt && opt.method) || (eingabe && eingabe.method) || 'GET').toUpperCase();
    var p; try { p = new URL(url, location.href).pathname; } catch (e) { p = url; }
    if (/\/api\/entwurf$/.test(p)) {
      if (methode !== 'POST') return json(200, { ok: true, ki: false, modell: 'probe' });
      var d = {}; try { d = JSON.parse((opt && opt.body) || '{}') || {}; } catch (e) { return json(400, { fehler: 'FORM · The request could not be read.' }); }
      var r = probe(d);
      return new Promise(function (ok) { setTimeout(function () { ok(json(r[0], r[1])); }, 600); });
    }
    if (/\/marke\/api\/pruefen$/.test(p)) return json(400, { fehler: 'In this demo the AI is switched off, so the brand check does not run.' });
    if (/\/marke\/livre\.json$/.test(p) || /\/vorlagen\/zahlen\.json$/.test(p)) return leer();
    return echt(eingabe, opt);
  };
})();
