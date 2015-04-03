"use strict";

// *****************************************************************************
// User
// Description: Class for user object definition
// Author: Adam Wysocki
// Date: 3/12/15
//

//******************************************************************************
// LOAD REQUIRED PACKAGES
//
var _Promise  = require('promise'),
    bcrypt    = require('bcrypt'),
    dbUser    = require('../models/user');

//******************************************************************************
// USER CONSTRUCTOR
//
function User() {
    this.id             = null;
    this.firstName      = '';
    this.lastName       = '';
    this.email          = '';
    this.created        = new Date();
    this.modified       = new Date();
    this.lastLogin      = new Date();
    this.password       = null;
}

//******************************************************************************
// SAVE - Save the user in the database and return a promise
//
User.prototype.save = function() {
  return new _Promise(function(resolve, reject){

    // Use the User model to find a specific user
    dbUser.findById(this.id, function(err, user) {

      if (err) {
        reject({success: false, msg: err});
      }

      // Update the existing user
      dbUser.firstname  = this.firstName;
      dbUser.lastname   = this.lastName;
      dbUser.modified   = this.modified = new Date();

      // if the password is being reset, use
      // bcrypt to generate a salt and hash
      // it
      if(this.password !== null) {
        // Generate a salt
        var salt = bcrypt.genSaltSync(10);

        // Hash the password with the salt
        dbUser.password = bcrypt.hashSync(this.password, salt);
      }

      // Save the user and check for errors
      user.save(function(err) {
        if (err) {
          reject({success: false, msg: err});
        }

        resolve({success: true, msg: 'success', data: user});
      });
    });
  });
};

//******************************************************************************
// LOAD - Load the user from the database and return a promise
//
User.prototype.load = function(id) {
  return new _Promise(function(resolve, reject){

    // Use the User model to find a specific user
    dbUser.findById(id, function(err, user) {

      if (err) {
        reject({success: false, msg: err});
      }

      this.firstName    = user.firstname;
      this.lastName     = user.lastname;
      this.email        = user.email;
      this.admin        = user.admin;
      this.created      = user.created;
      this.modified     = user.modified;
      this.password     = null;

      resolve({success: true, msg: 'success', data: user});
    });
  });
};

//******************************************************************************
// EXPORTS
//
module.exports = User;
