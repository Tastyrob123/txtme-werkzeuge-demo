/* Sprache der Oberfläche, vor allem anderen: Englisch (Auftrag Regel 3), Deutsch per Knopf «DE» (localStorage bs_sprache).
   Jede Anfrage an den Server sagt ihm die Sprache, damit seine Meldungen in derselben Sprache kommen. Kein Keks, nur der Kopf der Anfrage. */
(function () {
  var sp = 'en';
  try { var q = new URLSearchParams(location.search).get('lang'); sp = q === 'de' || q === 'en' ? q : (localStorage.getItem('bs_sprache') || 'en'); } catch (e) { /* privat */ }
  window.__bsSprache = sp;
  document.documentElement.lang = sp;
  if (sp !== 'de' || !window.fetch) return;
  var f = window.fetch.bind(window);
  window.fetch = function (u, o) {
    if (String(u && u.url || u).indexOf('/backstage/api/') > -1) { o = Object.assign({}, o || {}); var hd = new Headers(o.headers || {}); hd.set('X-Backstage-Sprache', 'de'); o.headers = hd; }
    return f(u, o);
  };
})();
