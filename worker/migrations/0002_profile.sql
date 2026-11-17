-- Ник и аватарка (2026-11-17, просьба автора). Ник — для показа (в шапке и в ссылке на топ),
-- логин остаётся для входа: от него растягивается пароль. Аватарка — своя картинка 160×160
-- (data:image/…;base64, до ~40 КБ) или ссылка на постер аниме с Shikimori.
ALTER TABLE users ADD COLUMN nick TEXT;
ALTER TABLE users ADD COLUMN avatar TEXT;
