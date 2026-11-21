'use strict';
/* Персонажи (2026-11-18): тир-лист персонажей из аниме своего топа. Данные — Shikimori (characterRoles).
   Оценка 1–10, тир по оценке как в топе. db.chars[id] = { score, added, updated, c: снимок } — синхронизируются с аккаунтом. */
Object.assign(EN, {
  'Парни': 'Guys', 'Девушки': 'Girls', 'Пол': 'Gender', 'Узнаю пол персонажей…': 'Finding out characters’ gender…', 'Узнаю пол персонажей… {d} из {n}': 'Finding out characters’ gender… {d} of {n}',
  'Персонажи': 'Characters', 'Показать ещё {n}': 'Show {n} more', 'Показать всех ({n})': 'Show all ({n})', 'Главные': 'Main', 'Второстепенные': 'Supporting', 'главный': 'main', 'второстепенный': 'supporting',
  'Найди персонажа или аниме': 'Find a character or anime', 'Загружаю персонажей… {d} из {n}': 'Loading characters… {d} of {n}',
  'персонажей — {n}': '{n} characters', 'Персонажи {l}': '{l}’s characters', 'Оцени персонажа — он появится здесь.': 'Rate a character — they will show up here.',
  'Смотрит на твою оценку самого аниме': 'Uses your rating of the anime itself',
  'Здесь появятся персонажи аниме из твоего топа.': 'Characters of the anime in your top will show up here.',
  'Все сезоны': 'All seasons', 'Сезон {n}': 'Season {n}', 'По сезонам': 'By season', 'Общая': 'Overall', 'Общая оценка': 'Overall rating',
  'Общая оценка — за всё аниме целиком.': 'Overall rating is for the whole anime.', 'Оценки по сезонам — отдельный список для каждого сезона. Общая оценка от них не меняется. Свою картинку персонажа для сезона можно поставить в его карточке.': 'Season ratings are a separate list for each season. They don’t change the overall rating. You can set your own character picture for a season in the character card.',
  'Своя картинка': 'Own picture', 'Сменить картинку': 'Change picture', 'Загрузить картинку': 'Upload picture', 'Убрать': 'Remove', 'Ссылка на картинку': 'Picture link',
  'Твоя картинка персонажа для этого сезона. Видна в списке, тир-листе и друзьям по ссылке на топ.': 'Your picture of the character for this season. Shown in the list, the tier list and to friends.',
  'Картинка сохранена': 'Picture saved', 'Не получилось открыть картинку': 'Could not open the picture', 'Нужна ссылка https://…': 'Need an https://… link', 'Слишком много своих картинок — убери старые': 'Too many own pictures — remove some old ones',
  'общая {n}': 'overall {n}', 'Как менялся': 'How they changed', 'Оценка за сезон': 'Season rating', 'Оцени персонажа за этот сезон': 'Rate the character for this season',
});
$('.nav-btn[data-view="chars"] span').textContent = tr('Персонажи');
$('#view-chars h1').textContent = tr('Персонажи');
$$('#chSeg [data-chmode] span').forEach((s) => { s.textContent = tr(s.textContent); });
$('#chSearch').placeholder = tr('Найди персонажа или аниме');

