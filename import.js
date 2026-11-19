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
  'С Shikimori, MAL, AniXart или списком': 'From Shikimori, MAL, AniXart or a list', 'Списком названий': 'From a list of titles',
  'AniXart и любые другие списки: по одному аниме в строке, оценку можно дописать в конце через тире.': 'AniXart or any other list: one anime per line, add a rating at the end after a dash.',
  'Оценки по 5 звёзд (как в AniXart) — перевести в 10 баллов': 'Ratings are 5 stars (like AniXart) — convert to 10 points',
  'Найти': 'Find', 'Ищу аниме… {d} из {n}': 'Searching… {d} of {n}', 'Не найдено': 'Not found', '— не добавлять —': '— skip —',
  'Нашёл {a} из {n}. Проверь совпадения — неверное можно поменять или убрать.': 'Found {a} of {n}. Check the matches — change or remove wrong ones.',
  'Перенос оценок': 'Move ratings', 'Импорт с Shikimori, MAL, AniXart и копия в файл': 'Import from Shikimori, MAL, AniXart and a backup file', 'Язык, промокод, анимация рамок': 'Language, promo code, frame animation',
  'Оценки сохраняются в твоём аккаунте. Данные об аниме — Shikimori.': 'Ratings are saved to your account. Anime data — Shikimori.', 'Без аккаунта оценки хранятся только на этом устройстве. Данные об аниме — Shikimori.': 'Without an account, ratings stay only on this device. Anime data — Shikimori.',
  'Копия топа': 'Backup', 'Файл со всеми твоими оценками — на всякий случай. Из него же можно всё вернуть.': 'A file with all your ratings, just in case. You can restore everything from it.', 'Сохранить в файл': 'Save to file', 'Загрузить из файла': 'Load from file',
  'Добавить {n}': 'Add {n}', 'Статус': 'Status', 'Список пуст': 'The list is empty', 'без оценки': 'no rating', 'Назад': 'Back',
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
    <h2>${tr('Перенос оценок')}</h2>
    <section class="set-sec"><h3>Shikimori</h3>
      <form class="imp-row" id="impShiki"><input name="nick" required autocomplete="off" placeholder="${tr('Ник на Shikimori')}"><button class="btn primary">${tr('Импортировать')}</button></form>
    </section>
    <section class="set-sec"><h3>MyAnimeList</h3>
      <p class="set-note">${tr('На myanimelist.net: аватарка → Settings → Export → «Export My List» (Anime). Скачается файл .xml.gz — выбери его здесь.')}</p>
      <label class="btn imp-file">${icon('upload')}<span>${tr('Выбрать файл')}</span><input type="file" id="impFile" accept=".xml,.gz,application/xml,application/gzip" hidden></label>
    </section>
    <section class="set-sec"><h3>${tr('Списком названий')}</h3>
      <p class="set-note">${tr('AniXart и любые другие списки: по одному аниме в строке, оценку можно дописать в конце через тире.')}</p>
      <form class="imp-list" id="impList">
        <textarea name="text" rows="5" maxlength="20000" spellcheck="false" placeholder="Атака титанов — 9&#10;Тетрадь смерти — 10&#10;Провожающая в последний путь Фрирен"></textarea>
        <label class="imp-check"><input type="checkbox" name="five"> ${tr('Оценки по 5 звёзд (как в AniXart) — перевести в 10 баллов')}</label>
        <button class="btn primary">${tr('Найти')}</button>
      </form>
      <div class="imp-review" id="impReview" hidden></div>
    </section>
    <section class="set-sec"><h3>${tr('Копия топа')}</h3>
      <p class="set-note">${tr('Файл со всеми твоими оценками — на всякий случай. Из него же можно всё вернуть.')}</p>
      <div class="imp-bk"><button type="button" class="btn" data-impsave>${icon('download')}<span>${tr('Сохранить в файл')}</span></button><button type="button" class="btn" data-impload>${icon('upload')}<span>${tr('Загрузить из файла')}</span></button></div>
    </section>
    <label class="imp-check"><input type="checkbox" id="impReplace"> ${tr('Заменять мои оценки, если на сайте другие')}</label>
    <p class="imp-status" id="impStatus"></p>
  </div></div>
