// config/passport.js

// load những thứ chúng ta cần
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load  user model
var User = require('../models/user');

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))    

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CONSUMER_KEY || '846280586932-oabrjoonglegin6tf7q1qn6jm192g0qn.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CONSUMER_SECRET || 'oIcskPni2-XLHmIP10v9skp-',
        callbackURL: process.env.GOOGLE_CALLBACK || "http://localhost:5034/users/callback-google"
    },
        function (token, refreshToken, profile, done) {
            console.log(token);
            console.log(profile);

            process.nextTick(function () {

                // // tìm trong db xem có user nào đã sử dụng google id này chưa
                User.findOne({ 'google.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new User();

                        // set all of the relevant information
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
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