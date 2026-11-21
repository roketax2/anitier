'use strict';
/* «Царь горы» (2026-11-21): два варианта рядом — выбираешь лучший. Победитель остаётся, к нему выходит следующий,
   в конце остаётся «царь». Соревнуются аниме, персонажи, опенинги/эндинги или саундтреки.
   Только для интереса: оценки в топе не меняются. Запоминается лишь последний царь (подпись на карточке игры). */
Object.assign(EN, {
  'Царь горы': 'King of the hill', 'Два варианта — выбираешь лучший. Победитель остаётся, к нему выходит следующий.': 'Two options — pick the better one. The winner stays and faces the next one.',
  'Кто бьётся': 'Who competes', 'Персонажи': 'Characters', 'Опенинги': 'Openings', 'Саундтреки': 'Soundtracks', 'Участников': 'Contestants', 'Все': 'All',
  'Персонажи и саундтреки — из аниме твоего топа.': 'Characters and soundtracks come from the anime in your top.',
  'Бой {a} из {b}': 'Battle {a} of {b}', 'Царь': 'King', 'побед подряд — {n}': '{n} wins in a row', 'Отменить': 'Undo', 'Выйти': 'Quit',
  'Царь горы — {t}': 'King of the hill — {t}', 'Самые стойкие': 'Toughest contenders', 'побед — {n}': 'wins — {n}', 'Последний царь: {t}': 'Last king: {t}',
  'Нужно хотя бы 3 участника. Оцени больше аниме, открой их саундтреки или выбери «Популярные».': 'At least 3 contestants are needed. Rate more anime, open their soundtracks or choose “Popular”.',
  'Загружаю саундтреки… {d} из {n}': 'Loading soundtracks… {d} of {n}', 'Стоп': 'Stop', 'Слушать': 'Listen',
  'Сменить ({n})': 'Swap ({n})', 'Выбор игроков': 'Players’ choice', 'Чаще всего царём становятся (игр: {n})': 'Most often crowned (games: {n})', 'У всех игроков твой царь был царём {n} раз(а)': 'Across all players your king was crowned {n} time(s)', 'Претендент вернётся позже — выбрать всё равно придётся': 'The challenger will come back later — you still have to choose', 'Отложено: {t} — вернётся позже': 'Postponed: {t} — will come back later',
});
ICONS.crown = '<path d="M3 7.5 7.5 12 12 5l4.5 7L21 7.5 19 18H5z"/><path d="M5 21h14"/>';

const kg = { what: ['anime', 'chars', 'op', 'ost'].includes(pref('kgWhat', 'anime')) ? pref('kgWhat', 'anime') : 'anime', n: pref('kgN', '16'), sex: ['m', 'f'].includes(pref('kgSex', 'all')) ? pref('kgSex', 'all') : 'all', list: [], i: 0, king: null, streak: 0, wins: new Map(), hist: [], on: false, playing: null };
// 22.11: «Сменить» — 2 раза за игру претендента можно отложить: он уходит дальше в очередь и всё равно вернётся
const KG_SWAPS = 2;
const KG_N = [['8', '8'], ['16', '16'], ['32', '32'], ['64', '64'], ['all', 'Все']];

function kgLastHTML() { const t = pref('kgLast', ''); return t ? esc(tr('Последний царь: {t}', { t })) : ''; }
function kgSettingsHTML(seg) {
  const kseg = (name, cur, opts) => `<div class="set-seg gm-seg">${opts.map(([v, l]) => `<button type="button" data-kgset="${name}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${tr(l)}</button>`).join('')}</div>`;
  const mineOnly = kg.what === 'chars' || kg.what === 'ost';
  return `
      <div class="set-sec"><h3>${tr('Кто бьётся')}</h3>${kseg('what', kg.what, [['anime', 'Аниме'], ['chars', 'Персонажи'], ['op', 'Опенинги'], ['ost', 'Саундтреки']])}</div>
      ${mineOnly ? `<p class="set-note">${tr('Персонажи и саундтреки — из аниме твоего топа.')}</p>` : `<div class="set-sec"><h3>${tr('Аниме')}</h3>${seg('src', gm.src, [['mine', 'Из моего топа'], ['pop', 'Популярные']])}</div>`}
      ${kg.what === 'chars' ? `<div class="set-sec"><h3>${tr('Пол')}</h3>${kseg('sex', kg.sex, [['all', 'Все'], ['m', 'Парни'], ['f', 'Девушки']])}</div>` : ''}
      <div class="set-sec"><h3>${tr('Участников')}</h3>${kseg('n', kg.n, KG_N)}</div>`;
}

