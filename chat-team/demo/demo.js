/* Online demo of Chat Team (GitHub Pages, no server). Stands first in <head>: every call of the page to api/… is answered here in the browser
   by the unchanged Python logic of the tool (_gast/, run with Pyodide), through bruecke.py. What the visitor changes stays in localStorage of
   this browser only; nothing goes to a server, no model, no key. The chat window of «Try the chat» (probe.html in a frame) asks the page around it. */
(function () {
  'use strict';
  if (window.__chatDemo) return;
  var PYODIDE = 'https://cdn.jsdelivr.net/npm/pyodide@314.0.7/';
  var SCHLUESSEL = 'chat-team-demo-daten-v1';
  var tag = document.currentScript;
  var BASIS = new URL('.', tag ? tag.src : location.href).href;   // …/chat-team/demo/
  var echt = window.fetch.bind(window);
  var API = /\/api\/([a-z_]+)$/;

  /* The chat window inside Chat Team asks the page around it: one memory, one state. */
  var oben = null;
  try { if (window.parent !== window && window.parent.__chatDemo) oben = window.parent.__chatDemo; } catch (e) { oben = null; }
  var probe = /[?&]probe=1\b/.test(location.search);

  var bereit = null, kette = Promise.resolve(), zuletzt = '';
  function laden() {
    if (bereit) return bereit;
    window.__chatDemoLaedt = true;
    var hinweis = setTimeout(zeigeLaden, 1200);
    bereit = new Promise(function (ok, nein) {
      var s = document.createElement('script'); s.src = PYODIDE + 'pyodide.js'; s.async = true;
      s.onload = function () { ok(); }; s.onerror = function () { nein(new Error('Pyodide')); };
      document.head.appendChild(s);
    }).then(function () {
      return Promise.all([window.loadPyodide({ indexURL: PYODIDE }), echt(BASIS + 'python.json').then(function (r) { if (!r.ok) throw new Error('python.json ' + r.status); return r.json(); })]);
    }).then(function (x) {
      var py = x[0], buendel = x[1], WZ = '/txtme/werkzeuge/chat-team/';
      Object.keys(buendel.dateien).forEach(function (rel) {
        var p = WZ + rel, ordner = p.slice(0, p.lastIndexOf('/'));
        py.FS.mkdirTree(ordner); py.FS.writeFile(p, buendel.dateien[rel], { encoding: 'utf8' });
        var t = (buendel.zeiten || {})[rel]; if (t) try { py.FS.utime(p, t * 1000, t * 1000); } catch (e) { /* the date of the knowledge stays «now» */ }
      });
      py.FS.mkdirTree(WZ + 'daten');
      py.runPython('import sys, importlib.util\nsp = importlib.util.spec_from_file_location("bruecke", "' + WZ + 'bruecke.py")\nb = importlib.util.module_from_spec(sp); sys.modules["bruecke"] = b; sp.loader.exec_module(b)');
      var b = py.pyimport('bruecke');
      var alt = null; try { alt = localStorage.getItem(SCHLUESSEL); } catch (e) { alt = null; }
      if (alt) b.zurueck(alt);
      zuletzt = alt || '';
      return b;
    }).then(function (b) {
      clearTimeout(hinweis); weg(); window.__chatDemoLaedt = false; return b;
    }, function (e) {
      clearTimeout(hinweis); weg(); window.__chatDemoLaedt = false; throw e;
    });
    return bereit;
  }

  function sichern(b) {
    try { var s = String(b.stand()); if (s !== zuletzt) { localStorage.setItem(SCHLUESSEL, s); zuletzt = s; } } catch (e) { /* storage full or blocked: the demo keeps running in memory */ }
  }

  /* One request at a time, like the lock of the server. Answer: {status, daten}. */
  function frage(methode, was, query, roh, alsProbe) {
    var p = kette.then(function () { return laden(); }).then(function (b) {
      var da = null; try { da = localStorage.getItem(SCHLUESSEL); } catch (e) { da = null; }
      if (da !== null && da !== zuletzt) { b.ersetzen(da); zuletzt = da; }   // another tab of the demo wrote in between
      var aus = JSON.parse(String(b.anfrage(methode, was, query || '', roh || '', !!alsProbe)));
      if (methode !== 'GET' || was === 'ueberblick' || was === 'anfragen' || was === 'fragen') sichern(b);
      return aus;
    }, function () {
      return { status: 503, daten: { fehler: 'VERBINDUNG · The demo could not load. Please check the connection and reload the page.' } };
    });
    kette = p.catch(function () {});
    return p;
  }

  var dienst = oben || { frage: frage };
  if (!oben) window.__chatDemo = dienst;
  if (!oben) laden().catch(function () {});

  window.fetch = function (eingabe, init) {
    var url, methode = (init && init.method) || 'GET';
    try {
      url = new URL(typeof eingabe === 'string' ? eingabe : eingabe.url, location.href);
      if (typeof eingabe !== 'string' && eingabe.method && !(init && init.method)) methode = eingabe.method;
    } catch (e) { return echt(eingabe, init); }
    var m = url.origin === location.origin && API.exec(url.pathname);
    if (!m) return echt(eingabe, init);
    methode = methode.toUpperCase();
    var roh = init && typeof init.body === 'string' ? init.body : '';
    return dienst.frage(methode === 'GET' || methode === 'HEAD' ? 'GET' : 'POST', m[1], url.search.slice(1), roh, probe).then(function (a) {
      return new Response(JSON.stringify(a.daten), { status: a.status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    });
  };

  /* «Download all data (ZIP)» on the check page: the ZIP is made here and saved by the browser */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href$="api/export"]');
    if (!a) return;
    e.preventDefault();
    dienst.frage('GET', 'export', '', '', false).then(function (x) {
      if (x.status !== 200) return;
      var bin = atob(x.daten.zip), u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      var l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([u], { type: 'application/zip' }));
      l.download = 'chat-team-' + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '') + '.zip';
      document.body.appendChild(l); l.click(); setTimeout(function () { URL.revokeObjectURL(l.href); l.remove(); }, 2000);
    });
  }, true);

  /* A quiet note while the demo starts (only if it takes longer than a moment) */
  function zeigeLaden() {
    if (document.getElementById('demo-laedt')) return;
    var d = document.createElement('div'); d.id = 'demo-laedt'; d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147482000;visibility:visible;padding:12px 20px;border-radius:999px;' +
      'background:#0b0b0c;color:#f4f2ee;border:1px solid rgba(244,242,238,.18);font:500 15px/1.3 "Space Grotesk",system-ui,sans-serif;letter-spacing:.01em;white-space:nowrap';
    d.textContent = 'The demo is starting …';
    (document.body || document.documentElement).appendChild(d);
  }
  function weg() { var d = document.getElementById('demo-laedt'); if (d) d.remove(); }
})();
