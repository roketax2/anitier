-- Секретные коды (2026-11-18). Награды аккаунта — JSON в users.rewards:
-- {"frames": ["pr_key"], "badges": ["dev"], "all": true, "n": 2} — all — все рамки (код разработчика), n — сколько кодов введено.
ALTER TABLE users ADD COLUMN rewards TEXT;

-- kind: personal — личный (сгорает после одного ввода), shared — общий (каждый вводит один раз, max_uses — лимит людей)
CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  reward TEXT NOT NULL,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE promo_uses (
  code TEXT NOT NULL REFERENCES promo_codes(code) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  at INTEGER NOT NULL,
  PRIMARY KEY (code, user_id)
);
CREATE INDEX promo_uses_user ON promo_uses(user_id);
