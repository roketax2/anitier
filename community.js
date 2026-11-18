'use strict';
/* Рейтинг сообщества (2026-11-18): средние оценки игроков AniTier.
   Сайт сам отправляет свои оценки (только числа и названия песен — без имени, почты и адресов);
   выключается в «Настройках». Сервер: worker/src/community.ts. */
Object.assign(EN, {
  'AniTier: {s}': 'AniTier: {s}', '{n} оценок игроков': '{n} player ratings', 'Топ игроков': 'Players’ top',
  'Топ аниме AniTier': 'AniTier top anime', 'Средние оценки игроков AniTier': 'Average ratings of AniTier players',
  'Пока мало оценок — рейтинг появится, когда игроки оценят больше.': 'Not enough ratings yet — the chart appears as players rate more.',
  'Рейтинг AniTier': 'AniTier rating', 'Участвую': 'I take part', 'Не участвую': 'I don’t',
  'Твои оценки без имени добавляются в общий рейтинг игроков.': 'Your ratings are added anonymously to the players’ chart.',
  'игроков: {n}': 'players: {n}', 'оценок: {n}': 'ratings: {n}', 'моя {n}': 'mine {n}', 'Загружаю…': 'Loading…',
});
if (typeof EN_PL !== 'undefined') EN_PL['оценка игрока'] = ['player rating', 'player ratings'];
const cm = { anime: null, themes: null, loading: {} };
const cmOn = () => pref('cmOn', '1') === '1';

/* ---------- отправка своих оценок ---------- */
function cmPayload() {
  if (!cmOn()) return { anime: {}, themes: {} };
  const anime = {};
  for (const [id, r] of Object.entries(db.items || {})) if (r.score != null) anime[id] = Math.round(r.score);
  for (const r of Object.values(db.franchises || {})) if (r.score != null && r.anime?.id && anime[r.anime.id] == null) anime[r.anime.id] = Math.round(r.score);
  const themes = {};
  for (const [k, r] of Object.entries(db.themes || {})) {
    const s = r.score ?? { S: 10, A: 9, B: 8, C: 7, D: 5, F: 3 }[r.tier];
    const t = r.t || {};
    if (s) themes[k] = [s, { song: t.song, artists: t.artists, ru: t.anime?.russian || t.anime?.name, en: t.anime?.english || t.anime?.name, poster: t.anime?.poster, type: t.type, seq: t.seq, slug: t.slug, tslug: t.tslug, mal: t.mal }];
  }
  return { anime, themes };
}
let cmT = 0;
async function cmSend(force) {
  if (window.VIEWING || (typeof visitorId === 'undefined')) return;
  const p = cmPayload();
  const sig = JSON.stringify([Object.entries(p.anime).sort(), Object.keys(p.themes).sort().map((k) => k + p.themes[k][0]), !!acct?.token]);
  if (!force && sig === pref('cmSig', '')) return;
  try { await api('POST', '/api/vote', { vid: visitorId, ...p }); setPref('cmSig', sig); } catch {}
}
{
  const base = save;
  save = function (...a) { const out = base.apply(this, a); clearTimeout(cmT); cmT = setTimeout(cmSend, 15000); return out; };
}
setTimeout(cmSend, 8000);

/* ---------- получение средних ---------- */
async function cmLoad(kind) {
  if (cm[kind] || cm.loading[kind]) return cm.loading[kind];
  cm.loading[kind] = (async () => {
    try {
      const r = await fetch(API_BASE + '/api/community/' + kind);
      const d = await r.json();
      cm[kind] = { voters: d.voters || 0, map: new Map((d.items || []).map((x) => [x[0], x])) };
    } catch { cm[kind] = { voters: 0, map: new Map() }; }
    return cm[kind];
  })();
  return cm.loading[kind];
}
// строка в карточке: «AniTier 8.7 · 12 оценок игроков» (у серии — среднее по её частям)
function cmLine(a, title, members) {
  if (!cm.anime) { cmLoad('anime').then(() => { if (cs && typeof renderCard === 'function' && $('#card').open) renderCard(); }); return ''; }
  const ids = title ? (members || []).map((m) => String(m.id)) : [String(a.id)];
  let sum = 0, n = 0;
  for (const id of ids) { const x = cm.anime.map.get(id); if (x) { sum += x[1] * x[2]; n += x[2]; } }
  if (!n) return '';
  return `<div class="world cm-world"><span class="cm-dot">A</span><b>${(sum / n).toFixed(1)}</b><span>${n} ${plural(n, ['оценка игрока', 'оценки игроков', 'оценок игроков'])}</span></div>`;
}

