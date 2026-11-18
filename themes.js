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
  'Тип': 'Type', 'Только неоценённые': 'Only unrated', 'Смотрит на твою оценку самого аниме, а не опенинга': 'Uses your rating of the anime itself, not the opening',
  'Аниме: любое': 'Anime: any', 'Аниме: 1–10': 'Anime: 1–10', 'Аниме: 10': 'Anime: 10', 'Любая оценка аниме': 'Any anime rating', 'Все аниме из топа, даже без оценки': 'All anime in your top, even unrated',
  'Аниме с оценкой 1–10': 'Anime rated 1–10', 'Скрыть аниме, которым ты ещё не поставил оценку': "Hide anime you haven't rated yet", 'Аниме с оценкой 10': 'Anime rated 10', 'Только самые любимые': 'Only your favorites',
  'Аниме с оценкой 5–10': 'Anime rated 5–10', 'Скрыть аниме, которым ты поставил меньше 5': 'Hide anime you rated below 5',
  'Аниме: все': 'Anime: all', 'Аниме: оценённые': 'Anime: rated', 'Аниме: 10/10': 'Anime: 10/10', 'Аниме: 5–10': 'Anime: 5–10',
  'Все аниме из топа': 'All anime in your top', 'С оценкой и без': 'Rated or not', 'Только оценённые аниме': 'Only rated anime',
  'Без тех, где ты ещё не поставил оценку': "Skips anime you haven't rated yet", 'Аниме на 10': 'Anime rated 10', 'Только то, чему ты поставил 10': 'Only what you gave a 10',
  'Аниме от 5 до 10': 'Anime rated 5–10', 'Без того, что тебе не понравилось': "Skips what you didn't like",
  'Оцени несколько опенингов у себя — и здесь появится, насколько совпадает ваш музыкальный вкус.': 'Rate a few openings yourself — and you will see how close your music taste is.',
  'У вас пока мало общих оценённых опенингов ({n}) — процент совпадения появится от трёх.': 'Only {n} openings rated by both of you so far — the match appears from three.',
  'Совпадение музыкального вкуса с {w} по {n} общим опенингам и эндингам': 'Music taste match with {w} over {n} shared openings and endings',
  'твоя: {n}': 'yours: {n}', 'Мои опенинги и эндинги': 'My openings & endings', 'на 10: {n}': 'rated 10: {n}', 'видео: animethemes.moe': 'videos: animethemes.moe',
  'Картинка опенингов': 'Openings picture', 'Все оценённые опенинги и эндинги по тирам': 'All rated openings and endings by tier',
  'Качество': 'Quality', 'Только звук': 'Audio only', 'Опенинги {l}': '{l}’s openings', 'Оценка: {n}': 'Rating: {n}', 'нет оценки': 'no rating',
});

// разметка раздела переведена в app.js раньше, чем добавились слова выше, — переводим её здесь
$('.nav-btn[data-view="themes"] span').textContent = tr('Опенинги');
$('#view-themes h1').textContent = tr('Опенинги и эндинги');
$$('#thSeg [data-thmode] span').forEach((s) => { s.textContent = tr(s.textContent); }); // «Топ игроков» переводится в community.js — он подключён позже
$('#thSearch').placeholder = tr('Найди любое аниме — оцени его опенинги');
$('#thShareBtn span').textContent = tr('Поделиться');

