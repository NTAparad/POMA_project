const mongoose = require('mongoose');

const TASK_STATUS = ['todo', 'in_progress', 'review', 'done'];
const TASK_PRIORITY = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: [true, 'Tiêu đề công việc không được để trống'], trim: true, maxlength: 300 },
  description: { type: String, default: '', maxlength: 5000 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: TASK_STATUS, default: 'todo' },
  priority: { type: String, enum: TASK_PRIORITY, default: 'medium' },
  dueDate: { type: Date, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Chỉ mục phục vụ việc dựng bảng Kanban và các bộ lọc trên bảng công việc
taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ project: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUS = TASK_STATUS;
module.exports.TASK_PRIORITY = TASK_PRIORITY;
