-- «Лучшие персонажи» (2026-11-22): сколько раз персонажа выбрали в каждом вопросе теста (cat — «strong», «smart», «pretty_f»…).
CREATE TABLE best_items (
  cat TEXT NOT NULL,
  item TEXT NOT NULL,
  title TEXT NOT NULL,
  img TEXT NOT NULL,
  sub TEXT NOT NULL,
  picks INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL,
  PRIMARY KEY (cat, item)
);
CREATE INDEX best_items_top ON best_items(cat, picks DESC);
-- защита от накрутки: не больше 30 тестов в день с браузера/аккаунта и не чаще раза в 20 секунд
CREATE TABLE best_players (
  voter TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  n INTEGER NOT NULL,
  last INTEGER NOT NULL
);
