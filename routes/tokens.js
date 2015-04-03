/*jslint node: true */
"use strict";

// ****************************************************************************
// TOKEN ROUTE
// Author: Adam Wysocki
// Date: 3/12/15
//

// Load required packages
var Token     = require('../models/token');

// Create endpoint /api/1/token for GET
exports.list = function(request, response) {

  // Use the Token model to find all tokens
  Token.find(function(err, tokens) {
    if (err) {
      response.send({success: false, msg: err});
    }

    response.json({success:true, msg: 'success', data: tokens});
  });
};

// Create endpoint /api/1/tokens/:token_id for GET
exports.get = function(request, response) {

  // Use the Token model to find a specific token
  Token.findById(request.params.token_id, function(err, token) {
    if (err) {
      response.send({success: false, msg: err});
    }

      response.json({success: true, msg: 'success', data: token});
  });
};
