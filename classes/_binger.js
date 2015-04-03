"use strict";

// *****************************************************************************
// User
// Description: Class for binger object definition
// Author: Adam Wysocki
// Date: 3/12/15
//

//******************************************************************************
// LOAD REQUIRED PACKAGES
//
var _Promise    = require('promise'),
    dbBinger    = require('../models/binger');

//******************************************************************************
// USER CONSTRUCTOR
//
function Binger() {
    this.id             = null;
    this.name           = '';
    this.hostname       = '';
    this.address        = '';
    this.type           = 0;
    this.status         = 10;
    this.lastevent      = new Date();
    this.created        = new Date();
    this.modified       = new Date();
    this.responsetime   = -1;
    this.group          = null;
    this.interval       = 1;
    this.port           = 80;
    this.method         = 'GET';
    this.path           = '/';
    this.expectedstatus = 200;
    this.expectedresult = null;
}

//******************************************************************************
// SAVE - Save the binger in the database and return a promise
//
Binger.prototype.save = function() {

  console.log('[_binger.save] id: ', this.id);

  var self = this;

  return new _Promise(function(resolve, reject){

    // Use the Binger model to find a specific binger
    dbBinger.findById(self.id, function(err, binger) {

      if (err) {
        console.log('[_binger.save] error: ', err);
        reject({success: false, msg: err});
      }

      // Update the existing binger
      binger.name           = self.name;
      binger.hostname       = self.hostname;
      binger.address        = self.address;
      binger.type           = self.type;
      binger.status         = self.status;
      binger.lastevent      = self.lastevent;
      binger.created        = self.created;
      binger.modified       = self.modified = new Date();
      binger.responsetime   = self.responsetime;
      binger.group          = self.group;
      binger.interval       = self.interval;
      binger.port           = self.port;
      binger.method         = self.method;
      binger.path           = self.path;
      binger.expectedstatus = self.expectedstatus;
      binger.expectedresult = self.expectedresult;


      // Save the binger and check for errors
      binger.save(function(err) {
        if (err) {
          console.log('[_binger.save] error: ', err);
          reject({success: false, msg: err});
        }

        resolve({success: true, msg: 'success', data: self});
      });
    });
  });
};

//******************************************************************************
// LOAD - Load the binger from the database and return a promise
//
Binger.prototype.load = function(id) {

  var self = this;

  return new _Promise(function(resolve, reject){

    // Use the Binger model to find a specific binger
    dbBinger.findById(id, function(err, binger) {

      if (err) {
        console.log('[_binger.load] error: ', err);
        reject({success: false, msg: err});
      }

      self.id             = binger._id;
      self.name           = binger.name;
      self.hostname       = binger.hostname;
      self.address        = binger.address;
      self.type           = binger.type;
      self.status         = binger.status;
      self.lastevent      = binger.lastevent;
      self.created        = binger.created;
      self.modified       = binger.modified;
      self.responsetime   = binger.responsetime;
      self.group          = binger.group;
      self.interval       = binger.interval;
      self.port           = binger.port;
      self.method         = binger.method;
      self.path           = binger.path;
      self.expectedstatus = binger.expectedstatus;
      self.expectedresult = binger.expectedresult;

      //console.log('[_binger.load] success: ', JSON.stringify(self, null, 2));

      resolve({success: true, msg: 'success', data: self});
    });
  });
};

//******************************************************************************
// EXPORTS
//
module.exports = Binger;
