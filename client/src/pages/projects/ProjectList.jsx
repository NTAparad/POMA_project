import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

/** MODULE DỰ ÁN — phụ trách: TV2 */
export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' });

  const load = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '', startDate: '', endDate: '' });
      setCreating(false);
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dự án của tôi</h1>
        <button className="btn-primary" onClick={() => setCreating(!creating)}>
          {creating ? 'Đóng' : 'Tạo dự án'}
        </button>
      </div>

      <div className="mt-4"><Alert>{error}</Alert></div>

      {creating && (
        <form onSubmit={create} className="card mt-4 space-y-4 p-5">
          <div>
            <label className="label" htmlFor="pname">Tên dự án</label>
            <input id="pname" required className="field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pdesc">Mô tả</label>
            <textarea id="pdesc" rows={3} className="field" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="sd">Ngày bắt đầu</label>
              <input id="sd" type="date" className="field" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="ed">Ngày kết thúc</label>
              <input id="ed" type="date" className="field" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary">Tạo dự án</button>
        </form>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p._id} to={`/du-an/${p._id}`} className="card p-5 transition hover:border-ink-300">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold leading-snug">{p.name}</h2>
              {p.myRole === 'manager' && (
                <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-700">
                  quản trị
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-500">{p.description || 'Chưa có mô tả.'}</p>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-medium">Chưa có dự án nào</p>
          <p className="mt-1 text-sm text-ink-500">Tạo dự án đầu tiên để bắt đầu giao việc cho nhóm.</p>
        </div>
      )}
    </div>
  );
}
