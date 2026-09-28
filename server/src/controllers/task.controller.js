const taskService = require('../services/task.service');
const catchAsync = require('../utils/catchAsync');

/** MODULE CÔNG VIỆC — phụ trách: TV3 */

const list = catchAsync(async (req, res) => {
  const data = await taskService.listTasks(req.params.projectId, req.query);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await taskService.createTask(req.params.projectId, req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Tạo công việc thành công', data });
});

const detail = catchAsync(async (req, res) => {
  const data = await taskService.getTask(req.params.id);
  res.json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await taskService.updateTask(req.params.id, req.body);
  res.json({ success: true, message: 'Cập nhật công việc thành công', data });
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await taskService.updateStatus(
    req.params.id, req.user, req.membership, req.body.status, req.body.order,
  );
  res.json({ success: true, message: 'Cập nhật trạng thái thành công', data });
});

const remove = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ success: true, message: 'Xoá công việc thành công' });
});

module.exports = { list, create, detail, update, updateStatus, remove };
