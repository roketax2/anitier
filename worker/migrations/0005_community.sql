-- Рейтинг сообщества (2026-11-18): оценки каждого голосующего одной строкой.
-- voter — «u:<id аккаунта>» или «v:<случайный номер браузера>»; anime — {id: оценка}, themes — {ключ: [оценка, данные о песне]}.
CREATE TABLE votes (
  voter TEXT PRIMARY KEY,
  anime TEXT NOT NULL,
  themes TEXT NOT NULL,
  updated INTEGER NOT NULL
);
CREATE INDEX votes_updated ON votes(updated);
-- Посчитанные средние: одна строка на вид (anime / themes), пересчёт не чаще раза в 30 минут.
CREATE TABLE community (
  kind TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated INTEGER NOT NULL
);
