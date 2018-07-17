const mongoose = require('mongoose');
let User = mongoose.model('User');
let Game = mongoose.model('Game');
let GameMeta = mongoose.model('GameMeta');

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
    let gameId = req.params.gId;

    if (!req.payload._id) {
        res.status(403).json({
            "message": "UnauthorizedError: Please login to view the game."
        });
    } else {
        Game
            .findOne({
                '_id': gameId
            })
            .populate('creator')
            .populate('players.player')
            .exec((err, game) => {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                res.status(200).json(game);
            });
    }
};

module.exports.getGameByCode = function(req, res) {
    let gameCode = req.params.gameCode;

    if (!req.payload._id) {
        res.status(403).json({
            "message": "UnauthorizedError: Please login to view your games."
        });
    } else {
        Game
            .findOne({
                'code': gameCode
            })
            .populate('creator')
            .populate('players.player')
            .populate({
                path: 'gameMeta',
                populate: {
                    path: 'state.player'
                }
            })
            .exec((err, game) => {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                res.status(200).json(game);
            });
    }
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
        game.map = req.body.map ? req.body.map : 'standard';
        game.generateCode();

        // Conditional fields for public and private games
        if (req.body.gameType === 'private') {
            // Add the creator as a player by default
            game.players.push({
                status: 'JOINED',
                color: req.body.creatorColor,
                icon: req.body.creatorIcon,
                turnOrder: -1,
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

module.exports.joinGame = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(404).json({
            "message": "UnauthorizedError: You're not allowed to join this game."
        });
    } else {
        Game
            .findOneAndUpdate(
                {
                    '_id': req.params.gId,
                    'players.player': req.payload._id
                },
                {
                    $set: {
                        'players.$.status': 'JOINED',
                        'players.$.color': req.body.playerColor,
                        'players.$.icon': req.body.playerIcon
                    }
                },
                { new: true },
                function(err, raw) {
                    if (err) {
                        res.status(404).json(err);
                        return;
                    }

                    res.status(200).json(raw);
                }
            ).populate('players.player');
    }
}

module.exports.deleteGame = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(403).json({
            "message": "UnauthorizedError: Please login to view your games."
        });
    } else {
        Game
            .findByIdAndRemove(req.params.gId, function(err, ret) {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                res.status(200).json(ret);
            });
    }
}

module.exports.startGame = function(req, res) {
    if (!req.payload._id) {
        res.status(403).json({
            "message": "UnauthorizedError: Please login to complete this action."
        });
    } else {
        // We just need to change the status of the game to 'IN PROGRESS'
        Game
            .findOneAndUpdate({ '_id': req.params.gId },
                {
                    $set: {
                        'status': 'IN PROGRESS'
                    }
                },
                { new: true },
                function(err, doc) {
                    if (err) {
                        res.status(404).json(err);
                        return;
                    }

                    res.status(200).json(doc);
                }
            );
    }
}

module.exports.setTurnOrder = function(req, res) {
    if (!req.payload._id) {
        res.status(403).json({
            "message": "UnauthorizedError: Please login to complete this action."
        });
    } else {
        const playerIdsArr = Object.keys(req.body.players);

        // As a workaround to the issue where the positional operator won't work
        // for multiple elements in an array, we have to loop over the player IDs
        // and update each one -_-
        playerIdsArr.forEach(id => {
            // Update the turnOrder property of the players
            Game
                .update(
                    {
                        '_id': req.params.gId,
                        'players.player': id
                    },
                    {
                        $set: {
                            'players.$.turnOrder': req.body.players[id]
                        }
                    }, {
                        multi: true
                    }).exec();
        });

        res.status(200).json({ success: true });
    }
}

/**
 * Add game meta information to the database.
 */
module.exports.setGameMeta = function(req, res) {
    const gameId = req.params.gId;
    const gameState = req.body.gameState;
    const gameLogRecords = req.body.gameLogRecords;

    if (!req.payload._id) {
        res.status(403).json({
            'message': 'UnauthorizedError: Please login to set the game meta information.'
        });
    } else {
        // First we get the game we're modifying the game meta for
        Game
            .findById(gameId, (err, game) => {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                // No errors, proceed onwards
                if (game) {
                    // Now check to see if the gameMeta is null or not
                    if (game.gameMeta) {
                        // Get the gameMeta object from the table so we can update it
                        GameMeta.findByIdAndUpdate(game.gameMeta, {

                        }, (gmerr, gamemeta) => {

                        });
                    } else {
                        // The gameMeta record in the gamemeta table doesn't exist, we have to create a new one and save it
                        let gameMetaObj = new GameMeta();

                        gameMetaObj.state = gameState;
                        gameMetaObj.log = gameLogRecords;

                        gameMetaObj.save((gmobjerr, gmobj) => {
                            if (gmobjerr) {
                                res.status(404).json(gmobjerr);
                                return;
                            }

                            if (gmobj && gmobj._id) {
                                // Now save the game itself with ID that we get back from the gamemeta object
                                game.gameMeta = gmobj._id;
                                game.save((gsaveerr, retgame) => {
                                    if (gsaveerr) {
                                        res.status(404).json(gsaveerr);
                                        return;
                                    }

                                    res.status(200).json(retgame);
                                });
                            }
                        });
                    }
                } else {
                    res.status(404).json({
                        'message': 'Game Not Found: The game you are trying to access could not be retrieved.'
                    });
                    return;
                }
            });
    }
}

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
                        'color': '',
                        'icon': '',
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
