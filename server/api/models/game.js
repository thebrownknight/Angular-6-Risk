const mongoose = require('mongoose');
const config = require('../../config.json');

let gameSchema = new mongoose.Schema({
    title: String,
    numberOfPlayers: Number,
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    players: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    endDate: { type: Date },
    private: Boolean,
    code: String
}, { timestamps: true });

// Virtual for game URL
gameSchema
.virtual('url')
.get(function() {
    return '/game/' + this._id;
});

mongoose.model('Game', gameSchema);
