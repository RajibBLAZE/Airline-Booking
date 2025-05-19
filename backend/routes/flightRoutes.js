const express = require("express");
const router = express.Router();

const { getCities, bookFlight, searchFlights,getBoardingPass } = require('../controllers/flightController');
router.get('/cities', getCities);
router.post('/search', searchFlights);
router.post('/book', bookFlight);
router.get('/boarding-pass/:userId',getBoardingPass);
module.exports = router;
