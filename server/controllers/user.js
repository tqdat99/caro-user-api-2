const mongoose = require('mongoose');
var passport = require('passport');
require('../passport/passport')(passport);
var jwt = require('jsonwebtoken');
jwt_secret_or_key = process.env.JWT_SECRET_OR_KEY;
var crypto = require('crypto');
var nodemailer = require('nodemailer');
const User = require('../models/user');
const Token = require('../models/token');

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
      email: req.body.email,
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

module.exports.checkUsernameAndEmail = async function (req, res) {
  return User.find({ $or: [{ 'username': req.body.username }, { 'email': req.body.email }] })
    .select()
    .then((User) => {
      console.log(User)
      if (User.length > 0) {
        if (User[0].username == req.body.username && User[0].email == req.body.email)
          res.status(200).json({
            message: 'This user already exists.',
          });
        else
          res.status(200).json({
            message: 'Invalid username or email.',
          });
      }
      else
        res.status(200).json({
          message: 'No user with this email exists.',
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
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.sign(user.toJSON(), jwt_secret_or_key);
          res.json({ success: true, token: 'JWT ' + token, userId: user._id, username: user.username });
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

module.exports.updateUserByUsername = function (req, res) {
  return User.findOneAndUpdate(
    { username: req.body.username },
    {
      $set: {
        avatar: req.body.avatar,
      }
    },
    {
      upsert: false
    }
  )
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

module.exports.updatePasswordByUsername = function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;
    if (!user) {
      return res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      //Check current password
      user.comparePassword(req.body.currentPassword, function (errCurrent, currentIsMatch) {
        if (currentIsMatch && !errCurrent) {
          //Compare the new password with the current one
          user.comparePassword(req.body.newPassword, function (errNew, newIsMatch) {
            console.log(errNew, newIsMatch);
            if (newIsMatch && !errNew) {
              return res.status(401).send({ success: false, msg: 'New password and old password are the same. Please type another one.' });
            }
            if (errNew)
              return res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: errNew.message,
              });
          });
          //Hash new password
          user.hashPassword(req.body.newPassword, function (errHash, newHashedPassword) {
            //Update password
            if (newHashedPassword && !errHash) {
              return User.findOneAndUpdate(
                { username: req.body.username },
                {
                  $set: {
                    password: newHashedPassword,
                  }
                },
                {
                  upsert: false
                }
              )
                .then((User) => {
                  return res.status(200).json({
                    success: true,
                    message: 'Password successfully updated.',
                  });
                })
                .catch((err) => {
                  return res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                  });
                });
            }
            else return res.status(500).json({
              success: false,
              message: 'Server error. Please try again.',
              error: errHash.message,
            });
          })
        } else {
          return res.status(401).send({ success: false, msg: 'Current password not matched.' });
        }
      });
    }
  }).catch((err) => {
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      error: err.message,
    });
  });
};

module.exports.requestVerification = async function (req, res) {
  var username = req.body.username

  email = await getEmailByUsername(username);

  //User not having an email yet
  if (!email) {
    return res.status(401).send({ success: false, msg: 'User not having an email yet.' });
  }
  else {
    //Create a verification token for this user
    var token = new Token({
      _id: mongoose.Types.ObjectId(),
      username: username,
      token: crypto.randomBytes(16).toString('hex')
    });

    //Save the verification token
    token.save(function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Server error. Please try again.',
          error: err.message,
        });
      }

      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MAILER_USERNAME,
          pass: process.env.MAILER_PASSWORD
        }
      });
      var mailOptions = {
        from: 'biodarkus1305@gmail.com',
        to: email,
        subject: 'Account Verification',
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' +
          req.headers.host + '\/verification\/' +
          token.token + '.\n'
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: err.message,
          });
        }
        res.status(200).json('A verification email has been sent to ' + email + '.');
      });
    });
  }
}

module.exports.verify = function (req, res, next) {
  token = req.query.token

  // Find a matching token
  Token.findOne({ token: token }, function (err, token) {
    if (!token) return res.status(401).json({
      success: false,
      message: 'Unable to find a valid token. Token may have expired.'
    });

    // If we found a token, find a matching user
    User.findOne({ username: token.username }, function (err, user) {

      //Can't find matching token
      if (!user) return res.status(401).json({ msg: 'Unable to find a user for this token.' });

      //Email already verified
      if (user.verified) return res.status(401).json({
        success: false,
        message: 'Email already verified.'
      });

      // Verify and save the user
      User.findOneAndUpdate(
        { username: token.username },
        {
          $set: {
            verified: 'true',
          }
        },
        {
          upsert: false
        }
      )
        .then((User) => {
          console.log(User)
          return res.status(200).json({
            success: true,
            message: 'Email verified.',
          });
        })
        .catch((err) => {
          res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: err.message,
          });
        });
    });
  });
};

// Get user by username
getEmailByUsername = function (username) {
  return User.find({ "username": username })
    .select('email')
    .then((result) => {
      return result[0].email;
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });
}

module.exports.addEmailByUsername = function (req, res) {
  return User.find({ username: req.body.username })
    .select()
    .then((user) => {
      console.log(user);
      if (!user) return res.status(401).json({ msg: 'Unable to find a user.' });
      if (!user.email) return res.status(401).json({ msg: 'User already has an email.' });
      return User.findOneAndUpdate(
        { username: req.body.username },
        {
          $set: {
            email: req.body.email,
          }
        },
        {
          upsert: false
        }
      )
        .then((User) => {
          return res.status(200).json({
            success: true,
            message: 'Email added.',
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
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });


}