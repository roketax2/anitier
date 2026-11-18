-- Тип посетителя (2026-11-18): без IP и логина — только телефон/компьютер, браузер, система, страна
-- и отметка «робот» (такие не считаются в счётчике).
ALTER TABLE visitors ADD COLUMN device TEXT;
ALTER TABLE visitors ADD COLUMN browser TEXT;
ALTER TABLE visitors ADD COLUMN os TEXT;
ALTER TABLE visitors ADD COLUMN country TEXT;
ALTER TABLE visitors ADD COLUMN bot INTEGER NOT NULL DEFAULT 0;
