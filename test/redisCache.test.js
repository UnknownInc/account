const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const redisCache = require('../redisCache');

// Configure chai
chai.use(chaiHttp);
chai.should();

const origNamespace = process.env.NAMESPACE;
const origCacheName = process.env.ACCTCACHE;
const origPassword = process.env.REDIS_PASSWORD;

const testPassword='somevalue$#^&%&671258';
const testCacheName='SOMECACHE';
const testHostName='123.0.0.123';
const testPortNumber=4567;

describe('set redis options', ()=>{
  before(()=>{
    process.env.REDIS_PASSWORD = testPassword;
    process.env.NAMESPACE = 'TEST';
    process.env.ACCTCACHE = testCacheName;
    process.env[`TEST_${testCacheName}_MASTER_SERVICE_HOST`]=testHostName;
    process.env[`TEST_${testCacheName}_MASTER_SERVICE_PORT`]=testPortNumber;
  })
  after(()=>{
    process.env.NAMESPACE = origNamespace;
    process.env.REDIS_PASSWORD = origPassword;
  })
  it('read be able to password from env var REDIS_PASSWORD', ()=>{
    const password = redisCache.getPassword();
    password.should.be.equal(testPassword, 'password values dont match');
  })

  it('read the password from file', ()=>{
    const fs=require('fs');
    const tempWrite = require('temp-write');
    const filepath = tempWrite.sync(testPassword);
    const password = redisCache.getPassword(filepath);
    password.should.be.equal(testPassword, 'password values dont match');
    fs.unlinkSync(filepath);
  })

  it('should read host & port from environment', ()=>{

    const opts=redisCache.getRedisOpts();

    opts.host.should.be.equal(testHostName,"host is not correctly read from env");
    opts.port.should.be.equal(testPortNumber,"port is not correctly read from env");
    opts.password.should.equal(testPassword, 'password not matching in options');
  })
})
