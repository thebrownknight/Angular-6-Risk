const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
// Require Passport
const passport = require('passport');

// Bring in the data model
require('./api/models/db');
// Bring in the Passport config after model is defined
require('./api/config/passport');

// Bring in the routes for the API
const routesApi = require('./api/routes/index');

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Initialize Passport before using the route middleware
app.use(passport.initialize());

// Use the API routes when path starts with /api
app.use('/api', routesApi);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handlers
/////////////////

// Catch Unauthorized Error
app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({
            "message" : err.name + ": " + err.message
        });
    }
});

// Development environment error handler
// Will print stack trace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production environment error handler
// No stack traces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;


