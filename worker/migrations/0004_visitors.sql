-- Счётчик игроков (2026-11-18): анонимный случайный номер вкладки/устройства из localStorage.
-- Ни IP, ни логина — только когда номер впервые и последний раз был на сайте.
CREATE TABLE visitors (
  id TEXT PRIMARY KEY,
  first_at INTEGER NOT NULL,
  seen_at INTEGER NOT NULL
);
CREATE INDEX visitors_seen ON visitors(seen_at);
