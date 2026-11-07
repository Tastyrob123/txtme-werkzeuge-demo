/* Online-Fassung Partner Pack: baut die Seite im Browser genau wie build.py der Vorlagen (_cloud/txtme-quellen/partner|ambassador).
   Die Vorlage selbst (Seitentext, Stile, Skripte) liegt fertig zusammengesetzt in vorlage/<art>.json (bau_online.py),
   hier passiert nur, was build.py je Empfänger tut: Felder einsetzen. Pfade zeigen auf vorlage/<art>/… (relativ). */
(function () {
  'use strict';
  const TPL = {};
  async function vorlage(art) {
    if (!TPL[art]) TPL[art] = fetch('vorlage/' + art + '.json').then(r => { if (!r.ok) throw new Error('BAU · The template is missing (' + r.status + ').'); return r.json(); });
    return TPL[art];
  }
  // Python-Wahrheit: None, '', 0, False, [], {} sind leer
  const leer = v => v === null || v === undefined || v === '' || v === 0 || v === false || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
  const pyStr = v => v === null || v === undefined ? 'None' : v === true ? 'True' : v === false ? 'False' : String(v);
  const repl = (s, a, b) => s.split(a).join(b);

  // ---------- Partner: Mini-Mustache wie partner/build.py ----------
  const SECTION = /\{\{([#^])\s*([\w.]+)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/g;
  const VAR = /\{\{(\{?)\s*([\w.]+)\s*\}?\}\}/g;
  function lookup(stack, key) {
    if (key === '.') return stack[stack.length - 1];
    for (let i = stack.length - 1; i >= 0; i--) { const c = stack[i]; if (c && typeof c === 'object' && !Array.isArray(c) && key in c) return c[key]; }
    return '';
  }
  const escP = v => pyStr(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function renderP(tpl, stack) {
    const out = tpl.replace(SECTION, (m, kind, key, body) => {
      const val = lookup(stack, key);
      if (kind === '^') return leer(val) ? renderP(body, stack) : '';
      if (leer(val)) return '';
      if (Array.isArray(val)) return val.map(it => renderP(body, stack.concat([it]))).join('');
      return renderP(body, val && typeof val === 'object' ? stack.concat([val]) : stack);
    });
    return out.replace(VAR, (m, raw, key) => {
      const val = lookup(stack, key);
      if (val && typeof val === 'object') return '';
      return raw === '{' ? pyStr(val) : escP(val);
    });
  }
  function partnerPfade(t) {
    return t.replace(/\/partner\/(media\/|img\/|SpaceGrotesk\.woff2)/g, 'vorlage/partner/$1');
  }

  // ---------- Ambassador: wie ambassador/build.py ----------
  const escA = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  function renderA(tpl, data) {
    return tpl.replace(VAR, (m, raw, key) => {
      const val = key in data ? pyStr(data[key]) : '';
      if (raw === '{') return val;
      let v = escA(val);
      if (v.startsWith('[') && v.endsWith(']')) v = '<em class="field">' + v + '</em>';
      return v;
    });
  }
  function nummern(body) { let n = 0; return body.replace(/<span data-n><\/span>/g, () => '<span>' + String(++n).padStart(2, '0') + '</span>'); }
  function ambassadorPfade(t) {
    t = t.replace(/(?<=["\s(,])media\//g, 'vorlage/ambassador/media/');
    return repl(t, 'url("SpaceGrotesk.woff2")', 'url("vorlage/ambassador/SpaceGrotesk.woff2")');
  }

  function fuellen(shell, teile) {
    // ein Durchgang, damit kein eingesetzter Text selbst wieder ersetzt wird
    return shell.replace(/@@(TITLE|DESC|BODY|JS)@@/g, (m, k) => teile[k]);
  }

  async function seite(art, rec) {
    const T = await vorlage(art);
    if (art === 'partner') {
      const d = Object.assign({}, rec); d.is_master = !d.slug;
      const body = renderP(T.body, [d]);
      const rest = body.match(/\{\{[^}]*\}\}/g);
      if (rest) throw new Error('BAU · The page could not be built: open fields ' + Array.from(new Set(rest)).slice(0, 8).join(' '));
      return partnerPfade(fuellen(T.shell, { TITLE: escP(d.title), DESC: escP(d.desc), BODY: body, JS: T.js }));
    }
    const d = Object.assign({}, rec);
    const link = String(rec.meeting_link == null ? '' : rec.meeting_link);
    const ph = link.startsWith('[') && link.endsWith(']');
    const subject = 'Re:%20Deine%20Einladung%20von%20txtme.social';
    const mail = 'mailto:' + pyStr(rec.contact_email === undefined ? '' : rec.contact_email) + '?subject=' + subject;
    d.meeting_href = ph || !link ? mail : link;
    d.meeting_label = ph || !link ? 'Antworten' : 'Gespräch buchen';
    d.mail_href = mail;
    d.second_btn = ph || !link ? '' : '<a class="btn" href="' + escA(mail) + '">Antworten</a>';
    d.meeting_note = ph ? '<span>Termin: <em class="field">' + escA(link) + '</em></span>' : '';
    d.module = renderA(T.mods[rec.type || ''] || '', d);
    const body = nummern(renderA(T.body, d));
    const m = body.match(/\{\{[^}]+\}\}/);
    if (m) throw new Error('BAU · The page could not be built: field not replaced ' + m[0]);
    const title = 'txtme.social · Eine Einladung für ' + pyStr(rec.creator_name === undefined ? '' : rec.creator_name);
    return ambassadorPfade(fuellen(T.shell, { TITLE: escA(title), DESC: escA(T.desc), BODY: body, JS: rec.type ? T.js_typ : T.js }));
  }

  window.PartnerSeite = { seite, vorlage };
})();
