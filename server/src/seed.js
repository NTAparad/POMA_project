/**
 * Tạo dữ liệu mẫu cho môi trường phát triển.
 * Chạy: npm run seed
 * Cảnh báo: script xoá sạch dữ liệu cũ trong cơ sở dữ liệu trước khi tạo mới.
 */
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Member = require('./models/Member');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

const days = (n) => new Date(Date.now() + n * 86400000);

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Project.deleteMany({}),
    Member.deleteMany({}), Task.deleteMany({}), Comment.deleteMany({}),
  ]);

  const [admin, an, binh, cuong] = await User.create([
    { fullName: 'Quản trị hệ thống', email: 'admin@poma.vn', password: '123456', role: 'admin' },
    { fullName: 'Nguyễn Tấn Anh', email: 'anh@poma.vn', password: '123456' },
    { fullName: 'Nguyễn Thị Kim Oanh', email: 'oanh@poma.vn', password: '123456' },
    { fullName: 'Nguyễn Việt Bách', email: 'bach@poma.vn', password: '123456' },
  ]);

  const project = await Project.create({
    name: 'Xây dựng website giới thiệu khoa',
    description: 'Dự án mẫu dùng để thử nghiệm các chức năng của hệ thống Poma.',
    owner: an._id, startDate: days(-14), endDate: days(30),
  });

  await Member.create([
    { project: project._id, user: an._id, role: 'manager' },
    { project: project._id, user: binh._id, role: 'member' },
    { project: project._id, user: cuong._id, role: 'member' },
  ]);

  const tasks = await Task.create([
    { project: project._id, title: 'Khảo sát yêu cầu người dùng', status: 'done', priority: 'high',
      assignee: binh._id, createdBy: an._id, dueDate: days(-7), order: 0 },
    { project: project._id, title: 'Thiết kế giao diện trang chủ', status: 'done', priority: 'medium',
      assignee: cuong._id, createdBy: an._id, dueDate: days(-3), order: 1 },
    { project: project._id, title: 'Dựng cấu trúc cơ sở dữ liệu', status: 'review', priority: 'high',
      assignee: binh._id, createdBy: an._id, dueDate: days(2), order: 0 },
    { project: project._id, title: 'Lập trình chức năng tin tức', status: 'in_progress', priority: 'medium',
      assignee: cuong._id, createdBy: an._id, dueDate: days(5), order: 0 },
    { project: project._id, title: 'Viết tài liệu hướng dẫn sử dụng', status: 'todo', priority: 'low',
      assignee: null, createdBy: an._id, dueDate: days(12), order: 0 },
    { project: project._id, title: 'Kiểm thử trên trình duyệt di động', status: 'todo', priority: 'medium',
      assignee: binh._id, createdBy: an._id, dueDate: days(-1), order: 1 },
  ]);

  await Comment.create([
    { task: tasks[2]._id, author: an._id, content: 'Bảng người dùng nhớ thêm trường trạng thái hoạt động nhé.' },
    { task: tasks[2]._id, author: binh._id, content: 'Đã bổ sung rồi, anh xem lại giúp em phần khoá ngoại.' },
    { task: tasks[3]._id, author: cuong._id, content: 'Phần phân trang em làm xong, còn bộ lọc theo chuyên mục.' },
  ]);

  console.log('Đã tạo dữ liệu mẫu.');
  console.log('Đăng nhập thử: anh@poma.vn / 123456');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
