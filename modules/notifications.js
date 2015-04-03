/*jslint node: true */
"use strict";

// ****************************************************************************
// NOTIFICATIONS MODULE
// Author: Adam Wysocki
// Date: 3/12/15
//


function Notifications() {
  this.io = null;
}

Notifications.prototype.connect = function(io) {
  console.log('[Notifications.connect] io set');

  this.io = io;

  this.io.sockets.on('connection', function() {
    console.log('a connection was made');
  });
};

Notifications.prototype.statusChange = function(id, address, fromstatus, tostatus, lastevent) {
  this.io.emit("statusChange", {id: id, address: address, newstatus: tostatus, lastevent: lastevent});
};

Notifications.prototype.newBinger = function(id, address, responsetime, status, lastevent, type) {
  this.io.emit("newBinger", {id: id, address: address, status: status, responsetime: responsetime, lastevent: lastevent, type: type});
};

Notifications.prototype.removeBinger = function(id, name) {
  this.io.emit("removeBinger", {id: id, name: name});
};

Notifications.prototype.updateBinger = function(id, address, status, responsetime, lastevent, statuschanged) {
  this.io.emit("updateBinger", {id: id, address: address, status: status, responsetime: responsetime, lastevent: lastevent, changeevent: statuschanged});
};

module.exports = exports = new Notifications();

/*
exports.init = function(ioObj) {
  io = ioObj;

  ioObj.sockets.on('connection', function(){
    console.log('a connection was made');
  });
};*/
