import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';
import { useAuth } from '../../store/auth';

/** MODULE DỰ ÁN — phụ trách: TV2. TODO: mời và gỡ thành viên. */
export default function Members() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'member' });
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [membersResponse, projectResponse] = await Promise.all([
        api.get(`/projects/${id}/members`),
        api.get(`/projects/${id}`),
      ]);
      setMembers(membersResponse.data.data);
      setProject(projectResponse.data.data);
      setError('');
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const invite = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post(`/projects/${id}/members`, form); setForm({ email: '', role: 'member' }); load(); }
    catch (e) { setError(errMsg(e)); }
    finally { setSaving(false); }
  };

  const remove = async (member) => {
    if (!window.confirm(`Gỡ ${member.user?.fullName} khỏi dự án?`)) return;
    setSaving(true);
    try { await api.delete(`/projects/${id}/members/${member.user._id}`); load(); }
    catch (e) { setError(errMsg(e)); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Thành viên dự án</h1>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {project?.myRole === 'manager' && <form onSubmit={invite} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <div><label className="label" htmlFor="member-email">Email thành viên</label>
          <input id="member-email" type="email" required className="field" placeholder="ten@poma.vn" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="member-role">Vai trò</label>
          <select id="member-role" className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="member">Thành viên</option><option value="manager">Quản trị dự án</option>
          </select></div>
        <button className="btn-primary" disabled={saving || !form.email.trim()}>Mời thành viên</button>
      </form>}

      <div className="card mt-6 overflow-hidden">
        {loading ? <p className="p-6 text-sm text-ink-500">Đang tải thành viên…</p> : <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Họ và tên</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">{m.user?.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{m.user?.email}</td>
                <td className="px-4 py-3">{m.role === 'manager' ? 'Quản trị dự án' : 'Thành viên'}</td>
                <td className="px-4 py-3 text-right">
                  {project?.myRole === 'manager' && m.user?._id !== user?._id && <button className="btn-danger px-2.5 py-1 text-xs" disabled={saving} onClick={() => remove(m)}>Gỡ khỏi dự án</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
