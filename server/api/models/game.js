const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../../config.json');

let gameSchema = new mongoose.Schema({
    title: String,
    numberOfPlayers: Number,
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    players: [{
        status: String,
        player: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    gameType: String,
    code: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        default: 'CREATED'
    },
    endDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Before we save, make sure we convert the player usernames to IDs
gameSchema.pre('save', function(next) {
    
});

// Method to generate a code for the game
gameSchema.methods.generateCode = function() {
    this.code = crypto.randomBytes(16).toString('hex').slice(0, 6).toUpperCase();
};

// Virtual for game URL with code (used to send to other players)
gameSchema
.virtual('gameCodeUrl')
.get(function() {
    return '/game/' + this.code;
});

mongoose.model('Game', gameSchema);