/* ---------- участники: { id, img, title, sub, audio?, sq? } ---------- */
const kgUniq = (arr) => { const seen = new Set(); return arr.filter((x) => x && x.img !== undefined && !seen.has(x.id) && seen.add(x.id)); };
async function kgPool() {
  if (kg.what === 'anime') {
    const pool = await gmPool(gm.src);
    return kgUniq(pool.map((p) => ({ id: 'a' + (p.anime.id || p.id), img: p.anime.poster || '', title: p.title, sub: p.anime.year ? String(p.anime.year) : '' })));
  }
  if (kg.what === 'chars') {
    if (thSources().some((s) => !chFresh(s))) await chLoad();
    // главные + самые обсуждаемые второстепенные (по 12 на аниме) — иначе в «Все» попадут сотни эпизодических
    // с выбором пола берём по 25 второстепенных — часть отсеется
    const cands = thSources().flatMap((s) => { const L = chCache[s.id]?.list || []; return [...L.filter((c) => c.m), ...L.filter((c) => !c.m).slice(0, kg.sex === 'all' ? 12 : 25)].map((c) => ({ c, s })); });
    if (kg.sex !== 'all') await chSexLoad(cands.map((x) => x.c), (d, n) => { const m = $('#gmMsg'); if (m) m.textContent = tr('Узнаю пол персонажей… {d} из {n}', { d, n }); });
    return kgUniq(cands.filter((x) => chSexOk(x.c, kg.sex)).map(({ c, s }) => ({ id: 'c' + c.id, img: c.big || c.p || '', title: chName(c), sub: tn(s.anime) })));
  }
  if (kg.what === 'op') {
    const list = [...new Map((await gmPool(gm.src)).map((p) => [p.title, p])).values()];
    if (gm.src === 'mine' && thSources().some((s) => s.parts.some((p) => !thFresh(p.id)))) await thLoad();
    const need = list.flatMap((p) => p.parts).filter((id) => !thFresh(id));
    for (let i = 0; i < need.length; i += 12) await thFetch(need.slice(i, i + 12));
    thSaveCache();
    return kgUniq(list.flatMap((p) => p.parts.flatMap((id) => (thCache[id]?.list || []).filter((t) => t.audio)
      .map((t) => ({ id: 't' + t.k, img: p.anime.poster || '', title: t.song || `${t.type}${t.seq}`, sub: `${p.title} · ${t.type}${t.seq}${t.artists ? ' · ' + t.artists : ''}`, audio: t.audio })))));
  }
  // саундтреки: оценённые треки, треки плейлистов и загруженные альбомы аниме из топа
  const trk = (t, anime) => t && t.prev && { id: 's' + t.id, img: osArt(t.img, 300), title: t.n, sub: [anime && tn(anime), t.aln].filter(Boolean).join(' · '), audio: t.prev, sq: true };
  const collect = () => kgUniq([
    ...Object.values(OSS()).map((r) => trk(r.t, r.t?.anime)),
    ...Object.values(db.pls || {}).flatMap((p) => p.items.map((t) => trk(t, t.anime))),
    ...thSources().flatMap((s) => (osCache[s.id]?.albums || []).flatMap((a) => (osCache['al:' + a.id]?.tracks || []).map((t) => trk(t, s.anime)))),
  ].filter(Boolean));
  let pool = collect();
  const want = kg.n === 'all' ? 40 : +kg.n;
  // мало треков — догружаем главный альбом нескольких аниме (iTunes медленный, не больше 5 аниме за раз)
  const todo = shuffle(thSources().filter((s) => !(osCache[s.id]?.albums || []).some((a) => osCache['al:' + a.id]))).slice(0, 5);
  for (let i = 0; i < todo.length && pool.length < want; i++) {
    $('#gmMsg') && ($('#gmMsg').textContent = tr('Загружаю саундтреки… {d} из {n}', { d: i + 1, n: todo.length }));
    const s = todo[i];
    try {
      await osLoadAnime(s);
      const al = osCache[s.id]?.albums || [];
      if (al.length) await osLoadAlbum(al.reduce((m, x) => (x.cnt > m.cnt ? x : m)).id);
    } catch {}
    pool = collect();
  }
  return pool;
}

async function kgStart() {
  gmStopAudio();
  if (!$('#gmMsg')) gmMenu();
  $('#gmMsg').textContent = tr('Готовлю игру…');
  $('[data-gmgo]') && ($('[data-gmgo]').disabled = true);
  let pool;
  try { pool = await kgPool(); } catch { pool = null; }
  if (!pool || pool.length < 3) {
    if (!$('#gmMsg')) gmMenu();
    $('#gmMsg').textContent = pool ? tr('Нужно хотя бы 3 участника. Оцени больше аниме, открой их саундтреки или выбери «Популярные».') : tr('Не получилось загрузить игру. Проверь интернет.');
    $('[data-gmgo]') && ($('[data-gmgo]').disabled = false);
    return;
  }
  gm.rounds = [];
  Object.assign(kg, { list: shuffle(pool).slice(0, kg.n === 'all' ? 200 : +kg.n), i: 1, streak: 0, wins: new Map(), hist: [], on: true, playing: null, swaps: KG_SWAPS });
  kg.king = kg.list[0];
  kgRender();
}

