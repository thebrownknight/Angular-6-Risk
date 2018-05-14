const config = require('config.json');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Q = require('q');
const mongoose = require('mongoose');

mongoose.connect(config.mongodb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

});

let service = {};

service['authenticate'] = authenticate;

module.exports = service;

function authenticate(username, password) {
    const deferred = Q.defer();
}
