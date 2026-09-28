/** Lỗi nghiệp vụ có kèm mã trạng thái HTTP. */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
  static badRequest(msg) { return new ApiError(400, msg); }
  static unauthorized(msg = 'Bạn cần đăng nhập để thực hiện thao tác này') { return new ApiError(401, msg); }
  static forbidden(msg = 'Bạn không có quyền thực hiện thao tác này') { return new ApiError(403, msg); }
  static notFound(msg = 'Không tìm thấy dữ liệu') { return new ApiError(404, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
}

module.exports = ApiError;
