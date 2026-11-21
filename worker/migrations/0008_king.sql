-- «Царь горы» (2026-11-22): сколько раз каждый участник становился царём у игроков и сколько боёв выиграл.
-- kind — что соревновалось (anime / chars / chars-m / chars-f / op / ost), item — номер участника с сайта.
CREATE TABLE king_items (
  kind TEXT NOT NULL,
  item TEXT NOT NULL,
  title TEXT NOT NULL,
  img TEXT NOT NULL,
  sub TEXT NOT NULL,
  kings INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL,
  PRIMARY KEY (kind, item)
);
CREATE INDEX king_items_top ON king_items(kind, kings DESC, wins DESC);
-- защита от накрутки: не больше 60 игр в день с одного браузера/аккаунта и не чаще раза в 15 секунд
CREATE TABLE king_players (
  voter TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  n INTEGER NOT NULL,
  last INTEGER NOT NULL
);
