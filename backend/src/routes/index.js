const express = require('express');
const authRoutes = require('./auth');
const propertiesRoutes = require('./properties');
const bookingsRoutes = require('./bookings');
const bookmarksRoutes = require('./bookmarks');
const newsletterRoutes = require('./newsletter');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bh-stays-backend', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/properties', propertiesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/bookmarks', bookmarksRoutes);
router.use('/newsletter', newsletterRoutes);

module.exports = router;