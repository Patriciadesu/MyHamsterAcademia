const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  class: { type: String, enum: ['Starway', 'NSC', 'Staff'] },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastRandomized: { type: Date },
});

module.exports = mongoose.model('Group', groupSchema);
