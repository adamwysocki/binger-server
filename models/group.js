/*jslint node: true */
"use strict";

// ****************************************************************************
// GROUP MODEL
//

// Load required packages
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema;

// Define our Group schema
var GroupSchema   = new mongoose.Schema({
  name: String,
  description: String,
  bingers: [{ type: Schema.Types.ObjectId, ref: 'Binger' }],
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// Export the Mongoose model
module.exports = mongoose.model('Group', GroupSchema);
