const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function requireSecret(name) {
  const value = process.env[name];
  if (!value || /^replace-|change-me/.test(value || '')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`${name} is not set. Configure it in backend/.env before running in production.`);
    }
    const generated = crypto.randomBytes(48).toString('hex');
    console.warn(`[config] ${name} is not set. A random development value was generated (tokens invalidate on restart).`);
    return generated;
  }
  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  jwtSecret: requireSecret('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || './data/bh-stays.sqlite'),
  staticDir: path.resolve(__dirname, '..', process.env.STATIC_DIR || '..'),
};

module.exports = config;