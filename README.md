# Poma – Web Project Manager

Phần mềm quản lý dự án và công việc nhóm. Đồ án Thực tập tốt nghiệp.

Công nghệ: React (Vite) + Node.js/Express + MongoDB, chạy hoàn toàn trên máy cá nhân.

---

## 1. Cài đặt môi trường trên macOS

```bash
# Node.js 20
brew install nvm
nvm install 20 && nvm use 20

# MongoDB Community
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community    # khởi động, chạy nền

# Công cụ (tuỳ chọn)
brew install --cask mongodb-compass visual-studio-code postman
```

Kiểm tra MongoDB đã chạy: `brew services list` phải thấy `mongodb-community  started`.

## 2. Chạy dự án

Mở **2 cửa sổ Terminal**.

**Terminal 1 – máy chủ:**
```bash
cd server
cp .env.example .env
npm install
npm run seed      # tạo dữ liệu mẫu, chỉ chạy lần đầu
npm run dev       # http://localhost:5100
```

**Terminal 2 – giao diện:**
```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

Mở trình duyệt vào http://localhost:5173

## 3. Tài khoản mẫu

| Email | Mật khẩu | Vai trò |
|---|---|---|
| admin@poma.vn | 123456 | Quản trị hệ thống |
| anh@poma.vn | 123456 | Quản trị dự án (dự án mẫu) |
| oanh@poma.vn | 123456 | Thành viên |
| bach@poma.vn | 123456 | Thành viên |

## 4. Phân công module

Nhóm có 3 thành viên, chia theo khối lượng công việc thực tế:

| Thành viên | Phụ trách | Tệp chính |
|---|---|---|
| TV1 | Xác thực (UC01–05) + Bình luận (UC18–20) | `services/auth.service.js`, `services/comment.service.js`, `pages/auth/*`, khung bình luận trong `pages/task/TaskDetail.jsx` |
| TV2 | Dự án & thành viên (UC06–11) + Thống kê (UC21) | `services/project.service.js`, `services/stats.service.js`, `pages/projects/*`, `pages/stats/*` |
| TV3 | Công việc (UC12–17) | `services/task.service.js`, `controllers/task.controller.js`, `pages/board/*` |

Module Quản lý công việc tuy ít use case hơn nhưng phức tạp nhất (Kanban kéo thả, bộ lọc đa
tiêu chí, ràng buộc quyền theo vai trò) nên được giao trọn cho một người.

**Module Xác thực đã được cài đặt hoàn chỉnh làm mẫu tham chiếu.** Ba module còn lại đã có sẵn
khung tệp, định tuyến và chú thích `TODO` để mỗi người tự hoàn thiện phần của mình.

## 5. Quy ước làm việc nhóm

```bash
git checkout develop
git pull
git checkout -b feature/task-module     # nhánh riêng cho module của mình
# ... code ...
git add . && git commit -m "feat(task): them API tao cong viec"
git push -u origin feature/task-module
# Tạo Pull Request vào develop, nhờ một thành viên khác xem xét trước khi gộp
```

Quy ước đặt tên commit: `feat`, `fix`, `docs`, `refactor`, `test` kèm tên module.