// 19.11: второстепенные — самые обсуждаемые (комментарии к персонажу на Shikimori), из всех сезонов серии; раньше брались первые 12 по алфавиту
const CH_KEY = 'animetop.chars2', CH_TTL = 14 * 864e5, CH_PAGE = 60; // 20.11: берём ВСЕХ персонажей, в списке показываем по 60 (у One Piece их ~1500)
try { localStorage.removeItem('animetop.chars1'); } catch {}
const CHS = () => (db.chars ||= {});
const ch = { mode: pref('chMode', 'anime') === 'list' ? 'list' : 'anime', role: 'all', sex: ['m', 'f'].includes(pref('chSex', 'all')) ? pref('chSex', 'all') : 'all', af: pref('chAf', 'all'), unr: false, q: '', open: new Set(), lim: {}, sea: {}, sm: {}, lm: pref('chLm', 'all') === 'sea' ? 'sea' : 'all', loading: false, prog: '', byId: new Map(), cur: null };
let chCache = {};
const CH_PFX = 'https://shikimori.io/uploads/poster/characters/';
try { chCache = JSON.parse((localStorage.getItem(CH_KEY) || '{}').split('@@ch/').join(CH_PFX)) || {}; } catch {}
const chSaveCache = () => {
  const all = Object.entries(chCache).sort((a, b) => b[1].at - a[1].at);
  for (let n = Math.min(all.length, 300); n > 0; n = Math.floor(n / 2)) {
    try { localStorage.setItem(CH_KEY, JSON.stringify(Object.fromEntries(all.slice(0, n))).split(CH_PFX).join('@@ch/')); return; } catch {}
  }
};
const chParts = (s) => s.parts.slice(0, 12); // у длинных серий — первые 12 частей
const chSig = (s) => 'v7:' + chParts(s).map((p) => p.id).join(','); // v3 — с сезонами персонажа (19.11)
// 21.11: фоновые персонажи без имени («Мужчина», «Волк», «Рассказчик», «Мать Хинаты», «Ученик 2») — не показываем.
// Признак: английское имя только из общих слов (+ «чей-то», номер или буква), мало обсуждений и короткое описание на Shikimori
const CH_BGW = new Set('man men woman women boy boys girl girls guy lady gentleman old young elderly little big tall short fat thin small large kid kids child children baby teen teenage male female mr mrs ms miss sir madam mister father mother dad mom mum papa mama brother sister son daughter wife husband grandfather grandmother grandma grandpa uncle aunt cousin family parent parents boyfriend girlfriend lover fiance friend friends classmate classmates neighbor neighbour twins twin teacher student students principal president vice director manager owner shopkeeper clerk staff employee worker waiter waitress maid butler cook chef doctor nurse police policeman officer detective guard guards soldier soldiers knight knights captain chief leader member members boss subordinate assistant secretary receptionist announcer reporter narrator commentator referee judge coach player players fan fans customer customers client passenger driver pilot sailor pirate pirates bandit bandits thief thug thugs delinquent delinquents gang gangster yakuza priest nun monk villager villagers townsperson citizen citizens merchant farmer hunter fisherman servant slave prisoner hostage hostages civilian civilians person people crowd stranger visitor tourist audience spectator spectators king queen prince princess lord noble nobleman emperor general commander lieutenant sergeant private demon demons monster monsters beast creature spirit ghost zombie zombies robot android alien titan titans dragon slime goblin orc wolf wolves bear dog cat bird fox hawk crow snake rabbit cow horse pig mouse rat fish shark voice computer ai system mascot club team school high middle elementary college university academy class store shop house home cafe restaurant bar hospital village town city military army force red blue black white green yellow pink purple brown silver gold golden gray grey blonde haired hair masked robed hooded glasses bearded first second third fourth fifth unknown unnamed mysterious other another fellow random'.split(' '));
const CH_STOP = new Set(['a', 'an', 'the', 'of', 'in', 'at', 'on', 'from', 'with', 'and', 'to', 'for', 'no']);
function chBgName(n) {
  const ws = String(n || '').replace(/\(.*?\)/g, ' ').toLowerCase().replace(/[.,!?"“”:]/g, ' ').split(/[\s\-/]+/).filter(Boolean);
  return ws.some((w) => CH_BGW.has(w)) && ws.every((w) => CH_BGW.has(w) || CH_STOP.has(w) || /^#?\d+(st|nd|rd|th)?$/.test(w) || /['’]s$/.test(w) || /^[a-z]$/.test(w));
}
const chFresh = (s) => chCache[s.id] && chCache[s.id].sig === chSig(s) && Date.now() - chCache[s.id].at < CH_TTL;
const chScore = (r) => (r ? r.score ?? null : null);
const chName = (c) => (EN_ON ? c.n || c.r : c.r || c.n) || '';

async function chLoad(force) {
  if (ch.loading) return;
  const srcs = thSources().filter((s) => force || !chFresh(s));
  if (!srcs.length) return;
  ch.loading = true;
  // персонажи всех сезонов серии; по 8 частей за запрос (у популярных аниме сотни ролей)
  const parts = [...new Set(srcs.flatMap((s) => chParts(s).map((p) => String(p.id))))], roles = {}, meta = {};
  for (let i = 0; i < parts.length; i += 8) {
    ch.prog = tr('Загружаю персонажей… {d} из {n}', { d: Math.round((i / parts.length) * srcs.length), n: srcs.length }); chRender();
    try {
      const d = await impGql(`{ animes(ids: ${JSON.stringify(parts.slice(i, i + 8).join(','))}, limit: 8) { id kind episodes poster { previewUrl } characterRoles { rolesEn character { id name russian poster { mainUrl previewUrl } topic { commentsCount } } } } }`);
      for (const a of d.animes) { roles[String(a.id)] = a.characterRoles || []; meta[String(a.id)] = { kind: a.kind, eps: a.episodes || 0, poster: a.poster?.previewUrl || '' }; }
    } catch {}
  }
  for (const s of srcs) {
    const ps = chParts(s), got = ps.map((p) => roles[String(p.id)]);
    // 20.11: «основные» части — TV и фильмы, а также сами части из топа. Персонаж только из ONA/спешлов вне топа —
    // это кроссовер или вставка (Momonga из «Ple Ple Pleiades x Kagejitsu!» в «Восхождении в тени»), его не берём
    const own = new Set([s.id, ...(s.mine || [])]);
    const isCore = (p) => { const m = meta[String(p.id)] || {}, k = m.kind || p.kind; return own.has(String(p.id)) || ['tv', 'movie'].includes(k) || (['ona', 'ova'].includes(k) && m.eps >= 5); }; // длинные ONA — полноценные сезоны (JoJo: Stone Ocean)
    if (got.some((x) => !x)) continue; // часть не загрузилась — попробуем в следующий раз
    const by = new Map();
    got.forEach((list, j) => {
      const pid = String(ps[j].id);
      for (const r of list) {
        const c = r.character; if (!c) continue;
        const id = String(c.id), m = r.rolesEn.includes('Main');
        let cur = by.get(id);
        if (!cur) by.set(id, cur = { id, n: c.name, r: c.russian, p: c.poster?.previewUrl || '', big: c.poster?.mainUrl || '', m: false, k: c.topic?.commentsCount || 0, sp: [], mp: [] });
        cur.m ||= m;
        cur.core ||= isCore(ps[j]);
        if (!cur.sp.includes(pid)) cur.sp.push(pid); // сезоны, где есть персонаж
        if (m && !cur.mp.includes(pid)) cur.mp.push(pid); // где он главный
      }
    });
    let all = [...by.values()].filter((c) => c.core).sort((a, b) => b.k - a.k);
    // кандидаты в фоновые: проверяем длину описания (у «Короля» из One Punch Man оно большое — оставляем). Оценённых не трогаем
    const bg = all.filter((c) => !c.m && c.k < 10 && !CHS()[c.id] && chBgName(c.n)), drop = new Set();
    for (let i = 0; i < bg.length; i += 50) {
      try {
        const d = await impGql(`{ characters(ids: ${JSON.stringify(bg.slice(i, i + 50).map((c) => c.id).join(','))}, limit: 50) { id description } }`);
        for (const x of d.characters || []) if ((x.description || '').length <= 300) drop.add(String(x.id));
      } catch {}
    }
    if (drop.size) all = all.filter((c) => !drop.has(c.id));
    for (const c of all) delete c.core;
    // сезоны — только TV-части (фильмы, OVA и пересказы идут в общую оценку); если TV меньше двух — все части
    const withChars = ps.filter((p, j) => got[j].length).map((p) => ({ id: String(p.id), name: p.name, russian: p.russian, english: p.english, kind: meta[String(p.id)]?.kind || p.kind || '', poster: meta[String(p.id)]?.poster || '' }));
    const tv = withChars.filter((p) => p.kind === 'tv'), sea = tv.length >= 2 ? tv : withChars;
    chCache[s.id] = { at: Date.now(), sig: chSig(s), sea, list: [...all.filter((c) => c.m), ...all.filter((c) => !c.m)] };
  }
  ch.loading = false; ch.prog = ''; chSaveCache(); chRender(); chSexEnsure();
}

const chRO = () => !!window.VIEWING;

/* ---------- пол персонажей (22.11): у Shikimori его нет — берём с AniList (часть аниме по номеру MAL + имя персонажа) ---------- */
const CH_SEX_KEY = 'animetop.chsex', CH_SEX_RETRY = 14 * 864e5;
let chSexMap = {};
try { chSexMap = JSON.parse(localStorage.getItem(CH_SEX_KEY) || '{}') || {}; } catch {}
const chSex = (id) => (typeof chSexMap[id] === 'string' ? chSexMap[id] : ''); // 'm' | 'f' | 'x' (не указан) | '' (не знаем)
const chSexOk = (c, sex = ch.sex) => sex === 'all' || chSex(c.id) === sex;
const chSexNeed = (c) => { const v = chSexMap[c.id]; return !!c.sp?.length && (!v || (typeof v === 'number' && Date.now() - v > CH_SEX_RETRY)); };
// имя без порядка слов: у Shikimori «Natsuki Subaru», у AniList «Subaru Natsuki»
const chNameKey = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 1).sort().join(' '); // инициалы («L.») не считаем
async function chAniList(query) {
  for (let n = 0; n < 4; n++) {
    const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query }) });
    if (r.status === 429) { await new Promise((ok) => setTimeout(ok, Math.min(60, +r.headers.get('Retry-After') || 20) * 1000)); continue; }
    return (await r.json().catch(() => ({}))).data || null;
  }
  return null;
}
async function chSexLoad(chars, onProg) {
  const need = chars.filter(chSexNeed);
  if (!need.length) return;
  // части аниме, где больше всего нужных персонажей; у каждой — первые 100 персонажей AniList (главные и известные).
  // Кого не нашли — ищем ещё в других его частях (до 3 проходов)
  const full = new Map(), alt = new Map(), asked = new Set();
  // «Roswaal L. Mathers» у AniList может быть «Roswaal Mathers»: тогда все слова одного имени есть в другом
  // одно слово («Garfiel» = «Garfiel Tinsel») — только если такой единственный
  const subset = (k) => { const ws = k.split(' '); if (ws.length < 2) { const hit = [...full].filter(([fk]) => fk.split(' ').includes(ws[0])); return hit.length === 1 ? hit[0][1] : null; } for (const [fk, g] of full) { const fw = fk.split(' '); if (fw.length >= 2 && (fw.every((w) => ws.includes(w)) || ws.every((w) => fw.includes(w)))) return g; } return null; };
  const look = (c) => { const k = chNameKey(c.n); return full.get(k) || alt.get(k) || subset(k); };
  const found = (c) => !!look(c);
  for (let pass = 0; pass < 3; pass++) {
    const left = new Set(need.filter((c) => !found(c) && c.sp.some((p) => !asked.has(p))).map((c) => c.id)), parts = [];
    while (left.size && parts.length < 40) {
      const cnt = new Map();
      for (const c of need) if (left.has(c.id)) for (const p of c.sp) if (!asked.has(p) && !parts.includes(p)) cnt.set(p, (cnt.get(p) || 0) + 1);
      if (!cnt.size) break;
      const best = [...cnt].sort((x, y) => y[1] - x[1])[0][0];
      parts.push(best);
      for (const c of need) if (c.sp.includes(best)) left.delete(c.id);
    }
    if (!parts.length) break;
    parts.forEach((p) => asked.add(p));
    const q2 = parts.flatMap((p) => [[p, 1], [p, 2]]);
    for (let i = 0; i < q2.length; i += 6) {
      onProg?.(asked.size - parts.length + Math.floor(i / 2), asked.size);
      const q = q2.slice(i, i + 6).map(([p, pg], j) => `a${j}: Media(idMal: ${+p || 0}, type: ANIME) { characters(page: ${pg}, perPage: 50, sort: [ROLE, FAVOURITES_DESC]) { nodes { name { full alternative } gender } } }`).join(" ");
      let d = null;
      try { d = await chAniList(`{ ${q} }`); } catch {}
      for (const m of Object.values(d || {})) for (const n of m?.characters?.nodes || []) {
        const g = n.gender === "Male" ? "m" : n.gender === "Female" ? "f" : "x";
        const k = chNameKey(n.name?.full); if (k && !full.has(k)) full.set(k, g);
        for (const x of n.name?.alternative || []) { const ka = chNameKey(x); if (ka && !alt.has(ka)) alt.set(ka, g); }
      }
    }
  }
  const now = Date.now();
  for (const c of need) chSexMap[c.id] = look(c) || now;
  try { localStorage.setItem(CH_SEX_KEY, JSON.stringify(chSexMap)); } catch {}
}
let chSexBusy = false;
async function chSexEnsure() {
  if (ch.sex === 'all' || chSexBusy || !ch.byId.size || ![...ch.byId.values()].some(chSexNeed)) return;
  chSexBusy = true; ch.sexProg = tr('Узнаю пол персонажей…'); chRender();
  await chSexLoad([...ch.byId.values()], (d, n) => { ch.sexProg = tr('Узнаю пол персонажей… {d} из {n}', { d, n }); chRender(); }).catch(() => {});
  chSexBusy = false; ch.sexProg = ''; chRender();
}
/* ---------- оценки по сезонам (19.11): db.chars[id].s = { id части: оценка }; общая оценка (score) — отдельно ---------- */
const chSea = (id, pid) => { const v = CHS()[id]?.s?.[pid]; return v == null ? null : v; };
// подписи сезонов: убираем общее начало названий («Атака титанов: Финал» → «Финал»), голое число → «Сезон 2»
function chSeaLabels(parts) {
  const norm = (w) => w.toLowerCase().replace(/[:.,!?\-–—]+$/, '');
  const words = parts.map((p) => (tn(p) || '').split(/\s+/).filter(Boolean));
  let k = 0;
  while (words.length > 1 && words.every((w) => k < w.length) && words.every((w) => norm(w[k]) === norm(words[0][k]))) k++;
  return parts.map((p, i) => {
    const full = tn(p) || '';
    let l = words[i].slice(k).join(' ').replace(/^[:.,\-–—\s]+/, '');
    if (!l) l = i === 0 && k ? tr('Сезон {n}', { n: 1 }) : full; // первая часть — само название серии
    if (/^\d+$/.test(l)) l = tr('Сезон {n}', { n: l });
    return { id: String(p.id), l: l.length > 30 ? l.slice(0, 29) + '…' : l, full, poster: p.poster || '' };
  });
}
const chSeaOf = (c) => (c.sea || []).filter((x) => !c.sp || c.sp.includes(x.id)); // сезоны, где есть персонаж
function chRateSea(id, pid, score) {
  const c = ch.byId.get(id);
  if (!c || chRO()) return;
  const now = Date.now(), old = CHS()[id] || {}, s = { ...(old.s || {}) };
  if (s[pid] === score) delete s[pid]; else s[pid] = score;
  const pk = { ...(old.pk || {}) };
  if (s[pid] !== 10) delete pk[pid];
  const rec = { ...old, s, pk, added: old.added || now, updated: now, c: chSnap(c) };
  if (!Object.keys(s).length) delete rec.s;
  if (!Object.keys(pk).length) delete rec.pk;
  if (rec.score == null && !rec.s && !rec.img) { delete CHS()[id]; (db.deleted ||= {})['h:' + id] = now; }
  else { CHS()[id] = rec; if (db.deleted) delete db.deleted['h:' + id]; }
  save();
}
/* ---------- своя картинка персонажа для сезона (20.11): db.chars[id].img = { id части: https-ссылка или маленький JPEG } ---------- */
const chImgOk = (v) => typeof v === 'string' && v.length < 40000 && /^(https:\/\/[^\s"'<>()\\]+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/.test(v);
const chImg = (id, pid, r = CHS()[id]) => { const v = r?.img?.[pid]; return chImgOk(v) ? v : ''; };
function chSetImg(id, pid, val) {
  const c = ch.byId.get(id);
  if (!c || chRO()) return false;
  if (val && val.startsWith('data:') && Object.values(CHS()).reduce((n, r) => n + Object.values(r?.img || {}).filter((v) => String(v).startsWith('data:')).length, 0) >= 120) { toast(tr('Слишком много своих картинок — убери старые')); return false; }
  const now = Date.now(), old = CHS()[id] || {}, img = { ...(old.img || {}) };
  if (val) img[pid] = val; else delete img[pid];
  const rec = { ...old, img, added: old.added || now, updated: now, c: chSnap(c) };
  if (!Object.keys(img).length) delete rec.img;
  if (rec.score == null && !rec.s && !rec.img) { delete CHS()[id]; (db.deleted ||= {})['h:' + id] = now; }
  else { CHS()[id] = rec; if (db.deleted) delete db.deleted['h:' + id]; }
  save();
  return true;
}
// файл → JPEG 150×200 (обрезка по центру, чуть выше середины — там обычно лицо), ~8 КБ
async function chImgFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
    const W = 150, H = 200, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const k = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k;
    cv.getContext('2d').drawImage(im, (W - w) / 2, (H - h) * 0.3, w, h);
    return cv.toDataURL('image/jpeg', 0.8);
  } finally { URL.revokeObjectURL(url); }
}
const chImgTest = (src) => new Promise((ok) => { const i = new Image(), t = setTimeout(() => ok(false), 9000); i.onload = () => { clearTimeout(t); ok(i.naturalWidth > 0); }; i.onerror = () => { clearTimeout(t); ok(false); }; i.src = src; });
// 20.11: «Абсолютный пик» — общий (peak) и за сезон (pk[id сезона])
function chPeak(id, pid) {
  const r = CHS()[id];
  if (!r || chRO()) return;
  if (pid) { if (r.s?.[pid] !== 10) return; const pk = { ...(r.pk || {}) }; if (pk[pid]) delete pk[pid]; else pk[pid] = true; if (Object.keys(pk).length) r.pk = pk; else delete r.pk; }
  else { if (chScore(r) !== 10) return; if (r.peak) delete r.peak; else r.peak = true; }
  r.updated = Date.now();
  save();
}
const chPeakBtn = (id, pid, on) => peakBtnHTML(`data-chpeak="${esc(id)}" ${pid ? `data-chpeakp="${esc(pid)}"` : ''}`, on);
const chSnap = (c) => ({ id: c.id, n: c.n, r: c.r, p: c.p, big: c.big, m: c.m, anime: c.anime, sp: c.sp, mp: c.mp, sea: c.sea });
const chScoreRow = (my, attr = 'data-chrate') => `<div class="th-sc">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button type="button" ${attr}="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}" title="${esc(LABEL[n])}">${n}</button>`).join('')}</div>`;
const chColor = (s) => thColor(s);
const chAfOk = (score) => ch.af === 'all' || (ch.af === 'rated' ? score != null : ch.af === 'ten' ? score === 10 : score != null && score >= 5);
function chRowHTML(c, anime, pid) {
  if (pid && !chRO()) {
    const my = chSea(c.id, pid), all = chScore(CHS()[c.id]), m = c.mp ? c.mp.includes(pid) : c.m;
    const sp = (ch.byId.get(c.id)?.sea || c.sea || []).find((x) => x.id === pid)?.poster;
    return `<div class="th-row ch-row" data-cid="${esc(c.id)}" data-pid="${esc(pid)}">
    <span class="ch-avw" data-chopen="${esc(c.id)}"><img class="ch-ava" loading="lazy" src="${esc(chImg(c.id, pid) || c.p)}" alt="">${sp ? `<img class="ch-avs" loading="lazy" src="${esc(sp)}" alt="">` : ''}</span>
    <div class="th-info" data-chopen="${esc(c.id)}"><b>${esc(chName(c))}</b><span>${tr(m ? 'главный' : 'второстепенный')}${all ? ' · ' + tr('общая {n}', { n: all }) : ''}</span></div>
    ${chScoreRow(my, 'data-chsea')}
    ${my === 10 ? chPeakBtn(c.id, pid, CHS()[c.id]?.pk?.[pid]) : ''}
  </div>`;
  }
  const my = chScore(CHS()[c.id]);
  return `<div class="th-row ch-row" data-cid="${esc(c.id)}">
    <img class="ch-ava" loading="lazy" src="${esc(c.p)}" alt="" data-chopen="${esc(c.id)}">
    <div class="th-info" data-chopen="${esc(c.id)}"><b>${esc(chName(c))}</b><span>${tr(c.m ? 'главный' : 'второстепенный')}${anime ? ' · ' + esc(tn(anime)) : ''}</span></div>
    ${chRO() ? (my ? `<b class="th-my" style="--c:${chColor(my)}">${my}</b>` : '') : `<div class="th-sc">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button type="button" data-chrate="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}" title="${esc(LABEL[n])}">${n}</button>`).join('')}</div>`}
    ${!chRO() && my === 10 ? chPeakBtn(c.id, '', CHS()[c.id]?.peak) : ''}
  </div>`;
}
// длинный список — порциями: сначала 60 самых известных, дальше по кнопке
function chPageHTML(g) {
  const lim = ch.q ? Infinity : ch.lim[g.s.id] || CH_PAGE, rest = g.items.length - lim;
  return g.items.slice(0, lim).map((c) => chRowHTML(c, null, g.pid)).join('') + (rest > 0 ? `<div class="ch-more"><button type="button" class="btn" data-chmore="${esc(g.s.id)}">${tr('Показать ещё {n}', { n: Math.min(rest, CH_PAGE) })}</button>${rest > CH_PAGE ? `<button type="button" class="link" data-chmore="${esc(g.s.id)}" data-all="1">${tr('Показать всех ({n})', { n: g.items.length })}</button>` : ''}</div>` : '');
}
function chRender() {
  const box = $('#view-chars');
  if (!box || box.hidden) return;
  const ro = chRO(), rated = CHS();
  if (ro) ch.mode = 'list';
  $('#chSeg').hidden = ro; $('#chTools').hidden = ro || ch.mode !== 'anime';
  $('#view-chars h1').textContent = ro ? tr('Персонажи {l}', { l: window.VIEWING.login }) : tr('Персонажи');
  const srcs = thSources(), seen = new Set();
  const groups = srcs.map((s) => ({ s, sea: chSeaLabels(chCache[s.id]?.sea || []), items: (chCache[s.id]?.list || []).filter((c) => !seen.has(c.id) && seen.add(c.id)) }));
  ch.byId = new Map();
  for (const g of groups) for (const c of g.items) ch.byId.set(c.id, { ...c, sea: g.sea.length > 1 ? g.sea : null, anime: { id: g.s.id, russian: g.s.anime.russian, name: g.s.anime.name, english: g.s.anime.english } });
  for (const [id, r] of Object.entries(rated)) if (!ch.byId.has(id) && r.c) ch.byId.set(id, r.c);
  const nRated = Object.values(rated).filter((r) => chScore(r) != null).length;
  $('#chStats').textContent = [tr('оценено {n}', { n: nRated }), !ro && seen.size ? tr('персонажей — {n}', { n: seen.size }) : ''].filter(Boolean).join(' · ');
  $$('#chSeg [data-chmode]').forEach((b) => b.classList.toggle('on', b.dataset.chmode === ch.mode));
  const af = TH_AF.find((x) => x[0] === ch.af) || TH_AF[0];
  $('#chKinds').innerHTML = `<div class="th-filters">
    ${ch.mode === 'list' ? `<div class="th-seg">${[['all', 'Общая'], ['sea', 'По сезонам']].map(([v, l]) => `<button type="button" class="${ch.lm === v ? 'on' : ''}" data-chlm="${v}">${tr(l)}</button>`).join('')}</div>` : ''}
    <div class="th-seg">${[['all', 'Все'], ['main', 'Главные'], ['sup', 'Второстепенные']].map(([v, l]) => `<button type="button" class="${ch.role === v ? 'on' : ''}" data-chrole="${v}">${tr(l)}</button>`).join('')}</div>
    <div class="th-seg ch-sexseg">${[['all', 'Все'], ['m', 'Парни'], ['f', 'Девушки']].map(([v, l]) => `<button type="button" class="${ch.sex === v ? 'on' : ''}" data-chsex="${v}">${tr(l)}</button>`).join('')}</div>
    ${ch.mode === 'anime' && !ro ? `<button type="button" class="pill th-af ${ch.af !== 'all' ? 'on' : ''}" data-chafmenu>${tr(af[1])}${icon('chev')}</button>
      <button type="button" class="pill th-unr ${ch.unr ? 'on' : ''}" data-chunr><span class="th-box">${ch.unr ? icon('check') : ''}</span>${tr('Только неоценённые')}</button>
      <button type="button" class="pill th-refresh" data-chrefresh title="${tr('Обновить список')}">${icon('sort')}</button>` : ''}</div>`;
  const roleOk = (c) => (ch.role === 'all' || (ch.role === 'main' ? c.m : !c.m)) && chSexOk(c);
  const q = ch.q.toLowerCase();
  const qOk = (c, a) => !q || `${c.r} ${c.n} ${a ? tn(a) : ''}`.toLowerCase().includes(q);
  const body = $('#chBody');
  const empty = (h, p) => `<div class="empty-state small"><div class="empty-art">${icon('mask')}</div><h2>${h}</h2><p>${p}</p></div>`;
  const prog = ch.loading || ch.sexProg ? `<p class="th-prog"><span class="th-spin"></span>${esc(ch.loading ? ch.prog : ch.sexProg)}</p>` : '';
  if (ch.mode === 'anime') {
    if (!srcs.length) { body.innerHTML = empty(tr('Сначала оцени аниме'), tr('Здесь появятся персонажи аниме из твоего топа.')); return; }
    const vis = groups.filter((g) => chAfOk(g.s.score)).map((g) => {
      const pid = ch.sm[g.s.id] === 'sea' && g.sea.length > 1 ? (g.sea.some((x) => x.id === ch.sea[g.s.id]) ? ch.sea[g.s.id] : g.sea[0].id) : null;
      const inSea = (c) => !pid || !c.sp || c.sp.includes(pid);
      const roleSea = (c) => !pid || ch.role === 'all' || (ch.role === 'main' ? (c.mp || []).includes(pid) : !(c.mp || []).includes(pid));
      const unr = (c) => !ch.unr || (pid ? chSea(c.id, pid) == null : chScore(rated[c.id]) == null);
      return { ...g, pid, full: g.items, items: g.items.filter((c) => inSea(c) && (pid ? roleSea(c) && chSexOk(c) : roleOk(c)) && qOk(c, g.s.anime) && unr(c)) };
    }).filter((g) => g.items.length || g.pid);
    if (!vis.length) { body.innerHTML = prog || empty(tr('Ничего не подходит'), tr('Попробуй другие фильтры.')); return; }
    const allOpen = vis.every((g) => ch.open.has(g.s.id)) || !!q;
    body.innerHTML = prog + `<div class="th-bar"><button type="button" class="link" data-chall="${allOpen ? 0 : 1}">${tr(allOpen ? 'Свернуть все' : 'Развернуть все')}</button></div>` + vis.map((g) => {
      const open = ch.open.has(g.s.id) || !!q, r = g.full.filter((c) => chScore(rated[c.id]) != null).length;
      return `<section class="th-group ${open ? 'open' : ''}"><button type="button" class="th-ghead" data-chg="${esc(g.s.id)}"><img loading="lazy" src="${esc(g.s.anime.poster || '')}" alt=""><span class="th-gt"><b>${esc(tn(g.s.anime))}</b><small>${tr('персонажей — {n}', { n: g.full.length })} · ${tr('оценено {a} из {b}', { a: r, b: g.full.length })}</small></span>${g.s.score != null ? `<span class="th-gs">${tr('моя {n}', { n: g.s.score })}</span>` : ''}<span class="th-chev">${icon('chev')}</span></button>
        ${open ? `<div class="th-gbody">${g.sea.length > 1 ? `<div class="ch-sm"><div class="th-seg" role="tablist"><button type="button" role="tab" class="${g.pid ? '' : 'on'}" data-chsm="all" data-g="${esc(g.s.id)}">${tr('Общая оценка')}</button><button type="button" role="tab" class="${g.pid ? 'on' : ''}" data-chsm="sea" data-g="${esc(g.s.id)}">${tr('По сезонам')}</button></div><p class="ch-seahint">${tr(g.pid ? 'Оценки по сезонам — отдельный список для каждого сезона. Общая оценка от них не меняется. Свою картинку персонажа для сезона можно поставить в его карточке.' : 'Общая оценка — за всё аниме целиком.')}</p></div>${g.pid ? `<div class="ch-sea" role="tablist">${g.sea.map((x) => `<button type="button" role="tab" class="ch-sp ${g.pid === x.id ? 'on' : ''}" data-chsg="${esc(g.s.id)}" data-pid="${esc(x.id)}" title="${esc(x.full)}">${x.poster ? `<img src="${esc(x.poster)}" alt="" loading="lazy">` : ''}<span>${esc(x.l)}</span></button>`).join('')}</div>` : ''}` : ''}${chPageHTML(g)}</div>` : ''}</section>`;
    }).join('');
    return;
  }
  const items = ch.lm === 'sea'
    ? Object.entries(rated).flatMap(([id, r]) => { const c = { ...(r.c || {}), ...(ch.byId.get(id) || {}) }; const lab = new Map((c.sea || []).map((x) => [x.id, x])); return Object.entries(r.s || {}).map(([pid, v]) => ({ ...c, id, score: v, at: r.updated || r.added, m: c.mp ? c.mp.includes(pid) : c.m, sl: lab.get(pid)?.l || '', sf: lab.get(pid)?.full || '', spp: lab.get(pid)?.poster || '', p: chImg(id, pid, r) || c.p, peak: v === 10 && !!r.pk?.[pid] })); }).filter((c) => c.score != null && roleOk(c))
    : Object.entries(rated).map(([id, r]) => ({ ...(ch.byId.get(id) || r.c), id, score: chScore(r), peak: !!r.peak && chScore(r) === 10, at: r.updated || r.added })).filter((c) => c.score != null && roleOk(c));
  if (!items.length) { body.innerHTML = empty(tr('Тир-лист пока пуст'), ro ? '' : tr('Оцени персонажа — он появится здесь.')); return; }
  body.innerHTML = `<div class="th-board">${(items.some((c) => c.peak) ? [PEAK, ...TIERS] : TIERS).map((x) => {
    const row = items.filter((c) => (x.t === 'P' ? c.peak : !c.peak && thTierOf(c.score) === x.t)).sort((a, b) => b.score - a.score || a.at - b.at);
    return `<div class="th-trow ${x.t === 'P' ? 'peakrow' : ''}"><div class="th-tl" style="--c:${x.c}"><b>${x.t === 'P' ? peakLabelHTML() : esc((!ro && tierNames[x.t]?.name) || x.t)}</b></div><div class="th-items ch-items">${row.map((c) => `<button type="button" class="ch-chip" data-chopen="${esc(c.id)}" title="${esc(chName(c) + (c.sf ? ' · ' + c.sf : ''))}"><img loading="lazy" src="${esc(c.p)}" alt="">${c.spp ? `<img class="ch-chs" loading="lazy" src="${esc(c.spp)}" alt="">` : ''}<span>${esc(chName(c))}</span>${c.sl ? `<small class="ch-sl">${esc(c.sl)}</small>` : ''}<i class="th-cs" style="--c:${x.c}">${c.score}</i></button>`).join('')}</div></div>`;
  }).join('')}</div>`;
}

