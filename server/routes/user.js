const express = require('express');
var passport = require('passport');
const { getGameById } = require("../controllers/game");
const { getUserInfo } = require("../controllers/user");
const { getUserByDisplayName } = require("../controllers/user");
require('../passport/passport')(passport);
require('../passport/passport-facebook')(passport);
require('../passport/passport-google')(passport);
const { getUsers, getUserByUsername, signUp, signIn, updateUserByUsername, updatePasswordByUsername, requestVerification, verify, addEmailByUsername, checkUsernameAndEmail, getLeaderboard, resetPassword, requestPasswordReset } = require('../controllers/user');
const { isLoggedIn } = require('../middleware/auth');
const userRoutes = express.Router();

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
userRoutes.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

userRoutes.get('/user/display-name', isLoggedIn, getUserByDisplayName)
userRoutes.get('/user/user-info', isLoggedIn, getUserInfo)
userRoutes.get('/user/game', isLoggedIn, getGameById)
userRoutes.post('/request-verification', isLoggedIn, requestVerification);
userRoutes.get('/verify', verify);


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


module.exports = userRoutes;
