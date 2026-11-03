'use strict';

const { loadConfig } = require('./src/config');
const { createApp } = require('./src/app');

const config = loadConfig();
const { app, abortAll } = createApp(config);

for (const w of config.warnings) console.warn(`[config] ${w}`);

const server = app.listen(config.port, () => {
  console.log(`${config.siteName} running on port ${config.port} (${config.env})`);
  console.log(`Site URL: ${config.siteUrl} | AdSense: ${config.adsenseClient ? 'on' : 'off'} | Analytics: ${config.gaId ? 'on' : 'off'}`);
});

// Longer than typical load-balancer idle timeouts, so connections are not cut mid-stream.
server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  abortAll();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (e) => console.error('unhandledRejection', e && e.message));
