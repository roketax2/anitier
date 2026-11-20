'use strict';
/* Саундтреки (2026-11-20): тир-лист музыки из аниме (OST — фоновая музыка, не опенинги).
   Альбомы и 30-секундные отрывки — iTunes Search API (японский магазин, разрешает запросы с сайта; ~20 запросов в минуту,
   поэтому ищем только когда раскрыли аниме). Оценки: db.osts[id трека] = { score, added, updated, t: снимок } — синхронизируются. */
Object.assign(EN, {
  'Музыка': 'Music', 'Саундтреки': 'Soundtracks', 'Опенинги и эндинги': 'Openings & endings',
  'Музыка из аниме — фоновые мелодии из альбомов-саундтреков. Слушай отрывок и оценивай.': 'Background music from anime soundtrack albums. Listen to a clip and rate it.',
  'Нажми, чтобы найти саундтрек': 'Tap to find the soundtrack', 'Ищу саундтрек…': 'Looking for the soundtrack…', 'альбомов — {n}': '{n} albums',
  'Саундтрек не нашёлся': 'No soundtrack found', 'Загружаю треки…': 'Loading tracks…', 'треков — {n}': '{n} tracks',
  'Показать все ({n})': 'Show all ({n})', 'Не получилось загрузить. Попробуй чуть позже.': "Couldn't load. Try a bit later.",
  'Оцени трек — он появится здесь.': 'Rate a track — it will show up here.', 'Найди трек или аниме': 'Find a track or anime',
  'Здесь появится музыка аниме из твоего топа.': 'Music of the anime in your top will show up here.', 'Саундтреки {l}': '{l}’s soundtracks',
  'Отрывки и альбомы — iTunes': 'Clips and albums — iTunes', 'Абсолютный пик': 'Absolute peak', 'Пик': 'Peak', 'Лучшее из лучшего — выше S': 'The best of the best — above S', 'Слушать': 'Listen', 'Пауза': 'Pause',
});
$('.nav-btn[data-view="themes"] span').textContent = tr('Музыка');
document.body.querySelector('#view-themes .view-head').insertAdjacentHTML('afterend', `<div class="th-seg mu-sw"><button type="button" class="on" data-musw="themes">${tr('Опенинги')}</button><button type="button" data-musw="ost">${tr('Саундтреки')}</button></div>`);
$('#view-chars').insertAdjacentHTML('afterend', `<main id="view-ost" class="view" hidden>
  <div class="view-head">
    <div><h1>${tr('Саундтреки')}</h1><p class="stats" id="osStats"></p></div>
    <div class="head-actions"><div class="seg" id="osSeg" role="tablist">
      <button data-osmode="anime" role="tab">${icon('music')}<span>${tr('По аниме')}</span></button>
      <button data-osmode="list" role="tab">${icon('tiers')}<span>${tr('Мой тир-лист')}</span></button>
    </div></div>
  </div>
  <div class="th-seg mu-sw"><button type="button" data-musw="themes">${tr('Опенинги')}</button><button type="button" class="on" data-musw="ost">${tr('Саундтреки')}</button></div>
  <div class="tools" id="osTools"><label class="search">${icon('search')}<input id="osSearch" type="search" placeholder="${tr('Найди трек или аниме')}" autocomplete="off" enterkeyhint="search"><button class="clear" type="button" aria-label="${tr('Закрыть')}" hidden>${icon('x')}</button></label></div>
  <div id="osBody"></div>
</main>`);
document.addEventListener('click', (e) => { const b = e.target.closest('[data-musw]'); if (b && view !== b.dataset.musw) show(b.dataset.musw); });

const OS_KEY = 'animetop.ost1', OS_TTL = 30 * 864e5, OS_SHOW = 30;
const OSS = () => (db.osts ||= {});
const os = { mode: pref('osMode', 'anime') === 'list' ? 'list' : 'anime', q: '', open: new Set(), al: {}, all: new Set(), busy: {}, err: {}, cur: null };
let osCache = {};
try { osCache = JSON.parse(localStorage.getItem(OS_KEY) || '{}') || {}; } catch {}
// списки альбомов — до 300 аниме, треки — до 40 альбомов (их много весят)
const osSaveCache = () => {
  const e = Object.entries(osCache).sort((a, b) => b[1].at - a[1].at);
  const keep = [...e.filter(([k]) => !k.startsWith('al:')).slice(0, 300), ...e.filter(([k]) => k.startsWith('al:')).slice(0, 40)];
  try { localStorage.setItem(OS_KEY, JSON.stringify(Object.fromEntries(keep))); } catch {}
};
const osFresh = (k) => osCache[k] && Date.now() - osCache[k].at < OS_TTL;
const osRO = () => !!window.VIEWING;
const osScore = (r) => (r ? r.score ?? null : null);

