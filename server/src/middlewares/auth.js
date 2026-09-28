const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/** Giải mã token, gắn người dùng hiện tại vào req.user. */
const requireAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw ApiError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Tài khoản không còn tồn tại');
  if (!user.isActive) throw ApiError.forbidden('Tài khoản đã bị khoá, vui lòng liên hệ quản trị viên');

  req.user = user;
  next();
});

/** Chỉ cho phép quản trị hệ thống. */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(ApiError.forbidden());
  next();
};

module.exports = { requireAuth, requireAdmin };