const kgCard = (x, side) => `<div class="kg-card ${side === 'k' ? 'king' : ''}">
  <button type="button" class="kg-pick" data-kgpick="${side}"><span class="kg-img ${x.sq ? 'sq' : ''}">${x.img ? `<img src="${esc(x.img)}" alt="">` : ''}${side === 'k' ? `<span class="kg-crown">${icon('crown')}</span>` : ''}</span><b>${esc(x.title)}</b>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>
  ${x.audio ? `<button type="button" class="btn kg-listen ${kg.playing === x.id ? 'on' : ''}" data-kgplay="${side}">${icon(kg.playing === x.id ? 'x' : 'play')}<span>${tr(kg.playing === x.id ? 'Стоп' : 'Слушать')}</span></button>` : ''}
</div>`;
function kgRender() {
  const n = kg.list.length - 1, ch = kg.list[kg.i];
  gmBox.innerHTML = `<div class="gm-play kg-play">
    <div class="gm-top"><span>${tr('Бой {a} из {b}', { a: kg.i, b: n })}</span><b class="kg-streak">${icon('crown')}${tr('побед подряд — {n}', { n: kg.streak })}</b></div>
    <div class="gm-bar"><i style="width:${((kg.i - 1) / n) * 100}%"></i></div>
    <div class="kg-duel">${kgCard(kg.king, 'k')}<span class="kg-vs">VS</span>${kgCard(ch, 'c')}</div>
    <div class="kg-foot"><button type="button" class="link" data-kgundo ${kg.hist.length ? '' : 'disabled'}>${icon('back')}<span>${tr('Отменить')}</span></button><button type="button" class="btn kg-swap" data-kgswap ${kg.swaps > 0 && kg.i < kg.list.length - 1 ? '' : 'disabled'} title="${tr('Претендент вернётся позже — выбрать всё равно придётся')}">${icon('sort')}<span>${tr('Сменить ({n})', { n: kg.swaps })}</span></button><button type="button" class="link" data-kgquit>${tr('Выйти')}</button></div>
  </div>`;
}
const kgSnap = () => kg.hist.push({ king: kg.king, streak: kg.streak, i: kg.i, wins: new Map(kg.wins), list: kg.list.slice(), swaps: kg.swaps });
// отложить претендента: переносим его в случайное место дальше по очереди (не сразу следующим, если есть выбор)
function kgSwap() {
  if (!kg.on || kg.swaps <= 0 || kg.i >= kg.list.length - 1) return;
  kgSnap();
  const [x] = kg.list.splice(kg.i, 1), from = Math.min(kg.i + 2, kg.list.length);
  kg.list.splice(from + Math.floor(Math.random() * (kg.list.length - from + 1)), 0, x);
  kg.swaps--;
  kgStopAudio();
  toast(tr('Отложено: {t} — вернётся позже', { t: x.title }));
  kgRender();
}
function kgPick(side) {
  if (!kg.on) return;
  const ch = kg.list[kg.i];
  kgSnap();
  const win = side === 'k' ? kg.king : ch;
  kg.wins.set(win.id, (kg.wins.get(win.id) || 0) + 1);
  if (side === 'k') kg.streak++; else { kg.king = ch; kg.streak = 1; }
  kg.i++;
  kgStopAudio();
  if (kg.i >= kg.list.length) kgEnd(); else kgRender();
}
function kgEnd() {
  kg.on = false;
  const k = kg.king, byId = new Map(kg.list.map((x) => [x.id, x]));
  setPref('kgLast', k.title);
  const top = [...kg.wins].filter(([id]) => id !== k.id).sort((a, b) => b[1] - a[1]).slice(0, 5);
  gmBox.innerHTML = `<div class="gm-play gm-end kg-end">
    <span class="kg-crown big">${icon('crown')}</span>
    <h2>${tr('Царь горы')}</h2>
    <div class="kg-win"><span class="kg-img ${k.sq ? 'sq' : ''}">${k.img ? `<img src="${esc(k.img)}" alt="">` : ''}</span><b>${esc(k.title)}</b>${k.sub ? `<small>${esc(k.sub)}</small>` : ''}<p>${tr('побед подряд — {n}', { n: kg.streak })}</p></div>
    ${top.length ? `<h3>${tr('Самые стойкие')}</h3><div class="kg-top">${top.map(([id, w]) => { const x = byId.get(id); return `<div class="kg-trow"><span class="kg-img ${x.sq ? 'sq' : ''}">${x.img ? `<img loading="lazy" src="${esc(x.img)}" alt="">` : ''}</span><span><b>${esc(x.title)}</b><small>${esc(x.sub || '')}</small></span><em>${tr('побед — {n}', { n: w })}</em></div>`; }).join('')}</div>` : ''}
    <div class="kg-players" id="kgPlayers"><p class="th-prog"><span class="th-spin"></span>${tr('Выбор игроков')}…</p></div>
    <div class="gm-end-btns"><button type="button" class="btn primary" data-gmgo>${tr('Ещё раз')}</button><button type="button" class="btn" data-gmmenu>${tr('К играм')}</button></div>
  </div>`;
  kgPlayers(k);
}
// 22.11: «Выбор игроков» — после игры отправляем царя и победы участников (без имени игрока) и показываем,
// кого все игроки чаще всего делают царём в этой же категории
const kgKind = () => (kg.what === 'chars' && kg.sex !== 'all' ? 'chars-' + kg.sex : kg.what);
async function kgPlayers(k) {
  const box = $('#kgPlayers');
  if (!box) return;
  const kind = kgKind(), byId = new Map(kg.list.map((x) => [x.id, x]));
  const pack = (x, n) => ({ id: x.id, t: x.title, img: x.img, sub: x.sub || '', n });
  if (!window.VIEWING && typeof visitorId !== 'undefined') {
    try { await api('POST', '/api/king', { vid: visitorId, kind, total: kg.list.length, king: pack(k, kg.wins.get(k.id) || 0), wins: [...kg.wins].filter(([id]) => id !== k.id && byId.has(id)).map(([id, n]) => pack(byId.get(id), n)).slice(0, 64) }); } catch {}
  }
  let d = null;
  try { d = await api('GET', `/api/king/${kind}?id=${encodeURIComponent(k.id)}`); } catch {}
  if (!box.isConnected) return;
  if (!d?.top?.length) { box.remove(); return; }
  const sq = kg.what === 'ost', top5 = d.top.slice(0, 5);
  box.innerHTML = `<h3>${tr('Выбор игроков')}</h3><p class="set-note">${tr('Чаще всего царём становятся (игр: {n})', { n: d.games })}</p>
    <div class="kg-top">${top5.map(([id, t, img, sub, kings], i) => `<div class="kg-trow ${id === k.id ? 'me' : ''}"><span class="kg-img ${sq ? 'sq' : ''}">${img ? `<img loading="lazy" src="${esc(img)}" alt="">` : ''}</span><span><b>${i + 1}. ${esc(t)}</b><small>${esc(sub)}</small></span><em class="kg-kings">${icon('crown')}${kings}</em></div>`).join('')}</div>
    ${top5.some((r) => r[0] === k.id) ? '' : `<p class="set-note">${tr('У всех игроков твой царь был царём {n} раз(а)', { n: d.me?.[0] || 0 })}</p>`}`;
}

