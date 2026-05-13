const mongoose = require('mongoose');

const classQueueSchema = new mongoose.Schema({
  class: { type: String, required: true, unique: true, enum: ['Starway', 'NSC', 'Staff'] },
  queue: [
    {
      position: Number,
      name: String,
      memberCount: Number,
    }
  ],
  lastRandomized: { type: Date },
});

module.exports = mongoose.model('ClassQueue', classQueueSchema);
