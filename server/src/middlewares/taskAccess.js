const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Member = require('../models/Member');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

async function loadMembership(projectId, userId, minRole) {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound('Không tìm thấy dự án');

  const membership = await Member.findOne({ project: projectId, user: userId });
  if (!membership) throw ApiError.forbidden('Bạn không phải thành viên của dự án này');

  if (minRole === 'manager' && membership.role !== 'manager') {
    throw ApiError.forbidden('Chỉ quản trị dự án mới được thực hiện thao tác này');
  }
  return { project, membership };
}

/** Xác định dự án từ :id của công việc rồi kiểm tra quyền. */
function attachTaskProject(minRole = 'member') {
  return catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw ApiError.notFound('Không tìm thấy công việc');

    const { project, membership } = await loadMembership(task.project, req.user._id, minRole);
    req.task = task;
    req.project = project;
    req.membership = membership;
    next();
  });
}

/** Xác định dự án từ :id của bình luận rồi kiểm tra quyền. */
function attachCommentProject(minRole = 'member') {
  return catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw ApiError.notFound('Không tìm thấy bình luận');

    const task = await Task.findById(comment.task);
    if (!task) throw ApiError.notFound('Không tìm thấy công việc');

    const { project, membership } = await loadMembership(task.project, req.user._id, minRole);
    req.comment = comment;
    req.project = project;
    req.membership = membership;
    next();
  });
}

module.exports = { attachTaskProject, attachCommentProject };