function kgStopAudio() { gmStopAudio(); kg.playing = null; }
function kgListen(side) {
  const x = side === 'k' ? kg.king : kg.list[kg.i];
  if (!x?.audio) return;
  if (kg.playing === x.id) { kgStopAudio(); kgRender(); return; }
  gmStopAudio();
  gmAudio = new Audio(x.audio);
  gmAudio.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  gmAudio.onended = () => { if (kg.playing === x.id) { kg.playing = null; if (kg.on) kgRender(); } };
  gmAudio.play().catch(() => {});
  kg.playing = x.id;
  kgRender();
}

gmBox.addEventListener('click', (e) => {
  const s = e.target.closest('[data-kgset]');
  if (s) { const n = s.dataset.kgset, v = s.dataset.v; kg[n] = v; setPref('kg' + n[0].toUpperCase() + n.slice(1), v); gmMenu(); return; }
  const p = e.target.closest('[data-kgpick]');
  if (p) { kgPick(p.dataset.kgpick); return; }
  const l = e.target.closest('[data-kgplay]');
  if (l) { kgListen(l.dataset.kgplay); return; }
  if (e.target.closest('[data-kgswap]')) { kgSwap(); return; }
  if (e.target.closest('[data-kgundo]')) { const h = kg.hist.pop(); if (h) { Object.assign(kg, h); kgStopAudio(); kgRender(); } return; }
  if (e.target.closest('[data-kgquit]')) { kg.on = false; kgStopAudio(); gmMenu(); }
});
// стрелки ← → на компьютере: левый (царь) / правый (претендент)
document.addEventListener('keydown', (e) => {
  if (!kg.on || view !== 'games' || e.target.closest?.('input, textarea, dialog[open]')) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); kgPick('k'); } else if (e.key === 'ArrowRight') { e.preventDefault(); kgPick('c'); }
});
