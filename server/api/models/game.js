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
    players: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    endDate: {
        type: Date,
        default: null
    },
    private: Boolean,
    code: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        default: 'CREATED'
    }
}, { timestamps: true });

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
