var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var clientID = process.env.FACEBOOK_CLIENTID || '4166090010091919',
    clientSecret = process.env.FACEBOOK_SECRET || 'def0cfcc2eb7061507ef9c0e1ada2631',
    callbackURL = process.env.FACEBOOK_CALLBACK || 'http://localhost:5034/users/callback';

const mongoose = require('mongoose');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        console.log('serializeUser');
        console.log(user);
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser');
        console.log(id);
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'middle_name']
    },
        function (token, refreshToken, profile, done) {
            console.log("token:", token);
            console.log("refreshToken:", refreshToken);
            process.nextTick(function () {
                User.findOne({ 'email': profile.emails[0].value }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, user);
                    } else {
                        const newUser = new User({
                            _id: mongoose.Types.ObjectId(),
                            username: profile.id,
                            email: profile.emails[0].value,
                            active: '1',
                        });
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

};