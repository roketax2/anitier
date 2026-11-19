'use strict';
/* Персонажи (2026-11-18): тир-лист персонажей из аниме своего топа. Данные — Shikimori (characterRoles).
   Оценка 1–10, тир по оценке как в топе. db.chars[id] = { score, added, updated, c: снимок } — синхронизируются с аккаунтом. */
Object.assign(EN, {
  'Персонажи': 'Characters', 'Главные': 'Main', 'Второстепенные': 'Supporting', 'главный': 'main', 'второстепенный': 'supporting',
  'Найди персонажа или аниме': 'Find a character or anime', 'Загружаю персонажей… {d} из {n}': 'Loading characters… {d} of {n}',
  'персонажей — {n}': '{n} characters', 'Персонажи {l}': '{l}’s characters', 'Оцени персонажа — он появится здесь.': 'Rate a character — they will show up here.',
  'Смотрит на твою оценку самого аниме': 'Uses your rating of the anime itself',
  'Здесь появятся персонажи аниме из твоего топа.': 'Characters of the anime in your top will show up here.',
  'Все сезоны': 'All seasons', 'Сезон {n}': 'Season {n}', 'По сезонам': 'By season', 'Общая': 'Overall', 'Общая оценка': 'Overall rating',
  'Общая оценка — за всё аниме целиком.': 'Overall rating is for the whole anime.', 'Оценки по сезонам — отдельный список для каждого сезона. Общая оценка от них не меняется.': 'Season ratings are a separate list for each season. They don’t change the overall rating.',
  'общая {n}': 'overall {n}', 'Как менялся': 'How they changed', 'Оценка за сезон': 'Season rating', 'Оцени персонажа за этот сезон': 'Rate the character for this season',
});
$('.nav-btn[data-view="chars"] span').textContent = tr('Персонажи');
$('#view-chars h1').textContent = tr('Персонажи');
$$('#chSeg [data-chmode] span').forEach((s) => { s.textContent = tr(s.textContent); });
$('#chSearch').placeholder = tr('Найди персонажа или аниме');

// 19.11: второстепенные — самые обсуждаемые (комментарии к персонажу на Shikimori), из всех сезонов серии; раньше брались первые 12 по алфавиту
const CH_KEY = 'animetop.chars2', CH_TTL = 14 * 864e5, CH_SUP = 20; // второстепенных на аниме или серию — не больше 20
try { localStorage.removeItem('animetop.chars1'); } catch {}
const CHS = () => (db.chars ||= {});
const ch = { mode: pref('chMode', 'anime') === 'list' ? 'list' : 'anime', role: 'all', af: pref('chAf', 'all'), unr: false, q: '', open: new Set(), sea: {}, sm: {}, lm: pref('chLm', 'all') === 'sea' ? 'sea' : 'all', loading: false, prog: '', byId: new Map(), cur: null };
let chCache = {};
try { chCache = JSON.parse(localStorage.getItem(CH_KEY) || '{}') || {}; } catch {}
const chSaveCache = () => { try { localStorage.setItem(CH_KEY, JSON.stringify(Object.fromEntries(Object.entries(chCache).sort((a, b) => b[1].at - a[1].at).slice(0, 300)))); } catch {} };
const chParts = (s) => s.parts.slice(0, 12); // у длинных серий — первые 12 частей
const chSig = (s) => 'v4:' + chParts(s).map((p) => p.id).join(','); // v3 — с сезонами персонажа (19.11)
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
      const d = await impGql(`{ animes(ids: ${JSON.stringify(parts.slice(i, i + 8).join(','))}, limit: 8) { id kind poster { previewUrl } characterRoles { rolesEn character { id name russian poster { mainUrl previewUrl } topic { commentsCount } } } } }`);
      for (const a of d.animes) { roles[String(a.id)] = a.characterRoles || []; meta[String(a.id)] = { kind: a.kind, poster: a.poster?.previewUrl || '' }; }
    } catch {}
  }
  for (const s of srcs) {
    const ps = chParts(s), got = ps.map((p) => roles[String(p.id)]);
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
        if (!cur.sp.includes(pid)) cur.sp.push(pid); // сезоны, где есть персонаж
        if (m && !cur.mp.includes(pid)) cur.mp.push(pid); // где он главный
      }
    });
    const all = [...by.values()].sort((a, b) => b.k - a.k);
    // сезоны — только TV-части (фильмы, OVA и пересказы идут в общую оценку); если TV меньше двух — все части
    const withChars = ps.filter((p, j) => got[j].length).map((p) => ({ id: String(p.id), name: p.name, russian: p.russian, english: p.english, kind: meta[String(p.id)]?.kind || p.kind || '', poster: meta[String(p.id)]?.poster || '' }));
    const tv = withChars.filter((p) => p.kind === 'tv'), sea = tv.length >= 2 ? tv : withChars;
    chCache[s.id] = { at: Date.now(), sig: chSig(s), sea, list: [...all.filter((c) => c.m), ...all.filter((c) => !c.m).slice(0, CH_SUP)] };
  }
  ch.loading = false; ch.prog = ''; chSaveCache(); chRender();
}

