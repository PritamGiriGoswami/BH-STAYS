const db = require('../db');
const propertiesModel = require('../models/properties');
const usersModel = require('../models/users');
const propertiesData = require('./properties.json');

const DEMO_USER = {
  name: 'Demo Guest',
  email: 'demo@bhstays.com',
  password: 'demo1234',
};

function seedProperties() {
  if (propertiesModel.count() > 0) {
    console.log('[seed] Properties already present, skipping.');
    return;
  }

  const insert = db.prepare(`
    INSERT INTO properties
      (id, title, category, stars, rating, reviews_count, location, image,
       price, discount_price, guests, bedrooms, baths, featured, badge, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of propertiesData) {
    insert.run(
      p.id,
      p.title,
      p.category,
      p.stars,
      p.rating,
      p.reviews_count,
      p.location,
      p.image,
      p.price,
      p.discount_price,
      p.guests,
      p.bedrooms,
      p.baths,
      p.featured ? 1 : 0,
      p.badge,
      p.description
    );
  }

  console.log(`[seed] Inserted ${propertiesData.length} properties.`);
}

function seedDemoUser() {
  if (usersModel.findByEmail(DEMO_USER.email)) {
    console.log('[seed] Demo user already exists, skipping.');
    return;
  }

  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync(DEMO_USER.password, 10);
  usersModel.create({ name: DEMO_USER.name, email: DEMO_USER.email, passwordHash });
  console.log(`[seed] Created demo user: ${DEMO_USER.email} (password: ${DEMO_USER.password})`);
}

seedProperties();
seedDemoUser();

console.log('[seed] Done.');
module.exports = { seedProperties, seedDemoUser };