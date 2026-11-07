/* Seiten-Vermittler der Backstage-Demo (GitHub Pages, ohne Server).
   Die Website-Seiten in den Rahmen von Backstage (Entwurf, Vorher, Seitenansicht) setzt der Server im Browser (demo.js, Pyodide).
   Diese Datei fängt die Anfragen ab, fragt das Backstage-Fenster und gibt dessen Antwort zurück; Bilder, Schrift und Skripte der
   Website kommen unverändert aus der Kopie unter site/. Adressen, die mit «/» beginnen, legt sie unter diesen Ordner. */
const BASE = new URL(self.registration.scope).pathname;
const SITE = BASE + 'site';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* Kopf-Skript jeder Seite: unter der echten Adresse laufen (sonst scheitert React am Ordner davor), Links im Ordner halten */
const KOPF = p => `<script id="bs-demo-pfad">(function(){var B=${JSON.stringify(BASE)},S=B+"site",P=${JSON.stringify(p)};
var R=window.parent===window;try{history.replaceState(history.state,"",P+location.search+location.hash)}catch(e){}
/* eigener Reiter: nach dem Einlesen wieder die Adresse im Ordner zeigen, damit Neuladen und Lesezeichen gehen */
if(R){var n0=0,zur=function(){if(location.pathname.indexOf(B)!==0){try{history.replaceState(history.state,"",S+location.pathname+location.search+location.hash)}catch(e){}}if(++n0<25)setTimeout(zur,300)};window.addEventListener("load",function(){setTimeout(zur,300)})}
function um(h){if(!h||h[0]!=="/"||h[1]==="/"||h.indexOf(B)===0)return h;if(h.indexOf("/backstage/")===0)return B+h.slice(11);return S+h}
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;var h=a.getAttribute("href");var n=um(h);if(n!==h){a.setAttribute("href",n);if(R&&!a.target&&!e.defaultPrevented)e.stopImmediatePropagation()}},true);
})()</script>`;

function serverPfad(url) {
  const p = url.pathname;
  if (p.startsWith(BASE)) {
    const r = p.slice(BASE.length);
    if (r.startsWith('site/') || r === 'site') return '/' + r.slice(5);
    if (r.startsWith('api/')) return '/backstage/' + r;
    return null;                                           // Oberfläche: liegt fertig im Ordner
  }
  return p;                                                // «/x» aus der Website oder der Oberfläche
}

function dynamisch(p) {
  if (/^\/(entwurf|vorher)(\/|$)/.test(p)) { const r = p.replace(/^\/(entwurf|vorher)/, '') || '/'; return dynamisch(r) || !/\.[a-z0-9]{1,5}$/i.test(r); }
  if (p.startsWith('/backstage/api/') || p.startsWith('/media/u/') || p === '/katalog.json' || p === '/backstage.json') return true;
  const letzt = p.split('/').pop();
  return !letzt || letzt === 'index.html' || letzt === 'index.txt' || !letzt.includes('.');
}

function statisch(p, search) {
  let r = p.replace(/^\/(entwurf|vorher)(?=\/|$)/, '') || '/';
  if (r.endsWith('/')) r += 'index.html';
  else if (!r.split('/').pop().includes('.')) r += '/index.html';
  return SITE + r + (search || '');
}

async function wirt(clientId) {
  const alle = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const ist = c => { const u = new URL(c.url); return u.pathname === BASE || u.pathname === BASE + 'index.html' || u.pathname === BASE + 'pruefung.html'; };
  return alle.find(c => c.id === clientId && ist(c)) || alle.find(c => ist(c) && c.visibilityState === 'visible') || alle.find(ist) || null;
}

function frage(c, nachricht) {
  return new Promise((ok, nein) => {
    const k = new MessageChannel(); const t = setTimeout(() => nein(new Error('keine Antwort')), 60000);
    k.port1.onmessage = e => { clearTimeout(t); e.data && e.data.ok ? ok(e.data) : nein(new Error((e.data && e.data.text) || 'Fehler')); };
    c.postMessage(nachricht, [k.port2]);
  });
}

async function beantworten(e, url, p) {
  const req = e.request;
  const ziel = req.destination === 'iframe' ? 'iframe' : req.mode === 'navigate' ? 'document' : '';
  const c = await wirt(e.clientId || e.resultingClientId);
  if (c) {
    try {
      const kopf = { 'Sec-Fetch-Dest': ziel || 'empty' };
      req.headers.forEach((v, k) => { if (/^(content-type|x-backstage|x-backstage-sprache|accept|rsc|next-router-state-tree|next-url)$/i.test(k)) kopf[k] = v; });
      const rumpf = req.method === 'POST' ? await req.text() : '';
      const a = await frage(c, { typ: 'bs-anfrage', methode: req.method, pfad: p + url.search, kopf, rumpf });
      const h = new Headers(); a.kopf.forEach(([k, v]) => { if (!/^(content-length|connection|content-security-policy|x-frame-options)$/i.test(k)) h.append(k, v); });
      if (a.status >= 300 && a.status < 400 && h.get('location')) {
        const l = new URL(h.get('location'), url); return Response.redirect(l.origin === url.origin ? new URL(SITE + (serverPfad(l) || l.pathname) + l.search, url.origin).href : l.href, 302);
      }
      if ((h.get('content-type') || '').includes('text/html')) {
        const t = new TextDecoder().decode(a.rumpf);
        return new Response(t.replace(/<head([^>]*)>/i, m => m + KOPF(p.replace(/index\.html$/, ''))), { status: a.status, headers: h });
      }
      return new Response(a.rumpf, { status: a.status, headers: h });
    } catch (err) { /* weiter mit der Kopie */ }
  }
  if (p.startsWith('/backstage/api/')) return new Response(JSON.stringify({ fehler: 'DEMO · Backstage is not open in this browser.', lex: 'server-aus' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  return holen(statisch(p, ''), req, p);
}

async function holen(adresse, req, p) {
  const r = await fetch(adresse, { credentials: 'same-origin' });
  if (r.ok && (r.headers.get('content-type') || '').includes('text/html') && p !== null) {
    const t = await r.text();
    return new Response(t.replace(/<head([^>]*)>/i, m => m + KOPF(p.replace(/index\.html$/, ''))), { status: r.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return r;
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  const p = serverPfad(url);
  if (p === null) return;                                  // Dateien der Oberfläche normal laden
  if (p.startsWith('/werkbank/anleitung')) { e.respondWith(fetch(BASE + 'anleitung/')); return; }
  if (dynamisch(p)) { e.respondWith(beantworten(e, url, p)); return; }
  e.respondWith(fetch(statisch(p, url.search)));
});
