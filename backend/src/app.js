const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');
const { apiNotFound, errorHandler } = require('./middleware/errors');

function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(express.static(config.staticDir));

  app.use('/api', apiRoutes);
  app.use('/api', apiNotFound);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;