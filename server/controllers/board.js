const mongoose = require('mongoose');
const passport = require('passport');
require('../passport/passport')(passport);

const Board = require('../models/board');

// Get boards
module.exports.getBoards = function (req, res) {
  return Board.find()
    .select()
    .then((boards) => {
      return res.status(200).json({
        success: true,
        message: 'Boards',
        Boards: boards,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: err.message,
      });
    });
};

//Create boards
module.exports.createBoard = function (req, res) {
  const board = new Board({
    _id: mongoose.Types.ObjectId(),
    host: req.body.host,
  });
  return board
    .save()
    .then((board) => {
      return res.status(201).json({
        success: true,
        message: 'Board created successfully',
        data: board,
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

//Get board
module.exports.getBoardById = function (req, res) {
  Board.findById(req.params.boardId, function (err, board) {
    if (err)
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: error.message,
      });
    res.status(201).json({
      success: true,
      message: 'Board',
      data: board,
    });
  });
};