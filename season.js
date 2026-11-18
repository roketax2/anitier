'use strict';
/* «Что смотреть в этом сезоне» (2026-11-18): онгоинги текущего сезона и анонсы следующего (Shikimori),
   с отметкой, что уже есть в топе, и кнопкой «В планы». Кнопка — в шапке каталога. */
Object.assign(EN, {
  'Сезон': 'Season', 'Этот сезон': 'This season', 'Следующий': 'Next', 'зима': 'winter', 'весна': 'spring', 'лето': 'summer', 'осень': 'fall',
  'Что смотреть: {s}': 'What to watch: {s}', 'В планы': 'Plan to watch', 'в планах': 'planned', 'в топе: {n}': 'in top: {n}', 'в топе': 'in top',
  'серия {n} — {d}': 'ep. {n} — {d}', 'вышло {a} из {b}': '{a} of {b} aired', 'Добавлено в планы': 'Added to plans', 'Только новые для меня': 'Only new to me',
});
const SEASONS = ['winter', 'spring', 'summer', 'fall'];
const SEASON_RU = { winter: 'зима', spring: 'весна', summer: 'лето', fall: 'осень' };
// сезоны как в индустрии: зима — январь–март, весна — апрель–июнь, лето — июль–сентябрь, осень — октябрь–декабрь
const curSeason = (d = new Date(), shift = 0) => {
  let i = Math.floor(d.getMonth() / 3) + shift, y = d.getFullYear();
  while (i > 3) { i -= 4; y++; }
  return { key: `${SEASONS[i]}_${y}`, label: `${tr(SEASON_RU[SEASONS[i]])} ${y}` };
};
const sz = { which: 0, onlyNew: false, list: [], cache: {} };
document.body.insertAdjacentHTML('beforeend', `<dialog id="szDlg" class="sheet card cm-dlg sz-dlg" aria-label="${tr('Сезон')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="set-body" id="szBody"></div></div>
</dialog>`);
const szDlg = $('#szDlg');
async function szLoad(key) {
  if (sz.cache[key]) return sz.cache[key];
  const d = await impGql(`{ animes(season: ${JSON.stringify(key)}, kind: "tv,ona", order: popularity, limit: 50) { ${LIGHT} episodesAired nextEpisodeAt } }`);
  return (sz.cache[key] = d.animes);
}
function szRender() {
  const s = curSeason(new Date(), sz.which);
  const mineRec = (a) => db.items[a.id] || (a.franchise && db.franchises[a.franchise]);
  const list = sz.list.filter((a) => !sz.onlyNew || !mineRec(a));
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }); } catch { return ''; } };
  $('#szBody').innerHTML = `<h2>${tr('Что смотреть: {s}', { s: s.label })}</h2>
    <div class="th-filters"><div class="th-seg">${[[0, 'Этот сезон'], [1, 'Следующий']].map(([v, l]) => `<button type="button" class="${sz.which === v ? 'on' : ''}" data-szw="${v}">${tr(l)}</button>`).join('')}</div>
      <button type="button" class="pill th-unr ${sz.onlyNew ? 'on' : ''}" data-sznew><span class="th-box">${sz.onlyNew ? icon('check') : ''}</span>${tr('Только новые для меня')}</button></div>
    <div class="cm-list sz-list">${list.length ? list.map((a, i) => {
      const rec = mineRec(a);
      const ep = a.status === 'ongoing' && a.nextEpisodeAt ? tr('серия {n} — {d}', { n: (a.episodesAired || 0) + 1, d: fmtDate(a.nextEpisodeAt) }) : a.status === 'ongoing' && a.episodes ? tr('вышло {a} из {b}', { a: a.episodesAired || 0, b: a.episodes }) : a.airedOn?.date ? fmtDate(a.airedOn.date) : '';
      const mark = rec ? (rec.score != null ? tr('в топе: {n}', { n: rec.score }) : rec.status === 'planned' ? tr('в планах') : tr('в топе')) : '';
      return `<div class="cm-row sz-row" data-sz="${i}"><img loading="lazy" src="${esc(a.poster?.previewUrl || a.poster?.mainUrl || '')}" alt="">
        <span class="cm-t" data-szopen="${i}"><b>${esc(tn(a))}</b><small>${[ep, a.score ? `★ ${fmtWorld(a.score)}` : '', (a.genres || []).slice(0, 2).map(gname).join(', ')].filter(Boolean).map(esc).join(' · ')}</small></span>
        ${mark ? `<span class="sz-mark">${esc(mark)}</span>` : `<button type="button" class="btn sz-plan" data-szplan="${i}">${icon('plus')}<span>${tr('В планы')}</span></button>`}</div>`;
    }).join('') : `<p class="set-note">${tr('Ничего не нашлось')}</p>`}</div>`;
  sz.shown = list;
}
async function openSeason() {
  const s = curSeason(new Date(), sz.which);
  $('#szBody').innerHTML = `<h2>${tr('Что смотреть: {s}', { s: s.label })}</h2><p class="th-prog"><span class="th-spin"></span>${tr('Загружаю…')}</p>`;
  if (!szDlg.open) openModal(szDlg);
  try { sz.list = await szLoad(s.key); } catch { sz.list = []; }
  szRender();
}
szDlg.addEventListener('click', (e) => {
  if (e.target === szDlg || e.target.closest('[data-close]')) { szDlg.close(); return; }
  const w = e.target.closest('[data-szw]');
  if (w) { sz.which = +w.dataset.szw; openSeason(); return; }
  if (e.target.closest('[data-sznew]')) { sz.onlyNew = !sz.onlyNew; szRender(); return; }
  const p = e.target.closest('[data-szplan]');
  if (p) {
    const a = sz.shown[+p.dataset.szplan];
    if (a && !window.VIEWING) { const now = Date.now(); db.items[a.id] = { score: null, status: 'planned', note: '', added: now, updated: now, anime: snapshot(a) }; save(); afterChange(); toast(tr('Добавлено в планы')); szRender(); }
    return;
  }
  const o = e.target.closest('[data-szopen]');
  if (o) { const a = sz.shown[+o.dataset.szopen]; if (a) { szDlg.close(); setTimeout(() => openCard(a, 'season'), 50); } }
});
szDlg.addEventListener('close', () => { if (history.state?.modal === 'szDlg') history.back(); });
// кнопка в шапке каталога
{
  const head = $('#view-catalog .view-head');
  head.insertAdjacentHTML('beforeend', `<div class="head-actions"><button class="tool-btn" id="szBtn">${icon('compass')}<span>${tr('Что смотреть: {s}', { s: curSeason().label })}</span></button></div>`);
  $('#szBtn').addEventListener('click', openSeason);
}
