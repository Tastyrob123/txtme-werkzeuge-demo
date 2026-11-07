/* Läuft vor allem anderen: hält fest, dass die Prüfseite geladen wurde, und fängt Fehler der eigenen Skripte. Ohne dieses Skript
   könnte die Prüfung still scheitern, bevor sie etwas anzeigt. */
window.__pruefung = { start: Date.now(), fehler: [] };
window.addEventListener('error', function (e) { window.__pruefung.fehler.push(String(e.message)); });
