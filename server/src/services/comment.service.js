const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/**
 * MODULE BÌNH LUẬN — phụ trách: TV1
 */

/** UC18 – Danh sách bình luận của một công việc */
async function listComments(taskId) {
  return Comment.find({ task: taskId })
    .populate('author', 'fullName email avatar')
    .sort({ createdAt: 1 });
}

/** UC19 – Thêm bình luận */
async function addComment(taskId, userId, content) {
  // TODO (TV1):
  // 1. Kiểm tra content không rỗng sau khi trim, quá 1000 ký tự thì báo lỗi
  // 2. Tạo Comment với task, author
  // 3. Trả về comment đã populate author
  throw ApiError.badRequest('Chức năng thêm bình luận chưa được cài đặt');
}

/** UC20 – Sửa bình luận, chỉ tác giả được sửa */
async function updateComment(commentId, userId, content) {
  // TODO (TV1): kiểm tra quyền tác giả, cập nhật content và đặt isEdited = true
  throw ApiError.badRequest('Chức năng sửa bình luận chưa được cài đặt');
}

/** UC20 – Xoá bình luận, tác giả hoặc quản trị dự án được xoá */
async function deleteComment(commentId, userId, isManager) {
  // TODO (TV1): kiểm tra quyền rồi xoá
  throw ApiError.badRequest('Chức năng xoá bình luận chưa được cài đặt');
}

module.exports = { listComments, addComment, updateComment, deleteComment };
