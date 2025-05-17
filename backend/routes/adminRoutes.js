const express = require("express");
const router = express.Router();
const {loginAdmin} = require('../controllers/adminController');
const { addFlight, deleteFlight, getRevenue} = require('../controllers/flightController');

router.post('/login', loginAdmin);
router.post('/flights', addFlight);
router.delete('/flights/:id', deleteFlight);
router.get('/revenue', getRevenue);

module.exports = router;