'use strict';
/* AniTier — данные об аниме берутся из открытого API Shikimori,
   оценки хранятся на устройстве (localStorage). Структура записей готова
   к будущей синхронизации с аккаунтом.
   Два режима счёта: «Аниме целиком» (вся серия/франшиза = одна строка)
   и «По сезонам» (каждый сезон, фильм, OVA — отдельно).
   Два вида топа: «Рейтинг» (список по оценке) и «Тир-лист» (S–F, места внутри тира). */

const API = 'https://shikimori.io/api/graphql';
const SITE = 'https://shikimori.io';
const STORE_KEY = 'animetop.v1';
const PAGE = 50;
const SEARCH_MAX_PAGES = 4; // при поиске грузим до 200 результатов и сортируем сами
const YEAR = new Date().getFullYear();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const avg = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
const fmtMy = (n) => (n == null ? '—' : Number.isInteger(n) ? String(n) : n.toFixed(1));
const fmtWorld = (n) => (n ? Number(n).toFixed(2) : '—');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Язык: свой выбор (меню) или язык браузера. Тексты — русские, перевод из i18n.js (EN).
const LANG = (() => {
  try { const p = localStorage.getItem('animetop.lang'); if (p === 'ru' || p === 'en') return p; } catch {}
  return (navigator.languages || [navigator.language || '']).some((l) => /^(ru|uk|be|kk)\b/i.test(l)) ? 'ru' : 'en';
})();
const EN_ON = LANG === 'en';
const tr = (s, v) => {
  const r = EN_ON && typeof EN !== 'undefined' && EN[s] != null ? EN[s] : s;
  return v ? r.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '') : r;
};
const plural = (n, forms) => {
  if (EN_ON) { const e = (typeof EN_PL !== 'undefined' && EN_PL[forms[0]]) || [forms[0], forms[2]]; return Math.abs(n) === 1 ? e[0] : e[1]; }
  const [one, few, many] = forms; const a = Math.abs(n) % 100, b = a % 10;
  return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many;
};
// название аниме и жанра на языке сайта
const tn = (a) => (a ? (EN_ON ? a.english || a.name || a.russian : a.russian || a.name) || '' : '');
const gname = (g) => (EN_ON ? g.name || genres.find((x) => x.id === g.id)?.name || g.russian : g.russian) || '';
const LOCALE = EN_ON ? 'en' : 'ru';
document.documentElement.lang = LANG;
// неподвижные тексты страницы (index.html)
(function translatePage() {
  if (!EN_ON) return;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const k = n.nodeValue.trim();
    if (k && EN[k] != null) n.nodeValue = n.nodeValue.replace(k, EN[k]);
  }
  for (const el of document.querySelectorAll('[placeholder],[title],[aria-label],[alt]')) {
    for (const at of ['placeholder', 'title', 'aria-label', 'alt']) {
      const v = el.getAttribute(at);
      if (v && EN[v] != null) el.setAttribute(at, EN[v]);
    }
  }
  if (EN[document.title]) document.title = EN[document.title];
})();
const PARTS = ['часть', 'части', 'частей'];
const pref = (k, d) => { try { return localStorage.getItem('animetop.' + k) || d; } catch { return d; } };
const setPref = (k, v) => { try { localStorage.setItem('animetop.' + k, v); } catch {} };

const trAll = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, tr(v)]));
const KIND = trAll({ tv: 'Сериал', movie: 'Фильм', ova: 'OVA', ona: 'ONA', special: 'Спешл', tv_special: 'ТВ-спешл', music: 'Клип', pv: 'Промо', cm: 'Реклама' });
const STATUS_A = trAll({ released: 'вышло', ongoing: 'ещё выходит', anons: 'анонс' });
const WATCH = trAll({ completed: 'Просмотрено', watching: 'Смотрю', planned: 'В планах', on_hold: 'Отложено', dropped: 'Брошено', not_watched: 'Не смотрел' });
const LABEL = trAll({ 10: 'Шедевр', 9: 'Великолепно', 8: 'Отлично', 7: 'Хорошо', 6: 'Неплохо', 5: 'Нормально', 4: 'Так себе', 3: 'Плохо', 2: 'Ужасно', 1: 'Хуже некуда' });

/* ---------- Иконки ---------- */
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>',
  tiers: '<rect x="3" y="4" width="18" height="4.5" rx="1.5"/><rect x="3" y="10" width="18" height="4.5" rx="1.5"/><rect x="3" y="16" width="18" height="4.5" rx="1.5"/>',
  chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3.5" height="6.5" rx="1"/><rect x="10.5" y="6" width="3.5" height="11.5" rx="1"/><rect x="15.5" y="13" width="3.5" height="4.5" rx="1"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 3.4M16 6h2.5a2.5 2.5 0 0 1-2.6 3.4M12 13v4M8.5 20h7M9.5 17h5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  sort: '<path d="M7 5v14M7 19l-3-3M7 19l3-3M17 19V5M17 5l-3 3M17 5l3 3"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  dots: '<circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
  upload: '<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 20h14"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .4 4.2 1M21.5 12s-1.2 2.2-3.4 4M12 18.5C6 18.5 2.5 12 2.5 12M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17"/>',
  key: '<circle cx="8" cy="15.5" r="4"/><path d="m11 12.5 8.5-8.5M15.8 7.8l2.6 2.6M18.4 5.2l2 2"/>',
  sparkle: '<path d="M12 3.5 13.8 10.2 20.5 12 13.8 13.8 12 20.5 10.2 13.8 3.5 12 10.2 10.2Z"/><path d="M19 3.5v3M17.5 5h3"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  mask: '<path d="M4.5 4.5c3 1.2 12 1.2 15 0v6.8a7.5 7.5 0 0 1-15 0z"/><path d="M7.8 9.8q1.3-1.3 2.6 0M13.6 9.8q1.3-1.3 2.6 0M9 14.2q3 2.6 6 0"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  ext: '<path d="M14 5h5v5M19 5l-8 8M11 6H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-4"/>',
  game: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.8" cy="13.8" r=".9" fill="currentColor"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  music: '<path d="M9 18V5.5l11-2.5v12.5"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>',
  wifi: '<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.4M19 13a10 10 0 0 0-5-2.7M2 9.5A15 15 0 0 1 6.5 7M22 9.5A15 15 0 0 0 11 6"/><path d="M12 20h.01" stroke-width="3"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
$$('[data-ic]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.ic)));

/* ---------- Хранилище ---------- */
// items[animeId]     — оценка отдельного сезона/фильма
// franchises[ключ]  — оценка всей серии целиком
let db = load();
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE_KEY));
    if (d && d.items) { d.franchises ||= {}; d.deleted ||= {}; return d; }
  } catch {}
  return { version: 1, items: {}, franchises: {}, deleted: {} };
}
function save() {
  if (window.VIEWING) return; // открыт чужой топ по ссылке — свои оценки не трогаем
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { toast(tr('Не удалось сохранить — память браузера недоступна')); }
  updateCount();
  if (typeof onDbSaved === 'function') onDbSaved(); // синхронизация с аккаунтом (account.js)
  if (typeof checkAch === 'function') checkAch(); // достижения (achievements.js)
  if (typeof relSoon === 'function') relSoon(); // серии без франшизы на Shikimori
}
function updateCount() {
  const n = buildRows().length;
  const b = $('#mineCount'); b.textContent = n; b.hidden = !n;
}
function snapshot(a) {
  return {
    id: String(a.id), name: a.name, russian: a.russian, english: a.english || '', score: a.score, kind: a.kind, status: a.status,
    episodes: a.episodes, year: a.airedOn?.year ?? a.year ?? null,
    poster: a.poster?.mainUrl || a.poster?.previewUrl || (typeof a.poster === 'string' ? a.poster : ''),
    genres: (a.genres || []).map((g) => ({ id: g.id, name: g.name, russian: g.russian })),
    url: a.url, franchise: a.franchise || null,
  };
}
function fromSnap(s) {
  return {
    id: s.id, name: s.name, russian: s.russian, english: s.english, score: s.score, kind: s.kind, status: s.status, episodes: s.episodes,
    airedOn: { year: s.year }, poster: { mainUrl: s.poster }, genres: s.genres, url: s.url, franchise: s.franchise,
  };
}
// удалённая запись: помним когда, чтобы синхронизация не вернула её с другого устройства
function markDeleted(store, key) {
  (db.deleted ||= {})[(store === db.franchises ? 'f:' : 'i:') + key] = Date.now();
}
// ключ серии: франшиза Shikimori, а если её нет — само аниме
const fKey = (a) => a.franchise || 'id' + a.id;

/* ---------- API ---------- */
const FIELDS = 'id name russian english score kind status episodes episodesAired duration airedOn{year date} url poster{mainUrl main2xUrl previewUrl preview2xUrl} genres{id name russian kind} franchise';
const LIGHT = 'id name russian english score kind status episodes duration airedOn{year date} url poster{mainUrl main2xUrl previewUrl preview2xUrl} genres{id name russian kind} franchise';
// Shikimori: не больше 5 запросов в секунду и 90 в минуту
const callTimes = [];
let gate = Promise.resolve();
function slot() {
  // запросы выстраиваются в очередь, чтобы не превысить лимиты
  const p = gate.then(async () => {
    const now = Date.now();
    while (callTimes.length && now - callTimes[0] > 60000) callTimes.shift();
    const last = callTimes[callTimes.length - 1] || 0;
    let wait = last + 250 - now;
    if (callTimes.length >= 80) wait = Math.max(wait, callTimes[0] + 60000 - now);
    if (wait > 0) await sleep(wait);
    callTimes.push(Date.now());
  });
  gate = p.catch(() => {});
  return p;
}
async function gql(query, tries = 0) {
  query = relQuery(query);
  await slot();
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  if (res.status === 429 && tries < 4) { await sleep(2000 * 2 ** tries); return gql(query, tries + 1); }
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  if (j.errors) throw new Error(j.errors[0]?.message || 'API error');
  relPatch(j.data);
  return j.data;
}
/* 22.11: серии без «франшизы» на Shikimori. У свежих сиквелов поле franchise бывает пустым («Шальной последний
   босс явился!» 1 и 2) — тогда сайт видел два отдельных аниме. Собираем такую серию сами по связям
   «продолжение / предыстория» и даём ключ 'rel_<номер первой части>'. В запросах animes(franchise: "rel_…")
   подменяем выборку на animes(ids: …), а в ответах проставляем этот ключ частям серии. */
const REL_KEY = 'animetop.relfr', REL_RECHECK = 7 * 864e5;
const REL_KINDS = new Set(['tv', 'movie', 'ova', 'ona', 'special', 'tv_special']);
let relFr = { byId: {}, ids: {}, chk: {} };
try { relFr = { byId: {}, ids: {}, chk: {}, ...JSON.parse(localStorage.getItem(REL_KEY) || '{}') }; } catch {}
const relSave = () => { try { localStorage.setItem(REL_KEY, JSON.stringify(relFr)); } catch {} };
const relQuery = (q) => q.replace(/animes\(franchise: "(rel_\d+)"/g, (m, k) => `animes(ids: ${JSON.stringify((relFr.ids[k] || [k.slice(4)]).join(','))}`);
function relPatch(o) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) { o.forEach(relPatch); return; }
  if ('franchise' in o && !o.franchise && o.id != null && relFr.byId[o.id]) o.franchise = relFr.byId[o.id];
  for (const v of Object.values(o)) if (v && typeof v === 'object') relPatch(v);
}
let relBusy = false, relT = 0;
const relSoon = () => { clearTimeout(relT); relT = setTimeout(relResolve, 2500); };
// аниме каталога без франшизы — проверяем пачкой через секунду после показа
const relCat = new Set();
let relCatT = 0;
const relCatSoon = () => { clearTimeout(relCatT); relCatT = setTimeout(() => { const l = [...relCat]; relCat.clear(); if (l.length) relResolve(l); }, 1200); };
async function relResolve(extra) {
  if (window.VIEWING) return;
  if (relBusy) { for (const a of extra || []) relCat.add(a); if (extra?.length) relCatSoon(); return; } // занято — проверим следом
  const now = Date.now();
  let todo = [...Object.values(db.items).map((it) => it.anime), ...(extra || [])].filter((a) => a && (!a.franchise || String(a.franchise).startsWith('rel_')) && !(now - (relFr.chk[a.id] || 0) < REL_RECHECK));
  if (!todo.length) return;
  relBusy = true;
  let changed = false, found = false;
  try {
    // сначала одним запросом: у кого вообще есть продолжение / предыстория (у большинства одиночных аниме — нет)
    todo = todo.slice(0, 200);
    for (let i = 0; i < todo.length; i += 50) {
      const d = await gql(`{ animes(ids: ${JSON.stringify(todo.slice(i, i + 50).map((a) => String(a.id)).join(","))}, limit: 50) { id related { relationKind anime { id kind } } } }`);
      for (const x of d.animes || []) if (!(x.related || []).some((r) => (r.relationKind === "sequel" || r.relationKind === "prequel") && r.anime && REL_KINDS.has(r.anime.kind))) relFr.chk[x.id] = now;
    }
    const chains = todo.filter((a) => !(now - (relFr.chk[a.id] || 0) < REL_RECHECK)); // без проверенных недавно — иначе очередь не опустеет
    for (const a of chains.slice(15)) if (extra?.includes(a)) relCat.add(a); // остальное — следующим заходом
    for (const a0 of chains.slice(0, 15)) {
      if (now - (relFr.chk[a0.id] || 0) < REL_RECHECK) continue; // уже проверили вместе с другой частью серии
      // обходим связи «продолжение / предыстория» (до 15 частей)
      const seen = new Map(), queue = [String(a0.id)];
      while (queue.length && seen.size < 15) {
        const batch = [...new Set(queue.splice(0, 10))].filter((id) => !seen.has(id));
        if (!batch.length) continue;
        const d = await gql(`{ animes(ids: ${JSON.stringify(batch.join(','))}, limit: 10) { id kind franchise related { relationKind anime { id kind } } } }`);
        for (const x of d.animes || []) {
          seen.set(String(x.id), x);
          for (const r of x.related || []) if ((r.relationKind === 'sequel' || r.relationKind === 'prequel') && r.anime && REL_KINDS.has(r.anime.kind) && !seen.has(String(r.anime.id))) queue.push(String(r.anime.id));
        }
      }
      for (const id of seen.keys()) relFr.chk[id] = now;
      relFr.chk[a0.id] = now;
      const ids = [...seen.keys()].sort((x, y) => x - y);
      // Shikimori уже заполнил франшизу — переносим свои оценки на настоящий ключ
      const real = [...seen.values()].find((x) => x.franchise && !String(x.franchise).startsWith('rel_'))?.franchise;
      const key = real || (ids.length > 1 ? 'rel_' + ids[0] : null);
      const old = String(a0.franchise || '');
      if (!real && key) { relFr.ids[key] = ids; for (const id of ids) relFr.byId[id] = key; found = true; }
      if (real) for (const id of ids) delete relFr.byId[id];
      if (old.startsWith('rel_') && key !== old) { if (!real) continue; delete relFr.ids[old]; if (db.franchises[old] && !db.franchises[real]) { db.franchises[real] = db.franchises[old]; db.franchises[real].anime.franchise = real; } delete db.franchises[old]; changed = true; }
      if (!key) continue;
      const fresh = [];
      for (const id of ids) { const it = db.items[id]; if (it && it.anime.franchise !== key) { if (!it.anime.franchise) fresh.push(id); it.anime.franchise = key; changed = true; } }
      // в режиме «Аниме целиком» эту часть оценивали как отдельное аниме — теперь это оценка всей серии (как у остальных серий)
      const rated = ids.filter((id) => db.items[id]);
      if (mode === 'title' && ids.length > 1 && rated.length === 1 && fresh.includes(rated[0]) && !db.franchises[key]) {
        const l = (await gql(`{ animes(ids: ${JSON.stringify(ids.join(','))}, limit: 50) { ${LIGHT} } }`)).animes || [];
        if (l.length > 1) {
          const info = seriesEntry(l), { anime, ...rec } = db.items[rated[0]];
          seriesInfo.set(key, info); saveSeries();
          db.franchises[key] = { ...rec, updated: Date.now(), anime: { ...snapshot(info.first), franchise: key, score: info.score, parts: info.count } };
          delete db.items[rated[0]]; (db.deleted ||= {})['i:' + rated[0]] = Date.now();
        }
      }
    }
  } catch {}
  relSave();
  relBusy = false;
  if (relCat.size) relCatSoon();
  // в каталоге и полосе: проставить ключ серии найденным частям и перерисовать
  if (found && extra?.length) { relPatch(cat.items); if (mode === 'title' && view === 'catalog' && cat.loaded) renderCatalog(); }
  if (changed) { save(); if (typeof afterChange === 'function') afterChange(); }
}

