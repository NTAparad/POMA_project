const Task = require('../models/Task');
const Member = require('../models/Member');

/**
 * MODULE THỐNG KÊ — phụ trách: TV2
 *
 * UC21 – Xem thống kê tiến độ dự án.
 * Trả về số liệu tổng hợp phục vụ các thẻ số và hai biểu đồ trên giao diện.
 */
async function getProjectStats(projectId) {
  // TODO (TV2):
  // 1. Đếm số task theo từng trạng thái (todo, in_progress, review, done)
  // 2. Tính completionRate = done / total, chú ý trường hợp total = 0
  // 3. Đếm số task quá hạn: dueDate < hiện tại và status !== 'done'
  // 4. Nhóm số task theo assignee để vẽ biểu đồ cột
  //
  // Gợi ý dùng aggregate:
  // const byStatus = await Task.aggregate([
  //   { $match: { project: new mongoose.Types.ObjectId(projectId) } },
  //   { $group: { _id: '$status', count: { $sum: 1 } } },
  // ]);

  return {
    total: 0,
    byStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
    completionRate: 0,
    overdue: 0,
    byAssignee: [],
  };
}

module.exports = { getProjectStats };
