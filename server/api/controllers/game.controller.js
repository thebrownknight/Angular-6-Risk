const mongoose = require('mongoose');
let Game = mongoose.model('Game');

module.exports.getPublicGames = function(req, res) {
    Game.
        find({
            private: false
        });
};

module.exports.getGamesByUser = function(req, res) {

};

module.exports.getGameById = function(req, res) {

};

module.exports.createGame = function(req, res) {

};
