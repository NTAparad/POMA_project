const mongoose = require('mongoose');
const Task = require('../models/Task');

/**
 * MODULE THỐNG KÊ — phụ trách: TV2
 *
 * UC21 – Xem thống kê tiến độ dự án.
 * Trả về số liệu tổng hợp phục vụ các thẻ số và hai biểu đồ trên giao diện.
 */
async function getProjectStats(projectId) {
  const tasks = await Task.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $lookup: {
        from: 'users', localField: 'assignee', foreignField: '_id', as: 'assigneeUser',
      },
    },
    { $unwind: { path: '$assigneeUser', preserveNullAndEmptyArrays: true } },
    { $project: { status: 1, dueDate: 1, assignee: 1, fullName: '$assigneeUser.fullName' } },
  ]);

  const byStatus = { todo: 0, in_progress: 0, review: 0, done: 0 };
  const assigneeMap = new Map();
  let overdue = 0;
  const now = new Date();

  tasks.forEach((task) => {
    if (byStatus[task.status] !== undefined) byStatus[task.status] += 1;
    if (task.dueDate && task.dueDate < now && task.status !== 'done') overdue += 1;

    const userId = task.assignee ? String(task.assignee) : null;
    if (!assigneeMap.has(userId)) {
      assigneeMap.set(userId, {
        userId: task.assignee || null,
        fullName: task.assignee ? task.fullName : 'Chưa giao',
        count: 0,
        done: 0,
      });
    }
    const summary = assigneeMap.get(userId);
    summary.count += 1;
    if (task.status === 'done') summary.done += 1;
  });

  const total = tasks.length;

  return { total, byStatus, completionRate: total ? byStatus.done / total : 0, overdue, byAssignee: [...assigneeMap.values()] };
}

module.exports = { getProjectStats };
