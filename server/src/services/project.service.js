const Project = require('../models/Project');
const Member = require('../models/Member');
const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');

/**
 * MODULE QUẢN LÝ DỰ ÁN VÀ THÀNH VIÊN — phụ trách: TV2
 *
 * Tham khảo cách viết ở services/auth.service.js.
 * Mỗi hàm dưới đây tương ứng với một Use Case trong tài liệu.
 */

/** UC06 – Xem danh sách dự án của người dùng hiện tại */
async function listMyProjects(userId, { keyword = '', status } = {}) {
  const memberships = await Member.find({ user: userId }).select('project role');
  const ids = memberships.map((m) => m.project);

  const filter = { _id: { $in: ids } };
  if (keyword) filter.name = new RegExp(keyword, 'i');
  if (status) filter.status = status;

  const projects = await Project.find(filter).sort({ createdAt: -1 }).populate('owner', 'fullName email');

  const roleOf = Object.fromEntries(memberships.map((m) => [String(m.project), m.role]));
  return projects.map((p) => ({ ...p.toObject(), myRole: roleOf[String(p._id)] }));
}

/** UC07 – Thêm mới dự án. Người tạo được gán vai trò quản trị dự án. */
async function createProject(userId, data) {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  if (!name) {
    throw ApiError.badRequest('Tên dự án không được để trống');
  }
  if (name.length > 200) {
    throw ApiError.badRequest('Tên dự án không được vượt quá 200 ký tự');
  }
  if (description.length > 2000) {
    throw ApiError.badRequest('Mô tả không được vượt quá 2000 ký tự');
  }
  if ((data.startDate && Number.isNaN(startDate.getTime())) || (data.endDate && Number.isNaN(endDate.getTime()))) {
    throw ApiError.badRequest('Ngày dự án không hợp lệ');
  }
  if (startDate && endDate && endDate < startDate) {
    throw ApiError.badRequest('Ngày kết thúc phải sau ngày bắt đầu');
  }

  const project = await Project.create({ name, description, startDate, endDate, owner: userId });
  await Member.create({ project: project._id, user: userId, role: 'manager' });
  return project;
}

/** UC08 – Chỉnh sửa thông tin dự án */
async function updateProject(projectId, data) {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound('Không tìm thấy dự án');

  const updates = {};
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw ApiError.badRequest('Tên dự án không được để trống');
    }
    if (data.name.trim().length > 200) {
      throw ApiError.badRequest('Tên dự án không được vượt quá 200 ký tự');
    }
    updates.name = data.name.trim();
  }
  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.length > 2000) {
      throw ApiError.badRequest('Mô tả không được vượt quá 2000 ký tự');
    }
    updates.description = data.description.trim();
  }
  if (data.status !== undefined) {
    if (!['active', 'completed', 'archived'].includes(data.status)) {
      throw ApiError.badRequest('Trạng thái dự án không hợp lệ');
    }
    updates.status = data.status;
  }

  const startDate = data.startDate === undefined ? project.startDate : data.startDate;
  const endDate = data.endDate === undefined ? project.endDate : data.endDate;
  if (data.startDate !== undefined) updates.startDate = data.startDate || null;
  if (data.endDate !== undefined) updates.endDate = data.endDate || null;

  const parsedStartDate = startDate ? new Date(startDate) : null;
  const parsedEndDate = endDate ? new Date(endDate) : null;
  if ((startDate && Number.isNaN(parsedStartDate.getTime()))
    || (endDate && Number.isNaN(parsedEndDate.getTime()))) {
    throw ApiError.badRequest('Ngày dự án không hợp lệ');
  }
  if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
    throw ApiError.badRequest('Ngày kết thúc phải sau ngày bắt đầu');
  }

  if (data.startDate !== undefined) updates.startDate = parsedStartDate;
  if (data.endDate !== undefined) updates.endDate = parsedEndDate;
  Object.assign(project, updates);
  return project.save();
}

/** UC09 – Xoá dự án cùng toàn bộ dữ liệu liên quan */
async function deleteProject(projectId, confirmName) {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound('Không tìm thấy dự án');
  if (confirmName !== project.name) {
    throw ApiError.badRequest('Tên xác nhận không khớp với tên dự án');
  }

  const tasks = await Task.find({ project: projectId }).select('_id');
  const taskIds = tasks.map((task) => task._id);
  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ project: projectId });
  await Member.deleteMany({ project: projectId });
  await Project.deleteOne({ _id: projectId });
}

/** UC10 – Mời thành viên vào dự án bằng email */
async function addMember(projectId, email, role = 'member') {
  if (typeof email !== 'string' || !email.trim()) {
    throw ApiError.badRequest('Email là bắt buộc');
  }
  if (!['member', 'manager'].includes(role)) {
    throw ApiError.badRequest('Vai trò thành viên không hợp lệ');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
  if (!user.isActive) throw ApiError.badRequest('Không thể mời tài khoản đã bị khoá');

  const existed = await Member.findOne({ project: projectId, user: user._id });
  if (existed) throw ApiError.conflict('Người dùng đã là thành viên của dự án');

  const member = await Member.create({ project: projectId, user: user._id, role });
  return member.populate('user', 'fullName email avatar');
}

/** UC11 – Loại bỏ thành viên khỏi dự án */
async function removeMember(projectId, userId) {
  const member = await Member.findOne({ project: projectId, user: userId });
  if (!member) throw ApiError.notFound('Không tìm thấy thành viên trong dự án');

  if (member.role === 'manager') {
    const managerCount = await Member.countDocuments({ project: projectId, role: 'manager' });
    if (managerCount === 1) {
      throw ApiError.badRequest('Không thể xoá quản trị dự án duy nhất');
    }
  }

  await Member.deleteOne({ _id: member._id });
  await Task.updateMany({ project: projectId, assignee: userId }, { $set: { assignee: null } });
}

async function listMembers(projectId) {
  return Member.find({ project: projectId }).populate('user', 'fullName email avatar').sort({ joinedAt: 1 });
}

async function getProject(projectId) {
  const p = await Project.findById(projectId).populate('owner', 'fullName email');
  if (!p) throw ApiError.notFound('Không tìm thấy dự án');
  return p;
}

module.exports = {
  listMyProjects, createProject, updateProject, deleteProject,
  addMember, removeMember, listMembers, getProject,
};
