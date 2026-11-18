'use strict';
/* Переезд (2026-11-18): сайт теперь на anitierapp.pages.dev. Оценки лежат в браузере отдельно для каждого адреса,
   поэтому старый адрес (GitHub Pages) сам передаёт их новому: открывает новый сайт во вкладке и шлёт данные
   через postMessage (только между этими двумя адресами). Без данных — сразу перекидывает. */
(() => {
  const NEW = 'https://anitierapp.pages.dev', OLD = 'https://roketax2.github.io';
  const STORE = 'animetop.v1';
  const ls = (() => { try { return window.localStorage; } catch { return null; } })();
  const dump = () => { const o = {}; if (ls) for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.startsWith('animetop.') && k !== 'animetop.api') o[k] = ls.getItem(k); } return o; };
  const en = (() => { try { return (ls?.getItem('animetop.lang') || navigator.language || '').startsWith('en'); } catch { return false; } })();
  const T = (ru, eng) => (en ? eng : ru);

  /* ---------- старый адрес ---------- */
  if (location.origin === OLD) {
    const target = NEW + '/' + location.search + location.hash;
    const data = dump();
    let top = null;
    try { top = JSON.parse(data[STORE] || 'null'); } catch {}
    const has = !!(data['animetop.session'] || (top && (Object.keys(top.items || {}).length || Object.keys(top.franchises || {}).length || Object.keys(top.themes || {}).length)));
    if (!has || data['animetop.moved'] === '1') { location.replace(target); return; }
    window.MOVING = true;
    const show = () => {
      document.body.insertAdjacentHTML('beforeend', `<div id="moveBox" style="position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:16px;background:rgba(10,8,16,.86);backdrop-filter:blur(8px);font-family:Onest,system-ui,sans-serif">
        <div style="max-width:440px;padding:26px 24px;border:1px solid #3a3450;border-radius:20px;background:#17141f;color:#eee;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)">
          <img src="logo.svg" alt="" width="74" height="50" style="margin-bottom:10px">
          <h2 style="margin:0 0 10px;font:700 22px Unbounded,system-ui,sans-serif">${T('AniTier переехал!', 'AniTier has moved!')}</h2>
          <p style="margin:0 0 6px;color:#bbb;line-height:1.45">${T('Новый адрес:', 'New address:')} <b style="color:#ff4d78">anitierapp.pages.dev</b></p>
          <p id="moveTxt" style="margin:0 0 18px;color:#999;font-size:14px;line-height:1.45">${T('Нажми кнопку — оценки, тир-листы, опенинги, рамки и вход перенесутся на новый адрес.', 'Press the button — your ratings, tier lists, openings, frames and sign-in will move to the new address.')}</p>
          <button id="moveGo" style="width:100%;padding:13px 16px;border:0;border-radius:13px;background:#ff4d78;color:#fff;font:600 16px Onest,system-ui,sans-serif;cursor:pointer">${T('Перенести и открыть', 'Move and open')}</button>
        </div></div>`);
      let win = null, sent = false;
      window.addEventListener('message', (e) => {
        if (e.origin !== NEW || !e.data || e.source !== win) return;
        if (e.data.type === 'anitier-ready' && !sent) { sent = true; win.postMessage({ type: 'anitier-data', data: dump() }, NEW); }
        if (e.data.type === 'anitier-done') {
          try { ls.setItem('animetop.moved', '1'); } catch {}
          document.getElementById('moveTxt').textContent = T('Готово! Всё перенесено — эту вкладку можно закрыть.', 'Done! Everything moved — you can close this tab.');
          setTimeout(() => location.replace(target), 1500);
        }
      });
      document.getElementById('moveGo').addEventListener('click', () => {
        sent = false;
        win = window.open(NEW + '/?from=old', '_blank');
        // всплывающие окна запрещены — несём данные в адресе (до ~1,5 МБ)
        if (!win) {
          const json = JSON.stringify(dump());
          if (json.length < 1.5e6) { try { ls.setItem('animetop.moved', '1'); } catch {} location.href = NEW + '/#import=' + encodeURIComponent(json); }
          else document.getElementById('moveTxt').textContent = T('Разреши всплывающие окна для этого сайта и нажми ещё раз.', 'Allow pop-ups for this site and press again.');
        }
      });
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
    return;
  }

  /* ---------- новый адрес: принимаем данные ---------- */
  const merge = (incoming) => {
    if (!ls) return;
    let cur = null, inc = null;
    try { cur = JSON.parse(ls.getItem(STORE) || 'null'); } catch {}
    try { inc = JSON.parse(incoming[STORE] || 'null'); } catch {}
    const curEmpty = !cur || !(Object.keys(cur.items || {}).length || Object.keys(cur.franchises || {}).length || Object.keys(cur.themes || {}).length);
    for (const [k, v] of Object.entries(incoming)) {
      if (!k.startsWith('animetop.') || k === STORE || k === 'animetop.moved' || typeof v !== 'string') continue;
      if (curEmpty || ls.getItem(k) == null) ls.setItem(k, v); // настройки, вход, кэши — если на новом адресе их ещё нет
    }
    if (!inc) return;
    if (curEmpty) { ls.setItem(STORE, incoming[STORE]); return; }
    // на обоих адресах есть оценки — объединяем, у каждой записи берём более свежую
    const t = (r) => r?.updated || r?.added || 0;
    for (const part of ['items', 'franchises', 'themes']) {
      const out = { ...(cur[part] || {}) };
      for (const [k, r] of Object.entries(inc[part] || {})) if (!out[k] || t(r) > t(out[k])) out[k] = r;
      cur[part] = out;
    }
    cur.ach = { ...(inc.ach || {}), ...(cur.ach || {}) };
    cur.deleted = { ...(inc.deleted || {}), ...(cur.deleted || {}) };
    ls.setItem(STORE, JSON.stringify(cur));
  };
  const clean = () => location.origin + location.pathname;
  if (location.hash.startsWith('#import=')) {
    try { merge(JSON.parse(decodeURIComponent(location.hash.slice(8)))); } catch {}
    location.replace(clean());
    return;
  }
  if (location.search.includes('from=old') && window.opener) {
    window.MOVING = true;
    window.addEventListener('message', (e) => {
      if (e.origin !== OLD || e.source !== window.opener || e.data?.type !== 'anitier-data' || !e.data.data) return;
      try { merge(e.data.data); } catch {}
      try { window.opener.postMessage({ type: 'anitier-done' }, OLD); } catch {}
      location.replace(clean());
    });
    window.opener.postMessage({ type: 'anitier-ready' }, OLD);
  }
})();
