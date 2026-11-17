'use strict';
/* Сравнение вкусов (2026-11-17): открыл чужой топ по ссылке — сверху видно, насколько вкусы
   совпадают с твоими: процент, где сходитесь, где расходитесь и что у него высоко, а ты ещё
   не смотрел. Свой топ берём из браузера (до подмены db в openShared), считаем по сериям целиком. */

// строки «аниме целиком» для любого топа: ключ — серия (fKey), оценка — как в рейтинге
function cmpRows(d) {
  const keep = db;
  db = d;
  try { return new Map(titleGroups().map(titleRow).map((r) => [fKey(r.anime), r])); } finally { db = keep; }
}
const CMP_LEVELS = [[90, 'Родственные души'], [78, 'Очень похожие вкусы'], [64, 'Похожие вкусы'], [48, 'Разные вкусы'], [0, 'Противоположности']];

function compareTops(mine, theirs) {
  const a = cmpRows(mine), b = cmpRows(theirs);
  const common = [];
  for (const [k, rb] of b) { const ra = a.get(k); if (ra && ra.score != null && rb.score != null) common.push({ k, me: ra.score, them: rb.score, anime: rb.anime, d: rb.score - ra.score }); }
  const both = [...b.keys()].filter((k) => a.has(k)).length;
  const mean = common.length ? common.reduce((s, x) => s + Math.abs(x.d), 0) / common.length : null;
  const pct = mean == null ? null : Math.max(0, Math.min(100, Math.round(100 - mean * 18)));
  const agree = common.filter((x) => Math.abs(x.d) <= 1).sort((x, y) => Math.abs(x.d) - Math.abs(y.d) || (y.me + y.them) - (x.me + x.them)).slice(0, 5);
  const differ = common.filter((x) => Math.abs(x.d) >= 2).sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 5);
  const recs = [...b.values()].filter((r) => r.score >= 8 && !a.has(fKey(r.anime))).sort((x, y) => y.score - x.score || (y.world || 0) - (x.world || 0)).slice(0, 8);
  return { mineCount: a.size, common, both, pct, agree, differ, recs };
}

function renderCompare(mine, who) {
  document.getElementById('cmpBox')?.remove();
  const c = compareTops(mine, db);
  const box = document.createElement('section');
  box.className = 'cmp';
  box.id = 'cmpBox';
  const pick = [];
  const item = (anime, line) => {
    const i = pick.push(anime) - 1;
    return `<button class="cmp-item" data-c="${i}"><img loading="lazy" src="${esc(anime.poster || '')}" alt=""><span><b>${esc(tn(anime))}</b><small>${line}</small></span></button>`;
  };
  const sc = (x) => `${tr('ты')} <b>${fmtMy(x.me)}</b> · ${esc(who)} <b>${fmtMy(x.them)}</b>`;
  let head;
  if (!c.mineCount) {
    head = `<div class="cmp-empty">${tr('Оцени несколько аниме в своём топе — и здесь появится, насколько ваши вкусы совпадают.')}</div>`;
  } else if (c.common.length < 3) {
    head = `<div class="cmp-empty">${tr('У вас пока мало общих оценённых аниме ({n}) — процент совпадения появится от трёх.', { n: c.common.length })}</div>`;
  } else {
    const level = CMP_LEVELS.find(([min]) => c.pct >= min)[1];
    head = `<div class="cmp-head"><div class="cmp-ring" style="--p:${c.pct}"><b>${c.pct}%</b></div>
      <div><h3>${tr(level)}</h3><p>${tr('Совпадение вкусов с {w} по {n} общим аниме', { w: `<b>${esc(who)}</b>`, n: c.common.length })}${c.both > c.common.length ? ` · ${tr('всего общих: {n}', { n: c.both })}` : ''}</p></div></div>`;
  }
  const col = (title, html) => (html ? `<div class="cmp-col"><h4>${title}</h4>${html}</div>` : '');
  const cols = [
    col(tr('Сходитесь'), c.agree.length ? c.agree.map((x) => item(x.anime, sc(x))).join('') : ''),
    col(tr('Расходитесь'), c.differ.map((x) => item(x.anime, sc(x))).join('')),
    col(tr('Советует {w}', { w: esc(who) }), c.recs.map((r) => item(r.anime, `${esc(who)} <b>${fmtMy(r.score)}</b>${r.world ? ` · ${tr('мир')} <b>${fmtWorld(r.world)}</b>` : ''}`)).join('')),
  ].join('');
  box.innerHTML = `${head}${cols ? `<div class="cmp-cols">${cols}</div>` : ''}`;
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    const a = pick[+b.dataset.c]; if (a) openCard(fromSnap(a), 'franchise');
  });
  $('#viewBanner').after(box);
}
