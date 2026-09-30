const db = require('../db');

const PUBLIC_FIELDS = [
  'id',
  'title',
  'category',
  'stars',
  'rating',
  'reviews_count',
  'location',
  'image',
  'price',
  'discount_price',
  'guests',
  'bedrooms',
  'baths',
  'featured',
  'badge',
  'description',
];

const PUBLIC_COLUMNS = PUBLIC_FIELDS.join(', ');

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    stars: row.stars,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    location: row.location,
    image: row.image,
    price: row.price,
    discountPrice: row.discount_price,
    guests: row.guests,
    bedrooms: row.bedrooms,
    baths: row.baths,
    featured: !!row.featured,
    badge: row.badge,
    description: row.description,
  };
}

function list({ category, query, guests, sort }) {
  const conditions = [];
  const params = [];

  if (category && category !== 'all') {
    if (category === '5star') {
      conditions.push('stars = 5');
    } else {
      conditions.push('category = ?');
      params.push(category);
    }
  }

  if (query && query.trim() !== '') {
    conditions.push('(LOWER(title) LIKE ? OR LOWER(location) LIKE ?)');
    const like = `%${query.trim().toLowerCase()}%`;
    params.push(like, like);
  }

  if (guests && Number.isInteger(guests)) {
    conditions.push('guests >= ?');
    params.push(guests);
  }

  let sql = `SELECT ${PUBLIC_COLUMNS} FROM properties`;
  if (conditions.length) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  switch (sort) {
    case 'price-low':
      sql += ' ORDER BY price ASC';
      break;
    case 'price-high':
      sql += ' ORDER BY price DESC';
      break;
    case 'rating':
      sql += ' ORDER BY rating DESC';
      break;
    default:
      sql += ' ORDER BY featured DESC, rating DESC';
  }

  return db.prepare(sql).all(...params).map(toPublic);
}

function findById(id) {
  const row = db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM properties WHERE id = ?`).get(id);
  return toPublic(row);
}

function count() {
  const row = db.prepare('SELECT COUNT(*) AS total FROM properties').get();
  return row.total;
}

module.exports = { list, findById, count, toPublic };