/* ---------- оценка и карточка персонажа ---------- */
function chRate(id, score) {
  const c = ch.byId.get(id);
  if (!c || chRO()) return;
  const now = Date.now(), old = CHS()[id];
  if (chScore(old) === score && !old?.s && !old?.img) { delete CHS()[id]; (db.deleted ||= {})['h:' + id] = now; }
  else { CHS()[id] = { ...(old || {}), score: chScore(old) === score ? null : score, added: old?.added || now, updated: now, c: chSnap(c) }; if (CHS()[id].score !== 10) delete CHS()[id].peak; if (db.deleted) delete db.deleted['h:' + id]; }
  save();
}
document.body.insertAdjacentHTML('beforeend', `<dialog id="chDlg" class="sheet card ch-dlg" aria-label="${tr('Персонажи')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="ch-card" id="chCard"></div></div>
  <input type="file" id="chPicFile" accept="image/*" hidden>
</dialog>`);
const chDlg = $('#chDlg');
function chSeaCard(c, ro) {
  const sea = chSeaOf(c);
  if (sea.length < 2) return '';
  const got = sea.map((x) => ({ ...x, v: chSea(c.id, x.id) })), done = got.filter((x) => x.v != null);
  const trend = done.length > 1 ? `<div class="ch-trend"><span>${tr('Как менялся')}</span>${done.map((x, i) => `${i ? '<i>→</i>' : ''}<b style="--c:${chColor(x.v)}" title="${esc(x.full)}">${x.v}</b>`).join('')}</div>` : '';
  if (ro) return done.length ? `<h3 class="ch-h">${tr('По сезонам')}</h3>${trend}<div class="ch-seas">${done.map((x) => `<div class="ch-sr"><span title="${esc(x.full)}">${(chImg(c.id, x.id) || x.poster) ? `<img src="${esc(chImg(c.id, x.id) || x.poster)}" alt="" loading="lazy">` : ''}${esc(x.l)}</span><b class="th-my" style="--c:${chColor(x.v)}">${x.v}</b></div>`).join('')}</div>` : '';
  return `<h3 class="ch-h">${tr('По сезонам')}</h3>${trend}<div class="ch-seas">${got.map((x) => { const im = chImg(c.id, x.id), pic = im || x.poster; return `<div class="ch-sr" data-pid="${esc(x.id)}"><div class="ch-srh"><button type="button" class="ch-pic ${im ? 'has' : ''}" data-chpic title="${tr('Своя картинка')}">${pic ? `<img src="${esc(pic)}" alt="" loading="lazy">` : ''}${im ? '' : `<i>${icon('upload')}</i>`}</button><div class="ch-srt"><span title="${esc(x.full)}">${esc(x.l)}</span><button type="button" class="link" data-chpic>${tr(im ? 'Сменить картинку' : 'Своя картинка')}</button></div></div>${ch.picOpen === x.id ? `<div class="ch-picp"><p class="set-note">${tr('Твоя картинка персонажа для этого сезона. Видна в списке, тир-листе и друзьям по ссылке на топ.')}</p><div class="ch-picb"><button type="button" class="btn primary" data-chpicf>${icon('upload')}<span>${tr('Загрузить картинку')}</span></button>${im ? `<button type="button" class="btn" data-chpicx>${tr('Убрать')}</button>` : ''}</div><form class="ch-picu"><input type="url" name="u" inputmode="url" placeholder="${tr('Ссылка на картинку')}: https://…" value="${im && !im.startsWith('data:') ? esc(im) : ''}"><button class="btn">OK</button></form></div>` : ''}${chScoreRow(x.v, 'data-chsea')}${x.v === 10 ? chPeakBtn(c.id, x.id, CHS()[c.id]?.pk?.[x.id]) : ''}</div>`; }).join('')}</div>`;
}
function chOpen(id) {
  const c = ch.byId.get(id);
  if (!c) return;
  if (ch.cur !== id) ch.picOpen = null;
  ch.cur = id;
  const my = chScore(CHS()[id]), ro = chRO();
  $('#chCard').innerHTML = `<img class="ch-big" src="${esc(c.big || c.p)}" alt=""><div class="ch-meta"><h2>${esc(chName(c))}</h2>${c.r && c.n ? `<p class="ch-orig">${esc(EN_ON ? c.r : c.n)}</p>` : ''}<p>${tr(c.m ? 'главный' : 'второстепенный')}${c.anime ? ' · ' + esc(tn(c.anime)) : ''}</p>
    <p class="th-now">${my ? tr(ro ? 'Оценка: {n}' : 'Моя оценка: {n}', { n: `${my} — ${LABEL[my]}` }) : ro ? tr('нет оценки') : tr('Ещё не оценён')}</p>
    ${ro ? '' : `${chSeaOf(c).length > 1 ? `<h3 class="ch-h">${tr('Общая оценка')}</h3>` : ''}<div class="th-big">${Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => `<button type="button" data-chrate="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}"><b>${n}</b><small>${esc(LABEL[n])}</small></button>`).join('')}</div>${my === 10 ? `<div class="peak-w">${chPeakBtn(id, '', CHS()[id]?.peak)}</div>` : ''}`}
    ${ro && my === 10 && CHS()[id]?.peak ? peakTagHTML() : ''}
    ${chSeaCard(c, ro)}
    <a class="ext" href="https://shikimori.io/characters/${esc(id)}" target="_blank" rel="noopener">${tr('Открыть на Shikimori')}${icon('ext')}</a></div>`;
  if (!chDlg.open) openModal(chDlg);
}
chDlg.addEventListener('click', (e) => {
  if (e.target === chDlg || e.target.closest('[data-close]')) { chDlg.close(); return; }
  const r = e.target.closest('[data-chrate]');
  if (r && ch.cur) { chRate(ch.cur, +r.dataset.chrate); chOpen(ch.cur); chRender(); return; }
  const sv = e.target.closest('[data-chsea]');
  if (sv && ch.cur) { chRateSea(ch.cur, sv.closest('[data-pid]').dataset.pid, +sv.dataset.chsea); chOpen(ch.cur); chRender(); return; }
  const pk = e.target.closest('[data-chpeak]');
  if (pk && ch.cur) { chPeak(ch.cur, pk.dataset.chpeakp || ''); chOpen(ch.cur); chRender(); return; }
  const pp = e.target.closest('[data-chpic]');
  if (pp && ch.cur) { const pid = pp.closest('[data-pid]').dataset.pid; ch.picOpen = ch.picOpen === pid ? null : pid; chOpen(ch.cur); return; }
  if (e.target.closest('[data-chpicf]') && ch.cur) { ch.picPid = e.target.closest('[data-pid]').dataset.pid; $('#chPicFile').click(); return; }
  const px = e.target.closest('[data-chpicx]');
  if (px && ch.cur) { chSetImg(ch.cur, px.closest('[data-pid]').dataset.pid, null); ch.picOpen = null; chOpen(ch.cur); chRender(); }
});
chDlg.addEventListener('submit', async (e) => {
  const f = e.target.closest('.ch-picu');
  if (!f || !ch.cur) return;
  e.preventDefault();
  const u = f.u.value.trim(), id = ch.cur, pid = f.closest('[data-pid]').dataset.pid;
  if (!u) return;
  if (!chImgOk(u)) { toast(tr('Нужна ссылка https://…')); return; }
  f.querySelector('button').disabled = true;
  const ok = await chImgTest(u);
  if (!ok) { toast(tr('Не получилось открыть картинку')); f.querySelector('button').disabled = false; return; }
  if (chSetImg(id, pid, u)) { ch.picOpen = null; toast(tr('Картинка сохранена')); }
  if (ch.cur === id && chDlg.open) chOpen(id);
  chRender();
});
$('#chPicFile').addEventListener('change', async (e) => {
  const file = e.target.files[0], id = ch.cur, pid = ch.picPid;
  e.target.value = '';
  if (!file || !id || !pid) return;
  let data = '';
  try { data = await chImgFile(file); } catch { toast(tr('Не получилось открыть картинку')); return; }
  if (chSetImg(id, pid, data)) { ch.picOpen = null; toast(tr('Картинка сохранена')); }
  if (ch.cur === id && chDlg.open) chOpen(id);
  chRender();
});
chDlg.addEventListener('close', () => { if (history.state?.modal === 'chDlg') history.back(); });

