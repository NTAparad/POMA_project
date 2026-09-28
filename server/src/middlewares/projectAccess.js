const Member = require('../models/Member');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Kiểm tra người dùng hiện tại có thuộc dự án hay không.
 * Gắn req.project và req.membership để các tầng sau dùng lại.
 * @param {'member'|'manager'} minRole vai trò tối thiểu yêu cầu
 */
function requireProjectRole(minRole = 'member') {
  return catchAsync(async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;

    const project = await Project.findById(projectId);
    if (!project) throw ApiError.notFound('Không tìm thấy dự án');

    const membership = await Member.findOne({ project: projectId, user: req.user._id });
    if (!membership) throw ApiError.forbidden('Bạn không phải thành viên của dự án này');

    if (minRole === 'manager' && membership.role !== 'manager') {
      throw ApiError.forbidden('Chỉ quản trị dự án mới được thực hiện thao tác này');
    }

    req.project = project;
    req.membership = membership;
    next();
  });
}

module.exports = { requireProjectRole };
