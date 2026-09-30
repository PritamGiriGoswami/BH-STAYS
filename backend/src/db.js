const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new DatabaseSync(config.dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const MIGRATIONS = [
  {
    version: 1,
    name: 'create_initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        email         TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE IF NOT EXISTS properties (
        id             TEXT    PRIMARY KEY,
        title          TEXT    NOT NULL,
        category       TEXT    NOT NULL,
        stars          INTEGER NOT NULL DEFAULT 0,
        rating         REAL    NOT NULL DEFAULT 0,
        reviews_count  INTEGER NOT NULL DEFAULT 0,
        location       TEXT    NOT NULL DEFAULT '',
        image          TEXT    NOT NULL DEFAULT '',
        price          INTEGER NOT NULL DEFAULT 0,
        discount_price INTEGER,
        guests         INTEGER NOT NULL DEFAULT 1,
        bedrooms       INTEGER NOT NULL DEFAULT 1,
        baths          INTEGER NOT NULL DEFAULT 1,
        featured       INTEGER NOT NULL DEFAULT 0,
        badge          TEXT    NOT NULL DEFAULT '',
        description    TEXT    NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id        INTEGER NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
        property_id    TEXT    NOT NULL REFERENCES properties(id),
        guest_name     TEXT,
        guest_email    TEXT,
        check_in       TEXT    NOT NULL,
        check_out      TEXT    NOT NULL,
        nights         INTEGER NOT NULL,
        price_per_night INTEGER NOT NULL,
        base_price     REAL    NOT NULL,
        service_fee    REAL    NOT NULL,
        taxes          REAL    NOT NULL,
        total          REAL    NOT NULL,
        status         TEXT    NOT NULL DEFAULT 'Confirmed',
        created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

      CREATE TABLE IF NOT EXISTS bookmarks (
        user_id     INTEGER NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
        property_id TEXT    NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        PRIMARY KEY (user_id, property_id)
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        email        TEXT    NOT NULL UNIQUE,
        subscribed_at TEXT   NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `,
  },
];

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations').all();
  const applied = new Set(appliedRows.map((row) => row.version));

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) {
      continue;
    }
    db.exec('BEGIN');
    try {
      db.exec(migration.up);
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name
      );
      db.exec('COMMIT');
      console.log(`[db] Applied migration v${migration.version}: ${migration.name}`);
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

runMigrations();

module.exports = db;