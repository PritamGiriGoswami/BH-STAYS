const express = require('express');
const bookmarksModel = require('../models/bookmarks');
const propertiesModel = require('../models/properties');
const { requireAuth } = require('../middleware/auth');
const { notFoundError } = require('../middleware/errors');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res, next) => {
  try {
    const result = bookmarksModel.listBookmarkedProperties(req.userId);
    res.json({ bookmarks: result.bookmarks, bookmarkIds: result.bookmarkIds, count: result.bookmarks.length });
  } catch (err) {
    next(err);
  }
});

function propertyMustExist(req, res, next) {
  try {
    if (!propertiesModel.findById(req.params.propertyId)) {
      throw notFoundError('Property not found.');
    }
    return next();
  } catch (err) {
    next(err);
  }
}

router.put('/:propertyId', propertyMustExist, (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const full = bookmarksModel.isBookmarked(req.userId, propertyId);

    let bookmarked;
    if (full) {
      bookmarksModel.remove(req.userId, propertyId);
      bookmarked = false;
    } else {
      bookmarksModel.add(req.userId, propertyId);
      bookmarked = true;
    }

    const bookmarkIds = bookmarksModel.bookmarkIds(req.userId);
    res.json({ bookmarked, bookmarkIds, count: bookmarkIds.length });
  } catch (err) {
    next(err);
  }
});

router.delete('/:propertyId', propertyMustExist, (req, res, next) => {
  try {
    bookmarksModel.remove(req.userId, req.params.propertyId);
    const bookmarkIds = bookmarksModel.bookmarkIds(req.userId);
    res.json({ bookmarked: false, bookmarkIds, count: bookmarkIds.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;