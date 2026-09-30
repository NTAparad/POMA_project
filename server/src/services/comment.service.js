const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Member = require('../models/Member');
const ApiError = require('../utils/ApiError');

/**
 * MODULE BÌNH LUẬN — phụ trách: TV1
 */

/**
 * Kiểm tra task tồn tại và user có thuộc project của task hay không.
 */
async function checkTaskMembership(taskId, userId) {
  const task = await Task.findById(taskId).select('project');

  if (!task) {
    throw ApiError.notFound('Không tìm thấy công việc');
  }

  const membership = await Member.findOne({
    project: task.project,
    user: userId,
  });

  if (!membership) {
    throw ApiError.forbidden('Bạn không phải thành viên của dự án này');
  }

  return task;
}

/**
 * Validate nội dung bình luận.
 */
function validateContent(content) {
  if (typeof content !== 'string') {
    throw ApiError.badRequest('Nội dung bình luận là bắt buộc');
  }

  const trimmed = content.trim();

  if (!trimmed) {
    throw ApiError.badRequest('Nội dung bình luận không được để trống');
  }

  if (trimmed.length > 1000) {
    throw ApiError.badRequest('Nội dung bình luận không được vượt quá 1000 ký tự');
  }

  return trimmed;
}

/**
 * UC18 – Danh sách bình luận của một công việc
 */
async function listComments(taskId, userId) {
  await checkTaskMembership(taskId, userId);

  return Comment.find({ task: taskId })
    .populate('author', 'fullName email avatar')
    .sort({ createdAt: 1 });
}

/**
 * UC19 – Thêm bình luận
 */
async function addComment(taskId, userId, content) {
  await checkTaskMembership(taskId, userId);

  const trimmedContent = validateContent(content);

  const comment = await Comment.create({
    task: taskId,
    author: userId,
    content: trimmedContent,
    isEdited: false,
  });

  return comment.populate('author', 'fullName email avatar');
}

/**
 * UC20 – Sửa bình luận, chỉ tác giả được sửa
 */
async function updateComment(commentId, userId, content) {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw ApiError.notFound('Không tìm thấy bình luận');
  }

  if (String(comment.author) !== String(userId)) {
    throw ApiError.forbidden('Chỉ tác giả bình luận mới được sửa');
  }

  const trimmedContent = validateContent(content);

  comment.content = trimmedContent;
  comment.isEdited = true;

  await comment.save();

  return comment.populate('author', 'fullName email avatar');
}

/**
 * UC20 – Xoá bình luận, tác giả hoặc quản trị dự án được xoá
 */
async function deleteComment(commentId, userId, isManager) {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw ApiError.notFound('Không tìm thấy bình luận');
  }

  const isAuthor = String(comment.author) === String(userId);

  if (!isAuthor && !isManager) {
    throw ApiError.forbidden('Bạn không có quyền xoá bình luận này');
  }

  await Comment.deleteOne({ _id: commentId });
}

module.exports = {
  listComments,
  addComment,
  updateComment,
  deleteComment,
};