const TH_API = 'https://graphql.animethemes.moe/';
const TH_CACHE_KEY = 'animetop.themes3';
const TH_TTL = 7 * 864e5;
const TH_Q = 'slug animethemes { type sequence slug song { title { romaji native } performances { as artist { ... on Artist { name { main } } } } } animethemeentries { version episodes spoiler videos { nodes { resolution nc link audio { link } } } } }';
const TH = () => (db.themes ||= {});
const th = {
  mode: ['list', 'top'].includes(pref('thMode', 'anime')) ? pref('thMode', 'anime') : 'anime', kind: 'all', af: pref('thAf', 'all'), unr: false,
  open: new Set(), plist: [], q: '', found: null, searching: false, loading: false, prog: '', err: false, list: [], byKey: new Map(), cur: null,
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
  ['all', 'Аниме: любое', 'Любая оценка аниме', 'Все аниме из топа, даже без оценки'],
  ['rated', 'Аниме: 1–10', 'Аниме с оценкой 1–10', 'Скрыть аниме, которым ты ещё не поставил оценку'],
  ['ten', 'Аниме: 10', 'Аниме с оценкой 10', 'Только самые любимые'],
  ['five', 'Аниме: 5–10', 'Аниме с оценкой 5–10', 'Скрыть аниме, которым ты поставил меньше 5'],
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
  $('#thShareBtn').hidden = ro || !Object.values(rated).some((r) => thScore(r) != null);
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

  if (th.mode === 'top') { $('#thKinds').innerHTML = ''; body.innerHTML = typeof cmThemesHTML === 'function' ? cmThemesHTML() : ''; return; }
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
  if (!items.length) { body.innerHTML = prog + (ro ? thCompareHTML() : '') + empty(tr('Тир-лист пока пуст'), ro ? '' : tr('Включи видео и поставь оценку — опенинг появится здесь.')); return; }
  body.innerHTML = (ro ? thCompareHTML() : '') + `<div class="th-board">${TIERS.map((x) => {
    const row = items.filter((t) => thTierOf(t.score) === x.t).sort((a, b) => b.score - a.score || a.at - b.at);
    th.list.push(...row.map((t) => t.k));
    return `<div class="th-trow"><div class="th-tl" style="--c:${x.c}"><b>${esc((!ro && tierNames[x.t]?.name) || x.t)}</b></div><div class="th-items">${row.map((t) => `<button type="button" class="th-chip" data-play="${esc(t.k)}" title="${esc(`${thLabel(t)} · ${t.song} — ${t.artists}`)}">
      <img loading="lazy" src="${esc(t.anime?.poster || '')}" alt=""><span><b>${esc(t.song || thLabel(t))}</b><small>${esc(tn(t.part || t.anime))} · ${thLabel(t)}</small></span><i class="th-cs" style="--c:${x.c}">${t.score}</i></button>`).join('')}</div></div>`;
  }).join('')}</div>${credit}`;
}

