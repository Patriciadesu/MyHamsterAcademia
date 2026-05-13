const mongoose = require('mongoose');

const showStateSchema = new mongoose.Schema({
  activeClass: { type: String, enum: ['Starway', 'NSC', 'Staff'], default: null },
  currentGroupIndex: { type: Number, default: 0 },
  timerStartedAt: { type: Number, default: null },
  timerDuration: { type: Number, default: 120 }, // 2 minutes in seconds
  stockBoostAt: { type: Number, default: null }, // Unix timestamp when judge boosted stock
  status: { type: String, enum: ['idle', 'waiting_for_group', 'timer_running'], default: 'idle' }
});

module.exports = mongoose.model('ShowState', showStateSchema);
