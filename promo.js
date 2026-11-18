'use strict';
/* Промокоды (2026-11-18): вводятся в «Настройках» — рамки только за промокоды, готовые рамки, значки у ника, все рамки (код разработчика)
   и секретное достижение «Промокод». Создаёт разработчик: «Настройки → Создать промокоды» (видно только админу) или через сервер. */
Object.assign(EN, {
  'Промокод': 'Promo code', 'Промокоды': 'Promo codes', 'Введи промокод': 'Enter a promo code', 'Активировать': 'Redeem', 'Проверяю…': 'Checking…',
  'Промокоды дают особые рамки и значки у ника.': 'Promo codes give special frames and badges next to your nick.',
  'Промокоды дают особые рамки и значки у ника. Работают только с аккаунтом — так награда не потеряется.': 'Promo codes give special frames and badges next to your nick. They work only with an account — so the reward never gets lost.',
  'Войти или создать аккаунт': 'Sign in or create an account', 'Промокод активирован!': 'Promo code redeemed!', 'Ввести ещё': 'Enter another',
  'Все рамки открыты': 'All frames unlocked', 'Значок у ника': 'Badge next to your nick', 'Рамка': 'Frame', 'Выбрать рамку': 'Choose a frame',
  'Активируй промокод': 'Redeem a promo code', 'Только по промокоду': 'Promo code only', 'Ты уже вводил этот промокод': 'You already redeemed this promo code',
  'Разработчик': 'Developer', 'Тестер': 'Tester', 'Первые игроки': 'Early player', 'Друг AniTier': 'AniTier friend', 'VIP': 'VIP',
  'Золотой ключ': 'Golden key', 'Подарок': 'Gift', 'Билет': 'Ticket', 'Код разработчика': 'Developer code', 'Создать промокоды': 'Create promo codes',
  'Личные': 'Personal', 'Общий': 'Shared',
  'Каждый промокод срабатывает один раз — раздавай по одному человеку.': 'Each code works once — give one per person.',
  'Один промокод на всех, каждый вводит его один раз.': 'One code for everyone, each person can redeem it once.',
  'Сколько промокодов': 'How many codes', 'Свой промокод (пусто — случайный)': 'Custom code (empty — random)', 'Сколько людей (пусто — без лимита)': 'How many people (empty — no limit)',
  'Срок, дней (пусто — бессрочно)': 'Valid for days (empty — forever)', 'Что даёт промокод': 'What the code gives', 'Все рамки сразу': 'All frames at once',
  'Рамки за промокоды': 'Promo frames', 'Готовые рамки': 'Existing frames', 'Значки': 'Badges', 'Заметка для себя': 'Note to self', 'Создать': 'Create',
  'Готово — промокоды:': 'Done — codes:', 'Скопировать все': 'Copy all', 'Скопировано': 'Copied', 'Все промокоды': 'All promo codes', 'Промокодов пока нет': 'No promo codes yet',
  'ввели': 'redeemed', 'до {d}': 'until {d}', 'Удалить промокод {c}? Награды у тех, кто его ввёл, останутся.': 'Delete code {c}? People who redeemed it keep the reward.',
  'все рамки': 'all frames', 'рамки': 'frames', 'значки': 'badges',
});

