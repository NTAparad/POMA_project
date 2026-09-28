import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <span className="font-mono text-lg font-bold">poma</span>
        <div className="flex gap-2">
          <Link to="/dang-nhap" className="btn-ghost">Đăng nhập</Link>
          <Link to="/dang-ky" className="btn-primary">Đăng ký</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <p className="font-mono text-sm uppercase tracking-widest text-signal">Quản lý dự án nhóm</p>
        <h1 className="mt-4 max-w-2xl text-5xl font-bold leading-tight tracking-tight">
          Mọi công việc của nhóm, trên một bảng duy nhất.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-500">
          Tạo dự án, giao việc cho từng người, theo dõi tiến độ theo bốn cột trạng thái.
          Trao đổi ngay trong công việc thay vì tìm lại trong nhóm chat.
        </p>
        <Link to="/dang-ky" className="btn-primary mt-8 px-6 py-3">Bắt đầu miễn phí</Link>

        <div className="mt-16 grid gap-4 sm:grid-cols-4">
          {[
            ['Cần làm', 'bg-todo', 'Công việc vừa được giao'],
            ['Đang làm', 'bg-doing', 'Đang triển khai'],
            ['Chờ duyệt', 'bg-review', 'Chờ quản trị kiểm tra'],
            ['Hoàn thành', 'bg-done', 'Đã được xác nhận'],
          ].map(([name, color, desc]) => (
            <div key={name} className="card p-4">
              <div className={`h-1 w-10 rounded-full ${color}`} />
              <p className="mt-3 font-semibold">{name}</p>
              <p className="mt-1 text-sm text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
