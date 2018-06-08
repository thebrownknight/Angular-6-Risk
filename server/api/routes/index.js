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
router.get('/users/validateusername', userController.validateUsername);
router.get('/users/validateemail', userController.validateEmail);

// router.get('/users/settings', userController.getSettings);

/*** GAME ROUTES ***/
// Get all games created by a specific user
router.get('/games', auth, gameController.getGamesByUser);
// Display list of all public games
router.get('/games/public', gameController.getPublicGames);
// Create a game with a specific user
router.post('/games/create', auth, gameController.createGame);


module.exports = router;