const chRO = () => !!window.VIEWING;
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
  const rec = { ...old, s, added: old.added || now, updated: now, c: chSnap(c) };
  if (!Object.keys(s).length) delete rec.s;
  if (rec.score == null && !rec.s) { delete CHS()[id]; (db.deleted ||= {})['h:' + id] = now; }
  else { CHS()[id] = rec; if (db.deleted) delete db.deleted['h:' + id]; }
  save();
}
const chSnap = (c) => ({ id: c.id, n: c.n, r: c.r, p: c.p, big: c.big, m: c.m, anime: c.anime, sp: c.sp, mp: c.mp, sea: c.sea });
const chScoreRow = (my, attr = 'data-chrate') => `<div class="th-sc">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button type="button" ${attr}="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}" title="${esc(LABEL[n])}">${n}</button>`).join('')}</div>`;
const chColor = (s) => thColor(s);
const chAfOk = (score) => ch.af === 'all' || (ch.af === 'rated' ? score != null : ch.af === 'ten' ? score === 10 : score != null && score >= 5);
function chRowHTML(c, anime, pid) {
  if (pid && !chRO()) {
    const my = chSea(c.id, pid), all = chScore(CHS()[c.id]), m = c.mp ? c.mp.includes(pid) : c.m;
    const sp = (ch.byId.get(c.id)?.sea || c.sea || []).find((x) => x.id === pid)?.poster;
    return `<div class="th-row ch-row" data-cid="${esc(c.id)}" data-pid="${esc(pid)}">
    <span class="ch-avw" data-chopen="${esc(c.id)}"><img class="ch-ava" loading="lazy" src="${esc(c.p)}" alt="">${sp ? `<img class="ch-avs" loading="lazy" src="${esc(sp)}" alt="">` : ''}</span>
    <div class="th-info" data-chopen="${esc(c.id)}"><b>${esc(chName(c))}</b><span>${tr(m ? 'главный' : 'второстепенный')}${all ? ' · ' + tr('общая {n}', { n: all }) : ''}</span></div>
    ${chScoreRow(my, 'data-chsea')}
  </div>`;
  }
  const my = chScore(CHS()[c.id]);
  return `<div class="th-row ch-row" data-cid="${esc(c.id)}">
    <img class="ch-ava" loading="lazy" src="${esc(c.p)}" alt="" data-chopen="${esc(c.id)}">
    <div class="th-info" data-chopen="${esc(c.id)}"><b>${esc(chName(c))}</b><span>${tr(c.m ? 'главный' : 'второстепенный')}${anime ? ' · ' + esc(tn(anime)) : ''}</span></div>
    ${chRO() ? (my ? `<b class="th-my" style="--c:${chColor(my)}">${my}</b>` : '') : `<div class="th-sc">${Array.from({ length: 10 }, (_, i) => i + 1).map((n) => `<button type="button" data-chrate="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}" title="${esc(LABEL[n])}">${n}</button>`).join('')}</div>`}
  </div>`;
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
    ${ch.mode === 'anime' && !ro ? `<button type="button" class="pill th-af ${ch.af !== 'all' ? 'on' : ''}" data-chafmenu>${tr(af[1])}${icon('chev')}</button>
      <button type="button" class="pill th-unr ${ch.unr ? 'on' : ''}" data-chunr><span class="th-box">${ch.unr ? icon('check') : ''}</span>${tr('Только неоценённые')}</button>
      <button type="button" class="pill th-refresh" data-chrefresh title="${tr('Обновить список')}">${icon('sort')}</button>` : ''}</div>`;
  const roleOk = (c) => ch.role === 'all' || (ch.role === 'main' ? c.m : !c.m);
  const q = ch.q.toLowerCase();
  const qOk = (c, a) => !q || `${c.r} ${c.n} ${a ? tn(a) : ''}`.toLowerCase().includes(q);
  const body = $('#chBody');
  const empty = (h, p) => `<div class="empty-state small"><div class="empty-art">${icon('mask')}</div><h2>${h}</h2><p>${p}</p></div>`;
  const prog = ch.loading ? `<p class="th-prog"><span class="th-spin"></span>${esc(ch.prog)}</p>` : '';
  if (ch.mode === 'anime') {
    if (!srcs.length) { body.innerHTML = empty(tr('Сначала оцени аниме'), tr('Здесь появятся персонажи аниме из твоего топа.')); return; }
    const vis = groups.filter((g) => chAfOk(g.s.score)).map((g) => {
      const pid = ch.sm[g.s.id] === 'sea' && g.sea.length > 1 ? (g.sea.some((x) => x.id === ch.sea[g.s.id]) ? ch.sea[g.s.id] : g.sea[0].id) : null;
      const inSea = (c) => !pid || !c.sp || c.sp.includes(pid);
      const roleSea = (c) => !pid || ch.role === 'all' || (ch.role === 'main' ? (c.mp || []).includes(pid) : !(c.mp || []).includes(pid));
      const unr = (c) => !ch.unr || (pid ? chSea(c.id, pid) == null : chScore(rated[c.id]) == null);
      return { ...g, pid, full: g.items, items: g.items.filter((c) => inSea(c) && (pid ? roleSea(c) : roleOk(c)) && qOk(c, g.s.anime) && unr(c)) };
    }).filter((g) => g.items.length || g.pid);
    if (!vis.length) { body.innerHTML = prog || empty(tr('Ничего не подходит'), tr('Попробуй другие фильтры.')); return; }
    const allOpen = vis.every((g) => ch.open.has(g.s.id)) || !!q;
    body.innerHTML = prog + `<div class="th-bar"><button type="button" class="link" data-chall="${allOpen ? 0 : 1}">${tr(allOpen ? 'Свернуть все' : 'Развернуть все')}</button></div>` + vis.map((g) => {
      const open = ch.open.has(g.s.id) || !!q, r = g.full.filter((c) => chScore(rated[c.id]) != null).length;
      return `<section class="th-group ${open ? 'open' : ''}"><button type="button" class="th-ghead" data-chg="${esc(g.s.id)}"><img loading="lazy" src="${esc(g.s.anime.poster || '')}" alt=""><span class="th-gt"><b>${esc(tn(g.s.anime))}</b><small>${tr('персонажей — {n}', { n: g.full.length })} · ${tr('оценено {a} из {b}', { a: r, b: g.full.length })}</small></span>${g.s.score != null ? `<span class="th-gs">${tr('моя {n}', { n: g.s.score })}</span>` : ''}<span class="th-chev">${icon('chev')}</span></button>
        ${open ? `<div class="th-gbody">${g.sea.length > 1 ? `<div class="ch-sm"><div class="th-seg" role="tablist"><button type="button" role="tab" class="${g.pid ? '' : 'on'}" data-chsm="all" data-g="${esc(g.s.id)}">${tr('Общая оценка')}</button><button type="button" role="tab" class="${g.pid ? 'on' : ''}" data-chsm="sea" data-g="${esc(g.s.id)}">${tr('По сезонам')}</button></div><p class="ch-seahint">${tr(g.pid ? 'Оценки по сезонам — отдельный список для каждого сезона. Общая оценка от них не меняется.' : 'Общая оценка — за всё аниме целиком.')}</p></div>${g.pid ? `<div class="ch-sea" role="tablist">${g.sea.map((x) => `<button type="button" role="tab" class="ch-sp ${g.pid === x.id ? 'on' : ''}" data-chsg="${esc(g.s.id)}" data-pid="${esc(x.id)}" title="${esc(x.full)}">${x.poster ? `<img src="${esc(x.poster)}" alt="" loading="lazy">` : ''}<span>${esc(x.l)}</span></button>`).join('')}</div>` : ''}` : ''}${g.items.map((c) => chRowHTML(c, null, g.pid)).join('')}</div>` : ''}</section>`;
    }).join('');
    return;
  }
  const items = ch.lm === 'sea'
    ? Object.entries(rated).flatMap(([id, r]) => { const c = { ...(r.c || {}), ...(ch.byId.get(id) || {}) }; const lab = new Map((c.sea || []).map((x) => [x.id, x])); return Object.entries(r.s || {}).map(([pid, v]) => ({ ...c, id, score: v, at: r.updated || r.added, m: c.mp ? c.mp.includes(pid) : c.m, sl: lab.get(pid)?.l || '', sf: lab.get(pid)?.full || '', spp: lab.get(pid)?.poster || '' })); }).filter((c) => c.score != null && roleOk(c))
    : Object.entries(rated).map(([id, r]) => ({ ...(ch.byId.get(id) || r.c), id, score: chScore(r), at: r.updated || r.added })).filter((c) => c.score != null && roleOk(c));
  if (!items.length) { body.innerHTML = empty(tr('Тир-лист пока пуст'), ro ? '' : tr('Оцени персонажа — он появится здесь.')); return; }
  body.innerHTML = `<div class="th-board">${TIERS.map((x) => {
    const row = items.filter((c) => thTierOf(c.score) === x.t).sort((a, b) => b.score - a.score || a.at - b.at);
    return `<div class="th-trow"><div class="th-tl" style="--c:${x.c}"><b>${esc((!ro && tierNames[x.t]?.name) || x.t)}</b></div><div class="th-items ch-items">${row.map((c) => `<button type="button" class="ch-chip" data-chopen="${esc(c.id)}" title="${esc(chName(c) + (c.sf ? ' · ' + c.sf : ''))}"><img loading="lazy" src="${esc(c.p)}" alt="">${c.spp ? `<img class="ch-chs" loading="lazy" src="${esc(c.spp)}" alt="">` : ''}<span>${esc(chName(c))}</span>${c.sl ? `<small class="ch-sl">${esc(c.sl)}</small>` : ''}<i class="th-cs" style="--c:${x.c}">${c.score}</i></button>`).join('')}</div></div>`;
  }).join('')}</div>`;
}

