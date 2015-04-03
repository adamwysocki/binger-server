/*jslint node: true */
"use strict";

// ****************************************************************************
// ACCOUNT MODEL
//

// Load required packages
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    Binger    = require('../models/binger').
    User      = require('../models/user').
    ObjectId  = Schema.ObjectId;

// Define our Account schema
var AccountSchema   = new mongoose.Schema({
  created: { type: Date, default: new Date() },
  active: {type: Boolean, default: true}
});

// Export the Mongoose model
module.exports = mongoose.model('Account', AccountSchema);
