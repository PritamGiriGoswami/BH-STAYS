const express = require('express');
const crypto = require('crypto');
const bookingsModel = require('../models/bookings');
const propertiesModel = require('../models/properties');
const { razorpayCredentials, razorpayApiGet } = require('../razorpay');
const { requireAuth } = require('../middleware/auth');
const { isDateString, isEmail } = require('../middleware/validate');
const outbox = require('../email/outbox');
const { badRequest, notFoundError } = require('../middleware/errors');

const router = express.Router();

const RAZORPAY_ORDERS_URL = 'https://api.razorpay.com/v1/orders';

router.use(requireAuth);

function notConfigured(res) {
  return res.status(503).json({
    error: 'Payment provider is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.',
  });
}

router.post('/order', async (req, res, next) => {
  try {
    const creds = razorpayCredentials();
    if (!creds) return notConfigured(res);

    const propertyId = typeof req.body.propertyId === 'string' ? req.body.propertyId : '';
    const checkIn = typeof req.body.checkIn === 'string' ? req.body.checkIn : '';
    const checkOut = typeof req.body.checkOut === 'string' ? req.body.checkOut : '';
    const guestName = typeof req.body.guestName === 'string' ? req.body.guestName.trim() : '';
    const guestEmail =
      typeof req.body.guestEmail === 'string' ? req.body.guestEmail.trim().toLowerCase() : '';

    if (!propertyId) throw badRequest('propertyId is required.');
    if (!isDateString(checkIn)) throw badRequest('checkIn must be a valid date in YYYY-MM-DD format.');
    if (!isDateString(checkOut)) throw badRequest('checkOut must be a valid date in YYYY-MM-DD format.');
    if (checkIn < new Date().toISOString().slice(0, 10)) {
      throw badRequest('checkIn cannot be in the past.');
    }
    if (checkOut <= checkIn) throw badRequest('checkOut must be after checkIn.');
    if (guestName.length < 2 || guestName.length > 120) {
      throw badRequest('A guest name between 2 and 120 characters is required.');
    }
    if (!isEmail(guestEmail)) throw badRequest('A valid guest email address is required.');

    const property = propertiesModel.findById(propertyId);
    if (!property) throw notFoundError('Property not found.');
    const pricing = bookingsModel.computePricing(property, checkIn, checkOut);
    if (!pricing) throw badRequest('Could not compute pricing for the given dates.');
    const amount = Math.round(pricing.total * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw badRequest('Could not compute a valid payment amount for the given dates.');
    }

    let response;
    try {
      response = await fetch(RAZORPAY_ORDERS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64'),
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `bh_${crypto.randomUUID().replaceAll('-', '')}`,
          notes: {
            userId: String(req.userId),
            propertyId,
            checkIn,
            checkOut,
            guestName,
            guestEmail,
          },
        }),
      });
    } catch (err) {
      console.error('[payments] Razorpay order request failed:', err.message);
      return res.status(502).json({ error: 'Could not connect to Razorpay to create the payment order.' });
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[payments] Razorpay order creation failed:', data);
      return res.status(502).json({ error: 'Could not create the payment order with Razorpay.' });
    }
    if (typeof data.id !== 'string' || data.amount !== amount || data.currency !== 'INR') {
      console.error('[payments] Razorpay returned an invalid order response.');
      return res.status(502).json({ error: 'Razorpay returned an invalid payment order.' });
    }

    res.status(201).json({ keyId: creds.keyId, order: data, amount });
  } catch (err) {
    next(err);
  }
});

