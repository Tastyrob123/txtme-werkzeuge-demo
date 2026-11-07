/* Bühne R16 (Kopie von studio/buehne.js der Vorlage; Abnahme F07, 06.11.2026). Jeder <header class="titel"> einer Ansicht wird zur dunklen Bühne
   mit einem Foto der Marke rechts. Das Foto steht in data-kb am Kopf (livre.js wählt je Ansicht eines, das nicht schon im ersten Bild steht).
   Anders als die Vorlage: das Foto gilt als da, sobald es geladen ist (nie decode() abwarten), es bewegt sich nicht (Regel 55d, die Maske
   liegt über einem ruhenden Bild), und der Federn-Auftritt fehlt, weil Le Livre seine Auftritte selbst macht (dort griff er schon in der Vorlage nicht). */
(function () {
  function baue(h) {
    var k = h.getAttribute('data-kb');
    if (h.__b === k) return; h.__b = k;
    var alt = h.querySelector('.buehne__foto'); if (alt) alt.remove();
    if (!k) { h.classList.remove('buehne'); return; }
    h.classList.add('buehne');
    var f = document.createElement('div'); f.className = 'buehne__foto'; f.setAttribute('aria-hidden', 'true');
    var im = new Image(); im.alt = ''; im.decoding = 'sync';
    var da = function () { f.classList.add('da'); };
    im.onload = da; im.onerror = da;   // ein fehlendes Foto hält den Auftakt nie auf
    im.src = k;
    f.appendChild(im); h.insertBefore(f, h.firstChild);
    if (im.complete) da();
  }
  function alle() { [].forEach.call(document.querySelectorAll('header.titel'), baue); }
  new MutationObserver(alle).observe(document.body, { childList: true, subtree: true });
  alle();
})();
