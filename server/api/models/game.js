const mongoose = require('mongoose');
const config = require('../../config.json');

let gameSchema = new mongoose.Schema({
    title: String,
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    players: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    endDate: { type: Date },
    private: Boolean,
    playCode: String,
    historyLog: Array
}, { timestamps: true });

// Virtual for game URL
gameSchema
.virtual('url')
.get(function() {
    return '/game/' + this._id;
});

mongoose.model('Game', gameSchema);
