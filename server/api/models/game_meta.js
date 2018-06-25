const mongoose = require('mongoose');

/**
 * Sample object in database
 * 
 * state: [
 *  {
 *      player: ObjectId("5b117a758f0c6a2eccb278b5"),
 *      territoryMeta: [{
 *          name: 'tunisia',
 *          troops: 4
 *      }]
 *  }
 * ],
 * log: [
 *  {
 *      player: ObjectId("5b117a758f0c6a2eccb278b5"),
 *      turnType: 'get_troops',
 *      data: {
 *          country: 'egypt',
 *          troops: 3
 *      }
 *  }
 * ]
 */

let gameMetaSchema = new mongoose.Schema({
    state: [{
        player: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        territoryMeta: [{
            name: String,
            troops: Number
        }]
    }],
    log: [{
        player: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        turnType: String,
        data: {
            country: String
        }
    }]
});

mongoose.model('GameMeta', gameMetaSchema);