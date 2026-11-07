/* Online-Fassung von Backstage (GitHub Pages, ohne Server).
   Der echte Server backstage.py läuft hier im Browser (Pyodide). Diese Datei
   - startet ihn mit den gebauten Seiten und dem Stand aus localStorage,
   - beantwortet die Anfragen der Oberfläche (/backstage/api/…) und, über sw.js, die Website-Seiten in den Rahmen,
   - setzt Adressen, die mit «/» beginnen, unter den Ordner dieser Fassung (…/backstage/site/…),
   - speichert nach jeder Änderung den Stand im Browser. Nichts geht an einen Server. */
(function () {
  'use strict';
  const BASE = new URL('./', location.href).pathname;            // z. B. /txtme-werkzeuge-demo/backstage/
  const SPEICHER = 'txtme_backstage_demo_v1';
  const KEKSE = 'txtme_backstage_demo_kekse';
  const DE = (() => { try { return localStorage.getItem('bs_sprache') === 'de'; } catch (e) { return false; } })();

  /* ---------- Adressen: «/x» → BASE + site/x, «/backstage/x» → BASE + x ---------- */
  function umleiten(u) {
    if (typeof u !== 'string' || u[0] !== '/' || u[1] === '/' || u.startsWith(BASE)) return u;
    if (u.startsWith('/backstage/') || u === '/backstage') return BASE + u.slice(11);
    if (u.startsWith('/werkbank/anleitung')) return BASE + 'anleitung/';
    return BASE + 'site' + u;
  }
  window.bsDemoUmleiten = umleiten;
  const ATTR = /(\s(?:href|src)=["'])(\/(?!\/)[^"']*)/g;
  const html = s => (typeof s === 'string' && s.indexOf('="/') > -1) ? s.replace(ATTR, (m, a, u) => a + umleiten(u)) : s;
  function setzer(proto, feld) {
    const d = Object.getOwnPropertyDescriptor(proto, feld); if (!d || !d.set) return;
    Object.defineProperty(proto, feld, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, umleiten(String(v))); } });
  }
  const ih = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', { configurable: true, get: ih.get, set(v) { ih.set.call(this, html(v)); } });
  const oh = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
  Object.defineProperty(Element.prototype, 'outerHTML', { configurable: true, get: oh.get, set(v) { oh.set.call(this, html(v)); } });
  const iah = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function (w, s) { return iah.call(this, w, html(s)); };
  const sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) { return sa.call(this, n, (n === 'href' || n === 'src') ? umleiten(String(v)) : v); };
  setzer(HTMLIFrameElement.prototype, 'src'); setzer(HTMLImageElement.prototype, 'src'); setzer(HTMLAnchorElement.prototype, 'href');
  const wo = window.open; window.open = function (u, ...r) { return wo.call(window, umleiten(u), ...r); };

  /* ---------- Python im Browser ---------- */
  let kekse = {};
  try { kekse = JSON.parse(sessionStorage.getItem(KEKSE) || '{}'); } catch (e) { kekse = {}; }
  function kekseMerken(kopf) {
    kopf.filter(([k]) => k.toLowerCase() === 'set-cookie').forEach(([, v]) => {
      const [paar, ...rest] = v.split(';'); const i = paar.indexOf('='); const n = paar.slice(0, i).trim(), w = paar.slice(i + 1).trim();
      if (!w || /max-age=0/i.test(rest.join(';'))) delete kekse[n]; else kekse[n] = w;
    });
    try { sessionStorage.setItem(KEKSE, JSON.stringify(kekse)); } catch (e) { /* nur diese Sitzung */ }
  }
  const keksKopf = () => Object.entries(kekse).map(([k, v]) => k + '=' + v).join('; ');

  let PY = null;
  const bereit = (async () => {
    if (!window.loadPyodide) await new Promise((ok, nein) => { const s = document.createElement('script'); s.src = BASE + 'pyodide/pyodide.js'; s.onload = ok; s.onerror = nein; document.head.appendChild(s); });
    const [py, paket] = await Promise.all([
      loadPyodide({ indexURL: BASE + 'pyodide/', stdout: () => {}, stderr: () => {} }),
      fetch(BASE + 'paket.json').then(r => r.json())
    ]);
    await py.loadPackage('pillow', { messageCallback: () => {} });
    const FS = py.FS;
    for (const [p, t] of Object.entries(paket.dateien)) { FS.mkdirTree(p.slice(0, p.lastIndexOf('/'))); FS.writeFile(p, t); }
    for (const p of Object.keys(paket.medien)) { FS.mkdirTree(p.slice(0, p.lastIndexOf('/'))); FS.writeFile(p, ''); }
    py.globals.set('MEDIEN_JSON', JSON.stringify(paket.medien));
    py.runPython('import sys; sys.path.insert(0, "/app/_backstage/online"); import bruecke; bruecke.medien(MEDIEN_JSON)');
    const B = py.pyimport('bruecke');
    let roh = null; try { roh = localStorage.getItem(SPEICHER); } catch (e) { roh = null; }
    if (roh) B.laden(roh);
    PY = B;
    return B;
  })();
  bereit.catch(e => console.warn('Backstage-Demo: Start gescheitert', e));

  function sichern() {
    try { localStorage.setItem(SPEICHER, PY.sichern()); }
    catch (e) { console.warn('Backstage-Demo: Browser-Speicher voll oder gesperrt, der Stand gilt nur bis zum Neuladen.'); }
  }

  /* methode, Server-Pfad (/backstage/api/…, /about/), Kopf {} , Rumpf (Text) → {status, kopf, rumpf: Uint8Array} */
  async function frage(methode, pfad, kopf, rumpf) {
    const B = await bereit;
    const k = Object.assign({}, kopf); const ck = keksKopf(); if (ck) k.Cookie = ck;
    const a = JSON.parse(B.anfrage(methode, pfad, JSON.stringify(k), rumpf || ''));
    kekseMerken(a.kopf);
    const bin = atob(a.rumpf), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    if (methode === 'POST' && !/\/fehler$/.test(pfad.split('?')[0])) sichern();
    return { status: a.status, kopf: a.kopf.filter(([n]) => n.toLowerCase() !== 'set-cookie'), rumpf: u8 };
  }
  window.bsDemoFrage = frage;

  function apiPfad(u) {
    const url = new URL(u, location.href); if (url.origin !== location.origin) return null;
    if (url.pathname.startsWith('/backstage/api/')) return url.pathname + url.search;
    if (url.pathname.startsWith(BASE + 'api/')) return '/backstage/api/' + url.pathname.slice(BASE.length + 4) + url.search;
    return null;
  }
  const f0 = window.fetch.bind(window);
  window.fetch = async function (eingabe, opt) {
    const u = typeof eingabe === 'string' ? eingabe : (eingabe && eingabe.url) || String(eingabe);
    const p = apiPfad(u);
    if (!p) return f0(typeof eingabe === 'string' ? umleiten(eingabe) : eingabe, opt);
    opt = opt || {};
    const kopf = {}; new Headers(opt.headers || {}).forEach((v, k) => { kopf[k] = v; });
    const a = await frage((opt.method || 'GET').toUpperCase(), p, kopf, typeof opt.body === 'string' ? opt.body : '');
    return new Response(a.rumpf, { status: a.status, headers: a.kopf });
  };

  /* ---------- Seiten für die Rahmen: sw.js fragt hier an ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async ev => {
      const d = ev.data || {}; if (d.typ !== 'bs-anfrage' || !ev.ports[0]) return;
      try { const a = await frage(d.methode, d.pfad, d.kopf || {}, d.rumpf || ''); ev.ports[0].postMessage({ ok: true, status: a.status, kopf: a.kopf, rumpf: a.rumpf.buffer }, [a.rumpf.buffer]); }
      catch (e) { ev.ports[0].postMessage({ ok: false, text: String(e) }); }
    });
    navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).then(() => navigator.serviceWorker.ready).then(() => {
      if (!navigator.serviceWorker.controller) {
        let schon = false; try { schon = sessionStorage.getItem('bs_demo_neu') === '1'; sessionStorage.setItem('bs_demo_neu', '1'); } catch (e) { schon = true; }
        if (!schon) location.reload();
      }
    }).catch(e => console.warn('Backstage-Demo: Seiten-Vermittler nicht gestartet', e));
  }

  /* ---------- Veröffentlichen: ein Satz, dass die Demo nichts auf die echte Website bringt ---------- */
  const SATZ = DE ? 'Demo: Nichts davon geht auf die echte Website. Der neue Stand bleibt nur in diesem Browser.' : 'Demo: none of this goes to the real website. The new state stays in this browser only.';
  function satz() {
    const f = document.getElementById('fenster'); if (!f || f.hidden) return;
    const k = f.querySelector('.fenster__k'); if (!k || k.querySelector('[data-demo-satz]') || k.querySelector('#bu-sch')) return;
    const fuss = k.querySelector('.fenster__f'); const ansehen = fuss && fuss.querySelector('a[href="' + BASE + 'site/"]');
    if (!ansehen || !k.querySelector('ol.bu-schritte')) return;
    const p = document.createElement('p'); p.className = 'hinweis'; p.setAttribute('data-demo-satz', ''); p.textContent = SATZ; fuss.before(p);
  }
  document.addEventListener('DOMContentLoaded', () => {
    const f = document.getElementById('fenster'); if (f) new MutationObserver(satz).observe(f, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  });
})();