const arg = (k, v) => (v === '' || v == null ? '' : `${k}: ${typeof v === 'number' ? v : JSON.stringify(String(v))}`);

/* ---------- Состояние интерфейса ---------- */
const MODES = [
  { v: 'title', label: tr('Аниме целиком'), hint: tr('Все сезоны и фильмы одного аниме — одна строка и одна оценка') },
  { v: 'season', label: tr('По сезонам'), hint: tr('Каждый сезон и фильм — отдельно, со своей оценкой') },
];
let mode = pref('mode', 'title');
let layout = pref('layout', 'list');
let view = 'mine';

const CAT_ORDERS = [
  { v: 'ranked', short: tr('По оценке'), label: tr('По мировой оценке'), hint: tr('Сначала с самой высокой') },
  { v: 'ranked_asc', short: tr('Оценка: с низкой'), label: tr('По мировой оценке — с низкой'), hint: tr('Сначала с самой низкой') },
  { v: 'popularity', short: tr('Популярные'), label: tr('По популярности'), hint: tr('Что смотрят чаще всего') },
  { v: 'aired_on', short: tr('Сначала новые'), label: tr('Сначала новые'), hint: tr('По дате выхода') },
  { v: 'aired_on_asc', short: tr('Сначала старые'), label: tr('Сначала старые'), hint: tr('По дате выхода') },
  { v: 'name', short: tr('А → Я'), label: tr('По алфавиту: А → Я') },
  { v: 'name_desc', short: tr('Я → А'), label: tr('По алфавиту: Я → А') },
];
// Shikimori умеет так сортировать только найденное по названию — без поиска эти варианты недоступны
const SEARCH_ONLY = new Set(['ranked_asc', 'aired_on_asc', 'name_desc']);
const MINE_SORTS = [
  { v: 'my', label: tr('По моей оценке') },
  { v: 'world', label: tr('По мировой оценке') },
  { v: 'diff', label: tr('Моя выше мировой'), hint: tr('Сначала то, что нравится мне больше, чем остальным') },
  { v: 'added', label: tr('Недавно добавленные') },
  { v: 'year', label: tr('По году выхода'), hint: tr('Сначала новые') },
  { v: 'name', label: tr('По названию') },
];
const SCORE_OPTS = [['', tr('Любая')], ['9', '9+'], ['8', '8+'], ['7', '7+'], ['6', '6+'], ['5', '5+']];
const CAT_DEF = { kind: '', status: 'released,ongoing', score: '', season: '' };
const catF = { order: 'ranked', ...CAT_DEF, genres: new Set(), hideMine: false };
const mineF = { sort: pref('sort', 'my'), status: '', min: '', wmin: '', genre: '' };
const CAT_SECTIONS = [
  { key: 'kind', title: tr('Тип'), opts: [['', tr('Любой')], ['tv', tr('Сериал')], ['movie', tr('Фильм')], ['ova,ona', 'OVA / ONA'], ['special,tv_special', tr('Спешл')]] },
  { key: 'status', title: tr('Статус выхода'), opts: [['released,ongoing', tr('Всё вышедшее')], ['released', tr('Вышло полностью')], ['ongoing', tr('Ещё выходит')]] },
  { key: 'score', title: tr('Мировая оценка'), opts: SCORE_OPTS },
  { key: 'season', title: tr('Годы выхода'), opts: [['', tr('Любые')], [`${YEAR}`, `${YEAR}`], [`${YEAR - 1}`, `${YEAR - 1}`], [`2020_${YEAR}`, tr('2020-е')], ['2010_2019', tr('2010-е')], ['2000_2009', tr('2000-е')], ['1990_1999', tr('1990-е')], ['1900_1989', tr('До 1990')]] },
];
const mineSections = () => [
  { key: 'status', title: tr('Статус просмотра'), opts: [['', tr('Все')], ...Object.entries(WATCH)] },
  { key: 'min', title: tr('Моя оценка'), opts: [['', tr('Любая')], ['10', '10'], ...SCORE_OPTS.slice(1)] },
  { key: 'wmin', title: tr('Мировая оценка'), opts: SCORE_OPTS },
  { key: 'genre', title: tr('Жанр'), opts: [['', tr('Все')], ...usedGenres()] },
];

function setMode(m) {
  mode = m; setPref('mode', m);
  updateCount(); renderPills(); renderMine();
  if (cat.loaded) renderCatalog();
  if (trayOpen) renderTray();
}
function setLayout(l) { layout = l; setPref('layout', l); renderPills(); renderMine(); if (trayOpen) trayHint(); }

/* ---------- Разделы ---------- */
const scrollPos = { mine: 0, catalog: 0 };
function show(v) {
  scrollPos[view] = window.scrollY;
  view = v;
  $$('.nav-btn').forEach((t) => t.classList.toggle('on', t.dataset.view === (v === 'ost' ? 'themes' : v)));
  $('#view-mine').hidden = v !== 'mine';
  $('#view-catalog').hidden = v !== 'catalog';
  $('#view-themes').hidden = v !== 'themes';
  $('#view-games').hidden = v !== 'games';
  $('#view-chars').hidden = v !== 'chars';
  if ($('#view-ost')) $('#view-ost').hidden = v !== 'ost';
  $('#trayBtn').hidden = v !== 'mine';
  if (v !== 'mine' && trayOpen) setTray(false);
  if (v === 'mine') renderMine();
  if (v === 'catalog') { if (!cat.loaded) loadCatalog(true); else renderCatalog(); }
  if (v === 'themes' && typeof thShowView === 'function') thShowView();
  if (v === 'games' && typeof gmShowView === 'function') gmShowView();
  if (v === 'chars' && typeof chShowView === 'function') chShowView();
  if (v === 'ost' && typeof osShowView === 'function') osShowView();
  setPref('view', v);
  window.scrollTo(0, scrollPos[v] || 0);
}
$$('.nav-btn').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]'); if (go) show(go.dataset.go);
  const lay = e.target.closest('#layoutSeg [data-layout]'); if (lay && lay.dataset.layout !== layout) setLayout(lay.dataset.layout);
});

/* ---------- Всплывающее меню ---------- */
const pop = $('#pop');
let popAnchor = null;
function openPop(anchor, { items, note, onPick, align }) {
  if (popAnchor === anchor) { closePop(); return; }
  closePop();
  pop.innerHTML = items.map((it, i) => `<button class="pop-item" data-i="${i}" ${it.disabled ? 'disabled' : ''}>
      ${it.icon ? icon(it.icon) : ''}
      <span class="pop-text"><b>${esc(it.label)}</b>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</span>
      ${it.on ? icon('check', 'pop-check') : ''}
    </button>`).join('') + (note ? `<p class="pop-note">${esc(note)}</p>` : '');
  showPopAt(anchor, align);
  pop.onclick = (e) => {
    const b = e.target.closest('.pop-item'); if (!b || b.disabled) return;
    const it = items[+b.dataset.i]; closePop(); onPick(it);
  };
}
function showPopAt(anchor, align) {
  pop.hidden = false; popAnchor = anchor; anchor.classList.add('open');
  const r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  let left = align === 'right' ? r.right - w : align === 'beside' ? r.right + 8 : r.left;
  left = Math.max(8, Math.min(left, innerWidth - w - 8));
  let top = align === 'beside' ? r.top : r.bottom + 6;
  if (top + h > innerHeight - 8) top = Math.max(8, (align === 'beside' ? innerHeight - 8 : r.top - 6) - h);
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
}
function closePop() {
  if (!popAnchor) return;
  pop.hidden = true; popAnchor.classList.remove('open'); popAnchor = null;
}
document.addEventListener('pointerdown', (e) => { if (popAnchor && !e.target.closest('#pop') && !popAnchor.contains(e.target)) closePop(); });
const closePopUnlessTyping = () => { if (!pop.contains(document.activeElement)) closePop(); };
window.addEventListener('scroll', closePopUnlessTyping, { passive: true });
window.addEventListener('resize', closePopUnlessTyping);

/* ---------- Пилюли: режим, сортировка, включённые фильтры ---------- */
function usedGenres() {
  const used = new Map();
  [...Object.values(db.items), ...Object.values(db.franchises)].forEach((it) => (it.anime.genres || []).forEach((g) => used.set(g.id, gname(g))));
  return [...used].sort((a, b) => a[1].localeCompare(b[1], LOCALE));
}
function activeChips(v) {
  const out = [];
  if (v === 'catalog') {
    for (const s of CAT_SECTIONS) {
      if (catF[s.key] === CAT_DEF[s.key]) continue;
      out.push({ key: s.key, label: (s.key === 'score' ? tr('Мировая') + ' ' : '') + (s.opts.find((o) => o[0] === catF[s.key])?.[1] || '') });
    }
    catF.genres.forEach((id) => out.push({ key: 'genre', v: id, label: (genres.find((g) => g.id === id) ? gname(genres.find((g) => g.id === id)) : '') || tr('Жанр') }));
    if (catF.hideMine) out.push({ key: 'hideMine', label: tr('Без оценённых') });
  } else {
    if (mineF.status) out.push({ key: 'status', label: WATCH[mineF.status] });
    if (mineF.min) out.push({ key: 'min', label: `${tr('Моя')} ${mineF.min}${mineF.min === '10' ? '' : '+'}` });
    if (mineF.wmin) out.push({ key: 'wmin', label: `${tr('Мировая')} ${mineF.wmin}+` });
    if (mineF.genre) out.push({ key: 'genre', label: usedGenres().find((g) => g[0] === mineF.genre)?.[1] || tr('Жанр') });
  }
  return out;
}
function pillsHTML(v) {
  const m = MODES.find((x) => x.v === mode) || MODES[0];
  let h = `<button class="pill" data-pop="mode" title="${tr('Как считать сезоны')}">${icon('layers')}<span>${m.label}</span>${icon('chev', 'chev')}</button>`;
  if (v === 'catalog') {
    const o = CAT_ORDERS.find((x) => x.v === catF.order) || CAT_ORDERS[0];
    h += `<button class="pill" data-pop="order" title="${tr('Сортировка')}">${icon('sort')}<span>${o.short}</span>${icon('chev', 'chev')}</button>`;
  } else if (layout === 'list') {
    const o = MINE_SORTS.find((x) => x.v === mineF.sort) || MINE_SORTS[0];
    h += `<button class="pill" data-pop="sort" title="${tr('Сортировка')}">${icon('sort')}<span>${o.label}</span>${icon('chev', 'chev')}</button>`;
  }
  const chips = activeChips(v);
  h += chips.map((c) => `<button class="pill chip" data-clear="${c.key}" ${c.v ? `data-v="${esc(c.v)}"` : ''} title="${tr('Убрать фильтр')}"><span>${esc(c.label)}</span>${icon('x')}</button>`).join('');
  if (chips.length > 1) h += `<button class="pill ghost" data-clear="*">${tr('Сбросить всё')}</button>`;
  return h;
}
function renderPills() {
  closePop();
  for (const [v, id, btn] of [['mine', '#minePills', '#mineFilterBtn'], ['catalog', '#catPills', '#catFilterBtn']]) {
    $(id).innerHTML = pillsHTML(v);
    const n = activeChips(v).length;
    const b = $('.n', $(btn)); b.textContent = n; b.hidden = !n;
  }
}
function clearFilter(v, key, val) {
  if (v === 'catalog') {
    if (key === '*') { Object.assign(catF, CAT_DEF); catF.genres.clear(); catF.hideMine = false; }
    else if (key === 'genre') catF.genres.delete(val);
    else if (key === 'hideMine') catF.hideMine = false;
    else catF[key] = CAT_DEF[key];
    renderPills();
    if (key === 'hideMine') renderCatalog(); else loadCatalog(true);
  } else {
    if (key === '*') Object.assign(mineF, { status: '', min: '', wmin: '', genre: '' });
    else mineF[key] = '';
    renderPills(); renderMine();
  }
}
document.addEventListener('click', (e) => {
  const p = e.target.closest('.pills [data-pop], .pills [data-clear]'); if (!p) return;
  const v = p.closest('.pills').dataset.view;
  if (p.dataset.clear) return clearFilter(v, p.dataset.clear, p.dataset.v);
  if (p.dataset.pop === 'mode') {
    return openPop(p, { items: MODES.map((m) => ({ ...m, on: m.v === mode })), onPick: (it) => setMode(it.v) });
  }
  if (p.dataset.pop === 'order') {
    const searching = !!$('#catSearch').value.trim();
    return openPop(p, {
      items: CAT_ORDERS.map((o) => {
        const off = !searching && SEARCH_ONLY.has(o.v);
        return { ...o, on: o.v === catF.order, disabled: off, hint: off ? tr('Работает, когда ищешь по названию') : o.hint };
      }),
      onPick: (it) => { catF.order = it.v; renderPills(); loadCatalog(true); },
    });
  }
  if (p.dataset.pop === 'sort') {
    return openPop(p, {
      items: MINE_SORTS.map((o) => ({ ...o, on: o.v === mineF.sort })),
      onPick: (it) => { mineF.sort = it.v; setPref('sort', it.v); renderPills(); renderMine(); },
    });
  }
});

/* ---------- Панель фильтров ---------- */
const fdlg = $('#filters');
let fView = 'catalog';
let showThemes = false;
let fDeb;
function openFilters(v) { fView = v; renderFilters(); openModal(fdlg); $('#fBody').scrollTop = 0; }
function renderFilters() {
  const isCat = fView === 'catalog';
  const st = isCat ? catF : mineF;
  $('#fTitle').textContent = isCat ? tr('Фильтры каталога') : tr('Фильтры моего топа');
  const body = $('#fBody'); const keep = body.scrollTop;
  let h = (isCat ? CAT_SECTIONS : mineSections()).map((s) => `<section class="f-sec"><h4>${s.title}</h4><div class="chips">${
    s.opts.map(([val, label]) => `<button class="chip ${st[s.key] === val ? 'on' : ''}" data-f="${s.key}" data-v="${esc(val)}">${esc(label)}</button>`).join('')
  }</div></section>`).join('');
  if (isCat) {
    const byKind = (k) => genres.filter((g) => g.kind === k).sort((a, b) => gname(a).localeCompare(gname(b), LOCALE));
    const gchips = (list) => `<div class="chips">${list.map((g) => `<button class="chip ${catF.genres.has(g.id) ? 'on' : ''}" data-g="${g.id}">${esc(gname(g))}</button>`).join('')}</div>`;
    const main = byKind('genre'), demo = byKind('demographic'), themes = byKind('theme');
    const themesOn = themes.some((g) => catF.genres.has(g.id));
    if (main.length) h += `<section class="f-sec"><h4>${tr('Жанры')} <span>${tr('— можно несколько')}</span></h4>${gchips(main)}</section>`;
    if (demo.length) h += `<section class="f-sec"><h4>${tr('Аудитория')}</h4>${gchips(demo)}</section>`;
    if (themes.length) {
      h += `<section class="f-sec"><h4>${tr('Темы')}</h4>${showThemes || themesOn ? gchips(themes) : ''}
        ${themesOn ? '' : `<button class="link ${showThemes ? 'f-more' : ''}" data-more="1">${showThemes ? tr('Свернуть темы') : tr('Показать темы ({n})', { n: themes.length })}</button>`}</section>`;
    }
    if (!genres.length) h += `<section class="f-sec"><h4>${tr('Жанры')}</h4><p class="sec-note">${tr('Жанры загружаются…')}</p></section>`;
    h += `<section class="f-sec"><button class="switch-row" role="switch" aria-checked="${catF.hideMine}" data-sw="hideMine">
      <span><b>${tr('Скрыть уже оценённые')}</b><small>${tr('Показывать только то, чего ещё нет в моём топе')}</small></span><i class="switch"></i></button></section>`;
  }
  body.innerHTML = h; body.scrollTop = keep;
}
$('#fBody').addEventListener('click', (e) => {
  const c = e.target.closest('[data-f],[data-g],[data-sw],[data-more]'); if (!c) return;
  const isCat = fView === 'catalog';
  if (c.dataset.more) { showThemes = !showThemes; renderFilters(); return; }
  let local = !isCat;
  if (c.dataset.g) { catF.genres.has(c.dataset.g) ? catF.genres.delete(c.dataset.g) : catF.genres.add(c.dataset.g); }
  else if (c.dataset.sw) { catF.hideMine = !catF.hideMine; local = true; }
  else (isCat ? catF : mineF)[c.dataset.f] = c.dataset.v;
  renderFilters(); renderPills();
  if (!isCat) renderMine();
  else if (local) renderCatalog();
  else { clearTimeout(fDeb); fDeb = setTimeout(() => loadCatalog(true), 350); }
});
$('#fReset').addEventListener('click', () => { clearFilter(fView, '*'); renderFilters(); });
$('#mineFilterBtn').addEventListener('click', () => openFilters('mine'));
$('#catFilterBtn').addEventListener('click', () => openFilters('catalog'));

