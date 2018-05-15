const mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports.readProfile = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(404).json({
            "message": "UnauthorizedError: Private profile"
        });
    } else {
        User
            .findById(req.payload._id)
            .exec(function(err, user) {
                res.status(200).json(user);
            });
    }
};

module.exports.getUserById = function(req, res) {

};