'use strict';
/* Опенинги и эндинги (2026-11-18). Список и видео — animethemes.moe (GraphQL, разрешает запросы с сайта).
   Темы аниме из своего топа (и любого аниме через поиск), оценка 1–10, тир-лист по оценке (как в топе).
   Оценки: db.themes[ключ] = { score, added, updated, t: снимок темы } — синхронизируются с аккаунтом вместе с топом. */
Object.assign(EN, {
  'Опенинги': 'Openings', 'Опенинги и эндинги': 'Openings & endings', 'По аниме': 'By anime', 'Мой тир-лист': 'My tier list',
  'Все': 'All', 'Эндинги': 'Endings', 'серии {e}': 'episodes {e}', 'спойлер': 'spoiler',
  'Загружаю опенинги… {d} из {n}': 'Loading openings… {d} of {n}', 'Ищу опенинги твоих аниме…': 'Looking up openings of your anime…',
  'оценено {n}': '{n} rated', 'в твоих аниме — {n}': '{n} in your anime', 'оценено {a} из {b}': '{a} of {b} rated',
  'Сначала оцени аниме': 'Rate some anime first', 'Здесь появятся опенинги и эндинги аниме из твоего топа. Или найди любое аниме поиском.': 'Openings and endings of the anime in your top will show up here. Or search for any anime.',
  'К каталогу': 'Go to catalog', 'Ничего не подходит': 'Nothing matches', 'Попробуй другие фильтры.': 'Try other filters.',
  'Тир-лист пока пуст': 'The tier list is empty', 'Включи видео и поставь оценку — опенинг появится здесь.': 'Play a video and rate it — it will show up here.',
  'Не получилось загрузить опенинги': "Couldn't load openings", 'Сервер с опенингами не ответил. Попробуй ещё раз чуть позже.': "The openings server didn't respond. Try again a bit later.",
  'Попробовать снова': 'Try again', 'Убрать оценку': 'Remove rating', 'Предыдущий': 'Previous', 'Следующий': 'Next',
  'Видео не загрузилось': "The video didn't load", 'Открыть на animethemes.moe': 'Open on animethemes.moe',
  'Видео и данные — animethemes.moe': 'Videos and data — animethemes.moe', 'Смотреть': 'Play', 'Обновить список': 'Refresh list',
  'без титров': 'creditless', 'Моя оценка: {n}': 'My rating: {n}', 'Ещё не оценён': 'Not rated yet',
  'Все аниме': 'All anime', 'Оценённые аниме': 'Rated anime', 'Аниме 10/10': 'Anime 10/10', 'Аниме 5–10': 'Anime 5–10', 'Без оценки': 'Unrated',
  'Развернуть все': 'Expand all', 'Свернуть все': 'Collapse all', 'моя {n}': 'mine {n}',
  'Найди любое аниме — оцени его опенинги': 'Find any anime to rate its openings', 'Поиск': 'Search', 'Ищу…': 'Searching…',
  'Ничего не нашлось': 'Nothing found', 'У этого аниме нет опенингов в базе': 'No openings for this anime in the database',
  'Тип': 'Type', 'Только неоценённые': 'Only unrated', 'Фильтр по твоей оценке самого аниме': 'Filters by your rating of the anime itself',
  'Аниме: все': 'Anime: all', 'Аниме: оценённые': 'Anime: rated', 'Аниме: 10/10': 'Anime: 10/10', 'Аниме: 5–10': 'Anime: 5–10',
  'Все аниме из топа': 'All anime in your top', 'С оценкой и без': 'Rated or not', 'Только оценённые аниме': 'Only rated anime',
  'Без тех, где ты ещё не поставил оценку': "Skips anime you haven't rated yet", 'Аниме на 10': 'Anime rated 10', 'Только то, чему ты поставил 10': 'Only what you gave a 10',
  'Аниме от 5 до 10': 'Anime rated 5–10', 'Без того, что тебе не понравилось': "Skips what you didn't like",
  'Качество': 'Quality', 'Только звук': 'Audio only', 'Опенинги {l}': '{l}’s openings', 'Оценка: {n}': 'Rating: {n}', 'нет оценки': 'no rating',
});

