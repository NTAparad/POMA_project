const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password) throw ApiError.badRequest('Vui lòng nhập đầy đủ thông tin');
  if (password.length < 6) throw ApiError.badRequest('Mật khẩu phải có ít nhất 6 ký tự');
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw ApiError.badRequest('Xác nhận mật khẩu không khớp');
  }

  const user = await authService.register({ fullName, email, password });
  res.status(201).json({ success: true, message: 'Đăng ký thành công', data: user });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Vui lòng nhập email và mật khẩu');

  const data = await authService.login({ email, password });
  res.json({ success: true, message: 'Đăng nhập thành công', data });
});

const me = catchAsync(async (req, res) => {
  res.json({ success: true, data: authService.publicUser(req.user) });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw ApiError.badRequest('Vui lòng nhập đầy đủ thông tin');
  if (newPassword.length < 6) throw ApiError.badRequest('Mật khẩu mới phải có ít nhất 6 ký tự');

  await authService.changePassword(req.user._id, { currentPassword, newPassword });
  res.json({ success: true, message: 'Đổi mật khẩu thành công' });
});

const listUsers = catchAsync(async (req, res) => {
  const data = await authService.listUsers(req.query);
  res.json({ success: true, data });
});

const setUserStatus = catchAsync(async (req, res) => {
  const user = await authService.setUserStatus(req.user._id, req.params.id, req.body.isActive);
  res.json({ success: true, message: 'Cập nhật trạng thái tài khoản thành công', data: user });
});

module.exports = { register, login, me, changePassword, listUsers, setUserStatus };
