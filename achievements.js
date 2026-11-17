'use strict';
/* Достижения и рамки аватарки (2026-11-17).
   Достижения считаются по самому топу; полученное запоминается в db.ach { id: когда } и уже не
   пропадает, даже если оценку потом убрать (и синхронизируется с аккаунтом). Секретные
   скрыты, пока не получишь. Рамки открываются достижениями, несколько — сразу. */

// g — группа: count (количество), taste (вкус), era (эпохи и типы), secret (секретные)
const ACH = [
  { id: 'first', g: 'count', i: '🌱', t: 'Первый шаг', d: 'Поставь первую оценку', ok: (s) => s.rated >= 1 },
  { id: 'rated10', g: 'count', i: '🔟', t: 'Десятка', d: 'Оцени 10 аниме', ok: (s) => s.rated >= 10, p: (s) => [s.rated, 10] },
  { id: 'rated50', g: 'count', i: '📚', t: 'Полсотни', d: 'Оцени 50 аниме', ok: (s) => s.rated >= 50, p: (s) => [s.rated, 50] },
  { id: 'rated100', g: 'count', i: '💯', t: 'Сотня', d: 'Оцени 100 аниме', ok: (s) => s.rated >= 100, p: (s) => [s.rated, 100] },
  { id: 'rated500', g: 'count', i: '👑', t: 'Анимешник со стажем', d: 'Оцени 500 аниме', ok: (s) => s.rated >= 500, p: (s) => [s.rated, 500] },
  { id: 'tierfull', g: 'count', i: '🎨', t: 'Тир-мастер', d: 'Заполни все тиры от S до F', ok: (s) => s.tiersFilled >= 6, p: (s) => [s.tiersFilled, 6] },
  { id: 'eps1000', g: 'count', i: '🍿', t: 'Тысяча серий', d: 'Посмотри 1000 эпизодов (по сезонам со статусом «Просмотрено»)', ok: (s) => s.eps >= 1000, p: (s) => [s.eps, 1000] },

  { id: 'master1', g: 'taste', i: '⭐', t: 'Первый шедевр', d: 'Поставь кому-нибудь 10', ok: (s) => s.tens >= 1 },
  { id: 'master10', g: 'taste', i: '🏆', t: 'Ценитель', d: 'Поставь 10 шедевров (оценка 10)', ok: (s) => s.tens >= 10, p: (s) => [s.tens, 10] },
  { id: 'strict', g: 'taste', i: '🧐', t: 'Строгий критик', d: 'Оценивай в среднем на 0,5 ниже мира (от 10 оценок)', ok: (s) => s.both >= 10 && s.diff <= -0.5 },
  { id: 'kind', g: 'taste', i: '🤗', t: 'Добрая душа', d: 'Оценивай в среднем на 0,7 выше мира (от 10 оценок)', ok: (s) => s.both >= 10 && s.diff >= 0.7 },
  { id: 'defender', g: 'taste', i: '🛡️', t: 'Защитник', d: 'Поставь 9 или 10 тому, у чего в мире ниже 7', ok: (s) => s.defender },
  { id: 'rebel', g: 'taste', i: '🔥', t: 'Против течения', d: 'Поставь 4 или ниже тому, у чего в мире 8,5 и выше', ok: (s) => s.rebel },
  { id: 'genres10', g: 'taste', i: '🌈', t: 'Всеядный', d: 'Оцени аниме 10 разных жанров', ok: (s) => s.genres >= 10, p: (s) => [s.genres, 10] },

  { id: 'decades5', g: 'era', i: '⏳', t: 'Путешественник во времени', d: 'Оцени аниме из 5 разных десятилетий', ok: (s) => s.decades >= 5, p: (s) => [s.decades, 5] },
  { id: 'oldschool', g: 'era', i: '📼', t: 'Старая школа', d: 'Оцени аниме, вышедшее до 1990 года', ok: (s) => s.old },
  { id: 'movies10', g: 'era', i: '🎬', t: 'Киноман', d: 'Оцени 10 аниме-фильмов', ok: (s) => s.movies >= 10, p: (s) => [s.movies, 10] },
  { id: 'fan', g: 'era', i: '🧩', t: 'Фанат серии', d: 'Оцени 5 частей одной серии', ok: (s) => s.bestSeries >= 5, p: (s) => [s.bestSeries, 5] },

  { id: 'night', g: 'secret', i: '🦉', t: 'Ночная сова', d: 'Оценивай аниме глубокой ночью (с 2 до 5 часов)', ok: (s) => s.night },
  { id: 'dropper', g: 'secret', i: '🗑️', t: 'Не моё', d: 'Брось 10 аниме', ok: (s) => s.dropped >= 10 },
  { id: 'planner', g: 'secret', i: '📝', t: 'Когда-нибудь посмотрю', d: '30 аниме в «В планах»', ok: (s) => s.planned >= 30 },
  { id: 'renamer', g: 'secret', i: '✏️', t: 'Свои правила', d: 'Переименуй тир', ok: (s) => s.renamed },
];
const ACH_GROUPS = [['count', 'За количество'], ['taste', 'За вкус'], ['era', 'Эпохи и типы'], ['secret', 'Секретные']];

