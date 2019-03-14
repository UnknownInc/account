const fs = require('fs');
const Redis = require('ioredis');
const util = require('util');

const getPassword = function _getPassword(filename) {
  let REDIS_PASSWORD = process.env.REDIS_PASSWORD
  if (fs.existsSync(filename)) {
    REDIS_PASSWORD = fs.readFileSync(filename).toString();
  }
  return REDIS_PASSWORD;
}

const getRedisOpts = function _getRedisOpts(){
  let REDIS_PASSWORD = getPassword('/etc/redis/redis-password');

  const namespace = process.env.NAMESPACE ? process.env.NAMESPACE.replace('-', '_').toUpperCase() : '';
  const cacheName = `${namespace}_${process.env.ACCTCACHE}`; 
  return { 
    host: process.env[`${cacheName}_MASTER_SERVICE_HOST`], 
    port: Number.parseInt(process.env[`${cacheName}_MASTER_SERVICE_PORT`]),
    password: REDIS_PASSWORD
  }
}

const setConnectEvents = function _setConnectionEvents(app) {
  app.cache.on('connect', function (err) {
    app.status.redis.connectionStatus = 'connected';
    app.status.redis.serverInfo = Object.assign({}, app.cache.server_info);
  });

  app.cache.on('error', function (err) {
    app.status.redis.lastError = err;
    console.error('REDIS ERROR: ', err);
  });

  app.cache.on('ready', function (err) {
    app.status.redis.connectionStatus = 'ready';
  });

  app.cache.on('end', function (err) {
    app.status.redis.connectionStatus = 'disconnected';
  });
  app.cache.on('reconnecting', function (err) {
    app.status.redis.connectionStatus = 'reconnecting';
  });
}

module.exports = {
  getPassword: getPassword,

  getRedisOpts: getRedisOpts,

  setConnectEvents: setConnectEvents,

  createClient: function (app) {
    try {
      app.status = app.status || {};
      app.status.redis = app.status.redis || {};

      if (app.cache) return;

      const options = getRedisOpts();

      app.cache = new Redis(options);

      setConnectEvents(app);

      return app.cache;

    } catch (e) {
      console.error('Unable to read the REDIS credentials file.');
      console.error(util.inspect(e, { color: true }));
    }
  }
}
