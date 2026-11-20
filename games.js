'use strict';
/* Игры (2026-11-18): «Угадай опенинг» (фрагмент песни, animethemes) и «Угадай аниме» (кадр, Shikimori).
   Аниме — из своего топа или популярные; секунды на раунд выбираются; 10 раундов, 4 варианта ответа. */
Object.assign(EN, {
  'Игры': 'Games', 'Угадай опенинг': 'Guess the opening', 'Угадай аниме': 'Guess the anime',
  'Играет кусочек опенинга или эндинга — угадай аниме.': 'A piece of an opening or ending plays — guess the anime.',
  'Показывается кадр из серии — угадай аниме.': 'A frame from an episode is shown — guess the anime.',
  'Аниме': 'Anime', 'Из моего топа': 'From my top', 'Популярные': 'Popular', 'Секунд': 'Seconds', 'Откуда играет': 'Start from',
  'С начала': 'Beginning', 'Случайный момент': 'Random moment', 'Играть': 'Play', 'Лучший счёт: {n}': 'Best score: {n}',
  'Раунд {a} из {b}': 'Round {a} of {b}', 'Очки: {n}': 'Score: {n}', 'Слушать ещё раз': 'Listen again', 'Ещё кадр': 'Another frame',
  'Дальше': 'Next', 'Верно!': 'Correct!', 'Мимо': 'Wrong', 'Время вышло': 'Time is up', 'Это было: {t}': 'It was: {t}',
  'Игра окончена': 'Game over', 'Правильно {a} из {b}': '{a} of {b} correct', 'Новый рекорд!': 'New record!', 'Ещё раз': 'Play again', 'К играм': 'Back to games',
  'Готовлю игру…': 'Preparing the game…', 'Мало аниме для игры — нужно хотя бы 4 разных. Оцени больше аниме или выбери «Популярные».': 'Not enough anime — at least 4 are needed. Rate more anime or choose “Popular”.',
  'Не получилось загрузить игру. Проверь интернет.': "Couldn't load the game. Check your connection.", 'Нажми, чтобы включить звук': 'Tap to play the sound', 'Загружаю…': 'Loading…',
});
$('.nav-btn[data-view="games"] span').textContent = tr('Игры');

