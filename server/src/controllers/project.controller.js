const projectService = require('../services/project.service');
const catchAsync = require('../utils/catchAsync');

/** MODULE DỰ ÁN — phụ trách: TV2 */

const list = catchAsync(async (req, res) => {
  const data = await projectService.listMyProjects(req.user._id, req.query);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await projectService.createProject(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Tạo dự án thành công', data });
});

const detail = catchAsync(async (req, res) => {
  const data = await projectService.getProject(req.params.id);
  res.json({ success: true, data: { ...data.toObject(), myRole: req.membership.role } });
});

const update = catchAsync(async (req, res) => {
  const data = await projectService.updateProject(req.params.id, req.body);
  res.json({ success: true, message: 'Cập nhật dự án thành công', data });
});

const remove = catchAsync(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.body.confirmName);
  res.json({ success: true, message: 'Xoá dự án thành công' });
});

const members = catchAsync(async (req, res) => {
  const data = await projectService.listMembers(req.params.id);
  res.json({ success: true, data });
});

const addMember = catchAsync(async (req, res) => {
  const data = await projectService.addMember(req.params.id, req.body.email, req.body.role);
  res.status(201).json({ success: true, message: 'Mời thành viên thành công', data });
});

const removeMember = catchAsync(async (req, res) => {
  await projectService.removeMember(req.params.id, req.params.uid);
  res.json({ success: true, message: 'Đã gỡ thành viên khỏi dự án' });
});

module.exports = { list, create, detail, update, remove, members, addMember, removeMember };