// Рамки: need — какое достижение открывает (нет — доступна сразу); b — значок в углу
const FRAMES = [
  { id: '', t: 'Без рамки' },
  { id: 'pink', t: 'Розовая' },
  { id: 'violet', t: 'Аметист' },
  { id: 'mint', t: 'Мята' },
  { id: 'gold', t: 'Золото', need: 'rated50' },
  { id: 'stier', t: 'S-тир', need: 'master10', b: 'S' },
  { id: 'sakura', t: 'Сакура', need: 'genres10', b: '🌸' },
  { id: 'ice', t: 'Лёд', need: 'strict', b: '❄️' },
  { id: 'fire', t: 'Пламя', need: 'eps1000', b: '🔥' },
  { id: 'retro', t: 'Ретро', need: 'oldschool', b: '📼' },
  { id: 'neon', t: 'Неон', need: 'rated100' },
  { id: 'moon', t: 'Луна', need: 'night', b: '🌙' },
  { id: 'crown', t: 'Корона', need: 'rated500', b: '👑' },
];
const frameById = (id) => FRAMES.find((f) => f.id === (id || '')) || FRAMES[0];
const frameOpen = (f, ach) => !f.need || !!(ach || db.ach || {})[f.need];

/* ---------- подсчёт по топу ---------- */
function achStats(d = db) {
  const recs = [...Object.values(d.items || {}), ...Object.values(d.franchises || {})];
  const rated = recs.filter((r) => r.score != null);
  const both = rated.filter((r) => r.anime?.score);
  const genres = new Set(), decades = new Set(), series = new Map();
  rated.forEach((r) => {
    (r.anime?.genres || []).forEach((g) => genres.add(g.id));
    if (r.anime?.year) decades.add(Math.floor(r.anime.year / 10));
  });
  Object.values(d.items || {}).forEach((r) => { const f = r.anime?.franchise; if (f && r.score != null) series.set(f, (series.get(f) || 0) + 1); });
  const tierOf = (r) => r.tier || (r.score == null ? null : r.score >= 10 ? 'S' : r.score >= 9 ? 'A' : r.score >= 8 ? 'B' : r.score >= 7 ? 'C' : r.score >= 5 ? 'D' : 'F');
  const tiers = new Set(recs.filter((r) => r.status !== 'not_watched').map(tierOf).filter((t) => t && t !== 'nw'));
  return {
    rated: rated.length,
    tens: rated.filter((r) => r.score === 10).length,
    both: both.length,
    diff: both.length ? both.reduce((s, r) => s + r.score - r.anime.score, 0) / both.length : 0,
    defender: rated.some((r) => r.score >= 9 && r.anime?.score && r.anime.score < 7),
    rebel: rated.some((r) => r.score <= 4 && r.anime?.score >= 8.5),
    genres: genres.size, decades: decades.size,
    old: rated.some((r) => r.anime?.year && r.anime.year < 1990),
    movies: rated.filter((r) => r.anime?.kind === 'movie').length,
    bestSeries: Math.max(0, ...series.values()),
    tiersFilled: tiers.size,
    eps: Object.values(d.items || {}).filter((r) => r.status === 'completed').reduce((s, r) => s + (r.anime?.episodes || 0), 0),
    dropped: recs.filter((r) => r.status === 'dropped').length,
    planned: recs.filter((r) => r.status === 'planned').length,
    renamed: d === db && Object.keys(tierNames || {}).length > 0,
    night: d === db && (() => { const h = new Date().getHours(); return h >= 2 && h < 5 && rated.length > 0; })(),
  };
}

