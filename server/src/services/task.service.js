const Task = require('../models/Task');
const Member = require('../models/Member');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');

/**
 * MODULE QUẢN LÝ CÔNG VIỆC — phụ trách: TV3
 */

/** UC12, UC17 – Danh sách công việc của dự án, hỗ trợ tìm kiếm và lọc */
async function listTasks(projectId, { keyword, assignee, status, priority, overdue } = {}) {
  const filter = { project: projectId };
  if (keyword) filter.title = new RegExp(keyword, 'i');
  if (assignee) filter.assignee = assignee;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (overdue === 'true') filter.dueDate = { $lt: new Date() };

  return Task.find(filter)
    .populate('assignee', 'fullName email avatar')
    .sort({ status: 1, order: 1, createdAt: -1 });
}

/**
 * UC13 – Thêm mới công việc và giao cho thành viên.
 * Đây là chức năng nghiệp vụ chính: kiểm tra ràng buộc trước khi khởi tạo công việc.
 */
async function createTask(projectId, userId, data) {
  const { title, description, assignee, priority, dueDate } = data;

  // Ràng buộc 1: tiêu đề bắt buộc
  if (!title || !title.trim()) {
    throw ApiError.badRequest('Tiêu đề công việc không được để trống');
  }

  // Ràng buộc 2: người được giao phải là thành viên của dự án
  if (assignee) {
    const isMember = await Member.exists({ project: projectId, user: assignee });
    if (!isMember) throw ApiError.badRequest('Người được giao không thuộc dự án');
  }

  const task = await Task.create({
    project: projectId,
    title: title.trim(),
    description: description || '',
    assignee: assignee || null,
    createdBy: userId,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    status: 'todo',
  });

  return task.populate('assignee', 'fullName email avatar');
}

/** UC14 – Chỉnh sửa công việc */
async function updateTask(taskId, data) {
  // TODO (TV3): kiểm tra assignee thuộc dự án, cập nhật và trả về task
  throw ApiError.badRequest('Chức năng chỉnh sửa công việc chưa được cài đặt');
}

/**
 * UC15 – Cập nhật trạng thái công việc.
 * Thành viên chỉ đổi được task của mình, quản trị dự án đổi được mọi task.
 */
async function updateStatus(taskId, user, membership, status, order = 0) {
  // TODO (TV3):
  // 1. Lấy task, không có thì 404
  // 2. Nếu membership.role !== 'manager' và task.assignee khác user._id thì báo 403
  // 3. Cập nhật status và order, trả về task
  throw ApiError.badRequest('Chức năng cập nhật trạng thái chưa được cài đặt');
}

/** UC16 – Xoá công việc cùng các bình luận thuộc công việc đó */
async function deleteTask(taskId) {
  // TODO (TV3): xoá Comment theo task rồi xoá Task
  throw ApiError.badRequest('Chức năng xoá công việc chưa được cài đặt');
}

async function getTask(taskId) {
  const t = await Task.findById(taskId)
    .populate('assignee', 'fullName email avatar')
    .populate('createdBy', 'fullName email');
  if (!t) throw ApiError.notFound('Không tìm thấy công việc');
  return t;
}

module.exports = { listTasks, createTask, updateTask, updateStatus, deleteTask, getTask };
