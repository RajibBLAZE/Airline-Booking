const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js');
const sinon = require('sinon');
const client = require('../utils/client.js');
const db = require('../db.js');
const User = require('../models/userModel.js');


chai.use(chaiHttp);
const { expect } = chai;

describe('Flight Routes and Controller', () => {
  afterEach(() => sinon.restore());

  // GET /cities
  it('should return cached cities if available', async () => {
    sinon.stub(client, 'get').resolves(JSON.stringify([{ id: 1, name: 'Delhi' }]));

    const res = await chai.request(app).get('/api/flight/cities');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  // GET /cities (fallback to DB)
  it('should query DB if cities not in cache', async () => {
    sinon.stub(client, 'get').resolves(null);
    sinon.stub(db, 'query').resolves([[{ id: 2, name: 'Mumbai' }]]);
    sinon.stub(client, 'setex').resolves();

    const res = await chai.request(app).get('/api/flight/cities');
    expect(res).to.have.status(200);
    expect(res.body[0].name).to.equal('Mumbai');
  });

  // POST /search
  it('should search for flights with correct filters', async () => {
    sinon.stub(client, 'get').resolves(null);
    sinon.stub(db, 'query').resolves([[{ id: 1, airline: 'Indigo' }]]);
    sinon.stub(client, 'setex').resolves();

    const res = await chai.request(app).post('/api/flight/search').send({
      from: 1,
      to: 2,
      date: '2025-06-01',
      classType: 'Economy',
      fareType: 'Regular'
    });

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  // POST /book
  it('should book a flight successfully', async () => {
    sinon.stub(db, 'query').resolves();

    const res = await chai.request(app).post('/api/flight/book').send({
      user_id: 1,
      flight_id: 10,
      passengers: 2,
      travel_class: 'Economy',
      round_trip: false,
      return_date: null
    });

    expect(res).to.have.status(201);
  });

  // POST /admin/flights
  it('should add a new flight', async () => {
    sinon.stub(db, 'query').resolves();

    const res = await chai.request(app).post('/api/admin/flights').send({
      airline: 'Air India',
      from_city_id: 1,
      to_city_id: 2,
      date: '2025-06-20',
      departure_time: '08:00:00',
      arrival_time: '10:30:00',
      duration: '2h 30m',
      price: 3000,
      class: 'Economy',
      fare_type: 'Regular'
    });

    expect(res).to.have.status(201);
    expect(res.body.message).to.equal('Flight added');
  });

  // DELETE /admin/flights/:id
  it('should delete a flight', async () => {
    sinon.stub(db, 'query').resolves();

    const res = await chai.request(app).delete('/api/admin/flights/123');
    expect(res).to.have.status(202);
    expect(res.body.message).to.equal('Flight deleted');
  });

  // GET /admin/revenue
  it('should get total revenue', async () => {
    sinon.stub(db, 'query').resolves([[{ total_revenue: 45000 }]]);

    const res = await chai.request(app).get('/api/admin/revenue');
    expect(res).to.have.status(200);
    expect(res.body.total_revenue).to.equal(45000);
  });

  // GET /boarding-pass/:userId
  it('should get a user\'s boarding pass', async () => {
    const userId = 'abc123';
    const mockUser = { _id: userId, username: 'Test User' };
    const mockBookings = [
      {
        id: 101,
        from_city: 'Delhi',
        to_city: 'Mumbai',
        departure_time: '09:00:00',
        arrival_time: '11:00:00',
        duration: '2h',
        date: '2025-06-25',
        travel_class: 'Economy',
        fare_type: 'Regular'
      }
    ];

    sinon.stub(User, 'findById').resolves(mockUser);
    sinon.stub(db, 'query').resolves([mockBookings]);

    const res = await chai.request(app).get(`/api/flight/boarding-pass/${userId}`);
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0].booking.ticketNumber).to.include('TK');
  });

  it('should return 404 if no bookings found for user', async () => {
    sinon.stub(User, 'findById').resolves({ _id: 'abc123', username: 'Test User' });
    sinon.stub(db, 'query').resolves([[]]);

    const res = await chai.request(app).get('/api/flight/boarding-pass/abc123');
    expect(res).to.have.status(404);
    expect(res.body.message).to.include('No booking');
  });

  it('should return 404 if user not found for boarding pass', async () => {
    sinon.stub(User, 'findById').resolves(null);

    const res = await chai.request(app).get('/api/flight/boarding-pass/invalidUser');
    expect(res).to.have.status(404);
    expect(res.body.message).to.include('User not found');
  });
});
