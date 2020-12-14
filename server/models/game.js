const mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const gameSchema = new Schema({
  _id: Schema.Types.ObjectId,
  boardId: {
    type: String,
    required: true,
  },
  guest: {
    type: String,
    required: true,
  },
  steps: {
    type: String,
    required: true,
  },
  result: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Game', gameSchema);