-- Table
CREATE TABLE memo (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    , title TEXT NOT NULL
    , content TEXT NOT NULL
    , search TEXT NOT NULL
    , created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
    , updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')) 
);

CREATE TRIGGER trigger_memo_updated_at AFTER UPDATE ON memo
BEGIN
    UPDATE memo SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;
