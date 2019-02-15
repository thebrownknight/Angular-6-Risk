const mongoose = require('mongoose');
const config = require('../../config.json');
const argv = require('minimist')(process.argv.slice(2));

const dbURI = config["mongodbUri"];
const dbUser = config["mongodbUser"];
const dbPass = config["mongodbPass"];

// OUTDATED - 02/15/2019 - we're just using a config file to grab the credentials
//      We'll need to add support for ENV variables
// Make sure we have the password for MongoDB before we proceed
// if (!argv.mongou || !argv.mongop) {
//     process.exit(0);
// }

let gracefulShutdown;
const options = {
    user: dbUser,
    pass: dbPass
};

mongoose.connect(dbURI, options);
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
require('./game');
require('./game_meta');
