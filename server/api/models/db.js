const mongoose = require('mongoose');
const config = require('../../config.json');

var gracefulShutdown;
let dbURI = config["mongodbLocal"];
if (process.env.NODE_ENV === 'production') {
    dbURI = config["mongodbProd"];
}

mongoose.connect(dbURI);
const db = mongoose.connection;

// Connection Events
db.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});

db.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

// Capture app termination/restart events
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

// Bring in your schemas and models
require('./user');