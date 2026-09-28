import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) return setError('Xác nhận mật khẩu không khớp');
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');

    setBusy(true);
    try {
      await api.post('/auth/register', form);
      nav('/dang-nhap');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-mono text-lg font-bold">poma</Link>
        <h1 className="mt-6 text-2xl font-bold">Tạo tài khoản</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Alert>{error}</Alert>

          <div>
            <label className="label" htmlFor="fullName">Họ và tên</label>
            <input id="fullName" required className="field" value={form.fullName} onChange={set('fullName')} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="field" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" required minLength={6} className="field"
              value={form.password} onChange={set('password')} />
            <p className="mt-1 text-xs text-ink-500">Tối thiểu 6 ký tự.</p>
          </div>
          <div>
            <label className="label" htmlFor="confirm">Xác nhận mật khẩu</label>
            <input id="confirm" type="password" required className="field"
              value={form.confirmPassword} onChange={set('confirmPassword')} />
          </div>

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Đang tạo tài khoản…' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-sm text-ink-500">
          Đã có tài khoản? <Link to="/dang-nhap" className="font-medium text-ink-900 underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
