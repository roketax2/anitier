'use strict';
/* Аккаунт, синхронизация и ссылка на топ (2026-11-17).
   Сервер — anitier.stalzoneai.com (папка worker/). Способы входа: логин и пароль (код
   восстановления), почта (код из письма), Google. Топ уходит на сервер целиком с номером версии;
   если на сервере уже новее (правили с другого устройства) — сливаем по записям: у каждой
   оценки своя дата изменения, удалённые помечены в db.deleted. Пароль растягивается здесь
   (PBKDF2), сервер видит только результат. */

const API_BASE = (() => { try { return localStorage.getItem('animetop.api') || 'https://anitier.stalzoneai.com'; } catch { return 'https://anitier.stalzoneai.com'; } })();
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem('animetop.' + k)) ?? d; } catch { return d; } };
const acct = {
  token: pref('session', ''), user: readJSON('user', null), version: +pref('syncv', '0') || 0,
  config: null, status: 'idle', timer: 0, busy: false, again: false, applying: false,
  screen: 'start', msg: null, data: {}, google: null,
};
const acctDlg = $('#acct');

/* ---------- запросы ---------- */
async function api(method, path, body) {
  let r;
  try {
    r = await fetch(API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(acct.token ? { Authorization: 'Bearer ' + acct.token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    const e = new Error(tr('Нет связи с сервером — проверь интернет')); e.offline = true; throw e;
  }
  let j = {};
  try { j = await r.json(); } catch {}
  if (r.status === 401 && acct.token && /^\/api\/(top|auth\/me|auth\/password|auth\/(email|google)\/(link|unlink)|top\/share)/.test(path)) signedOut(true);
  if (!r.ok && r.status !== 409) { const e = new Error(tr(j.error || 'Сервер не ответил')); e.status = r.status; throw e; }
  return { status: r.status, ...j };
}
async function passHash(login, password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('anitier|' + login.toLowerCase()), iterations: 200000 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function loadConfig() {
  if (acct.config) return acct.config;
  try { acct.config = await api('GET', '/api/auth/config'); } catch { acct.config = { email: false, googleClientId: null, offline: true }; }
  return acct.config;
}

/* ---------- вход и выход ---------- */
function signedIn(r, msg) {
  acct.token = r.token; acct.user = r.user; acct.version = 0;
  setPref('session', r.token); setPref('user', JSON.stringify(r.user)); setPref('syncv', '0');
  updateAcctBtn();
  pull(true).then(() => { if (msg !== false) toast(tr('Вход выполнен — топ сохраняется в аккаунте')); });
}
function signedOut(expired) {
  acct.token = ''; acct.user = null; acct.version = 0;
  try { ['session', 'user', 'syncv'].forEach((k) => localStorage.removeItem('animetop.' + k)); } catch {}
  setSync('idle'); updateAcctBtn();
  if (expired) toast(tr('Вход устарел — войди снова'));
  if (acctDlg.open) { acct.screen = 'start'; renderAcct(); }
}
function setUser(u) { acct.user = u; setPref('user', JSON.stringify(u)); updateAcctBtn(); }

/* ---------- синхронизация ---------- */
const recTime = (r) => r?.updated || r?.added || 0;
function syncData() {
  return { v: 1, items: db.items, franchises: db.franchises, deleted: db.deleted || {}, ach: db.ach || {}, settings: { tierNames, tierNamesAt: +pref('tierNamesAt', '0') || 0 } };
}
function mergeTop(a, b) {
  const now = Date.now(), KEEP = 120 * 864e5, del = {};
  for (const src of [a.deleted || {}, b.deleted || {}]) for (const [k, t] of Object.entries(src)) if (t > (del[k] || 0) && now - t < KEEP) del[k] = t;
  const side = (p, A = {}, B = {}) => {
    const out = {};
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
      const x = A[k], y = B[k];
      const r = !x ? y : !y ? x : recTime(y) > recTime(x) ? y : x;
      if (r && !(del[p + k] && del[p + k] >= recTime(r))) out[k] = r;
    }
    return out;
  };
  const sa = a.settings || {}, sb = b.settings || {};
  // достижения: объединяем, дата — самая ранняя
  const ach = { ...(b.ach || {}) };
  for (const [k, t] of Object.entries(a.ach || {})) if (!ach[k] || t < ach[k]) ach[k] = t;
  return { v: 1, ach, items: side('i:', a.items, b.items), franchises: side('f:', a.franchises, b.franchises), deleted: del, settings: (sb.tierNamesAt || 0) > (sa.tierNamesAt || 0) ? sb : sa };
}
// одинаковы ли два топа по составу и датам — тогда не нужно отправлять обратно
function sameTop(a, b) {
  const sig = (t) => ['items', 'franchises'].map((p) => Object.entries(t[p] || {}).map(([k, r]) => k + ':' + recTime(r)).sort().join(',')).join('|') + '|' + Object.keys(t.deleted || {}).length + '|' + (t.settings?.tierNamesAt || 0) + '|' + Object.keys(t.ach || {}).length;
  return sig(a) === sig(b);
}
function applyTop(m) {
  db.items = m.items || {}; db.franchises = m.franchises || {}; db.deleted = m.deleted || {}; db.ach = m.ach || db.ach || {};
  const st = m.settings || {};
  if ((st.tierNamesAt || 0) > (+pref('tierNamesAt', '0') || 0)) {
    tierNames = st.tierNames || {};
    setPref('tierNames', JSON.stringify(tierNames)); setPref('tierNamesAt', String(st.tierNamesAt));
  }
  acct.applying = true; save(); acct.applying = false;
  renderPills(); afterChange();
}
function onDbSaved() {
  if (acct.applying || !acct.token || window.VIEWING) return;
  setPref('syncDirty', '1');
  clearTimeout(acct.timer);
  acct.timer = setTimeout(push, 1200);
  setSync('pending');
}
async function push() {
  if (!acct.token) return;
  if (acct.busy) { acct.again = true; return; }
  acct.busy = true; setSync('syncing');
  try {
    for (let i = 0; i < 4; i++) {
      const r = await api('PUT', '/api/top', { base: acct.version, data: syncData() });
      if (r.status === 409) { acct.version = r.version; applyTop(mergeTop(syncData(), r.data || {})); continue; }
      acct.version = r.version; setPref('syncv', String(r.version)); setPref('syncDirty', '0');
      break;
    }
    setSync('ok');
  } catch (e) { setSync(e.offline ? 'offline' : 'error', e.message); }
  acct.busy = false;
  if (acct.again) { acct.again = false; push(); }
}
async function pull(first) {
  if (!acct.token || acct.busy || window.VIEWING) return;
  acct.busy = true; setSync('syncing');
  let needPush = false;
  try {
    const r = await api('GET', '/api/top?since=' + acct.version);
    if (!r.same) {
      const remote = r.data || {};
      const merged = mergeTop(syncData(), remote);
      const before = Object.keys(db.items).length + Object.keys(db.franchises).length;
      acct.version = r.version; setPref('syncv', String(r.version));
      applyTop(merged);
      needPush = !r.data || !sameTop(merged, remote);
      if (first && r.data && before) toast(tr('Оценки с этого устройства добавлены в аккаунт'));
    }
    setSync('ok');
  } catch (e) { setSync(e.offline ? 'offline' : 'error', e.message); }
  acct.busy = false;
  if (needPush || acct.again) { acct.again = false; push(); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(); });
setInterval(() => { if (document.visibilityState === 'visible') pull(); }, 60000);

/* ---------- кнопка в шапке ---------- */
const SYNC_TEXT = { idle: '', ok: 'Топ сохранён в аккаунте', pending: 'Сохраняю…', syncing: 'Сохраняю…', offline: 'Нет связи — сохраню, когда появится интернет', error: 'Не удалось сохранить в аккаунт' };
function setSync(s, detail) {
  acct.status = s; acct.detail = detail || '';
  const b = $('#acctBtn'); if (!b) return;
  b.dataset.sync = acct.token ? s : '';
  b.title = acct.user ? `${dname(acct.user)} · ${tr(SYNC_TEXT[s] || '')}` : tr('Войти в аккаунт');
  if (acctDlg.open && acct.screen === 'profile') { const el = $('#syncLine'); if (el) el.textContent = syncLineText(); }
}
function syncLineText() {
  return acct.status === 'error' && acct.detail ? `${tr(SYNC_TEXT.error)}: ${acct.detail}` : tr(SYNC_TEXT[acct.status] || SYNC_TEXT.ok);
}
// имя для показа: ник, а если его нет — логин
const dname = (u) => u?.nick || u?.login || '';
// аватарка: картинка или первая буква ника в кружке (cls — размер)
const AVATAR_OK = /^(data:image\/(webp|jpeg|png);base64,|https:\/\/([a-z0-9-]+\.)?shikimori\.(io|one)\/)/;
function avatarHTML(u, cls, size = '') {
  const inner = avatarInner(u, cls);
  // одиночная аватарка (шапка, профиль) — с живой рамкой; неподвижные только в списках (framedThumb/frameStill)
  return typeof framed === 'function' ? framed(inner, u?.frame, size) : inner;
}
function avatarInner(u, cls) {
  const src = u?.avatar && AVATAR_OK.test(u.avatar) ? u.avatar : '';
  return src ? `<img class="${cls} ava-img" src="${esc(src)}" alt="">` : `<span class="${cls}">${esc([...dname(u)][0]?.toUpperCase() || '?')}</span>`;
}
function updateAcctBtn() {
  const b = $('#acctBtn'); if (!b) return;
  const u = acct.user;
  b.innerHTML = u ? `${avatarHTML(u, 'acct-letter', 'sm')}<i class="acct-dot"></i>` : icon('user');
  b.classList.toggle('in', !!u);
  setSync(acct.status);
}
$('#acctBtn').addEventListener('click', async () => {
  acct.msg = null; acct.screen = acct.token ? 'profile' : 'start';
  renderAcct(); openModal(acctDlg);
  await loadConfig(); if (acctDlg.open) renderAcct();
  if (acct.token) api('GET', '/api/auth/me').then((r) => { setUser(r.user); if (acct.screen === 'profile') renderAcct(); }).catch(() => {});
});

/* ---------- окно аккаунта ---------- */
const goScreen = (screen, data = {}) => { acct.screen = screen; acct.msg = null; acct.data = data; renderAcct(); };
const field = (name, label, type = 'text', extra = '') => `<label class="a-field"><span>${tr(label)}</span><input name="${name}" type="${type}" ${extra}></label>`;
const pwd = (name, label, auto = 'current-password') => field(name, label, 'password', `autocomplete="${auto}" minlength="8" required`);
const LOGIN_ATTR = 'autocomplete="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_.\\-]{3,24}" spellcheck="false" autocapitalize="off"';
const msgHTML = () => (acct.msg ? `<p class="a-msg ${acct.msg.ok ? 'ok' : ''}">${esc(acct.msg.text)}</p>` : '');
const linkBtn = (to, text) => `<button type="button" class="link" data-screen="${to}">${tr(text)}</button>`;

function renderAcct() {
  const c = acct.config || {}, u = acct.user, d = acct.data;
  const google = c.googleClientId ? '<div class="a-google" id="gBtn"></div>' : '';
  const emailOn = !!c.email;
  const offline = c.offline ? `<p class="a-msg">${tr('Сервер аккаунтов недоступен — проверь интернет. Оценки пока сохраняются на этом устройстве.')}</p>` : '';
  let h = '';
  switch (acct.screen) {
    case 'start':
      h = `<h2>${tr('Аккаунт')}</h2>
        <p class="a-lead">${tr('Войди, чтобы топ был одинаковым на телефоне и компьютере и не потерялся, если очистить браузер.')}</p>
        ${offline}${google}
        <div class="a-btns"><button class="btn primary" data-screen="login">${tr('Войти')}</button><button class="btn" data-screen="register">${tr('Создать аккаунт')}</button></div>
        ${emailOn ? `<p class="a-links">${linkBtn('emailLogin', 'Войти по коду на почту')}</p>` : ''}`;
      break;
    case 'login':
      h = `<h2>${tr('Вход')}</h2>${google}
        <form data-act="login">${field('login', 'Логин', 'text', LOGIN_ATTR)}${pwd('password', 'Пароль')}${msgHTML()}
        <button class="btn primary wide">${tr('Войти')}</button></form>
        <p class="a-links">${linkBtn('forgot', 'Забыл пароль')}${emailOn ? linkBtn('emailLogin', 'Войти по коду на почту') : ''}${linkBtn('register', 'Создать аккаунт')}</p>`;
      break;
    case 'forgot':
      h = `<h2>${tr('Забыл пароль')}</h2>
        ${emailOn ? `<p class="a-lead">${tr('Если к аккаунту привязана почта — войди по коду из письма и задай новый пароль в профиле.')}</p><button class="btn wide" data-screen="emailLogin">${tr('Войти по коду на почту')}</button>` : ''}
        <p class="a-lead">${tr('Если почты нет — нужен код восстановления, который показали при регистрации.')}</p>
        <button class="btn wide" data-screen="recover">${tr('Ввести код восстановления')}</button>
        <p class="a-links">${linkBtn('login', '← Назад ко входу')}</p>`;
      break;
    case 'register': {
      const withEmail = emailOn && d.email !== false;
      h = `<h2>${tr('Новый аккаунт')}</h2>${google}
        ${emailOn ? `<div class="seg a-seg"><button type="button" class="${withEmail ? 'on' : ''}" data-email="1">${tr('С почтой')}</button><button type="button" class="${withEmail ? '' : 'on'}" data-email="0">${tr('Без почты')}</button></div>` : ''}
        <form data-act="register">${field('login', 'Логин', 'text', LOGIN_ATTR + ` value="${esc(d.login || '')}"`)}
        <small class="a-hint">${tr('3–24 знака: латиница, цифры, точка, дефис, подчёркивание')}</small>
        ${pwd('password', 'Пароль (от 8 знаков)', 'new-password')}${pwd('password2', 'Пароль ещё раз', 'new-password')}
        ${withEmail ? `${field('email', 'Почта', 'email', `autocomplete="email" required value="${esc(d.emailAddr || '')}"`)}
          <div class="a-code">${field('code', 'Код из письма', 'text', 'inputmode="numeric" maxlength="6" pattern="\\d{6}" autocomplete="one-time-code"')}<button type="button" class="btn" data-send="register">${tr(d.sent ? 'Ещё раз' : 'Прислать код')}</button></div>
          <small class="a-hint">${tr('По почте можно войти без пароля и сбросить забытый пароль.')}</small>`
          : `<small class="a-hint">${tr('После регистрации покажем код восстановления — он нужен, если забудешь пароль.')}</small>`}
        ${msgHTML()}<button class="btn primary wide">${tr('Создать аккаунт')}</button></form>
        <p class="a-links">${linkBtn('login', 'Уже есть аккаунт? Войти')}</p>`;
      break;
    }
    case 'emailLogin':
      h = `<h2>${tr('Вход по почте')}</h2>
        <form data-act="emailLogin">${field('email', 'Почта', 'email', `autocomplete="email" required value="${esc(d.emailAddr || '')}"`)}
        <div class="a-code">${field('code', 'Код из письма', 'text', 'inputmode="numeric" maxlength="6" pattern="\\d{6}" autocomplete="one-time-code"')}<button type="button" class="btn" data-send="login">${tr(d.sent ? 'Ещё раз' : 'Прислать код')}</button></div>
        ${msgHTML()}<button class="btn primary wide">${tr('Войти')}</button></form>
        <p class="a-links">${linkBtn('login', '← Войти по паролю')}</p>`;
      break;
    case 'recover':
      h = `<h2>${tr('Код восстановления')}</h2>
        <form data-act="recover">${field('login', 'Логин', 'text', LOGIN_ATTR)}
        ${field('code', 'Код восстановления', 'text', 'required placeholder="XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" spellcheck="false"')}
        ${pwd('password', 'Новый пароль', 'new-password')}${pwd('password2', 'Новый пароль ещё раз', 'new-password')}
        ${msgHTML()}<button class="btn primary wide">${tr('Сменить пароль и войти')}</button></form>
        <p class="a-links">${linkBtn('login', '← Назад ко входу')}</p>`;
      break;
    case 'recoveryShow':
      h = `<h2>${tr('Сохрани код восстановления')}</h2>
        <p class="a-lead">${tr('Если забудешь пароль, войти можно будет только с этим кодом. Он показывается один раз — сфотографируй, запиши или сохрани в заметки.')}</p>
        <div class="a-recovery" id="recCode">${esc(d.code)}</div>
        <div class="a-btns"><button class="btn" data-copy="${esc(d.code)}">${icon('copy')}${tr('Скопировать')}</button><button class="btn primary" data-screen="profile">${tr('Я сохранил код')}</button></div>`;
      break;
    case 'googleNew':
      h = `<h2>${tr('Новый аккаунт через Google')}</h2>
        <p class="a-lead">${tr('Придумай логин — его увидят те, кому ты дашь ссылку на свой топ.')}</p>
        <form data-act="googleNew">${field('login', 'Логин', 'text', LOGIN_ATTR + ` value="${esc(d.suggested || '')}"`)}${msgHTML()}
        <button class="btn primary wide">${tr('Создать аккаунт')}</button></form>
        <p class="a-links">${linkBtn('start', '← Назад')}</p>`;
      break;
    case 'profile': {
      if (!u) { acct.screen = 'start'; return renderAcct(); }
      const shareUrl = u.shareId ? `${location.origin}${location.pathname}?u=${u.shareId}` : '';
      h = `<div class="a-head"><button class="a-ava-btn" data-screen="profileEdit" title="${tr('Сменить аву')}">${avatarHTML(u, 'a-avatar')}<i>${icon('edit')}</i></button>
          <div class="a-who"><h2>${esc(dname(u))}</h2>
          <p class="a-sync">${u.nick ? `${tr('логин')}: ${esc(u.login)} · ` : ''}<span id="syncLine">${esc(syncLineText())}</span></p></div></div>
        <button class="btn wide" data-screen="profileEdit">${icon('edit')}${tr('Ник, аватарка и рамка')}</button>
        ${achStripHTML()}
        ${msgHTML()}
        <section class="a-sec"><h3>${tr('Ссылка на мой топ')}</h3>
          <p class="a-lead">${tr('По ссылке видно твой топ и оценки — без заметок. Менять его по ссылке нельзя. Друг, открыв ссылку, увидит, насколько ваши вкусы совпадают.')}</p>
          ${shareUrl ? `<div class="a-share"><input readonly value="${esc(shareUrl)}" id="shareUrl"><button class="btn primary" data-copy="${esc(shareUrl)}">${icon('copy')}${tr('Скопировать')}</button></div>
            <p class="a-links"><button class="link" data-act2="shareRenew">${tr('Сделать новую ссылку')}</button><button class="link danger" data-act2="shareOff">${tr('Закрыть ссылку')}</button></p>`
          : `<button class="btn wide" data-act2="shareOn">${icon('link')}${tr('Открыть ссылку на топ')}</button>`}
        </section>
        <section class="a-sec"><h3>${tr('Способы входа')}</h3>
          <div class="a-row"><span>${tr('Пароль')}</span><b>${u.hasPassword ? tr('есть') : tr('нет')}</b><button class="link" data-screen="password">${u.hasPassword ? tr('Сменить') : tr('Задать')}</button></div>
          <div class="a-row"><span>${tr('Почта')}</span><b>${u.email ? esc(u.email) : tr('нет')}</b>${u.email ? `<button class="link" data-act2="emailUnlink">${tr('Отвязать')}</button>` : emailOn ? `<button class="link" data-screen="emailLink">${tr('Привязать')}</button>` : ''}</div>
          <div class="a-row"><span>Google</span><b>${u.google ? tr('привязан') : tr('нет')}</b>${u.google ? `<button class="link" data-act2="googleUnlink">${tr('Отвязать')}</button>` : ''}</div>
          ${!u.google && c.googleClientId ? '<div class="a-google" id="gBtn"></div>' : ''}
        </section>
        <div class="a-btns"><button class="btn" data-act2="logout">${tr('Выйти')}</button><button class="link danger" data-screen="delete">${tr('Удалить аккаунт')}</button></div>`;
      break;
    }
    case 'profileEdit': {
      if (!u) { acct.screen = 'start'; return renderAcct(); }
      if (!('avatar' in d)) { d.avatar = u.avatar || null; d.nick = u.nick || ''; d.frame = u.frame || ''; }
      const posters = d.posters ? myPosters() : [];
      h = `<h2>${tr('Ник и аватарка')}</h2>
        <form data-act="profile">
          <div class="a-ava-edit">${avatarHTML({ ...u, nick: d.nick || u.nick, avatar: d.avatar, frame: d.frame }, 'a-avatar big', 'lg')}
            <div class="a-ava-btns">
              <button type="button" class="btn" data-ava="upload">${icon('upload')}${tr('Загрузить фото')}</button>
              <button type="button" class="btn" data-ava="posters">${icon('tiers')}${tr('Постер из моего топа')}</button>
              ${d.avatar ? `<button type="button" class="link" data-ava="clear">${tr('Убрать аву — будет буква')}</button>` : ''}
            </div>
          </div>
          ${d.posters ? (posters.length ? `<div class="a-posters">${posters.map((p) => `<button type="button" class="${p === d.avatar ? 'on' : ''}" data-poster="${esc(p)}"><img loading="lazy" src="${esc(p)}" alt=""></button>`).join('')}</div>`
            : `<p class="a-hint">${tr('В твоём топе пока нет постеров — добавь аниме.')}</p>`) : ''}
          <div class="a-frames-h"><span>${tr('Рамка')}</span><small id="frameSt">${tr('Новые рамки открываются достижениями')}</small></div>
          <div class="a-frames">${FRAMES.map((f) => { const open = frameOpen(f); const need = f.need && ACH.find((x) => x.id === f.need);
            return `<button type="button" class="${(d.frame || '') === f.id ? 'on' : ''} ${open ? '' : 'locked'}" data-frame="${f.id}" ${open ? '' : 'aria-disabled="true"'} title="${esc(open ? tr(f.t) : tr('Откроется за «{a}»: {d}', { a: tr(need.t), d: need.g === 'secret' ? tr('секретное достижение') : tr(need.d) }))}">${framedThumb(avatarInner({ ...u, nick: d.nick || u.nick, avatar: d.avatar }, 'a-avatar'), f.id)}<small>${open ? '' : `<span class="lk">${glyphSvg('lock')}</span>`}${esc(tr(f.t))}</small></button>`; }).join('')}</div>
          <label class="a-field"><span>${tr('Ник')}</span><input name="nick" maxlength="40" value="${esc(d.nick)}" placeholder="${esc(u.login)}"></label>
          <small class="a-hint">${tr('2–24 знака, можно по-русски и с эмодзи. Ник видят по ссылке на топ. Входить всё так же по логину {l}.', { l: u.login })}</small>
          ${msgHTML()}<button class="btn primary wide">${tr('Сохранить')}</button>
        </form>
        <input type="file" id="avaFile" accept="image/*" hidden>
        <p class="a-links">${linkBtn('profile', '← Назад')}</p>`;
      break;
    }
    case 'password':
      h = `<h2>${u?.hasPassword ? tr('Сменить пароль') : tr('Задать пароль')}</h2>
        <form data-act="password">${u?.hasPassword ? pwd('old', 'Текущий пароль') + `<small class="a-hint">${tr('Вошёл по почте или через Google только что — текущий пароль можно не вводить.')}</small>` : ''}
        ${pwd('password', 'Новый пароль', 'new-password')}${pwd('password2', 'Новый пароль ещё раз', 'new-password')}${msgHTML()}
        <button class="btn primary wide">${tr('Сохранить')}</button></form><p class="a-links">${linkBtn('profile', '← Назад')}</p>`;
      break;
    case 'emailLink':
      h = `<h2>${tr('Привязать почту')}</h2>
        <form data-act="emailLink">${field('email', 'Почта', 'email', `autocomplete="email" required value="${esc(d.emailAddr || '')}"`)}
        <div class="a-code">${field('code', 'Код из письма', 'text', 'inputmode="numeric" maxlength="6" pattern="\\d{6}" autocomplete="one-time-code"')}<button type="button" class="btn" data-send="link">${tr(d.sent ? 'Ещё раз' : 'Прислать код')}</button></div>
        ${msgHTML()}<button class="btn primary wide">${tr('Привязать')}</button></form><p class="a-links">${linkBtn('profile', '← Назад')}</p>`;
      break;
    case 'delete':
      h = `<h2>${tr('Удалить аккаунт')}</h2>
        <p class="a-lead">${tr('Аккаунт и топ на сервере удалятся навсегда, ссылка на топ перестанет работать. Оценки на этом устройстве останутся.')}</p>
        <form data-act="delete">${u?.hasPassword ? pwd('password', 'Пароль') : `<small class="a-hint">${tr('У аккаунта нет пароля: войди заново через Google или по почте и сразу удаляй.')}</small>`}${msgHTML()}
        <button class="btn danger wide">${tr('Удалить навсегда')}</button></form><p class="a-links">${linkBtn('profile', '← Назад')}</p>`;
      break;
  }
  $('#acctBody').innerHTML = h;
  if ($('#gBtn')) mountGoogle($('#gBtn'), acct.screen === 'profile' ? 'link' : 'login');
}

/* ---------- Google ---------- */
let gisLoading = null;
function loadGis() {
  gisLoading ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = res; s.onerror = () => { gisLoading = null; rej(new Error('gis')); };
    document.head.appendChild(s);
  });
  return gisLoading;
}
async function mountGoogle(box, mode) {
  try { await loadGis(); } catch { box.innerHTML = `<p class="a-hint">${tr('Кнопка Google не загрузилась')}</p>`; return; }
  if (!box.isConnected) return;
  google.accounts.id.initialize({ client_id: acct.config.googleClientId, callback: (r) => onGoogle(r.credential, mode), ux_mode: 'popup', auto_select: false });
  google.accounts.id.renderButton(box, { theme: 'filled_black', size: 'large', shape: 'pill', width: Math.min(box.clientWidth || 320, 400), text: mode === 'link' ? 'continue_with' : 'signin_with', locale: LANG });
}
async function onGoogle(credential, mode) {
  try {
    if (mode === 'link') {
      const r = await api('POST', '/api/auth/google/link', { credential });
      setUser(r.user); acct.msg = { ok: true, text: tr('Google привязан') }; renderAcct(); return;
    }
    const r = await api('POST', '/api/auth/google', { credential });
    if (r.needsLogin) { goScreen('googleNew', { credential, suggested: r.suggestedLogin }); return; }
    signedIn(r); goScreen('profile');
  } catch (e) { acct.msg = { text: e.message }; renderAcct(); }
}

/* ---------- действия ---------- */
function formVals(f) { return Object.fromEntries(new FormData(f).entries()); }
function samePasswords(v) {
  if (v.password !== v.password2) throw new Error(tr('Пароли не совпадают'));
}
acctDlg.addEventListener('click', async (e) => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.screen) { e.preventDefault(); goScreen(t.dataset.screen); return; }
  if (t.dataset.email) { acct.data = { ...acct.data, email: t.dataset.email === '1' }; keepForm(); renderAcct(); return; }
  if (t.dataset.copy) {
    try { await navigator.clipboard.writeText(t.dataset.copy); toast(tr('Скопировано')); } catch { const i = $('#shareUrl'); if (i) { i.select(); document.execCommand('copy'); toast(tr('Скопировано')); } }
    return;
  }
  if (t.dataset.send) { e.preventDefault(); await sendCode(t.dataset.send, t); return; }
  if (t.dataset.frame !== undefined) {
    // окно целиком не перерисовываем (в нём десятки рамок — это и тормозило): меняем подсветку и превью и сразу сохраняем
    const f = frameById(t.dataset.frame), st = $('#frameSt', acctDlg), u = acct.user;
    if (!frameOpen(f)) { const need = ACH.find((x) => x.id === f.need); if (st) st.textContent = tr('Рамка «{f}» откроется за достижение «{a}»', { f: tr(f.t), a: need.g === 'secret' ? '???' : tr(need.t) }); return; }
    if ((acct.data.frame || '') === f.id) return;
    acct.data.frame = f.id;
    $$('.a-frames button', acctDlg).forEach((b) => b.classList.toggle('on', b === t));
    const pv = $('.a-ava-edit', acctDlg)?.firstElementChild;
    if (pv && u) pv.outerHTML = avatarHTML({ ...u, nick: acct.data.nick || u.nick, avatar: acct.data.avatar, frame: f.id }, 'a-avatar big', 'lg');
    if (st) st.textContent = tr('Сохраняю…');
    const token = (acct.frameSave = (acct.frameSave || 0) + 1);
    try {
      const r = await api('POST', '/api/auth/profile', { frame: f.id || null });
      if (token !== acct.frameSave) return; // уже выбрали другую
      setUser(r.user);
      if (st) st.textContent = tr('Рамка «{f}» сохранена', { f: tr(f.t) });
    } catch (err) { if (st && token === acct.frameSave) st.textContent = err.message || tr('Не удалось сохранить'); }
    return;
  }
  if (t.dataset.ava || t.dataset.poster) {
    const nick = $('input[name="nick"]', acctDlg)?.value; if (nick !== undefined) acct.data.nick = nick;
    acct.msg = null;
    if (t.dataset.ava === 'upload') { $('#avaFile').click(); return; }
    if (t.dataset.ava === 'posters') acct.data.posters = !acct.data.posters;
    if (t.dataset.ava === 'clear') acct.data.avatar = null;
    if (t.dataset.poster) acct.data.avatar = t.dataset.poster;
    renderAcct(); return;
  }
  const a = t.dataset.act2; if (!a) return;
  t.disabled = true;
  try {
    if (a === 'logout') {
      try { await api('POST', '/api/auth/logout', {}); } catch {}
      signedOut(); toast(tr('Ты вышел из аккаунта. Оценки остались на этом устройстве.')); return;
    }
    if (a === 'shareOn' || a === 'shareRenew') { if (acct.timer || acct.busy) await push(); setUser((await api('POST', '/api/top/share', { on: true, renew: a === 'shareRenew' })).user); acct.msg = { ok: true, text: tr(a === 'shareOn' ? 'Ссылка открыта — скопируй и отправь' : 'Новая ссылка готова, старая больше не работает') }; }
    if (a === 'toStats') { acctDlg.close(); show('mine'); setLayout('stats'); setPref('achOpen', '1'); renderMine(); setTimeout(() => $('.st-ach')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); return; }
    if (a === 'shareOff') { setUser((await api('POST', '/api/top/share', { on: false })).user); acct.msg = { ok: true, text: tr('Ссылка закрыта') }; }
    if (a === 'emailUnlink') { setUser((await api('POST', '/api/auth/email/unlink', {})).user); acct.msg = { ok: true, text: tr('Почта отвязана') }; }
    if (a === 'googleUnlink') { setUser((await api('POST', '/api/auth/google/unlink', {})).user); acct.msg = { ok: true, text: tr('Google отвязан') }; }
  } catch (err) { acct.msg = { text: err.message }; }
  renderAcct();
});
// полоска полученных достижений в профиле
function achStripHTML() {
  const ach = db.ach || {}, got = ACH.filter((x) => ach[x.id]);
  return `<section class="a-sec"><h3>${tr('Достижения')} · ${got.length} ${tr('из')} ${ACH.length}</h3>
    <div class="a-ach">${got.length ? got.map((x) => `<span title="${esc(tr(x.t))}">${achIcon(x)}</span>`).join('') : `<small class="a-hint">${tr('Пока нет — оцени первое аниме')}</small>`}</div>
    <button class="link" data-act2="toStats">${tr('Все достижения — в «Статистике»')}</button></section>`;
}
// постеры аниме из своего топа — для аватарки
function myPosters() {
  const seen = new Set();
  for (const r of [...Object.values(db.franchises), ...Object.values(db.items)].sort((a, b) => (b.score || 0) - (a.score || 0))) {
    const p = r.anime?.poster;
    if (p && AVATAR_OK.test(p) && !p.includes('missing')) seen.add(p);
    if (seen.size >= 40) break;
  }
  return [...seen];
}
// своё фото → квадрат 160×160 из середины, webp (или jpeg, если браузер не умеет webp)
async function avatarFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const cv = document.createElement('canvas'); cv.width = cv.height = 160;
    cv.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 160, 160);
    let out = cv.toDataURL('image/webp', 0.82);
    if (!out.startsWith('data:image/webp')) out = cv.toDataURL('image/jpeg', 0.85);
    for (let q = 0.7; out.length > 46000 && q > 0.3; q -= 0.15) out = cv.toDataURL('image/jpeg', q);
    return out;
  } finally { URL.revokeObjectURL(url); }
}
acctDlg.addEventListener('change', async (e) => {
  if (e.target.id !== 'avaFile') return;
  const f = e.target.files[0]; if (!f) return;
  try { acct.data.avatar = await avatarFromFile(f); acct.data.posters = false; acct.msg = null; }
  catch { acct.msg = { text: tr('Не получилось открыть картинку — выбери другую') }; }
  renderAcct();
});
// перерисовка (переключатель «с почтой») не должна стирать введённое
function keepForm() {
  const f = $('form', acctDlg); if (!f) return;
  const v = formVals(f);
  acct.data = { ...acct.data, login: v.login ?? acct.data.login, emailAddr: v.email ?? acct.data.emailAddr };
}
async function sendCode(purpose, btn) {
  const f = btn.closest('form'); const v = formVals(f);
  const email = (v.email || '').trim();
  if (!email || !f.elements.email.checkValidity()) { acct.msg = { text: tr('Введи почту') }; keepForm(); renderAcct(); return; }
  if (purpose === 'register' && !f.elements.login.checkValidity()) { acct.msg = { text: tr('Сначала придумай логин: 3–24 знака, латиница, цифры, точка, дефис, подчёркивание') }; keepForm(); renderAcct(); return; }
  btn.disabled = true;
  try {
    const r = await api('POST', '/api/auth/email/code', { purpose, email, login: v.login, locale: LANG });
    keepForm(); acct.data.sent = true;
    acct.msg = { ok: true, text: tr('Код отправлен на {e}. Проверь и «Спам».', { e: r.sentTo || email }) + (r.devCode ? ` [${r.devCode}]` : '') };
  } catch (err) { keepForm(); acct.msg = { text: err.message }; }
  renderAcct();
  $('input[name="code"]', acctDlg)?.focus();
}
acctDlg.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target, act = f.dataset.act, v = formVals(f);
  const btn = $('button.primary, button.danger', f); if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = tr('Подожди…'); }
  try {
    if (act === 'login') {
      const r = await api('POST', '/api/auth/login', { login: v.login.trim(), passwordHash: await passHash(v.login.trim(), v.password) });
      signedIn(r); goScreen('profile');
    } else if (act === 'register') {
      samePasswords(v);
      const body = { login: v.login.trim(), passwordHash: await passHash(v.login.trim(), v.password) };
      if (v.email !== undefined) Object.assign(body, { email: v.email.trim(), emailCode: (v.code || '').trim() });
      const r = await api('POST', '/api/auth/register', body);
      signedIn(r);
      if (r.recoveryCode) goScreen('recoveryShow', { code: r.recoveryCode }); else goScreen('profile');
    } else if (act === 'emailLogin') {
      const r = await api('POST', '/api/auth/email/login', { email: v.email.trim(), code: (v.code || '').trim() });
      signedIn(r); goScreen('profile');
    } else if (act === 'recover') {
      samePasswords(v);
      const r = await api('POST', '/api/auth/recover', { login: v.login.trim(), recoveryCode: v.code, newPasswordHash: await passHash(v.login.trim(), v.password) });
      signedIn(r); goScreen('recoveryShow', { code: r.recoveryCode });
    } else if (act === 'googleNew') {
      const r = await api('POST', '/api/auth/google/register', { login: v.login.trim(), credential: acct.data.credential });
      signedIn(r); goScreen('profile');
    } else if (act === 'password') {
      samePasswords(v);
      const login = acct.user.login;
      const r = await api('POST', '/api/auth/password', { newPasswordHash: await passHash(login, v.password), ...(v.old ? { oldPasswordHash: await passHash(login, v.old) } : {}) });
      setUser(r.user); goScreen('profile'); acct.msg = { ok: true, text: tr('Пароль сохранён. На других устройствах нужно войти заново.') }; renderAcct();
    } else if (act === 'profile') {
      const r = await api('POST', '/api/auth/profile', { nick: (v.nick || '').trim() || null, avatar: acct.data.avatar || null, frame: acct.data.frame || null });
      setUser(r.user); goScreen('profile'); acct.msg = { ok: true, text: tr('Профиль сохранён') }; renderAcct();
    } else if (act === 'emailLink') {
      const r = await api('POST', '/api/auth/email/link', { email: v.email.trim(), code: (v.code || '').trim() });
      setUser(r.user); goScreen('profile'); acct.msg = { ok: true, text: tr('Почта привязана') }; renderAcct();
    } else if (act === 'delete') {
      if (!confirm(tr('Удалить аккаунт навсегда?'))) throw new Error(tr('Удаление отменено'));
      await api('POST', '/api/auth/delete', v.password ? { passwordHash: await passHash(acct.user.login, v.password) } : {});
      signedOut(); toast(tr('Аккаунт удалён. Оценки на этом устройстве остались.')); acctDlg.close();
    }
  } catch (err) {
    keepForm(); acct.msg = { text: err.message }; renderAcct();
  }
});

