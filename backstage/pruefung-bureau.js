/* Lexikon-Einträge der Bureau-Ergänzungen (Master 2.6: neue Meldung im Server = Stichwort + Eintrag). Hängt sich an die Prüfseite an, baut sie nicht um. */
(function () {
  'use strict';
  const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const L = [
    ['medusa', 'Produkte im Medusa-Panel', '«MEDUSA · Produkte, Preise und Kategorien pflegt das txtme-Team im Medusa-Panel».', 'Backstage zeigt den Katalog nur zum Nachsehen; geändert wird er im Shop-System des Teams (Medusa).', 'Preis, Name, Bestand oder Kategorie im Medusa-Panel ändern. Texte der Seiten, Bilder, Fragen, Presse, Angaben bleiben hier.'],
    ['konflikt', 'Zwei Fenster', '«KONFLIKT · In einem anderen Fenster wurde inzwischen gespeichert».', 'Zwei Fenster (oder zwei Personen) arbeiten am selben Entwurf; das zweite Speichern würde das erste überschreiben.', 'Die Liste ist neu geladen, die gelben Eingaben bleiben: noch einmal Speichern drücken.'],
    ['herkunft', 'Fremde Herkunft', '«HERKUNFT · Die Anfrage kommt nicht von Backstage selbst» (403).', 'Eine Anfrage kam von einer anderen Seite oder ohne das Kennzeichen von Backstage (Schutz vor fremden Seiten im selben Browser).', 'Backstage unter http://127.0.0.1:3213/backstage/ bedienen, nichts von anderen Seiten aus schicken.'],
    ['zuviele', 'Zu viele Anfragen', '«ZUVIELE · Zu viele Anfragen in einer Minute» (429).', 'Mehr als 600 Abfragen oder 60 Schreibvorgänge in einer Minute von einem Absender (Schutz gegen Schleifen und Skripte).', 'Eine Minute warten, dann weiter. Bleibt es, Prüfläufe und offene Fenster schliessen.'],
    ['rolle', 'Rolle ohne Recht', '«ROLLE · Die Rolle lesen darf das nicht» (403).', 'Die angemeldete Person hat die Rolle «lesen» (nur ansehen) oder ist keine Admin (Zugang, Reparaturen).', 'Mit einem Konto der Rolle «redaktion» oder «admin» anmelden; Rollen vergibt ein Admin unter Zugang.'],
    ['bild-klein', 'Bild zu klein', '«BILD · Das Bild ist nur … Pixel breit».', 'Für die Website braucht ein Bild mindestens 900 Pixel Breite, besser 2000; kleinere wirken unscharf.', 'Das Original in grösserer Fassung exportieren und noch einmal hochladen.'],
    ['zu-lang', 'Text zu lang', '«EINGABE · … ist zu lang».', 'Ein Satz der Website hat mehr als 5000 Zeichen, ein Google-Text mehr als 120/400.', 'Kürzer fassen; lange Texte gehören in Abschnitte (Rechtliches, Fragen).'],
    ['tel-format', 'Telefonnummer falsch', '«Die Telefonnummer darf nur Ziffern, Leerzeichen, Klammern und + enthalten».', 'Buchstaben oder Sonderzeichen im Feld.', 'Form wie +31 6 28 53 63 72.'],
    ['datum-format', 'Datum falsch', '«Datum als Jahr-Monat-Tag wählen» oder «Bis liegt vor Ab».', 'Ab/Bis der Hinweis-Leiste sind kein gültiges Datum oder in falscher Reihenfolge.', 'Im Feld den Kalender benutzen; «Bis» nach «Ab».'],
    ['pruefung-rot', 'Probe nicht bestanden', '«PRUEFUNG · …» oder «NACHPRUEFUNG · …» beim Veröffentlichen; «Die Website ist unverändert».', 'Die Probe vor dem Umschalten fand einen Fehler: eine Seite endet nicht sauber, ist stark geschrumpft, trägt Kennzeichen der Vorschau, oder eine Änderung fand ihre Stelle nicht (die Seite wurde inzwischen neu gebaut).', 'Unter «Änderungen» die genannte Stelle zurücknehmen oder neu machen; bei neu gebauter Website Reparatur «Entwurf neu bauen» (liest das Inventar neu). Nichts ist auf die Website gegangen.'],
    ['zahlen-aus', 'Keine Zählung', '«ZAHLEN · txtme.social zählt nichts».', 'Marouan will keine Besucher-Auswertung und keine Kekse; die Ansicht «Zahlen» bleibt bewusst leer.', 'Nichts zu tun.'],
    ['ki-aus', 'KI aus', '«KI · Antwort entwerfen ist in dieser Fassung aus (ki=0)».', 'Kein Modell und kein Schlüssel in dieser Fassung; der Anschluss bleibt im Code.', 'Robert entscheidet über Modell und Kosten; bis dahin Antworten selbst schreiben.'],
    ['bau-fehler', 'Keine gebaute Website', '«BAU · Es gibt keine gebaute Website (out/ fehlt)».', 'Backstage legt Stand und Entwurf über die gebauten Seiten in out/; ohne Bau gibt es nichts zu zeigen.', 'Im Projektordner «npm install» und «npm run build», dann Backstage neu laden.'],
    ['aus-geht-nicht', 'Ausblenden geht hier nicht', '«AUSBLENDEN · Dieser Satz steht nicht allein in seinem Baustein».', 'Der Satz teilt sich seinen Baustein mit einem Link oder einem anderen Text; ausgeblendet wird immer der ganze Baustein, darum geht es hier nicht.', 'Den Satz ändern oder kürzen statt ausblenden.'],
    ['stand-kaputt', 'Datei beschädigt', '«BESCHAEDIGT · Die Datei … ist beschädigt».', 'stand.json oder entwurf.json wurde beim Schreiben unterbrochen.', 'Reparatur «Stand/Entwurf aus der Sicherung zurückholen» (Backstage hält immer die letzte gute Fassung als .gut).'],
  ];
  function anhaengen() {
    const lex = document.getElementById('p-lexikon'); if (!lex) return;
    L.forEach(([id, t, sehen, grund, tun]) => {
      if (document.getElementById(id)) return;
      lex.insertAdjacentHTML('beforeend', `<details id="${h(id)}"><summary><span>${h(t)}</span><code>${h(id)}</code></summary><dl><dt>Sehen</dt><dd>${h(sehen)}</dd><dt>Grund</dt><dd>${h(grund)}</dd><dt>Tun</dt><dd>${h(tun)}</dd></dl></details>`);
    });
    const id = location.hash.slice(1); const d = id && document.getElementById(id); if (d && d.tagName === 'DETAILS') { d.open = true; d.scrollIntoView({ block: 'center' }); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', anhaengen); else anhaengen();
})();
