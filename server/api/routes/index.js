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

router.get('/users/:userid', auth, userController.getUserById);

router.post('/users/register', authController.register);
router.post('/users/login', authController.login);

module.exports = router;