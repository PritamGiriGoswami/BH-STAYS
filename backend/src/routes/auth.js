const express = require('express');
const bcrypt = require('bcryptjs');
const usersModel = require('../models/users');
const { requireAuth, signToken, revoke } = require('../middleware/auth');
const { isEmail } = require('../middleware/validate');
const { badRequest, conflict } = require('../middleware/errors');
const config = require('../config');

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
}

router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2) {
      throw badRequest('Name must be at least 2 characters long.');
    }
    if (!isEmail(email)) {
      throw badRequest('A valid email address is required.');
    }
    if (password.length < 8) {
      throw badRequest('Password must be at least 8 characters long.');
    }

    if (usersModel.findByEmail(email)) {
      throw conflict('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = usersModel.create({ name, email, passwordHash });
    const token = signToken(user.id);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      throw badRequest('Email and password are required.');
    }

    const user = usersModel.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, (req, res) => {
  revoke(req.token);
  res.json({ message: 'Signed out successfully.' });
});

router.get('/me', requireAuth, (req, res) => {
  const user = usersModel.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: publicUser(user) });
});

module.exports = router;