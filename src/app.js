const fs = require('fs');
const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();

app.status = {};

app.config = {};
app.config.port = process.env.PORT || 8080;
app.config.env = process.env;

app.initialize = function initialize(){
  try {
    app.config.VERSION = fs.readFileSync('./VERSION').toString();
  } catch (e) {
    console.error('Unable to read the VERSION file.');
    console.error(util.inspect(e, { color: true }));
  }

  require('./redisCache').createClient(app);
}

// app.use(express.static('build'));
// Configure app to user bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  return res.send('pong');
})

app.get('/_status', async (req, res, next) => {
  let result = Object.assign({}, app.status);
  result.config = Object.assign({}, app.config);

  result.health = {
    cache: app.cache.status
  };

  return res.json(result);
})

// Register our routes in app
app.use('/', routes);

module.exports = app;