const GM_ROUNDS = 10;
// Shikimori иногда отказывает на частые запросы — повторяем с паузой (impGql из import.js)
const gmGql = (q) => (typeof impGql === 'function' ? impGql(q) : gql(q));
const gm = { kind: null, src: pref('gmSrc', 'mine'), sec: +pref('gmSec', '10') || 10, start: pref('gmStart', 'begin'), rounds: [], i: 0, score: 0, right: 0, t0: 0, timer: 0, answered: false, shots: 1, pool: null };
const gmBox = $('#view-games');
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- пул аниме ---------- */
// из моего топа: серии и аниме, как в «Рейтинге»; популярные — топ Shikimori по популярности
async function gmPool(src) {
  if (src === 'mine') return thSources().map((s) => ({ id: s.id, title: tn(s.anime), anime: s.anime, parts: s.parts.map((p) => p.id), fr: s.fr, franchise: s.franchise }));
  const d = await gmGql(`{ animes(order: popularity, kind: "tv", limit: 50, status: "released") { ${LIGHT} } }`);
  // одно аниме на серию — иначе варианты «Атака титанов» и «Атака титанов 2» путают
  const seen = new Set();
  return d.animes.filter((a) => { const k = a.franchise || a.id; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((a) => ({ id: String(a.id), title: tn(a), anime: snapshot(a), parts: [String(a.id)] }));
}
function gmOptions(pool, right) {
  const others = shuffle(pool.filter((p) => p.title !== right.title)).slice(0, 3);
  return shuffle([right, ...others]);
}
async function gmPrepare() {
  const pool = await gmPool(gm.src);
  const uniq = new Map(pool.map((p) => [p.title, p]));
  if (uniq.size < 4) throw new Error('few');
  const list = [...uniq.values()];
  if (gm.kind === 'op') {
    // темы с аудио: из кэша раздела «Опенинги», недостающее догружаем
    if (gm.src === 'mine' && thSources().some((s) => s.parts.some((p) => !thFresh(p.id)))) await thLoad();
    const need = list.flatMap((p) => p.parts).filter((id) => !thFresh(id));
    for (let i = 0; i < need.length; i += 12) await thFetch(need.slice(i, i + 12));
    thSaveCache();
    const themes = shuffle(list.flatMap((p) => p.parts.flatMap((id) => (thCache[id]?.list || []).filter((t) => t.audio).map((t) => ({ t, p })))));
    const used = new Set(), rounds = [];
    for (const x of themes) { if (rounds.length >= GM_ROUNDS) break; if (used.has(x.t.k)) continue; used.add(x.t.k); rounds.push({ ...x, opts: gmOptions(list, x.p) }); }
    if (rounds.length < 3) throw new Error('few');
    return rounds;
  }
  // угадай аниме: кадры с Shikimori
  const pick = shuffle(list.slice()).slice(0, GM_ROUNDS + 4);
  const ids = pick.map((p) => p.parts[Math.floor(Math.random() * Math.min(p.parts.length, 3))] || p.id);
  const d = await gmGql(`{ animes(ids: ${JSON.stringify(ids.join(','))}, limit: 50) { id screenshots { originalUrl x332Url } } }`);
  const shots = new Map(d.animes.map((a) => [String(a.id), shuffle((a.screenshots || []).map((s) => ({ big: s.originalUrl || s.x332Url, small: s.x332Url || s.originalUrl })))]));
  const rounds = pick.map((p, i) => ({ p, shots: (shots.get(String(ids[i])) || []).slice(0, 3), opts: gmOptions(list, p) })).filter((r) => r.shots.length).slice(0, GM_ROUNDS);
  if (rounds.length < 3) throw new Error('few');
  return rounds;
}

/* ---------- экраны ---------- */
const gmBest = (kind) => +pref('gmBest_' + kind, '0') || 0;
function gmMenu() {
  gmStopAudio(); clearInterval(gm.timer);
  const seg = (name, cur, opts) => `<div class="set-seg gm-seg">${opts.map(([v, l]) => `<button type="button" data-gmset="${name}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${tr(l)}</button>`).join('')}</div>`;
  const card = (kind, ic, title, desc) => `<button type="button" class="gm-card ${gm.kind === kind ? 'on' : ''}" data-gmkind="${kind}"><span class="gm-ic">${icon(ic)}</span><b>${tr(title)}</b><small>${tr(desc)}</small><em>${tr('Лучший счёт: {n}', { n: gmBest(kind) })}</em></button>`;
  gmBox.innerHTML = `<div class="view-head"><div><h1>${tr('Игры')}</h1></div></div>
    <div class="gm-cards">${card('op', 'music', 'Угадай опенинг', 'Играет кусочек опенинга или эндинга — угадай аниме.')}${card('anime', 'compass', 'Угадай аниме', 'Показывается кадр из серии — угадай аниме.')}</div>
    <div class="gm-set">
      <div class="set-sec"><h3>${tr('Аниме')}</h3>${seg('src', gm.src, [['mine', 'Из моего топа'], ['pop', 'Популярные']])}</div>
      <div class="set-sec"><h3>${tr('Секунд')}</h3>${seg('sec', gm.sec, [[5, '5'], [10, '10'], [15, '15'], [20, '20']])}</div>
      ${gm.kind !== 'anime' ? `<div class="set-sec"><h3>${tr('Откуда играет')}</h3>${seg('start', gm.start, [['begin', 'С начала'], ['random', 'Случайный момент']])}</div>` : ''}
      <button type="button" class="btn primary wide gm-go" data-gmgo ${gm.kind ? '' : 'disabled'}>${icon('play')}<span>${tr('Играть')}</span></button>
      <p class="imp-status gm-msg" id="gmMsg"></p>
    </div>`;
}
async function gmStart() {
  $('#gmMsg').textContent = tr('Готовлю игру…');
  $('[data-gmgo]').disabled = true;
  try { gm.rounds = await gmPrepare(); }
  catch (e) { $('#gmMsg').textContent = e.message === 'few' ? tr('Мало аниме для игры — нужно хотя бы 4 разных. Оцени больше аниме или выбери «Популярные».') : tr('Не получилось загрузить игру. Проверь интернет.'); $('[data-gmgo]').disabled = false; return; }
  gm.i = 0; gm.score = 0; gm.right = 0;
  gmPreload(0); gmPreload(1);
  gmRound();
}
let gmAudio = null;
function gmStopAudio() { if (gmAudio) { gmAudio.pause(); gmAudio.removeAttribute('src'); gmAudio.load(); gmAudio = null; } }
// заранее загрузить раунд: песню (браузер качает начало файла) или кадры — чтобы раунд начинался сразу
function gmPreload(i) {
  const r = gm.rounds[i];
  if (!r || r.pre) return;
  r.pre = true;
  if (gm.kind === 'op') { const a = new Audio(); a.preload = 'auto'; a.src = r.t.audio; a.load(); r.el = a; if (gm.start !== 'random') gmLead(r); }
  // только маленький первый кадр (~30 КБ): большие картинки разом забивают канал, и всё грузится медленно
  else { const im = new Image(); im.src = r.shots[0].small; r.el = im; }
}
// кадр: сначала маленький, потом подменяется на большой (gmSharpen)
const gmShot = (s) => `<img src="${esc(s.small)}" data-big="${esc(s.big)}" alt="">`;
function gmSharpen(box) {
  box?.querySelectorAll('img[data-big]').forEach((img) => {
    const big = new Image();
    big.onload = () => { if (img.isConnected) img.src = big.src; };
    big.src = img.dataset.big; img.removeAttribute('data-big');
  });
}
// 20.11: в начале файлов animethemes 0,5–1,5 с тишины — из-за неё казалось, что звук появляется не сразу.
// Сервер AniTier отдаёт первые ~3 с файла (у animethemes нет CORS), находим первый громкий отсчёт и играем с него.
const GM_LEAD = 0.45; // если узнать не вышло: обычно тишины ~0,5 с
function gmLead(r) {
  if (r.leadP) return r.leadP;
  const f = (r.t.audio.match(/^https:\/\/a\.animethemes\.moe\/([A-Za-z0-9._-]+\.ogg)$/) || [])[1];
  r.leadP = !f || typeof API_BASE === 'undefined' || typeof OfflineAudioContext === 'undefined' ? Promise.resolve(null) : (async () => {
    try {
      const res = await fetch(API_BASE + '/api/audiohead?f=' + encodeURIComponent(f));
      if (!res.ok) return null;
      const buf = await new OfflineAudioContext(1, 1, 22050).decodeAudioData(await res.arrayBuffer());
      const d = buf.getChannelData(0);
      let i = 0;
      while (i < d.length && Math.abs(d[i]) < 0.02) i++;
      return i >= d.length ? null : Math.max(0, i / buf.sampleRate - 0.08);
    } catch { return null; }
  })();
  return r.leadP;
}
// таймер раунда стартует, когда реально пошёл звук или показался кадр, а не когда открылся раунд
function gmGo() {
  if (gm.t0 || gm.answered) return;
  gm.t0 = Date.now();
  $('#gmStage')?.classList.remove('wait');
}
function gmPlayClip() {
  const r = gm.rounds[gm.i];
  if (gmAudio && gmAudio !== r.el) gmStopAudio();
  gmAudio = r.el || (r.el = Object.assign(new Audio(), { preload: 'auto', src: r.t.audio }));
  gmAudio.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  const a = gmAudio;
  const begin = async () => {
    if (r.from == null) {
      if (gm.start === 'random' && a.duration > gm.sec + 5) r.from = Math.random() * (a.duration - gm.sec - 3);
      else { const lead = await Promise.race([gmLead(r), new Promise((ok) => setTimeout(() => ok(null), 1500))]); r.from = Math.min(lead ?? GM_LEAD, 3); }
    }
    if (gmAudio !== a) return; // пока ждали, раунд сменился
    try { gmAudio.currentTime = r.from; } catch {}
    const stopAt = r.from + gm.sec;
    gmAudio.ontimeupdate = () => { if (!gm.answered && gmAudio.currentTime >= stopAt) gmAudio.pause(); };
    gmAudio.addEventListener('playing', gmGo, { once: true });
    gmAudio.play().catch(() => { gmGo(); const b = $('#gmReplay'); if (b) b.textContent = tr('Нажми, чтобы включить звук'); });
  };
  if (gmAudio.readyState >= 1) begin(); else gmAudio.addEventListener('loadedmetadata', begin, { once: true });
}
function gmRound() {
  const r = gm.rounds[gm.i];
  gm.answered = false; gm.shots = 1; gm.t0 = 0;
  gmPreload(gm.i); gmPreload(gm.i + 1); gmPreload(gm.i + 2);
  const head = `<div class="gm-top"><span>${tr('Раунд {a} из {b}', { a: gm.i + 1, b: gm.rounds.length })}</span><b>${tr('Очки: {n}', { n: gm.score })}</b></div><div class="gm-bar"><i id="gmBar"></i></div>`;
  const stage = gm.kind === 'op'
    ? `<div class="gm-stage gm-audio wait" id="gmStage"><span class="gm-wait"><span class="th-spin"></span>${tr('Загружаю…')}</span><div class="gm-eq">${Array.from({ length: 9 }, (_, i) => `<i style="animation-delay:${-i * 0.13}s"></i>`).join('')}</div><button type="button" class="btn" id="gmReplay">${icon('play')}<span>${tr('Слушать ещё раз')}</span></button></div>`
    : `<div class="gm-stage gm-shots wait" id="gmStage"><span class="gm-wait"><span class="th-spin"></span>${tr('Загружаю…')}</span><div class="gm-shotbox" id="gmShots">${gmShot(r.shots[0])}</div></div>${r.shots.length > 1 ? `<button type="button" class="link gm-more" id="gmMore">${tr('Ещё кадр')}</button>` : ''}`;
  gmBox.innerHTML = `<div class="gm-play">${head}${stage}<div class="gm-opts">${r.opts.map((o, i) => `<button type="button" class="gm-opt" data-gmans="${i}"><img loading="lazy" src="${esc(o.anime.poster || '')}" alt=""><span>${esc(o.title)}</span></button>`).join('')}</div><div id="gmAfter"></div></div>`;
  if (gm.kind === 'op') gmPlayClip();
  else {
    // сначала маленький кадр (грузится мгновенно), потом подменяем на большой
    const img = $('#gmShots img');
    if (img.complete && img.naturalWidth) gmGo(); else { img.addEventListener('load', gmGo, { once: true }); img.addEventListener('error', gmGo, { once: true }); }
    gmSharpen($('#gmShots'));
  }
  setTimeout(gmGo, 12000); // если совсем не грузится — всё равно запускаем время
  // время: в опенинге — пока играет кусок (+5 с на ответ), в «Угадай аниме» — на ответ
  const total = (gm.kind === 'op' ? gm.sec + 5 : gm.sec) * 1000;
  clearInterval(gm.timer);
  gm.timer = setInterval(() => {
    if (!gm.t0) return;
    const left = Math.max(0, 1 - (Date.now() - gm.t0) / total);
    const bar = $('#gmBar'); if (bar) bar.style.width = left * 100 + '%';
    if (left <= 0) gmAnswer(-1);
  }, 100);
}
function gmAnswer(i) {
  if (gm.answered) return;
  gm.answered = true; clearInterval(gm.timer);
  const r = gm.rounds[gm.i], right = r.opts.findIndex((o) => o.title === r.p.title);
  const ok = i === right;
  if (ok) {
    const total = (gm.kind === 'op' ? gm.sec + 5 : gm.sec) * 1000, left = gm.t0 ? Math.max(0, 1 - (Date.now() - gm.t0) / total) : 1;
    gm.score += Math.round(50 + 50 * left - (gm.shots - 1) * 15); gm.right++;
  }
  $$('.gm-opt').forEach((b, k) => { b.disabled = true; b.classList.toggle('right', k === right); b.classList.toggle('wrong', k === i && !ok); });
  if (gm.kind === 'op' && gmAudio) { gmAudio.ontimeupdate = null; gmAudio.play().catch(() => {}); } // после ответа — слушаем дальше
  $('#gmStage')?.classList.remove('wait');
  if (gm.kind === 'anime') { const box = $('#gmShots'); if (box) { const have = box.querySelectorAll('img').length; box.insertAdjacentHTML('beforeend', r.shots.slice(have).map(gmShot).join('')); gmSharpen(box); } $('#gmMore')?.remove(); }
  const what = gm.kind === 'op' ? `${r.t.type}${r.t.seq} «${r.t.song}»${r.t.artists ? ' — ' + r.t.artists : ''}` : '';
  $('#gmAfter').innerHTML = `<div class="gm-res ${ok ? 'ok' : 'bad'}"><b>${ok ? tr('Верно!') : i < 0 ? tr('Время вышло') : tr('Мимо')}</b><span>${tr('Это было: {t}', { t: esc(r.p.title) })}${what ? ` · ${esc(what)}` : ''}</span></div>
    <button type="button" class="btn primary wide" data-gmnext>${tr('Дальше')}</button>`;
}
function gmEnd() {
  gmStopAudio();
  gm.rounds.forEach((r) => { if (r.el?.load) { r.el.removeAttribute('src'); r.el.load(); } r.el = null; });
  const best = gmBest(gm.kind), rec = gm.score > best;
  if (rec) setPref('gmBest_' + gm.kind, String(gm.score));
  gmBox.innerHTML = `<div class="gm-play gm-end"><h2>${tr('Игра окончена')}</h2><div class="gm-big">${gm.score}</div><p>${tr('Правильно {a} из {b}', { a: gm.right, b: gm.rounds.length })}${rec ? ` · <b class="gm-rec">${tr('Новый рекорд!')}</b>` : ` · ${tr('Лучший счёт: {n}', { n: best })}`}</p>
    <div class="gm-end-btns"><button type="button" class="btn primary" data-gmgo>${tr('Ещё раз')}</button><button type="button" class="btn" data-gmmenu>${tr('К играм')}</button></div></div>`;
}
gmBox.addEventListener('click', (e) => {
  const k = e.target.closest('[data-gmkind]');
  if (k) { gm.kind = k.dataset.gmkind; gmMenu(); return; }
  const s = e.target.closest('[data-gmset]');
  if (s) { const n = s.dataset.gmset, v = s.dataset.v; gm[n] = n === 'sec' ? +v : v; setPref('gm' + n[0].toUpperCase() + n.slice(1), v); gmMenu(); return; }
  if (e.target.closest('[data-gmgo]')) { if ($('.gm-end')) { gm.i = 0; gm.score = 0; gm.right = 0; gmMenu(); gmStart(); } else gmStart(); return; }
  if (e.target.closest('[data-gmmenu]')) { gmMenu(); return; }
  const a = e.target.closest('[data-gmans]');
  if (a) { gmAnswer(+a.dataset.gmans); return; }
  if (e.target.closest('[data-gmnext]')) { gmStopAudio(); const done = gm.rounds[gm.i]; if (done) done.el = null; gm.i++; if (gm.i >= gm.rounds.length) gmEnd(); else gmRound(); return; }
  if (e.target.closest('#gmReplay')) { gm.rounds[gm.i].from = gm.rounds[gm.i].from ?? 0; gmPlayClip(); return; }
  if (e.target.closest('#gmMore')) {
    const r = gm.rounds[gm.i];
    if (gm.shots < r.shots.length) { $('#gmShots').insertAdjacentHTML('beforeend', gmShot(r.shots[gm.shots])); gmSharpen($('#gmShots')); gm.shots++; }
    if (gm.shots >= r.shots.length) $('#gmMore')?.remove();
  }
});
function gmShowView() { if (!gmBox.innerHTML.trim() || !gm.rounds.length || $('.gm-end')) gmMenu(); }
// ушёл с вкладки — звук стоп
{
  const base = show;
  show = function (v, ...rest) { if (v !== 'games') { gmStopAudio(); clearInterval(gm.timer); } return base.call(this, v, ...rest); };
}
if (view === 'games') gmShowView();
