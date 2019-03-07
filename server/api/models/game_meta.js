const mongoose = require('mongoose');

/**
 * Sample object in database
 * 
 * state: [
 *  {
 *      player: ObjectId("5b117a758f0c6a2eccb278b5"),
 *      status: WAITING | CURRENTTURN | KNOCKEDOUT,
 *      territoryMeta: [
 *          {
 *              id: 'tunisia',
 *              troops: 4
 *          },
 *          {
 *              id: 'ontario',
 *              troops: 3
 *          }
 *      ],
 *      cards: [
 *          {
 *              type: ''
 *          }
 *      ]
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
        _id: false,
        player: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        status: String,
        territoryMeta: [{
            _id: false,
            id: String,
            troops: Number
        }],
        cards: [{
            type: String
        }]
    }],
    log: [{
        _id: false,
        player: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        turnType: String,
        data: Object
    }]
});

mongoose.model('GameMeta', gameMetaSchema);