router.post('/verify', (req, res, next) => {
  (async () => {
    const creds = razorpayCredentials();
    if (!creds) return notConfigured(res);

    const orderId = typeof req.body.razorpay_order_id === 'string' ? req.body.razorpay_order_id : '';
    const paymentId = typeof req.body.razorpay_payment_id === 'string' ? req.body.razorpay_payment_id : '';
    const signature = typeof req.body.razorpay_signature === 'string' ? req.body.razorpay_signature : '';

    if (!orderId || !paymentId || !signature) {
      throw badRequest('razorpay_order_id, razorpay_payment_id and razorpay_signature are required.');
    }

    const expected = crypto
      .createHmac('sha256', creds.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const provided = Buffer.from(signature, 'utf8');
    const computed = Buffer.from(expected, 'utf8');
    const valid =
      provided.length === computed.length && crypto.timingSafeEqual(provided, computed);

    if (!valid) {
      return res.status(400).json({ verified: false, error: 'Payment signature verification failed.' });
    }

    const existing = bookingsModel.findByPaymentId(paymentId, req.userId);
    if (existing) {
      if (existing.paymentOrderId !== orderId) {
        return res.status(409).json({ verified: false, error: 'Payment is already associated with another order.' });
      }
      return res.json({ verified: true, orderId, paymentId, booking: existing });
    }

    let order;
    let payment;
    try {
      [order, payment] = await Promise.all([
        razorpayApiGet(`/orders/${encodeURIComponent(orderId)}`),
        razorpayApiGet(`/payments/${encodeURIComponent(paymentId)}`),
      ]);
    } catch (err) {
      console.error('[payments] Could not confirm payment status with Razorpay:', err.message);
      return res.status(502).json({
        verified: false,
        error: 'Could not confirm payment status with Razorpay. Your booking is not confirmed; contact support before retrying.',
      });
    }

    const notes = order.notes || {};
    if (
      order.id !== orderId ||
      payment.id !== paymentId ||
      payment.order_id !== orderId ||
      String(notes.userId || '') !== String(req.userId)
    ) {
      return res.status(400).json({ verified: false, error: 'Payment does not match this account and order.' });
    }

    if (payment.status !== 'captured') {
      const message = payment.status === 'authorized'
        ? 'Payment is authorized but not captured. The booking remains unconfirmed.'
        : `Payment is not captured (status: ${payment.status || 'unknown'}). The booking remains unconfirmed.`;
      return res.status(409).json({ verified: false, paymentStatus: payment.status || 'unknown', error: message });
    }

    const propertyId = String(notes.propertyId || '');
    const checkIn = String(notes.checkIn || '');
    const checkOut = String(notes.checkOut || '');
    const guestName = String(notes.guestName || '').trim();
    const guestEmail = String(notes.guestEmail || '').trim().toLowerCase();
    if (
      !propertyId ||
      !isDateString(checkIn) ||
      !isDateString(checkOut) ||
      checkIn < new Date().toISOString().slice(0, 10) ||
      checkOut <= checkIn
    ) {
      return res.status(400).json({ verified: false, error: 'The payment order contains invalid booking details.' });
    }
    if (guestName.length < 2 || guestName.length > 120 || !isEmail(guestEmail)) {
      return res.status(400).json({ verified: false, error: 'The payment order is missing valid guest details.' });
    }

    const property = propertiesModel.findById(propertyId);
    if (!property) throw notFoundError('Property not found for this payment.');
    const pricing = bookingsModel.computePricing(property, checkIn, checkOut);
    const expectedAmount = pricing && Math.round(pricing.total * 100);
    if (
      !pricing ||
      !Number.isSafeInteger(expectedAmount) ||
      order.amount !== expectedAmount ||
      payment.amount !== expectedAmount ||
      order.currency !== 'INR' ||
      payment.currency !== 'INR'
    ) {
      return res.status(400).json({ verified: false, error: 'Payment amount or currency does not match the booking.' });
    }

    const existingOrder = bookingsModel.findByPaymentOrderId(orderId, req.userId);
    if (existingOrder) {
      if (existingOrder.paymentId !== paymentId) {
        return res.status(409).json({
          verified: false,
          error: 'This payment order already has a confirmed booking.',
        });
      }
      return res.json({ verified: true, orderId, paymentId, booking: existingOrder });
    }

    const booking = bookingsModel.createPaid({
      userId: req.userId,
      property,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      pricing,
      paymentOrderId: orderId,
      paymentId,
      paymentMethod: payment.method,
    });

    outbox.enqueue('booking-confirmation', {
      orderId,
      paymentId,
      paymentMethod: payment.method || '',
    });

    return res.json({ verified: true, orderId, paymentId, booking });
  })().catch(next);
});

module.exports = router;