/* ---------- значки у ника ---------- */
const BADGES = {
  dev: { t: 'Разработчик', c: '#3ee68a', svg: '<path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5M13.5 5l-3 14"/>' },
  tester: { t: 'Тестер', c: '#4dd2ff', svg: '<path d="M9.5 3.5h5M10.5 3.5v5.2L5 18.5a1.5 1.5 0 0 0 1.3 2.2h11.4a1.5 1.5 0 0 0 1.3-2.2l-5.5-9.8V3.5M7.6 14h8.8"/>' },
  early: { t: 'Первые игроки', c: '#ffb347', svg: GLYPH.star },
  friend: { t: 'Друг AniTier', c: '#ff4d78', svg: GLYPH.heart },
  vip: { t: 'VIP', c: '#b77dff', svg: GLYPH.crown },
};
const badgeSvg = (b) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BADGES[b].svg}</svg>`;
function badgesHTML(list, small) {
  const ok = (list || []).filter((b) => BADGES[b]);
  return ok.length ? `<span class="bdg-list${small ? ' sm' : ''}">${ok.map((b) => `<span class="bdg" style="--bc:${BADGES[b].c}" title="${esc(tr(BADGES[b].t))}">${badgeSvg(b)}<span>${esc(tr(BADGES[b].t))}</span></span>`).join('')}</span>` : '';
}
const myRewards = () => (typeof acct !== 'undefined' && acct.user?.rewards) || null;

/* ---------- рамки за коды и достижение ---------- */
FRAMES.push(
  { id: 'pr_key', t: 'Золотой ключ', code: 1 },
  { id: 'pr_gift', t: 'Подарок', code: 1 },
  { id: 'pr_ticket', t: 'Билет', code: 1 },
  { id: 'pr_dev', t: 'Разработчик', code: 1 },
);
GLYPH.key = '<circle cx="8" cy="15.5" r="4"/><path d="m11 12.5 8.5-8.5M15.8 7.8l2.6 2.6M18.4 5.2l2 2"/>';
ACH.push({ id: 'promo', g: 'secret', i: 'key', t: 'Промокод', d: 'Активируй промокод', ok: (s) => s.promo });
{ const base = achStats; achStats = function (...a) { const s = base(...a); s.promo = !!myRewards()?.n; return s; }; }

/* ---------- «Промокод» в настройках ---------- */
// раздел живёт отдельным узлом: окно настроек перерисовывается, когда приходит счётчик игроков, а введённый код не должен пропасть
const prBox = document.createElement('section');
prBox.className = 'set-sec pr-sec';
const pr = { msg: null, got: null, busy: false };
function rewardHTML(r) {
  const fr = (r.frames || []).map((id) => frameById(id)).filter((x) => x.id);
  const letter = esc([...(dname(acct.user) || '?')][0].toUpperCase());
  return `<div class="pr-got">
    ${r.all ? `<div class="pr-item"><span class="pr-ring">${framed(`<span class="a-avatar">${letter}</span>`, 'pr_dev', 'lg')}</span><b>${tr('Все рамки открыты')}</b></div>` : ''}
    ${fr.filter((x) => !(r.all && x.id === 'pr_dev')).map((x) => `<div class="pr-item"><span class="pr-ring">${framed(`<span class="a-avatar">${letter}</span>`, x.id, 'lg')}</span><span><small>${tr('Рамка')}</small><b>${esc(tr(x.t))}</b></span></div>`).join('')}
    ${(r.badges || []).length ? `<div class="pr-item"><span><small>${tr('Значок у ника')}</small>${badgesHTML(r.badges)}</span></div>` : ''}
  </div>`;
}
function renderPromo() {
  const u = typeof acct !== 'undefined' ? acct.user : null;
  const old = prBox.querySelector('.pr-input')?.value || '';
  let h = `<h3>${icon('key')}${tr('Промокод')}</h3>`;
  if (!u) h += `<p class="set-note">${tr('Промокоды дают особые рамки и значки у ника. Работают только с аккаунтом — так награда не потеряется.')}</p><button type="button" class="btn" data-prlogin>${tr('Войти или создать аккаунт')}</button>`;
  else if (pr.got) h += `<div class="pr-ok">${icon('check')}<b>${tr('Промокод активирован!')}</b></div>${rewardHTML(pr.got)}
      <div class="pr-acts">${pr.got.frames?.length || pr.got.all ? `<button type="button" class="btn primary" data-prframe>${tr('Выбрать рамку')}</button>` : ''}<button type="button" class="btn" data-prmore>${tr('Ввести ещё')}</button></div>`;
  else h += `<form class="pr-form" data-prform><input name="code" class="pr-input" placeholder="${tr('Введи промокод')}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30" required>
      <button class="btn primary" ${pr.busy ? 'disabled' : ''}>${tr(pr.busy ? 'Проверяю…' : 'Активировать')}</button></form>
      ${pr.msg ? `<p class="a-msg">${esc(pr.msg)}</p>` : `<p class="set-note">${tr('Промокоды дают особые рамки и значки у ника.')}</p>`}`;
  if (u?.admin) h += `<button type="button" class="btn pr-admbtn" data-pradm>${icon('key')}${tr('Создать промокоды')}</button>`;
  prBox.innerHTML = h;
  const i = prBox.querySelector('.pr-input'); if (i) i.value = old;
}
{
  const base = renderSettings;
  renderSettings = function (...a) {
    base(...a);
    renderPromo();
    const first = $('#setBody .set-sec');
    if (first) first.after(prBox); else $('#setBody').append(prBox);
  };
  const baseOpen = openSettings;
  openSettings = function (...a) { pr.msg = null; pr.got = null; prBox.innerHTML = ''; return baseOpen(...a); };
}
prBox.addEventListener('submit', async (e) => {
  if (!e.target.matches('[data-prform]')) return;
  e.preventDefault();
  const code = e.target.code.value.trim();
  if (!code || pr.busy) return;
  pr.busy = true; pr.msg = null; renderPromo();
  try {
    const r = await api('POST', '/api/promo/redeem', { code });
    if (r.status === 409) pr.msg = tr(r.error || 'Ты уже вводил этот промокод');
    else { setUser(r.user); pr.got = r.reward; if (typeof checkAch === 'function') checkAch(); }
  } catch (err) { pr.msg = err.message; }
  pr.busy = false; renderPromo();
  if (pr.got) prBox.querySelector('.pr-input')?.blur();
});
prBox.addEventListener('click', (e) => {
  if (e.target.closest('[data-prlogin]')) { setDlg.close(); setTimeout(() => $('#acctBtn').click(), 60); return; }
  if (e.target.closest('[data-prmore]')) { pr.got = null; renderPromo(); setTimeout(() => prBox.querySelector('.pr-input')?.focus(), 30); return; }
  if (e.target.closest('[data-prframe]')) { setDlg.close(); setTimeout(() => { goScreen('profileEdit'); openModal(acctDlg); }, 60); return; }
  if (e.target.closest('[data-pradm]')) { setDlg.close(); setTimeout(openPromoAdmin, 60); }
});

/* ---------- окно «Коды» для разработчика ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="prAdm" class="sheet card set-dlg pr-adm" aria-label="${tr('Промокоды')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="set-body" id="prAdmBody"></div></div>
</dialog>`);
const prAdm = $('#prAdm');
const pa = { kind: 'personal', all: false, frames: new Set(), badges: new Set(), made: null, list: null, msg: null, busy: false };
const paChip = (on, attr, inner) => `<button type="button" class="pa-chip ${on ? 'on' : ''}" ${attr}>${inner}</button>`;
function rewardShort(r) {
  const p = [];
  if (r.all) p.push(tr('все рамки'));
  if (r.frames?.length) p.push(`${tr('рамки')}: ${r.frames.map((id) => tr(frameById(id).t)).join(', ')}`);
  if (r.badges?.length) p.push(`${tr('значки')}: ${r.badges.map((b) => tr(BADGES[b]?.t || b)).join(', ')}`);
  return p.join(' · ');
}
function renderAdmin() {
  const f = $('#prAdmBody form');
  const keep = f ? Object.fromEntries(new FormData(f)) : {};
  const val = (n) => esc(keep[n] ?? '');
  const codeFrames = FRAMES.filter((x) => x.code), other = FRAMES.filter((x) => x.id && !x.code);
  const ring = (x) => `${frameRing(x)}<span>${esc(tr(x.t))}</span>`;
  const fmt = (t) => new Date(t).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
  $('#prAdmBody').innerHTML = `<h2>${icon('key')}${tr('Промокоды')}</h2>
    <form class="pa-form">
      <div class="th-seg">${[['personal', 'Личные'], ['shared', 'Общий']].map(([v, l]) => `<button type="button" class="${pa.kind === v ? 'on' : ''}" data-pakind="${v}">${tr(l)}</button>`).join('')}</div>
      <p class="set-note">${tr(pa.kind === 'personal' ? 'Каждый промокод срабатывает один раз — раздавай по одному человеку.' : 'Один промокод на всех, каждый вводит его один раз.')}</p>
      <div class="pa-row">${pa.kind === 'personal'
        ? `<label class="a-field"><span>${tr('Сколько промокодов')}</span><input name="count" type="number" min="1" max="100" value="${val('count') || 1}"></label>`
        : `<label class="a-field"><span>${tr('Свой промокод (пусто — случайный)')}</span><input name="code" maxlength="24" autocapitalize="characters" spellcheck="false" placeholder="ANITIER2026" value="${val('code')}"></label>
           <label class="a-field"><span>${tr('Сколько людей (пусто — без лимита)')}</span><input name="maxUses" type="number" min="1" value="${val('maxUses')}"></label>`}
        <label class="a-field"><span>${tr('Срок, дней (пусто — бессрочно)')}</span><input name="days" type="number" min="1" value="${val('days')}"></label></div>
      <h3 class="pa-h">${tr('Что даёт промокод')}</h3>
      <div class="pa-chips">${paChip(pa.all, 'data-paall', `${icon('sparkle') || ''}<span>${tr('Все рамки сразу')}</span>`)}${paChip(pa.all && pa.badges.has('dev') && pa.frames.has('pr_dev'), 'data-padev', `<span>${tr('Код разработчика')}</span>`)}</div>
      <small class="pa-sub">${tr('Рамки за промокоды')}</small><div class="pa-chips">${codeFrames.map((x) => paChip(pa.frames.has(x.id), `data-pafr="${x.id}"`, ring(x))).join('')}</div>
      <small class="pa-sub">${tr('Значки')}</small><div class="pa-chips">${Object.keys(BADGES).map((b) => paChip(pa.badges.has(b), `data-pabd="${b}"`, badgesHTML([b], true))).join('')}</div>
      <details class="pa-more" ${[...pa.frames].some((id) => !id.startsWith('pr_')) ? 'open' : ''}><summary>${tr('Готовые рамки')}</summary><div class="pa-chips pa-all">${other.map((x) => paChip(pa.frames.has(x.id), `data-pafr="${x.id}"`, ring(x))).join('')}</div></details>
      <label class="a-field"><span>${tr('Заметка для себя')}</span><input name="note" maxlength="80" value="${val('note')}"></label>
      ${pa.msg ? `<p class="a-msg">${esc(pa.msg)}</p>` : ''}
      <button class="btn primary wide" ${pa.busy ? 'disabled' : ''}>${tr('Создать')}</button>
    </form>
    ${pa.made ? `<div class="pa-made"><b>${tr('Готово — промокоды:')}</b><pre>${pa.made.map(esc).join('\n')}</pre><button type="button" class="btn" data-pacopy="${esc(pa.made.join('\n'))}">${icon('copy')}${tr('Скопировать все')}</button></div>` : ''}
    <h3 class="pa-h">${tr('Все промокоды')}</h3>
    <div class="pa-list">${!pa.list ? `<p class="th-prog"><span class="th-spin"></span>${tr('Загружаю…')}</p>` : !pa.list.length ? `<p class="set-note">${tr('Промокодов пока нет')}</p>`
      : pa.list.map((c) => `<div class="pa-code ${c.max_uses && c.uses >= c.max_uses ? 'used' : ''}">
          <button type="button" class="pa-c" data-pacopy="${esc(c.code)}" title="${tr('Скопировать')}">${esc(c.code)}</button>
          <span class="pa-n">${c.uses}/${c.max_uses ?? '∞'}</span>
          <button type="button" class="icon-btn" data-padel="${esc(c.code)}" aria-label="${tr('Удалить')}">${icon('trash') || '×'}</button>
          <small>${esc([tr(c.kind === 'shared' ? 'Общий' : 'Личные'), rewardShort(c.reward), c.note, c.expires_at ? tr('до {d}', { d: fmt(c.expires_at) }) : ''].filter(Boolean).join(' · '))}</small>
          ${c.who ? `<small class="pa-who">${tr('ввели')}: ${esc(c.who)}</small>` : ''}</div>`).join('')}</div>`;
}
async function loadAdminList() {
  try { pa.list = (await api('GET', '/api/admin/promo')).codes || []; } catch (e) { pa.list = []; pa.msg = e.message; }
  renderAdmin();
}
function openPromoAdmin() { pa.made = null; pa.msg = null; pa.list = null; renderAdmin(); if (!prAdm.open) openModal(prAdm); loadAdminList(); }
prAdm.addEventListener('click', async (e) => {
  if (e.target === prAdm || e.target.closest('[data-close]')) { prAdm.close(); return; }
  const t = e.target.closest('[data-pakind],[data-paall],[data-padev],[data-pafr],[data-pabd],[data-pacopy],[data-padel]');
  if (!t) return;
  if (t.dataset.pakind) pa.kind = t.dataset.pakind;
  else if (t.hasAttribute('data-paall')) pa.all = !pa.all;
  else if (t.hasAttribute('data-padev')) { pa.all = true; pa.badges.add('dev'); pa.frames.add('pr_dev'); }
  else if (t.dataset.pafr) pa.frames.has(t.dataset.pafr) ? pa.frames.delete(t.dataset.pafr) : pa.frames.add(t.dataset.pafr);
  else if (t.dataset.pabd) pa.badges.has(t.dataset.pabd) ? pa.badges.delete(t.dataset.pabd) : pa.badges.add(t.dataset.pabd);
  else if (t.dataset.pacopy) { try { await navigator.clipboard.writeText(t.dataset.pacopy); toast(tr('Скопировано')); } catch {} return; }
  else if (t.dataset.padel) {
    if (!confirm(tr('Удалить промокод {c}? Награды у тех, кто его ввёл, останутся.', { c: t.dataset.padel }))) return;
    try { await api('POST', '/api/admin/promo/delete', { code: t.dataset.padel }); } catch (err) { pa.msg = err.message; }
    return loadAdminList();
  }
  renderAdmin();
});
prAdm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (pa.busy) return;
  const v = Object.fromEntries(new FormData(e.target));
  pa.busy = true; pa.msg = null;
  try {
    const r = await api('POST', '/api/admin/promo', { kind: pa.kind, count: v.count, code: v.code, maxUses: v.maxUses, days: v.days, note: v.note, reward: { all: pa.all, frames: [...pa.frames], badges: [...pa.badges] } });
    if (r.status === 409) pa.msg = tr(r.error || ''); else { pa.made = r.codes; e.target.reset(); }
  } catch (err) { pa.msg = err.message; }
  pa.busy = false;
  if (pa.made && !pa.msg) { pa.all = false; pa.frames.clear(); pa.badges.clear(); $('#prAdmBody form')?.reset(); }
  pa.list = null; renderAdmin(); loadAdminList();
});
prAdm.addEventListener('close', () => { if (history.state?.modal === 'prAdm') history.back(); });

// при запуске освежить аккаунт: награды за промокоды, введённые на другом устройстве, и отметка разработчика
if (typeof acct !== 'undefined' && acct.token && !window.VIEWING) {
  setTimeout(() => api('GET', '/api/auth/me').then((r) => { if (r.user) { setUser(r.user); if (typeof checkAch === 'function') checkAch(true); } }).catch(() => {}), 1500);
}
