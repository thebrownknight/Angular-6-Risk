const express = require('express');
const router = express.Router();
const config = require('../../config.json');

var jwt = require('express-jwt');
var auth = jwt({
    secret: config["secretKey"],
    userProperty: 'payload'
});

let userController = require('../controllers/user.controller.js');
let authController = require('../controllers/authentication');

router.get('/user/profile', auth, userController.getProfile);

router.post('/user/register', authController.register);
router.post('/user/login', authController.login);

module.exports = router;
