const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../../config.json');

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        exp: parseInt(expiryDate.getTime() / 1000),
    }, config['secretKey']);
};

mongoose.model('User', userSchema);
