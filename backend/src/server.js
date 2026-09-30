const createApp = require('./app');
const config = require('./config');
const db = require('./db');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`BH Stays backend running at http://localhost:${config.port}`);
  console.log(`  - API:     /api`);
  console.log(`  - Health:  /api/health`);
  console.log(`  - Static:  ${config.staticDir}`);
});

function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(() => {
    try {
      db.close();
    } catch (_err) {
      /* already closed */
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));