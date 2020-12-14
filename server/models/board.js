const mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const boardSchema = new Schema({
  _id: Schema.Types.ObjectId,
  host: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Board', boardSchema);