'use strict';
/* Тир-лист опенингов и эндингов (2026-11-18). Список и видео — animethemes.moe (GraphQL, разрешает запросы с сайта).
   Берём опенинги и эндинги аниме из своего топа; оценка — тир S…F.
   Оценки: db.themes[ключ] = { tier, added, updated, t: снимок темы } — синхронизируются с аккаунтом вместе с топом. */
Object.assign(EN, {
  'Опенинги': 'Openings', 'Опенинги и эндинги': 'Openings & endings', 'Оценить': 'To rate', 'Мой тир-лист': 'My tier list',
  'Все': 'All', 'Эндинги': 'Endings', 'серии {e}': 'episodes {e}', 'спойлер': 'spoiler',
  'Загружаю опенинги… {d} из {n}': 'Loading openings… {d} of {n}', 'Ищу опенинги твоих аниме…': 'Looking up openings of your anime…',
  'оценено {n}': '{n} rated', 'в твоих аниме — {n}': '{n} in your anime',
  'Сначала оцени аниме': 'Rate some anime first', 'Здесь появятся опенинги и эндинги аниме из твоего топа.': 'Openings and endings of the anime in your top will show up here.',
  'К каталогу': 'Go to catalog', 'Всё оценено': 'All rated', 'Опенинги и эндинги твоих аниме уже в тир-листе.': 'All openings and endings of your anime are in your tier list.',
  'Тир-лист пока пуст': 'Your tier list is empty', 'Включи видео и поставь тир — он появится здесь.': 'Play a video and pick a tier — it will show up here.',
  'Не получилось загрузить опенинги': "Couldn't load openings", 'Сервер с опенингами не ответил. Попробуй ещё раз чуть позже.': "The openings server didn't respond. Try again a bit later.",
  'Попробовать снова': 'Try again', 'Убрать оценку': 'Remove rating', 'Предыдущий': 'Previous', 'Следующий': 'Next',
  'Видео не загрузилось': "The video didn't load", 'Открыть на animethemes.moe': 'Open on animethemes.moe',
  'Видео и данные — animethemes.moe': 'Videos and data — animethemes.moe', 'Смотреть': 'Play', 'Обновить список': 'Refresh list',
  'без титров': 'creditless', 'В тир-листе: {t}': 'In tier list: {t}', 'Ещё не оценён': 'Not rated yet',
});

// разметка раздела переведена в app.js раньше, чем добавились слова выше, — переводим её здесь
$('.nav-btn[data-view="themes"] span').textContent = tr('Опенинги');
$('#view-themes h1').textContent = tr('Опенинги и эндинги');
$$('#thSeg [data-thmode] span').forEach((s) => { s.textContent = tr(s.textContent); });

const TH_API = 'https://graphql.animethemes.moe/';
const TH_CACHE_KEY = 'animetop.themes1';
const TH_TTL = 7 * 864e5;
const TH_Q = 'slug animethemes { type sequence slug song { title { romaji native } performances { as artist { ... on Artist { name { main } } } } } animethemeentries { version episodes spoiler nsfw videos { nodes { resolution nc link } } } }';
const TH = () => (db.themes ||= {});
const th = { mode: pref('thMode', 'rate') === 'list' ? 'list' : 'rate', kind: 'all', loading: false, prog: '', err: false, list: [], byKey: new Map(), cur: null };
let thCache = {};
try { thCache = JSON.parse(localStorage.getItem(TH_CACHE_KEY) || '{}') || {}; } catch {}
function thSaveCache() {
  try { localStorage.setItem(TH_CACHE_KEY, JSON.stringify(Object.fromEntries(Object.entries(thCache).sort((a, b) => b[1].at - a[1].at).slice(0, 600)))); } catch {}
}
const thFresh = (k) => thCache[k] && Date.now() - thCache[k].at < TH_TTL;