/* ---------- выдача ---------- */
let achReady = false;
function checkAch(quiet) {
  if (window.VIEWING) return;
  const s = achStats();
  const got = (db.ach ||= {});
  const fresh = ACH.filter((a) => !got[a.id] && a.ok(s));
  if (!fresh.length) return;
  const now = Date.now();
  fresh.forEach((a) => (got[a.id] = now));
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch {}
  if (typeof onDbSaved === 'function') onDbSaved(); else setPref('syncDirty', '1'); // аккаунт ещё не загрузился — дошлём
  if (!quiet && achReady) fresh.slice(0, 3).forEach((a, k) => setTimeout(() => achToast(a), k * 2600));
}
function achToast(a) {
  const frame = FRAMES.find((f) => f.need === a.id);
  toast(`${a.i} ${tr('Достижение')}: ${tr(a.t)}${frame ? ` · ${tr('новая рамка «{f}»', { f: tr(frame.t) })}` : ''}`);
}

/* ---------- показ ---------- */
// полка достижений; ach — полученные { id: время }, own — свой ли топ (у своего видно прогресс)
function achShelfHTML(ach, own, stats) {
  ach ||= {};
  const n = ACH.filter((a) => ach[a.id]).length;
  return `<div class="ach-shelf">
    <div class="ach-sum"><b>${n}</b> ${tr('из')} ${ACH.length} · ${tr('рамок открыто')}: <b>${FRAMES.filter((f) => frameOpen(f, ach)).length}</b> ${tr('из')} ${FRAMES.length}</div>
    ${ACH_GROUPS.map(([g, title]) => `<div class="ach-group"><h4>${tr(title)}</h4><div class="ach-grid">${ACH.filter((a) => a.g === g).map((a) => {
      const has = !!ach[a.id], hidden = g === 'secret' && !has;
      const pr = !has && own && a.p && stats ? a.p(stats) : null;
      const frame = FRAMES.find((f) => f.need === a.id);
      const tip = hidden ? tr('Секретное достижение') : `${tr(a.d)}${has ? ` · ${tr('получено')} ${new Date(ach[a.id]).toLocaleDateString(LOCALE)}` : ''}${frame ? ` · ${tr('рамка «{f}»', { f: tr(frame.t) })}` : ''}`;
      return `<div class="ach ${has ? 'on' : ''}" title="${esc(tip)}">
        <span class="ach-i">${hidden ? '❔' : a.i}</span>
        <span class="ach-t">${hidden ? '???' : esc(tr(a.t))}</span>
        <small>${hidden ? esc(tr('Секретное')) : esc(tr(a.d))}</small>
        ${pr ? `<span class="ach-bar"><i style="width:${Math.min(100, (pr[0] / pr[1]) * 100)}%"></i></span><small class="ach-n">${Math.min(pr[0], pr[1])} / ${pr[1]}</small>` : ''}
        ${frame && !hidden ? `<span class="ach-frame" title="${esc(tr('рамка «{f}»', { f: tr(frame.t) }))}">${frameRing(frame.id)}</span>` : ''}
      </div>`;
    }).join('')}</div></div>`).join('')}
  </div>`;
}
// маленький кружок-образец рамки
const frameRing = (id) => `<span class="ava-wrap fr-${id || 'none'} xs"><span class="ring-dot"></span></span>`;
// обернуть аватарку в рамку
function framed(inner, frame, size = '') {
  const f = frameById(frame);
  if (!f.id) return inner;
  return `<span class="ava-wrap fr-${f.id} ${size}">${inner}${f.b ? `<i class="fr-badge">${f.b}</i>` : ''}</span>`;
}
checkAch(true); achReady = true;
