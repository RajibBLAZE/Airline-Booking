const express = require("express");
const router = express.Router();

const { getCities, bookFlight, searchFlights } = require('../controllers/flightController');
router.get('/cities', getCities);
router.post('/search', searchFlights);
router.post('/book', bookFlight);

module.exports = router;
