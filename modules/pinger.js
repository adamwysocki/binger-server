/*jslint node: true */
"use strict";

// ****************************************************************************
// PINGER MODULE
// Author: Adam Wysocki
// Date: 3/12/15
//

// Load required packages
var ping              = require("net-ping"),
    _Promise          = require('promise'),
    moment            = require("moment"),
    http              = require('http'),
    dns               = require('dns');


//*****************************************************************************
// THIS IS THE PINGER ... REQUIRES SUDO PERMISSIONS
//
var pingSession = ping.createSession();

//*****************************************************************************
// resolveIt - Take a host name or ip address and do a DNS lookup to return
// the actual address
//
exports.resolveIt = function(address) {

  // return a Promise
  return new _Promise(function(resolve, reject) {

    dns.lookup(address, function onLookup(err, addresses) {

      if(err) {
        reject(err);
      }
      else {
        resolve(addresses);
      }

    });
  });
};

//*****************************************************************************
// pingIt - Perform an ICMP ping of the give address and time it. Return
// the response time if successful or an error if failed.
//
exports.pingIt = function(address) {

  // return a Promise
  return new _Promise(function(resolve, reject) {

    var start = new Date();

    pingSession.pingHost(address, function (error) {

      var end           = new Date(),
          responseTime  = moment(end).diff(moment(start));

      if (error) {

        reject(error);

      } else {

        console.log('pingIt responseTime: ', responseTime);

        resolve(responseTime);

      }

    }); // end pingHost

  }); // end return promise

};

exports.httpPingIt = function(address) {

  return new _Promise(function(resolve, reject) {

  var start = new Date();

  var request = http.request({
      host: address,
      port: 80,
      method: 'GET',
      path: '/index.html'
    }, function (response) {
      response.on('data', function (data) {
        var end           = new Date(),
            responseTime  = moment(end).diff(moment(start));

        console.log('httpPingIt responseTime: ', responseTime);

        resolve(responseTime);

        console.log(data.toString());
      });
    });

    request.on('error', function (e) {
      // General error, i.e.
      //  - ECONNRESET - server closed the socket unexpectedly
      //  - ECONNREFUSED - server did not listen
      //  - HPE_INVALID_VERSION
      //  - HPE_INVALID_STATUS
      //  - ... (other HPE_* codes) - server returned garbage
      console.log(e);
      reject(e);
    });

    request.on('timeout', function () {
      // Timeout happend. Server received request, but not handled it
      // (i.e. doesn't send any response or it took to long).
      // You don't know what happend.
      // It will emit 'error' message as well (with ECONNRESET code).

      console.log('timeout');
      request.abort();
      reject('timeout error');
    });

    request.end();

  }); // end promise


};