/* ---------- оценка и карточка персонажа ---------- */
function chRate(id, score) {
  const c = ch.byId.get(id);
  if (!c || chRO()) return;
  const now = Date.now(), old = CHS()[id];
  if (chScore(old) === score && !old?.s) { delete CHS()[id]; (db.deleted ||= {})['h:' + id] = now; }
  else { CHS()[id] = { ...(old || {}), score: chScore(old) === score ? null : score, added: old?.added || now, updated: now, c: chSnap(c) }; if (db.deleted) delete db.deleted['h:' + id]; }
  save();
}
document.body.insertAdjacentHTML('beforeend', `<dialog id="chDlg" class="sheet card ch-dlg" aria-label="${tr('Персонажи')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="ch-card" id="chCard"></div></div>
</dialog>`);
const chDlg = $('#chDlg');
function chSeaCard(c, ro) {
  const sea = chSeaOf(c);
  if (sea.length < 2) return '';
  const got = sea.map((x) => ({ ...x, v: chSea(c.id, x.id) })), done = got.filter((x) => x.v != null);
  const trend = done.length > 1 ? `<div class="ch-trend"><span>${tr('Как менялся')}</span>${done.map((x, i) => `${i ? '<i>→</i>' : ''}<b style="--c:${chColor(x.v)}" title="${esc(x.full)}">${x.v}</b>`).join('')}</div>` : '';
  if (ro) return done.length ? `<h3 class="ch-h">${tr('По сезонам')}</h3>${trend}<div class="ch-seas">${done.map((x) => `<div class="ch-sr"><span title="${esc(x.full)}">${x.poster ? `<img src="${esc(x.poster)}" alt="" loading="lazy">` : ''}${esc(x.l)}</span><b class="th-my" style="--c:${chColor(x.v)}">${x.v}</b></div>`).join('')}</div>` : '';
  return `<h3 class="ch-h">${tr('По сезонам')}</h3>${trend}<div class="ch-seas">${got.map((x) => `<div class="ch-sr" data-pid="${esc(x.id)}"><span title="${esc(x.full)}">${x.poster ? `<img src="${esc(x.poster)}" alt="" loading="lazy">` : ''}${esc(x.l)}</span>${chScoreRow(x.v, 'data-chsea')}</div>`).join('')}</div>`;
}
function chOpen(id) {
  const c = ch.byId.get(id);
  if (!c) return;
  ch.cur = id;
  const my = chScore(CHS()[id]), ro = chRO();
  $('#chCard').innerHTML = `<img class="ch-big" src="${esc(c.big || c.p)}" alt=""><div class="ch-meta"><h2>${esc(chName(c))}</h2>${c.r && c.n ? `<p class="ch-orig">${esc(EN_ON ? c.r : c.n)}</p>` : ''}<p>${tr(c.m ? 'главный' : 'второстепенный')}${c.anime ? ' · ' + esc(tn(c.anime)) : ''}</p>
    <p class="th-now">${my ? tr(ro ? 'Оценка: {n}' : 'Моя оценка: {n}', { n: `${my} — ${LABEL[my]}` }) : ro ? tr('нет оценки') : tr('Ещё не оценён')}</p>
    ${ro ? '' : `${chSeaOf(c).length > 1 ? `<h3 class="ch-h">${tr('Общая оценка')}</h3>` : ''}<div class="th-big">${Array.from({ length: 10 }, (_, j) => 10 - j).map((n) => `<button type="button" data-chrate="${n}" style="--c:${chColor(n)}" class="${my === n ? 'on' : ''}"><b>${n}</b><small>${esc(LABEL[n])}</small></button>`).join('')}</div>`}
    ${chSeaCard(c, ro)}
    <a class="ext" href="https://shikimori.io/characters/${esc(id)}" target="_blank" rel="noopener">${tr('Открыть на Shikimori')}${icon('ext')}</a></div>`;
  if (!chDlg.open) openModal(chDlg);
}
chDlg.addEventListener('click', (e) => {
  if (e.target === chDlg || e.target.closest('[data-close]')) { chDlg.close(); return; }
  const r = e.target.closest('[data-chrate]');
  if (r && ch.cur) { chRate(ch.cur, +r.dataset.chrate); chOpen(ch.cur); chRender(); return; }
  const sv = e.target.closest('[data-chsea]');
  if (sv && ch.cur) { chRateSea(ch.cur, sv.closest('[data-pid]').dataset.pid, +sv.dataset.chsea); chOpen(ch.cur); chRender(); }
});
chDlg.addEventListener('close', () => { if (history.state?.modal === 'chDlg') history.back(); });