/* ---------- Жанры ---------- */
let genres = [];
async function loadGenres() {
  try {
    const c = JSON.parse(localStorage.getItem('animetop.genres2') || 'null');
    if (c && Date.now() - c.t < 7 * 864e5) genres = c.g;
  } catch {}
  if (!genres.length) {
    try {
      const d = await gql('{ genres(entryType: Anime) { id name russian kind } }');
      genres = d.genres;
      try { localStorage.setItem('animetop.genres2', JSON.stringify({ t: Date.now(), g: genres })); } catch {}
    } catch { return; }
  }
  if (fdlg.open) renderFilters();
}

/* ---------- Серии и строки топа ---------- */
function titleGroups() {
  const g = new Map();
  const get = (k) => { if (!g.has(k)) g.set(k, { key: k, f: null, seasons: [] }); return g.get(k); };
  Object.values(db.items).forEach((it) => get(fKey(it.anime)).seasons.push(it));
  Object.entries(db.franchises).forEach(([k, f]) => (get(k).f = f));
  return [...g.values()];
}
function seasonRow(it) {
  return { type: 'season', anime: it.anime, score: it.score, approx: false, world: it.anime.score, status: it.status, note: it.note, added: it.added, tier: it.tier || null, pos: it.pos ?? null, peak: !!it.peak && it.score === 10 };
}
function titleRow(g) {
  const f = g.f;
  if (!f && g.seasons.length === 1) return seasonRow(g.seasons[0]);
  const ss = [...g.seasons].sort((a, b) => (a.anime.year || 9999) - (b.anime.year || 9999));
  const scored = g.seasons.filter((s) => s.score).map((s) => s.score);
  const my = f?.score ?? (scored.length ? Math.round(avg(scored) * 10) / 10 : null);
  return {
    type: 'title', key: g.key, anime: f?.anime || ss[0].anime,
    score: my, approx: !f?.score && scored.length > 0,
    world: f?.anime.score ?? avg(g.seasons.map((s) => s.anime.score).filter(Boolean)),
    status: f?.status || ss[ss.length - 1].status, note: f?.note || '',
    added: Math.max(f?.added || 0, ...g.seasons.map((s) => s.added)),
    parts: f?.anime.parts || null, ratedSeasons: g.seasons.length,
    tier: f?.tier || null, pos: f?.pos ?? null, peak: !!f?.peak && f?.score === 10,
  };
}
function buildRows() {
  if (mode === 'season') {
    const rows = Object.values(db.items).map(seasonRow);
    titleGroups().filter((g) => g.f && !g.seasons.length).forEach((g) => rows.push(titleRow(g)));
    return rows;
  }
  return titleGroups().map(titleRow);
}

/* ---------- Каталог ---------- */
const cat = { page: 1, items: [], loaded: false, loading: false, token: 0, more: false, shown: [], auto: 0 };

function sortClient(list, order) {
  const name = (a) => tn(a).toLocaleLowerCase(LOCALE);
  const date = (a) => a.airedOn?.date || (a.airedOn?.year ? a.airedOn.year + '-01-01' : '');
  const cmp = {
    ranked: (a, b) => (b.score || 0) - (a.score || 0),
    ranked_asc: (a, b) => (a.score || 99) - (b.score || 99),
    aired_on: (a, b) => date(b).localeCompare(date(a)),
    aired_on_asc: (a, b) => (date(a) || '9999').localeCompare(date(b) || '9999'),
    name: (a, b) => name(a).localeCompare(name(b), LOCALE),
    name_desc: (a, b) => name(b).localeCompare(name(a), LOCALE),
  }[order];
  return cmp ? [...list].sort(cmp) : list;
}

async function loadCatalog(reset) {
  const token = ++cat.token;
  const search = $('#catSearch').value.trim();
  if (!search && SEARCH_ONLY.has(catF.order)) { catF.order = 'ranked'; renderPills(); }
  if (reset) { cat.page = 1; cat.items = []; cat.auto = 0; $('#catGrid').innerHTML = skeletons(18); }
  cat.loaded = true; cat.loading = true;
  $('#catMsg').hidden = true;
  setMore(reset ? 'off' : 'loading');
  const order = catF.order;
  const filters = [
    arg('kind', catF.kind), arg('status', catF.status),
    arg('score', catF.score ? Number(catF.score) : ''), arg('season', catF.season),
    arg('genre', [...catF.genres].join(',')),
  ].filter(Boolean).join(', ');
  try {
    if (search) {
      // Shikimori при поиске сортирует только по совпадению — грузим всё найденное и сортируем сами
      let got = [];
      for (let p = 1; p <= SEARCH_MAX_PAGES; p++) {
        const d = await gql(`{ animes(search: ${JSON.stringify(search)}, limit: ${PAGE}, page: ${p}${filters ? ', ' + filters : ''}) { ${FIELDS} } }`);
        if (token !== cat.token) return;
        got = got.concat(d.animes);
        if (d.animes.length < PAGE) break;
      }
      cat.items = order === 'popularity' ? got : sortClient(got, order);
      cat.more = false;
    } else {
      const d = await gql(`{ animes(limit: ${PAGE}, page: ${cat.page}, order: ${order}${filters ? ', ' + filters : ''}) { ${FIELDS} } }`);
      if (token !== cat.token) return;
      cat.items = cat.items.concat(d.animes);
      cat.more = d.animes.length === PAGE;
    }
    cat.loading = false;
    renderCatalog();
    requestAnimationFrame(() => checkMore(true));
  } catch (e) {
    if (token !== cat.token) return;
    cat.loading = false;
    if (reset) { $('#catGrid').innerHTML = ''; setMore('off'); catMsg('error'); }
    else { cat.page--; setMore('button'); toast(tr('Не получилось загрузить — проверь интернет')); }
  }
}
function skeletons(n) {
  return Array.from({ length: n }, () => '<div class="tile"><div class="poster skeleton"></div><div class="sk-line skeleton"></div></div>').join('');
}
// нижняя строка каталога: off — нет, loading — «Загружаю ещё…», button — кнопка «Показать ещё»
function setMore(state) {
  const m = $('#catMore');
  m.hidden = state === 'off';
  $('.spin', m).hidden = state !== 'loading';
  $('span:not(.spin)', m).hidden = state !== 'loading';
  $('button', m).hidden = state !== 'button';
}
// подгрузка следующей страницы, когда долистал до конца
function checkMore(auto) {
  if (view !== 'catalog' || !cat.more || cat.loading) return;
  if ($('#catMore').getBoundingClientRect().top > innerHeight + 700) return;
  if (auto === true && ++cat.auto > 4) { setMore('button'); return; } // не качаем бесконечно, если плиток на экране мало
  cat.page++; loadCatalog(false);
}
window.addEventListener('scroll', () => { cat.auto = 0; checkMore(); }, { passive: true });
$('#catMore button').addEventListener('click', () => { cat.auto = 0; cat.page++; loadCatalog(false); });

function catMsg(kind) {
  const m = $('#catMsg');
  const filtered = activeChips('catalog').length > 0;
  const html = {
    error: `<div class="empty-art">${icon('wifi')}</div><h2>${tr('Не получилось загрузить')}</h2><p>${tr('Проверь интернет и попробуй ещё раз.')}</p><button class="btn primary" data-act="retry">${tr('Повторить')}</button>`,
    empty: `<div class="empty-art">${icon('search')}</div><h2>${tr('Ничего не нашлось')}</h2><p>${filtered ? tr('Попробуй другое название или убери фильтры.') : tr('Попробуй другое название.')}</p>${filtered ? `<button class="btn" data-act="reset">${tr('Сбросить фильтры')}</button>` : ''}`,
    allrated: `<div class="empty-art">${icon('check')}</div><h2>${tr('Всё найденное уже оценено')}</h2><p>${tr('Включён фильтр «Скрыть уже оценённые».')}</p><button class="btn" data-act="showrated">${tr('Показать оценённые')}</button>`,
  }[kind];
  m.innerHTML = html; m.hidden = false;
}
$('#catMsg').addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]')?.dataset.act;
  if (a === 'retry') loadCatalog(true);
  if (a === 'reset') clearFilter('catalog', '*');
  if (a === 'showrated') clearFilter('catalog', 'hideMine');
});

function renderCatalog() {
  if (!cat.loaded || (cat.loading && !cat.items.length)) return;
  const groups = titleGroups();
  const titleScores = new Map(groups.map((g) => [g.key, titleRow(g).score]));
  let list;
  if (mode === 'title') {
    // одна плитка на серию — на месте лучшей найденной части, а показываем то, что вышло в серии первым
    const seen = new Map(); list = [];
    for (const a of cat.items) {
      const k = fKey(a);
      if (seen.has(k)) { seen.get(k).n++; continue; }
      const e = { a, n: 1 }; seen.set(k, e); list.push(e);
    }
    const missing = [];
    list.forEach((e) => {
      const k = fKey(e.a);
      const info = seriesInfo.get(k);
      if (info) { e.a = info.first; e.total = info.count; e.avg = info.score; e.years = info.years; }
      else {
        if (e.a.franchise) missing.push(k);
        else if (!relFr.chk[e.a.id]) relCat.add(e.a);
        if (e.n > 1) e.a = firstReleased(cat.items.filter((x) => fKey(x) === k)) || e.a;
      }
    });
    cat.missing = missing;
  } else list = cat.items.map((a) => ({ a, n: 1 }));
  const rated = (a) => (mode === 'title' ? titleScores.has(fKey(a)) : !!db.items[a.id]);
  if (catF.hideMine) list = list.filter((e) => !rated(e.a));
  cat.shown = list;
  if (mode === 'title' && cat.missing?.length) { loadSeries(cat.missing); cat.missing = null; }
  if (mode === 'title' && relCat.size) relCatSoon();
  $('#catGrid').innerHTML = list.map((e, i) => tileHTML(e, i, mode === 'title' ? titleScores.get(fKey(e.a)) : db.items[e.a.id]?.score)).join('');
  $('#catMsg').hidden = true;
  if (!list.length && !cat.more) catMsg(cat.items.length ? 'allrated' : 'empty');
  setMore(cat.more ? (cat.loading ? 'loading' : cat.auto > 4 ? 'button' : 'loading') : 'off');
}
// состав серий для плиток: ключ серии → { first: первая вышедшая часть, count: сколько частей, score: средняя мировая }
// запоминаем на неделю, чтобы при следующем заходе плитки сразу были верными
const SERIES_KEY = 'animetop.series6'; // 22.11: series5 — лицо серии теперь первый сериал
const seriesInfo = new Map();
try {
  const saved = JSON.parse(localStorage.getItem(SERIES_KEY) || '{}');
  for (const [k, v] of Object.entries(saved)) if (v?.first && Date.now() - v.t < 7 * 864e5) seriesInfo.set(k, v);
} catch {}
let seriesSaveT;
function saveSeries() {
  clearTimeout(seriesSaveT);
  seriesSaveT = setTimeout(() => {
    try { localStorage.setItem(SERIES_KEY, JSON.stringify(Object.fromEntries([...seriesInfo].slice(-400)))); } catch {}
  }, 1000);
}
const seriesQueue = new Set();
const seriesLoading = new Set();
let seriesBusy = false;
function loadSeries(keys) {
  keys.forEach((k) => { if (!seriesInfo.has(k) && !seriesLoading.has(k)) seriesQueue.add(k); });
  if (!seriesBusy) pumpSeries();
}
async function pumpSeries() {
  seriesBusy = true;
  while (seriesQueue.size) {
    // грузим только то, что сейчас на экране; устаревшее (после смены поиска/фильтров) выкидываем
    const onScreen = [...tray.shown, ...cat.shown].map((e) => fKey(e.a));
    const part = onScreen.filter((k, i) => seriesQueue.has(k) && onScreen.indexOf(k) === i).slice(0, 5);
    if (!part.length) { seriesQueue.clear(); break; }
    part.forEach((k) => { seriesQueue.delete(k); seriesLoading.add(k); });
    try {
      const d = await gql(`{ ${part.map((k, j) => `f${j}: animes(franchise: ${JSON.stringify(k)}, limit: 50) { ${LIGHT} }`).join(' ')} }`);
      part.forEach((k, j) => { const l = d['f' + j] || []; if (l.length) seriesInfo.set(k, seriesEntry(l)); });
      saveSeries();
    } catch {}
    part.forEach((k) => seriesLoading.delete(k));
    if (mode === 'title' && cat.loaded && view === 'catalog') renderCatalog();
    if (mode === 'title' && trayOpen) renderTray();
  }
  seriesBusy = false;
}
const seriesEntry = (l) => ({ first: firstReleased(l), count: l.length, score: worldAvg(l), years: yearSpan(l), t: Date.now() });
// годы выхода серии: «2013–2024» (без анонсов)
function yearSpan(members) {
  const ys = members.filter((m) => !notOut(m)).map((m) => m.airedOn?.year).filter(Boolean);
  if (!ys.length) return '';
  const a = Math.min(...ys), b = Math.max(...ys);
  return a === b ? `${a}` : `${a}–${b}`;
}
function tileHTML({ a, n, total, avg: seriesAvg, years }, i, my) {
  const series = total > 1;
  const parts = series ? `${total} ${plural(total, PARTS)}` : n > 1 ? tr('найдено частей: {n}', { n }) : '';
  const meta = series ? [tr('Серия'), years] : [KIND[a.kind] || a.kind, a.airedOn?.year];
  // у серии показываем среднюю мировую оценку по её частям — ту же, что в карточке
  const world = total > 1 && seriesAvg ? seriesAvg : a.score;
  return `<button class="tile" data-i="${i}">
    <div class="poster">
      <img loading="lazy" src="${esc(a.poster?.main2xUrl || a.poster?.mainUrl || a.poster?.previewUrl || '')}" alt="">
      ${world ? `<span class="b-world" title="${total > 1 ? tr('Средняя мировая оценка серии') : tr('Мировая оценка')}"><i>★</i>${fmtWorld(world)}</span>` : ''}
      ${my != null ? `<span class="b-my" title="${tr('Моя оценка')}">${fmtMy(my)}</span>` : ''}
      ${parts ? `<span class="b-parts">${parts}</span>` : ''}
    </div>
    <div class="t">${esc(tn(a))}</div>
    <div class="s">${meta.filter(Boolean).join(' · ')}</div>
  </button>`;
}
$('#catGrid').addEventListener('click', (e) => {
  const t = e.target.closest('.tile[data-i]'); if (!t) return;
  const it = cat.shown[+t.dataset.i];
  if (it) openCard(it.a, mode === 'title' ? 'franchise' : 'season');
});

/* ---------- Поля поиска ---------- */
function bindSearch(id, onInput) {
  const inp = $(id); const clr = $('.clear', inp.closest('.search'));
  const upd = () => { clr.hidden = !inp.value; };
  inp.addEventListener('input', () => { upd(); onInput(false); });
  clr.addEventListener('click', (e) => { e.preventDefault(); inp.value = ''; upd(); onInput(true); inp.focus(); });
  upd();
}
let deb;
bindSearch('#catSearch', (now) => { clearTimeout(deb); deb = setTimeout(() => loadCatalog(true), now ? 0 : 450); });
bindSearch('#mineSearch', () => renderMine());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popAnchor) { closePop(); return; }
  if (e.key === 'Escape' && trayOpen && !$('dialog[open]')) { setTray(false); return; }
  if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) && !$('dialog[open]')) {
    e.preventDefault(); $(view === 'catalog' ? '#catSearch' : '#mineSearch').focus();
  }
});

