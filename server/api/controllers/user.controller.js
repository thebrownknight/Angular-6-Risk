const mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports.getProfile = function(req, res) {
    // The payload will contain the user's ID
    if (!req.payload._id) {
        res.status(404).json({
            "message": "UnauthorizedError: Private profile"
        });
    } else {
        User
            .findById(req.payload._id)
            .exec(function(err, user) {
                if (err) {
                    res.status(404).json(err);
                    return;
                }
                res.status(200).json(user);
            });
    }
};
