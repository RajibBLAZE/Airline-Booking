const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../app'); // your Express app
const adminController = require('../controllers/adminController');

chai.use(chaiHttp);
const { expect } = chai;

describe('Admin Routes', () => {
  describe('POST /api/admin/login', () => {
    it('should login admin with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/admin/login')
        .send({ adminId: process.env.ADMIN_ID, password: process.env.ADMIN_PASS });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });

    it('should fail login with wrong credentials', async () => {
      const res = await chai.request(app)
        .post('/api/admin/login')
        .send({ adminId: 'wrong', password: 'wrong' });

      expect(res).to.have.status(401);
    });
  });
});
