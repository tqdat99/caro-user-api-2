const mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const gameSchema = new Schema({
  room: {
    type: String,
    required: true
  },
  playedDate: {
    type: String,
    required: true
  },
  winner: {
    type: String,
    required: true
  },
  turn: {
    move_x: {
      type: String,
      required: true
    },
    move_o: {
      type: String,
      required: true
    }
  },
  history: [{
    type: Array,
  }],
  messages: [{
    sender: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  }]
});

module.exports = mongoose.model('Game', gameSchema);
