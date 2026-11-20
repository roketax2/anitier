'use strict';
/* Свои плейлисты (2026-11-20): любые треки из любых аниме, слушать подряд или вперемешку.
   db.pls[id] = { n: название, items: [снимок трека osSnap], added, updated } — синхронизируются с аккаунтом (префикс удаления 'p:').
   Чужим по ссылке на топ плейлисты не показываются. */
Object.assign(EN, {
  'Плейлисты': 'Playlists', 'В плейлист': 'Add to playlist', 'Новый плейлист': 'New playlist', 'Создать': 'Create', 'Мой плейлист': 'My playlist',
  'Название нового плейлиста': 'New playlist name', 'Плейлистов пока нет': 'No playlists yet',
  'Создай плейлист и добавляй в него треки из любых аниме — кнопкой + у трека или в окне плеера.': 'Create a playlist and add tracks from any anime with the + button next to a track or in the player.',
  'Слушать подряд': 'Play', 'Вперемешку': 'Shuffle', 'Переименовать': 'Rename', 'Удалить плейлист «{n}»?': 'Delete playlist “{n}”?',
  'Убрать из плейлиста': 'Remove from playlist', 'Плейлист пуст — добавляй треки кнопкой + у трека или в окне плеера.': 'The playlist is empty — add tracks with the + button next to a track or in the player.',
  'Добавлено в «{n}»': 'Added to “{n}”', 'Убрано из «{n}»': 'Removed from “{n}”', 'Выше': 'Up', 'Ниже': 'Down', 'Сохранить': 'Save', 'Удалить': 'Delete',
});
const OPL = () => (db.pls ||= {});
const osPlList = () => Object.entries(OPL()).sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0));
const osPlTouch = (p) => { p.updated = Date.now(); save(); };
function osPlNew(name) {
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), now = Date.now();
  OPL()[id] = { n: String(name || '').trim().slice(0, 60) || tr('Мой плейлист'), items: [], added: now, updated: now };
  save();
  return id;
}
function osPlHas(pid, tid) { return !!OPL()[pid]?.items.some((t) => t.id === tid); }
function osPlToggle(pid, x) {
  const p = OPL()[pid];
  if (!p || !x) return;
  const i = p.items.findIndex((t) => t.id === x.t.id);
  if (i >= 0) p.items.splice(i, 1); else p.items.push(osSnap(x.t, x.anime || x.t.anime));
  osPlTouch(p);
  toast(tr(i >= 0 ? 'Убрано из «{n}»' : 'Добавлено в «{n}»', { n: p.n }));
}
function osPlDel(pid) { delete OPL()[pid]; (db.deleted ||= {})['p:' + pid] = Date.now(); save(); }
function osPlPlay(pid, shuffle, from) {
  const p = OPL()[pid];
  if (!p?.items.length) return;
  for (const t of p.items) osTracks.set(t.id, { t, anime: t.anime });
  const L = p.items.map((t) => t.id);
  if (shuffle) for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  osStop();
  osOpen(from && L.includes(from) ? from : L[0], L);
}

