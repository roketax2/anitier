-- Аккаунты AniTier (2026-11-17). Как у StalZone Calc AI: пароль растягивается в браузере
-- (PBKDF2), здесь только SHA-256 от результата с личной солью. Почту не храним — отпечаток HMAC
-- и маска «i•••@gmail.com»; от Google — только постоянный номер пользователя (sub).
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  login TEXT NOT NULL,
  login_lower TEXT NOT NULL UNIQUE,
  -- Пусто — у аккаунта нет пароля (создан через Google).
  pass_salt TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  -- Пусто — кода восстановления нет (аккаунт с почтой или через Google).
  recovery_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  email_hash TEXT,
  email_mask TEXT,
  google_sub TEXT,
  -- Ссылка на топ: пусто — топ закрыт.
  share_id TEXT
);
CREATE UNIQUE INDEX users_email ON users(email_hash) WHERE email_hash IS NOT NULL;
CREATE UNIQUE INDEX users_google ON users(google_sub) WHERE google_sub IS NOT NULL;
CREATE UNIQUE INDEX users_share ON users(share_id) WHERE share_id IS NOT NULL;

-- Вход с устройства: в базе только хеш токена. via — как вошли (password | recovery | email | google).
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  via TEXT NOT NULL DEFAULT 'password'
);
CREATE INDEX sessions_user ON sessions(user_id);

-- Топ целиком: JSON как в браузере (оценки, серии, названия тиров). version растёт с каждой
-- записью — так два устройства не затирают друг друга молча.
CREATE TABLE tops (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Коды из писем: один действующий код на почту и цель, в базе только хеш кода.
CREATE TABLE email_codes (
  email_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  sent_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (email_hash, purpose)
);

-- Сколько писем ушло за день — бесплатный тариф почтового сервиса ограничен.
CREATE TABLE email_daily (
  day TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);

-- Ограничение попыток по хешу адреса или почты — сам IP не храним.
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
