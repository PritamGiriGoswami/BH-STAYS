const express = require('express');
const propertiesModel = require('../models/properties');
const { validatePositiveInt } = require('../middleware/validate');
const { notFoundError } = require('../middleware/errors');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const guests = validatePositiveInt(req.query.guests || '0');
    if (!guests.ok) {
      return res.status(400).json({ error: 'Query parameter "guests" must be a positive integer.' });
    }

    const properties = propertiesModel.list({
      category: req.query.category || 'all',
      query: req.query.query || '',
      guests: guests.value,
      sort: req.query.sort || 'recommended',
    });

    res.json({ properties, count: properties.length });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const property = propertiesModel.findById(req.params.id);
    if (!property) {
      throw notFoundError('Property not found.');
    }
    res.json({ property });
  } catch (err) {
    next(err);
  }
});

module.exports = router;