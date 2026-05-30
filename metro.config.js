// Loads Expo's Metro defaults so the app keeps the SDK 56 bundler behavior.
const { getDefaultConfig } = require('expo/metro-config');

// Provides a tiny Connect app so serve-sim can be mounted before Metro's own middleware.
const connect = require('connect');

// Exposes the simulator preview UI and control API from the existing Metro server.
const { simMiddleware } = require('serve-sim/middleware');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Preserve any middleware Expo or future tooling adds, then prepend serve-sim at /.sim.
config.server = config.server || {};
const originalEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, server) => {
  const middleware = originalEnhanceMiddleware
    ? originalEnhanceMiddleware(metroMiddleware, server)
    : metroMiddleware;

  const app = connect();
  app.use(simMiddleware({ basePath: '/.sim' }));
  app.use(middleware);

  return app;
};

module.exports = config;
