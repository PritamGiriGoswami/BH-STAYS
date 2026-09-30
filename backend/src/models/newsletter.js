const db = require('../db');

function findByEmail(email) {
  return db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(email);
}

function create(email) {
  const info = db
    .prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)')
    .run(email);
  return Number(info.lastInsertRowid);
}

function count() {
  const row = db.prepare('SELECT COUNT(*) AS total FROM newsletter_subscribers').get();
  return row.total;
}

module.exports = { findByEmail, create, count };