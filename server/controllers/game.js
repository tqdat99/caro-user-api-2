var passport = require('passport');
require('../passport/passport')(passport);

const Game = require('../models/game');

// Get games
// module.exports.getBoards = function (req, res) {
//   return Game.find()
//     .select()
//     .then((Games) => {
//       return res.status(200).json({
//         success: true,
//         message: 'Games',
//         Games: Games,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         success: false,
//         message: 'Server error. Please try again.',
//         error: err.message,
//       });
//     });
// }

// Get games by boardId
module.exports.getGamesByBoardId = function (req, res) {
  return Game.find({ "boardId": req.params.boardId })
    .select()
    .then((Games) => {
      return res.status(200).json({
        success: true,
        message: 'Games of board' + req.params.boardId,
        Games: Games,
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

//Create game
module.exports.createGame = function (req, res) {
  const game = new Game({
    _id: mongoose.Types.ObjectId(),
    boardId: req.body.boardId,
    guest: req.body.guest,
    steps: req.body.steps,
    result: req.body.result,
  });
  return game
    .save()
    .then((game) => {
      return res.status(201).json({
        success: true,
        message: 'Game created successfully',
        data: game,
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

//Get game
module.exports.getGameById = function (req, res) {
  Game.findById(req.params.gameId, function (err, game) {
      if (err)
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
        error: error.message,
      });
      res.status(201).json({
        success: true,
        message: 'Game',
        data: game,
      });
  });
};