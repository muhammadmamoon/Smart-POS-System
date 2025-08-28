const express = require('express');
const router = express.Router();
const  loginUser  = require('../controller/logincontroler');
const  registerUser  = require('../controller/registercontroller');
const  updatePassword  = require('../controller/updatePassword');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/updatepassword', updatePassword);

module.exports = router;
