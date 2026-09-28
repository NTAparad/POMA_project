const commentService = require('../services/comment.service');
const statsService = require('../services/stats.service');
const catchAsync = require('../utils/catchAsync');

/** MODULE BÌNH LUẬN (TV1) VÀ THỐNG KÊ (TV2) */

const list = catchAsync(async (req, res) => {
  const data = await commentService.listComments(req.params.id);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await commentService.addComment(req.params.id, req.user._id, req.body.content);
  res.status(201).json({ success: true, message: 'Đã gửi bình luận', data });
});

const update = catchAsync(async (req, res) => {
  const data = await commentService.updateComment(req.params.id, req.user._id, req.body.content);
  res.json({ success: true, message: 'Đã cập nhật bình luận', data });
});

const remove = catchAsync(async (req, res) => {
  const isManager = req.membership?.role === 'manager';
  await commentService.deleteComment(req.params.id, req.user._id, isManager);
  res.json({ success: true, message: 'Đã xoá bình luận' });
});

const stats = catchAsync(async (req, res) => {
  const data = await statsService.getProjectStats(req.params.id);
  res.json({ success: true, data });
});

module.exports = { list, create, update, remove, stats };
