/** Bọc controller bất đồng bộ để lỗi được chuyển tới middleware xử lý lỗi. */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
