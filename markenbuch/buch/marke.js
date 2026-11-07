/* Markenbuch txtme.social · Auftritte, Zahlen, Farbwerte kopieren, «Save as PDF». Kopie von marke/buch/marke.js der Vorlage: ein Takt, nativer Scroll,
   nur Klassen setzen. Vor dem Drucken werden die Fotos geholt (addEventListener 'load' once, nie onload=, Falle Schlössli 21.10.2026). */
(function () {
  'use strict';
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var zaehle = function (wurzel) {
    $$('[data-zahl]', wurzel).concat(wurzel.hasAttribute && wurzel.hasAttribute('data-zahl') ? [wurzel] : []).forEach(function (z) {
      if (z.__lief) return; z.__lief = true;
      var ziel = parseFloat(z.getAttribute('data-zahl')), dauer = 1400, t0 = 0;
      var schreib = function (v) { z.textContent = String(Math.round(z.__ende ? ziel : v)); };
      if (ruhig) return schreib(ziel);
      var schritt = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 3); schreib(ziel * w); if (p < 1) requestAnimationFrame(schritt); };
      setTimeout(function () { requestAnimationFrame(schritt); }, 350);
    });
  };
  var zeige = function (el) { el.classList.add('da'); zaehle(el); };
  /* Vor jedem Druck stehen die Zahlen fertig da, auch bei Klick sofort nach dem Laden (Abnahme 2 N1) */
  var zahlenFertig = function () { $$('[data-zahl]').forEach(function (z) { z.__lief = true; z.__ende = true; z.textContent = z.getAttribute('data-zahl'); }); };
  window.addEventListener('beforeprint', zahlenFertig);
  var alle = $$('[data-r]'), gruppen = $$('[data-g]');
  if (ruhig || !('IntersectionObserver' in window)) { alle.forEach(zeige); gruppen.forEach(zeige); }
  else {
    $$('.titel [data-r], .titel [data-g]').forEach(function (el) { requestAnimationFrame(function () { zeige(el); }); });
    var vor = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; vor.unobserve(e.target); var im = e.target; im.loading = 'eager'; if (im.decode) im.decode().catch(function () { }); }); }, { rootMargin: '0px 0px 150% 0px' });
    $$('main img').forEach(function (im) { vor.observe(im); });
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; gio.unobserve(e.target); zeige(e.target); $$('[data-r]', e.target).forEach(zeige); }); }, { rootMargin: '0px 0px -6% 0px' });
    gruppen.forEach(function (g) { if (!g.closest('.titel')) gio.observe(g); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); zeige(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    alle.forEach(function (el) { if (!el.closest('.titel') && !el.closest('[data-g]')) io.observe(el); });
  }

  /* Kapitel im Blick: Leiste oben markiert es */
  var links = $$('.mb-leiste__k a'), abs = $$('section[id^="k"]');
  if ('IntersectionObserver' in window && abs.length) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; links.forEach(function (a) { a.classList.toggle('an', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-40% 0px -55% 0px' });
    abs.forEach(function (s) { kio.observe(s); });
  }

  /* Farbwerte kopieren */
  var kopiere = function (w, el) {
    var ok = function () { el.classList.add('kopiert'); setTimeout(function () { el.classList.remove('kopiert'); }, 1400); };
    if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(w).then(ok, alt); else alt();
    function alt() { var x = document.createElement('textarea'); x.value = w; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); ok(); } catch (e) { } x.remove(); }
  };
  $$('[data-kopie]').forEach(function (b) { b.addEventListener('click', function () { kopiere(b.getAttribute('data-kopie'), b); }); });

  /* Als PDF sichern: erst alle Fotos holen, dann drucken; jeder Klick wartet für sich */
  var pdf = document.getElementById('mb-pdf');
  if (pdf) pdf.addEventListener('click', function () {
    $$('main img[data-druck]').forEach(function (i) { if (!i.__web) { i.__web = i.getAttribute('src'); i.setAttribute('src', i.getAttribute('data-druck')); } });   // kleinere Fassung für die PDF (Abnahme F03)
    var bilder = $$('main img').filter(function (i) { return !(i.complete && i.naturalWidth > 0); });
    bilder.forEach(function (i) { i.loading = 'eager'; });
    var offen = bilder.length, fertig = false;
    var los = function () { if (fertig) return; fertig = true; $$('[data-r], [data-g]').forEach(zeige); zahlenFertig(); setTimeout(function () { window.print(); }, 80); };
    if (!offen) return los();
    bilder.forEach(function (i) { var r = function () { if (--offen <= 0) los(); }; i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
    setTimeout(los, 4000);
  });
  window.addEventListener('afterprint', function () { $$('main img[data-druck]').forEach(function (i) { if (i.__web) { i.setAttribute('src', i.__web); i.__web = null; } }); });
})();
