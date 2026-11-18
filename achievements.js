'use strict';
/* Достижения и рамки аватарки (2026-11-17).
   Достижения считаются по самому топу; полученное запоминается в db.ach { id: когда } и уже не
   пропадает, даже если оценку потом убрать (и синхронизируется с аккаунтом). Секретные
   скрыты, пока не получишь. Каждое достижение открывает свою рамку; несколько рамок — сразу.
   Значки — свои, рисуются здесь: жетон по форме группы + белый знак (GLYPH). */

/* ---------- знаки (поле 24×24, обводка) ---------- */
const NUM = (t, size) => `<text x="12" y="${12 + size * 0.36}" text-anchor="middle" font-size="${size}" font-weight="800" fill="currentColor" stroke="none" font-family="Unbounded, Onest, sans-serif">${t}</text>`;
const GLYPH = {
  sprout: '<path d="M12 21v-9"/><path d="M12 13c0-4-3-6-7-6 0 4 3 6 7 6Z"/><path d="M12 10c0-3 2.500-5 6.500-5 0 3.500-2.500 5-6.500 5Z"/>',
  n10: NUM('10', 11), n50: NUM('50', 11), n100: NUM('100', 8.4),
  crown: '<path d="M4 17 3 7l5 4 4-6 4 6 5-4-1 10Z"/><path d="M4.500 20.500h15"/>',
  tiers: '<rect x="4" y="4" width="16" height="4" rx="1.200"/><rect x="4" y="10" width="12" height="4" rx="1.200"/><rect x="4" y="16" width="8" height="4" rx="1.200"/>',
  screen: '<rect x="3" y="4.500" width="18" height="13" rx="2.500"/><path d="m10.300 8.200 4.700 2.800-4.700 2.800Z" fill="currentColor"/><path d="M8 21h8"/>',
  star: '<path d="m12 3 2.700 5.600 6.100.800-4.500 4.200 1.100 6.100L12 16.800l-5.400 2.900 1.100-6.100-4.500-4.200 6.100-.800Z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5.500a2.500 2.500 0 0 0 2.600 3.400M16 6h2.500a2.500 2.500 0 0 1-2.600 3.400M12 13v4M8.500 20h7M9.500 17h5"/>',
  lens: '<circle cx="10.500" cy="10.500" r="6"/><path d="m15 15 5.500 5.500"/><path d="M8 10.500h5"/>',
  heart: '<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.400 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10Z"/>',
  shield: '<path d="M12 3 5 5.800v5.400c0 4.600 3 8 7 9.800 4-1.800 7-5.200 7-9.800V5.800Z"/><path d="m9 12 2.200 2.200 4-4.200"/>',
  bolt: '<path d="M13.500 3 5 13.500h6L10 21l8.500-10.500h-6Z"/>',
  rainbow: '<path d="M3 18a9 9 0 0 1 18 0"/><path d="M6.500 18a5.500 5.500 0 0 1 11 0"/><path d="M10 18a2 2 0 0 1 4 0"/>',
  hourglass: '<path d="M6.500 3h11M6.500 21h11M7.500 3c0 5 4.500 6 4.500 9s-4.500 4-4.500 9M16.500 3c0 5-4.500 6-4.500 9s4.500 4 4.500 9"/>',
  tape: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.500" cy="12" r="2"/><circle cx="15.500" cy="12" r="2"/><path d="M8.500 14h7"/>',
  clap: '<path d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="m4 10-.700-3.200 15.600-3.300.700 3.300Z"/><path d="m8 5.900 2 3.600M12.600 4.900l2 3.600"/>',
  layers: '<path d="m12 3 9 4.500-9 4.500-9-4.500Z"/><path d="m3 12 9 4.500 9-4.500"/><path d="m3 16.500 9 4.500 9-4.500"/>',
  moon: '<path d="M19.500 14.500A8 8 0 0 1 9.500 4.500a8 8 0 1 0 10 10Z"/><path d="M17 3.500v3M15.500 5h3"/>',
  trash: '<path d="M4 7h16M9.500 7V4.500h5V7M6.500 7l1 13h9l1-13M10 11v5.500M14 11v5.500"/>',
  list: '<path d="M8.500 6h11.500M8.500 12h11.500M8.500 18h7"/><path d="M4.200 6h.010M4.200 12h.010M4.200 18h.010" stroke-width="3"/>',
  pencil: '<path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16v4Z"/><path d="m13.500 6.500 4 4"/>',
  hole: '<circle cx="12" cy="12" r="3.200" fill="currentColor"/><path d="M12 4.500a7.500 7.500 0 0 1 7.500 7.500M19.500 12A7.500 7.500 0 0 1 12 19.500M12 19.500A7.500 7.500 0 0 1 4.500 12M4.500 12A7.500 7.500 0 0 1 12 4.500" stroke-dasharray="3 2.400"/>',
  nova: '<path d="M12 2.500v4M12 17.500v4M2.500 12h4M17.500 12h4M5.300 5.300l2.800 2.800M15.900 15.900l2.800 2.800M5.300 18.700l2.800-2.800M15.900 8.100l2.800-2.800"/><circle cx="12" cy="12" r="2.600" fill="currentColor"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
  wind: '<path d="M3 8.500h10.500a3 3 0 1 0-3-3"/><path d="M3 12.500h15a3 3 0 1 1-3 3"/><path d="M3 16.500h7"/>',
  mountain: '<path d="M2.500 20 9.500 7l4 6.500 2.500-3.500 5.500 10Z"/><path d="m7.600 10.500 1.900 1.500 1.700-1.400"/>',
  drop: '<path d="M12 3c3.600 4.600 6 8 6 11a6 6 0 0 1-12 0c0-3 2.400-6.400 6-11Z"/><path d="M9.200 14.500a2.800 2.800 0 0 0 2.300 2.700"/>',
  atom: '<circle cx="12" cy="12" r="1.800" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.500" ry="3.800"/><ellipse cx="12" cy="12" rx="9.500" ry="3.800" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.500" ry="3.800" transform="rotate(120 12 12)"/>',
  boom: '<path d="M12 2.800 13.900 8.300 19.500 6.300 16.200 11.100 21.200 13.900 15.400 14.700 16.300 20.500 12 16.700 7.700 20.500 8.600 14.700 2.800 13.900 7.800 11.100 4.500 6.300 10.100 8.300Z"/>',
  gem: '<path d="M7 4h10l4 5-9 11L3 9Z"/><path d="M3 9h18M9.500 4 8 9l4 11 4-11-1.500-5"/>',
  flame: '<path d="M12 21c3.600 0 6.500-2.600 6.500-6.200 0-2.800-1.700-4.600-2.600-6.800-.700 1.500-1.600 2.300-2.700 2.400.400-3-1-6-3.600-7.400.300 3.300-4.100 5.700-4.100 11.300 0 4 2.900 6.700 6.500 6.700Z"/>',
  snow: '<path d="M12 3v18M4.200 7.500l15.600 9M19.800 7.500l-15.600 9"/><path d="M9.700 4.800 12 6.800l2.300-2M9.700 19.200l2.300-2 2.300 2"/>',
  flower: [0, 72, 144, 216, 288].map((r) => `<ellipse cx="12" cy="6.800" rx="2.700" ry="4.100" fill="currentColor" stroke="none" transform="rotate(${r} 12 12)"/>`).join('') + '<circle cx="12" cy="12" r="1.600" fill="#ff7aa6" stroke="none"/>',
  s: NUM('S', 15),
  q: NUM('?', 15),
  lock: '<rect x="5.500" y="10.500" width="13" height="9.500" rx="2"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/>',
};
const glyphSvg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[name] || ''}</svg>`;

/* ---------- жетоны: форма и цвета по группе ---------- */
const ACH_SHAPE = {
  count: '<path d="M24 3 42 13.500v21L24 45 6 34.500v-21Z"/>',
  taste: '<path d="M24 3 42 9v15c0 11-8 18-18 21C14 42 6 35 6 24V9Z"/>',
  era: '<circle cx="24" cy="24" r="21"/>',
  secret: '<path d="M24 2.500 45.500 24 24 45.500 2.500 24Z"/>',
  elem: '<rect x="4" y="4" width="40" height="40" rx="12"/>',
  anime: '<path d="M17 3H31L45 17V31L31 45H17L3 31V17Z"/>',
};
const ACH_COLORS = { count: ['#ffb347', '#ff4d78'], taste: ['#ff7ab8', '#8b5cf6'], era: ['#4dd2ff', '#5b5bf0'], secret: ['#3ee6b0', '#1f6f8b'], elem: ['#ffd75e', '#e8572a'], anime: ['#ff4d78', '#4dd2ff'], hidden: ['#4a4560', '#2c283a'] };
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${
  Object.entries(ACH_COLORS).map(([k, [a, b]]) => `<linearGradient id="ag-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')
}</defs></svg>`);
// значок достижения; hidden — секретное, ещё не полученное
function achIcon(a, hidden) {
  const shape = ACH_SHAPE[a.g], grad = hidden ? 'hidden' : a.g;
  if (a.g === 'anime' && typeof FRAME_ART !== 'undefined' && FRAME_ART[a.id]) return `<svg class="ach-svg" viewBox="0 0 48 48" aria-hidden="true"><g fill="url(#ag-anime)" stroke="url(#ag-anime)" stroke-width="3" stroke-linejoin="round">${shape}</g><circle cx="24" cy="24" r="10" fill="#1b1726"/><svg class="fr-still" data-fr="${a.id}" x="6" y="6" width="36" height="36" viewBox="0 0 120 120" overflow="visible">${noSmil(FRAME_ART[a.id]())}</svg></svg>`;
  return `<svg class="ach-svg" viewBox="0 0 48 48" aria-hidden="true">
    <g fill="url(#ag-${grad})" stroke="url(#ag-${grad})" stroke-width="3" stroke-linejoin="round">${shape}</g>
    <g transform="translate(24 24) scale(.830) translate(-24 -24)" fill="none" stroke="#fff" stroke-opacity=".380" stroke-width="1.500" stroke-linejoin="round">${shape}</g>
    <g transform="translate(${a.g === 'taste' ? '12.500 11.500' : '12.500 12.500'}) scale(.960)" fill="none" stroke="#fff" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round" style="color:#fff">${GLYPH[hidden ? 'q' : a.i]}</g>
  </svg>`;
}

// g — группа: count (количество), taste (вкус), era (эпохи и типы), secret (секретные); i — знак из GLYPH
const ACH = [
  { id: 'first', g: 'count', i: 'sprout', t: 'Первый шаг', d: 'Поставь первую оценку', ok: (s) => s.rated >= 1 },
  { id: 'rated10', g: 'count', i: 'n10', t: 'Десятка', d: 'Оцени 10 аниме', ok: (s) => s.rated >= 10, p: (s) => [s.rated, 10] },
  { id: 'rated50', g: 'count', i: 'n50', t: 'Полсотни', d: 'Оцени 50 аниме', ok: (s) => s.rated >= 50, p: (s) => [s.rated, 50] },
  { id: 'rated100', g: 'count', i: 'n100', t: 'Сотня', d: 'Оцени 100 аниме', ok: (s) => s.rated >= 100, p: (s) => [s.rated, 100] },
  { id: 'rated500', g: 'count', i: 'crown', t: 'Анимешник со стажем', d: 'Оцени 500 аниме', ok: (s) => s.rated >= 500, p: (s) => [s.rated, 500] },
  { id: 'tierfull', g: 'count', i: 'tiers', t: 'Тир-мастер', d: 'Заполни все тиры от S до F', ok: (s) => s.tiersFilled >= 6, p: (s) => [s.tiersFilled, 6] },
  { id: 'eps1000', g: 'count', i: 'screen', t: 'Тысяча серий', d: 'Посмотри 1000 эпизодов (по сезонам со статусом «Просмотрено»)', ok: (s) => s.eps >= 1000, p: (s) => [s.eps, 1000] },
  { id: 'collector', g: 'count', i: 'gem', t: 'Коллекционер', d: 'Получи 15 других достижений', ok: (s) => s.achCount >= 15, p: (s) => [s.achCount, 15] },

  { id: 'master1', g: 'taste', i: 'star', t: 'Первый шедевр', d: 'Поставь кому-нибудь 10', ok: (s) => s.tens >= 1 },
  { id: 'master10', g: 'taste', i: 'trophy', t: 'Ценитель', d: 'Поставь 10 шедевров (оценка 10)', ok: (s) => s.tens >= 10, p: (s) => [s.tens, 10] },
  { id: 'strict', g: 'taste', i: 'lens', t: 'Строгий критик', d: 'Оценивай в среднем на 0,5 ниже мира (от 10 оценок)', ok: (s) => s.both >= 10 && s.diff <= -0.5 },
  { id: 'kind', g: 'taste', i: 'heart', t: 'Добрая душа', d: 'Оценивай в среднем на 0,7 выше мира (от 10 оценок)', ok: (s) => s.both >= 10 && s.diff >= 0.7 },
  { id: 'defender', g: 'taste', i: 'shield', t: 'Защитник', d: 'Поставь 9 или 10 тому, у чего в мире ниже 7', ok: (s) => s.defender },
  { id: 'rebel', g: 'taste', i: 'bolt', t: 'Против течения', d: 'Поставь 4 или ниже тому, у чего в мире 8,5 и выше', ok: (s) => s.rebel },
  { id: 'genres10', g: 'taste', i: 'rainbow', t: 'Всеядный', d: 'Оцени аниме 10 разных жанров', ok: (s) => s.genres >= 10, p: (s) => [s.genres, 10] },

  { id: 'decades5', g: 'era', i: 'hourglass', t: 'Путешественник во времени', d: 'Оцени аниме из 5 разных десятилетий', ok: (s) => s.decades >= 5, p: (s) => [s.decades, 5] },
  { id: 'oldschool', g: 'era', i: 'tape', t: 'Старая школа', d: 'Оцени аниме, вышедшее до 1990 года', ok: (s) => s.old },
  { id: 'movies10', g: 'era', i: 'clap', t: 'Киноман', d: 'Оцени 10 аниме-фильмов', ok: (s) => s.movies >= 10, p: (s) => [s.movies, 10] },
  { id: 'fan', g: 'era', i: 'layers', t: 'Фанат серии', d: 'Оцени 5 частей одной серии', ok: (s) => s.bestSeries >= 5, p: (s) => [s.bestSeries, 5] },

  { id: 'night', g: 'secret', i: 'moon', t: 'Ночная сова', d: 'Оценивай аниме глубокой ночью (с 2 до 5 часов)', ok: (s) => s.night },
  { id: 'dropper', g: 'secret', i: 'trash', t: 'Не моё', d: 'Брось 10 аниме', ok: (s) => s.dropped >= 10 },
  { id: 'planner', g: 'secret', i: 'list', t: 'Когда-нибудь посмотрю', d: '30 аниме в «В планах»', ok: (s) => s.planned >= 30 },
  { id: 'renamer', g: 'secret', i: 'pencil', t: 'Свои правила', d: 'Переименуй тир', ok: (s) => s.renamed },
  { id: 'void', g: 'secret', i: 'hole', t: 'Бездна', d: 'Поставь кому-нибудь 1', ok: (s) => s.ones >= 1 },
  { id: 'supernova', g: 'taste', i: 'nova', t: 'Сверхновая', d: 'Поставь 25 шедевров (оценка 10)', ok: (s) => s.tens >= 25, p: (s) => [s.tens, 25] },
  { id: 'el_sun', g: 'elem', i: 'sun', t: 'Солнце', d: 'Оцени 10 комедий', ok: (s) => s.gc.comedy >= 10, p: (s) => [s.gc.comedy, 10] },
  { id: 'el_wind', g: 'elem', i: 'wind', t: 'Ветер', d: 'Оцени 10 приключений', ok: (s) => s.gc.adventure >= 10, p: (s) => [s.gc.adventure, 10] },
  { id: 'el_earth', g: 'elem', i: 'mountain', t: 'Земля', d: 'Оцени 10 драм', ok: (s) => s.gc.drama >= 10, p: (s) => [s.gc.drama, 10] },
  { id: 'el_water', g: 'elem', i: 'drop', t: 'Вода', d: 'Оцени 10 романтических аниме', ok: (s) => s.gc.romance >= 10, p: (s) => [s.gc.romance, 10] },
  { id: 'el_energy', g: 'elem', i: 'atom', t: 'Энергия', d: 'Оцени 10 экшенов', ok: (s) => s.gc.action >= 10, p: (s) => [s.gc.action, 10] },
  { id: 'burst', g: 'count', i: 'boom', t: 'Взрыв', d: 'Оцени 20 аниме за одни сутки', ok: (s) => s.today >= 20, p: (s) => [s.today, 20] },
];
// аниме-рамки (2026-11-18): оцени тайтл — получи рамку по его мотивам (без логотипов и персонажей)
const ANIME_FR = [
  ['an_aot', 'Атака титанов', 'Attack on Titan', /shingeki no kyo|attack on titan|атака титанов/],
  ['an_jjk', 'Магическая битва', 'Jujutsu Kaisen', /jujutsu kaisen|магическая битва/],
  ['an_kny', 'Клинок, рассекающий демонов', 'Demon Slayer', /kimetsu no yaiba|demon slayer|рассекающий демонов/],
  ['an_naruto', 'Наруто', 'Naruto', /naruto|наруто/],
  ['an_onepiece', 'Ван-Пис', 'One Piece', /one piece|ван[- ]пис/],
  ['an_deathnote', 'Тетрадь смерти', 'Death Note', /death note|тетрадь смерти/],
  ['an_csm', 'Человек-бензопила', 'Chainsaw Man', /chainsaw man|человек-бензопила/],
  ['an_frieren', 'Провожающая в последний путь Фрирен', 'Frieren', /frieren|фрирен/],
  ['an_fma', 'Стальной алхимик', 'Fullmetal Alchemist', /fullmetal alchemist|hagane no renkinjutsushi|стальной алхимик/],
  ['an_rezero', 'Re:Zero', 'Re:Zero', /re: ?zero|ре: ?зеро|жизнь с нуля в альтернативном мире/],
  ['an_yourname', 'Твоё имя', 'Your Name', /kimi no na wa|your name|тво[её] имя/],
  ['an_eva', 'Евангелион', 'Evangelion', /evangelion|евангелион/],
  ['an_bebop', 'Ковбой Бибоп', 'Cowboy Bebop', /cowboy bebop|ковбой бибоп/],
  ['an_ghoul', 'Токийский гуль', 'Tokyo Ghoul', /tokyo ghoul|токийский гуль/],
  ['an_opm', 'Ванпанчмен', 'One Punch Man', /one[- ]punch man|ванпанчмен/],
  ['an_sololvl', 'Поднятие уровня в одиночку', 'Solo Leveling', /ore dake level up|solo leveling|поднятие уровня/],
  ['an_konosuba', 'Коносуба', 'KonoSuba', /kono subarashii|konosuba|коносуба|богиня благословляет/],
  ['an_silentvoice', 'Форма голоса', 'A Silent Voice', /koe no katachi|silent voice|форма голоса/],
  ['an_kaguya', 'Госпожа Кагуя', 'Kaguya-sama', /kaguya-sama|госпожа кагуя/],
  ['an_toradora', 'Торадора!', 'Toradora!', /toradora|торадора/],
  ['an_violet', 'Вайолет Эвергарден', 'Violet Evergarden', /violet evergarden|вайолет эвергарден/],
  ['an_fate', 'Fate Series', 'Fate Series', /fate[/:]|судьба[/:]/],
  ['an_alya', 'Аля иногда кокетничает со мной по-русски', 'Alya Sometimes Hides Her Feelings in Russian', /alya-san|alya sometimes|roshidere|аля иногда/],
  ['an_bisque', 'Эта фарфоровая кукла', 'My Dress-Up Darling', /bisque doll|dress-up darling|фарфоровая кукла/],
  ['an_edgerunners', 'Киберпанк: Бегущие по краю', 'Cyberpunk: Edgerunners', /edgerunners|бегущие по краю/],
];
ACH.push(...ANIME_FR.map(([id, t]) => ({ id, g: 'anime', t, d: `Оцени «${t}»`, ok: (s) => !!s.an[id] })));
if (typeof EN !== 'undefined') ANIME_FR.forEach(([, t, en]) => { EN[t] = en; EN[`Оцени «${t}»`] = `Rate “${en}”`; });
const ACH_GROUPS = [['count', 'За количество'], ['taste', 'За вкус'], ['era', 'Эпохи и типы'], ['elem', 'Стихии жанров'], ['anime', 'Любимые тайтлы'], ['secret', 'Секретные']];

// Рамки: need — какое достижение открывает (нет — доступна сразу); b — знак в углу;
// fx — эффекты (классы fx-* в style.css): spin, slow, glow, orbit, orbit3, beat, flicker, hue, dash, dots, glitch, stars, ember
const FRAMES = [
  { id: '', t: 'Без рамки' },
  { id: 'pink', t: 'Розовая' },
  { id: 'violet', t: 'Аметист' },
  { id: 'mint', t: 'Мята' },
  { id: 'sky', t: 'Небо' },
  { id: 'sunset', t: 'Закат' },
  { id: 'sprout', t: 'Росток', need: 'first' },
  { id: 'bronze', t: 'Бронза', need: 'rated10', fx: 'shine' },
  { id: 'gold', t: 'Золото', need: 'rated50', fx: 'shine glow' },
  { id: 'neon', t: 'Неон', need: 'rated100', fx: 'spin glow' },
  { id: 'crown', t: 'Корона', need: 'rated500', b: 'crown', fx: 'spin glow orbit' },
  { id: 'emerald', t: 'Изумруд', need: 'tierfull', fx: 'shine glow' },
  { id: 'fire', t: 'Пламя', need: 'eps1000', b: 'flame', fx: 'spin glow ember' },
  { id: 'legend', t: 'Легенда', need: 'collector', b: 'gem', fx: 'spin glow orbit3' },
  { id: 'star', t: 'Звёздная', need: 'master1', b: 'star', fx: 'glow orbit' },
  { id: 'stier', t: 'S-тир', need: 'master10', b: 's', fx: 'glow' },
  { id: 'ice', t: 'Лёд', need: 'strict', b: 'snow', fx: 'shine glow' },
  { id: 'heart', t: 'Сердце', need: 'kind', b: 'heart', fx: 'beat glow' },
  { id: 'shield', t: 'Страж', need: 'defender', b: 'shield', fx: 'slow' },
  { id: 'lightning', t: 'Молния', need: 'rebel', b: 'bolt', fx: 'spin flicker glow' },
  { id: 'sakura', t: 'Сакура', need: 'genres10', b: 'flower', fx: 'orbit' },
  { id: 'aurora', t: 'Сияние', need: 'decades5', fx: 'slow hue glow' },
  { id: 'compass', t: 'Компас', need: 'decades5' },
  { id: 'retro', t: 'Ретро', need: 'oldschool', b: 'tape', fx: 'slow' },
  { id: 'galaxy', t: 'Галактика', need: 'movies10', fx: 'slow stars' },
  { id: 'chain', t: 'Цепь', need: 'fan', fx: 'dash slow' },
  { id: 'moon', t: 'Луна', need: 'night', b: 'moon', fx: 'stars glow' },
  { id: 'ash', t: 'Пепел', need: 'dropper', fx: 'ember' },
  { id: 'paper', t: 'Свиток', need: 'planner', fx: 'dots slow' },
  { id: 'glitch', t: 'Глитч', need: 'renamer', fx: 'glitch' },
  { id: 'blackhole', t: 'Чёрная дыра', need: 'void' },
  { id: 'supernova', t: 'Сверхновая', need: 'supernova' },
  { id: 'explosion', t: 'Взрыв', need: 'burst' },
  { id: 'sun', t: 'Солнце', need: 'el_sun' },
  { id: 'wind', t: 'Ветер', need: 'el_wind' },
  { id: 'earth', t: 'Земля', need: 'el_earth' },
  { id: 'water', t: 'Вода', need: 'el_water' },
  { id: 'energy', t: 'Энергия', need: 'el_energy' },
  ...ANIME_FR.map(([id, t]) => ({ id, t, need: id })),
];
const frameById = (id) => FRAMES.find((f) => f.id === (id || '')) || FRAMES[0];
const frameOpen = (f, ach) => !f.need || !!(ach || db.ach || {})[f.need];
const frameCls = (f) => `fr-${f.id || 'none'}${f.fx ? ' ' + f.fx.split(' ').map((x) => 'fx-' + x).join(' ') : ''}`;

/* ---------- подсчёт по топу ---------- */
function achStats(d = db) {
  const recs = [...Object.values(d.items || {}), ...Object.values(d.franchises || {})];
  const rated = recs.filter((r) => r.score != null);
  const both = rated.filter((r) => r.anime?.score);
  const genres = new Set(), decades = new Set(), series = new Map();
  rated.forEach((r) => {
    (r.anime?.genres || []).forEach((g) => genres.add(g.id));
    if (r.anime?.year) decades.add(Math.floor(r.anime.year / 10));
  });
  Object.values(d.items || {}).forEach((r) => { const f = r.anime?.franchise; if (f && r.score != null) series.set(f, (series.get(f) || 0) + 1); });
  const tierOf = (r) => r.tier || (r.score == null ? null : r.score >= 10 ? 'S' : r.score >= 9 ? 'A' : r.score >= 8 ? 'B' : r.score >= 7 ? 'C' : r.score >= 5 ? 'D' : 'F');
  const tiers = new Set(recs.filter((r) => r.status !== 'not_watched').map(tierOf).filter((t) => t && t !== 'nw'));
  return {
    rated: rated.length,
    tens: rated.filter((r) => r.score === 10).length,
    both: both.length,
    diff: both.length ? both.reduce((s, r) => s + r.score - r.anime.score, 0) / both.length : 0,
    defender: rated.some((r) => r.score >= 9 && r.anime?.score && r.anime.score < 7),
    rebel: rated.some((r) => r.score <= 4 && r.anime?.score >= 8.5),
    genres: genres.size, decades: decades.size,
    old: rated.some((r) => r.anime?.year && r.anime.year < 1990),
    movies: rated.filter((r) => r.anime?.kind === 'movie').length,
    bestSeries: Math.max(0, ...series.values()),
    tiersFilled: tiers.size,
    eps: Object.values(d.items || {}).filter((r) => r.status === 'completed').reduce((s, r) => s + (r.anime?.episodes || 0), 0),
    dropped: recs.filter((r) => r.status === 'dropped').length,
    planned: recs.filter((r) => r.status === 'planned').length,
    achCount: Object.keys(d.ach || {}).filter((k) => k !== 'collector' && ACH.some((a) => a.id === k && a.g !== 'anime')).length,
    an: Object.fromEntries(ANIME_FR.map(([id, , , re]) => [id, rated.some((r) => re.test(`${r.anime?.name || ''} ${r.anime?.english || ''} ${r.anime?.russian || ''} ${r.anime?.franchise || ''}`.toLowerCase().replace(/_/g, ' ')))])),
    renamed: d === db && Object.keys(tierNames || {}).length > 0,
    ones: rated.filter((r) => r.score === 1).length,
    today: rated.filter((r) => Date.now() - (r.added || 0) < 864e5).length,
    // сколько оценённых в жанре (по английскому или русскому названию жанра)
    gc: Object.fromEntries(Object.entries({ comedy: ['comedy', 'комедия'], adventure: ['adventure', 'приключения'], drama: ['drama', 'драма'], romance: ['romance', 'романтика'], action: ['action', 'экшен'] })
      .map(([k, names]) => [k, rated.filter((r) => (r.anime?.genres || []).some((g) => names.includes(String(g.name || '').toLowerCase()) || names.includes(String(g.russian || '').toLowerCase()))).length])),
    night: d === db && (() => { const h = new Date().getHours(); return h >= 2 && h < 5 && rated.length > 0; })(),
  };
}

/* ---------- выдача ---------- */
let achReady = false;
function checkAch(quiet) {
  if (window.VIEWING) return;
  const got = (db.ach ||= {});
  const fresh = [];
  for (let pass = 0; pass < 2; pass++) { // второй проход — «Коллекционер» считает уже полученные
    const s = achStats();
    const add = ACH.filter((a) => !got[a.id] && a.ok(s));
    if (!add.length) break;
    const now = Date.now();
    add.forEach((a) => (got[a.id] = now));
    fresh.push(...add);
  }
  if (!fresh.length) return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch {}
  if (typeof onDbSaved === 'function') onDbSaved(); else setPref('syncDirty', '1'); // аккаунт ещё не загрузился — дошлём
  if (!quiet && achReady) fresh.slice(0, 3).forEach((a, k) => setTimeout(() => achPop(a), k * 3000));
}
// всплывающая плашка «Достижение получено» (поверх открытого окна, если оно есть)
function achPop(a) {
  const frame = FRAMES.find((f) => f.need === a.id);
  const el = document.createElement('div');
  el.className = 'ach-pop';
  el.innerHTML = `${achIcon(a)}<div><small>${tr('Достижение получено')}</small><b>${esc(tr(a.t))}</b>${frame ? `<span>${frameRing(frame)}${tr('новая рамка «{f}»', { f: tr(frame.t) })}</span>` : ''}</div>`;
  (document.querySelector('dialog[open]') || document.body).appendChild(el);
  setTimeout(() => el.classList.add('out'), 3600);
  setTimeout(() => el.remove(), 4100);
}

/* ---------- показ ---------- */
// полка достижений; ach — полученные { id: время }, own — свой ли топ (у своего видно прогресс)
function achShelfHTML(ach, own, stats) {
  ach ||= {};
  const n = ACH.filter((a) => ach[a.id]).length;
  return `<div class="ach-shelf">
    <div class="ach-sum"><b>${n}</b> ${tr('из')} ${ACH.length} · ${tr('рамок открыто')}: <b>${FRAMES.filter((f) => frameOpen(f, ach)).length}</b> ${tr('из')} ${FRAMES.length}</div>
    ${ACH_GROUPS.map(([g, title]) => `<div class="ach-group"><h4>${tr(title)}</h4><div class="ach-grid">${ACH.filter((a) => a.g === g).map((a) => {
      const has = !!ach[a.id], hidden = g === 'secret' && !has;
      const pr = !has && own && a.p && stats ? a.p(stats) : null;
      const frame = FRAMES.find((f) => f.need === a.id);
      const tip = hidden ? tr('Секретное достижение') : `${tr(a.d)}${has ? ` · ${tr('получено')} ${new Date(ach[a.id]).toLocaleDateString(LOCALE)}` : ''}${frame ? ` · ${tr('рамка «{f}»', { f: tr(frame.t) })}` : ''}`;
      return `<div class="ach ${has ? 'on' : ''}" title="${esc(tip)}">
        <span class="ach-i">${achIcon(a, hidden)}</span>
        <span class="ach-t">${hidden ? '???' : esc(tr(a.t))}</span>
        <small>${hidden ? esc(tr('Секретное')) : esc(tr(a.d))}</small>
        ${pr ? `<span class="ach-bar"><i style="width:${Math.min(100, (pr[0] / pr[1]) * 100)}%"></i></span><small class="ach-n">${Math.min(pr[0], pr[1])} / ${pr[1]}</small>` : ''}
        ${frame && !hidden ? `<span class="ach-frame" title="${esc(tr('рамка «{f}»', { f: tr(frame.t) }))}">${frameRing(frame)}</span>` : ''}
      </div>`;
    }).join('')}</div></div>`).join('')}
  </div>`;
}
// маленький кружок-образец рамки
// у рамки есть свой рисунок (frames.js)?
const frameHasArt = (f) => typeof FRAME_ART !== 'undefined' && !!FRAME_ART[f.id];
// неподвижный рисунок: без слоя движения, без SMIL; анимации и размытие выключены классом fr-still (style.css)
const frameStillCache = {};
const noSmil = (h) => h.replace(/<animate[A-Za-z]*\b[^>]*\/>/g, '').replace(/<animate[A-Za-z]*\b[^>]*>[\s\S]*?<\/animate[A-Za-z]*>/g, '');
const frameStill = (id) => (frameStillCache[id] ||= `<svg class="fr-art fr-still" data-fr="${id}" viewBox="0 0 120 120" aria-hidden="true"><g class="fw fw-${id}">${noSmil(FRAME_ART[id]())}</g>${id === 'glitch' ? '' : fRing(40.4, 1.4, '#000', 'opacity=".4"')}</svg>`);
const frameRing = (f) => (frameHasArt(f) ? `<span class="ava-wrap fa xs"><span class="ring-dot"></span>${frameStill(f.id)}</span>` : `<span class="ava-wrap ${frameCls(f)} xs"><span class="ring-dot"></span></span>`);
// обернуть аватарку в рамку
function framed(inner, frame, size = '') {
  const f = frameById(frame);
  if (!f.id) return inner;
  if (frameHasArt(f)) return `<span class="ava-wrap fa fa-${f.id} ${size}">${inner}${frameArt(f.id)}</span>`;
  return `<span class="ava-wrap ${frameCls(f)} ${size}">${inner}${f.b ? `<i class="fr-badge">${glyphSvg(f.b)}</i>` : ''}</span>`;
}
// навёл мышку на рамку в списке — она оживает (полный рисунок со слоем движения), увёл — снова неподвижная
{
  const HOLD = '.a-frames button, .pv-frame, .ach, .ach-toast';
  let cur = null;
  const wake = (box) => box.querySelectorAll('svg.fr-still[data-fr]').forEach((sv) => {
    const id = sv.dataset.fr;
    if (!FRAME_ART[id]) return;
    if (sv.classList.contains('fr-art')) { sv.insertAdjacentHTML('afterend', frameArt(id).replace('<svg class="fr-art"', '<svg class="fr-art fr-live" data-fr="' + id + '"')); sv.remove(); }
    else { sv.innerHTML = FRAME_ART[id](); sv.classList.replace('fr-still', 'fr-live'); }
  });
  const calm = (box) => box.querySelectorAll('svg.fr-live[data-fr]').forEach((sv) => {
    const id = sv.dataset.fr;
    if (sv.classList.contains('fr-art')) { sv.insertAdjacentHTML('afterend', frameStill(id)); sv.remove(); }
    else { sv.innerHTML = noSmil(FRAME_ART[id]()); sv.classList.replace('fr-live', 'fr-still'); }
  });
  if (window.matchMedia?.('(hover: hover)').matches) {
    document.addEventListener('mouseover', (e) => {
      const box = e.target.closest?.(HOLD);
      if (box === cur) return;
      if (cur) calm(cur);
      cur = box && box.querySelector('svg.fr-still[data-fr]') ? box : null;
      if (cur) wake(cur);
    });
    document.addEventListener('mouseleave', () => { if (cur) { calm(cur); cur = null; } });
  }
}
// миниатюра для списков: тот же рисунок, но неподвижный
function framedThumb(inner, frame, size = '') {
  const f = frameById(frame);
  if (!f.id || !frameHasArt(f)) return framed(inner, frame, size);
  return `<span class="ava-wrap fa fa-${f.id} ${size}">${inner}${frameStill(f.id)}</span>`;
}
checkAch(true); achReady = true;

/* ---------- витрина: все рамки и достижения открыты (?preview=all) ----------
   Только посмотреть: прогресс и рамка в профиле не меняются. */
function showPreview(user) {
  const u = user || { login: 'AniTier' };
  show('mine'); window.PREVIEW = true; // дальше свой топ не перерисовывается поверх витрины
  const ach = Object.fromEntries(ACH.map((a) => [a.id, Date.now()]));
  const ava = (frame, size, cls = 'a-avatar', still) => (still ? framedThumb : framed)(typeof avatarInner === 'function' ? avatarInner(u, cls) : `<span class="${cls}">A</span>`, frame, size);
  $('#viewBanner').innerHTML = `<span>${tr('Витрина: все рамки и достижения открыты — только посмотреть, ничего не сохраняется')}</span><button class="btn" id="viewExit">${tr('К своему топу')}</button>`;
  $('#viewBanner').hidden = false;
  $('#viewExit').addEventListener('click', () => { location.href = location.pathname; });
  $('#view-mine h1').textContent = tr('Рамки и достижения');
  for (const s of ['.tools', '.pills', '#mineActions', '#tierHint', '#mineEmpty']) { const el = $(s, $('#view-mine')); if (el) el.hidden = true; }
  $('#stats').textContent = `${FRAMES.length} ${tr('рамок')} · ${ACH.length} ${tr('достижений')}`;
  $('#mineList').innerHTML = `<div class="stats-view">
    <section class="st-sec"><div class="st-head"><h3>${tr('Рамки')}</h3><span>${tr('нажми на рамку — покажу крупно')}</span></div>
      <div class="pv-big" id="pvBig"></div>
      <div class="pv-frames">${FRAMES.map((f) => {
        const a = f.need && ACH.find((x) => x.id === f.need);
        return `<button class="pv-frame" data-pv="${f.id}">${ava(f.id, 'lg', 'a-avatar', true)}<b>${esc(tr(f.t))}</b><small>${a ? esc(tr(a.t)) : tr('сразу')}</small></button>`;
      }).join('')}</div>
    </section>
    <section class="st-sec"><div class="st-head"><h3>${tr('Достижения')}</h3><span>${tr('нажми на достижение — покажу, как оно выпадает')}</span></div>${achShelfHTML(ach, false)}</section>
  </div>`;
  const big = (id) => {
    const f = frameById(id);
    $('#pvBig').innerHTML = `${ava(f.id, 'lg', 'a-avatar huge')}<div><b>${esc(tr(f.t))}</b><div class="pv-sizes">${ava(f.id, '')}${ava(f.id, 'sm', 'acct-letter')}</div></div>`;
  };
  big('legend');
  $('#mineList').addEventListener('click', (e) => {
    const fb = e.target.closest('[data-pv]');
    if (fb) { big(fb.dataset.pv); $('#pvBig').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    const card = e.target.closest('.ach'); if (!card) return;
    const i = [...$$('.ach', $('#mineList'))].indexOf(card);
    const a = ACH_GROUPS.flatMap(([g]) => ACH.filter((x) => x.g === g))[i];
    if (a) achPop(a);
  });
}
