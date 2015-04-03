/*jslint node: true */
"use strict";

// ****************************************************************************
// USER ROUTE
// Author: Adam Wysocki
// Date: 3/12/15
//

// Load required packages
var User      = require('../models/user'),
    Token     = require('../models/token'),
    bcrypt    = require('bcrypt');

// Login route
exports.login = function(request, response) {

  var email     = request.body.username,
      password  = request.body.password;

  // Use the User model to find a specific user
  User.findOne({email: email}, function(err, user) {

    // user wasn't found. bad username (aka email address)
    if( (err) || (user === null) ) {
      response.send({success: false, msg: 'Username not found'});
      return;
    }

    // check the encrypted password against
    // what the user passed in
    if( bcrypt.compareSync(password, user.password) ) {

      // setup a token to track sessions
      var token           = new Token();
          token.user      = user._id;

      token.save(function(err){

        if(err) {
          // this is bad. why didn't the token save?
          response.send({success: false, msg: 'Unable to create login token'});
          return;
        }

        // success. pass back the user and the token
        response.json({success: true, msg: 'success', data: user, token: token._id});
      });

    } else {
      // passwords don't match, let user know
      // technically, we could track failed attempts
      // and lock the account here, but not now
      response.json({success: false, msg: 'Invalid password'});
    }
  });
};

// Logout route
exports.logout = function(request, response) {

  if(!request.session.token) {
    console.log('[Users.logout] No token');
    return;
  }

  // Use the User model to find a specific user and remove it
  Token.findByIdAndRemove(request.session.token, function(err) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    delete request.session.user;
    delete request.session.token;

    response.json({success: true, msg: 'success'});
  });

};

// Create a new user
exports.create = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Create a new instance of the User model
  var user = new User();

  // Set the user properties that came from the POST data
  user.email      = request.body.username;
  user.password   = request.body.password;
  user.created    = new Date();
  user.modified   = new Date();
  user.lastlogin  = new Date();
  user.admin      = false;
  user.verified   = false;

  // Generate a salt
  var salt = bcrypt.genSaltSync(10);

  // Hash the password with the salt
  user.password = bcrypt.hashSync(user.password, salt);

  // Save the user and check for errors
  user.save(function(err) {
    if (err) {
      response.send({success: false, msg: err });
    }

    response.json({ success: true, msg: 'User added', data: user });
  });
};

// Create endpoint /api/1/users for GET
exports.list = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the User model to find all users
  User.find(function(err, users) {
    if (err) {
      response.send({success: false, msg: err});
    }

    response.json({success:true, msg: 'success', data: users});
  });

};

// Create endpoint /api/1/users/:user_id for GET
exports.get = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the User model to find a specific user
  User.findById(request.params.user_id, function(err, user) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    response.json({success: true, msg: 'success', data: user});
  });
};

// Create endpoint /api/users/:user_id for PUT
exports.update = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the User model to find a specific user
  User.findById(request.params.user_id, function(err, user) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    console.log('[Users.update] ', JSON.stringify(request.body));

    // Update the existing user
    user.firstname = request.body.firstname;
    user.lastname = request.body.lastname;

    // Save the user and check for errors
    user.save(function(err) {
      if (err) {
        response.send({success: false, msg: err});
        return;
      }

      response.json({success: true, msg: 'success', data: user});
    });
  });
};

// Create endpoint /api/users/:user_id for DELETE
exports.delete = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the User model to find a specific user and remove it
  User.findByIdAndRemove(request.params.user_id, function(err) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    response.json({success: true, msg: 'success'});
  });
};
