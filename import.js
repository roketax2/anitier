'use strict';
/* Импорт оценок (2026-11-18): с Shikimori по нику (REST users + GraphQL userRates, без входа)
   и с MyAnimeList — из файла экспорта (XML или .xml.gz, myanimelist.net/panel.php?go=export).
   Номера аниме у Shikimori и MAL одинаковые; данные об аниме для MAL догружаем с Shikimori. */
Object.assign(EN, {
  'Импорт с Shikimori или MAL': 'Import from Shikimori or MAL', 'Перенести свои оценки по нику или файлу': 'Bring your ratings by nickname or file',
  'Импорт оценок': 'Import ratings', 'Ник на Shikimori': 'Shikimori nickname', 'Импортировать': 'Import',
  'Файл экспорта MyAnimeList': 'MyAnimeList export file', 'Выбрать файл': 'Choose file',
  'На myanimelist.net: аватарка → Settings → Export → «Export My List» (Anime). Скачается файл .xml.gz — выбери его здесь.': 'On myanimelist.net: avatar → Settings → Export → “Export My List” (Anime). You will get an .xml.gz file — choose it here.',
  'Заменять мои оценки, если на сайте другие': 'Replace my ratings if the source differs',
  'Ищу пользователя…': 'Looking up the user…', 'Пользователь не найден': 'User not found', 'Загружаю оценки… {n}': 'Loading ratings… {n}',
  'Читаю файл…': 'Reading the file…', 'Загружаю данные об аниме… {d} из {n}': 'Loading anime info… {d} of {n}',
  'Готово: добавлено {a}, обновлено {u}, пропущено {s}': 'Done: {a} added, {u} updated, {s} skipped', 'В файле нет аниме': 'No anime in the file',
  'Не получилось: {e}': 'Failed: {e}', 'Сначала вернись к своему топу': 'Go back to your own top first', 'Профиль закрыт или список пуст': 'The profile is private or the list is empty',
});

const IMP_STATUS = { completed: 'completed', rewatching: 'completed', watching: 'watching', planned: 'planned', on_hold: 'on_hold', dropped: 'dropped' };
const MAL_STATUS = { 'completed': 'completed', 'watching': 'watching', 'plan to watch': 'planned', 'on-hold': 'on_hold', 'dropped': 'dropped' };
const impSleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function impGql(q) {
  for (let n = 0; ; n++) {
    try { return await gql(q); } catch (e) { if (n >= 3) throw e; await impSleep(2500 * (n + 1)); } // Shikimori иногда режет частые запросы
  }
}
// записать оценки: { id, score, status, at, anime? }; без anime — догрузим с Shikimori
async function impApply(list, replace, prog) {
  const need = list.filter((x) => !x.anime).map((x) => x.id);
  const snaps = new Map();
  for (let i = 0; i < need.length; i += 50) {
    prog(tr('Загружаю данные об аниме… {d} из {n}', { d: i, n: need.length }));
    const part = need.slice(i, i + 50);
    const d = await impGql(`{ animes(ids: ${JSON.stringify(part.join(','))}, limit: 50) { ${LIGHT} } }`);
    d.animes.forEach((a) => snaps.set(String(a.id), snapshot(a)));
  }
  let added = 0, upd = 0, skip = 0;
  for (const x of list) {
    const anime = x.anime ? snapshot(x.anime) : snaps.get(String(x.id));
    if (!anime) { skip++; continue; }
    const cur = db.items[x.id];
    if (cur && !replace && !(cur.score == null && x.score != null)) { skip++; continue; }
    const at = x.at || Date.now() - 2 * 864e5; // не «сегодня» — иначе импорт выдаст достижение «Взрыв»
    db.items[x.id] = { ...(cur || { note: '', added: at }), score: x.score, status: x.status, anime, updated: Date.now() };
    if (db.deleted) delete db.deleted['i:' + x.id];
    cur ? upd++ : added++;
  }
  save(); if (typeof renderPills === 'function') renderPills(); afterChange();
  return { added, upd, skip };
}
async function impShikimori(nick, replace, prog) {
  prog(tr('Ищу пользователя…'));
  const r = await fetch(`https://shikimori.io/api/users/${encodeURIComponent(nick)}?is_nickname=1`);
  if (!r.ok) throw new Error(tr('Пользователь не найден'));
  const u = await r.json();
  const list = [];
  for (let page = 1; page < 200; page++) {
    prog(tr('Загружаю оценки… {n}', { n: list.length }));
    const d = await impGql(`{ userRates(userId: ${JSON.stringify(String(u.id))}, targetType: Anime, limit: 50, page: ${page}) { score status updatedAt anime { ${LIGHT} } } }`);
    for (const x of d.userRates) if (x.anime && IMP_STATUS[x.status]) list.push({ id: String(x.anime.id), score: x.score > 0 ? x.score : null, status: IMP_STATUS[x.status], at: Date.parse(x.updatedAt) || 0, anime: x.anime });
    if (d.userRates.length < 50) break;
  }
  if (!list.length) throw new Error(tr('Профиль закрыт или список пуст'));
  return impApply(list, replace, prog);
}
async function impMal(file, replace, prog) {
  prog(tr('Читаю файл…'));
  let text;
  if (/\.gz$/i.test(file.name) && typeof DecompressionStream === 'function') text = await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  else text = await file.text();
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const val = (el, tag) => el.getElementsByTagName(tag)[0]?.textContent?.trim() || '';
  const list = [...xml.getElementsByTagName('anime')].map((el) => {
    const score = +val(el, 'my_score');
    const done = Date.parse(val(el, 'my_finish_date')) || 0;
    return { id: val(el, 'series_animedb_id'), score: score > 0 ? score : null, status: MAL_STATUS[val(el, 'my_status').toLowerCase()] || 'completed', at: done > 0 ? done : 0 };
  }).filter((x) => /^\d+$/.test(x.id));
  if (!list.length) throw new Error(tr('В файле нет аниме'));
  return impApply(list, replace, prog);
}

