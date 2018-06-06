const mongoose = require('mongoose');
let User = mongoose.model('User');
let Game = mongoose.model('Game');

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
                'players.player': req.payload._id
            })
            .populate('creator')
            .populate('players.player')
            .exec((err, games) => {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                // console.log("Populated Game:\n " + games);
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

        // Common fields between public and private games
        // 1. Title
        // 2. Creator
        // 3. Game Type
        // 4. Code
        game.title = req.body.title;
        game.creator = req.payload._id;
        game.gameType = req.body.gameType;
        game.generateCode();

        // Conditional fields for public and private games
        if (req.body.gameType === 'private') {
            // Add the creator as a player by default
            game.players.push({
                status: 'JOINED',
                player: req.payload._id
            });
            var playersArray = req.body.players;

            getUserIds(playersArray, function(nPlayersArr) {
                game.players = game.players.concat(nPlayersArr);
                game.numberOfPlayers = game.players.length;

                console.log(game);

                game.save(function(err, game) {
                    if (err) {
                        res.status(404).json(err);
                        return;
                    }

                    res.status(200).json(game);
                });
            });
        } else {
            // It's a public game, we don't have specific players yet
            game.numberOfPlayers = req.body.numPlayers;

            game.save(function(err, game) {
                if (err) {
                    res.status(404).json(err);
                    return;
                }

                res.status(200).json(game);
            });
        }
    }
};

////////////////////////////////////////////
// Private method to get user ID by username
////////////////////////////////////////////
getUserIds = function(usernames, callback) {
    User
        .find({
            'username': {
                $in: usernames
            }
        }, '_id', function(err, userIds) {
            if (err) {
                console.log(err);
                return;
            }

            if (userIds) {
                var nUserIds = userIds.map(function(curValue, index) {
                    var rObj = {
                        'status': 'PENDING',
                        'player': curValue._id
                    };
                    return rObj;
                });

                callback(nUserIds);
            } else {
                return;
            }
        });
}
