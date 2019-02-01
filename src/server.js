
import app from './app';

app.initialize();

let server = app.listen(app.config.port, () => {
  console.log(`Account http server listening on port ${app.config.port}!`)
});

server.shutdown = function closeApplication() {
  console.log('closing http server.');
  server.close(() => {
      console.log('http server closed.');
      server = null;
      try {
          console.log('closing cache connection.')
          app.cache.end(true);
      } catch (cerr) {
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
