const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['manager', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

// Một người dùng chỉ xuất hiện một lần trong một dự án
memberSchema.index({ project: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);
