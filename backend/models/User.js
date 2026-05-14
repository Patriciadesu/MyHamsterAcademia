const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  discriminator: { type: String },
  avatar: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  class: { type: String, enum: ['Starway', 'NSC', 'Staff'] },
  group: { type: String },
  coin: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'judge'], default: 'user' },
});

module.exports = mongoose.model('User', userSchema);
