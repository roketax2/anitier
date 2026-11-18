'use strict';
/* Настройки (2026-11-18): счётчик игроков, язык, анимация рамок.
   Счётчик: раз в 5 минут, пока вкладка открыта, сайт шлёт на сервер свой случайный номер (без IP и логина). */
Object.assign(EN, {
  'Настройки': 'Settings', 'Язык, анимация рамок, сколько нас': 'Language, frame animation, player count',
  'Игроки': 'Players', 'сейчас на сайте': 'online now', 'за сутки': 'last 24 hours', 'всего': 'all time', 'с аккаунтом': 'with an account',
  'Считаю…': 'Counting…', 'Не получилось узнать — нет связи с сервером': "Couldn't load — no connection to the server",
  'Считаются все, кто открывал сайт, — по случайному номеру, без имён и адресов.': 'Everyone who opened the site is counted by a random number — no names or addresses.',
  'Язык': 'Language', 'Анимация рамок': 'Frame animation',
  'Рамки двигаются': 'Frames are animated', 'Рамки стоят — если телефон или ноутбук тормозит': 'Frames stay still — if your phone or laptop lags',
});

/* ---------- пинг: «я на сайте» ---------- */
const visitorId = (() => {
  let id = pref('vid', '');
  if (!/^[a-z0-9]{16,40}$/.test(id)) {
    const b = new Uint8Array(12); crypto.getRandomValues(b);
    id = [...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 24);
    setPref('vid', id);
  }
  return id;
})();
let pingAt = 0;
function sitePing() {
  if (document.hidden || Date.now() - pingAt < 290000) return;
  pingAt = Date.now();
  fetch(API_BASE + '/api/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: visitorId }), keepalive: true }).catch(() => {});
}
sitePing();
setInterval(sitePing, 300000);
document.addEventListener('visibilitychange', sitePing);

/* ---------- анимация рамок ---------- */
const framesStill = () => pref('frameAnim', '1') === '0';
document.body.classList.toggle('fr-off', framesStill());

/* ---------- окно ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="setDlg" class="sheet card set-dlg" aria-label="${tr('Настройки')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="set-body" id="setBody"></div></div>
</dialog>`);
const setDlg = $('#setDlg');
setDlg.addEventListener('close', () => { if (history.state?.modal === 'setDlg') history.back(); });

const fmtN = (n) => Number(n || 0).toLocaleString(EN_ON ? 'en' : 'ru');
function renderSettings(st) {
  const tile = (n, t, live) => `<div class="set-tile${live ? ' live' : ''}"><b>${st ? fmtN(n) : '—'}</b><span>${live ? '<i class="set-dot"></i>' : ''}${tr(t)}</span></div>`;
  const still = framesStill();
  $('#setBody').innerHTML = `<h2>${tr('Настройки')}</h2>
    <section class="set-sec"><h3>${icon('user')}${tr('Игроки')}</h3>
      <div class="set-tiles">${tile(st?.online, 'сейчас на сайте', true)}${tile(st?.today, 'за сутки')}${tile(st?.total, 'всего')}${tile(st?.accounts, 'с аккаунтом')}</div>
      <p class="set-note">${st === undefined ? tr('Считаю…') : st ? tr('Считаются все, кто открывал сайт, — по случайному номеру, без имён и адресов.') : tr('Не получилось узнать — нет связи с сервером')}</p>
    </section>
    <section class="set-sec"><h3>${icon('globe')}${tr('Язык')}</h3>
      <div class="set-seg"><button type="button" data-lang="ru" class="${EN_ON ? '' : 'on'}">Русский</button><button type="button" data-lang="en" class="${EN_ON ? 'on' : ''}">English</button></div>
    </section>
    <section class="set-sec"><h3>${icon('layers')}${tr('Анимация рамок')}</h3>
      <div class="set-seg"><button type="button" data-anim="1" class="${still ? '' : 'on'}">${tr('Рамки двигаются')}</button><button type="button" data-anim="0" class="${still ? 'on' : ''}">${tr('Рамки стоят — если телефон или ноутбук тормозит')}</button></div>
    </section>`;
}
async function loadStats() {
  try {
    const r = await fetch(API_BASE + '/api/stats');
    if (!r.ok) throw 0;
    const st = await r.json();
    if (setDlg.open) renderSettings(st);
  } catch { if (setDlg.open) renderSettings(null); }
}
function openSettings() {
  renderSettings(undefined);
  openModal(setDlg);
  sitePing(); loadStats();
}
setDlg.addEventListener('click', (e) => {
  if (e.target === setDlg || e.target.closest('[data-close]')) { setDlg.close(); return; }
  const l = e.target.closest('[data-lang]');
  if (l) { if ((l.dataset.lang === 'en') !== EN_ON) { setPref('lang', l.dataset.lang); location.reload(); } return; }
  const a = e.target.closest('[data-anim]');
  if (a) {
    setPref('frameAnim', a.dataset.anim);
    document.body.classList.toggle('fr-off', a.dataset.anim === '0');
    $$('[data-anim]', setDlg).forEach((b) => b.classList.toggle('on', b === a));
  }
});
