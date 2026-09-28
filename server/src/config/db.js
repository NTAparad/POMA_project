const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Thiếu biến môi trường MONGODB_URI');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('Đã kết nối MongoDB:', mongoose.connection.name);
}

module.exports = { connectDB };
