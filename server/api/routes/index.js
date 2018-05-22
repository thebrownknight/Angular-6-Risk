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

let authController = require('../controllers/authentication');
let userController = require('../controllers/user.controller.js');
let gameController = require('../controllers/game.controller.js');

/*** USER ROUTES ***/
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);

/*** GAME ROUTES ***/
// Display list of all public games
router.get('/games', gameController.getPublicGames);
// Get all games created by a specific user
router.get('/games/:userId', gameController.getGamesByUser);
// Create a game with a specific user
router.post('/games/:userId/create', gameController.createGame);


module.exports = router;
