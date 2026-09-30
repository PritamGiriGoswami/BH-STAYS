const express = require('express');
const bookingsModel = require('../models/bookings');
const propertiesModel = require('../models/properties');
const { requireAuth } = require('../middleware/auth');
const { isDateString, isEmail } = require('../middleware/validate');
const { badRequest, notFoundError } = require('../middleware/errors');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res, next) => {
  try {
    const bookings = bookingsModel.listByUser(req.userId);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const propertyId = typeof req.body.propertyId === 'string' ? req.body.propertyId : '';
    const checkIn = typeof req.body.checkIn === 'string' ? req.body.checkIn : '';
    const checkOut = typeof req.body.checkOut === 'string' ? req.body.checkOut : '';
    const guestName = typeof req.body.guestName === 'string' ? req.body.guestName.trim() : '';
    const guestEmail =
      typeof req.body.guestEmail === 'string' ? req.body.guestEmail.trim().toLowerCase() : '';

    if (!propertyId) {
      throw badRequest('propertyId is required.');
    }
    if (!isDateString(checkIn)) {
      throw badRequest('checkIn must be a valid date in YYYY-MM-DD format.');
    }
    if (!isDateString(checkOut)) {
      throw badRequest('checkOut must be a valid date in YYYY-MM-DD format.');
    }
    if (checkOut <= checkIn) {
      throw badRequest('checkOut must be after checkIn.');
    }
    if (guestName && guestName.length < 2) {
      throw badRequest('guestName must be at least 2 characters long.');
    }
    if (guestEmail && !isEmail(guestEmail)) {
      throw badRequest('guestEmail must be a valid email address.');
    }

    const property = propertiesModel.findById(propertyId);
    if (!property) {
      throw notFoundError('Property not found.');
    }

    const pricing = bookingsModel.computePricing(property, checkIn, checkOut);
    if (!pricing) {
      throw badRequest('Could not compute pricing for the given dates.');
    }

    const booking = bookingsModel.create({
      userId: req.userId,
      property,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      pricing,
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest('Booking id must be a positive integer.');
    }
    const booking = bookingsModel.findById(id, req.userId);
    if (!booking) {
      throw notFoundError('Booking not found.');
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;