/* ---------- Тир-лист ---------- */
const TIERS = [
  { t: 'S', c: '#ff6b8f', d: tr('Лучшие') }, { t: 'A', c: '#ffa257', d: tr('Отличные') }, { t: 'B', c: '#ffd75e', d: tr('Хорошие') },
  { t: 'C', c: '#5fd99a', d: tr('Нормальные') }, { t: 'D', c: '#62c2ff', d: tr('Так себе') }, { t: 'F', c: '#a597ff', d: tr('Плохие') },
];
// отдельная полоса внизу — то, что ещё не смотрел (статус «Не смотрел»)
const NW = { t: 'nw', c: '#9a95ad', name: tr('Не смотрел'), d: '' };
// 20.11: «Абсолютный пик» — доп. отметка для оценки 10 во всех разделах; в тир-листах — ряд «Пик» выше S (только если в нём что-то есть)
Object.assign(EN, { 'Абсолютный пик': 'Absolute peak', 'Пик': 'Peak', 'Лучшее из лучшего': 'The best of the best', 'Лучшее из лучшего — выше S': 'The best of the best — above S', 'Пик — только для оценки 10': 'Peak is only for a 10' });
const PEAK = { t: 'P', c: '#ffd36b', d: tr('Лучшее из лучшего') };
const peakBtnHTML = (attr, on) => `<button type="button" class="peak-btn ${on ? 'on' : ''}" ${attr} title="${esc(tr('Лучшее из лучшего — выше S'))}">${icon('trophy')}<span>${tr('Абсолютный пик')}</span></button>`;
const peakTagHTML = () => `<span class="peak-tag">${icon('trophy')}${tr('Абсолютный пик')}</span>`;
const TIER_DEF = Object.fromEntries([...TIERS.map((x) => [x.t, { name: x.t, d: x.d }]), ['P', { name: tr('Пик'), d: PEAK.d }], ['nw', { name: NW.name, d: NW.d }]]);
const peakLabelHTML = () => `${icon('trophy')}<small>${esc(tierNames.P?.name || tr('Пик'))}</small>`;
// свои названия и подписи тиров: { S: { name: 'Топ', d: 'Любимые' } }
let tierNames = {};
try { tierNames = JSON.parse(pref('tierNames', '{}')) || {}; } catch {}
const tierName = (t) => tierNames[t]?.name || TIER_DEF[t]?.name || t;
const tierDesc = (t) => tierNames[t]?.d ?? TIER_DEF[t]?.d ?? '';
const tierTitle = (t) => (t === 'nw' ? `«${tierName(t)}»` : tr('тир {t}', { t: tierName(t) }));
function setTierName(t, name, d) {
  const def = TIER_DEF[t];
  const v = { name: name || def.name, d };
  if (v.name === def.name && v.d === def.d) delete tierNames[t]; else tierNames[t] = v;
  setPref('tierNames', JSON.stringify(tierNames));
  setPref('tierNamesAt', String(Date.now()));
  if (typeof onDbSaved === 'function') onDbSaved();
  if (typeof checkAch === 'function') checkAch();
  renderMine();
}
// окошко переименования тира
function editTier(anchor, t) {
  if (popAnchor === anchor) { closePop(); return; }
  closePop();
  pop.onclick = null;
  pop.innerHTML = `<form class="pop-edit" autocomplete="off">
    <h4>${t === 'nw' ? tr('Полоса «Не смотрел»') : tr('Тир {t}', { t: esc(TIER_DEF[t].name) })}</h4>
    <label>${tr('Название')}<input name="n" maxlength="20" value="${esc(tierName(t))}"></label>
    <label>${tr('Подпись')}<input name="d" maxlength="28" value="${esc(tierDesc(t))}" placeholder="${tr('Например: «Любимые»')}"></label>
    <div class="pop-edit-btns"><button type="button" class="link" data-def>${tr('Как было')}</button><button type="submit" class="btn primary">${tr('Сохранить')}</button></div>
  </form>`;
  showPopAt(anchor, 'beside');
  const f = $('form', pop), n = f.elements.n;
  n.focus(); n.select();
  f.onsubmit = (e) => { e.preventDefault(); setTierName(t, n.value.trim(), f.elements.d.value.trim()); closePop(); toast(tr('Тир переименован')); };
  $('[data-def]', f).onclick = () => { setTierName(t, '', TIER_DEF[t].d); closePop(); };
}
// свёрнутые тиры: видна только первая строка постеров
let tierFold = {};
try { tierFold = JSON.parse(pref('tierFold', '{}')) || {}; } catch {}
function applyFold() {
  if (layout !== 'tiers') return;
  $$('#mineList .tier').forEach((sec) => {
    const key = sec.dataset.tier || 'none';
    const items = $$('.t-item', sec);
    items.forEach((i) => i.classList.remove('folded'));
    const btn = $('.tier-fold', sec);
    const top0 = items[0]?.offsetTop ?? 0;
    const extra = items.filter((i) => i.offsetTop > top0 + 4); // всё, что не влезло в первую строку
    if (!extra.length) { btn.hidden = true; sec.classList.remove('is-folded'); return; }
    const folded = !!tierFold[key];
    if (folded) extra.forEach((i) => i.classList.add('folded'));
    sec.classList.toggle('is-folded', folded);
    btn.hidden = false;
    btn.classList.toggle('up', !folded);
    btn.title = folded ? tr('Показать все ({n})', { n: items.length }) : tr('Свернуть до одной строки');
    $('i', btn).textContent = folded ? `+${extra.length}` : '';
  });
}
let foldT;
window.addEventListener('resize', () => { clearTimeout(foldT); foldT = setTimeout(applyFold, 120); });
// тир по оценке, пока не выбран вручную: 10→S, 9→A, 8→B, 7→C, 5–6→D, 1–4→F
function autoTier(s) {
  if (s == null) return null;
  const r = Math.round(s);
  return r >= 10 ? 'S' : r >= 9 ? 'A' : r >= 8 ? 'B' : r >= 7 ? 'C' : r >= 5 ? 'D' : 'F';
}
const rowTier = (r) => (r.peak && Math.round(r.score || 0) >= 10 ? 'P' : r.tier === 'P' ? autoTier(r.score) : r.tier || autoTier(r.score));
const rowId = (r) => (r.type === 'title' ? 't:' + r.key : 's:' + r.anime.id);
function withinTier(a, b) {
  return (a.pos ?? 1e9) - (b.pos ?? 1e9) || (b.score || 0) - (a.score || 0) || (b.world || 0) - (a.world || 0)
    || tn(a.anime).localeCompare(tn(b.anime), LOCALE);
}
// куда строка попадает в тир-листе: «Не смотрел» — отдельная полоса, остальное — по тиру
const rowGroup = (r) => (r.status === 'not_watched' ? 'nw' : rowTier(r));
const groupRows = (g) => buildRows().filter((x) => rowGroup(x) === g).sort(withinTier);
// записать поле прямо в запись строки топа (для серии без своей оценки — создаём запись серии)
function writeRow(r, patch) {
  patch = { ...patch, updated: Date.now() };
  if (r.type === 'season') { Object.assign(db.items[r.anime.id], patch); return; }
  db.franchises[r.key] ||= { score: null, status: r.status || 'completed', note: '', added: Date.now(), anime: { ...r.anime, score: r.world } };
  Object.assign(db.franchises[r.key], patch);
}
// поставить строку в тир (или в «Не смотрел») перед строкой before, иначе в конец
function dropRow(r, ng, before) {
  const from = rowGroup(r);
  const full = groupRows(ng).filter((x) => rowId(x) !== rowId(r));
  let idx = before ? full.findIndex((x) => rowId(x) === rowId(before)) : full.length;
  if (idx < 0) idx = full.length;
  full.splice(idx, 0, r);
  full.forEach((x, k) => writeRow(x, { pos: k }));
  if (ng === 'nw') { if (r.status !== 'not_watched') writeRow(r, { status: 'not_watched' }); }
  else if (ng === 'P') { if (Math.round(r.score || 0) >= 10 && !r.approx) writeRow(r, { peak: true, status: r.status === 'not_watched' ? 'completed' : r.status }); else toast(tr('Пик — только для оценки 10')); }
  else {
    const patch = {};
    if (r.peak) patch.peak = false;
    if (r.status === 'not_watched') patch.status = 'completed'; // вытащил из «Не смотрел» — значит посмотрел
    if (ng !== rowTier(r) || r.peak) patch.tier = ng;
    writeRow(r, patch);
  }
  save(); renderMine();
  if (ng !== from) toast(tr('Перенесено в {t}', { t: tierTitle(ng) }));
}
// сдвинуть на одно место внутри своего тира (кнопки в карточке)
function stepRow(r, dir) {
  const full = groupRows(rowGroup(r));
  const i = full.findIndex((x) => rowId(x) === rowId(r)), j = i + dir;
  if (i < 0 || j < 0 || j >= full.length) return;
  full.forEach((x, k) => writeRow(x, { pos: k }));
  writeRow(full[i], { pos: j }); writeRow(full[j], { pos: i });
  save();
}

