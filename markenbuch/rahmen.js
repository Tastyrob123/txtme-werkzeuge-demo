/* Rahmen R03/R04 (Kopie des Blocks aus der Vorlage, dort inline; hier als eigene Datei, damit die Sicherheitsregel des Servers kein eingebettetes
   Skript braucht): Fehler mitschreiben, bevor irgendetwas anderes läuft (localStorage und Meldung an api/fehler), und die Startfehler-Tür mit
   «Open check page». Netzfehler nie melden, höchstens 20 je Seite, eigener Fehlschlag nie erneut. Wache nach 12 s. */
(function () {
  var zahl = 0, WURZEL = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
  function merk(t) {
    t = String(t);
    if (++zahl > 20 || /Load failed|access control|abort|NetworkError|Failed to fetch/i.test(t)) return;
    try { var a = JSON.parse(localStorage.getItem('markenbuch-fehler') || '[]'); a.push({ zeit: new Date().toISOString(), text: t.slice(0, 600) }); localStorage.setItem('markenbuch-fehler', JSON.stringify(a.slice(-30))); } catch (e) { }
    try { fetch(WURZEL + 'api/fehler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Markenbuch · ' + t.slice(0, 580) }), keepalive: true }).catch(function () { }); } catch (e) { }
  }
  window.addEventListener('error', function (e) { if (!e.message && e.target && e.target !== window) return; merk((e.message || 'Fehler') + ' · ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { merk('Versprechen: ' + ((e.reason && e.reason.message) || e.reason)); });
  window.werkzeugMerk = merk;
  /* Sprache der Oberfläche (Abnahme 2 N7: bei deutscher Oberfläche war die Tür ganz englisch) */
  var DE = (function () { try { var q = /[?&]sprache=(de|en)\b/.exec(location.search); if (q) return q[1] === 'de'; if (/\/de\.html$/.test(location.pathname)) return true; return localStorage.getItem('markenbuch-sprache') === 'de'; } catch (e) { return false; } })();
  var W = DE ? { titel: 'Das Markenbuch startet nicht.', pruef: 'Prüfseite öffnen', neu: 'Neu laden', grund: 'Das Werkzeug wurde nicht geladen.', wache: 'Das Werkzeug hat nach 12 Sekunden nicht geantwortet. Verbindung prüfen und neu laden.' }
             : { titel: 'The Brand Book does not start.', pruef: 'Open check page', neu: 'Reload', grund: 'The tool did not load.', wache: 'The tool has not answered after 12 seconds. Check the connection and reload.' };
  window.werkzeugTuer = function (grund) {
    if (document.getElementById('wz-tuer')) return;
    var d = document.createElement('div'); d.id = 'wz-tuer'; d.setAttribute('role', 'alert');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;visibility:visible;display:grid;place-items:center;padding:24px;background:rgba(11,11,12,.96);color:#f4f2ee;font-family:"Space Grotesk",system-ui,sans-serif;text-align:center';
    d.innerHTML = '<div style="max-width:520px"><p style="font-size:1.6rem;font-weight:600;letter-spacing:-.02em;margin:0 0 10px">' + W.titel + '</p><p id="wz-tuer-t" style="margin:0 0 22px;color:#9d9b96"></p>'
      + '<a href="' + WURZEL + 'pruefung.html" style="display:inline-block;margin:0 6px;padding:14px 22px;border-radius:999px;background:linear-gradient(100deg,#60c4e3,#eb5986);color:#0b0b0c;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase">' + W.pruef + '</a>'
      + '<button type="button" id="wz-tuer-neu" style="margin:0 6px;padding:14px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:none;color:#f4f2ee;font:inherit;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;cursor:pointer">' + W.neu + '</button></div>';
    d.querySelector('#wz-tuer-neu').addEventListener('click', function () { location.reload(); });   /* kein eingebetteter Klick: die Sicherheitsregel des Servers verbietet ihn (Abnahme F04) */
    d.querySelector('#wz-tuer-t').textContent = String(grund || W.grund).replace(/^[A-ZÄÖÜ-]+ · /, '');
    (document.body || document.documentElement).appendChild(d); merk('Startfehler: ' + grund);
  };
  setTimeout(function () { if (!window.__werkzeugBereit && !/\/buch\//.test(location.pathname) && !/pruefung\.html/.test(location.pathname)) window.werkzeugTuer(W.wache); }, 12000);
})();
