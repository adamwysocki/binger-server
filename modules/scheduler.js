"use strict";

// ****************************************************************************
// SCHEDULER MODULE
// Author: Adam Wysocki
// Date: 3/12/15
//

// ****************************************************************************
// Load required packages
//
var notifications     = require('../modules/notifications'),
    Binger            = require('../models/binger'),
    schedule          = require('node-schedule'),
    pinger            = require('../modules/pinger');

// ****************************************************************************
// Declare variables
//
var rule              = new schedule.RecurrenceRule();
    rule.minute       = new schedule.Range(0, 59, 1);

schedule.scheduleJob(rule, function(){

  console.log('scan timestamp: ', new Date());

  // Use the Binger model to find all bingers
  Binger.find(function(err, bingers) {

    if (err) {
      return;
    }

    bingers.forEach(function(host){

      if(host.status === "Paused") {
        console.log('paused, skipping ... ', host.name);
        return;
      }

      pinger.resolveIt(host.name).then(function(data) {

        console.log(host.name + ' resolved to ', data);

        if(host.type === 1) {
          return pinger.pingIt(data);
        } else if(host.type === 2) {
          return pinger.httpPingIt(data);
        }

      }).then(function(result) {

        var statusChanged = false;

        console.log(host.name + ' response time ', result);

        host.responsetime = result;

        if(host.status !== "Active") {
          host.lastevent  = new Date();
          host.status     = "Active";
          statusChanged   = true;

          // Use the Binger model to find a specific binger
          Binger.findById(host._id, function(err, binger) {

            if (err) {
              return;
            }

            if(binger === null) {
              return;
            }

            // Set the binger properties that came from the POST data
            binger.status           = host.status;
            binger.lastevent        = host.lastevent;

            // Save the binger and check for errors
            binger.save(function(err) {
              if (err) {
                return;
              }
            });
          });

        }

        notifications.updateBinger(host.id, host.name, host.status, host.responsetime, host.lastevent, statusChanged);

      }).catch(function(err) {

        console.log(host.name + ' is down ...', err);

        if(host.status !== "Down") {
          host.lastevent  = new Date();
          host.status     = "Down";
          notifications.updateBinger(host.id, host.name, host.status, host.responsetime, host.lastevent, true);

          // Use the Binger model to find a specific binger
          Binger.findById(host._id, function(err, binger) {

            if (err) {
              return;
            }

            if(binger === null) {
              return;
            }

            // Set the binger properties that came from the POST data
            binger.status           = host.status;
            binger.lastevent        = host.lastevent;

            // Save the binger and check for errors
            binger.save(function(err) {
              if (err) {
                return;
              }
            });
          });
        }
      });
    });
  });
});
