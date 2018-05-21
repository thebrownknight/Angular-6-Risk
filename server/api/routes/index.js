const express = require('express');
const router = express.Router();
const config = require('../../config.json');

/*****************************
 * User variables and routes
 ****************************/
var jwt = require('express-jwt');
var auth = jwt({
    secret: config["secretKey"],
    userProperty: 'payload'
});

let userController = require('../controllers/user.controller.js');
let authController = require('../controllers/authentication');
let gameController = require('../controllers/game.controller.js');

/*** USER ROUTES ***/
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);

/*** GAME ROUTES ***/
router.post('/game/create', auth, gameController.createGame);

// router.get('/games/all', gameController.getAllGames);

// router.post('/game/create', gameController.createGame);

module.exports = router;