// iTunes: не чаще раза в 3 секунды (лимит ~20 запросов в минуту)
let osGate = Promise.resolve(), osLast = 0;
function osItunes(path) {
  const run = async () => {
    const wait = osLast + 3000 - Date.now();
    if (wait > 0) await new Promise((ok) => setTimeout(ok, wait));
    osLast = Date.now();
    // 20.11: сервер Apple иногда отдаёт для конкретного адреса закэшированный ответ без CORS — тогда повторяем с лишним параметром
    let err;
    for (const tail of ['', '&_=' + Math.floor(Date.now() / 36e5), '&_=' + Date.now()]) {
      try {
        const r = await fetch('https://itunes.apple.com/' + path + tail);
        if (r.ok) return await r.json();
        err = new Error('itunes ' + r.status);
      } catch (e) { err = e; }
      await new Promise((ok) => setTimeout(ok, 800));
    }
    throw err;
  };
  const p = osGate.then(run, run);
  osGate = p.catch(() => {});
  return p;
}
const osNorm = (s) => (s || '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');
const OS_KW = /サウンドトラック|サントラ|soundtrack|\bost\b|オリジナル・?サウンド|music collection|ミュージックコレクション|bgm/i;
const OS_BAD = /cover|piano|lofi|lo-fi|8-?bit|music box|オルゴール|karaoke|tribute|remix|instrumental covers|- single$/i;
const osArt = (u, n = 300) => (u || '').replace(/\/\d+x\d+bb\./, `/${n}x${n}bb.`);

// альбомы-саундтреки аниме: ищем по японскому названию, если мало — по английскому
async function osLoadAnime(s) {
  const id = s.id;
  if (os.busy[id] || osFresh(id)) return;
  os.busy[id] = true; os.err[id] = false; osRender();
  try {
    let jp = osCache['jp:' + id]?.v;
    if (jp == null) {
      const d = await impGql(`{ animes(ids: ${JSON.stringify(String(s.anime.id || id))}) { id japanese } }`);
      jp = d.animes?.[0]?.japanese || '';
      osCache['jp:' + id] = { at: Date.now(), v: jp };
    }
    const names = [jp, s.anime.english, s.anime.name].map(osNorm).filter((n) => n.length >= 2);
    const okAlbum = (a) => a.collectionType === 'Album' && OS_KW.test(a.collectionName) && !OS_BAD.test(a.collectionName) && names.some((n) => osNorm(a.collectionName).includes(n));
    const found = new Map();
    const search = async (term) => {
      const d = await osItunes(`search?country=JP&entity=album&limit=25&term=${encodeURIComponent(term)}`);
      for (const a of d.results || []) if (okAlbum(a) && !found.has(a.collectionId)) found.set(a.collectionId, a);
    };
    if (jp) await search(jp + ' サウンドトラック');
    // и по английскому: часть альбомов (3-й сезон Re:Zero, «Киберпанк») подписана только по-английски
    if (s.anime.english || s.anime.name) await search((s.anime.english || s.anime.name) + ' soundtrack');
    const albums = [...found.values()].sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || '')).slice(0, 12)
      .map((a) => ({ id: String(a.collectionId), n: a.collectionName, ar: a.artistName, y: (a.releaseDate || '').slice(0, 4), img: a.artworkUrl100 || '', cnt: a.trackCount || 0 }));
    osCache[id] = { at: Date.now(), albums };
    osSaveCache();
  } catch { os.err[id] = true; }
  os.busy[id] = false; osRender();
}
async function osLoadAlbum(alId) {
  const k = 'al:' + alId;
  if (os.busy[k] || osFresh(k)) return;
  os.busy[k] = true; os.err[k] = false; osRender();
  try {
    const d = await osItunes(`lookup?id=${encodeURIComponent(alId)}&entity=song&country=JP&limit=200`);
    const tracks = (d.results || []).filter((t) => t.wrapperType === 'track' && t.previewUrl)
      .sort((a, b) => (a.discNumber || 1) - (b.discNumber || 1) || (a.trackNumber || 0) - (b.trackNumber || 0))
      .map((t) => ({ id: String(t.trackId), n: t.trackName, ar: t.artistName, no: t.trackNumber || 0, ms: t.trackTimeMillis || 0, prev: t.previewUrl, al: String(alId), aln: t.collectionName, img: t.artworkUrl100 || '' }));
    osCache[k] = { at: Date.now(), tracks };
    osSaveCache();
  } catch { os.err[k] = true; }
  os.busy[k] = false; osRender();
}

