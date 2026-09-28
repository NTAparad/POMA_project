import { useState } from 'react';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (form.newPassword !== form.confirm) {
      return setMsg({ type: 'error', text: 'Xác nhận mật khẩu không khớp' });
    }

    setBusy(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword, newPassword: form.newPassword,
      });
      setMsg({ type: 'success', text: 'Đã đổi mật khẩu' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Alert type={msg.type || 'error'}>{msg.text}</Alert>

        <div>
          <label className="label" htmlFor="cur">Mật khẩu hiện tại</label>
          <input id="cur" type="password" required className="field"
            value={form.currentPassword} onChange={set('currentPassword')} />
        </div>
        <div>
          <label className="label" htmlFor="new">Mật khẩu mới</label>
          <input id="new" type="password" required minLength={6} className="field"
            value={form.newPassword} onChange={set('newPassword')} />
        </div>
        <div>
          <label className="label" htmlFor="cf">Xác nhận mật khẩu mới</label>
          <input id="cf" type="password" required className="field" value={form.confirm} onChange={set('confirm')} />
        </div>

        <button className="btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
      </form>
    </div>
  );
}
