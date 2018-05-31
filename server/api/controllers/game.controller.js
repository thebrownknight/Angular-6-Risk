const mongoose = require('mongoose');
let User = mongoose.model('User');
let Game = mongoose.model('Game');

let userController = require('./user.controller');

module.exports.getPublicGames = function(req, res) {
    Game.
        find({
            private: false
        });
};

module.exports.getGamesByUser = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(404).json({
            "message": "UnauthorizedError: Please login to view your games."
        });
    } else {
        Game.
            find({
                creator: req.payload._id
            })
            .populate('creator')
            .populate('players')
            .exec((err, games) => {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                console.log("Populated Game " + games);
                res.status(200).json(games);
            });
    }
};

module.exports.getGameById = function(req, res) {

};

module.exports.createGame = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(404).json({
            "message": "UnauthorizedError: Please login to view your games."
        });
    } else {
        let game = new Game();

        game.title = req.body.title;
        game.creator = req.payload._id;
        game.gameType = req.body.gameType;

        if (req.body.gameType === 'private') {
            // Add the creator as a player by default
            game.players.push(req.payload._id);
            const playersArray = JSON.parse(req.body.players);

            for(let i = 0; i < playersArray.length; i++) {
                game.players.push(userController.validateUsername(playersArray[i]).user._id);
            }
        } else {
            game.numberOfPlayers = req.body.numPlayers;
        }

        game.generateCode();

        game.save(function(err, game) {
            if (err) {
                res.status(404).json(err);
                return;
            }

            res.status(200).json(game);
        });
    }
};