$('#view-chars').addEventListener('click', (e) => {
  const m = e.target.closest('[data-chmode]');
  if (m) { ch.mode = m.dataset.chmode; setPref('chMode', ch.mode); chRender(); return; }
  const ro = e.target.closest('[data-chrole]');
  if (ro) { ch.role = ro.dataset.chrole; chRender(); return; }
  const afm = e.target.closest('[data-chafmenu]');
  if (afm) { openPop(afm, { items: TH_AF.map(([v, , label, hint]) => ({ v, label: tr(label), hint: tr(hint), on: ch.af === v })), note: tr('Смотрит на твою оценку самого аниме'), onPick: (it) => { ch.af = it.v; setPref('chAf', ch.af); chRender(); } }); return; }
  if (e.target.closest('[data-chunr]')) { ch.unr = !ch.unr; chRender(); return; }
  const lm = e.target.closest('[data-chlm]');
  if (lm) { ch.lm = lm.dataset.chlm; setPref('chLm', ch.lm); chRender(); return; }
  const sm = e.target.closest('[data-chsm]');
  if (sm) { ch.sm[sm.dataset.g] = sm.dataset.chsm; chRender(); return; }
  const sg = e.target.closest('[data-chsg]');
  if (sg) { ch.sea[sg.dataset.chsg] = sg.dataset.pid; chRender(); return; }
  const sv = e.target.closest('.ch-row [data-chsea]');
  if (sv) { const row = sv.closest('.ch-row'); chRateSea(row.dataset.cid, row.dataset.pid, +sv.dataset.chsea); chRender(); return; }
  if (e.target.closest('[data-chrefresh]')) { chLoad(true); return; }
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
function chShowView() { chRender(); if (!chRO()) chLoad(); }
if (view === 'chars') chShowView();
