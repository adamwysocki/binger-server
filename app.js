/*jslint node: true */
"use strict";

// *****************************************************************************
// BINGER APP - The Better Internet Pinger
// Author: Adam Wysocki
// Date: 3/12/15
//

//******************************************************************************
// LOAD REQUIRED PACKAGES
//
var express           = require('express'),
    mongoose          = require('mongoose'),
    bodyParser        = require("body-parser"),
    cookieParser      = require('cookie-parser'),
    User              = require('./models/user'),
    Token             = require('./models/token'),
    users             = require('./routes/users'),
    groups            = require('./routes/groups'),
    tokens            = require('./routes/tokens'),
    session           = require('express-session'),
    bingers           = require('./routes/bingers'),
    notifications     = require('./modules/notifications'),
    port              = process.env.PORT || 9090;

//******************************************************************************
// CREATE THE APPLICATION
//
var app               = express(),
    http              = require('http').Server(app),
    env               = process.env.NODE_ENV || 'development',
    io                = require('socket.io')(http);

//******************************************************************************
// CONNECT TO MONGODB on MONGOLAB and EXPORT mongoose
//
mongoose.connect('mongodb://admin:xxxx@xxxxxxx.mongolab.com:33469/binger');
exports.mongoose = mongoose;

//******************************************************************************
// SETUP THE BODY PARSER
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//******************************************************************************
// SETUP MIDDLEWARE FOR SESSION MANAGEMENT
//
app.use(cookieParser());
app.use(session({
  secret: '1234567890qwerty',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 36000000,
    httpOnly: false // <- set httpOnly to false
  }
}));


//******************************************************************************
// SET CORS PERMISSIONS FOR SOCKET.IO
//
io.set( 'origins', '*localhost*:*' );


//******************************************************************************
// Setup dev environment related items
//
if ( ('development' === env) || ('testing' === env) ){
  // configure stuff here
  app.set('mode', 'development');
} else {
  app.set('mode', 'production');
}


//******************************************************************************
// Allow local instance testing in firefox & opera from ember server
//
app.use(function (request, response, next) {

  if(app.get('mode') === 'development') {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Allow-Methods",
                    "POST, GET, PUT, DELETE, OPTIONS");
    response.header("Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept," +
                    " x-access-token");
  }

  // FIXME: THIS ENTIRE PROCESS NEEDS TO BE TIGHTENED UP WITH
  // BETTER ERROR HANDLING

  // all incoming api's [except for login] should have an access token
  var token_id = request.headers['x-access-token'];

  if(token_id) {
    // Use the User model to find a specific user by token id
    Token.findById(token_id, function(err, token) {

      if (err) {
        console.log('[App.use] Token.findById error: ', err);
        next();
      } else {

        // Use the User model to find a specific user
        User.findById(token.user, function(err, user) {

          // TODO: HANDLE THE CASE WHERE THE TOKEN IS FOUND, BUT THE USER
          // ISN'T. THIS COULD BE BECAUSE OF A DELETED ACCOUNT AND A
          // BROWSER STILL STOKING THE TOKEN
          if (err) {
            console.log('[App.use] User.findById error: ', err);
          }

          request.session.user    = user;
          request.session.token   = token_id;

          next();
        });
      }
    });
  } else {
    next();
  }
});

//******************************************************************************
// BINGERS ROUTES
//
app.get('/api/1/bingers', bingers.list);
app.post('/api/1/bingers', bingers.create);
app.get('/api/1/bingers/:binger_id', bingers.get);
app.put('/api/1/bingers/:binger_id', bingers.update);
app.delete('/api/1/bingers/:binger_id', bingers.delete);


//******************************************************************************
// USERS ROUTES
//
app.get('/api/1/users', users.list);
app.post('/api/1/login', users.login);
app.post('/api/1/users', users.create);
app.post('/api/1/logout', users.logout);
app.get('/api/1/users/:user_id', users.get);
app.put('/api/1/users/:user_id', users.update);
app.delete('/api/1/users/:user_id', users.delete);

//******************************************************************************
// GROUPS ROUTES
//
app.get('/api/1/groups', groups.list);
app.post('/api/1/groups', groups.create);
app.get('/api/1/groups/:group_id', groups.get);
app.put('/api/1/groups/:group_id', groups.update);
app.delete('/api/1/groups/:group_id', groups.delete);
app.post('/api/1/groups/:group_id/binger', groups.addBinger);
app.delete('/api/1/groups/:group_id/binger/:binger_id', groups.removeBinger);
app.post('/api/1/groups/:group_id/user', groups.addUser);
app.delete('/api/1/groups/:group_id/user/:user_id', groups.removeUser);


//******************************************************************************
// TOKENS ROUTES
//
app.get('/api/1/tokens', tokens.list);
app.get('/api/1/tokens/:token_id', tokens.get);

//******************************************************************************
// START THE HTTP SERVER
//
http.listen(port, function () {
  console.log('Binger Pinger Server [' +
               app.get('mode') + '] started on port %d', http.address().port);

  notifications.connect(io);
});

//******************************************************************************
// ERROR HANDLING
//
process.on('uncaughtException', function(err) {
  console.error('uncaughtException: ', err);
});

//******************************************************************************
// DATABASE CONNECTION HANDLING
//

// If the connection throws an error
mongoose.connection.on("error", function(err) {
  console.error('Failed to connect to DB on startup ', err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection to DB disconnected');
});

//******************************************************************************
// EXIT
//
process.on('SIGINT', function () {
  console.log('Stopping Binger Server');
  // close the database connection
  mongoose.connection.close(function() {
    process.exit(0);
  });
});
