var passport = require('passport');
require('../passport/passport')(passport);
const Game = require('../models/game');
const User = require('../models/user')
// // Get games by boardId
// module.exports.getGamesByBoardId = function (req, res) {
//   return Game.find({ "boardId": req.params.boardId })
//     .select()
//     .then((Games) => {
//       return res.status(200).json({
//         success: true,
//         message: 'Games of board' + req.params.boardId,
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
//
// //Create game
// module.exports.createGame = function (req, res) {
//   const game = new Game({
//     _id: mongoose.Types.ObjectId(),
//     boardId: req.body.boardId,
//     guest: req.body.guest,
//     steps: req.body.steps,
//     result: req.body.result,
//   });
//   return game
//     .save()
//     .then((game) => {
//       return res.status(201).json({
//         success: true,
//         message: 'Game created successfully',
//         data: game,
//       });
//     })
//     .catch((error) => {
//       res.status(500).json({
//         success: false,
//         message: 'Server error. Please try again.',
//         error: error.message,
//       });
//     });
// };
//
// //Get game
// module.exports.getGameById = function (req, res) {
//   Game.findById(req.params.gameId, function (err, game) {
//       if (err)
//       res.status(500).json({
//         success: false,
//         message: 'Server error. Please try again.',
//         error: error.message,
//       });
//       res.status(201).json({
//         success: true,
//         message: 'Game',
//         data: game,
//       });
//   });
// };

module.exports.addGame = function(req, res) {
  const newGame = new Game({
    room: req.room,
    playedDate: req.playedDate,
    winner: req.winner,
    turn:{
      move_x: req.game.turn.move_x,
      move_o: req.game.turn.move_o
    },
    history: req.game.history,
    messages: req.game.messages
  })
  try {
    newGame.save()
        .then((response) => {
          User.findOneAndUpdate({username: response.turn.move_x}, {$push: {game_ids: response._id}}, {new: true})
              .then((res) => {
                  console.log('Database Update', res)
              })
          User.findOneAndUpdate({username: response.turn.move_o}, {$push: {game_ids: response._id}}, {new: true})
              .then((res) => {
                  console.log('Database Update', res)
              })
        })
  } catch (err) {
    console.log(err)
  }
}

module.exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.query.id)
        res.status(200).json({
            success: true,
            game: game,
        })
    } catch (err) {
        res.status(400).json({message: err})
    }
}

