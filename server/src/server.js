require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Máy chủ Poma đang chạy tại http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Không kết nối được cơ sở dữ liệu:', err.message);
    console.error('Kiểm tra MongoDB đã chạy chưa: brew services list');
    process.exit(1);
  });
