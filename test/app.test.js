const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);
chai.should();

const app = require('../server');

after(()=>{
  app.shutdown();
})

describe("GET /_status", ()=>{

  before(async () =>{
    this.requester = chai.request(app).keepOpen(false);
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


