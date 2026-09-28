import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/dang-nhap'); };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100'
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link to="/du-an" className="font-mono text-lg font-bold tracking-tight">poma</Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/du-an" className={linkClass}>Dự án</NavLink>
            {user?.role === 'admin' && <NavLink to="/quan-tri" className={linkClass}>Tài khoản</NavLink>}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:block">{user?.fullName}</span>
            <Link to="/doi-mat-khau" className="btn-ghost">Đổi mật khẩu</Link>
            <button onClick={handleLogout} className="btn-ghost">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
