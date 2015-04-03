/*jslint node: true */
"use strict";

// ****************************************************************************
// GROUP ROUTE
// Author: Adam Wysocki
// Date: 3/12/15
//

// Load required packages
var Group           = require('../models/group');


//******************************************************************************
// LIST
// Create endpoint /api/1/groups for GET
//
exports.list = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({ success: false,
                    error: 401,
                    msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find all groups
  Group.find({users: request.session.user._id})
       .populate('bingers')
       .exec(function(err, groups) {

    if (err) {
      response.send({ success: false,
                      msg: err
      });
      return;
    }

    response.json({ success:true,
                    msg: 'success',
                    data: groups
    });
  });
};

//******************************************************************************
// CREATE
// Create endpoint /api/1/groups for POST
//
exports.create = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({ success: false,
                    error: 401,
                    msg: 'Unauthorized'
    });
    return;
  }


  if(!request.body.name) {
    response.json({ success: false,
                    error: 500,
                    msg: 'Name cannot be blank'
    });
    return;
  }

  var group             = new Group();

  group.name            = request.body.name;
  group.description     = request.body.description || '';

  group.users.push(request.session.user._id);

  console.log('[Groups.create] users: ', request.body.users || '');

  // Save the group and check for errors
  group.save(function(err) {
    if (err) {
      response.send({ success: false,
                      msg: err
      });
      return;
    }

    response.json({ success: true,
                    msg: 'Group added',
                    data: group
    });
  });

};

//******************************************************************************
// GET
// Create endpoint /api/1/groups/:group_id for GET
//
exports.get = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({ success: false,
                    error: 401,
                    msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group
  Group.find({_id:request.params.group_id})
       .populate('bingers')
       .exec(function(err, group) {

      if (err) {
        response.send({ success: false,
                        msg: err
        });
        return;
      }

      console.log('Group: ', JSON.stringify(group, null, 2));

      if(!group.length) {
        response.json({ success: false,
                        msg: 'not found',
                        data: group});
      } else {
        response.json({ success: true,
                        msg: 'success',
                        data: group});
      }
  });
};

//******************************************************************************
// UPDATE
// Create endpoint /api/groups/:group_id for PUT
//
exports.update = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({ success: false,
                    error: 401,
                    msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group
  Group.findById(request.params.group_id, function(err, group) {

    if (err) {
      response.send({ success: false,
                      msg: err
      });
      return;
    }

    console.log('[Group.update] ', JSON.stringify(request.body));


    if(!request.body.name) {
      response.json({ success: false,
                      error: 500,
                      msg: 'Name cannot be blank'
      });
      return;
    }

    var name        = request.body.name,
        description = request.body.description || '';

    // Update the existing group
    group.name        = name;
    group.description = description;

    //TODO: ADD BINGERS AND USERS AS WELL

    // Save the group and check for errors
    group.save(function(err) {
      if (err) {
        response.send({ success: false,
                        msg: err
        });
        return;
      }

      response.json({ success: true,
                      msg: 'success',
                      data: group
      });
    });
  });
};

//******************************************************************************
// DELETE
// Create endpoint /api/groups/:group_id for DELETE
//
exports.delete = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({ success: false,
                    error: 401,
                    msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group and remove it
  Group.findByIdAndRemove(request.params.group_id, function(err) {

    if (err) {
      response.send({ success: false,
                      msg: err
      });
      return;
    }

    //TODO: REMOVE BINGERS ASSOCIATED WITH THE GROUP. LEAVE USERS IN TACT

    response.json({ success: true,
                    msg: 'success'
    });
  });
};

//******************************************************************************
// ADDBINGER
// Create endpoint /api/1/groups/:group_id/add/binger for POST
//
exports.addBinger = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({
      success: false,
      error: 401,
      msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group
  Group.findById(request.params.group_id, function(err, group) {

    if (err) {
      response.send({
        success: false,
        msg: err
      });
      return;
    }

    console.log('[Group.addBinger] ', JSON.stringify(request.body));

    if(!request.body.binger_id) {
      response.json({
        success: false,
        error: 500,
        msg: 'Binger id cannot be blank'
      });
      return;
    }

    // Update the existing group with the new binger id
    group.bingers.push(request.body.binger_id);

    // Save the group and check for errors
    group.save(function(err) {
      if (err) {
        response.send({
          success: false,
          msg: err
        });
        return;
      }

      response.json({
        success: true,
        msg: 'Binger added to group',
        data: group
      });
    });
  });

};

//******************************************************************************
// REMOVEBINGER
// Create endpoint /api/groups/:group_id/remove/binger/:binger_id for DELETE
//
exports.removeBinger = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({
      success: false,
      error: 401,
      msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group and remove it
  Group.findById(request.params.group_id, function(err, group) {

    if (err) {
      response.send({
        success: false,
        msg: err
      });
      return;
    }

    console.log('[Groups.removeBinger] binger id: ', request.params.binger_id);

    group.bingers.remove(request.params.binger_id);

    console.log('[Groups.removeBinger] group.bingers after pull: ',
      JSON.stringify(group.bingers, null, 2));

    // Save the group and check for errors
    group.save(function(err) {
      if (err) {
        response.send({
          success: false,
          msg: err
        });
        return;
      }

      response.json({
        success: true,
        msg: 'Binger removed from group',
        data: group
      });
    });

  });
};


//******************************************************************************
// ADDUSER
// Create endpoint /api/1/groups/:group_id/add/user for POST
//
exports.addUser = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({
      success: false,
      error: 401,
      msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group
  Group.findById(request.params.group_id, function(err, group) {

    if (err) {
      response.send({
        success: false,
        msg: err
      });
      return;
    }

    console.log('[Group.addUser] ', JSON.stringify(request.body));

    if(!request.body.user_id) {
      response.json({
        success: false,
        error: 500,
        msg: 'Binger id cannot be blank'
      });
      return;
    }

    // Update the existing group with the new binger id
    group.users.push(request.body.user_id);

    // Save the group and check for errors
    group.save(function(err) {
      if (err) {
        response.send({
          success: false,
          msg: err
        });
        return;
      }

      response.json({
        success: true,
        msg: 'User added to group',
        data: group
      });
    });
  });

};

//******************************************************************************
// REMOVE USER
// Create endpoint /api/groups/:group_id/remove/user/:user_id for DELETE
//
exports.removeUser = function(request, response) {

  // Check if authorized.
  if(!request.session.user) {
    response.json({
      success: false,
      error: 401,
      msg: 'Unauthorized'
    });
    return;
  }

  // Use the Group model to find a specific group and remove it
  Group.findById(request.params.group_id, function(err, group) {

    if (err) {
      response.send({
        success: false,
        msg: err
      });
      return;
    }

    console.log('[Groups.removeUser] user id: ', request.params.user_id);

    group.users.remove(request.params.user_id);

    console.log('[Groups.removeUser] group.users after pull: ',
      JSON.stringify(group.users, null, 2));

    // Save the group and check for errors
    group.save(function(err) {
      if (err) {
        response.send({
          success: false,
          msg: err
        });
        return;
      }

      response.json({
        success: true,
        msg: 'User removed from group',
        data: group
      });
    });

  });
};