</dialog>`);
const impDlg = $('#impDlg');
let impBusy = false;
function openImport() { $('#impStatus').textContent = ''; $('#impReview').hidden = true; $('#impList').hidden = false; openModal(impDlg); }
async function impRun(fn) {
  if (impBusy) return;
  impBusy = true;
  const st = $('#impStatus'), prog = (t) => { st.textContent = t; };
  st.classList.remove('err');
  try {
    const r = await fn(prog);
    if (!r) { impBusy = false; return; }
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
impDlg.addEventListener('click', (e) => {
  if (e.target === impDlg || e.target.closest('[data-close]')) { impDlg.close(); return; }
  if (e.target.closest('[data-impsave]')) exportTop();
  if (e.target.closest('[data-impload]')) $('#importFile').click();
});
impDlg.addEventListener('close', () => { if (history.state?.modal === 'impDlg') history.back(); });

/* ---------- импорт списком названий (20.11): AniXart и любые другие списки — ищем каждое название на Shikimori ---------- */
// «Атака титанов — 9», «1. Тетрадь смерти: 10», «Фрирен 8/10», «Наруто 4★». Число в конце без разделителя — часть названия («Атака титанов 2»)
function impParseLines(text, five) {
  const seen = new Set();
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 300).map((line) => {
    let t = line.replace(/^(\d{1,3}[.)]\s+|[-•*–—]\s+)/, ''), score = null;
    const m = t.match(/^(.*\S)\s*(?:[—–:|;\t]|\s-|-\s|,\s)\s*(\d{1,2}(?:[.,]\d)?)\s*(?:\/\s*(?:10|5)|★|⭐|из\s*(?:10|5))?\s*$/i)
      || t.match(/^(.*\S)\s+(\d{1,2}(?:[.,]\d)?)\s*(?:\/\s*(?:10|5)|★|⭐|из\s*(?:10|5))\s*$/i);
    if (m) {
      let v = parseFloat(m[2].replace(',', '.'));
      const outOf5 = five || /\/\s*5|из\s*5|★|⭐/.test(t.slice(m[1].length));
      if (outOf5) v *= 2;
      v = Math.round(v);
      if (v >= 1 && v <= 10) { t = m[1]; score = v; }
    }
    t = t.replace(/[\s—–:|;-]+$/, '').trim();
    return { line, title: t, score };
  }).filter((x) => x.title.length > 1 && !seen.has(x.title.toLowerCase()) && seen.add(x.title.toLowerCase()));
}
// своя сортировка найденного: точное название > все слова строки есть в названиях (рус., англ., яп., синонимы) > меньше лишних слов; спешлы и клипы — ниже
const impNorm = (s) => (s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function impRank(q, list) {
  const qn = impNorm(q), qt = qn.split(' ').filter(Boolean);
  return list.map((a, i) => {
    const names = [a.russian, a.name, a.english, ...(a.synonyms || [])].map(impNorm).filter(Boolean);
    const all = new Set(names.flatMap((n) => n.split(' ')));
    let p = -i; // порядок Shikimori — слабая подсказка
    if (names.includes(qn)) p += 100;
    if (qt.every((t) => all.has(t))) p += 50;
    p -= Math.min(...names.map((n) => n.split(' ').filter((t) => !qt.includes(t)).length), 20) * 2;
    if (!['tv', 'movie', 'ova', 'ona'].includes(a.kind)) p -= 15;
    return { a, p };
  }).sort((x, y) => y.p - x.p).map((x) => x.a);
}
async function impSearch(rows, prog) {
  for (let i = 0; i < rows.length; i += 6) {
    prog(tr('Ищу аниме… {d} из {n}', { d: i, n: rows.length }));
    const part = rows.slice(i, i + 6);
    const d = await impGql('{' + part.map((r, k) => `a${k}: animes(search: ${JSON.stringify(r.title)}, limit: 8) { ${LIGHT} synonyms }`).join(' ') + '}');
    part.forEach((r, k) => { r.found = impRank(r.title, (d['a' + k] || []).filter((a) => a && a.id)).slice(0, 6); r.pick = r.found.length ? 0 : -1; });
    if (i + 6 < rows.length) await impSleep(250);
  }
}
const impOpt = (a) => `${tn(a)}${a.airedOn?.year ? ' · ' + a.airedOn.year : ''}${a.kind ? ' · ' + (a.kind === 'tv' ? 'TV' : a.kind.toUpperCase()) : ''}`;
let impRows = [];
function impRenderReview() {
  const box = $('#impReview'), ok = impRows.filter((r) => r.pick >= 0).length;
  box.innerHTML = `<p class="set-note">${tr('Нашёл {a} из {n}. Проверь совпадения — неверное можно поменять или убрать.', { a: impRows.filter((r) => r.found.length).length, n: impRows.length })}</p>
    <div class="imp-ms">${impRows.map((r, i) => {
      const a = r.found[r.pick];
      return `<div class="imp-m ${a ? '' : 'off'}"><img src="${esc(a?.poster?.previewUrl || '')}" alt="" ${a ? '' : 'hidden'}>
        <div class="imp-mi"><span class="imp-src" title="${esc(r.line)}">${esc(r.title)}</span>
        ${r.found.length ? `<select data-imppick="${i}">${r.found.map((x, k) => `<option value="${k}" ${k === r.pick ? 'selected' : ''}>${esc(impOpt(x))}</option>`).join('')}<option value="-1" ${r.pick < 0 ? 'selected' : ''}>${tr('— не добавлять —')}</option></select>` : `<em>${tr('Не найдено')}</em>`}</div>
        <b class="imp-sc" ${r.score ? `style="--c:${thColor(r.score)}"` : ''}>${r.score || '—'}</b></div>`;
    }).join('')}</div>
    <div class="imp-act"><label class="imp-st">${tr('Статус')}<select id="impSt">${['completed', 'watching', 'planned', 'on_hold', 'dropped'].map((v) => `<option value="${v}">${esc(WATCH[v])}</option>`).join('')}</select></label>
      <button type="button" class="btn" data-impback>${tr('Назад')}</button>
      <button type="button" class="btn primary" data-impadd ${ok ? '' : 'disabled'}>${tr('Добавить {n}', { n: ok })}</button></div>`;
}
$('#impList').addEventListener('submit', (e) => {
  e.preventDefault();
  const rows = impParseLines(e.target.text.value, e.target.five.checked);
  if (!rows.length) { $('#impStatus').textContent = tr('Список пуст'); return; }
  impRun(async (prog) => {
    await impSearch(rows, prog);
    impRows = rows; $('#impList').hidden = true; $('#impReview').hidden = false; impRenderReview();
    prog('');
    return null;
  });
});
$('#impReview').addEventListener('change', (e) => {
  const p = e.target.closest('[data-imppick]');
  if (p) { impRows[+p.dataset.imppick].pick = +p.value; impRenderReview(); }
});
$('#impReview').addEventListener('click', (e) => {
  if (e.target.closest('[data-impback]')) { $('#impReview').hidden = true; $('#impList').hidden = false; return; }
  if (!e.target.closest('[data-impadd]')) return;
  const status = $('#impSt').value;
  const list = impRows.filter((r) => r.pick >= 0).map((r) => { const a = r.found[r.pick]; return { id: String(a.id), score: status === 'planned' ? null : r.score, status, at: 0, anime: a }; });
  impRun(async (prog) => { const out = await impApply(list, $('#impReplace').checked, prog); $('#impReview').hidden = true; $('#impList').hidden = false; $('#impList').text.value = ''; return out; });
});
