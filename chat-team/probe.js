/* The chat window for «Try the chat»: asks /api/gast like the website (messages, sprache, seite), shows the answers, takes questions from Chat Team via postMessage. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const lauf = $('#lauf'), feld = $('#feld'), eingabe = $('#frage');
  const messages = [];
  let wartet = false;
  function zeile(cls, text, wer) {
    const m = document.createElement('div'); m.className = 'msg ' + cls;
    if (wer) { const s = document.createElement('small'); s.textContent = wer; m.appendChild(s); }
    m.appendChild(document.createTextNode(text)); lauf.appendChild(m); lauf.scrollTop = lauf.scrollHeight; return m;
  }
  async function frage(text) {
    text = (text || '').trim(); if (!text || wartet) return;
    const g = $('#gruss'); if (g) g.remove();
    messages.push({ role: 'user', content: text }); zeile('msg--kunde', text);
    eingabe.value = ''; eingabe.style.height = 'auto'; wartet = true;
    const w = zeile('msg--chat msg--wartet', '…', 'txtme.social');
    try {
      const r = await fetch('api/gast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages.slice(-12), sprache: 'en', seite: '/', heute: new Date().toISOString().slice(0, 10) }) });
      const d = await r.json();
      const t = d.text || d.fehler || 'The chat did not answer.';
      w.remove(); zeile('msg--chat', t, 'txtme.social'); messages.push({ role: 'assistant', content: t });
      if (d.maske) zeile('msg--chat', '«Find your piece» would open here: category, size, colour, then the matching pieces.', '');
    } catch (e) { w.remove(); zeile('msg--chat', 'No connection to the chat. Is server.py running?', ''); }
    wartet = false; eingabe.focus();
  }
  feld.onsubmit = e => { e.preventDefault(); frage(eingabe.value); };
  eingabe.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); frage(eingabe.value); } });
  eingabe.addEventListener('input', () => { eingabe.style.height = 'auto'; eingabe.style.height = Math.min(120, eingabe.scrollHeight) + 'px'; });
  document.querySelectorAll('.chat__karten [data-frage]').forEach(b => b.onclick = () => frage(b.dataset.frage));
  addEventListener('message', e => { if (e.origin !== location.origin || !e.data || !e.data.frage) return; frage(String(e.data.frage)); });
  window.probeFrage = frage;
})();