/* ---------- топ аниме AniTier ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="cmDlg" class="sheet card cm-dlg" aria-label="${tr('Топ аниме AniTier')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="set-body" id="cmBody"></div></div>
</dialog>`);
const cmDlg = $('#cmDlg');
let cmList = [];
async function openCmTop() {
  $('#cmBody').innerHTML = `<h2>${tr('Топ аниме AniTier')}</h2><p class="th-prog"><span class="th-spin"></span>${tr('Загружаю…')}</p>`;
  openModal(cmDlg);
  const d = await cmLoad('anime');
  const min = d.voters >= 10 ? 3 : 1;
  const top = [...d.map.values()].filter((x) => x[2] >= min).sort((x, y) => y[1] - x[1] || y[2] - x[2]).slice(0, 100);
  let info = new Map();
  try {
    for (let i = 0; i < top.length; i += 50) {
      const r = await gql(`{ animes(ids: ${JSON.stringify(top.slice(i, i + 50).map((x) => x[0]).join(','))}, limit: 50) { ${LIGHT} } }`);
      r.animes.forEach((a) => info.set(String(a.id), a));
    }
  } catch {}
  cmList = top.map((x) => ({ x, a: info.get(String(x[0])) })).filter((o) => o.a);
  $('#cmBody').innerHTML = `<h2>${tr('Топ аниме AniTier')}</h2><p class="set-note">${tr('Средние оценки игроков AniTier')} · ${tr('игроков: {n}', { n: d.voters })}</p>`
    + (cmList.length ? `<div class="cm-list">${cmList.map(({ x, a }, i) => { const my = db.items[a.id]?.score; return `<button type="button" class="cm-row" data-cm="${i}">
        <span class="cm-rk">${i + 1}</span><img loading="lazy" src="${esc(a.poster?.previewUrl || a.poster?.mainUrl || '')}" alt="">
        <span class="cm-t"><b>${esc(tn(a))}</b><small>${[a.airedOn?.year, tr('оценок: {n}', { n: x[2] }), my != null ? tr('моя {n}', { n: my }) : ''].filter(Boolean).join(' · ')}</small></span>
        <span class="cm-sc">${x[1].toFixed(1)}</span></button>`; }).join('')}</div>`
      : `<p class="set-note">${tr('Пока мало оценок — рейтинг появится, когда игроки оценят больше.')}</p>`);
}
cmDlg.addEventListener('click', (e) => {
  if (e.target === cmDlg || e.target.closest('[data-close]')) { cmDlg.close(); return; }
  const b = e.target.closest('[data-cm]');
  if (b) { const o = cmList[+b.dataset.cm]; if (o) { cmDlg.close(); setTimeout(() => openCard(o.a, 'season'), 50); } }
});
cmDlg.addEventListener('close', () => { if (history.state?.modal === 'cmDlg') history.back(); });

/* ---------- топ опенингов игроков (вкладка «Опенинги», themes.js) ---------- */
function cmThemesHTML() {
  if (!cm.themes) { cmLoad('themes').then(() => { if (view === 'themes') renderThemes(); }); return `<p class="th-prog"><span class="th-spin"></span>${tr('Загружаю…')}</p>`; }
  const min = cm.themes.voters >= 10 ? 3 : 1;
  const top = [...cm.themes.map.values()].filter((x) => x[2] >= min && x[3]).sort((x, y) => y[1] - x[1] || y[2] - x[2]).slice(0, 100);
  // темы из топа — в плеер: снимок из данных сервера, видео догрузим при открытии
  th.list = [];
  for (const [k, , , m] of top) {
    if (!th.byKey.has(k)) th.byKey.set(k, { k, slug: m.slug, tslug: m.tslug, mal: m.mal, type: m.type, seq: m.seq || 1, song: m.song, artists: m.artists, eps: '', anime: { russian: m.ru, name: m.en, english: m.en, poster: m.poster }, vids: null });
    th.list.push(k);
  }
  if (!top.length) return `<div class="empty-state small"><div class="empty-art">${icon('music')}</div><h2>${tr('Топ игроков')}</h2><p>${tr('Пока мало оценок — рейтинг появится, когда игроки оценят больше.')}</p></div>`;
  return `<p class="set-note cm-note">${tr('Средние оценки игроков AniTier')} · ${tr('игроков: {n}', { n: cm.themes.voters })}</p><div class="cm-list">${top.map(([k, avg, n], i) => {
    const t = th.byKey.get(k), my = thScore(TH()[k]);
    return `<div class="cm-row th-cmrow"><span class="cm-rk">${i + 1}</span>
      <button type="button" class="th-play" data-play="${esc(k)}" aria-label="${tr('Смотреть')}">${thPlayIcon}</button>
      <span class="cm-t" data-play="${esc(k)}"><b><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</b><small>${[t.artists, tn(t.anime), tr('оценок: {n}', { n }), my != null ? tr('моя {n}', { n: my }) : ''].filter(Boolean).map(esc).join(' · ')}</small></span>
      <span class="cm-sc" style="--c:${thColor(Math.round(avg))}">${avg.toFixed(1)}</span></div>`;
  }).join('')}</div>`;
}
// у темы из топа игроков нет видео в снимке — догружаем с animethemes перед плеером
async function cmEnsureVideo(k) {
  const t = th.byKey.get(k);
  if (!t || t.vids?.length || !t.mal) return;
  if (!thFresh(t.mal)) { try { await thFetch([t.mal]); thSaveCache(); } catch {} }
  const full = (thCache[t.mal]?.list || []).find((x) => x.k === k);
  if (full) Object.assign(t, { vids: full.vids, audio: full.audio, eps: full.eps, spoiler: full.spoiler });
}

{ const b = $('#thSeg [data-thmode="top"] span'); if (b) b.textContent = tr('Топ игроков'); }
if (view === 'themes' && th.mode === 'top') renderThemes();