/* ---------- чужой топ по ссылке (?u=...) ---------- */
async function openShared(id) {
  window.VIEWING = { login: '…' };
  document.body.classList.add('viewing');
  const own = db; // свой топ — для сравнения вкусов (compare.js)
  try {
    const r = await api('GET', '/api/shared/' + encodeURIComponent(id));
    const who = dname(r);
    window.VIEWING = { login: who, updatedAt: r.updatedAt };
    db = { version: 1, items: r.data.items || {}, franchises: r.data.franchises || {}, deleted: {}, ach: r.data.ach || {} };
    tierNames = r.data.settings?.tierNames || {};
    $('#viewBanner').innerHTML = `<span class="vb-who">${avatarHTML(r, 'a-avatar small', 'sm')}<span>${tr('Топ пользователя')} <b>${esc(who)}</b> · <span class="vb-ach">${icon('trophy')}${Object.keys(r.data.ach || {}).filter((k) => ACH.some((x) => x.id === k)).length}</span>${r.updatedAt ? ` · ${tr('обновлён')} ${new Date(r.updatedAt).toLocaleDateString(LOCALE)}` : ''}</span></span><button class="btn" id="viewExit">${tr('К своему топу')}</button>`;
    $('#view-mine h1').textContent = tr('Топ {l}', { l: who });
    if (typeof renderCompare === 'function') renderCompare(own, who);
  } catch (e) {
    $('#viewBanner').innerHTML = `<span>${esc(e.status === 404 ? tr('Ссылка не работает — топ закрыли или ссылку сменили') : e.message)}</span><button class="btn" id="viewExit">${tr('К своему топу')}</button>`;
    db = { version: 1, items: {}, franchises: {}, deleted: {} };
  }
  $('#viewBanner').hidden = false;
  $('#viewExit').addEventListener('click', () => { location.href = location.pathname; });
  updateCount(); renderPills(); show('mine');
}

/* ---------- старт ---------- */
updateAcctBtn();
const sharedId = new URLSearchParams(location.search).get('u');
if (sharedId) openShared(sharedId);
else if (new URLSearchParams(location.search).get('preview') === 'all') { window.VIEWING = { login: '' }; document.body.classList.add('viewing'); showPreview(acct.user); }
else if (acct.token) pull().then(() => { if (pref('syncDirty', '0') === '1') push(); });
