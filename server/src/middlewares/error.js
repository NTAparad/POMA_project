const ApiError = require('../utils/ApiError');

/** Đường dẫn không tồn tại. */
function notFound(req, res, next) {
  next(ApiError.notFound(`Không tìm thấy đường dẫn ${req.originalUrl}`));
}

/** Xử lý lỗi tập trung, trả về cùng một cấu trúc phản hồi. */
function errorHandler(err, req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Định danh không hợp lệ';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống';
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
