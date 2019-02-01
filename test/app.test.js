const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose =require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').default;
const MockRedis = require('ioredis-mock');
import app from '../src/app';

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
    server = require('../src/server');
    done()
  });
});
 
after(() => {
  mongoose.disconnect();
  mongoServer.stop();
  server.shutdown();
})

describe("GET /ping",()=>{
  let requester;
  let pingResult;
  before(async () =>{
    requester = chai.request(server).keepOpen(false);
    pingResult = await requester.get('/ping');
  })
  after(()=>{
    requester.close();
  })
  
  it("should return status code 200",()=>{
    expect(pingResult).to.have.status(200);
  })
  it("should return text", ()=>{
    expect(pingResult).to.have.header('content-type', /^text/);
  })
  it("shoud return pong", ()=>{
    expect(pingResult.text).to.be.equal('pong','ping output not pong');
  })
})

describe("GET /_status", ()=>{
  let requester;
  let res;
  before(async () =>{
    requester = chai.request(server).keepOpen(false);
    res = await requester.get('/_status');
  })

  after(()=>{
    requester.close();
  })

  it("should return 200", ()=>{
    expect(res).to.have.status(200);
  })

  it("should return json object", ()=>{
    expect(res).to.be.json;
  })
})


