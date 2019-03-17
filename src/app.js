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

app.initialize = async function initialize(){
  try {
    app.config.VERSION = fs.readFileSync('./VERSION').toString().trim();
  } catch (e) {
    console.error('Unable to read the VERSION file.');
    console.error(util.inspect(e, { color: true }));
  }

  require('./redisCache').createClient(app);
  require('./emails/mailer').createClient(app);
  await require('./db').createClient(app);
}

// app.use(express.static('build'));
// Configure app to user bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/ping', (req, res) => {
  return res.send('pong');
})

app.get('/_status', async (req, res, next) => {
  let result = Object.assign({}, app.status);
  result.config = Object.assign({}, app.config);

  result.health = {
    cache: app.cache.status,
    db: app.db.readyState,
  };

  return res.json(result);
})

// Register our routes in app
app.use('/', routes);

module.exports = app;
