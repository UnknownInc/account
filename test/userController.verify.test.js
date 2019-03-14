import chai from 'chai';
const expect = chai.expect;

import app from '../src/app';

describe("POST /:company/verify", ()=>{
  before(async ()=>{
    try {
      await app.db.models.Token.create({email:'rravuri@gmail.com', token:'1234-56-7890-123456'})
    } catch (err) {
      console.error(err);
    }
  })
  after(async ()=>{
    await app.db.models.Token.deleteOne({email:'rravuri@gmail.com', token:'1234-56-7890-123456'})
  })
  describe("try verifying invalid token",()=>{
    let requester;
    let verifyResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      verifyResult = await requester.post('/example/verify')
        .send({ email: 'test@example.com'});
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 400",()=>{
      expect(verifyResult).to.have.status(400);
    })

    it("should return json", ()=>{
      expect(verifyResult).to.have.header('content-type', /json/);
    })

    it("should return a object with Error field", ()=>{
      expect(verifyResult.body).to.have.property('Error');
    })
  })

  describe("try verifying invalid email",()=>{
    let requester;
    let verifyResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      verifyResult = await requester.post('/example/verify')
        .send({token:'12345'});
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 400",()=>{
      expect(verifyResult).to.have.status(400);
    })

    it("should return json", ()=>{
      expect(verifyResult).to.have.header('content-type', /json/);
    })

    it("should return a object with Error field", ()=>{
      expect(verifyResult.body).to.have.property('Error');
    })
  })

  describe("try verifying valid body but not existant record",()=>{
    let requester;
    let verifyResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      verifyResult = await requester.post('/example/verify')
        .send({token:'12345', email:'test@example.com'});
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 400",()=>{
      expect(verifyResult).to.have.status(400);
    })

    it("should return json", ()=>{
      expect(verifyResult).to.have.header('content-type', /json/);
    })

    it("should return a object with Error field", ()=>{
      expect(verifyResult.body).to.have.property('Error');
    })
  })


  describe("try verifying valid body",()=>{
    let requester;
    let verifyResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      verifyResult = await requester.post('/gmail/verify')
        .send({email:'rravuri@gmail.com', token:'1234-56-7890-123456'});
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 200",()=>{
      expect(verifyResult).to.have.status(200);
    })

    it("should mark the user as verified", async ()=>{
      const user = await app.db.models.User.findOne({email:'rravuri@gmail.com'})
      expect(user.isVerified).is.true;
    })

  })
})
