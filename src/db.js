// src/db.js
// Zero-config file-based SQLite database — no separate DB server needed.
// Swap this file out later if you outgrow SQLite (Postgres/MySQL/Mongo);
// nothing outside this file needs to know how storage works.

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "data.sqlite");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT '',
    author TEXT DEFAULT 'Admin',
    excerpt TEXT DEFAULT '',
    body TEXT NOT NULL,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    tags TEXT NOT NULL DEFAULT '[]',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
