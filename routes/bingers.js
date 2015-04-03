"use strict";

// ****************************************************************************
// BINGER ROUTE
// Author: Adam Wysocki
// Date: 3/12/15
//

// Load required packages
var Binger          = require('../models/binger'),
    Group           = require('../models/group'),
    _Promise        = require('promise'),
    notifications   = require('../modules/notifications'),
    _binger         = require('../classes/_binger'),
    pinger          = require('../modules/pinger');

function addBingerToGroup(binger) {

  // return a Promise
  return new _Promise(function(resolve, reject) {

    // Use the Group model to find a specific group
    Group.findById(binger.group, function(err, group) {

      if (err) {
        reject({ success: false,
                        msg: err
        });
        return;
      }

      // Update the existing group with the new binger id
      group.bingers.push(binger._id);

      // Save the group and check for errors
      group.save(function(err) {
        if (err) {
          reject({ success: false,
                          msg: err
          });
          return;
        }

        resolve(binger);

      });
    });
  });
}


function save(name, hostname, address, type, lastevent, status, responsetime, user, group, interval) {

  // return a Promise
  return new _Promise(function(resolve, reject) {

    console.log('responsetime: ', responsetime);

    // Create a new instance of the Binger model
    var binger = new Binger();

    // Set the binger properties that came from the POST data
    binger.name             = name;
    binger.hostname         = hostname;
    binger.address          = address;
    binger.lastevent        = lastevent;
    binger.type             = type;
    binger.status           = status;
    binger.responsetime     = responsetime;
    binger.created          = new Date();
    binger.user             = user;
    binger.group            = group;
    binger.interval         = interval;

    if(type === 2) {
      binger.port = 80;
      binger.path = "/";
    }

    // Save the binger and check for errors
    binger.save(function(err) {
      if (err) {
        reject(err);
      }

      resolve(binger);
    });
  });
}

function update(id, status, lastevent) {

  return new _Promise(function(resolve, reject) {

    // Use the Binger model to find a specific binger
    Binger.findById(id, function(err, binger) {

      if (err) {
        reject(err);
        return;
      }

      if(binger === null) {
        reject('not found');
        return;
      }

      // Set the binger properties that came from the POST data
      if(binger.status !== status) {
        binger.status           = status;
        binger.lastevent        = lastevent;
      }

      // Save the binger and check for errors
      binger.save(function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(binger);
      });
    });

  });

}

exports.list = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the Binger model to find all bingers
  Binger.find(function(err, bingers) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    response.json({success:true, msg: 'success', data: bingers});
  });

};

exports.create = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  console.log('[Bingers.create] Body: ', JSON.stringify(request.body, null, 2));

  var name      = request.body.name,
      address   = request.body.name,
      hostname  = request.body.name,
      type      = parseInt(request.body.type),
      user      = request.session.user._id,
      group     = request.body.group,
      interval  = 1,
      status    = 5;            // assume active

  pinger.resolveIt(address).then(function(data) {

    address = data;

    if(type === 1) {
      return pinger.pingIt(data);
    } else if(type === 2) {
      return pinger.httpPingIt(data);
    } else {
      console.log('WHAT THE FUCK??');
    }

  }).then(function(result) {

    var end = new Date();

    console.log('result: ', result);

    /*address, type, lastevent, status, responsetime, user, group*/
    return save(name, hostname, address, type, end, status, result, user, group, interval);

  }).then(function(data) {

    return addBingerToGroup(data);

  }).then(function(data) {

    notifications.newBinger(data._id, data.name, data.responsetime, data.status, data.lastevent, data.type);

    data.id = data._id;

    response.json( {success: true, msg: 'success', binger: data} );

  }).catch(function(err) {

    response.json( { success: false, msg: err.message } );

  });


};

// Create endpoint /api/1/bingers/:binger_id for GET
exports.get = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the Binger model to find a specific binger
  Binger.findById(request.params.binger_id, function(err, binger) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    response.json({success: true, msg: 'success', data: binger});
  });

};

// Create endpoint /api/bingers/:binger_id for PUT
exports.update = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  console.log('status: ', request.body.status);

  var b = new _binger();

  b.load(request.params.binger_id).then(function(binger) {

    console.log('[bingers.update] binger.data._id: ', binger.data.id);

    b.id              = binger.data.id;
    b.name            = request.body.name || binger.data.name;
    b.hostname        = request.body.hostname || binger.data.hostname;
    b.interval        = request.body.interval || binger.data.interval;
    b.type            = parseInt(request.body.type) || binger.data.type;
    b.status          = parseInt(request.body.status) || binger.data.status;
    b.port            = request.body.port || binger.data.port;
    b.expectedstatus  = request.body.expectedstatus || binger.data.expectedstatus;
    b.expectedresult  = request.body.expectedresult;
    b.path            = request.body.path;
    b.method          = parseInt(request.body.method) || binger.data.method;

    console.log('[bingers.update] binger loaded: ', JSON.stringify(b, null, 2));

    return b.save();

  }).then(function(binger) {

    console.log('binger saved');

    binger.data.id = binger.data.id;

    /*id, address, status, responsetime, lastevent*/
    notifications.updateBinger(binger.data.id,
      binger.data.name,
      binger.data.status,
      binger.data.responsetime,
      binger.data.lastevent, false);

    response.json( {success: true, msg: 'success', binger: binger.data} );

  }).catch(function(err) {

    response.json( {success: false, msg: err} );

  });


};

// Create endpoint /api/bingers/:binger_id for DELETE
exports.delete = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json( {success: false, error: 401, msg: 'Unauthorized'} );
    return;
  }

  // Use the Binger model to find a specific binger and remove it
  Binger.findByIdAndRemove(request.params.binger_id, function(err, binger) {

    if (err) {
      response.send({success: false, msg: err});
      return;
    }

    notifications.removeBinger(request.params.binger_id, binger.name);

    response.json({success: true, msg: 'success'});
  });
};