/* ---------- Мой топ ---------- */
let mineRows = [];
// сортировка «Рейтинга» — та, что выбрана в пилюле
function sortMine(list) {
  const name = (r) => tn(r.anime);
  const cmp = {
    my: (a, b) => (b.score || 0) - (a.score || 0) || (b.world || 0) - (a.world || 0),
    world: (a, b) => (b.world || 0) - (a.world || 0),
    diff: (a, b) => ((b.score || 0) - (b.world || 0)) - ((a.score || 0) - (a.world || 0)),
    added: (a, b) => b.added - a.added,
    year: (a, b) => (b.anime.year || 0) - (a.anime.year || 0),
    name: (a, b) => name(a).localeCompare(name(b), LOCALE),
  }[mineF.sort] || ((a, b) => (b.score || 0) - (a.score || 0));
  return list.sort(cmp);
}
const mineList = $('#mineList');
function rowMeta(r) {
  const a = r.anime;
  return (r.type === 'title'
    ? [tr('Вся серия'), r.parts ? `${r.parts} ${plural(r.parts, PARTS)}` : r.ratedSeasons ? tr('оценено частей: {n}', { n: r.ratedSeasons }) : '', WATCH[r.status]]
    : [KIND[a.kind] || a.kind, a.year, WATCH[r.status]]).filter(Boolean);
}
function rowHTML(r, i) {
  const a = r.anime, n = i + 1;
  const myCls = r.score == null ? 'none' : r.approx ? 'approx' : '';
  return `<li class="row" data-i="${i}">
    <span class="rk ${n <= 3 ? 'rk-' + n : ''}">${n}</span>
    <img class="row-poster" loading="lazy" src="${esc(a.poster)}" alt="">
    <div class="row-main">
      <div class="row-title">${esc(tn(a))}</div>
      <div class="row-meta">${rowMeta(r).map(esc).join(' · ')}${r.world ? `<span class="mw"> · <span class="star">★</span> ${fmtWorld(r.world)}</span>` : ''}</div>
      ${r.note ? `<div class="row-note">«${esc(r.note)}»</div>` : ''}
    </div>
    <div class="row-world" title="${r.type === 'title' ? tr('Средняя мировая оценка по частям серии') : tr('Мировая оценка')}"><span><span class="star">★</span> ${fmtWorld(r.world)}</span><small>${tr('в мире')}</small></div>
    <div class="row-my ${myCls}" title="${r.approx ? tr('Среднее по моим оценкам сезонов') : tr('Моя оценка')}">${r.approx ? '≈' : ''}${fmtMy(r.score)}</div>
  </li>`;
}
function tierItemHTML(r, i, place) {
  const a = r.anime;
  return `<div class="t-item" data-i="${i}" title="${esc(tn(a))}">
    <div class="t-poster">
      <img loading="lazy" draggable="false" src="${esc(a.poster)}" alt="">
      <span class="t-place">${place}</span>
      ${r.score != null ? `<span class="t-my">${r.approx ? '≈' : ''}${fmtMy(r.score)}</span>` : ''}
    </div>
    <div class="t-name">${esc(tn(a))}</div>
  </div>`;
}
function renderStats(all) {
  if (!all.length) { $('#stats').textContent = tr('Пока пусто'); return; }
  const rated = all.filter((r) => r.score != null);
  const tens = rated.filter((r) => r.score === 10).length;
  const done = all.filter((r) => r.status === 'completed').length;
  const bits = [
    `<b>${all.length}</b> ${mode === 'title' ? plural(all.length, ['аниме', 'аниме', 'аниме']) : plural(all.length, ['сезон или фильм', 'сезона и фильма', 'сезонов и фильмов'])}`,
    rated.length ? `${tr('средняя')} <b>${avg(rated.map((r) => r.score)).toFixed(1)}</b>` : '',
    tens ? `<b>${tens}</b> ${plural(tens, ['шедевр', 'шедевра', 'шедевров'])}` : '',
    done ? `<b>${done}</b> ${tr('просмотрено')}` : '',
  ].filter(Boolean);
  $('#stats').innerHTML = bits.join('<i>·</i>');
}
/* ---------- Статистика ---------- */
const prefAchOpen = () => pref('achOpen', '1') === '1';
document.addEventListener('toggle', (e) => { if (e.target.classList?.contains('st-ach')) setPref('achOpen', e.target.open ? '1' : '0'); }, true);
const fmt1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '');
function barsHTML(items, { max, avgOf } = {}) {
  const top = max || Math.max(1, ...items.map((x) => x.n));
  return `<div class="sb">${items.map((x) => `
    <div class="sb-row" title="${esc(x.tip || `${x.label}: ${x.n}`)}">
      <span class="sb-lbl">${x.html || esc(x.label)}</span>
      <span class="sb-track"><span class="sb-bar" style="width:${x.n ? Math.max(2, (x.n / top) * 100) : 0}%"></span></span>
      <span class="sb-val">${x.n}</span>
      ${avgOf ? `<span class="sb-avg">${x.avg != null ? `<span class="star">★</span>${fmt1(x.avg)}` : ''}</span>` : ''}
    </div>`).join('')}</div>`;
}
function statsHTML(list) {
  const rated = list.filter((r) => r.score != null);
  const both = rated.filter((r) => r.world);
  const myAvg = rated.length ? avg(rated.map((r) => r.score)) : null;
  const worldAvgAll = both.length ? avg(both.map((r) => r.world)) : null;
  const diff = both.length ? avg(both.map((r) => r.score - r.world)) : null;
  const eps = Object.values(db.items).filter((it) => it.status === 'completed').reduce((s, it) => s + (it.anime.episodes || 0), 0);
  const tile = (v, l, sub = '') => `<div class="st-tile"><b>${v}</b><span>${l}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const tiles = [
    tile(list.length, mode === 'title' ? plural(list.length, ['аниме в топе', 'аниме в топе', 'аниме в топе']) : plural(list.length, ['сезон или фильм', 'сезона и фильма', 'сезонов и фильмов'])),
    myAvg != null ? tile(fmt1(myAvg), tr('моя средняя'), worldAvgAll != null ? tr('в мире у тех же — {n}', { n: fmt1(worldAvgAll) }) : '') : '',
    diff != null ? tile((diff > 0 ? '+' : '') + fmt1(diff), diff >= 0.05 ? tr('ты мягче мира') : diff <= -0.05 ? tr('ты строже мира') : tr('как у всего мира'), tr('в среднем на столько баллов')) : '',
    eps ? tile(eps, plural(eps, ['эпизод', 'эпизода', 'эпизодов']), tr('≈ {n} ч просмотра', { n: Math.round((eps * 23) / 60) })) : '',
  ].filter(Boolean).join('');

  const sec = (title, body, note = '') => `<section class="st-sec"><div class="st-head"><h3>${title}</h3>${note ? `<span>${note}</span>` : ''}</div>${body}</section>`;
  const out = [`<div class="st-tiles">${tiles}</div>`];
  if (typeof achShelfHTML === 'function') {
    const ach = db.ach || {}, n = ACH.filter((x) => ach[x.id]).length;
    out.push(`<details class="st-sec st-ach" ${prefAchOpen() ? 'open' : ''}><summary class="st-head"><h3>${tr('Достижения')} · ${n} ${tr('из')} ${ACH.length}</h3><span>${ACH.filter((x) => ach[x.id]).slice(-8).map((x) => achIcon(x)).join('')}</span></summary>${achShelfHTML(ach, !window.VIEWING, window.VIEWING ? null : achStats())}</details>`);
  }

  if (rated.length) {
    const dist = Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => {
      const c = rated.filter((r) => Math.round(r.score) === n).length;
      return { n: c, label: `${n}`, html: `<b>${n}</b> ${LABEL[n]}`, tip: `${n} — ${LABEL[n]}: ${c}` };
    });
    out.push(sec(tr('Мои оценки'), barsHTML(dist), rated.length < list.length ? tr('без оценки — {n}', { n: list.length - rated.length }) : ''));
  }

  const gmap = new Map();
  list.forEach((r) => (r.anime.genres || []).forEach((g) => {
    const x = gmap.get(g.id) || { label: gname(g), n: 0, s: [] };
    x.n++; if (r.score != null) x.s.push(r.score); gmap.set(g.id, x);
  }));
  const genres = [...gmap.values()].map((x) => ({ ...x, avg: x.s.length ? avg(x.s) : null }));
  if (genres.length) {
    const fav = genres.filter((g) => g.s.length >= 2).sort((a, b) => b.avg - a.avg || b.n - a.n)[0];
    const top = [...genres].sort((a, b) => b.n - a.n || (b.avg || 0) - (a.avg || 0)).slice(0, 10);
    const lead = fav ? `<p class="st-lead">${tr('Любимый жанр — <b>{g}</b>: средняя <b>{a}</b> по {n} аниме.', { g: esc(fav.label), a: fmt1(fav.avg), n: fav.s.length })}</p>` : '';
    out.push(sec(tr('Жанры'), lead + barsHTML(top.map((g) => ({ ...g, tip: `${g.label}: ${g.n}${g.avg != null ? `, ${tr('моя средняя')} ${fmt1(g.avg)}` : ''}` })), { avgOf: true }), tr('сколько и моя средняя')));
  }

  const dmap = new Map();
  list.forEach((r) => {
    const y = r.anime.year; if (!y) return;
    const d = Math.floor(y / 10) * 10;
    const x = dmap.get(d) || { label: EN_ON ? `${d}s` : `${d}-е`, n: 0, s: [] };
    x.n++; if (r.score != null) x.s.push(r.score); dmap.set(d, x);
  });
  if (dmap.size) {
    const dec = [...dmap.entries()].sort((a, b) => b[0] - a[0]).map(([, x]) => ({ ...x, avg: x.s.length ? avg(x.s) : null, tip: `${x.label}: ${x.n}` }));
    out.push(sec(tr('По годам выхода'), barsHTML(dec, { avgOf: true }), tr('по десятилетиям')));
  }

  if (both.length >= 2) {
    mineRows = [];
    const pickHTML = (r) => {
      const i = mineRows.push(r) - 1, d = r.score - r.world;
      return `<button class="st-pick" data-i="${i}">
        <img loading="lazy" src="${esc(r.anime.poster)}" alt="">
        <span class="st-pick-name">${esc(tn(r.anime))}</span>
        <span class="st-pick-nums">${tr('моя')} <b>${r.approx ? '≈' : ''}${fmtMy(r.score)}</b> · ${tr('мир')} <b>${fmtWorld(r.world)}</b></span>
        <span class="st-pick-d ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : '−'}${fmt1(Math.abs(d))}</span>
      </button>`;
    };
    const byD = [...both].sort((a, b) => (b.score - b.world) - (a.score - a.world));
    const ups = byD.filter((r) => r.score - r.world > 0.3).slice(0, 3);
    const downs = byD.reverse().filter((r) => r.score - r.world < -0.3).slice(0, 3);
    if (ups.length || downs.length) {
      out.push(sec(tr('Ты и мир'), `<div class="st-cols">
        ${ups.length ? `<div><h4>${tr('Ты оценил выше мира')}</h4>${ups.map(pickHTML).join('')}</div>` : ''}
        ${downs.length ? `<div><h4>${tr('Ты оценил ниже мира')}</h4>${downs.map(pickHTML).join('')}</div>` : ''}
      </div>`, tr('где твоё мнение сильнее всего расходится')));
    }
  }

  const small = [];
  const smap = Object.entries(WATCH).map(([k, v]) => ({ label: v, n: list.filter((r) => r.status === k).length })).filter((x) => x.n);
  if (smap.length) small.push(sec(tr('Статусы'), barsHTML(smap)));
  const kmap = new Map();
  list.forEach((r) => { const k = r.type === 'title' && (r.parts || 0) > 1 ? tr('Серия из частей') : KIND[r.anime.kind] || r.anime.kind || tr('Другое'); kmap.set(k, (kmap.get(k) || 0) + 1); });
  if (kmap.size) small.push(sec(tr('Типы'), barsHTML([...kmap.entries()].sort((a, b) => b[1] - a[1]).map(([label, n]) => ({ label, n })))));
  if (small.length) out.push(`<div class="st-cols">${small.join('')}</div>`);

  return `<div class="stats-view">${out.join('')}</div>`;
}

function renderMine() {
  if (window.PREVIEW) return; // открыта витрина рамок (achievements.js)
  $$('#layoutSeg button').forEach((b) => { const on = b.dataset.layout === layout; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  const all = buildRows();
  const empty = !all.length;
  renderStats(all);
  $('#mineEmpty').hidden = !empty;
  for (const s of ['.tools', '.pills', '#mineActions']) $(s, $('#view-mine')).hidden = empty;
  $('#tierHint').hidden = empty || layout !== 'tiers';
  $('#shareBtn').hidden = layout === 'stats';
  if (empty) { mineRows = []; mineList.innerHTML = ''; return; }

  const q = $('#mineSearch').value.trim().toLocaleLowerCase(LOCALE);
  const min = +mineF.min || 0, wmin = +mineF.wmin || 0;
  const list = all.filter((r) => {
    const a = r.anime;
    if (q && !(`${a.russian} ${a.name} ${a.english || ''}`.toLocaleLowerCase(LOCALE).includes(q))) return false;
    if (mineF.status && r.status !== mineF.status) return false;
    if (min && (r.score || 0) < min) return false;
    if (wmin && (r.world || 0) < wmin) return false;
    if (mineF.genre && !(a.genres || []).some((x) => x.id === mineF.genre)) return false;
    return true;
  });
  if (!list.length) {
    mineRows = [];
    mineList.innerHTML = `<div class="empty-state small"><div class="empty-art">${icon('search')}</div><h2>${tr('Ничего не нашлось')}</h2><p>${tr('В топе нет аниме, подходящих под поиск и фильтры.')}</p><button class="btn" data-act="reset">${tr('Сбросить поиск и фильтры')}</button></div>`;
    return;
  }
  if (layout === 'stats') { mineRows = []; mineList.innerHTML = statsHTML(list); return; }
  if (layout === 'tiers') {
    // тир-лист: в каждом тире свои места 1, 2, 3…
    mineRows = [];
    const groups = [PEAK, ...TIERS, NW, { t: null, c: '#4a4560' }].map((x) => ({ ...x, rows: list.filter((r) => rowGroup(r) === x.t).sort(withinTier) }));
    mineList.innerHTML = `<div class="tiers">${groups.filter((g) => (g.t && g.t !== 'P') || g.rows.length).map((g) => {
      const name = g.t ? tierName(g.t) : '?', desc = g.t ? tierDesc(g.t) : tr('Без оценки');
      return `<section class="tier ${g.t === 'nw' ? 'tier-nw' : ''} ${g.t === 'P' ? 'tier-peak' : ''}" data-tier="${g.t || ''}" style="--c:${g.c}">
        <div class="tier-label">
          <button class="tier-name" ${g.t ? `data-edit="${g.t}" title="${tr('Нажми, чтобы переименовать')}"` : 'disabled'}>
            <b class="${name.length > 2 ? 'long' : ''}">${esc(name)}</b>${desc ? `<em>${esc(desc)}</em>` : ''}
          </button>
          <span class="tier-count">${g.rows.length}</span>
          <button class="tier-fold" data-fold="${g.t || 'none'}" hidden>${icon('chev')}<i></i></button>
        </div>
        <div class="tier-body">${g.rows.length
          ? g.rows.map((r, k) => { mineRows.push(r); return tierItemHTML(r, mineRows.length - 1, k + 1); }).join('')
          : `<span class="tier-empty">${g.t === 'nw' ? tr('Сюда — то, что ещё не смотрел') : tr('Пусто — перетащи сюда')}</span>`}</div>
      </section>`;
    }).join('')}</div>`;
    applyFold();
  } else {
    sortMine(list);
    mineRows = list;
    mineList.innerHTML = `<ol class="rows">${list.map(rowHTML).join('')}</ol>`;
  }
}
mineList.addEventListener('click', (e) => {
  if (suppressClick) return;
  if (e.target.closest('[data-act="reset"]')) {
    $('#mineSearch').value = ''; $('#mineSearch').dispatchEvent(new Event('input'));
    clearFilter('mine', '*'); return;
  }
  const fold = e.target.closest('[data-fold]');
  if (fold) {
    const k = fold.dataset.fold;
    if (tierFold[k]) delete tierFold[k]; else tierFold[k] = 1;
    setPref('tierFold', JSON.stringify(tierFold)); applyFold(); return;
  }
  const ed = e.target.closest('[data-edit]');
  if (ed) { if (!window.VIEWING) editTier(ed, ed.dataset.edit); return; }
  const el = e.target.closest('.row, .t-item, .st-pick'); if (!el) return;
  const r = mineRows[+el.dataset.i];
  if (r) openCard(fromSnap(r.anime), r.type === 'title' ? 'franchise' : 'season');
});

/* ---------- Перетаскивание в тир-листе ----------
   Мышью — просто тянуть постер. Пальцем — задержать на постере (~0,3 с), потом тянуть:
   короткое касание и свайп остаются обычным нажатием и прокруткой. */
let drag = null;
let suppressClick = false;
// src: 'mine' — постер из тир-листа, 'tray' — постер из выдвижной полосы
const newDrag = (el, x, y, touch, src) => ({
  el, src, r: src === 'mine' ? mineRows[+el.dataset.i] : null, a: src === 'tray' ? tray.shown[+el.dataset.k]?.a : null,
  x0: x, y0: y, x, y, touch, started: false, target: null,
});
function bindDrag(box, src, ok) {
  box.addEventListener('pointerdown', (e) => {
    if (!ok() || e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = e.target.closest('.t-item[data-i], .t-item[data-k]'); if (!el) return;
    e.preventDefault(); // без выделения текста
    drag = newDrag(el, e.clientX, e.clientY, false, src);
  });
  box.addEventListener('touchstart', (e) => {
    if (!ok() || e.touches.length !== 1) return;
    const el = e.target.closest('.t-item[data-i], .t-item[data-k]'); if (!el) return;
    const t = e.touches[0];
    drag = newDrag(el, t.clientX, t.clientY, true, src);
    const d = drag;
    d.timer = setTimeout(() => { if (drag === d && !d.started) { startDrag(); navigator.vibrate?.(12); } }, 300);
  }, { passive: true });
  box.addEventListener('contextmenu', (e) => { if (e.target.closest('.t-item')) e.preventDefault(); });
  box.addEventListener('dragstart', (e) => e.preventDefault());
}
bindDrag(mineList, 'mine', () => layout === 'tiers' && !window.VIEWING);
window.addEventListener('pointermove', (e) => {
  if (!drag || drag.touch) return;
  if (!drag.started) {
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
    startDrag();
  }
  drag.x = e.clientX; drag.y = e.clientY;
});
window.addEventListener('pointerup', () => { if (drag && !drag.touch) finishDrag(true); });

window.addEventListener('touchmove', (e) => {
  if (!drag || !drag.touch) return;
  const t = e.touches[0];
  if (!drag.started) {
    // палец поехал раньше, чем сработала задержка, — это прокрутка, не перетаскивание
    if (Math.hypot(t.clientX - drag.x0, t.clientY - drag.y0) > 10) finishDrag(false);
    return;
  }
  e.preventDefault(); // страница не прокручивается, пока несём постер
  drag.x = t.clientX; drag.y = t.clientY;
}, { passive: false });
window.addEventListener('touchend', () => { if (drag?.touch) finishDrag(true); });
window.addEventListener('touchcancel', () => { if (drag?.touch) finishDrag(false); });

function startDrag() {
  const d = drag, rect = d.el.getBoundingClientRect();
  d.ghost = d.el.cloneNode(true);
  d.ghost.classList.add('ghost');
  Object.assign(d.ghost.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px' });
  d.bar = document.createElement('div');
  d.bar.className = 'drop-bar'; d.bar.hidden = true;
  document.body.append(d.ghost, d.bar);
  d.el.classList.add('dragging');
  document.body.classList.add('is-dragging');
  d.started = true;
  requestAnimationFrame(dragLoop);
}
function dragLoop() {
  const d = drag; if (!d?.started) return;
  // прокрутка у краёв экрана
  // нижний край — верх выдвижной полосы, если она открыта (над самой полосой страница не листается)
  const edge = trayOpen ? trayEl.getBoundingClientRect().top : innerHeight;
  if (d.y < 90) window.scrollBy(0, -Math.ceil((90 - d.y) / 5));
  else if (d.y > edge - 110 && d.y <= edge) window.scrollBy(0, Math.ceil((d.y - (edge - 110)) / 5));
  d.ghost.style.transform = `translate(${d.x - d.x0}px, ${d.y - d.y0}px) rotate(2.5deg) scale(1.06)`;
  dragHit(d);
  requestAnimationFrame(dragLoop);
}
function dragHit(d) {
  const under = document.elementFromPoint(d.x, d.y);
  const sec = layout === 'tiers' ? under?.closest('#view-mine .tier') : null;
  $$('.tier.drop-on').forEach((s) => { if (s !== sec) s.classList.remove('drop-on'); });
  // из полосы в «Рейтинг» (или в пустой топ) можно бросить в любое место топа — дальше откроется оценка
  const listDrop = d.src === 'tray' && (layout !== 'tiers' || !$('#mineEmpty').hidden);
  if (listDrop) {
    const ok = !!under?.closest('#view-mine');
    $('#view-mine').classList.toggle('drop-list', ok);
    d.bar.hidden = true; d.target = ok ? { list: true } : null; return;
  }
  if (!sec || !sec.dataset.tier) { d.bar.hidden = true; d.target = null; return; }
  sec.classList.add('drop-on');
  const items = $$('.t-item:not(.dragging):not(.folded)', sec);
  // ищем постер, перед которым окажется перетаскиваемый
  let before = null, prev = null, sameRow = true;
  for (const it of items) {
    const b = it.getBoundingClientRect();
    if (d.y < b.top - 4) { before = it; sameRow = false; break; }                 // указатель выше этого ряда
    if (d.y <= b.bottom + 4 && d.x < b.left + b.width / 2) { before = it; break; } // в этом ряду, левее середины
    prev = it;
  }
  // свёрнутый тир: бросили после видимых — встаёт перед первым скрытым
  if (!before) { const hid = $('.t-item.folded:not(.dragging)', sec); if (hid) { before = hid; sameRow = false; } }
  // полоска-указатель места
  const ref = before && sameRow ? before : prev;
  if (ref) {
    const b = $('.t-poster', ref).getBoundingClientRect();
    const left = before && sameRow ? b.left - 8 : b.right + 4;
    Object.assign(d.bar.style, { left: left + 'px', top: b.top + 'px', height: b.height + 'px' });
    d.bar.hidden = false;
  } else if (before) {
    const b = $('.t-poster', before).getBoundingClientRect();
    Object.assign(d.bar.style, { left: b.left - 8 + 'px', top: b.top + 'px', height: b.height + 'px' });
    d.bar.hidden = false;
  } else d.bar.hidden = true; // пустой тир — подсвечивается целиком
  d.target = { tier: sec.dataset.tier, before: before ? mineRows[+before.dataset.i] : null };
}
function finishDrag(apply) {
  const d = drag; drag = null;
  if (!d) return;
  clearTimeout(d.timer);
  if (!d.started) return;
  d.ghost.remove(); d.bar.remove();
  d.el.classList.remove('dragging');
  document.body.classList.remove('is-dragging');
  $$('.tier.drop-on').forEach((s) => s.classList.remove('drop-on'));
  $('#view-mine').classList.remove('drop-list');
  suppressClick = true; setTimeout(() => (suppressClick = false), 120);
  if (!apply || !d.target) return;
  if (d.src === 'tray') addFromTray(d.a, d.target);
  else if (d.r) dropRow(d.r, d.target.tier, d.target.before);
}

/* ---------- Выдвижная полоса «Добавить аниме» ----------
   Кнопка в углу «Моего топа» выдвигает снизу полосу с аниме (целиком или по сезонам — как выбран режим).
   Постер из неё можно перетащить в тир, в «Не смотрел» или в рейтинг. Уже добавленное в полосе не показывается. */
const tray = { items: [], shown: [], page: 1, more: false, loading: false, loaded: false, token: 0 };
let trayOpen = false;
const trayEl = $('#tray'), strip = $('#trayStrip');
function setTray(open) {
  trayOpen = open;
  trayEl.classList.toggle('open', open);
  trayEl.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('tray-open', open);
  if (open) { trayHint(); if (!tray.loaded) loadTray(true); else renderTray(); }
}
$('#trayBtn').addEventListener('click', () => setTray(true));
$('#trayClose').addEventListener('click', () => setTray(false));
function trayHint() {
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const tiers = layout === 'tiers' && $('#mineEmpty').hidden;
  $('#trayHint').innerHTML = `${touch ? tr('Задержи палец на постере и перетащи') : tr('Перетащи постер')} ${tiers ? (touch ? tr('в нужный тир') : tr('в нужный тир или в «{nw}»', { nw: esc(tierName('nw')) })) : tr('в топ — откроется оценка')}.
    <span>${tr('Показано:')} <b>${mode === 'title' ? tr('аниме целиком') : tr('каждый сезон отдельно')}</b></span>`;
}
async function loadTray(reset) {
  const token = ++tray.token;
  const q = $('#traySearch').value.trim();
  if (reset) {
    tray.page = 1; tray.items = []; strip.scrollLeft = 0;
    strip.innerHTML = Array.from({ length: 10 }, () => '<div class="t-item tray-item"><div class="t-poster skeleton"></div><div class="sk-line skeleton"></div></div>').join('');
  }
  tray.loading = true; tray.loaded = true;
  try {
    const d = await gql(`{ animes(${q ? `search: ${JSON.stringify(q)}` : 'order: popularity'}, limit: ${PAGE}, page: ${tray.page}, status: "released,ongoing") { ${FIELDS} } }`);
    if (token !== tray.token) return;
    tray.items = tray.items.concat(d.animes);
    tray.more = d.animes.length === PAGE;
  } catch {
    if (token !== tray.token) return;
    tray.loading = false;
    if (reset) strip.innerHTML = `<p class="tray-msg">${tr('Не получилось загрузить — проверь интернет')}</p>`;
    return;
  }
  tray.loading = false;
  renderTray();
}
function renderTray() {
  if (!trayOpen || !tray.loaded || (tray.loading && !tray.items.length)) return;
  trayHint();
  let list;
  if (mode === 'title') {
    const inTop = new Set(titleGroups().map((g) => g.key));
    const seen = new Set(); list = [];
    for (const a of tray.items) {
      const k = fKey(a);
      if (seen.has(k) || inTop.has(k)) continue;
      seen.add(k); list.push({ a });
    }
    const missing = [];
    list.forEach((e) => {
      const info = seriesInfo.get(fKey(e.a));
      if (info) Object.assign(e, { a: info.first, total: info.count, avg: info.score });
      else if (e.a.franchise) missing.push(fKey(e.a));
    });
    tray.shown = list;
    if (missing.length) loadSeries(missing);
  } else {
    tray.shown = list = tray.items.filter((a) => !db.items[a.id]).map((a) => ({ a }));
  }
  const keep = strip.scrollLeft;
  strip.innerHTML = list.length ? list.map(trayItemHTML).join('')
    : `<p class="tray-msg">${tray.items.length ? tr('Всё найденное уже в твоём топе') : tr('Ничего не нашлось')}</p>`;
  strip.scrollLeft = keep;
  // если почти всё уже в топе — подгрузим ещё, чтобы полоса не была пустой
  if (list.length < 8 && tray.more && !tray.loading && tray.page < 6) { tray.page++; loadTray(false); }
}
function trayItemHTML({ a, total, avg: sAvg }, i) {
  const series = total > 1;
  const world = series && sAvg ? sAvg : a.score;
  const sub = series ? `${total} ${plural(total, PARTS)}` : [KIND[a.kind] || a.kind, a.airedOn?.year].filter(Boolean).join(' · ');
  return `<div class="t-item tray-item" data-k="${i}" title="${esc(tn(a))}">
    <div class="t-poster">
      <img loading="lazy" draggable="false" src="${esc(a.poster?.preview2xUrl || a.poster?.mainUrl || a.poster?.previewUrl || '')}" alt="">
      ${world ? `<span class="t-world"><i>★</i>${fmtWorld(world)}</span>` : ''}
    </div>
    <div class="t-name">${esc(tn(a))}</div>
    <div class="t-sub">${esc(sub)}</div>
  </div>`;
}
strip.addEventListener('click', (e) => {
  if (suppressClick) return;
  const el = e.target.closest('.tray-item[data-k]'); if (!el) return;
  const it = tray.shown[+el.dataset.k];
  if (it) openCard(it.a, mode === 'title' ? 'franchise' : 'season');
});
strip.addEventListener('scroll', () => {
  if (tray.more && !tray.loading && strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 400) { tray.page++; loadTray(false); }
}, { passive: true });
// колесо мыши листает полосу вбок
strip.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { strip.scrollLeft += e.deltaY; e.preventDefault(); }
}, { passive: false });
bindDrag(strip, 'tray', () => true);

// постер из полосы бросили в топ: добавляем запись (серию целиком или отдельную часть) и ставим на место
async function addFromTray(a, target) {
  if (!a) return;
  const k = fKey(a);
  let info = seriesInfo.get(k);
  if (mode === 'title' && a.franchise && !info) {
    try {
      const d = await gql(`{ animes(franchise: ${JSON.stringify(a.franchise)}, limit: 50) { ${LIGHT} } }`);
      if (d.animes.length) { info = seriesEntry(d.animes); seriesInfo.set(k, info); saveSeries(); }
    } catch {}
  }
  const asTitle = mode === 'title' && info?.count > 1;
  const now = Date.now();
  const rec = { score: null, status: target.tier === 'nw' ? 'not_watched' : 'completed', note: '', added: now, updated: now };
  let id;
  if (asTitle) {
    db.franchises[k] = { ...rec, anime: { ...snapshot(info.first), franchise: a.franchise, score: info.score, parts: info.count } };
    id = 't:' + k;
  } else {
    db.items[a.id] = { ...rec, anime: snapshot(a) };
    id = 's:' + a.id;
  }
  save();
  const row = buildRows().find((r) => rowId(r) === id);
  if (target.tier && row) {
    dropRow(row, target.tier, target.before);
    toast(tr('Добавлено в {t}', { t: tierTitle(target.tier) }));
  } else {
    afterChange();
    toast(tr('Добавлено в топ — поставь оценку'));
    openCard(asTitle ? fromSnap(db.franchises[k].anime) : a, asTitle ? 'franchise' : 'season');
  }
  renderTray();
}
let trayDeb;
bindSearch('#traySearch', (now) => { clearTimeout(trayDeb); trayDeb = setTimeout(() => loadTray(true), now ? 0 : 450); });

/* ---------- Карточка аниме ---------- */
const card = $('#card');
let cs = null; // состояние открытой карточки
const dateOf = (a) => a.airedOn?.date || (a.airedOn?.year ? a.airedOn.year + '-12-31' : '9999');
const isTitle = (st) => st.level === 'franchise' && st.members && st.members.length > 1;
// клипы, промо и реклама — не «части» серии для обложки и средней оценки
const MAIN_KINDS = ['tv', 'movie', 'ova', 'ona'];
const isExtra = (m) => ['music', 'pv', 'cm'].includes(m.kind);
const isLongPart = (m) => !m.duration || m.duration >= 10 || (m.episodes || 0) * m.duration >= 200;
const isSeriesPart = (m) => isLongPart(m) && (m.kind === 'tv' || (m.kind === 'ona' && (m.episodes || 0) >= 6) || (m.kind === 'ova' && (m.episodes || 0) >= 20));
// не вышло — оценивать нельзя
const notOut = (m) => m.status === 'anons';
// обложка серии — то, что вышло первым (сериал, фильм, OVA…)
function firstReleased(list) {
  const main = list.filter((m) => !isExtra(m) && !notOut(m));
  // 22.11: лицо серии — первый сериал. Сериал — TV, веб-сериал от 6 серий или OVA-сериал от 20 серий, но не мини-шорты
  // (короче 10 минут, если всего меньше 200 минут: «Сайки Кусуо» 120×5 — сериал). Мини-аниме и пилоты обложкой не берём;
  // сериалов нет — первый фильм, потом что есть
  const byDate = (l) => [...l].sort((x, y) => dateOf(x).localeCompare(dateOf(y)));
  const series = main.filter(isSeriesPart);
  if (series.length) {
    const pick = byDate(series)[0];
    // ранний OVA-сериал, который заметно лучше первого сериала, — это оригинал («Фури-кури» 2000, а не «Гранж» 2023)
    const ova = byDate(main.filter((m) => (m.kind === 'ova' || m.kind === 'ona') && !isSeriesPart(m) && (m.episodes || 0) >= 6 && (m.duration || 0) >= 20 && dateOf(m) < dateOf(pick) && (m.score || 0) >= (pick.score || 0) + 0.5))[0];
    return ova || pick;
  }
  // полноценных сериалов нет: фильм, потом короткий сериал («Моя жена — президент студсовета» из 8-минуток), потом что есть
  const pool = [main.filter((m) => m.kind === 'movie'), main.filter((m) => m.kind === 'tv'), main.filter(isLongPart), main].find((x) => x.length) || list;
  return byDate(pool)[0];
}
// средняя мировая оценка серии — по сериалам и фильмам (короткие OVA/ONA и спешлы её только искажают);
// если в серии нет ни сериалов, ни фильмов — по OVA/ONA, а потом по всему, что есть
function worldAvg(members) {
  const scored = members.filter((m) => m.score > 0);
  const core = scored.filter((m) => m.kind === 'tv' || m.kind === 'movie');
  const main = scored.filter((m) => MAIN_KINDS.includes(m.kind));
  const src = core.length ? core : main.length ? main : scored;
  return src.length ? Math.round(avg(src.map((m) => m.score)) * 100) / 100 : null;
}
function cleanDesc(s) {
  return (s || '').replace(/\[(\w+)(=[^\]]*)?\]([\s\S]*?)\[\/\1\]/g, '$3').replace(/\[[^\]]+\]/g, '').trim();
}
const safeUrl = (u) => (/^https?:\/\/[^"'()\s\\]+$/.test(u || '') ? u : '');

/* ---------- Anixart: ищем тот же релиз через их поиск и даём ссылку ---------- */
const AX_API = 'https://api.anixart.tv/search/releases/0';
const axCache = (() => { try { return JSON.parse(localStorage.getItem('animetop.anixart')) || {}; } catch { return {}; } })();
const axNorm = (s) => (s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-z0-9а-я]/g, '');
async function findAnixart(a) {
  const key = String(a.id);
  if (key in axCache) return axCache[key];
  const ask = async (query) => {
    const r = await fetch(AX_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, searchBy: 0 }), signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error('anixart ' + r.status);
    return (await r.json()).content || [];
  };
  const pick = (list) => {
    const n = axNorm(a.name), ru = axNorm(a.russian), y = String(a.airedOn?.year || '');
    return list.find((x) => n && axNorm(x.title_original) === n)
      || list.find((x) => ru && axNorm(x.title_ru) === ru && (!y || !x.year || String(x.year) === y))
      || null;
  };
  let hit = null;
  try {
    hit = pick(await ask(a.name || a.russian));
    if (!hit && a.russian) hit = pick(await ask(a.russian));
  } catch { return null; } // сеть или Anixart недоступны — в кэш не пишем, попробуем в другой раз
  axCache[key] = hit ? hit.id : 0;
  try { localStorage.setItem('animetop.anixart', JSON.stringify(axCache)); } catch {}
  return axCache[key];
}
async function showAnixart(a) {
  const id = await findAnixart(a);
  const link = $('#axLink');
  if (!id || !link || (cs && (cs.repFull || cs.rep || cs.anime)?.id !== a.id && cs.anime.id !== a.id)) return;
  link.href = `https://anixart.tv/release/${id}`;
  link.hidden = false;
}

