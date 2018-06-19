const mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({

}, { timestamps: true });

mongoose.model('Message', messageSchema);