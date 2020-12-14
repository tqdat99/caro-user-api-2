const express = require('express');
var passport = require('passport');
require('../passport/passport')(passport);
const { getUsers, getUserByUsername, signUp, signIn } = require('../controllers/user');
const { createBoard } = require('../controllers/board');

const userRoutes = express.Router();

userRoutes.post('/register', signUp);
userRoutes.post('/login', signIn);
userRoutes.get('/test', getUsers);
userRoutes.get('/', passport.authenticate('jwt', { session: false }), getUsers);
userRoutes.post('/signup', signUp);
userRoutes.post('/signin', signIn);
userRoutes.get('/user', passport.authenticate('jwt', { session: false }), getUserByUsername);
userRoutes.get('/create-board', passport.authenticate('jwt', { session: false }), createBoard);

module.exports = userRoutes;