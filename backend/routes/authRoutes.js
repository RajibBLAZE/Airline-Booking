const express = require("express");
const router = express.Router();
const { handleUserRegistration,handleLoginUser,handleVerifyEmail} = require('../controllers/authController');


router.post('/register', handleUserRegistration);
router.post('/verify', handleVerifyEmail);
router.post('/login', handleLoginUser);

module.exports = router;