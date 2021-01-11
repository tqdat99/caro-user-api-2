const express = require('express');
var passport = require('passport');
const { getGameById } = require("../controllers/game");
const { getUserInfo } = require("../controllers/user");
const { getUserByDisplayName } = require("../controllers/user");
require('../passport/passport')(passport);
require('../passport/passport-facebook')(passport);
require('../passport/passport-google')(passport);

const { getUsers, getUserByUsername, signUp, signIn, updateUserByUsername, updatePasswordByUsername, requestVerification, verify, addEmailByUsername, checkUsernameAndEmail, getLeaderboard, resetPassword, requestPasswordReset } = require('../controllers/user');
const { createBoard } = require('../controllers/board');
const facebookAppToken = process.env.FACEBOOK_APP || '4166090010091919|5558yQbRtuqtUNI8uJfcSkqC3ig';
const googleApp = process.env.GOOGLE_CONSUMER_KEY || '846280586932-oabrjoonglegin6tf7q1qn6jm192g0qn.apps.googleusercontent.com'

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const userRoutes = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.headers.authorization) {
        var xmlHttp = new XMLHttpRequest(),
            data,
            inputToken = req.headers.authorization.substr(7, req.headers.authorization.length);

        //Authorize facebook token
        let theUrl = 'https://graph.facebook.com/debug_token?input_token=' + inputToken + '&access_token=' + facebookAppToken;
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        data = JSON.parse(xmlHttp.responseText.substr(8, xmlHttp.responseText.length - 9));
        if (data.is_valid && data.application == 'caro') {
            console.log('Facebook authorized');
            return next();
        }

        //Authorize google token
        theUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + inputToken;
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        data = JSON.parse(xmlHttp.responseText.substr(0, xmlHttp.responseText.length));
        if (data.expires_in > 0 && data.issued_to == googleApp) {
            console.log('Google authorized');
            return next();
        }
    }

    //Authorize using jwt
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send("Unauthorized").end(); }
        console.log('JWT authorized')
        return next();
    })(req, res, next);
}

userRoutes.get('/', isLoggedIn, getUsers);
userRoutes.post('/signup', signUp);
userRoutes.post('/signin', signIn);
userRoutes.get('/leaderboard', isLoggedIn, getLeaderboard);
userRoutes.post('/check', checkUsernameAndEmail);
userRoutes.get('/user', isLoggedIn, getUserByUsername);
userRoutes.put('/update', isLoggedIn, updateUserByUsername);
userRoutes.put('/update-password', isLoggedIn, updatePasswordByUsername);
userRoutes.post('/request-password-reset', requestPasswordReset);
userRoutes.post('/reset-password', resetPassword);
userRoutes.put('/add-email', isLoggedIn, addEmailByUsername);
userRoutes.get('/create-board', isLoggedIn, createBoard);
userRoutes.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

userRoutes.get('/user/display-name', isLoggedIn, getUserByDisplayName)
userRoutes.get('/user/user-info', isLoggedIn, getUserInfo)
userRoutes.get('/user/game', isLoggedIn, getGameById)

userRoutes.get('/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);
userRoutes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
userRoutes.get('/callback-google',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });
userRoutes.post('/request-verification', isLoggedIn, requestVerification);
userRoutes.post('/verify', verify);

module.exports = userRoutes;
