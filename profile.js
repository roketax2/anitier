'use strict';
/* Визитка (2026-11-18): аватарка с рамкой, цифры, достижения, топ-10 аниме, топ-5 опенингов, топ-6 персонажей.
   В чужом топе по ссылке — сверху страницы; себе — «Ещё → Моя визитка» (с копированием ссылки). */
Object.assign(EN, {
  'Моя визитка': 'My profile card', 'Как тебя видят друзья по ссылке на топ': 'How friends see you via your top link',
  'аниме': 'anime', 'средняя': 'average', 'шедевров': 'masterpieces', 'опенингов': 'openings', 'персонажей': 'characters', 'достижений': 'achievements',
  'Любимые аниме': 'Favorite anime', 'Любимые опенинги': 'Favorite openings', 'Любимые персонажи': 'Favorite characters',
  'Скопировать ссылку': 'Copy link', 'Ссылка скопирована': 'Link copied',
  'Чтобы друзья увидели визитку, включи ссылку на топ: Аккаунт → «Ссылка на мой топ».': 'To let friends see it, turn on your top link: Account → “Link to my top”.',
  'Войди в аккаунт, чтобы поделиться визиткой по ссылке.': 'Sign in to share your card via a link.',
});
function profileHTML(u, d, own) {
  const rows = thSources().filter((s) => s.score != null);
  const avgS = rows.length ? rows.reduce((t, s) => t + s.score, 0) / rows.length : null;
  const tens = rows.filter((s) => s.score === 10).length;
  const themes = Object.values(d.themes || {}).map((r) => ({ ...r.t, s: r.score ?? { S: 10, A: 9, B: 8, C: 7, D: 5, F: 3 }[r.tier], at: r.updated || r.added })).filter((t) => t.s != null && t.k);
  const chars = Object.values(d.chars || {}).filter((r) => r.score != null && r.c).map((r) => ({ ...r.c, s: r.score, at: r.updated || r.added }));
  const ach = ACH.filter((a) => (d.ach || {})[a.id]).sort((a, b) => d.ach[b.id] - d.ach[a.id]);
  const num = (n, l) => `<div class="pf-num"><b>${n}</b><span>${tr(l)}</span></div>`;
  const nick = u?.nick || u?.login || '';
  const ava = typeof avatarHTML === 'function' && u ? avatarHTML(u, 'a-avatar big', 'lg') : '';
  const top10 = rows.slice(0, 10), top5 = themes.sort((a, b) => b.s - a.s || a.at - b.at).slice(0, 5), top6 = chars.sort((a, b) => b.s - a.s || a.at - b.at).slice(0, 6);
  return `<section class="pf">
    <div class="pf-head">${ava}<div class="pf-who"><h2>${esc(nick)}</h2>
      <div class="pf-nums">${num(rows.length, 'аниме')}${avgS != null ? num(avgS.toFixed(1), 'средняя') : ''}${num(tens, 'шедевров')}${themes.length ? num(themes.length, 'опенингов') : ''}${chars.length ? num(chars.length, 'персонажей') : ''}${num(ach.length, 'достижений')}</div>
      ${ach.length ? `<div class="pf-ach">${ach.slice(0, 10).map((a) => `<span title="${esc(tr(a.t))}">${achIcon(a)}</span>`).join('')}</div>` : ''}</div></div>
    ${top10.length ? `<h3 class="pf-h">${tr('Любимые аниме')}</h3><div class="pf-posters">${top10.map((s, i) => `<button type="button" class="pf-p" data-pfa="${esc(s.id)}" title="${esc(tn(s.anime))}"><img loading="lazy" src="${esc(s.anime.poster || '')}" alt=""><i>${i + 1}</i><b>${s.score}</b></button>`).join('')}</div>` : ''}
    ${top5.length ? `<h3 class="pf-h">${tr('Любимые опенинги')}</h3><div class="pf-songs">${top5.map((t) => `<div class="pf-song"><img loading="lazy" src="${esc(t.anime?.poster || '')}" alt=""><span><b>${esc(t.song || '—')}</b><small>${esc(tn(t.part || t.anime))} · ${esc((t.type || '') + (t.seq || ''))}</small></span><i style="--c:${thColor(t.s)}">${t.s}</i></div>`).join('')}</div>` : ''}
    ${top6.length ? `<h3 class="pf-h">${tr('Любимые персонажи')}</h3><div class="pf-chars">${top6.map((c) => `<div class="pf-c"><img loading="lazy" src="${esc(c.p || '')}" alt=""><span>${esc((EN_ON ? c.n || c.r : c.r || c.n) || '')}</span><i style="--c:${thColor(c.s)}">${c.s}</i></div>`).join('')}</div>` : ''}
  </section>`;
}
// чужой топ по ссылке: визитка сверху (account.js вызывает после renderCompare)
function renderProfileCard(u) {
  document.getElementById('pfBox')?.remove();
  const box = document.createElement('div');
  box.id = 'pfBox';
  box.innerHTML = profileHTML(u, db, false);
  const cmp = $('#cmpBox'); if (cmp) cmp.before(box); else $('#viewBanner').after(box);
  box.addEventListener('click', (e) => { const p = e.target.closest('[data-pfa]'); if (p) { const s = thSources().find((x) => x.id === p.dataset.pfa); if (s) openCard(s.anime, s.fr ? 'franchise' : 'season'); } });
}
// себе: окно «Моя визитка»
document.body.insertAdjacentHTML('beforeend', `<dialog id="pfDlg" class="sheet card pf-dlg" aria-label="${tr('Моя визитка')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="pf-body" id="pfBody"></div></div>
</dialog>`);
const pfDlg = $('#pfDlg');
function openProfileCard() {
  const u = acct?.user ? { ...acct.user } : { login: tr('Я') };
  const link = acct?.user?.shareId ? `${location.origin}${location.pathname}?u=${acct.user.shareId}` : '';
  $('#pfBody').innerHTML = `<p class="set-note pf-note">${tr('Как тебя видят друзья по ссылке на топ')}</p>${profileHTML(u, db, true)}
    <div class="pf-share">${link ? `<button type="button" class="btn primary" data-pfcopy="${esc(link)}">${icon('link')}<span>${tr('Скопировать ссылку')}</span></button><small>${esc(link)}</small>` : `<small>${tr(acct?.user ? 'Чтобы друзья увидели визитку, включи ссылку на топ: Аккаунт → «Ссылка на мой топ».' : 'Войди в аккаунт, чтобы поделиться визиткой по ссылке.')}</small>`}</div>`;
  openModal(pfDlg);
}
pfDlg.addEventListener('click', async (e) => {
  if (e.target === pfDlg || e.target.closest('[data-close]')) { pfDlg.close(); return; }
  const c = e.target.closest('[data-pfcopy]');
  if (c) { try { await navigator.clipboard.writeText(c.dataset.pfcopy); toast(tr('Ссылка скопирована')); } catch {} return; }
  const p = e.target.closest('[data-pfa]');
  if (p) { const s = thSources().find((x) => x.id === p.dataset.pfa); if (s) { pfDlg.close(); setTimeout(() => openCard(s.anime, s.fr ? 'franchise' : 'season'), 50); } }
});
pfDlg.addEventListener('close', () => { if (history.state?.modal === 'pfDlg') history.back(); });
