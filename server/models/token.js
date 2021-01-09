const mongoose = require('mongoose')
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const tokenSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  username: {
    type: String,
    required: true, ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    expires: '1h'
  }
});

module.exports = mongoose.model('Token', tokenSchema);