/* ---------- плеер: один отрывок за раз ---------- */
const osAudio = new Audio();
osAudio.preload = 'none';
const OS_PAUSE = '<svg viewBox="0 0 24 24" class="ic"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
function osSync() {
  $$('[data-osplay]').forEach((b) => {
    const on = b.dataset.osplay === os.cur && !osAudio.paused;
    b.classList.toggle('on', on);
    const ic = b.querySelector('.os-pi');
    if (ic) ic.innerHTML = on ? OS_PAUSE : thPlayIcon;
  });
}
function osPlay(t) {
  if (!t?.prev) return;
  if (os.cur === t.id && !osAudio.paused) { osAudio.pause(); return; }
  if (os.cur !== t.id) { os.cur = t.id; osAudio.src = t.prev; }
  osAudio.volume = Math.min(1, Math.max(0, +pref('thVol', '0.8')));
  osAudio.play().catch(() => {});
}
['play', 'pause', 'ended'].forEach((ev) => osAudio.addEventListener(ev, osSync));
function osStop() { osAudio.pause(); }

/* ---------- оценки ---------- */
const osSnap = (t, anime) => ({ id: t.id, n: t.n, ar: t.ar, prev: t.prev, al: t.al, aln: t.aln, img: t.img, anime });
function osRate(t, anime, score) {
  if (!t || osRO()) return;
  const now = Date.now(), old = OSS()[t.id];
  if (osScore(old) === score) { delete OSS()[t.id]; (db.deleted ||= {})['u:' + t.id] = now; }
  else { OSS()[t.id] = { ...(old || {}), score, added: old?.added || now, updated: now, t: osSnap(t, anime || old?.t?.anime) }; if (score !== 10) delete OSS()[t.id].peak; if (db.deleted) delete db.deleted['u:' + t.id]; }
  save();
}
// 20.11: «Абсолютный пик» — доп. отметка для треков на 10, в тир-листе отдельный ряд выше S
function osPeak(id) {
  const r = OSS()[id];
  if (!r || osRO() || osScore(r) !== 10) return;
  if (r.peak) delete r.peak; else r.peak = true;
  r.updated = Date.now();
  save();
}
const osPeakBtn = (id, on) => peakBtnHTML(`data-ospeak="${esc(id)}"`, on);
const osTime = (ms) => (ms ? `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, '0')}` : '');
const osPlayBtn = (t) => `<button type="button" class="os-play" data-osplay="${esc(t.id)}" aria-label="${tr('Слушать')}"><img src="${esc(t.img)}" alt="" loading="lazy"><span class="os-pi">${thPlayIcon}</span></button>`;