/* ---------- окно «В плейлист» ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="osPick" class="sheet card os-pick" aria-label="${tr('В плейлист')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><h2>${tr('В плейлист')}</h2><p class="os-pick-t"></p><div id="osPickList"></div>
  <form class="os-pnew"><input name="n" maxlength="60" placeholder="${tr('Новый плейлист')}" autocomplete="off"><button class="btn primary">${icon('plus')}<span>${tr('Создать')}</span></button></form></div>
</dialog>`);
const osPick = $('#osPick');
let osPickX = null;
function osPickOpen(tid) {
  const x = osTracks.get(tid);
  if (!x || osRO()) return;
  osPickX = x;
  $('.os-pick-t', osPick).textContent = [x.t.n, x.anime && tn(x.anime)].filter(Boolean).join(' · ');
  osPickRender();
  if (!osPick.open) osPick.showModal(); // без записи в историю — поверх плеера, «назад» закроет оба окна
}
function osPickRender() {
  const L = osPlList();
  $('#osPickList').innerHTML = L.length ? L.map(([id, p]) => { const on = osPlHas(id, osPickX?.t.id); return `<button type="button" class="os-pk ${on ? 'on' : ''}" data-ospk="${esc(id)}"><span class="th-box">${on ? icon('check') : ''}</span><b>${esc(p.n)}</b><small>${tr('треков — {n}', { n: p.items.length })}</small></button>`; }).join('') : `<p class="set-note">${tr('Плейлистов пока нет')}</p>`;
}
osPick.addEventListener('click', (e) => {
  if (e.target === osPick || e.target.closest('[data-close]')) { osPick.close(); return; }
  const b = e.target.closest('[data-ospk]');
  if (b) { osPlToggle(b.dataset.ospk, osPickX); osPickRender(); }
});
osPick.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, id = osPlNew(f.n.value);
  f.n.value = '';
  osPlToggle(id, osPickX); osPickRender();
});
osPick.addEventListener('close', () => { osPickX = null; osRender(); });

/* ---------- раздел «Плейлисты» ---------- */
const osPl = { open: new Set(), edit: null };
function osPlRender(body, ro) {
  const L = osPlList(), q = os.q.toLowerCase();
  const head = `<form class="os-pnew os-pnew-top"><input name="n" maxlength="60" placeholder="${tr('Название нового плейлиста')}" autocomplete="off"><button class="btn primary">${icon('plus')}<span>${tr('Создать')}</span></button></form>`;
  if (!L.length) { body.innerHTML = head + `<div class="empty-state small"><div class="empty-art">${icon('list')}</div><h2>${tr('Плейлистов пока нет')}</h2><p>${tr('Создай плейлист и добавляй в него треки из любых аниме — кнопкой + у трека или в окне плеера.')}</p></div>`; return; }
  body.innerHTML = head + L.map(([pid, p]) => {
    const items = p.items.filter((t) => !q || `${t.n} ${t.aln} ${t.anime ? tn(t.anime) : ''}`.toLowerCase().includes(q));
    if (q && !items.length && !p.n.toLowerCase().includes(q)) return '';
    const open = osPl.open.has(pid) || !!q, cover = p.items[0]?.img;
    const name = osPl.edit === pid
      ? `<form class="os-pren" data-pid="${esc(pid)}"><input name="n" maxlength="60" value="${esc(p.n)}" autocomplete="off"><button class="btn primary">${tr('Сохранить')}</button></form>`
      : '';
    const rows = items.map((t, i) => {
      const my = osScore(OSS()[t.id]);
      osList.push(t.id);
      return `<div class="th-row os-row os-plrow" data-tid="${esc(t.id)}">${osPlayBtn(t)}<div class="th-info" data-ospl-play="${esc(pid)}" data-tid="${esc(t.id)}"><b>${esc(t.n)}</b><span>${[t.anime && tn(t.anime), t.ar].filter(Boolean).map(esc).join(' · ')}${osYt(t) ? ` · <i class="os-yt">${tr('полный')}</i>` : ''}${my ? ` · ${my}` : ''}</span></div>
        <div class="os-plbtns"><button type="button" class="icon-btn" data-osmv="${esc(pid)}" data-i="${i}" data-d="-1" ${i && !q ? '' : 'disabled'} title="${tr('Выше')}">${icon('up')}</button><button type="button" class="icon-btn" data-osmv="${esc(pid)}" data-i="${i}" data-d="1" ${i < items.length - 1 && !q ? '' : 'disabled'} title="${tr('Ниже')}">${icon('down')}</button><button type="button" class="icon-btn" data-osrm="${esc(pid)}" data-tid="${esc(t.id)}" title="${tr('Убрать из плейлиста')}">${icon('x')}</button></div></div>`;
    }).join('');
    return `<section class="th-group ${open ? 'open' : ''}"><button type="button" class="th-ghead" data-osplg="${esc(pid)}">${cover ? `<img loading="lazy" src="${esc(osArt(cover, 200))}" alt="">` : `<span class="os-plic">${icon('list')}</span>`}<span class="th-gt"><b>${esc(p.n)}</b><small>${tr('треков — {n}', { n: p.items.length })}</small></span><span class="th-chev">${icon('chev')}</span></button>
      ${open ? `<div class="th-gbody">${name}<div class="os-placts"><button type="button" class="btn primary" data-ospl-play="${esc(pid)}" ${p.items.length ? '' : 'disabled'}>${icon('play')}<span>${tr('Слушать подряд')}</span></button><button type="button" class="btn" data-ospl-shuf="${esc(pid)}" ${p.items.length > 1 ? '' : 'disabled'}><span>${tr('Вперемешку')}</span></button><button type="button" class="link" data-ospl-ren="${esc(pid)}">${tr('Переименовать')}</button><button type="button" class="link os-pldel" data-ospl-del="${esc(pid)}">${icon('trash')}<span>${tr('Удалить')}</span></button></div>
        ${rows || `<p class="th-prog">${tr('Плейлист пуст — добавляй треки кнопкой + у трека или в окне плеера.')}</p>`}</div>` : ''}</section>`;
  }).join('');
}
$('#view-ost').addEventListener('click', (e) => {
  const add = e.target.closest('[data-osadd]');
  if (add) { e.stopPropagation(); osPickOpen(add.dataset.osadd); return; }
  if (os.mode !== 'pl') return;
  const g = e.target.closest('[data-osplg]');
  if (g) { const id = g.dataset.osplg; osPl.open.has(id) ? osPl.open.delete(id) : osPl.open.add(id); osRender(); return; }
  const pl = e.target.closest('[data-ospl-play]');
  if (pl) { e.stopPropagation(); osPlPlay(pl.dataset.osplPlay, false, pl.dataset.tid); return; }
  const pb = e.target.closest('.os-plrow [data-osplay]');
  if (pb) { e.stopPropagation(); const row = pb.closest('.os-plrow'), info = row.querySelector('[data-ospl-play]'); osPlPlay(info.dataset.osplPlay, false, row.dataset.tid); return; }
  const sh = e.target.closest('[data-ospl-shuf]');
  if (sh) { osPlPlay(sh.dataset.osplShuf, true); return; }
  const rn = e.target.closest('[data-ospl-ren]');
  if (rn) { osPl.edit = osPl.edit === rn.dataset.osplRen ? null : rn.dataset.osplRen; osRender(); $('.os-pren input')?.focus(); return; }
  const dl = e.target.closest('[data-ospl-del]');
  if (dl) { const p = OPL()[dl.dataset.osplDel]; if (p && confirm(tr('Удалить плейлист «{n}»?', { n: p.n }))) { osPlDel(dl.dataset.osplDel); osRender(); } return; }
  const rm = e.target.closest('[data-osrm]');
  if (rm) { const p = OPL()[rm.dataset.osrm]; if (p) { p.items = p.items.filter((t) => t.id !== rm.dataset.tid); osPlTouch(p); osRender(); } return; }
  const mv = e.target.closest('[data-osmv]');
  if (mv) { const p = OPL()[mv.dataset.osmv], i = +mv.dataset.i, j = i + +mv.dataset.d; if (p && p.items[j]) { [p.items[i], p.items[j]] = [p.items[j], p.items[i]]; osPlTouch(p); osRender(); } }
}, true);
$('#view-ost').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.classList.contains('os-pnew-top')) { const id = osPlNew(f.n.value); osPl.open.add(id); osRender(); return; }
  if (f.classList.contains('os-pren')) { const p = OPL()[f.dataset.pid]; if (p) { p.n = f.n.value.trim().slice(0, 60) || p.n; osPlTouch(p); } osPl.edit = null; osRender(); }
});
osRender();
