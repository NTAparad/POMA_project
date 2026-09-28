import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form.email, form.password);
      nav('/du-an');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-mono text-lg font-bold">poma</Link>
        <h1 className="mt-6 text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-ink-500">Nhập email và mật khẩu để tiếp tục.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Alert>{error}</Alert>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="field" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@example.com" />
          </div>

          <div>
            <label className="label" htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" required className="field" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-5 text-sm text-ink-500">
          Chưa có tài khoản? <Link to="/dang-ky" className="font-medium text-ink-900 underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
