const Task = require('../models/Task');
const Member = require('../models/Member');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');

const { TASK_STATUS, TASK_PRIORITY } = Task;

/**
 * MODULE QUẢN LÝ CÔNG VIỆC — phụ trách: TV3
 */

/** Chuyển chuỗi ngày thành Date, trả về undefined nếu không hợp lệ. */
function parseDueDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('Hạn hoàn thành không đúng định dạng ngày');
  }
  return date;
}

/** Kiểm tra người được giao có thuộc dự án hay không. */
async function assertAssigneeInProject(projectId, assignee) {
  if (!assignee) return;

  const isMember = await Member.exists({ project: projectId, user: assignee });
  if (!isMember) throw ApiError.badRequest('Người được giao không thuộc dự án');
}

/** Kiểm tra dữ liệu chung cho cả tạo mới và chỉnh sửa công việc. */
function validateTaskInput({ title, description, priority }, { requireTitle }) {
  if (requireTitle || title !== undefined) {
    if (!title || !title.trim()) {
      throw ApiError.badRequest('Tiêu đề công việc không được để trống');
    }
    if (title.trim().length > 300) {
      throw ApiError.badRequest('Tiêu đề công việc không được vượt quá 300 ký tự');
    }
  }

  if (description !== undefined && description !== null && description.length > 5000) {
    throw ApiError.badRequest('Mô tả công việc không được vượt quá 5000 ký tự');
  }

  if (priority !== undefined && priority !== null && !TASK_PRIORITY.includes(priority)) {
    throw ApiError.badRequest('Độ ưu tiên không hợp lệ');
  }
}

/** UC12, UC17 – Danh sách công việc của dự án, hỗ trợ tìm kiếm và lọc */
async function listTasks(projectId, { keyword, assignee, status, priority, overdue } = {}) {
  if (status && !TASK_STATUS.includes(status)) {
    throw ApiError.badRequest('Trạng thái lọc không hợp lệ');
  }
  if (priority && !TASK_PRIORITY.includes(priority)) {
    throw ApiError.badRequest('Độ ưu tiên lọc không hợp lệ');
  }

  const filter = { project: projectId };

  // Thoát ký tự đặc biệt để từ khoá được hiểu là chuỗi thường, không phải biểu thức
  if (keyword) {
    filter.title = new RegExp(String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (assignee) filter.assignee = assignee;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Công việc quá hạn: đã qua hạn và chưa hoàn thành
  if (overdue === 'true' || overdue === true) {
    filter.dueDate = { $ne: null, $lt: new Date() };
    filter.status = status && status !== 'done' ? status : { $ne: 'done' };
  }

  return Task.find(filter)
    .populate('assignee', 'fullName email avatar')
    .sort({ status: 1, order: 1, createdAt: 1 });
}

/**
 * UC13 – Thêm mới công việc và giao cho thành viên.
 * Đây là chức năng nghiệp vụ chính: kiểm tra ràng buộc trước khi khởi tạo công việc.
 */
async function createTask(projectId, userId, data) {
  const { title, description, assignee, priority, dueDate, order } = data;

  validateTaskInput({ title, description, priority }, { requireTitle: true });
  await assertAssigneeInProject(projectId, assignee);

  const task = await Task.create({
    project: projectId,
    title: title.trim(),
    description: description || '',
    assignee: assignee || null,
    createdBy: userId,
    priority: priority || 'medium',
    dueDate: parseDueDate(dueDate) ?? null,
    status: 'todo',
    order: Number.isFinite(Number(order)) ? Number(order) : 0,
  });

  return task.populate('assignee', 'fullName email avatar');
}

/**
 * UC14 – Chỉnh sửa công việc.
 * Chỉ quản trị dự án được gọi, việc kiểm tra quyền do middleware đảm nhiệm.
 * Các trường project và createdBy không cho phép sửa.
 */
async function updateTask(taskId, data) {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Không tìm thấy công việc');

  const { title, description, assignee, priority, dueDate, status } = data;

  validateTaskInput({ title, description, priority }, { requireTitle: false });

  if (status !== undefined && !TASK_STATUS.includes(status)) {
    throw ApiError.badRequest('Trạng thái công việc không hợp lệ');
  }

  if (assignee !== undefined && assignee !== null && assignee !== '') {
    await assertAssigneeInProject(task.project, assignee);
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description || '';
  if (assignee !== undefined) task.assignee = assignee || null;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;

  const parsed = parseDueDate(dueDate);
  if (parsed !== undefined) task.dueDate = parsed;

  await task.save();
  return task.populate('assignee', 'fullName email avatar');
}

/**
 * UC15 – Cập nhật trạng thái và vị trí công việc.
 * Quản trị dự án đổi được mọi công việc, thành viên chỉ đổi được công việc của mình.
 */
async function updateStatus(taskId, user, membership, status, order) {
  if (!status || !TASK_STATUS.includes(status)) {
    throw ApiError.badRequest('Trạng thái công việc không hợp lệ');
  }

  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Không tìm thấy công việc');

  const isManager = membership?.role === 'manager';
  const isAssignee = task.assignee && String(task.assignee) === String(user._id);

  if (!isManager && !isAssignee) {
    throw ApiError.forbidden('Bạn chỉ được đổi trạng thái công việc được giao cho mình');
  }

  if (order !== undefined && order !== null) {
    const numericOrder = Number(order);
    if (!Number.isFinite(numericOrder) || numericOrder < 0) {
      throw ApiError.badRequest('Thứ tự công việc phải là số không âm');
    }
    task.order = numericOrder;
  }

  task.status = status;
  await task.save();

  return task.populate('assignee', 'fullName email avatar');
}

/** UC16 – Xoá công việc cùng các bình luận thuộc công việc đó */
async function deleteTask(taskId) {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Không tìm thấy công việc');

  // Xoá bình luận trước để không còn dữ liệu mồ côi trong cơ sở dữ liệu
  await Comment.deleteMany({ task: taskId });
  await Task.deleteOne({ _id: taskId });

  return { project: task.project };
}

async function getTask(taskId) {
  const t = await Task.findById(taskId)
    .populate('assignee', 'fullName email avatar')
    .populate('createdBy', 'fullName email');
  if (!t) throw ApiError.notFound('Không tìm thấy công việc');
  return t;
}

module.exports = { listTasks, createTask, updateTask, updateStatus, deleteTask, getTask };