async function openCard(anime, level = 'season') {
  saveNote();
  const st = (cs = { anime, full: null, level, members: null, rep: null, repFull: null, loading: true });
  renderCard();
  openModal(card);
  $('#cardBody').scrollTop = 0;
  try {
    const d = await gql(`{ animes(ids: ${JSON.stringify(String(anime.id))}, limit: 1) { ${FIELDS} description studios{name} ${typeof MEDIA_Q === 'string' ? MEDIA_Q : ''} } }`);
    if (cs !== st) return;
    if (d.animes[0]) { st.full = d.animes[0]; st.anime = st.full; refreshSnap(st.full); }
    if (st.anime.franchise) {
      const m = await gql(`{ animes(franchise: ${JSON.stringify(st.anime.franchise)}, limit: 50) { ${LIGHT} } }`);
      if (cs !== st) return;
      st.members = m.animes.sort((x, y) => dateOf(x).localeCompare(dateOf(y)));
      if (!st.members.some((x) => x.id === st.anime.id)) st.members.push(st.anime);
    } else st.members = [st.anime];
    st.rep = firstReleased(st.members);
    if (isTitle(st)) {
      if (st.rep.id === st.anime.id) st.repFull = st.full;
      else {
        const r = await gql(`{ animes(ids: ${JSON.stringify(String(st.rep.id))}, limit: 1) { ${FIELDS} description studios{name} ${typeof MEDIA_Q === 'string' ? MEDIA_Q : ''} } }`);
        if (cs !== st) return;
        st.repFull = r.animes[0] || st.rep;
      }
    }
  } catch {
    if (!st.members) st.members = [st.anime];
    if (!st.rep) st.rep = st.anime;
  }
  if (cs !== st) return;
  st.loading = false;
  if (typeof mediaLoad === 'function') mediaLoad(st); // клип у музыкального видео (media.js)
  // у оценённой серии обновим сохранённый снимок: обложка, число частей, средняя мировая
  const fr = isTitle(st) && db.franchises[fKey(st.anime)];
  if (fr && st.repFull) { fr.anime = titleSnap(st); save(); }
  renderCard();
}
// снимок серии целиком: обложка и название — первой вышедшей части, оценка — средняя мировая
function titleSnap(st) {
  return { ...snapshot(st.repFull || st.rep), franchise: st.anime.franchise, score: worldAvg(st.members), parts: st.members.length };
}
function refreshSnap(a) {
  // обновим сохранённый снимок свежими данными (мировая оценка, франшиза)
  if (db.items[a.id]) { db.items[a.id].anime = snapshot(a); save(); }
}
function curStore() {
  const st = cs;
  return isTitle(st) ? { store: db.franchises, key: fKey(st.anime) } : { store: db.items, key: String(st.anime.id) };
}
function curRec() { const { store, key } = curStore(); return store[key]; }
// строка топа, которой соответствует открытая карточка (в текущем режиме счёта её может и не быть)
function curRow() {
  const id = isTitle(cs) ? 't:' + fKey(cs.anime) : 's:' + cs.anime.id;
  return buildRows().find((r) => rowId(r) === id) || null;
}
function setRec(patch) {
  const st = cs; const now = Date.now();
  const { store, key } = curStore();
  const snap = isTitle(st) ? titleSnap(st) : snapshot(st.anime);
  const cur = store[key] || { score: null, status: 'completed', note: '', added: now };
  const n = $('#note');
  if ('score' in patch && patch.score !== 10) patch = { ...patch, peak: false };
  store[key] = { ...cur, ...(n ? { note: n.value.trim() } : {}), ...patch, anime: snap, updated: now };
  save(); afterChange();
}
function saveNote() {
  const n = $('#note');
  if (!cs || !n || (cs.loading && cs.level === 'franchise')) return;
  const rec = curRec();
  if (rec && n.value.trim() !== (rec.note || '')) setRec({});
}

