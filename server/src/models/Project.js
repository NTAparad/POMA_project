const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên dự án không được để trống'], trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