/* ---------- экран ---------- */
let osTracks = new Map(); // id → { t, anime } для кликов
function osRender() {
  const box = $('#view-ost');
  if (!box || box.hidden) return;
  const ro = osRO(), rated = OSS();
  if (ro) os.mode = 'list';
  $('#osSeg').hidden = ro; $('#view-ost .mu-sw').hidden = ro;
  $('#view-ost h1').textContent = ro ? tr('Саундтреки {l}', { l: window.VIEWING.login }) : tr('Саундтреки');
  $$('#osSeg [data-osmode]').forEach((b) => b.classList.toggle('on', b.dataset.osmode === os.mode));
  const nRated = Object.values(rated).filter((r) => osScore(r) != null).length;
  $('#osStats').textContent = [tr('оценено {n}', { n: nRated }), tr('Отрывки и альбомы — iTunes')].join(' · ');
  const body = $('#osBody'), q = os.q.toLowerCase();
  const empty = (h, p) => `<div class="empty-state small"><div class="empty-art">${icon('music')}</div><h2>${h}</h2><p>${p}</p></div>`;
  osTracks = new Map();
  for (const [id, r] of Object.entries(rated)) if (r.t) osTracks.set(id, { t: r.t, anime: r.t.anime });
  if (os.mode === 'anime') {
    const srcs = thSources().filter((s) => !q || tn(s.anime).toLowerCase().includes(q) || (osCache[s.id]?.albums || []).some((a) => a.n.toLowerCase().includes(q)));
    if (!thSources().length) { body.innerHTML = empty(tr('Сначала оцени аниме'), tr('Здесь появится музыка аниме из твоего топа.')); return; }
    if (!srcs.length) { body.innerHTML = empty(tr('Ничего не подходит'), tr('Попробуй другие фильтры.')); return; }
    body.innerHTML = `<p class="ch-seahint os-hint">${tr('Музыка из аниме — фоновые мелодии из альбомов-саундтреков. Слушай отрывок и оценивай.')}</p>` + srcs.map((s) => {
      const open = os.open.has(s.id), c = osCache[s.id], anime = { id: s.id, name: s.anime.name, russian: s.anime.russian, english: s.anime.english };
      const albums = c?.albums || [];
      const nr = Object.values(rated).filter((r) => r.t?.anime?.id === s.id && osScore(r) != null).length;
      const sub = os.busy[s.id] ? tr('Ищу саундтрек…') : c ? (albums.length ? tr('альбомов — {n}', { n: albums.length }) : tr('Саундтрек не нашёлся')) : tr('Нажми, чтобы найти саундтрек');
      let inner = '';
      if (open) {
        if (os.busy[s.id]) inner = `<p class="th-prog"><span class="th-spin"></span>${tr('Ищу саундтрек…')}</p>`;
        else if (os.err[s.id]) inner = `<p class="th-prog">${tr('Не получилось загрузить. Попробуй чуть позже.')} <button type="button" class="link" data-osretry="${esc(s.id)}">${tr('Попробовать снова')}</button></p>`;
        else if (c && !albums.length) inner = `<p class="th-prog">${tr('Саундтрек не нашёлся')}</p>`;
        else if (albums.length) {
          const alId = albums.some((a) => a.id === os.al[s.id]) ? os.al[s.id] : albums.reduce((m, x) => (x.cnt > m.cnt ? x : m)).id, k = 'al:' + alId, tc = osCache[k];
          if (!tc && !os.busy[k] && !os.err[k]) setTimeout(() => osLoadAlbum(alId));
          const tabs = albums.length > 1 ? `<div class="ch-sea os-als" role="tablist">${albums.map((a) => `<button type="button" role="tab" class="ch-sp ${a.id === alId ? 'on' : ''}" data-osal="${esc(a.id)}" data-g="${esc(s.id)}" title="${esc(a.n + ' · ' + a.ar)}"><img src="${esc(a.img)}" alt="" loading="lazy"><span>${esc(a.n.length > 40 ? a.n.slice(0, 39) + '…' : a.n)}${a.y ? ` · ${a.y}` : ''}</span></button>`).join('')}</div>` : `<p class="os-al1">${esc(albums[0].n)}${albums[0].y ? ' · ' + albums[0].y : ''}</p>`;
          let list = '';
          if (os.err[k]) list = `<p class="th-prog">${tr('Не получилось загрузить. Попробуй чуть позже.')} <button type="button" class="link" data-osretry="${esc(k)}">${tr('Попробовать снова')}</button></p>`;
          else if (!tc) list = `<p class="th-prog"><span class="th-spin"></span>${tr('Загружаю треки…')}</p>`;
          else {
            const tr_ = tc.tracks.filter((t) => !q || t.n.toLowerCase().includes(q) || tn(s.anime).toLowerCase().includes(q) || t.aln.toLowerCase().includes(q));
            const shown = os.all.has(k) || q ? tr_ : tr_.slice(0, OS_SHOW);
            for (const t of tc.tracks) osTracks.set(t.id, { t, anime });
            list = shown.map((t) => {
              const my = osScore(rated[t.id]);
              return `<div class="th-row os-row" data-tid="${esc(t.id)}">${osPlayBtn(t)}<div class="th-info" data-osplay="${esc(t.id)}"><b>${esc(t.n)}</b><span>${t.no ? t.no + '. ' : ''}${esc(t.ar)}${t.ms ? ' · ' + osTime(t.ms) : ''}</span></div>${chScoreRow(my, 'data-osrate')}${my === 10 ? osPeakBtn(t.id, rated[t.id]?.peak) : ''}</div>`;
            }).join('') + (shown.length < tr_.length ? `<button type="button" class="btn os-more" data-osall="${esc(k)}">${tr('Показать все ({n})', { n: tr_.length })}</button>` : '');
          }
          inner = tabs + list;
        }
      }
      return `<section class="th-group ${open ? 'open' : ''}"><button type="button" class="th-ghead" data-osg="${esc(s.id)}"><img loading="lazy" src="${esc(s.anime.poster || '')}" alt=""><span class="th-gt"><b>${esc(tn(s.anime))}</b><small>${sub}${nr ? ' · ' + tr('оценено {n}', { n: nr }) : ''}</small></span>${s.score != null ? `<span class="th-gs">${tr('моя {n}', { n: s.score })}</span>` : ''}<span class="th-chev">${icon('chev')}</span></button>${open ? `<div class="th-gbody">${inner}</div>` : ''}</section>`;
    }).join('');
    osSync();
    return;
  }
  const items = Object.entries(rated).map(([id, r]) => ({ id, score: osScore(r), peak: !!r.peak && osScore(r) === 10, at: r.updated || r.added, t: r.t || {} }))
    .filter((x) => x.score != null && (!q || `${x.t.n} ${x.t.aln} ${x.t.anime ? tn(x.t.anime) : ''}`.toLowerCase().includes(q)));
  if (!items.length) { body.innerHTML = empty(tr('Тир-лист пока пуст'), ro ? '' : tr('Оцени трек — он появится здесь.')); return; }
  const rows = items.some((c) => c.peak) ? [{ ...PEAK, peak: true }, ...TIERS] : TIERS;
  body.innerHTML = `<div class="th-board">${rows.map((x) => {
    const row = items.filter((c) => (x.peak ? c.peak : !c.peak && thTierOf(c.score) === x.t)).sort((a, b) => b.score - a.score || a.at - b.at);
    return `<div class="th-trow ${x.peak ? 'peakrow' : ''}"><div class="th-tl" style="--c:${x.c}" ${x.peak ? `title="${tr('Абсолютный пик')}"` : ''}><b>${x.peak ? peakLabelHTML() : esc((!ro && tierNames[x.t]?.name) || x.t)}</b></div><div class="th-items ch-items">${row.map((c) => `<button type="button" class="ch-chip os-chip" data-osplay="${esc(c.id)}" title="${esc(c.t.n + (c.t.anime ? ' · ' + tn(c.t.anime) : ''))}"><img loading="lazy" src="${esc(osArt(c.t.img, 200))}" alt=""><span class="os-pi">${thPlayIcon}</span><span class="os-cn">${esc(c.t.n)}</span>${c.t.anime ? `<small class="ch-sl">${esc(tn(c.t.anime))}</small>` : ''}<i class="th-cs" style="--c:${x.c}">${c.score}</i></button>`).join('')}</div></div>`;
  }).join('')}</div>`;
  osSync();
}

