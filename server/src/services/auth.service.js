const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

function signToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

function publicUser(u) {
  return { id: u._id, fullName: u.fullName, email: u.email, avatar: u.avatar, role: u.role, isActive: u.isActive };
}

/** UC01 – Đăng ký tài khoản */
async function register({ fullName, email, password }) {
  const existed = await User.findOne({ email: email.toLowerCase() });
  if (existed) throw ApiError.conflict('Email đã được sử dụng');

  const user = await User.create({ fullName, email, password });
  return publicUser(user);
}

/** UC02 – Đăng nhập hệ thống */
async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Thông báo lỗi chung, không nêu rõ sai ở email hay mật khẩu
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('Tài khoản đã bị khoá, vui lòng liên hệ quản trị viên');
  }

  return { token: signToken(user), user: publicUser(user) };
}

/** UC04 – Đổi mật khẩu */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('Không tìm thấy tài khoản');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Mật khẩu hiện tại không chính xác');
  }
  if (currentPassword === newPassword) {
    throw ApiError.badRequest('Mật khẩu mới phải khác mật khẩu hiện tại');
  }

  user.password = newPassword;
  await user.save();
}

/** UC05 – Quản lý tài khoản người dùng */
async function listUsers({ keyword = '', page = 1, limit = 20 }) {
  const filter = keyword
    ? { $or: [{ fullName: new RegExp(keyword, 'i') }, { email: new RegExp(keyword, 'i') }] }
    : {};

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  return { items: items.map(publicUser), total, page: Number(page), limit: Number(limit) };
}

async function setUserStatus(actorId, targetId, isActive) {
  if (String(actorId) === String(targetId)) {
    throw ApiError.badRequest('Không thể tự thay đổi trạng thái tài khoản của chính mình');
  }
  const user = await User.findByIdAndUpdate(targetId, { isActive }, { new: true });
  if (!user) throw ApiError.notFound('Không tìm thấy tài khoản');
  return publicUser(user);
}

module.exports = { register, login, changePassword, listUsers, setUserStatus, publicUser };
