const mongoose = require('mongoose');
var passport = require('passport');
require('../passport/passport')(passport);
var jwt = require('jsonwebtoken');
jwt_secret_or_key = 'WEBNC17' || process.env.JWT_SECRET_OR_KEY;

const User = require('../models/user');

// Get users
module.exports.getUsers = function (req, res) {
  return User.find()
    .select('username')
    .then((Users) => {
      return res.status(200).json({
        success: true,
        message: 'Users',
        Users: Users,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });
}

module.exports.signUp = async function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Please pass username and password.' });
  } else {
    const user = new User({
      _id: mongoose.Types.ObjectId(),
      username: req.body.username,
      password: req.body.password,
    });
    if (await checkUsername(user.username)) {
      return res.status(201).json({
        success: false,
        message: 'Username already existed.',
      });
    }
    return user
      .save()
      .then((newUser) => {
        return res.status(201).json({
          success: true,
          message: 'User created successfully',
        });
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: 'Server error. Please try again.',
          error: error.message,
        });
      });
  };
};

// Get user by username
checkUsername = function (username) {
  return User.find({ "username": username })
    .select('username')
    .then((User) => {
      if (User.length > 0) {
        return true;
      }
      return false;
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });
}

module.exports.signIn = function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;
    if (!user) {
      res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), jwt_secret_or_key);
          // return the information including token as JSON
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
      });
    }
  }).catch((err) => {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error: err.message,
    });
  });
};

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// Check user by username
module.exports.getUserByUsername = function (req, res) {
  return User.find({ "username": req.query.username })
    .select('username')
    .then((User) => {
      return res.status(200).json({
        success: true,
        message: 'User',
        User: User,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });
}