// разметка раздела переведена в app.js раньше, чем добавились слова выше, — переводим её здесь
$('.nav-btn[data-view="themes"] span').textContent = tr('Опенинги');
$('#view-themes h1').textContent = tr('Опенинги и эндинги');
$$('#thSeg [data-thmode] span').forEach((s) => { s.textContent = tr(s.textContent); });
$('#thSearch').placeholder = tr('Найди любое аниме — оцени его опенинги');

const TH_API = 'https://graphql.animethemes.moe/';
const TH_CACHE_KEY = 'animetop.themes3';
const TH_TTL = 7 * 864e5;
const TH_Q = 'slug animethemes { type sequence slug song { title { romaji native } performances { as artist { ... on Artist { name { main } } } } } animethemeentries { version episodes spoiler videos { nodes { resolution nc link audio { link } } } } }';
const TH = () => (db.themes ||= {});
const th = {
  mode: pref('thMode', 'anime') === 'list' ? 'list' : 'anime', kind: 'all', af: pref('thAf', 'all'), unr: false,
  open: new Set(), q: '', found: null, searching: false, loading: false, prog: '', err: false, list: [], byKey: new Map(), cur: null,
};
try { localStorage.removeItem('animetop.themes1'); localStorage.removeItem('animetop.themes2'); } catch {} // старые кэши без сезонов, качества и звука
let thCache = {};
try { thCache = JSON.parse(localStorage.getItem(TH_CACHE_KEY) || '{}') || {}; } catch {}
function thSaveCache() {
  try { localStorage.setItem(TH_CACHE_KEY, JSON.stringify(Object.fromEntries(Object.entries(thCache).sort((a, b) => b[1].at - a[1].at).slice(0, 700)))); } catch {}
}
const thFresh = (k) => thCache[k] && Date.now() - thCache[k].at < TH_TTL;
// оценка → тир, как в топе (achievements.js tierOf)
const thTierOf = (s) => (s == null ? null : s >= 10 ? 'S' : s >= 9 ? 'A' : s >= 8 ? 'B' : s >= 7 ? 'C' : s >= 5 ? 'D' : 'F');
const thColor = (s) => TIERS.find((x) => x.t === thTierOf(s))?.c || 'var(--muted)';
const thScore = (r) => (r ? r.score ?? { S: 10, A: 9, B: 8, C: 7, D: 5, F: 3 }[r.tier] ?? null : null); // первые оценки были тирами

