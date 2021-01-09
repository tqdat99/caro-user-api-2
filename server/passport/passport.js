var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    jwt_scheme = process.env.JWT_SCHEME || 'jwt',
    jwt_secret_or_key = process.env.JWT_SECRET_OR_KEY || 'WEBNC17';

// load up the user model
var User = require('../models/user');

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme(jwt_scheme);
    opts.secretOrKey = jwt_secret_or_key;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.findOne({ id: jwt_payload.id }, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};