function renderCard() {
  const st = cs; const title = isTitle(st);
  const waitTitle = st.level === 'franchise' && st.loading; // ждём список частей серии
  const a = title ? (st.repFull || st.rep) : st.anime;
  const full = title ? st.repFull : st.full;
  const rec = waitTitle ? null : curRec();
  const members = st.members || [];
  const multi = members.length > 1;
  const desc = EN_ON ? '' : cleanDesc(full?.description);
  const years = members.map((m) => m.airedOn?.year).filter(Boolean);
  const poster = a.poster?.main2xUrl || a.poster?.mainUrl || a.poster?.previewUrl || '';
  const world = title ? worldAvg(members) : a.score;
  const eps = a.status === 'ongoing' && full?.episodesAired ? tr('{a} из {b} эп.', { a: full.episodesAired, b: a.episodes || '?' }) : a.episodes ? tr('{n} эп.', { n: a.episodes }) : '';
  const facts = (title
    ? [years.length ? (Math.min(...years) === Math.max(...years) ? `${years[0]}` : `${Math.min(...years)}–${Math.max(...years)}`) : '', full?.studios?.length ? full.studios.map((s) => s.name).join(', ') : '']
    : [KIND[a.kind] || a.kind, a.airedOn?.year, eps, STATUS_A[a.status] || a.status, full?.studios?.length ? full.studios.map((s) => s.name).join(', ') : '']
  ).filter(Boolean);

  /* --- шапка --- */
  const hero = `
    <div class="hero">
      ${safeUrl(poster) ? `<div class="hero-bg" style="background-image:url(&quot;${esc(safeUrl(poster))}&quot;)"></div>` : ''}
      <img class="hero-poster" src="${esc(poster)}" alt="">
      <div class="hero-head">
        ${!title && multi ? `<button class="crumb" id="toTitle">${icon('back')}${tr('Вся серия')}</button>` : ''}
        ${title ? `<div class="kicker">${icon('layers')}${tr('Вся серия')} · ${members.length} ${plural(members.length, PARTS)}</div>` : ''}
        <h2>${esc(tn(a))}</h2>
        ${!EN_ON && a.russian && a.name ? `<div class="orig">${esc(a.name)}</div>` : EN_ON && a.english && a.name && a.english !== a.name ? `<div class="orig">${esc(a.name)}</div>` : ''}
        ${world ? `<div class="world"><span class="star">★</span><b>${fmtWorld(world)}</b><span>${title ? tr('в мире, в среднем по серии') : tr('в мире')}</span></div>` : ''}
        ${typeof cmLine === 'function' ? cmLine(a, title, members) : ''}
        ${facts.length ? `<div class="facts">${facts.map(esc).join('<i>·</i>')}</div>` : ''}
      </div>
      <div class="hero-more">
        ${(a.genres || []).length ? `<div class="tags">${a.genres.map((g) => `<span class="tag">${esc(gname(g))}</span>`).join('')}</div>` : ''}
        ${full ? (desc ? `<div class="desc clamp" id="desc">${esc(desc)}</div>` : '') : st.loading ? '<div class="skeleton" style="height:84px;border-radius:10px;margin-top:14px"></div>' : ''}
        <div class="hero-links">
          ${full && desc.length > 260 ? `<button class="link" id="descMore">${tr('Читать полностью')}</button>` : ''}
          <a class="ext" href="${esc(a.url?.startsWith('http') ? a.url : SITE + (a.url || ''))}" target="_blank" rel="noopener">${tr('Открыть на Shikimori')}${icon('ext')}</a>
          <a class="ext ax" id="axLink" target="_blank" rel="noopener" hidden>${tr('Открыть в Anixart')}${icon('ext')}</a>
        </div>
      </div>
    </div>`;

  /* --- оценка --- */
  const rateH = title ? tr('Моя оценка всей серии') : multi ? tr('Моя оценка этой части') : tr('Моя оценка');
  const mySeason = members.map((m) => db.items[m.id]?.score).filter(Boolean);
  const hintText = rec?.score ? ''
    : title && mySeason.length ? tr('Среднее по моим оценкам частей — {n}. Можно поставить отдельную оценку всей серии.', { n: fmtMy(Math.round(avg(mySeason) * 10) / 10) })
    : rec ? tr('Нажми на число, чтобы оценить.')
    : tr('Нажми на число — аниме сразу попадёт в твой топ.');
  const verdictHTML = (n) => (n ? `<b>${n}</b>${LABEL[n]}` : '');
  const row = rec ? curRow() : null;
  let tierField = '';
  if (rec && row) {
    const auto = autoTier(row.score), g = rowGroup(row);
    const inTier = groupRows(g), i = inTier.findIndex((x) => rowId(x) === rowId(row));
    tierField = `<div class="field"><span class="lbl">${tr('Тир')} <small>${tr('для тир-листа')}</small></span><div>
      <div class="chips">
        <button class="chip ${!rec.tier ? 'on' : ''}" data-tier="" title="${tr('Тир подбирается по оценке')}">${tr('Авто')}${auto ? ` · ${esc(tierName(auto))}` : ''}</button>
        ${TIERS.map((x) => `<button class="chip chip-tier ${rec.tier === x.t ? 'on' : ''}" data-tier="${x.t}" style="--c:${x.c}" title="${esc(tierDesc(x.t))}">${esc(tierName(x.t))}</button>`).join('')}
      </div>
      ${g && inTier.length > 1 ? `<div class="place">${g === 'nw' ? tr('Место в «{t}»:', { t: esc(tierName('nw')) }) : tr('Место в тире {t}:', { t: esc(tierName(g)) })}
        <button class="step" data-step="-1" ${i <= 0 ? 'disabled' : ''} aria-label="${tr('Выше')}">${icon('up')}</button>
        <b>${i + 1}</b> ${tr('из')} ${inTier.length}
        <button class="step" data-step="1" ${i >= inTier.length - 1 ? 'disabled' : ''} aria-label="${tr('Ниже')}">${icon('down')}</button></div>` : ''}
    </div></div>`;
  }
  let rate;
  if (window.VIEWING) {
    rate = rec?.score ? `<section class="sec"><div class="sec-head"><h3>${tr('Оценка {l}', { l: esc(window.VIEWING.login) })}</h3><div class="verdict">${verdictHTML(rec.score)}</div></div>${rec.peak && rec.score === 10 ? peakTagHTML() : ''}</section>` : '';
  } else if (!title && !st.loading && notOut(st.anime) && !rec) {
    rate = `<section class="sec"><div class="sec-head"><h3>${tr('Моя оценка')}</h3></div><div class="soon-box">${tr('Это аниме ещё не вышло — оценить можно будет после выхода.')}</div></section>`;
  } else if (waitTitle) {
    rate = `<section class="sec"><div class="sec-head"><h3>${tr('Моя оценка всей серии')}</h3></div><div class="skeleton" style="height:50px;border-radius:12px"></div></section>`;
  } else {
    rate = `<section class="sec">
      <div class="sec-head"><h3>${rateH}</h3><div class="verdict" id="verdict">${verdictHTML(rec?.score)}</div></div>
      <div class="scale" id="scale">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button data-n="${n}" class="${rec?.score >= n ? 'fill' : ''} ${rec?.score === n ? 'on' : ''}" aria-label="${n} — ${LABEL[n]}">${n}</button>`).join('')}</div>
      ${rec?.score === 10 ? `<div class="peak-w">${peakBtnHTML('id="peakBtn"', rec.peak)}</div>` : ''}
      <p class="rate-hint">${rec?.score ? `<button class="link" id="unrate">${tr('Убрать оценку')}</button>` : esc(hintText)}</p>
      <div class="field"><span class="lbl">${tr('Статус')}</span><div class="chips">${Object.entries(WATCH).map(([k, v]) => `<button class="chip ${rec?.status === k ? 'on' : ''}" data-watch="${k}">${v}</button>`).join('')}</div></div>
      ${tierField}
      ${rec ? `<div class="field"><label for="note">${tr('Заметка')}</label><textarea id="note" placeholder="${tr('Чем зацепило, любимый персонаж, момент…')}" maxlength="500">${esc(rec.note || '')}</textarea></div>
        <div class="rate-foot"><button class="link danger" id="remove">${tr('Убрать из топа')}</button></div>` : ''}
    </section>`;
  }

  /* --- части серии --- */
  const partsBlock = multi ? `
    <section class="sec">
      <div class="sec-head"><h3>${title ? tr('Сезоны и фильмы серии') : tr('Все части серии')} · ${members.length}</h3><span class="sec-note">${title ? tr('Каждую часть можно оценить отдельно') : ''}</span></div>
      <div class="parts">${members.map((m) => {
        const my = db.items[m.id]?.score;
        return `<button class="part ${notOut(m) ? 'soon' : ''} ${!title && String(m.id) === String(st.anime.id) ? 'cur' : ''}" data-id="${m.id}">
          <img loading="lazy" src="${esc(m.poster?.preview2xUrl || m.poster?.previewUrl || m.poster?.mainUrl || '')}" alt="">
          <span><span class="part-name">${esc(tn(m))}</span><small>${[KIND[m.kind] || m.kind, m.airedOn?.year, notOut(m) ? tr('ещё не вышло') : ''].filter(Boolean).join(' · ')}</small></span>
          <span class="part-world">${m.score ? `<span class="star">★</span> ${fmtWorld(m.score)}` : ''}</span>
          <span class="part-my ${my ? '' : 'none'}" title="${my ? tr('Моя оценка') : tr('Не оценено')}">${my || '+'}</span>
        </button>`;
      }).join('')}</div>
    </section>` : '';

  const mTop = typeof mediaTop === 'function' ? mediaTop(st, full) : '', mBottom = typeof mediaBottom === 'function' ? mediaBottom(st, full) : '';
  $('#cardBody').innerHTML = hero + mTop + rate + mBottom + partsBlock;
  if (!st.loading) showAnixart(a);

  /* --- действия --- */
  $('#descMore')?.addEventListener('click', (e) => { $('#desc').classList.remove('clamp'); e.target.remove(); });
  $('#toTitle')?.addEventListener('click', () => openCard(st.anime, 'franchise'));
  $$('.part', card).forEach((b) => b.addEventListener('click', () => {
    const m = members.find((x) => String(x.id) === b.dataset.id);
    if (m) openCard(m, 'season');
  }));
  const scale = $('#scale');
  if (!scale) return;
  const preview = (n) => {
    scale.classList.toggle('previewing', !!n);
    $$('button', scale).forEach((b) => b.classList.toggle('pre', !!n && +b.dataset.n <= n));
    $('#verdict').innerHTML = verdictHTML(n || curRec()?.score);
  };
  $$('button', scale).forEach((b) => {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') preview(+b.dataset.n); });
    b.addEventListener('click', () => {
      const n = +b.dataset.n;
      setRec({ score: n });
      renderCard();
      toast(`${tr('Оценка')} ${n} — ${LABEL[n]}`);
    });
  });
  scale.addEventListener('pointerleave', () => preview(0));
  $('#unrate')?.addEventListener('click', () => { setRec({ score: null }); renderCard(); toast(tr('Оценка убрана')); });
  $('#peakBtn')?.addEventListener('click', () => { const on = !curRec()?.peak; setRec({ peak: on, ...(on ? { pos: null } : {}) }); renderCard(); if (on) toast(tr('Абсолютный пик')); });
  $$('[data-watch]', card).forEach((b) => b.addEventListener('click', () => {
    const had = !!curRec();
    setRec({ status: b.dataset.watch });
    renderCard();
    toast(had ? `${tr('Статус')}: ${WATCH[b.dataset.watch]}` : `${tr('Добавлено в топ')} · ${WATCH[b.dataset.watch]}`);
  }));
  $$('[data-tier]', card).forEach((b) => b.addEventListener('click', () => {
    const t = b.dataset.tier || null;
    setRec({ tier: t, pos: null });
    renderCard();
    toast(t ? tr('Тир {t}', { t: tierName(t) }) : tr('Тир — по оценке'));
  }));
  $$('[data-step]', card).forEach((b) => b.addEventListener('click', () => {
    saveNote();
    const r = curRow(); if (!r) return;
    stepRow(r, +b.dataset.step); afterChange(); renderCard();
  }));
  $('#note')?.addEventListener('change', saveNote);
  $('#remove')?.addEventListener('click', () => {
    const { store, key } = curStore(); delete store[key]; markDeleted(store, key); save(); afterChange(); renderCard(); toast(tr('Убрано из топа'));
  });
}
function afterChange() {
  if (trayOpen) renderTray();
  if (view === 'mine') renderMine();
  if (view === 'catalog' && cat.loaded) renderCatalog();
}
card.addEventListener('close', () => { saveNote(); cs = null; afterChange(); });

/* ---------- Картинка топа («Поделиться») ----------
   Рисуем на canvas тот вид, что выбран: тир-лист или рейтинг. Shikimori не разрешает браузеру
   копировать свои постеры в картинку, поэтому постеры берём через открытый прокси картинок wsrv.nl. */
const SHARE_W = 1080;
const proxied = (u) => (u ? `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ''))}&w=248&h=352&fit=cover&output=jpg&q=82` : '');
function loadImg(src) {
  return new Promise((res) => {
    if (!src) return res(null);
    const im = new Image(); im.crossOrigin = 'anonymous';
    const t = setTimeout(() => res(null), 12000);
    im.onload = () => { clearTimeout(t); res(im); };
    im.onerror = () => { clearTimeout(t); res(null); };
    im.src = src;
  });
}
async function loadPosters(urls, onProgress) {
  const out = new Array(urls.length); let i = 0, done = 0;
  const worker = async () => { while (i < urls.length) { const k = i++; out[k] = await loadImg(proxied(urls[k])); onProgress?.(++done, urls.length); } };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}
// перенос текста по словам, не больше maxLines строк, с «…» в конце
function wrapText(ctx, text, maxW, maxLines) {
  const fit = (t) => { if (ctx.measureText(t).width <= maxW) return t; while (t.length && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1); return t + '…'; };
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = []; let cur = '', i = 0;
  for (; i < words.length; i++) {
    const t = cur ? cur + ' ' + words[i] : words[i];
    if (ctx.measureText(t).width <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = words[i]; if (lines.length === maxLines) break; }
  }
  if (lines.length < maxLines && cur) { lines.push(cur); i = words.length; }
  if (i < words.length) lines[lines.length - 1] = fit(lines[lines.length - 1] + '…').replace(/……$/, '…');
  return lines.map(fit);
}
async function makeShareImage(onProgress) {
  const all = buildRows();
  try { await Promise.all([document.fonts.load('700 40px Unbounded'), document.fonts.load('700 20px Onest'), document.fonts.load('500 20px Onest')]); } catch {}
  const F = (w, px, disp) => `${w} ${px}px ${disp ? 'Unbounded' : 'Onest'}, system-ui, sans-serif`;
  const P = 48, HEAD = 176, FOOT = 92;
  const tiers = layout === 'tiers';
  let groups = [], list = [], more = 0, H;
  // размеры тир-листа
  const LW = 176, PW = 124, PH = 176, NH = 46, GAP = 12;
  const bodyX = P + LW + 12, bodyW = SHARE_W - P - bodyX;
  const per = Math.floor((bodyW - 24 + GAP) / (PW + GAP));
  // размеры рейтинга
  const RH = 140, LIMIT = 50;
  if (tiers) {
    groups = [PEAK, ...TIERS, NW, { t: null, c: '#4a4560' }]
      .map((x) => ({ ...x, rows: all.filter((r) => rowGroup(r) === x.t).sort(withinTier) }))
      .filter((g) => (g.t && g.t !== 'nw' && g.t !== 'P') || g.rows.length);
    groups.forEach((g) => { g.h = g.rows.length ? Math.ceil(g.rows.length / per) * (PH + NH + GAP) - GAP + 24 : 116; });
    H = HEAD + groups.reduce((sum, g) => sum + g.h + 12, 0) + FOOT;
  } else {
    list = sortMine([...all]);
    more = Math.max(0, list.length - LIMIT); list = list.slice(0, LIMIT);
    H = HEAD + list.length * RH + (more ? 56 : 0) + FOOT;
  }
  const rows = tiers ? groups.flatMap((g) => g.rows) : list;
  const imgs = await loadPosters(rows.map((r) => r.anime.poster), onProgress);
  const img = new Map(rows.map((r, i) => [r, imgs[i]]));

  const cv = document.createElement('canvas');
  cv.width = SHARE_W; cv.height = H;
  const ctx = cv.getContext('2d');
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  // фон
  ctx.fillStyle = '#0e0d14'; ctx.fillRect(0, 0, SHARE_W, H);
  for (const [x, c] of [[120, 'rgba(255,77,120,.20)'], [960, 'rgba(124,108,255,.20)']]) {
    const g = ctx.createRadialGradient(x, -40, 0, x, -40, 620);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SHARE_W, 700);
  }
  // шапка
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f3f1f8'; ctx.font = F(700, 48, true);
  ctx.fillText(tiers ? tr('Мой тир-лист аниме') : tr('Мой топ аниме'), P, 96);
  const rated = all.filter((r) => r.score != null);
  const sub = [`${all.length} ${mode === 'title' ? plural(all.length, ['аниме', 'аниме', 'аниме']) : plural(all.length, ['сезон или фильм', 'сезона и фильма', 'сезонов и фильмов'])}`,
    rated.length ? `${tr('моя средняя')} ${avg(rated.map((r) => r.score)).toFixed(1)}` : '',
    rated.filter((r) => r.score === 10).length ? tr('шедевров: {n}', { n: rated.filter((r) => r.score === 10).length }) : ''].filter(Boolean).join('   ·   ');
  ctx.fillStyle = '#8a859b'; ctx.font = F(500, 24); ctx.fillText(sub, P, 140);

  const drawPoster = (r, x, y, w, h, radius) => {
    ctx.save(); rr(x, y, w, h, radius); ctx.clip();
    const im = img.get(r);
    if (im) ctx.drawImage(im, x, y, w, h);
    else {
      ctx.fillStyle = '#2c283a'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#bab5ca'; ctx.font = F(600, 14);
      wrapText(ctx, tn(r.anime), w - 16, 4).forEach((l, i) => ctx.fillText(l, x + 8, y + 26 + i * 18));
    }
    ctx.restore();
  };
  const badge = (x, y, w, h, fill, text, font, color = '#fff') => {
    rr(x, y, w, h, 9); ctx.fillStyle = fill; ctx.fill();
    ctx.fillStyle = color; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  };
  let y = HEAD;
  if (tiers) {
    for (const g of groups) {
      // плашка тира: название и подпись
      rr(P, y, LW, g.h, 20); ctx.fillStyle = g.c; ctx.fill();
      const name = g.t ? tierName(g.t) : '?', desc = g.t ? tierDesc(g.t) : tr('Без оценки');
      ctx.fillStyle = '#16131f'; ctx.textAlign = 'center';
      ctx.font = name.length > 2 ? F(700, 26) : F(700, 60, true);
      const nLines = wrapText(ctx, name, LW - 24, 2), lh = name.length > 2 ? 30 : 60;
      ctx.font = F(600, 19);
      const dLines = desc ? wrapText(ctx, desc, LW - 24, 2) : [];
      const blockH = nLines.length * lh + (dLines.length ? 10 + dLines.length * 23 : 0);
      let ty = y + (g.h - blockH) / 2 + lh * 0.82;
      ctx.font = name.length > 2 ? F(700, 26) : F(700, 60, true);
      nLines.forEach((l) => { ctx.fillText(l, P + LW / 2, ty); ty += lh; });
      ctx.font = F(600, 19); ctx.fillStyle = 'rgba(22,19,31,.72)'; ty += 10 - lh + 23;
      dLines.forEach((l) => { ctx.fillText(l, P + LW / 2, ty); ty += 23; });
      ctx.textAlign = 'left';
      // постеры тира
      rr(bodyX, y, bodyW, g.h, 20); ctx.fillStyle = '#17151f'; ctx.fill();
      ctx.strokeStyle = '#292535'; ctx.lineWidth = 2; ctx.stroke();
      if (!g.rows.length) { ctx.fillStyle = '#5d5870'; ctx.font = F(500, 20); ctx.fillText(tr('Пусто'), bodyX + 24, y + g.h / 2 + 7); }
      g.rows.forEach((r, k) => {
        const px = bodyX + 12 + (k % per) * (PW + GAP), py = y + 12 + Math.floor(k / per) * (PH + NH + GAP);
        drawPoster(r, px, py, PW, PH, 12);
        badge(px + 6, py + 6, k + 1 > 9 ? 40 : 32, 30, 'rgba(12,11,17,.86)', String(k + 1), F(700, 15, true));
        if (r.score != null) { const t = (r.approx ? '≈' : '') + fmtMy(r.score); badge(px + PW - 8 - (t.length > 2 ? 52 : 36), py + PH - 38, t.length > 2 ? 52 : 36, 32, '#ff4d78', t, F(700, 16, true)); }
        ctx.fillStyle = '#bab5ca'; ctx.font = F(500, 16);
        wrapText(ctx, tn(r.anime), PW, 2).forEach((l, i) => ctx.fillText(l, px, py + PH + 21 + i * 20));
      });
      y += g.h + 12;
    }
  } else {
    list.forEach((r, i) => {
      rr(P, y, SHARE_W - P * 2, RH - 14, 20); ctx.fillStyle = '#17151f'; ctx.fill();
      ctx.strokeStyle = '#292535'; ctx.lineWidth = 2; ctx.stroke();
      const n = i + 1, mid = y + (RH - 14) / 2;
      ctx.fillStyle = n === 1 ? '#ffd24a' : n === 2 ? '#d3d9e6' : n === 3 ? '#e89c62' : '#8a859b';
      ctx.font = F(700, n <= 3 ? 34 : 28, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(n), P + 46, mid + 2); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      drawPoster(r, P + 92, y + 10, 78, RH - 34, 10);
      // справа: моя оценка и мировая
      const my = r.score == null ? '—' : (r.approx ? '≈' : '') + fmtMy(r.score);
      badge(SHARE_W - P - 96, mid - 38, 76, 76, r.score == null ? '#2c283a' : '#ff4d78', my, F(700, my.length > 2 ? 24 : 30, true), r.score == null ? '#8a859b' : '#fff');
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffc94a'; ctx.font = F(700, 24); ctx.fillText(`★ ${fmtWorld(r.world)}`, SHARE_W - P - 116, mid + 2);
      ctx.fillStyle = '#8a859b'; ctx.font = F(500, 16); ctx.fillText(tr('в мире'), SHARE_W - P - 116, mid + 26);
      ctx.textAlign = 'left';
      // название и подпись
      const tx = P + 192, tw = SHARE_W - P - 236 - tx;
      ctx.fillStyle = '#f3f1f8'; ctx.font = F(700, 27);
      const tl = wrapText(ctx, tn(r.anime), tw, 2);
      const meta = rowMeta(r).join(' · ');
      let ty = mid - (tl.length * 34 + 28) / 2 + 26;
      tl.forEach((l) => { ctx.fillText(l, tx, ty); ty += 34; });
      ctx.fillStyle = '#8a859b'; ctx.font = F(500, 20); ctx.fillText(wrapText(ctx, meta, tw, 1)[0] || '', tx, ty - 4);
      y += RH;
    });
    if (more) { ctx.fillStyle = '#8a859b'; ctx.font = F(600, 24); ctx.fillText(tr('…и ещё {n}', { n: more }), P + 20, y + 30); y += 56; }
  }
  // подвал
  ctx.fillStyle = '#5d5870'; ctx.font = F(500, 22);
  ctx.fillText('AniTier · anitierapp.pages.dev', P, H - 40);
  ctx.textAlign = 'right'; ctx.fillText(tr('данные: Shikimori'), SHARE_W - P, H - 40); ctx.textAlign = 'left';
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
const shareDlg = $('#shareDlg');
let shareFile = null, shareUrl = '';
$('#shareBtn').addEventListener('click', async () => {
  shareFile = null; if (shareUrl) URL.revokeObjectURL(shareUrl); shareUrl = '';
  $('#shareImg').innerHTML = `<div class="share-wait"><span class="spin"></span><span id="shareProg">${tr('Рисую картинку…')}</span></div>`;
  $('#shareInfo').textContent = layout === 'tiers' ? tr('Тир-лист целиком — со всеми тирами, даже свёрнутыми') : tr('Рейтинг в выбранной сортировке, до 50 мест');
  $('#shareSave').disabled = true; $('#shareSend').disabled = true;
  openModal(shareDlg);
  try {
    const blob = await makeShareImage((d, n) => { const p = $('#shareProg'); if (p) p.textContent = tr('Загружаю постеры… {d} из {n}', { d, n }); });
    if (!blob) throw 0;
    shareFile = new File([blob], `anitier-${new Date().toISOString().slice(0, 10)}.png`, { type: 'image/png' });
    shareUrl = URL.createObjectURL(blob);
    $('#shareImg').innerHTML = `<img src="${shareUrl}" alt="${tr('Картинка моего топа')}">`;
    $('#shareSave').disabled = false;
    const canSend = !!navigator.canShare?.({ files: [shareFile] });
    $('#shareSend').hidden = !canSend; $('#shareSend').disabled = !canSend;
  } catch {
    $('#shareImg').innerHTML = `<p class="share-wait">${tr('Не получилось нарисовать картинку. Проверь интернет и попробуй ещё раз.')}</p>`;
  }
});
$('#shareSave').addEventListener('click', () => {
  if (!shareUrl) return;
  const a = document.createElement('a'); a.href = shareUrl; a.download = shareFile.name; a.click();
  toast(tr('Картинка сохранена'));
});
$('#shareSend').addEventListener('click', async () => {
  if (!shareFile) return;
  try { await navigator.share({ files: [shareFile], title: 'AniTier' }); } catch {}
});

/* ---------- Окна и кнопка «назад» ---------- */
function openModal(d) {
  if (d.open) return;
  closePop();
  d.showModal();
  history.pushState({ modal: d.id }, '');
}
$$('dialog').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  d.addEventListener('close', () => { if (history.state?.modal === d.id) history.back(); });
});
// «назад» в браузере или на телефоне закрывает открытое окно, а не уводит с сайта
window.addEventListener('popstate', () => $$('dialog[open]').forEach((d) => d.close()));

/* ---------- Меню: копия, загрузка, установка ---------- */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; });
$('#menuBtn').addEventListener('click', (e) => {
  openPop(e.currentTarget, {
    align: 'right',
    // 20.11: меню короче — копия топа и импорт в одном окне «Перенос оценок», язык — в настройках
    items: [
      { v: 'profile', icon: 'user', label: tr('Моя визитка'), hint: tr('Как тебя видят друзья по ссылке на топ') },
      { v: 'cmtop', icon: 'trophy', label: tr('Топ аниме AniTier'), hint: tr('Средние оценки игроков AniTier') },
      { v: 'import2', icon: 'upload', label: tr('Перенос оценок'), hint: tr('Импорт с Shikimori, MAL, AniXart и копия в файл') },
      { v: 'settings', icon: 'sliders', label: tr('Настройки'), hint: tr('Язык, промокод, анимация рамок') },
      ...(installEvt ? [{ v: 'install', icon: 'phone', label: tr('Установить как приложение'), hint: tr('Значок на главном экране') }] : []),
    ],
    note: typeof acct !== 'undefined' && acct.user ? tr('Оценки сохраняются в твоём аккаунте. Данные об аниме — Shikimori.') : tr('Без аккаунта оценки хранятся только на этом устройстве. Данные об аниме — Shikimori.'),
    onPick: (it) => {
      if (it.v === 'settings' && typeof openSettings === 'function') openSettings();
      if (it.v === 'cmtop' && typeof openCmTop === 'function') openCmTop();
      if (it.v === 'profile' && typeof openProfileCard === 'function') { if (window.VIEWING) toast(tr('Сначала вернись к своему топу')); else openProfileCard(); }
      if (it.v === 'import2' && typeof openImport === 'function') { if (window.VIEWING) toast(tr('Сначала вернись к своему топу')); else openImport(); }
      if (it.v === 'lang') { setPref('lang', EN_ON ? 'ru' : 'en'); location.reload(); }
      if (it.v === 'install' && installEvt) { installEvt.prompt(); installEvt = null; }
    },
  });
});
function exportTop() {
  const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `anitier-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(tr('Копия сохранена в файл'));
}
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d.items) throw 0;
    const n = Object.keys(d.items).length + Object.keys(d.franchises || {}).length;
    if (!confirm(tr('В файле {n} {w}. Добавить их в твой топ? Совпадающие заменятся версией из файла.', { n, w: plural(n, ['оценка', 'оценки', 'оценок']) }))) return;
    db.items = { ...db.items, ...d.items };
    db.franchises = { ...db.franchises, ...(d.franchises || {}) };
    save(); renderPills(); afterChange(); toast(`${tr('Загружено')}: ${n}`);
  } catch { toast(tr('Это не файл топа')); }
  e.target.value = '';
});

