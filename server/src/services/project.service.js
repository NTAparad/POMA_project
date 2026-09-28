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
  if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
    throw ApiError.badRequest('Ngày kết thúc phải sau ngày bắt đầu');
  }

  const project = await Project.create({ ...data, owner: userId });
  await Member.create({ project: project._id, user: userId, role: 'manager' });
  return project;
}

/** UC08 – Chỉnh sửa thông tin dự án */
async function updateProject(projectId, data) {
  // TODO (TV2): kiểm tra ràng buộc ngày, cập nhật và trả về dự án sau khi sửa
  throw ApiError.badRequest('Chức năng chỉnh sửa dự án chưa được cài đặt');
}

/** UC09 – Xoá dự án cùng toàn bộ dữ liệu liên quan */
async function deleteProject(projectId, confirmName) {
  // TODO (TV2):
  // 1. So khớp confirmName với tên dự án, lệch thì báo lỗi 400
  // 2. Lấy danh sách task của dự án, xoá Comment thuộc các task đó
  // 3. Xoá Task, Member rồi xoá Project
  throw ApiError.badRequest('Chức năng xoá dự án chưa được cài đặt');
}

/** UC10 – Mời thành viên vào dự án bằng email */
async function addMember(projectId, email, role = 'member') {
  // TODO (TV2):
  // 1. Tìm User theo email, không có thì báo 404 "Không tìm thấy người dùng"
  // 2. Kiểm tra đã là thành viên chưa, rồi thì báo 409
  // 3. Tạo bản ghi Member và trả về thông tin thành viên
  throw ApiError.badRequest('Chức năng mời thành viên chưa được cài đặt');
}

/** UC11 – Loại bỏ thành viên khỏi dự án */
async function removeMember(projectId, userId) {
  // TODO (TV2):
  // 1. Nếu người bị gỡ là quản trị dự án duy nhất thì từ chối
  // 2. Xoá bản ghi Member
  // 3. Gỡ gán các task đang giao cho người đó (assignee = null)
  throw ApiError.badRequest('Chức năng loại bỏ thành viên chưa được cài đặt');
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
