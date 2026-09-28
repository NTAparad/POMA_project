import { useEffect, useState } from 'react';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

export default function Users() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');

  const load = async (kw = '') => {
    try {
      const { data } = await api.get('/users', { params: { keyword: kw } });
      setData(data.data);
      setError('');
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (u) => {
    try {
      await api.patch(`/users/${u.id}/status`, { isActive: !u.isActive });
      load(keyword);
    } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Tài khoản người dùng</h1>
      <p className="mt-1 text-sm text-ink-500">Tổng {data.total} tài khoản.</p>

      <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); load(keyword); }}>
        <input className="field max-w-xs" placeholder="Tìm theo tên hoặc email"
          value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button className="btn-ghost">Tìm</button>
      </form>

      <div className="mt-4"><Alert>{error}</Alert></div>

      <div className="card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Họ và tên</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">{u.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{u.email}</td>
                <td className="px-4 py-3">{u.role === 'admin' ? 'Quản trị hệ thống' : 'Người dùng'}</td>
                <td className="px-4 py-3">
                  <span className={u.isActive ? 'text-done' : 'text-signal'}>
                    {u.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggle(u)} className="btn-ghost">
                    {u.isActive ? 'Khoá' : 'Mở khoá'}
                  </button>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-500">Không có tài khoản nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
