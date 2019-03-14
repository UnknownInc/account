import chai from 'chai';
const expect = chai.expect;

import app from '../src/app';

describe("POST /:company/register", ()=>{
  describe("try registering unknown company",()=>{
    let requester;
    let registerResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      registerResult = await requester.post('/example/register')
        .send({email:'someone@example.com'});//console.log(registerResult.headers);
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 404",()=>{
      expect(registerResult).to.have.status(404);
    })

    it("should return json", ()=>{
      expect(registerResult).to.have.header('content-type', /json/);
    })

    it("should return a object with error field", ()=>{
      expect(registerResult.body).to.have.property('Error');
    })
  })


  describe("try registering invalid email",()=>{
    let requester;
    let registerResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      registerResult = await requester.post('/gmail/register')
        .send({email:'invalidgmail.com'});
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 400",()=>{
      expect(registerResult).to.have.status(400);
    })

    it("should return json", ()=>{
      expect(registerResult).to.have.header('content-type', /json/);
    })
  
    it("should return a object with error field", ()=>{
      expect(registerResult.body).to.have.property('Error');
    }) 
  })

  describe("try registering existing user",()=>{
    let requester;
    let registerResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      registerResult = await requester.post('/gmail/register')
        .send({email:'rravuri@gmail.com'});//console.log(registerResult.body);
    })
    after(()=>{
      requester.close();
    })
    
    it("should return status code 409",()=>{
      expect(registerResult).to.have.status(409);
    })

    it("should return json", ()=>{
      expect(registerResult).to.have.header('content-type', /json/);
    })
  
    it("should return a object with error field", ()=>{
      expect(registerResult.body).to.have.property('Error');
    }) 
  });


  describe("register new user",()=>{
    let requester;
    let registerResult;
    before(async () =>{
      let server = require('../src/server');
      requester = chai.request(server).keepOpen(false);
      registerResult = await requester.post('/gmail/register')
        .send({email:'r.ravuri@gmail.com'});
    })
    after(async ()=>{
      try {
        await app.db.models.Token.deleteOne({email:'r.ravuri@gmail.com'})
      } catch (err) {
        console.error(err);
      }
      requester.close();
    })
    
    it("should return status code 200",()=>{
      expect(registerResult).to.have.status(200);
    })

    it("should have creates a token record in db",async ()=>{
      const token = await app.db.models.Token.findOne({email:'r.ravuri@gmail.com'})
      expect(token).to.have.property('token')
    })
  });
});