/* ---------- окно ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="impDlg" class="sheet card imp-dlg" aria-label="${tr('Импорт оценок')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="card-scroll"><div class="set-body imp-body">
    <h2>${tr('Импорт оценок')}</h2>
    <section class="set-sec"><h3>Shikimori</h3>
      <form class="imp-row" id="impShiki"><input name="nick" required autocomplete="off" placeholder="${tr('Ник на Shikimori')}"><button class="btn primary">${tr('Импортировать')}</button></form>
    </section>
    <section class="set-sec"><h3>MyAnimeList</h3>
      <p class="set-note">${tr('На myanimelist.net: аватарка → Settings → Export → «Export My List» (Anime). Скачается файл .xml.gz — выбери его здесь.')}</p>
      <label class="btn imp-file">${icon('upload')}<span>${tr('Выбрать файл')}</span><input type="file" id="impFile" accept=".xml,.gz,application/xml,application/gzip" hidden></label>
    </section>
    <label class="imp-check"><input type="checkbox" id="impReplace"> ${tr('Заменять мои оценки, если на сайте другие')}</label>
    <p class="imp-status" id="impStatus"></p>
  </div></div>
</dialog>`);
const impDlg = $('#impDlg');
let impBusy = false;
function openImport() { $('#impStatus').textContent = ''; openModal(impDlg); }
async function impRun(fn) {
  if (impBusy) return;
  impBusy = true;
  const st = $('#impStatus'), prog = (t) => { st.textContent = t; };
  st.classList.remove('err');
  try {
    const r = await fn(prog);
    prog(tr('Готово: добавлено {a}, обновлено {u}, пропущено {s}', { a: r.added, u: r.upd, s: r.skip }));
    toast(tr('Готово: добавлено {a}, обновлено {u}, пропущено {s}', { a: r.added, u: r.upd, s: r.skip }));
  } catch (e) { st.classList.add('err'); prog(tr('Не получилось: {e}', { e: e.message || '?' })); }
  impBusy = false;
}
$('#impShiki').addEventListener('submit', (e) => {
  e.preventDefault();
  const nick = e.target.nick.value.trim();
  if (nick) impRun((p) => impShikimori(nick, $('#impReplace').checked, p));
});
$('#impFile').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (f) impRun((p) => impMal(f, $('#impReplace').checked, p));
  e.target.value = '';
});
impDlg.addEventListener('click', (e) => { if (e.target === impDlg || e.target.closest('[data-close]')) impDlg.close(); });
impDlg.addEventListener('close', () => { if (history.state?.modal === 'impDlg') history.back(); });
