const fs = require('fs');
const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();

app.status = {};

app.config = {};
app.config.port = process.env.PORT || 8080;
app.config.env=process.env;

function initialize(){
  try {
    app.config.VERSION = fs.readFileSync('./VERSION').toString();
  } catch (e) {
    console.error('Unable to read the VERSION file.');
    console.error( util.inspect(e, {color:true}));
  }

  require('./redisCache').createClient(app);
}

initialize();

//app.use(express.static('build'));
// Configure app to user bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.send('account');
})
app.get('/_status',async (req, res, next)=>{
    let result = Object.assign({}, app.status);
    result.config = Object.assign({},app.config);

    result.health = {
      cache: app.cache.status
    };

    res.json(result);
    return;
})

// Register our routes in app
app.use('/', routes);

let server = app.listen(app.config.port, () => {
    console.log(`Account http server listening on port ${app.config.port}!`)
});

server.shutdown = function closeApplication(){
    if (server===null) return; 
    console.log('closing http server.');
    server.close(() => {
        console.log('http server closed.');
        server=null;
        try {
          console.log('closing cache connection.')
          app.cache.end(true);
        } catch(cerr) {
          console.error('ERROR: unable to end cache connection.', cerr);
        }

        process.exit(0);
        /*
        // boolean means [force], see in mongoose doc
        mongoose.connection.close(false, () => {
            console.log('MongoDb connection closed.');
            process.exit(0);
        });
        */
    });
}

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    server.shutdown();
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    server.shutdown();
});

module.exports = server;