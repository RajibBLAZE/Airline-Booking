const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js');
const sinon = require('sinon');
const User = require('../models/userModel.js');
const client = require('../utils/client.js');
const mailer = require('../utils/mailer');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth Routes', () => {
    const email = 'saivignesh@blazeautomation.com';

    afterEach(() => {
        sinon.restore();
    });

    it('should register a new user', async () => {
        sinon.stub(User, 'findOne').resolves(null); // check in the DB for the user
        sinon.stub(User, 'create').resolves({ email, username: 'testuser' });  // create a user
        sinon.stub(client, 'setex').resolves(); // set the client
        sinon.stub(mailer, 'sendMail').resolves();// send mailer

        const res = await chai.request(app).post('/api/auth/register').send({
            username: 'testuser',
            email,
            password: 'testpass',
            phone: '1234567890',
            isStudent: true
        });

        expect(res).to.have.status(201);
        expect(res.body.message).to.include('Check email');
    });

    it('should verify email with correct code', async () => {
        sinon.stub(client, 'get').resolves('123456'); // get the code from client
        sinon.stub(User, 'updateOne').resolves({ acknowledged: true }); // update the DB 
        sinon.stub(client, 'del').resolves(); // del the code from redis

        const res = await chai.request(app).post('/api/auth/verify').send({
            email,
            code: '123456'
        });

        expect(res).to.have.status(200);
        expect(res.body.message).to.include('Email verified');
    });

    it('should not verify with wrong code', async () => {
        sinon.stub(client, 'get').resolves('999999');

        const res = await chai.request(app).post('/api/auth/verify').send({
            email,
            code: '123456'
        });

        expect(res).to.have.status(400);
    });
});
