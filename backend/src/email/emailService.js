const fs = require('fs');
const path = require('path');
const { razorpayApiGet } = require('../razorpay');
const propertiesModel = require('../models/properties');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const RESEND_URL = 'https://api.resend.com/emails';

function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : ''
  );
}

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8');
}

function isResendConfigured() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM || '').trim();
  return Boolean(apiKey && from) && !/^replace-|change-me/i.test(apiKey) && !/^replace-|change-me/i.test(from);
}

function formatAmount(paise) {
  const rupees = Math.round(Number(paise || 0) / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function formatPaymentMethod(method, fallback) {
  const normalized = String(method || fallback || '').toLowerCase();
  const known = ['upi', 'card', 'netbanking', 'wallet', 'emi', 'paylater'];
  const label = known.includes(normalized) ? normalized.toUpperCase() : '';
  return label ? `Razorpay / ${label}` : 'Razorpay';
}

async function sendBookingConfirmation(payload) {
  const orderId = payload.orderId;
  const paymentId = payload.paymentId;

  const order = await razorpayApiGet(`/orders/${orderId}`);
  const payment = await razorpayApiGet(`/payments/${paymentId}`);

  const notes = order.notes || {};
  const guestEmail = String(notes.guestEmail || '').trim();
  if (!guestEmail) {
    throw new Error('Guest email missing on the payment order; cannot send confirmation.');
  }
  if (payment.status && payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new Error(`Payment status is '${payment.status}'; not sending confirmation.`);
  }

  const property = propertiesModel.findById(notes.propertyId || '');
  const data = {
    guestName: String(notes.guestName || 'Guest').trim(),
    hotelName: property ? property.title : 'Your stay',
    checkIn: String(notes.checkIn || '—'),
    checkOut: String(notes.checkOut || '—'),
    bookingId: String(order.receipt || orderId),
    amountPaid: formatAmount(payment.amount || order.amount),
    paymentMethod: formatPaymentMethod(payment.method, payload.paymentMethod),
  };

  if (!isResendConfigured()) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM in backend/.env.');
  }

  const html = renderTemplate(loadTemplate('booking-confirmation.html'), data);
  const subject = renderTemplate(loadTemplate('booking-confirmation.subject.txt'), data).trim();

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${(process.env.RESEND_API_KEY || '').trim()}`,
    },
    body: JSON.stringify({
      from: (process.env.RESEND_FROM || '').trim(),
      to: [guestEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.message || `Resend request failed (${response.status}).`;
    throw new Error(message);
  }

  return { sent: true, to: guestEmail, bookingId: data.bookingId };
}

module.exports = { sendBookingConfirmation, isResendConfigured, renderTemplate, loadTemplate };
