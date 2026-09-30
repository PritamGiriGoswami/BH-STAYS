const db = require('../db');

const PRICE_SERVICE_PERCENT = 0.1;
const PRICE_TAX_PERCENT = 0.05;

function computePricing(property, checkIn, checkOut) {
  const start = new Date(`${checkIn}T00:00:00.000Z`);
  const end = new Date(`${checkOut}T00:00:00.000Z`);
  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(nights) || nights < 1) {
    return null;
  }

  const basePrice = property.price * nights;
  const serviceFee = Math.round(basePrice * PRICE_SERVICE_PERCENT);
  const taxes = Math.round(basePrice * PRICE_TAX_PERCENT);
  const total = basePrice + serviceFee + taxes;

  return { nights, basePrice, serviceFee, taxes, total };
}

function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    pricePerNight: row.price_per_night,
    basePrice: row.base_price,
    serviceFee: row.service_fee,
    taxes: row.taxes,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
  };
}

const SELECT_WITH_PROPERTY = `
  SELECT
    b.id,
    b.user_id,
    b.property_id,
    b.guest_name,
    b.guest_email,
    b.check_in,
    b.check_out,
    b.nights,
    b.price_per_night,
    b.base_price,
    b.service_fee,
    b.taxes,
    b.total,
    b.status,
    b.created_at,
    p.title AS property_title,
    p.location AS property_location,
    p.image AS property_image
  FROM bookings b
  JOIN properties p ON p.id = b.property_id
`;

function create({ userId, property, guestName, guestEmail, checkIn, checkOut, pricing }) {
  const info = db
    .prepare(`
      INSERT INTO bookings
        (user_id, property_id, guest_name, guest_email, check_in, check_out,
         nights, price_per_night, base_price, service_fee, taxes, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      userId,
      property.id,
      guestName || null,
      guestEmail || null,
      checkIn,
      checkOut,
      pricing.nights,
      property.price,
      pricing.basePrice,
      pricing.serviceFee,
      pricing.taxes,
      pricing.total
    );
  return findById(Number(info.lastInsertRowid), userId);
}

function findById(id, userId) {
  const row = db
    .prepare(`${SELECT_WITH_PROPERTY} WHERE b.id = ? AND b.user_id = ? LIMIT 1`)
    .get(id, userId);
  return toPublicWithProperty(row);
}

function listByUser(userId) {
  const rows = db
    .prepare(`${SELECT_WITH_PROPERTY} WHERE b.user_id = ? ORDER BY b.created_at DESC, b.id DESC`)
    .all(userId);
  return rows.map(toPublicWithProperty);
}

function toPublicWithProperty(row) {
  if (!row) return null;
  const booking = toPublic(row);
  return {
    ...booking,
    property: {
      id: row.property_id,
      title: row.property_title,
      location: row.property_location,
      image: row.property_image,
    },
  };
}

module.exports = { computePricing, create, findById, listByUser, toPublic };