/* ---------- загрузка ---------- */
async function thGql(q) {
  const r = await fetch(TH_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('http ' + r.status);
  const j = await r.json();
  if (!j.data) throw new Error('gql');
  return j.data;
}
// из ответа — короткие записи: тема, песня, исполнители, серии и все варианты видео (качество, без титров)
function thParse(mal, arr) {
  const out = [];
  for (const an of arr || []) for (const t of an.animethemes || []) {
    if (t.type !== 'OP' && t.type !== 'ED') continue;
    const e = (t.animethemeentries || []).find((x) => x.videos?.nodes?.length);
    if (!e) continue;
    const seen = new Set();
    const vids = e.videos.nodes.map((v) => ({ r: v.resolution || 0, nc: !!v.nc, l: v.link })).filter((v) => v.l && !seen.has(v.r + '' + v.nc) && seen.add(v.r + '' + v.nc))
      .sort((a, b) => b.r - a.r || b.nc - a.nc);
    out.push({
      k: `${an.slug}-${t.slug}`, slug: an.slug, mal: String(mal), type: t.type, seq: t.sequence || 1, tslug: t.slug,
      song: t.song?.title?.romaji || t.song?.title?.native || '',
      artists: (t.song?.performances || []).map((p) => { const n = p.artist?.name?.main; return n && p.as ? `${n} (${p.as})` : n; }).filter(Boolean).join(', '),
      eps: e.episodes || '', spoiler: !!e.spoiler, vids, audio: e.videos.nodes.find((v) => v.audio?.link)?.audio.link || '',
    });
  }
  return out;
}
async function thFetch(ids) {
  const d = await thGql('{' + ids.map((id) => `a${id}: findAnimeByExternalSite(site: MAL, id: ${+id}) { ${TH_Q} }`).join(' ') + '}');
  const now = Date.now();
  for (const id of ids) thCache[id] = { at: now, list: thParse(id, d['a' + id]) };
}
// части серии (Shikimori): номер, название, год — чтобы подписать, из какого сезона тема
async function thLoadParts(s) {
  for (let n = 0; n < 3; n++) {
    try {
      const d = await gql(`{ animes(franchise: ${JSON.stringify(s.franchise)}, limit: 50) { id kind name russian english airedOn { year date } } }`);
      // спешлы, клипы и промо почти никогда не имеют своих опенингов — не тратим на них запросы
      const parts = d.animes.filter((a) => ['tv', 'movie', 'ova', 'ona'].includes(a.kind))
        .sort((a, b) => (a.airedOn?.date || a.airedOn?.year || '9999').toString().localeCompare((b.airedOn?.date || b.airedOn?.year || '9999').toString()))
        .map((a) => ({ id: String(a.id), name: a.name, russian: a.russian, english: a.english, kind: a.kind }));
      thCache['p:' + s.fr] = { at: Date.now(), parts };
      return;
    } catch { await new Promise((r) => setTimeout(r, 1200 * (n + 1))); } // Shikimori отказывает на частые запросы
  }
}
// аниме из моего топа в том же порядке, что в «Рейтинге» (titleGroups/titleRow из app.js); у серии — все её части
function thSources() {
  if (typeof titleGroups !== 'function') return [];
  return titleGroups().map((g) => ({ g, r: titleRow(g) }))
    .filter(({ r }) => r.anime && r.status !== 'not_watched')
    .sort((a, b) => ((b.r.score ?? -1) - (a.r.score ?? -1)) || ((a.r.pos ?? 1e9) - (b.r.pos ?? 1e9)))
    .map(({ g, r }) => {
      const franchise = r.anime.franchise || null, fr = franchise ? g.key : null;
      const parts = (fr && thCache['p:' + fr]?.parts) || [r.anime, ...(g.seasons || []).map((s) => s.anime).filter(Boolean)].map((a) => ({ id: String(a.id), name: a.name, russian: a.russian, english: a.english }));
      const uniq = []; const seen = new Set(); for (const p of parts) if (!seen.has(p.id)) { seen.add(p.id); uniq.push(p); }
      return { id: String(r.anime.id), score: r.score ?? null, anime: r.anime, parts: uniq, fr, franchise };
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
  for (const s0 of thSources()) {
    if (s0.fr && !thFresh('p:' + s0.fr)) { await thLoadParts(s0); await new Promise((r) => setTimeout(r, 220)); }
    const s = thSources().find((x) => x.id === s0.id) || s0;
    for (const p of s.parts) if (!thFresh(p.id) && !queued.has(p.id)) { queued.add(p.id); queue.push(p.id); total++; }
  }
  feeding = false;
  await Promise.all(workers);
  th.err = bad > 0 && !ok;
  th.loading = false; th.prog = ''; thSaveCache(); renderThemes();
}

/* ---------- поиск любого аниме ---------- */
let thSearchT = 0, thSearchN = 0;
async function thSearch(q) {
  const n = ++thSearchN;
  th.q = q;
  if (!q) { th.found = null; th.searching = false; renderThemes(); return; }
  th.searching = true; renderThemes();
  try {
    const d = await gql(`{ animes(search: ${JSON.stringify(q)}, limit: 8, kind: "tv,movie,ova,ona") { ${LIGHT} } }`);
    if (n !== thSearchN) return;
    const list = d.animes.map((a) => snapshot(a));
    const need = list.map((a) => String(a.id)).filter((id) => !thFresh(id));
    if (need.length) await thFetch(need);
    if (n !== thSearchN) return;
    thSaveCache();
    th.found = list.map((a) => ({ id: String(a.id), score: null, anime: a, parts: [{ id: String(a.id), name: a.name, russian: a.russian, english: a.english }], search: true }));
    th.found.forEach((s) => th.open.add('s' + s.id));
  } catch { if (n === thSearchN) th.found = []; }
  if (n === thSearchN) { th.searching = false; renderThemes(); }
}

/* ---------- списки ---------- */
const thAnimeSnap = (a) => ({ id: String(a.id), name: a.name, russian: a.russian, english: a.english, poster: a.poster });
// темы группы (аниме или серия), без повторов; у каждой — из какой она части
function thGroupThemes(s, seen) {
  const out = [];
  for (const p of s.parts) for (const t of thCache[p.id]?.list || []) {
    if (seen.has(t.k)) continue;
    seen.add(t.k);
    out.push({ ...t, anime: thAnimeSnap(s.anime), part: s.parts.length > 1 || s.search ? { name: p.name, russian: p.russian, english: p.english } : null });
  }
  return out;
}
const thKindOk = (t) => th.kind === 'all' || t.type === th.kind;
const TH_AF = [
  ['all', 'Аниме: все', 'Все аниме из топа', 'С оценкой и без'],
  ['rated', 'Аниме: оценённые', 'Только оценённые аниме', 'Без тех, где ты ещё не поставил оценку'],
  ['ten', 'Аниме: 10/10', 'Аниме на 10', 'Только то, чему ты поставил 10'],
  ['five', 'Аниме: 5–10', 'Аниме от 5 до 10', 'Без того, что тебе не понравилось'],
];
const thAfOk = (score) => th.af === 'all' || (th.af === 'rated' ? score != null : th.af === 'ten' ? score === 10 : score != null && score >= 5);
const thLabel = (t) => `${t.type}${t.seq}`;
const thMeta = (t) => [t.artists, t.part && tn(t.part), t.eps && tr('серии {e}', { e: t.eps })].filter(Boolean);
const thRO = () => !!window.VIEWING; // чужой топ по ссылке — только смотреть

function thRowHTML(t) {
  const my = thScore(TH()[t.k]);
  return `<div class="th-row" data-k="${esc(t.k)}">
    <button type="button" class="th-play" data-play="${esc(t.k)}" aria-label="${tr('Смотреть')}">${thPlayIcon}</button>
    <div class="th-info" data-play="${esc(t.k)}"><b><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</b>
      <span>${thMeta(t).map(esc).join(' · ')}${t.spoiler ? ` · <i class="th-sp">${tr('спойлер')}</i>` : ''}</span></div>
    ${thRO() ? (my ? `<b class="th-my" style="--c:${thColor(my)}">${my}</b>` : '') : `<div class="th-sc">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button type="button" data-rate="${n}" style="--c:${thColor(n)}" class="${my === n ? 'on' : ''}" title="${esc(LABEL[n])}">${n}</button>`).join('')}</div>`}
  </div>`;
}
const thPlayIcon = '<svg viewBox="0 0 24 24" class="ic"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';

function thGroupHTML(s, items, key, full = items) {
  const open = th.open.has(key), rated = full.filter((t) => thScore(TH()[t.k]) != null).length;
  const ops = full.filter((t) => t.type === 'OP').length, eds = full.length - ops;
  const meta = [ops && `OP ${ops}`, eds && `ED ${eds}`, tr('оценено {a} из {b}', { a: rated, b: full.length })].filter(Boolean).join(' · ');
  return `<section class="th-group ${open ? 'open' : ''}">
    <button type="button" class="th-ghead" data-thg="${esc(key)}" aria-expanded="${open}">
      <img loading="lazy" src="${esc(s.anime.poster || '')}" alt="">
      <span class="th-gt"><b>${esc(tn(s.anime))}</b><small>${meta}</small></span>
      ${s.score != null ? `<span class="th-gs" title="${tr('Моя оценка')}">${tr('моя {n}', { n: s.score })}</span>` : ''}
      <span class="th-chev">${icon('chev')}</span>
    </button>
    ${open ? `<div class="th-gbody">${items.map(thRowHTML).join('')}</div>` : ''}
  </section>`;
}

function renderThemes() {
  const box = $('#view-themes');
  if (!box || box.hidden) return;
  const ro = thRO(), rated = TH();
  if (ro) th.mode = 'list';
  $('#thSeg').hidden = ro; $('#thTools').hidden = ro || th.mode !== 'anime';
  $('#view-themes h1').textContent = ro ? tr('Опенинги {l}', { l: window.VIEWING.login }) : tr('Опенинги и эндинги');
  // все темы моих аниме (и найденных) — для плеера и тир-листа
  const seen = new Set(), srcs = thSources(), groups = srcs.map((s) => ({ s, items: thGroupThemes(s, seen) }));
  const found = (th.found || []).map((s) => ({ s, items: thGroupThemes(s, new Set()) })).sort((a, b) => !a.items.length - !b.items.length); // без опенингов — в конец
  th.byKey = new Map();
  for (const { items } of [...groups, ...found]) for (const t of items) th.byKey.set(t.k, t);
  for (const [k, r] of Object.entries(rated)) if (!th.byKey.has(k) && r.t) th.byKey.set(k, r.t);
  const animeScore = new Map(srcs.map((s) => [s.id, s.score]));
  const all = groups.flatMap((g) => g.items), nRated = Object.values(rated).filter((r) => thScore(r) != null).length;
  $('#thStats').textContent = [tr('оценено {n}', { n: nRated }), !ro && all.length ? tr('в твоих аниме — {n}', { n: all.length }) : ''].filter(Boolean).join(' · ');
  $$('#thSeg [data-thmode]').forEach((b) => b.classList.toggle('on', b.dataset.thmode === th.mode));
  // фильтры одной строкой: тип песен, оценка аниме (меню), «только неоценённые», обновить
  const af = TH_AF.find((x) => x[0] === th.af) || TH_AF[0];
  $('#thKinds').innerHTML = `<div class="th-filters">
    <div class="th-seg" role="group" aria-label="${tr('Тип')}">${[['all', 'Все'], ['OP', 'Опенинги'], ['ED', 'Эндинги']].map(([v, l]) => `<button type="button" class="${th.kind === v ? 'on' : ''}" data-thkind="${v}">${tr(l)}</button>`).join('')}</div>
    ${th.mode === 'anime' && !ro ? `<button type="button" class="pill th-af ${th.af !== 'all' ? 'on' : ''}" data-thafmenu>${tr(af[1])}${icon('chev')}</button>
      <button type="button" class="pill th-unr ${th.unr ? 'on' : ''}" data-thunr aria-pressed="${th.unr}"><span class="th-box">${th.unr ? icon('check') : ''}</span>${tr('Только неоценённые')}</button>` : ''}
    ${ro ? '' : `<button type="button" class="pill th-refresh" data-threfresh title="${tr('Обновить список')}" aria-label="${tr('Обновить список')}">${icon('sort')}</button>`}
  </div>`;
  const body = $('#thBody');
  const empty = (h, p, btn = '') => `<div class="empty-state small"><div class="empty-art">${icon('music')}</div><h2>${h}</h2><p>${p}</p>${btn}</div>`;
  const prog = th.loading ? `<p class="th-prog"><span class="th-spin"></span>${esc(th.prog)}</p>` : '';
  const credit = `<p class="th-credit">${tr('Видео и данные — animethemes.moe')}</p>`;

  if (th.mode === 'anime') {
    const okT = (t) => thKindOk(t) && (!th.unr || thScore(rated[t.k]) == null);
    // поиск: найденные аниме сверху, развёрнуты
    if (th.q) {
      th.list = found.flatMap((g) => g.items.filter(okT)).map((t) => t.k);
      body.innerHTML = th.searching ? `<p class="th-prog"><span class="th-spin"></span>${tr('Ищу…')}</p>`
        : !found.length ? empty(tr('Ничего не нашлось'), tr('Попробуй другие фильтры.'))
        : found.map(({ s, items }) => { const its = items.filter(okT); return its.length ? thGroupHTML(s, its, 's' + s.id, items) : `<section class="th-group"><div class="th-ghead static"><img loading="lazy" src="${esc(s.anime.poster || '')}" alt=""><span class="th-gt"><b>${esc(tn(s.anime))}</b><small>${tr('У этого аниме нет опенингов в базе')}</small></span></div></section>`; }).join('') + credit;
      return;
    }
    const vis = groups.filter((g) => thAfOk(g.s.score)).map((g) => ({ ...g, full: g.items, items: g.items.filter(okT) })).filter((g) => g.items.length);
    th.list = vis.flatMap((g) => g.items.map((t) => t.k));
    if (!srcs.length) { body.innerHTML = empty(tr('Сначала оцени аниме'), tr('Здесь появятся опенинги и эндинги аниме из твоего топа. Или найди любое аниме поиском.'), `<button class="btn primary" data-go="catalog">${tr('К каталогу')}</button>`); return; }
    if (th.err && !all.length) { body.innerHTML = empty(tr('Не получилось загрузить опенинги'), tr('Сервер с опенингами не ответил. Попробуй ещё раз чуть позже.'), `<button class="btn" data-threfresh>${tr('Попробовать снова')}</button>`); return; }
    if (!vis.length) { body.innerHTML = prog || empty(tr('Ничего не подходит'), tr('Попробуй другие фильтры.')); return; }
    const allOpen = vis.every((g) => th.open.has(g.s.id));
    body.innerHTML = prog + `<div class="th-bar"><button type="button" class="link" data-thall="${allOpen ? 0 : 1}">${tr(allOpen ? 'Свернуть все' : 'Развернуть все')}</button></div>`
      + vis.map((g) => thGroupHTML(g.s, g.items, g.s.id, g.full)).join('') + credit;
    return;
  }
  // тир-лист по оценке
  const items = Object.entries(rated).map(([k, r]) => ({ ...(th.byKey.get(k) || r.t), score: thScore(r), at: r.updated || r.added }))
    .filter((t) => t.k && t.score != null && thKindOk(t));
  th.list = [];
  if (!items.length) { body.innerHTML = prog + empty(tr('Тир-лист пока пуст'), ro ? '' : tr('Включи видео и поставь оценку — опенинг появится здесь.')); return; }
  body.innerHTML = `<div class="th-board">${TIERS.map((x) => {
    const row = items.filter((t) => thTierOf(t.score) === x.t).sort((a, b) => b.score - a.score || a.at - b.at);
    th.list.push(...row.map((t) => t.k));
    return `<div class="th-trow"><div class="th-tl" style="--c:${x.c}"><b>${esc((!ro && tierNames[x.t]?.name) || x.t)}</b></div><div class="th-items">${row.map((t) => `<button type="button" class="th-chip" data-play="${esc(t.k)}" title="${esc(`${thLabel(t)} · ${t.song} — ${t.artists}`)}">
      <img loading="lazy" src="${esc(t.anime?.poster || '')}" alt=""><span><b>${esc(t.song || thLabel(t))}</b><small>${esc(tn(t.part || t.anime))} · ${thLabel(t)}</small></span><i class="th-cs" style="--c:${x.c}">${t.score}</i></button>`).join('')}</div></div>`;
  }).join('')}</div>${credit}`;
}

/* ---------- оценка ---------- */
function thRate(k, score) {
  const t = th.byKey.get(k);
  if (!t || thRO() || !(score >= 1 && score <= 10)) return;
  const now = Date.now(), old = TH()[k];
  const { vids, ...rest } = t;
  TH()[k] = { score, added: old?.added || now, updated: now, t: { ...rest, vids: vids?.slice(0, 6) } };
  if (db.deleted) delete db.deleted['o:' + k];
  save();
}
function thUnrate(k) {
  if (!TH()[k] || thRO()) return;
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
// какое видео включить: сохранённое качество (или «авто»: 1080 на компьютере, 720 на телефоне), без титров — если есть
function thPick(vids, q = pref('thQ', 'auto')) {
  if (!vids?.length) return null;
  if (q === 'audio') return vids.find((v) => v.audio) || thPick(vids.filter((v) => !v.audio), 'auto');
  vids = vids.filter((v) => !v.audio);
  const want = q === 'auto' ? (window.innerWidth > 700 ? 1080 : 720) : +q.replace('nc', '') || 1080;
  const nc = q === 'auto' ? true : q.endsWith('nc');
  return [...vids].sort((a, b) => (Math.abs(a.r - want) - Math.abs(b.r - want)) || ((b.nc === nc) - (a.nc === nc)))[0];
}
const thQLabel = (v) => (v.audio ? tr('Только звук') : `${v.r ? v.r + 'p' : '?'}${v.nc ? ' · ' + tr('без титров') : ''}`);
function thOpen(k, keepTime) {
  const t = th.byKey.get(k);
  if (!t) return;
  const vids = [...(t.vids || (t.video ? [{ r: 0, nc: !!t.nc, l: t.video }] : [])), ...(t.audio ? [{ r: 0, nc: false, l: t.audio, audio: true }] : [])];
  const v = thPick(vids), ro = thRO();
  th.cur = k;
  const my = thScore(TH()[k]), i = th.list.indexOf(k);
  const prev = i > 0 ? th.list[i - 1] : null, next = i >= 0 && i < th.list.length - 1 ? th.list[i + 1] : null;
  $('#thPl').innerHTML = `<div class="th-video"><video id="thVid" class="${v?.audio ? 'audio' : ''}" src="${esc(v?.l || '')}" ${v?.audio ? `poster="${esc(t.anime?.poster || '')}"` : ''} controls autoplay playsinline preload="auto"></video>
      <div class="th-verr" hidden>${tr('Видео не загрузилось')}<a href="https://animethemes.moe/anime/${esc(t.slug)}/${esc(t.tslug)}" target="_blank" rel="noopener">${tr('Открыть на animethemes.moe')}</a></div></div>
    <div class="th-meta"><h2><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</h2>
      <p>${[t.artists, tn(t.anime), t.part && tn(t.part) !== tn(t.anime) && tn(t.part), t.eps && tr('серии {e}', { e: t.eps })].filter(Boolean).map(esc).join(' · ')}</p>
      ${vids.length > 1 ? `<div class="th-q"><span>${tr('Качество')}</span>${vids.map((x) => `<button type="button" data-thq="${x.audio ? 'audio' : x.r + (x.nc ? 'nc' : '')}" class="${x === v ? 'on' : ''}">${esc(thQLabel(x))}</button>`).join('')}</div>` : ''}
      <p class="th-now">${my ? tr(ro ? 'Оценка: {n}' : 'Моя оценка: {n}', { n: `${my} — ${LABEL[my]}` }) : ro ? tr('нет оценки') : tr('Ещё не оценён')}</p></div>
    ${ro ? '' : `<div class="th-big">${Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => `<button type="button" data-rate="${n}" style="--c:${thColor(n)}" class="${my === n ? 'on' : ''}"><b>${n}</b><small>${esc(LABEL[n])}</small></button>`).join('')}</div>`}
    <div class="th-nav">
      <button type="button" class="btn" data-thgo="${esc(prev || '')}" ${prev ? '' : 'disabled'}>${icon('back')}<span>${tr('Предыдущий')}</span></button>
      ${my && !ro ? `<button type="button" class="link" data-unrate>${tr('Убрать оценку')}</button>` : '<span></span>'}
      <button type="button" class="btn" data-thgo="${esc(next || '')}" ${next ? '' : 'disabled'}><span>${tr('Следующий')}</span>${icon('back', 'flip')}</button>
    </div>`;
  const vid = $('#thVid');
  vid.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  if (keepTime) vid.addEventListener('loadedmetadata', () => { vid.currentTime = keepTime; }, { once: true });
  vid.addEventListener('volumechange', () => setPref('thVol', String(vid.muted ? 0 : vid.volume)));
  vid.addEventListener('error', () => { $('.th-verr', thDlg).hidden = false; });
  if (!thDlg.open) openModal(thDlg);
}
function thStop() { const v = $('#thVid'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } }
thDlg.addEventListener('close', () => { thStop(); th.cur = null; if (history.state?.modal === 'thDlg') history.back(); renderThemes(); });
thDlg.addEventListener('click', (e) => {
  if (e.target === thDlg || e.target.closest('[data-close]')) { thDlg.close(); return; }
  const go = e.target.closest('[data-thgo]');
  if (go && go.dataset.thgo) { thStop(); thOpen(go.dataset.thgo); return; }
  const q = e.target.closest('[data-thq]');
  if (q) { const v = $('#thVid'), at = v?.currentTime || 0; setPref('thQ', q.dataset.thq); thStop(); thOpen(th.cur, at); return; }
  if (e.target.closest('[data-unrate]')) { thUnrate(th.cur); thOpen(th.cur); return; }
  const r = e.target.closest('[data-rate]');
  if (r && th.cur) {
    const k = th.cur, wasNew = thScore(TH()[k]) == null;
    thRate(k, +r.dataset.rate);
    renderThemes();
    // первая оценка — сразу следующий неоценённый; пересмотр оценки — остаёмся на этом
    const i = th.list.indexOf(k);
    const nk = wasNew ? [...th.list.slice(i + 1), ...th.list.slice(0, Math.max(0, i))].find((x) => thScore(TH()[x]) == null) : null;
    thStop(); thOpen(nk || k);
  }
});

/* ---------- раздел ---------- */
$('#view-themes').addEventListener('click', (e) => {
  const m = e.target.closest('[data-thmode]');
  if (m) { th.mode = m.dataset.thmode; setPref('thMode', th.mode); renderThemes(); window.scrollTo(0, 0); return; }
  const kd = e.target.closest('[data-thkind]');
  if (kd) { th.kind = kd.dataset.thkind; renderThemes(); return; }
  const afm = e.target.closest('[data-thafmenu]');
  if (afm) {
    openPop(afm, {
      items: TH_AF.map(([v, , label, hint]) => ({ v, label: tr(label), hint: tr(hint), on: th.af === v })),
      note: tr('Фильтр по твоей оценке самого аниме'),
      onPick: (it) => { th.af = it.v; setPref('thAf', th.af); renderThemes(); },
    });
    return;
  }
  if (e.target.closest('[data-thunr]')) { th.unr = !th.unr; renderThemes(); return; }
  if (e.target.closest('[data-threfresh]')) { thLoad(true); return; }
  const all = e.target.closest('[data-thall]');
  if (all) { $$('#thBody [data-thg]').forEach((b) => th.open[all.dataset.thall === '1' ? 'add' : 'delete'](b.dataset.thg)); renderThemes(); return; }
  const g = e.target.closest('[data-thg]');
  if (g) { const k = g.dataset.thg; th.open.has(k) ? th.open.delete(k) : th.open.add(k); renderThemes(); return; }
  const r = e.target.closest('.th-row [data-rate]');
  if (r) { const k = r.closest('.th-row').dataset.k; if (thScore(TH()[k]) === +r.dataset.rate) thUnrate(k); else thRate(k, +r.dataset.rate); renderThemes(); return; }
  const p = e.target.closest('[data-play]');
  if (p) thOpen(p.dataset.play);
});
$('#thSearch').addEventListener('input', (e) => {
  clearTimeout(thSearchT);
  const q = e.target.value.trim();
  $('#thTools .clear').hidden = !q;
  thSearchT = setTimeout(() => thSearch(q), q ? 450 : 0);
});
$('#thTools .clear').addEventListener('click', () => { $('#thSearch').value = ''; $('#thTools .clear').hidden = true; thSearch(''); });
// топ поменялся (оценка, синхронизация) — обновляем раздел
{
  const base = afterChange;
  afterChange = function (...a) { const out = base.apply(this, a); if (view === 'themes' && !thDlg.open) renderThemes(); return out; };
}
function thShowView() {
  renderThemes();
  if (!thRO() && thSources().some((s) => (s.fr && !thFresh('p:' + s.fr)) || s.parts.some((p) => !thFresh(p.id)))) thLoad();
}
// для достижения «Полный альбом»: у скольких аниме из топа (от 4 тем) оценены все опенинги и эндинги
function thFullAlbums(d = db) {
  const seen = new Set();
  return thSources().filter((s) => {
    const items = thGroupThemes(s, seen);
    return items.length >= 4 && items.every((t) => thScore((d.themes || {})[t.k]) != null);
  }).length;
}
if (view === 'themes') thShowView();