/* ---------- сравнение с другом (чужой топ по ссылке) ---------- */
// свой топ запоминаем, когда compare.js рисует сравнение аниме: там он ещё не подменён чужим
{
  const base = renderCompare;
  renderCompare = function (mine, who) { th.mine = mine; return base.apply(this, arguments); };
}
function thCompareHTML() {
  const who = window.VIEWING?.login || '', mine = th.mine?.themes || {}, theirs = TH();
  const common = [];
  for (const [k, r] of Object.entries(theirs)) { const a = thScore(mine[k]), b = thScore(r); if (a != null && b != null) common.push({ k, me: a, them: b, d: b - a }); }
  const item = (k, line) => { const t = th.byKey.get(k); if (!t) return ''; return '<button type="button" class="cmp-item" data-play="' + esc(k) + '"><img loading="lazy" src="' + esc(t.anime?.poster || '') + '" alt=""><span><b>' + esc(t.song || thLabel(t)) + '</b><small>' + esc(tn(t.part || t.anime)) + ' · ' + thLabel(t) + ' · ' + line + '</small></span></button>'; };
  const sc = (x) => tr('ты') + ' <b>' + x.me + '</b> · ' + esc(who) + ' <b>' + x.them + '</b>';
  let head;
  if (!Object.values(mine).some((r) => thScore(r) != null)) head = '<div class="cmp-empty">' + tr('Оцени несколько опенингов у себя — и здесь появится, насколько совпадает ваш музыкальный вкус.') + '</div>';
  else if (common.length < 3) head = '<div class="cmp-empty">' + tr('У вас пока мало общих оценённых опенингов ({n}) — процент совпадения появится от трёх.', { n: common.length }) + '</div>';
  else {
    const mean = common.reduce((t, x) => t + Math.abs(x.d), 0) / common.length;
    const pct = Math.max(0, Math.min(100, Math.round(100 - mean * 18)));
    const level = CMP_LEVELS.find(([min]) => pct >= min)[1];
    head = '<div class="cmp-head"><div class="cmp-ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><h3>' + tr(level) + '</h3><p>' + tr('Совпадение музыкального вкуса с {w} по {n} общим опенингам и эндингам', { w: '<b>' + esc(who) + '</b>', n: common.length }) + '</p></div></div>';
  }
  const agree = common.filter((x) => Math.abs(x.d) <= 1).sort((x, y) => Math.abs(x.d) - Math.abs(y.d) || (y.me + y.them) - (x.me + x.them)).slice(0, 5);
  const differ = common.filter((x) => Math.abs(x.d) >= 2).sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 5);
  const recs = Object.entries(theirs).map(([k, r]) => ({ k, s: thScore(r) })).filter((x) => x.s >= 9 && thScore(mine[x.k]) == null).sort((x, y) => y.s - x.s).slice(0, 8);
  const col = (title, html) => (html ? '<div class="cmp-col"><h4>' + title + '</h4>' + html + '</div>' : '');
  const cols = [
    col(tr('Сходитесь'), agree.map((x) => item(x.k, sc(x))).join('')),
    col(tr('Расходитесь'), differ.map((x) => item(x.k, sc(x))).join('')),
    col(tr('Советует {w}', { w: esc(who) }), recs.map((x) => item(x.k, esc(who) + ' <b>' + x.s + '</b>')).join('')),
  ].join('');
  return '<section class="cmp th-cmp">' + head + (cols ? '<div class="cmp-cols">' + cols + '</div>' : '') + '</section>';
}

