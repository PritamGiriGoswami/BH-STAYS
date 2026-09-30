const express = require('express');
const newsletterModel = require('../models/newsletter');
const { isEmail } = require('../middleware/validate');
const { badRequest } = require('../middleware/errors');

const router = express.Router();

router.post('/', (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!isEmail(email)) {
      throw badRequest('A valid email address is required.');
    }

    const existing = newsletterModel.findByEmail(email);
    if (existing) {
      return res.json({ subscribed: true, message: 'This email is already subscribed.' });
    }

    newsletterModel.create(email);
    res.status(201).json({ subscribed: true, message: 'Subscribed to the BH Stays VIP list.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;