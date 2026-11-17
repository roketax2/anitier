'use strict';
/* Английский перевод. Ключ — русский текст сайта, {n} и т. п. — подставляемые значения.
   Новые тексты: писать в коде tr('По-русски') и добавлять строку сюда. */
const EN = {
  // страница
  'AniTier — свой топ аниме': 'AniTier — your own anime top',
  'Свой топ аниме: оценки по 10-балльной шкале, рейтинг, тир-лист, поиск и фильтры': 'Your own anime top: 1–10 ratings, ranking, tier list, search and filters',
  'Разделы': 'Sections', 'Ещё': 'More', 'Мой топ': 'My top', 'Каталог': 'Catalog',
  'Поделиться': 'Share', 'Сделать картинку топа, чтобы поделиться': 'Make an image of your top to share',
  'Вид топа': 'Top view', 'Рейтинг': 'Ranking', 'Тир-лист': 'Tier list', 'Статистика': 'Stats',
  'Поиск в моём топе': 'Search my top', 'Очистить': 'Clear', 'Фильтры': 'Filters',
  'Перетаскивай постеры мышью, чтобы менять места и тиры.': 'Drag posters with the mouse to change places and tiers.',
  'Задержи палец на постере и перетащи, чтобы поменять место или тир.': 'Hold a poster, then drag it to change its place or tier.',
  'Нажми на название тира, чтобы переименовать; стрелка под ним сворачивает тир до одной строки.': 'Tap a tier name to rename it; the arrow below it folds the tier to one row.',
  'Здесь будет твой топ': 'Your top will be here',
  'Найди аниме в каталоге': 'Find an anime in the catalog',
  'Поставь оценку от 1 до 10': 'Rate it from 1 to 10',
  'Смотри свой рейтинг или собери тир-лист': 'See your ranking or build a tier list',
  'Открыть каталог': 'Open the catalog',
  'Найди аниме и нажми на него, чтобы оценить': 'Find an anime and tap it to rate',
  'Название: «Фрирен», «Naruto»…': 'Title: “Frieren”, “Naruto”…',
  'Загружаю ещё…': 'Loading more…', 'Показать ещё': 'Show more',
  'Добавить': 'Add', 'Добавить аниме в топ': 'Add anime to your top', 'Найти аниме, чтобы добавить': 'Find an anime to add',
  'Закрыть полосу': 'Close the strip', 'Закрыть': 'Close', 'Аниме': 'Anime',
  'Картинка топа': 'Top image', 'Рисую…': 'Drawing…', 'Скачать': 'Download', 'Сбросить': 'Reset', 'Готово': 'Done',

  // словари
  'Сериал': 'TV series', 'Фильм': 'Movie', 'Спешл': 'Special', 'ТВ-спешл': 'TV special', 'Клип': 'Music video', 'Промо': 'Promo', 'Реклама': 'Commercial',
  'вышло': 'finished', 'ещё выходит': 'airing', 'анонс': 'announced',
  'Просмотрено': 'Completed', 'Смотрю': 'Watching', 'В планах': 'Plan to watch', 'Отложено': 'On hold', 'Брошено': 'Dropped', 'Не смотрел': 'Not watched',
  'Шедевр': 'Masterpiece', 'Великолепно': 'Great', 'Отлично': 'Very good', 'Хорошо': 'Good', 'Неплохо': 'Fine', 'Нормально': 'Average',
  'Так себе': 'So-so', 'Плохо': 'Bad', 'Ужасно': 'Awful', 'Хуже некуда': 'Appalling',

  // режимы, сортировки, фильтры
  'Аниме целиком': 'Whole anime', 'Все сезоны и фильмы одного аниме — одна строка и одна оценка': 'All seasons and movies of one anime — one row and one rating',
  'По сезонам': 'By season', 'Каждый сезон и фильм — отдельно, со своей оценкой': 'Every season and movie separately, each with its own rating',
  'По оценке': 'By score', 'По мировой оценке': 'By world score', 'Сначала с самой высокой': 'Highest first',
  'Оценка: с низкой': 'Score: lowest', 'По мировой оценке — с низкой': 'By world score — lowest first', 'Сначала с самой низкой': 'Lowest first',
  'Популярные': 'Popular', 'По популярности': 'By popularity', 'Что смотрят чаще всего': 'Most watched first',
  'Сначала новые': 'Newest first', 'Сначала старые': 'Oldest first', 'По дате выхода': 'By release date',
  'А → Я': 'A → Z', 'По алфавиту: А → Я': 'Alphabetical: A → Z', 'Я → А': 'Z → A', 'По алфавиту: Я → А': 'Alphabetical: Z → A',
  'По моей оценке': 'By my score', 'Моя выше мировой': 'Mine above world',
  'Сначала то, что нравится мне больше, чем остальным': 'What I like more than everyone else first',
  'Недавно добавленные': 'Recently added', 'По году выхода': 'By year', 'По названию': 'By title',
  'Любая': 'Any', 'Любой': 'Any', 'Любые': 'Any', 'Все': 'All', 'Тип': 'Type',
  'Статус выхода': 'Release status', 'Всё вышедшее': 'Everything released', 'Вышло полностью': 'Finished', 'Ещё выходит': 'Airing',
  'Мировая оценка': 'World score', 'Годы выхода': 'Years', 'Статус просмотра': 'Watch status', 'Моя оценка': 'My rating',
  'Жанр': 'Genre', 'Мировая': 'World', 'Моя': 'Mine', 'Без оценённых': 'Hide rated',
  '2020-е': '2020s', '2010-е': '2010s', '2000-е': '2000s', '1990-е': '1990s', 'До 1990': 'Before 1990',
  'Как считать сезоны': 'How to count seasons', 'Сортировка': 'Sorting', 'Убрать фильтр': 'Remove filter', 'Сбросить всё': 'Reset all',
  'Работает, когда ищешь по названию': 'Works when you search by title',
  'Фильтры каталога': 'Catalog filters', 'Фильтры моего топа': 'My top filters',
  'Жанры': 'Genres', '— можно несколько': '— pick several', 'Аудитория': 'Audience', 'Темы': 'Themes',
  'Свернуть темы': 'Hide themes', 'Показать темы ({n})': 'Show themes ({n})', 'Жанры загружаются…': 'Loading genres…',
  'Скрыть уже оценённые': 'Hide already rated', 'Показывать только то, чего ещё нет в моём топе': 'Show only what is not in my top yet',

  // каталог
  'Не получилось загрузить — проверь интернет': 'Couldn’t load — check your connection',
  'Не получилось загрузить': 'Couldn’t load', 'Проверь интернет и попробуй ещё раз.': 'Check your connection and try again.', 'Повторить': 'Retry',
  'Ничего не нашлось': 'Nothing found', 'Попробуй другое название или убери фильтры.': 'Try another title or remove filters.', 'Попробуй другое название.': 'Try another title.',
  'Сбросить фильтры': 'Reset filters', 'Всё найденное уже оценено': 'Everything found is already rated',
  'Включён фильтр «Скрыть уже оценённые».': 'The “Hide already rated” filter is on.', 'Показать оценённые': 'Show rated',
  'найдено частей: {n}': '{n} parts found', 'Серия': 'Series', 'Средняя мировая оценка серии': 'Average world score of the series',

  // тиры
  'Лучшие': 'Best', 'Отличные': 'Excellent', 'Хорошие': 'Good', 'Нормальные': 'Okay', 'Плохие': 'Bad',
  'тир {t}': 'tier {t}', 'Тир {t}': 'Tier {t}', 'Полоса «Не смотрел»': '“Not watched” row',
  'Название': 'Name', 'Подпись': 'Caption', 'Например: «Любимые»': 'For example: “Favorites”', 'Как было': 'Default', 'Сохранить': 'Save',
  'Тир переименован': 'Tier renamed', 'Показать все ({n})': 'Show all ({n})', 'Свернуть до одной строки': 'Fold to one row', 'Перенесено в {t}': 'Moved to {t}',
  'Без оценки': 'Unrated', 'Нажми, чтобы переименовать': 'Tap to rename',
  'Сюда — то, что ещё не смотрел': 'Put what you haven’t watched yet here', 'Пусто — перетащи сюда': 'Empty — drag posters here',

  // мой топ
  'Вся серия': 'Whole series', 'оценено частей: {n}': '{n} parts rated', 'Средняя мировая оценка по частям серии': 'Average world score across the series',
  'в мире': 'world', 'Среднее по моим оценкам сезонов': 'Average of my season ratings', 'Пока пусто': 'Empty so far',
  'средняя': 'average', 'просмотрено': 'completed',
  'В топе нет аниме, подходящих под поиск и фильтры.': 'Nothing in your top matches the search and filters.', 'Сбросить поиск и фильтры': 'Reset search and filters',

  // статистика
  'моя средняя': 'my average', 'в мире у тех же — {n}': 'world average for the same — {n}',
  'ты мягче мира': 'you’re kinder than the world', 'ты строже мира': 'you’re stricter than the world', 'как у всего мира': 'same as the world',
  'в среднем на столько баллов': 'average difference in points', '≈ {n} ч просмотра': '≈ {n} h watched',
  'Мои оценки': 'My ratings', 'без оценки — {n}': 'unrated — {n}',
  'Любимый жанр — <b>{g}</b>: средняя <b>{a}</b> по {n} аниме.': 'Favorite genre — <b>{g}</b>: average <b>{a}</b> across {n} anime.',
  'сколько и моя средняя': 'count and my average', 'По годам выхода': 'By release year', 'по десятилетиям': 'by decade',
  'моя': 'mine', 'мир': 'world', 'Ты и мир': 'You vs the world', 'Ты оценил выше мира': 'You rated higher than the world',
  'Ты оценил ниже мира': 'You rated lower than the world', 'где твоё мнение сильнее всего расходится': 'where your opinion differs the most',
  'Статусы': 'Statuses', 'Серия из частей': 'Multi-part series', 'Другое': 'Other', 'Типы': 'Types',

  // полоса «Добавить»
  'Задержи палец на постере и перетащи': 'Hold a poster and drag it', 'Перетащи постер': 'Drag a poster',
  'в нужный тир': 'to a tier', 'в нужный тир или в «{nw}»': 'to a tier or to “{nw}”', 'в топ — откроется оценка': 'to your top — the rating card will open',
  'Показано:': 'Showing:', 'аниме целиком': 'whole anime', 'каждый сезон отдельно': 'each season separately',
  'Всё найденное уже в твоём топе': 'Everything found is already in your top',
  'Добавлено в {t}': 'Added to {t}', 'Добавлено в топ — поставь оценку': 'Added to your top — now rate it',

  // карточка
  '{a} из {b} эп.': '{a} of {b} ep.', '{n} эп.': '{n} ep.', 'в мире, в среднем по серии': 'world, series average',
  'Читать полностью': 'Read more', 'Открыть на Shikimori': 'Open on Shikimori', 'Открыть в Anixart': 'Open in Anixart',
  'Моя оценка всей серии': 'My rating of the whole series', 'Моя оценка этой части': 'My rating of this part',
  'Среднее по моим оценкам частей — {n}. Можно поставить отдельную оценку всей серии.': 'Average of my part ratings — {n}. You can rate the whole series separately.',
  'Нажми на число, чтобы оценить.': 'Tap a number to rate.', 'Нажми на число — аниме сразу попадёт в твой топ.': 'Tap a number — the anime goes straight into your top.',
  'Тир': 'Tier', 'для тир-листа': 'for the tier list', 'Тир подбирается по оценке': 'Tier follows the rating', 'Авто': 'Auto',
  'Место в «{t}»:': 'Place in “{t}”:', 'Место в тире {t}:': 'Place in tier {t}:', 'Выше': 'Up', 'из': 'of', 'Ниже': 'Down',
  'Это аниме ещё не вышло — оценить можно будет после выхода.': 'This anime isn’t out yet — you can rate it after release.',
  'Убрать оценку': 'Remove rating', 'Статус': 'Status', 'Заметка': 'Note', 'Чем зацепило, любимый персонаж, момент…': 'What hooked you, favorite character, a moment…',
  'Убрать из топа': 'Remove from top', 'Сезоны и фильмы серии': 'Seasons and movies', 'Все части серии': 'All parts of the series',
  'Каждую часть можно оценить отдельно': 'Each part can be rated separately', 'ещё не вышло': 'not out yet', 'Не оценено': 'Not rated',
  'Оценка': 'Rating', 'Оценка убрана': 'Rating removed', 'Добавлено в топ': 'Added to your top', 'Тир — по оценке': 'Tier follows the rating', 'Убрано из топа': 'Removed from your top',

  // картинка
  'Мой тир-лист аниме': 'My anime tier list', 'Мой топ аниме': 'My anime top', 'шедевров: {n}': 'masterpieces: {n}', 'Пусто': 'Empty',
  '…и ещё {n}': '…and {n} more', 'данные: Shikimori': 'data: Shikimori', 'Рисую картинку…': 'Drawing the image…',
  'Тир-лист целиком — со всеми тирами, даже свёрнутыми': 'The whole tier list — every tier, even folded ones',
  'Рейтинг в выбранной сортировке, до 50 мест': 'Ranking in the chosen order, up to 50 places',
  'Загружаю постеры… {d} из {n}': 'Loading posters… {d} of {n}', 'Картинка моего топа': 'Image of my top',
  'Не получилось нарисовать картинку. Проверь интернет и попробуй ещё раз.': 'Couldn’t draw the image. Check your connection and try again.',
  'Картинка сохранена': 'Image saved',

  // меню
  'Сохранить копию топа': 'Save a backup', 'Файл с твоими оценками — на всякий случай': 'A file with your ratings, just in case',
  'Загрузить копию': 'Load a backup', 'Вернуть оценки из сохранённого файла': 'Restore ratings from a saved file',
  'Установить как приложение': 'Install as an app', 'Значок на главном экране': 'An icon on your home screen',
  'Оценки хранятся только на этом устройстве. Данные об аниме — Shikimori.': 'Ratings are stored only on this device. Anime data — Shikimori.',
  'Копия сохранена в файл': 'Backup saved to a file',
  'В файле {n} {w}. Добавить их в твой топ? Совпадающие заменятся версией из файла.': 'The file has {n} {w}. Add them to your top? Matching ones will be replaced by the file’s version.',
  'Загружено': 'Loaded', 'Это не файл топа': 'This isn’t a top file',
  'Не удалось сохранить — память браузера недоступна': 'Couldn’t save — browser storage is unavailable',
};
// английские формы для plural(): [одна, много]
const EN_PL = {
  'аниме': ['anime', 'anime'], 'аниме в топе': ['anime in the top', 'anime in the top'],
  'сезон или фильм': ['season or movie', 'seasons and movies'], 'шедевр': ['masterpiece', 'masterpieces'],
  'эпизод': ['episode', 'episodes'], 'оценка': ['rating', 'ratings'], 'часть': ['part', 'parts'],
};
