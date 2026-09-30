const jwt = require('jsonwebtoken');
const config = require('../config');

const revokedTokens = new Set();

function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function revoke(token) {
  revokedTokens.add(token);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Authentication required. Provide a valid Bearer token.' });
  }

  const token = header.slice(7);
  if (revokedTokens.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked. Please sign in again.' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = Number(payload.sub);
    req.token = token;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { requireAuth, signToken, revoke };