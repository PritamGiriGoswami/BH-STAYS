const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bh-stays-payments-'));
process.env.DB_PATH = path.join(tempDir, 'payments.sqlite');
process.env.JWT_SECRET = 'payment-test-secret';
process.env.NODE_ENV = 'test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock';
process.env.RAZORPAY_KEY_SECRET = 'razorpay-test-secret';

let app;
let db;
let server;
let authToken;
let baseUrl;
let nativeFetch;
let orderNumber = 0;
const mockOrders = new Map();
const mockPayments = new Map();

before(async () => {
  db = require('../src/db');
  const property = require('../src/seed/properties.json')[0];
  db.prepare(`
    INSERT INTO properties
      (id, title, category, stars, rating, reviews_count, location, image, price,
       discount_price, guests, bedrooms, baths, featured, badge, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    property.id,
    property.title,
    property.category,
    property.stars,
    property.rating,
    property.reviews_count,
    property.location,
    property.image,
    property.price,
    property.discount_price,
    property.guests,
    property.bedrooms,
    property.baths,
    property.featured ? 1 : 0,
    property.badge,
    property.description
  );
  const user = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run('Payment Guest', 'payment-guest@example.test', 'not-used-by-test');
  authToken = require('../src/middleware/auth').signToken(Number(user.lastInsertRowid));

  const outbox = require('../src/email/outbox');
  outbox.enqueue = () => null;
  app = require('../src/app')();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  nativeFetch = global.fetch;
  global.fetch = async (input, init) => {
    const url = String(input);
    if (url === 'https://api.razorpay.com/v1/orders' && init?.method === 'POST') {
      const request = JSON.parse(init.body);
      const order = {
        id: `order_test_${++orderNumber}`,
        amount: request.amount,
        currency: request.currency,
        receipt: request.receipt,
        notes: request.notes,
      };
      mockOrders.set(order.id, order);
      return Response.json(order, { status: 201 });
    }
    const orderMatch = url.match(/^https:\/\/api\.razorpay\.com\/v1\/orders\/([^/]+)$/);
    if (orderMatch) {
      const order = mockOrders.get(decodeURIComponent(orderMatch[1]));
      return order
        ? Response.json(order)
        : Response.json({ error: { description: 'Order not found' } }, { status: 404 });
    }
    const paymentMatch = url.match(/^https:\/\/api\.razorpay\.com\/v1\/payments\/([^/]+)$/);
    if (paymentMatch) {
      const payment = mockPayments.get(decodeURIComponent(paymentMatch[1]));
      return payment
        ? Response.json(payment)
        : Response.json({ error: { description: 'Payment not found' } }, { status: 404 });
    }
    return nativeFetch(input, init);
  };
});

after(async () => {
  global.fetch = nativeFetch;
  if (server) await new Promise((resolve) => server.close(resolve));
  if (db) db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function authHeaders() {
  return { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };
}

async function post(pathname, body, authenticated = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (authenticated) headers.Authorization = `Bearer ${authToken}`;
  const response = await nativeFetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
}

async function createOrder(overrides = {}) {
  return post('/api/payments/order', {
    propertyId: 'stay-1',
    checkIn: '2030-01-10',
    checkOut: '2030-01-11',
    guestName: 'Payment Guest',
    guestEmail: 'payment-guest@example.test',
    ...overrides,
  });
}

async function verifyOrder(order, paymentId, paymentOverrides = {}, signatureOverride) {
  mockPayments.set(paymentId, {
    id: paymentId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: 'captured',
    method: 'upi',
    ...paymentOverrides,
  });
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.id}|${paymentId}`)
    .digest('hex');
  return post('/api/payments/verify', {
    razorpay_order_id: order.id,
    razorpay_payment_id: paymentId,
    razorpay_signature: signatureOverride || signature,
  });
}

test('payment API validates, verifies, and persists only captured payments', async (t) => {
  await t.test('requires authentication and valid booking inputs', async () => {
    const unauthenticated = await post('/api/payments/order', {}, false);
    assert.equal(unauthenticated.response.status, 401);

    const invalidDates = await createOrder({ checkOut: '2030-01-10' });
    assert.equal(invalidDates.response.status, 400);
    assert.match(invalidDates.body.error, /checkOut must be after checkIn/);

    const pastDates = await createOrder({ checkIn: '2000-01-01', checkOut: '2000-01-02' });
    assert.equal(pastDates.response.status, 400);
    assert.match(pastDates.body.error, /checkIn cannot be in the past/);
  });

  await t.test('creates an order and confirms a captured payment idempotently', async () => {
    const orderResult = await createOrder();
    assert.equal(orderResult.response.status, 201);
    const order = orderResult.body.order;
    assert.equal(order.currency, 'INR');
    assert.equal(order.notes.propertyId, 'stay-1');

    const verified = await verifyOrder(order, 'pay_test_captured');
    assert.equal(verified.response.status, 200);
    assert.equal(verified.body.verified, true);
    assert.equal(verified.body.booking.status, 'Confirmed');
    assert.equal(verified.body.booking.paymentStatus, 'paid');
    assert.equal(verified.body.booking.paymentProvider, 'razorpay');
    assert.equal(verified.body.booking.paymentMethod, 'upi');

    const confirmation = await nativeFetch(
      `${baseUrl}/api/bookings/${verified.body.booking.id}`,
      { headers: authHeaders() }
    );
    const confirmationData = await confirmation.json();
    assert.equal(confirmation.status, 200);
    assert.equal(confirmationData.booking.status, 'Confirmed');
    assert.equal(confirmationData.booking.paymentStatus, 'paid');
    assert.equal(confirmationData.booking.property.title, 'The Grand Azure Oceanfront Resort');

    const repeated = await verifyOrder(order, 'pay_test_captured');
    assert.equal(repeated.response.status, 200);
    assert.equal(repeated.body.booking.id, verified.body.booking.id);
    assert.equal(
      db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE payment_order_id = ?').get(order.id).count,
      1
    );
  });

  await t.test('does not confirm authorized, failed, or amount-mismatched payments', async () => {
    const authorizedOrder = (await createOrder()).body.order;
    const authorized = await verifyOrder(authorizedOrder, 'pay_test_authorized', { status: 'authorized' });
    assert.equal(authorized.response.status, 409);
    assert.equal(authorized.body.verified, false);

    const failedOrder = (await createOrder()).body.order;
    const failed = await verifyOrder(failedOrder, 'pay_test_failed', { status: 'failed' });
    assert.equal(failed.response.status, 409);

    const mismatchedOrder = (await createOrder()).body.order;
    const mismatched = await verifyOrder(mismatchedOrder, 'pay_test_wrong_amount', {
      amount: mismatchedOrder.amount + 100,
    });
    assert.equal(mismatched.response.status, 400);

    assert.equal(
      db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE payment_status = 'paid'").get().count,
      1
    );
  });

  await t.test('rejects invalid signatures without creating a booking', async () => {
    const order = (await createOrder()).body.order;
    const result = await verifyOrder(order, 'pay_test_bad_signature', {}, 'invalid');
    assert.equal(result.response.status, 400);
    assert.equal(result.body.verified, false);
    assert.equal(
      db.prepare('SELECT COUNT(*) AS count FROM bookings WHERE payment_order_id = ?').get(order.id).count,
      0
    );
  });

  await t.test('keeps direct unpaid bookings separate from confirmed paid bookings', async () => {
    const result = await post('/api/bookings', {
      propertyId: 'stay-1',
      checkIn: '2030-01-12',
      checkOut: '2030-01-13',
      guestName: 'Payment Guest',
      guestEmail: 'payment-guest@example.test',
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.booking.status, 'Pending Payment');
    assert.equal(result.body.booking.paymentStatus, 'unpaid');
    assert.equal(result.body.booking.paymentId, null);
  });

  await t.test('reports an unconfigured gateway instead of simulating payment', async () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    process.env.RAZORPAY_KEY_ID = '';
    try {
      const result = await createOrder();
      assert.equal(result.response.status, 503);
      assert.match(result.body.error, /Payment provider is not configured/);
    } finally {
      process.env.RAZORPAY_KEY_ID = keyId;
    }
  });
});
