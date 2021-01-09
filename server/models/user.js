const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  game_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }],
  active: {
    type: String,
    required: true,
    default: '1',
  },
  email: {
    type: String,
  },
  avatar: {
    type: String,
    default: 'https://img.freepik.com/free-vector/pro-player-esport-game-logo_139366-231.jpg?size=626&ext=jpg',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  wins: {
    type: Number,
    required: true,
    default: 0,
  },
  cups: {
    type: Number,
    required: true,
    default: 0,
  },
  level: {
    type: String,
    required: true,
    default: 'bronze',
  }
});

userSchema.pre('save', function (next) {
  var user = this;
  if (!this.password) {
    return next();
  }
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

userSchema.pre('save', function (next) {
  var user = this;
  if (!this.password) {
    return next();
  }
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

userSchema.methods.hashPassword = function (passw, cb) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return cb(err);
    }
    bcrypt.hash(passw, salt, function (err, hash) {
      if (err) {
        return cb(err);
      }
      cb(null, hash);
    });
  });
};

userSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