/* ---------- Сообщения ---------- */
let toastT;
function toast(t) {
  const el = $('#toast');
  el.hidden = true; void el.offsetWidth; // перезапуск анимации
  el.textContent = t; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), 2300);
}

// постер не загрузился (сервер иногда отказывает при большом потоке) — пробуем ещё пару раз
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName !== 'IMG' || !img.src.startsWith('http')) return;
  const n = +(img.dataset.retry || 0);
  if (n >= 3) return;
  img.dataset.retry = n + 1;
  const src = img.src;
  setTimeout(() => { img.src = ''; img.src = src; }, 800 + n * 1500 + Math.random() * 600);
}, true);

// у сохранённых раньше записей нет английского названия — догружаем пачками по 50
async function fillEnglishNames() {
  const recs = [...Object.values(db.items), ...Object.values(db.franchises)].filter((r) => r.anime && r.anime.english === undefined);
  const ids = [...new Set(recs.map((r) => r.anime.id))];
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const part = ids.slice(i, i + 50);
      const d = await gql(`{ animes(ids: ${JSON.stringify(part.join(','))}, limit: 50) { id english } }`);
      const en = new Map(d.animes.map((a) => [String(a.id), a.english || '']));
      recs.forEach((r) => { if (en.has(String(r.anime.id))) r.anime.english = en.get(String(r.anime.id)); });
    } catch { return; }
  }
  if (ids.length) { save(); afterChange(); }
}

/* ---------- Старт ---------- */
if (history.state?.modal) history.replaceState(null, ''); // страницу обновили при открытом окне
updateCount();
renderPills();
loadGenres();
view = ['catalog', 'themes', 'games', 'chars', 'ost'].includes(pref('view', 'mine')) ? pref('view', 'mine') : 'mine';
show(view);
if (EN_ON) fillEnglishNames();
setTimeout(relResolve, 3000);
// 22.11: лицо серии теперь первый сериал — у сохранённых серий пересчитываем один раз (faceFix2)
async function fixSeriesFaces() {
  if (window.VIEWING || pref('faceFix2', '')) return;
  const keys = Object.entries(db.franchises).filter(([k, f]) => f.anime && !k.startsWith('id')).map(([k]) => k);
  let changed = false;
  try {
    for (let i = 0; i < keys.length; i += 5) {
      const part = keys.slice(i, i + 5);
      const d = await gql(`{ ${part.map((k, j) => `f${j}: animes(franchise: ${JSON.stringify(k)}, limit: 50) { ${LIGHT} }`).join(' ')} }`);
      part.forEach((k, j) => {
        const l = d['f' + j] || [], f = db.franchises[k];
        if (l.length < 2 || !f) return;
        const first = firstReleased(l);
        if (String(first.id) === String(f.anime.id)) return;
        f.anime = { ...snapshot(first), franchise: k, score: f.anime.score, parts: f.anime.parts }; changed = true;
        seriesInfo.set(k, seriesEntry(l));
      });
    }
    setPref('faceFix2', '1');
  } catch {}
  if (changed) { saveSeries(); save(); if (typeof afterChange === 'function') afterChange(); }
}
setTimeout(fixSeriesFaces, 4000);
try { localStorage.removeItem('animetop.series2'); localStorage.removeItem('animetop.series3'); localStorage.removeItem('animetop.genres'); } catch {} // старые кэши без английских названий
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
