const db = require('../db');
const propertiesModel = require('./properties');

function isBookmarked(userId, propertyId) {
  return !!db
    .prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND property_id = ?')
    .get(userId, propertyId);
}

function bookmarkIds(userId) {
  return db
    .prepare('SELECT property_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId)
    .map((row) => row.property_id);
}

function add(userId, propertyId) {
  db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, property_id) VALUES (?, ?)').run(
    userId,
    propertyId
  );
}

function remove(userId, propertyId) {
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND property_id = ?').run(userId, propertyId);
}

function listBookmarkedProperties(userId) {
  const rows = db
    .prepare(`
      SELECT p.* FROM bookmarks b
      JOIN properties p ON p.id = b.property_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `)
    .all(userId);
  return {
    bookmarks: rows.map((row) => propertiesModel.toPublic(row)),
    bookmarkIds: bookmarkIds(userId),
  };
}

module.exports = { isBookmarked, bookmarkIds, add, remove, listBookmarkedProperties };