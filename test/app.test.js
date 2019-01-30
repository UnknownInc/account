const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose =require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').default;
const MockRedis = require('ioredis-mock');
const app = require('../app');

// Configure chai
chai.use(chaiHttp);
chai.should();

app.cache = new MockRedis();
app.cache.end = function() {};

let server ;

let mongoServer;
const opts = { useNewUrlParser: true };
 
before((done) => {
  mongoServer = new MongoMemoryServer();
  mongoServer.getConnectionString().then((mongoUri) => {
    return mongoose.connect(mongoUri, opts, (err) => {
      if (err) done(err);
    });
  }).then(() => {
    server = require('../server');
    done()
  });
});
 
after(() => {
  mongoose.disconnect();
  mongoServer.stop();
  server.shutdown();
})

describe("GET /_status", ()=>{

  before(async () =>{
    this.requester = chai.request(server).keepOpen(false);
    this.res = await this.requester.get('/_status');
  })

  after(()=>{
    this.requester.close();
  })

  it("should return 200", ()=>{
    expect(this.res).to.have.status(200);
  })

  it("should return json object", ()=>{
    expect(this.res).to.be.json;
  })
})


