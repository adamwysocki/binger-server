/*jslint node: true */
"use strict";

// ****************************************************************************
// USER MODEL
//

// Load required packages
var mongoose = require('mongoose');

// Define our User schema
var UserSchema   = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  admin: Boolean,
  created: Date,
  modified: Date,
  verified: Boolean,
  lastlogin: Date
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