/* ---------- картинка тир-листа опенингов ---------- */
async function thMakeImage(onProgress) {
  const rated = TH();
  const items = Object.entries(rated).map(([k, r]) => ({ ...(th.byKey.get(k) || r.t), score: thScore(r), at: r.updated || r.added })).filter((t) => t.k && t.score != null);
  try { await Promise.all([document.fonts.load('700 40px Unbounded'), document.fonts.load('700 20px Onest'), document.fonts.load('500 20px Onest')]); } catch {}
  const F = (w, px, disp) => w + ' ' + px + 'px ' + (disp ? 'Unbounded' : 'Onest') + ', system-ui, sans-serif';
  const P = 48, HEAD = 176, FOOT = 92, LW = 150, GAP = 12, CH = 124, LIMIT = 90;
  const bodyX = P + LW + 12, bodyW = SHARE_W - P - bodyX, per = 2, CW = Math.floor((bodyW - 24 - GAP) / per);
  let left = LIMIT;
  const groups = TIERS.map((x) => {
    const all = items.filter((t) => thTierOf(t.score) === x.t).sort((a, b) => b.score - a.score || a.at - b.at);
    const rows = all.slice(0, Math.max(0, left)); left -= rows.length;
    return { ...x, rows, cut: all.length - rows.length };
  });
  groups.forEach((g) => { g.h = g.rows.length ? Math.ceil(g.rows.length / per) * (CH + GAP) - GAP + 24 + (g.cut ? 40 : 0) : 90; });
  const H = HEAD + groups.reduce((t, g) => t + g.h + 12, 0) + FOOT;
  const rows = groups.flatMap((g) => g.rows);
  const imgs = await loadPosters(rows.map((t) => t.anime?.poster || ''), onProgress);
  const img = new Map(rows.map((t, i) => [t, imgs[i]]));
  const cv = document.createElement('canvas');
  cv.width = SHARE_W; cv.height = H;
  const ctx = cv.getContext('2d');
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  ctx.fillStyle = '#0e0d14'; ctx.fillRect(0, 0, SHARE_W, H);
  for (const [x, c] of [[140, 'rgba(62,230,176,.16)'], [940, 'rgba(166,77,255,.20)']]) {
    const g = ctx.createRadialGradient(x, -40, 0, x, -40, 620);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SHARE_W, 700);
  }
  ctx.fillStyle = '#f3f1f8'; ctx.font = F(700, 44, true);
  ctx.fillText(tr('Мои опенинги и эндинги'), P, 96);
  const ops = items.filter((t) => t.type === 'OP').length;
  const sub = [tr('оценено {n}', { n: items.length }), ops ? 'OP ' + ops : '', items.length - ops ? 'ED ' + (items.length - ops) : '', items.filter((t) => t.score === 10).length ? tr('на 10: {n}', { n: items.filter((t) => t.score === 10).length }) : ''].filter(Boolean).join('   ·   ');
  ctx.fillStyle = '#8a859b'; ctx.font = F(500, 24); ctx.fillText(sub, P, 140);
  let y = HEAD;
  for (const g of groups) {
    rr(P, y, LW, g.h, 20); ctx.fillStyle = g.c; ctx.fill();
    const name = tierName(g.t);
    ctx.fillStyle = '#16131f'; ctx.textAlign = 'center';
    ctx.font = name.length > 2 ? F(700, 22) : F(700, 54, true);
    const nl = wrapText(ctx, name, LW - 20, 3), lh = name.length > 2 ? 26 : 54;
    let ty = y + g.h / 2 - (nl.length * lh) / 2 + lh * 0.8;
    nl.forEach((l) => { ctx.fillText(l, P + LW / 2, ty); ty += lh; });
    ctx.textAlign = 'left';
    rr(bodyX, y, bodyW, g.h, 20); ctx.fillStyle = '#17151f'; ctx.fill();
    ctx.strokeStyle = '#292535'; ctx.lineWidth = 2; ctx.stroke();
    if (!g.rows.length) { ctx.fillStyle = '#5d5870'; ctx.font = F(500, 20); ctx.fillText(tr('Пусто'), bodyX + 24, y + g.h / 2 + 7); }
    g.rows.forEach((t, k) => {
      const x = bodyX + 12 + (k % per) * (CW + GAP), cy = y + 12 + Math.floor(k / per) * (CH + GAP);
      rr(x, cy, CW, CH, 14); ctx.fillStyle = '#1f1c29'; ctx.fill();
      const pw = 72, ph = CH - 20;
      ctx.save(); rr(x + 10, cy + 10, pw, ph, 9); ctx.clip();
      const im = img.get(t);
      if (im) ctx.drawImage(im, x + 10, cy + 10, pw, ph); else { ctx.fillStyle = '#2c283a'; ctx.fillRect(x + 10, cy + 10, pw, ph); }
      ctx.restore();
      // оценка
      const bw = 44; rr(x + CW - bw - 10, cy + 10, bw, 36, 10); ctx.fillStyle = g.c; ctx.fill();
      ctx.fillStyle = '#16131f'; ctx.font = F(700, 18, true); ctx.textAlign = 'center'; ctx.fillText(String(t.score), x + CW - bw / 2 - 10, cy + 35); ctx.textAlign = 'left';
      const tx = x + pw + 22, tw = CW - pw - 22 - bw - 20;
      ctx.fillStyle = t.type === 'ED' ? '#62c2ff' : '#ff4d78'; ctx.font = F(700, 14, true); ctx.fillText(thLabel(t), tx, cy + 30);
      ctx.fillStyle = '#f3f1f8'; ctx.font = F(700, 20);
      const sl = wrapText(ctx, t.song || '—', tw, 2);
      sl.forEach((l, i) => ctx.fillText(l, tx, cy + 56 + i * 24));
      ctx.fillStyle = '#8a859b'; ctx.font = F(500, 15);
      const by = cy + 56 + sl.length * 24;
      ctx.fillText(wrapText(ctx, tn(t.part || t.anime), CW - pw - 32, 1)[0] || '', tx, by);
      if (sl.length < 2) ctx.fillText(wrapText(ctx, t.artists || '', CW - pw - 32, 1)[0] || '', tx, by + 20);
    });
    if (g.cut) { ctx.fillStyle = '#8a859b'; ctx.font = F(600, 18); ctx.fillText(tr('…и ещё {n}', { n: g.cut }), bodyX + 24, y + g.h - 18); }
    y += g.h + 12;
  }
  ctx.fillStyle = '#5d5870'; ctx.font = F(500, 22);
  ctx.fillText('AniTier · anitierapp.pages.dev', P, H - 40);
  ctx.textAlign = 'right'; ctx.fillText(tr('видео: animethemes.moe'), SHARE_W - P, H - 40); ctx.textAlign = 'left';
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
async function thShare() {
  shareFile = null; if (shareUrl) URL.revokeObjectURL(shareUrl); shareUrl = '';
  const h2 = $('#shareDlg h2'), title = h2.textContent;
  h2.textContent = tr('Картинка опенингов');
  shareDlg.addEventListener('close', () => { h2.textContent = title; }, { once: true });
  $('#shareImg').innerHTML = '<div class="share-wait"><span class="spin"></span><span id="shareProg">' + tr('Рисую картинку…') + '</span></div>';
  $('#shareInfo').textContent = tr('Все оценённые опенинги и эндинги по тирам');
  $('#shareSave').disabled = true; $('#shareSend').disabled = true;
  openModal(shareDlg);
  try {
    const blob = await thMakeImage((d, n) => { const p = $('#shareProg'); if (p) p.textContent = tr('Загружаю постеры… {d} из {n}', { d, n }); });
    if (!blob) throw 0;
    shareFile = new File([blob], 'anitier-openings-' + new Date().toISOString().slice(0, 10) + '.png', { type: 'image/png' });
    shareUrl = URL.createObjectURL(blob);
    $('#shareImg').innerHTML = '<img src="' + shareUrl + '" alt="' + tr('Картинка опенингов') + '">';
    $('#shareSave').disabled = false;
    const canSend = !!navigator.canShare?.({ files: [shareFile] });
    $('#shareSend').hidden = !canSend; $('#shareSend').disabled = !canSend;
  } catch {
    $('#shareImg').innerHTML = '<p class="share-wait">' + tr('Не получилось нарисовать картинку. Проверь интернет и попробуй ещё раз.') + '</p>';
  }
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
  if (!thDlg.open || !th.plist.includes(k)) th.plist = th.list.includes(k) ? th.list.slice() : [k];
  const my = thScore(TH()[k]), L = th.plist, i = L.indexOf(k);
  const prev = i > 0 ? L[i - 1] : null, next = i >= 0 && i < L.length - 1 ? L[i + 1] : null;
  const arrow = (to, flip, label) => `<button type="button" class="th-arr" data-thgo="${esc(to || '')}" ${to ? '' : 'disabled'} title="${tr(label)}" aria-label="${tr(label)}">${icon('back', flip ? 'flip' : '')}</button>`;
  $('#thPl').innerHTML = `<div class="th-video"><video id="thVid" class="${v?.audio ? 'audio' : ''}" src="${esc(v?.l || '')}" ${v?.audio ? `poster="${esc(t.anime?.poster || '')}"` : ''} controls autoplay playsinline preload="auto"></video>
      <div class="th-verr" hidden>${tr('Видео не загрузилось')}<a href="https://animethemes.moe/anime/${esc(t.slug)}/${esc(t.tslug)}" target="_blank" rel="noopener">${tr('Открыть на animethemes.moe')}</a></div></div>
    <div class="th-meta"><div class="th-top"><h2><span class="th-tag ${t.type === 'ED' ? 'ed' : ''}">${thLabel(t)}</span>${esc(t.song || '—')}</h2>
      <div class="th-arrows">${arrow(prev, false, 'Предыдущий')}<span>${i >= 0 ? `${i + 1} / ${L.length}` : ''}</span>${arrow(next, true, 'Следующий')}</div></div>
      <p>${[t.artists, tn(t.anime), t.part && tn(t.part) !== tn(t.anime) && tn(t.part), t.eps && tr('серии {e}', { e: t.eps })].filter(Boolean).map(esc).join(' · ')}</p>
      ${vids.length > 1 ? `<div class="th-q"><span>${tr('Качество')}</span>${vids.map((x) => `<button type="button" data-thq="${x.audio ? 'audio' : x.r + (x.nc ? 'nc' : '')}" class="${x === v ? 'on' : ''}">${esc(thQLabel(x))}</button>`).join('')}</div>` : ''}
      <p class="th-now">${my ? tr(ro ? 'Оценка: {n}' : 'Моя оценка: {n}', { n: `${my} — ${LABEL[my]}` }) : ro ? tr('нет оценки') : tr('Ещё не оценён')}${ro && thScore(th.mine?.themes?.[k]) != null ? ` · ${tr('твоя: {n}', { n: thScore(th.mine.themes[k]) })}` : ''}</p></div>
    ${ro ? '' : `<div class="th-big">${Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => `<button type="button" data-rate="${n}" style="--c:${thColor(n)}" class="${my === n ? 'on' : ''}"><b>${n}</b><small>${esc(LABEL[n])}</small></button>`).join('')}</div>`}
    ${ro ? '' : `<div class="th-nav"><button type="button" class="link" data-unrate ${my ? '' : 'hidden'}>${tr('Убрать оценку')}</button></div>`}`;
  const vid = $('#thVid');
  vid.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  if (keepTime) vid.addEventListener('loadedmetadata', () => { vid.currentTime = keepTime; }, { once: true });
  vid.addEventListener('volumechange', () => setPref('thVol', String(vid.muted ? 0 : vid.volume)));
  vid.addEventListener('error', () => { $('.th-verr', thDlg).hidden = false; });
  if (!thDlg.open) openModal(thDlg);
}
// после оценки — только подсветка и подпись, видео играет дальше
function thMarkRating() {
  const my = thScore(TH()[th.cur]);
  $$('.th-big [data-rate]', thDlg).forEach((b) => b.classList.toggle('on', +b.dataset.rate === my));
  const now = $('.th-now', thDlg); if (now) now.textContent = my ? tr('Моя оценка: {n}', { n: `${my} — ${LABEL[my]}` }) : tr('Ещё не оценён');
  const un = $('[data-unrate]', thDlg); if (un) un.hidden = !my;
}
function thStop() { const v = $('#thVid'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } }
thDlg.addEventListener('close', () => { thStop(); th.cur = null; if (history.state?.modal === 'thDlg') history.back(); renderThemes(); });
thDlg.addEventListener('click', (e) => {
  if (e.target === thDlg || e.target.closest('[data-close]')) { thDlg.close(); return; }
  const go = e.target.closest('[data-thgo]');
  if (go && go.dataset.thgo) { const k = go.dataset.thgo; thStop(); (typeof cmEnsureVideo === 'function' ? cmEnsureVideo(k) : Promise.resolve()).then(() => thOpen(k)); return; }
  const q = e.target.closest('[data-thq]');
  if (q) { const v = $('#thVid'), at = v?.currentTime || 0; setPref('thQ', q.dataset.thq); thStop(); thOpen(th.cur, at); return; }
  if (e.target.closest('[data-unrate]')) { thUnrate(th.cur); thMarkRating(); renderThemes(); return; }
  const r = e.target.closest('[data-rate]');
  if (r && th.cur) {
    thRate(th.cur, +r.dataset.rate);
    thMarkRating();
    renderThemes();
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
      note: tr('Смотрит на твою оценку самого аниме, а не опенинга'),
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
  if (p) { const k = p.dataset.play; (typeof cmEnsureVideo === 'function' ? cmEnsureVideo(k) : Promise.resolve()).then(() => thOpen(k)); }
});
$('#thShareBtn').addEventListener('click', thShare);
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
