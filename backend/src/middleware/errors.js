function apiNotFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    console.error('[server] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
  res.status(status).json({ error: err.message || 'Request failed.' });
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFoundError(message) {
  const err = new Error(message || 'Resource not found.');
  err.statusCode = 404;
  return err;
}

function conflict(message) {
  const err = new Error(message);
  err.statusCode = 409;
  return err;
}

module.exports = { apiNotFound, errorHandler, badRequest, notFoundError, conflict };