/* ---------- загрузка ---------- */
async function thGql(q) {
  const r = await fetch(TH_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('http ' + r.status);
  const j = await r.json();
  if (!j.data) throw new Error('gql');
  return j.data;
}
// из ответа — короткие записи: что за тема, песня, исполнители, серии и одно видео (без титров, если есть)
function thParse(mal, arr) {
  const out = [], big = window.innerWidth > 700;
  for (const an of arr || []) for (const t of an.animethemes || []) {
    if (t.type !== 'OP' && t.type !== 'ED') continue;
    const e = (t.animethemeentries || []).find((x) => x.videos?.nodes?.length);
    if (!e) continue;
    const want = big ? 1080 : 720;
    const v = [...e.videos.nodes].sort((a, b) => (b.nc - a.nc) || (Math.abs(a.resolution - want) - Math.abs(b.resolution - want)))[0];
    out.push({
      k: `${an.slug}-${t.slug}`, slug: an.slug, mal: String(mal), type: t.type, seq: t.sequence || 1, tslug: t.slug,
      song: t.song?.title?.romaji || t.song?.title?.native || '',
      artists: (t.song?.performances || []).map((p) => { const n = p.artist?.name?.main; return n && p.as ? `${n} (${p.as})` : n; }).filter(Boolean).join(', '),
      eps: e.episodes || '', spoiler: !!e.spoiler, video: v.link, nc: !!v.nc,
    });
  }
  return out;
}
async function thFetch(ids) {
  const d = await thGql('{' + ids.map((id) => `a${id}: findAnimeByExternalSite(site: MAL, id: ${+id}) { ${TH_Q} }`).join(' ') + '}');
  const now = Date.now();
  for (const id of ids) thCache[id] = { at: now, list: thParse(id, d['a' + id]) };
}
// аниме из моего топа в том же порядке, что в «Рейтинге» (titleGroups/titleRow из app.js); у серии — все её части
function thSources() {
  if (typeof titleGroups !== 'function') return [];
  return titleGroups().map((g) => ({ g, r: titleRow(g) }))
    .filter(({ r }) => r.anime && r.status !== 'not_watched')
    .sort((a, b) => ((b.r.score ?? -1) - (a.r.score ?? -1)) || ((a.r.pos ?? 1e9) - (b.r.pos ?? 1e9)))
    .map(({ g, r }) => {
      const franchise = r.anime.franchise || null;
      const own = [String(r.anime.id), ...(g.seasons || []).map((s) => String(s.anime?.id ?? s.id))];
      return { score: r.score ?? -1, anime: r.anime, ids: (franchise && thCache['f:' + g.key]?.ids) || [...new Set(own)], fr: franchise ? g.key : null, franchise };
    });
}
async function thLoad(force) {
  if (th.loading) return;
  if (force) for (const k of Object.keys(thCache)) thCache[k].at = 0;
  th.loading = true; th.err = false; th.prog = tr('Ищу опенинги твоих аниме…'); renderThemes();
  // аниме идут по порядку топа (лучшие — первыми), запросы — в 3 потока по 12 аниме
  const queue = [], queued = new Set();
  let feeding = true, done = 0, total = 0, ok = 0, bad = 0, drawT = 0;
  const draw = () => { if (Date.now() - drawT > 700) { drawT = Date.now(); renderThemes(); } };
  const worker = async () => {
    while (queue.length || feeding) {
      if (!queue.length) { await new Promise((r) => setTimeout(r, 80)); continue; }
      const part = queue.splice(0, 12);
      try { await thFetch(part); ok++; } catch { bad++; }
      done += part.length;
      th.prog = tr('Загружаю опенинги… {d} из {n}', { d: done, n: total });
      draw();
    }
  };
  const workers = [worker(), worker(), worker()];
  for (const s of thSources()) {
    if (s.fr && s.franchise && !thFresh('f:' + s.fr)) {
      // Shikimori отказывает на частые запросы — пробуем до трёх раз с паузой
      for (let n = 0; n < 3; n++) {
        try {
          const d = await gql(`{ animes(franchise: ${JSON.stringify(s.franchise)}, limit: 50) { id kind } }`);
          // спешлы, клипы и промо почти никогда не имеют своих опенингов — не тратим на них запросы
          thCache['f:' + s.fr] = { at: Date.now(), ids: d.animes.filter((a) => ['tv', 'movie', 'ova', 'ona'].includes(a.kind)).map((a) => String(a.id)) };
          break;
        } catch { await new Promise((r) => setTimeout(r, 1200 * (n + 1))); }
      }
      await new Promise((r) => setTimeout(r, 220));
    }
    const ids = s.fr ? thCache['f:' + s.fr]?.ids || s.ids : s.ids;
    for (const id of ids) if (!thFresh(id) && !queued.has(id)) { queued.add(id); queue.push(id); total++; }
  }
  feeding = false;
  await Promise.all(workers);
  th.err = bad > 0 && !ok;
  th.loading = false; th.prog = ''; thSaveCache(); renderThemes();
}

/* ---------- списки ---------- */
// все темы аниме из топа, без повторов (сезон может быть и отдельно, и в серии)
function thAll() {
  const seen = new Set(), out = [];
  for (const s of thSources()) for (const id of s.ids) for (const t of thCache[id]?.list || []) {
    if (seen.has(t.k)) continue;
    seen.add(t.k);
    out.push({ ...t, anime: { id: s.anime.id, name: s.anime.name, russian: s.anime.russian, english: s.anime.english, poster: s.anime.poster } });
  }
  return out;
}
const thKindOk = (t) => th.kind === 'all' || t.type === th.kind;
const thLabel = (t) => `${t.type}${t.seq}`;
const thTier = (tier) => TIERS.find((x) => x.t === tier);

function thRowHTML(t) {
  const my = TH()[t.k]?.tier;
  return `<div class="th-row" data-k="${esc(t.k)}">
    <button type="button" class="th-play" data-play="${esc(t.k)}" aria-label="${tr('Смотреть')}">${thPlayIcon}</button>
    <div class="th-info" data-play="${esc(t.k)}"><b><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</b>
      <span>${[t.artists, t.eps && tr('серии {e}', { e: t.eps })].filter(Boolean).map(esc).join(' · ')}${t.spoiler ? ` · <i class="th-sp">${tr('спойлер')}</i>` : ''}</span></div>
    <div class="th-tiers">${TIERS.map((x) => `<button type="button" data-rate="${x.t}" style="--c:${x.c}" class="${my === x.t ? 'on' : ''}">${x.t}</button>`).join('')}</div>
  </div>`;
}
const thPlayIcon = '<svg viewBox="0 0 24 24" class="ic"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

function renderThemes() {
  const box = $('#view-themes');
  if (!box || box.hidden) return;
  const rated = TH(), all = thAll();
  th.byKey = new Map(all.map((t) => [t.k, t]));
  for (const [k, r] of Object.entries(rated)) if (!th.byKey.has(k) && r.t) th.byKey.set(k, r.t);
  const nRated = Object.keys(rated).length, unrated = all.filter((t) => !rated[t.k]);
  $('#thStats').textContent = [tr('оценено {n}', { n: nRated }), all.length ? tr('в твоих аниме — {n}', { n: all.length }) : ''].filter(Boolean).join(' · ');
  $$('#thSeg [data-thmode]').forEach((b) => b.classList.toggle('on', b.dataset.thmode === th.mode));
  $('#thKinds').innerHTML = [['all', 'Все'], ['OP', 'Опенинги'], ['ED', 'Эндинги']].map(([v, t]) => `<button type="button" class="pill ${th.kind === v ? 'on' : ''}" data-thkind="${v}">${tr(t)}</button>`).join('')
    + `<button type="button" class="pill th-refresh" data-threfresh title="${tr('Обновить список')}">${icon('sort')}</button>`;
  const body = $('#thBody');
  const empty = (h, p, btn = '') => `<div class="empty-state small"><div class="empty-art">${icon('tiers')}</div><h2>${h}</h2><p>${p}</p>${btn}</div>`;
  const prog = th.loading ? `<p class="th-prog"><span class="th-spin"></span>${esc(th.prog)}</p>` : '';
  if (th.mode === 'rate') {
    const list = unrated.filter(thKindOk);
    th.list = list.map((t) => t.k);
    if (!thSources().length) { body.innerHTML = empty(tr('Сначала оцени аниме'), tr('Здесь появятся опенинги и эндинги аниме из твоего топа.'), `<button class="btn primary" data-go="catalog">${tr('К каталогу')}</button>`); return; }
    if (th.err && !list.length) { body.innerHTML = empty(tr('Не получилось загрузить опенинги'), tr('Сервер с опенингами не ответил. Попробуй ещё раз чуть позже.'), `<button class="btn" data-threfresh>${tr('Попробовать снова')}</button>`); return; }
    if (!list.length) { body.innerHTML = prog || empty(tr('Всё оценено'), tr('Опенинги и эндинги твоих аниме уже в тир-листе.')); return; }
    // по аниме: постер и название, под ним — его темы
    const groups = [];
    for (const t of list) { const g = groups[groups.length - 1]; if (g && g.id === t.anime.id) g.items.push(t); else groups.push({ id: t.anime.id, anime: t.anime, items: [t] }); }
    body.innerHTML = prog + groups.map((g) => `<section class="th-group">
      <div class="th-ghead"><img loading="lazy" src="${esc(g.anime.poster || '')}" alt=""><b>${esc(tn(g.anime))}</b></div>
      ${g.items.map(thRowHTML).join('')}</section>`).join('') + `<p class="th-credit">${tr('Видео и данные — animethemes.moe')}</p>`;
  } else {
    const items = Object.entries(rated).map(([k, r]) => ({ ...(th.byKey.get(k) || r.t), tier: r.tier, at: r.updated || r.added })).filter((t) => t.k && thKindOk(t));
    th.list = [];
    if (!items.length) { body.innerHTML = prog + empty(tr('Тир-лист пока пуст'), tr('Включи видео и поставь тир — он появится здесь.')); return; }
    body.innerHTML = `<div class="th-board">${TIERS.map((x) => {
      const row = items.filter((t) => t.tier === x.t).sort((a, b) => a.at - b.at);
      th.list.push(...row.map((t) => t.k));
      return `<div class="th-trow"><div class="th-tl" style="--c:${x.c}"><b>${esc(tierNames[x.t]?.name || x.t)}</b></div><div class="th-items">${row.map((t) => `<button type="button" class="th-chip" data-play="${esc(t.k)}" title="${esc(`${thLabel(t)} · ${t.song} — ${t.artists}`)}">
        <img loading="lazy" src="${esc(t.anime?.poster || '')}" alt=""><span><b>${esc(t.song || thLabel(t))}</b><small>${esc(tn(t.anime))} · ${thLabel(t)}</small></span></button>`).join('')}</div></div>`;
    }).join('')}</div><p class="th-credit">${tr('Видео и данные — animethemes.moe')}</p>`;
  }
}

/* ---------- оценка ---------- */
function thRate(k, tier) {
  const t = th.byKey.get(k);
  if (!t) return;
  const now = Date.now(), old = TH()[k];
  if (!tier) return;
  const { anime, ...rest } = t;
  TH()[k] = { tier, added: old?.added || now, updated: now, t: { ...rest, anime } };
  if (db.deleted) delete db.deleted['o:' + k];
  save();
}
function thUnrate(k) {
  if (!TH()[k]) return;
  delete TH()[k];
  (db.deleted ||= {})['o:' + k] = Date.now();
  save();
}

/* ---------- плеер ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="thDlg" class="sheet card th-dlg" aria-label="${tr('Опенинги')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="th-pl" id="thPl"></div></div>
</dialog>`);
const thDlg = $('#thDlg');
function thOpen(k) {
  const t = th.byKey.get(k);
  if (!t) return;
  th.cur = k;
  const my = TH()[k]?.tier, i = th.list.indexOf(k);
  const prev = i > 0 ? th.list[i - 1] : null, next = i >= 0 && i < th.list.length - 1 ? th.list[i + 1] : null;
  $('#thPl').innerHTML = `<div class="th-video"><video id="thVid" src="${esc(t.video)}" controls autoplay playsinline preload="auto"></video>
      <div class="th-verr" hidden>${tr('Видео не загрузилось')}<a href="https://animethemes.moe/anime/${esc(t.slug)}/${esc(t.tslug)}" target="_blank" rel="noopener">${tr('Открыть на animethemes.moe')}</a></div></div>
    <div class="th-meta"><h2><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</h2>
      <p>${[t.artists, tn(t.anime), t.eps && tr('серии {e}', { e: t.eps }), t.nc && tr('без титров')].filter(Boolean).map(esc).join(' · ')}</p>
      <p class="th-now">${my ? tr('В тир-листе: {t}', { t: tierNames[my]?.name || my }) : tr('Ещё не оценён')}</p></div>
    <div class="th-big">${TIERS.map((x) => `<button type="button" data-rate="${x.t}" style="--c:${x.c}" class="${my === x.t ? 'on' : ''}"><b>${esc(tierNames[x.t]?.name || x.t)}</b><small>${esc(tierNames[x.t]?.d ?? x.d)}</small></button>`).join('')}</div>
    <div class="th-nav">
      <button type="button" class="btn" data-thgo="${esc(prev || '')}" ${prev ? '' : 'disabled'}>${icon('back')}<span>${tr('Предыдущий')}</span></button>
      ${my ? `<button type="button" class="link" data-unrate>${tr('Убрать оценку')}</button>` : '<span></span>'}
      <button type="button" class="btn" data-thgo="${esc(next || '')}" ${next ? '' : 'disabled'}><span>${tr('Следующий')}</span>${icon('back', 'flip')}</button>
    </div>`;
  const v = $('#thVid');
  v.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  v.addEventListener('volumechange', () => setPref('thVol', String(v.muted ? 0 : v.volume)));
  v.addEventListener('error', () => { $('.th-verr', thDlg).hidden = false; });
  if (!thDlg.open) openModal(thDlg);
}
function thStop() { const v = $('#thVid'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } }
thDlg.addEventListener('close', () => { thStop(); th.cur = null; if (history.state?.modal === 'thDlg') history.back(); renderThemes(); });
thDlg.addEventListener('click', (e) => {
  if (e.target === thDlg || e.target.closest('[data-close]')) { thDlg.close(); return; }
  const go = e.target.closest('[data-thgo]');
  if (go && go.dataset.thgo) { thStop(); thOpen(go.dataset.thgo); return; }
  if (e.target.closest('[data-unrate]')) { thUnrate(th.cur); thOpen(th.cur); return; }
  const r = e.target.closest('[data-rate]');
  if (r && th.cur) {
    const k = th.cur, i = th.list.indexOf(k);
    thRate(k, r.dataset.rate);
    // в «Оценить» сразу переходим к следующему — оценённый уходит из списка
    if (th.mode === 'rate') {
      renderThemes();
      const nk = th.list[Math.max(0, Math.min(i, th.list.length - 1))];
      if (nk && nk !== k) { thStop(); thOpen(nk); } else thDlg.close();
    } else thOpen(k);
  }
});

/* ---------- раздел ---------- */
$('#view-themes').addEventListener('click', (e) => {
  const m = e.target.closest('[data-thmode]');
  if (m) { th.mode = m.dataset.thmode; setPref('thMode', th.mode); renderThemes(); window.scrollTo(0, 0); return; }
  const kd = e.target.closest('[data-thkind]');
  if (kd) { th.kind = kd.dataset.thkind; renderThemes(); return; }
  if (e.target.closest('[data-threfresh]')) { thLoad(true); return; }
  const r = e.target.closest('.th-row [data-rate]');
  if (r) { thRate(r.closest('.th-row').dataset.k, r.dataset.rate); renderThemes(); return; }
  const p = e.target.closest('[data-play]');
  if (p) thOpen(p.dataset.play);
});
// топ поменялся (оценка, синхронизация) — обновляем раздел
{
  const base = afterChange;
  afterChange = function (...a) { const out = base.apply(this, a); if (view === 'themes') renderThemes(); return out; };
}
function thShowView() {
  renderThemes();
  if (thSources().some((s) => s.ids.some((id) => !thFresh(id)) || (s.fr && !thFresh('f:' + s.fr)))) thLoad();
}
if (view === 'themes') thShowView();
