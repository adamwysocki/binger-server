/*jslint node: true */
"use strict";

// ****************************************************************************
// TOKEN MODEL
//

// Load required packages
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    ObjectId  = Schema.ObjectId;

// Define our Token schema
var TokenSchema   = new mongoose.Schema({
  user : ObjectId
});

// Export the Mongoose model
module.exports = mongoose.model('Token', TokenSchema);
