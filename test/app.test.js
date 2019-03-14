import chai from 'chai';
import chaiHttp from 'chai-http';
import mongoose from 'mongoose';
import MongoMemoryServer from 'mongodb-memory-server';
import MockRedis from 'ioredis-mock';
const nodemailer = require("nodemailer");

import app from '../src/app';

const expect = chai.expect;
// Configure chai
chai.use(chaiHttp);
chai.should();

app.cache = new MockRedis();
app.cache.end = function() {};

let server ;

let mongoServer;
const opts = { useNewUrlParser: true, useCreateIndex: true };

async function createCompanyWithAdmin(email) {
  const getEmailParts=require('../src/util').getEmailParts;
  const s=getEmailParts(email)
  const Company = app.db.models.Company;
  const User = app.db.models.User;
  const testCompany = await Company.create({name:s.companyname, domains:[s.domain]});
  const testUser = await User.create({email:s.address, company: testCompany._id})
  testCompany.admins.push(testUser._id)
  await testCompany.save()
  //console.debug(testUser)
  //console.debug(testCompany.toJSON());
  return {
    company: testCompany,
    user: testUser,
  }
}

before(async () => {

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let account = await nodemailer.createTestAccount();
  // console.debug(account);
  const account = { 
    user: 'g3pjzbv3uqumgzlq@ethereal.email',
    pass: 'EJukrtnF25bfJM9CZm',
  }

  /*
  // create reusable transporter object using the default SMTP transport
  app.mailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass // generated ethereal password
    }
  });
  */
 app.mailer = nodemailer.createTransport({
  jsonTransport:true
 })

  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString()
  const dbutil=require('../src/db')
  app.db = await mongoose.connect(mongoUri, dbutil.getDBOptions());
  dbutil.createClient(app)
  
  await createCompanyWithAdmin("rravuri@gmail.com");
  await createCompanyWithAdmin("g3pjzbv3uqumgzlq@ethereal.email");
});
 
after(() => {
  mongoose.disconnect();
  mongoServer.stop();
  if (server) {
    server.shutdown();
  }
})

describe("GET /ping",()=>{
  let requester;
  let pingResult;
  before(async () =>{
    server = require('../src/server');
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
    server = require('../src/server');
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