$('#view-ost').addEventListener('click', (e) => {
  const m = e.target.closest('[data-osmode]');
  if (m) { os.mode = m.dataset.osmode; setPref('osMode', os.mode); osRender(); return; }
  const g = e.target.closest('[data-osg]');
  if (g) {
    const id = g.dataset.osg;
    if (os.open.has(id)) os.open.delete(id); else { os.open.add(id); const s = thSources().find((x) => x.id === id); if (s) osLoadAnime(s); }
    osRender(); return;
  }
  const al = e.target.closest('[data-osal]');
  if (al) { os.al[al.dataset.g] = al.dataset.osal; osRender(); return; }
  const re = e.target.closest('[data-osretry]');
  if (re) {
    const k = re.dataset.osretry;
    if (k.startsWith('al:')) { delete os.err[k]; osLoadAlbum(k.slice(3)); } else { const s = thSources().find((x) => x.id === k); if (s) osLoadAnime(s); }
    return;
  }
  const more = e.target.closest('[data-osall]');
  if (more) { os.all.add(more.dataset.osall); osRender(); return; }
  const r = e.target.closest('.os-row [data-osrate]');
  if (r) { const x = osTracks.get(r.closest('.os-row').dataset.tid); if (x) osRate(x.t, x.anime, +r.dataset.osrate); osRender(); return; }
  const pk = e.target.closest('[data-ospeak]');
  if (pk) { osPeak(pk.dataset.ospeak); osRender(); return; }
  const p = e.target.closest('[data-osplay]');
  if (p) { const x = osTracks.get(p.dataset.osplay); if (x) osPlay(x.t); }
});
let osSearchT = 0;
$('#osSearch').addEventListener('input', (e) => { clearTimeout(osSearchT); const v = e.target.value.trim(); $('#osTools .clear').hidden = !v; osSearchT = setTimeout(() => { os.q = v; osRender(); }, 200); });
$('#osTools .clear').addEventListener('click', () => { $('#osSearch').value = ''; $('#osTools .clear').hidden = true; os.q = ''; osRender(); });
{
  const base = afterChange;
  afterChange = function (...a) { const out = base.apply(this, a); if (view === 'ost') osRender(); return out; };
  const baseShow = show;
  show = function (v, ...rest) { if (v !== 'ost') osStop(); return baseShow.call(this, v, ...rest); };
}
function osShowView() { osRender(); }
if (view === 'ost') show('ost'); // раздел создаётся здесь, позже, чем app.js открыл сохранённую вкладку