$('#view-chars').addEventListener('click', (e) => {
  const m = e.target.closest('[data-chmode]');
  if (m) { ch.mode = m.dataset.chmode; setPref('chMode', ch.mode); chRender(); return; }
  const ro = e.target.closest('[data-chrole]');
  if (ro) { ch.role = ro.dataset.chrole; chRender(); return; }
  const sx = e.target.closest('[data-chsex]');
  if (sx) { ch.sex = sx.dataset.chsex; setPref('chSex', ch.sex); chRender(); chSexEnsure(); return; }
  const afm = e.target.closest('[data-chafmenu]');
  if (afm) { openPop(afm, { items: TH_AF.map(([v, , label, hint]) => ({ v, label: tr(label), hint: tr(hint), on: ch.af === v })), note: tr('Смотрит на твою оценку самого аниме'), onPick: (it) => { ch.af = it.v; setPref('chAf', ch.af); chRender(); } }); return; }
  if (e.target.closest('[data-chunr]')) { ch.unr = !ch.unr; chRender(); return; }
  const lm = e.target.closest('[data-chlm]');
  if (lm) { ch.lm = lm.dataset.chlm; setPref('chLm', ch.lm); chRender(); return; }
  const pk = e.target.closest('[data-chpeak]');
  if (pk) { chPeak(pk.dataset.chpeak, pk.dataset.chpeakp || ''); chRender(); return; }
  const sm = e.target.closest('[data-chsm]');
  if (sm) { ch.sm[sm.dataset.g] = sm.dataset.chsm; chRender(); return; }
  const sg = e.target.closest('[data-chsg]');
  if (sg) { ch.sea[sg.dataset.chsg] = sg.dataset.pid; chRender(); return; }
  const sv = e.target.closest('.ch-row [data-chsea]');
  if (sv) { const row = sv.closest('.ch-row'); chRateSea(row.dataset.cid, row.dataset.pid, +sv.dataset.chsea); chRender(); return; }
  if (e.target.closest('[data-chrefresh]')) { chLoad(true); return; }
  const more = e.target.closest('[data-chmore]');
  if (more) { const k = more.dataset.chmore; ch.lim[k] = more.dataset.all ? Infinity : (ch.lim[k] || CH_PAGE) + CH_PAGE; chRender(); return; }
  const all = e.target.closest('[data-chall]');
  if (all) { $$('#chBody [data-chg]').forEach((b) => ch.open[all.dataset.chall === '1' ? 'add' : 'delete'](b.dataset.chg)); chRender(); return; }
  const g = e.target.closest('[data-chg]');
  if (g) { const k = g.dataset.chg; ch.open.has(k) ? ch.open.delete(k) : ch.open.add(k); chRender(); return; }
  const r = e.target.closest('.ch-row [data-chrate]');
  if (r) { chRate(r.closest('.ch-row').dataset.cid, +r.dataset.chrate); chRender(); return; }
  const o = e.target.closest('[data-chopen]');
  if (o) chOpen(o.dataset.chopen);
});
let chSearchT = 0;
$('#chSearch').addEventListener('input', (e) => { clearTimeout(chSearchT); const v = e.target.value.trim(); $('#chTools .clear').hidden = !v; chSearchT = setTimeout(() => { ch.q = v; chRender(); }, 200); });
$('#chTools .clear').addEventListener('click', () => { $('#chSearch').value = ''; $('#chTools .clear').hidden = true; ch.q = ''; chRender(); });
{
  const base = afterChange;
  afterChange = function (...a) { const out = base.apply(this, a); if (view === 'chars' && !chDlg.open) chRender(); return out; };
}
function chShowView() { chRender(); if (!chRO()) chLoad(); chSexEnsure(); }
if (view === 'chars') chShowView();
