const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId;

// Data we need to collect/confirm to have the app go.
const fields = {
  email: {type: String, index: true},
  token: {type: String, required: true, unique: true},
  returnUrl: {type: String},
  state: {type: Object},
  createdAt: { type: Date, expires: 3600*24*7, default: Date.now }
}

// One nice, clean line to create the Schema.
const tokenSchema = new Schema(fields)

module.exports = tokenSchema
