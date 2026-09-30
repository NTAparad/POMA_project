import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

/** MODULE DỰ ÁN — phụ trách: TV2 */
export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects', { params: filters });
      setProjects(data.data);
      setError('');
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const resetForm = () => setForm({ name: '', description: '', startDate: '', endDate: '' });

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
      status: project.status,
    });
  };

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', form);
      resetForm();
      setCreating(false);
      load();
    } catch (err) { setError(errMsg(err)); }
    finally { setSaving(false); }
  };

  const update = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${editing._id}`, form);
      setEditing(null);
      resetForm();
      load();
    } catch (err) { setError(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/projects/${deleting._id}`, { data: { confirmName: deleting.confirmName } });
      setDeleting(null);
      load();
    } catch (err) { setError(errMsg(err)); }
    finally { setSaving(false); }
  };

  const closeForm = () => { setCreating(false); setEditing(null); resetForm(); };

  const formTitle = editing ? 'Sửa dự án' : 'Tạo dự án';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dự án của tôi</h1>
        <button className="btn-primary" onClick={() => (creating ? closeForm() : setCreating(true))}>
          {creating ? 'Đóng' : 'Tạo dự án'}
        </button>
      </div>

      <div className="mt-4"><Alert>{error}</Alert></div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <input className="field" placeholder="Tìm theo tên dự án" value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <select className="field" value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang thực hiện</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
        <button className="btn-ghost" onClick={load} disabled={loading}>Tải lại</button>
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? update : create} className="card mt-4 space-y-4 p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">{formTitle}</h2>
            {editing && <button type="button" className="btn-ghost" onClick={closeForm}>Hủy</button>}
          </div>
          <div>
            <label className="label" htmlFor="pname">Tên dự án</label>
            <input id="pname" required maxLength={200} className="field" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pdesc">Mô tả</label>
            <textarea id="pdesc" rows={3} maxLength={2000} className="field" value={form.description}
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
          {editing && <div><label className="label" htmlFor="pstatus">Trạng thái</label>
            <select id="pstatus" className="field" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Đang thực hiện</option><option value="completed">Đã hoàn thành</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>}
          <div className="flex gap-2"><button className="btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo dự án'}
          </button>{!editing && <button type="button" className="btn-ghost" onClick={closeForm}>Hủy</button>}</div>
        </form>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <div key={p._id} className="card p-5 transition hover:border-ink-300">
            <Link to={`/du-an/${p._id}`}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold leading-snug">{p.name}</h2>
              <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-700">{p.status}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-500">{p.description || 'Chưa có mô tả.'}</p>
            </Link>
            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
              <span>{p.myRole === 'manager' ? 'Quản trị dự án' : 'Thành viên'}</span>
              {p.myRole === 'manager' && <div className="flex gap-2"><button className="btn-ghost px-2.5 py-1" onClick={() => openEdit(p)}>Sửa</button>
                <button className="btn-danger px-2.5 py-1" onClick={() => setDeleting({ ...p, confirmName: '' })}>Xóa</button></div>}
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="mt-6 text-sm text-ink-500">Đang tải danh sách dự án…</p>}
      {!loading && projects.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-medium">Chưa có dự án nào</p>
          <p className="mt-1 text-sm text-ink-500">Tạo dự án đầu tiên để bắt đầu giao việc cho nhóm.</p>
        </div>
      )}

      {deleting && <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/40 px-4">
        <div className="card w-full max-w-md p-6"><h2 className="text-lg font-semibold">Xóa dự án?</h2>
          <p className="mt-2 text-sm text-ink-500">Toàn bộ công việc, bình luận và thành viên sẽ bị xóa. Nhập chính xác tên dự án để xác nhận.</p>
          <input className="field mt-4" value={deleting.confirmName} onChange={(e) => setDeleting({ ...deleting, confirmName: e.target.value })} />
          <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setDeleting(null)}>Hủy</button>
            <button className="btn-danger" disabled={saving || deleting.confirmName !== deleting.name} onClick={remove}>Xác nhận xóa</button></div>
        </div>
      </div>}
    </div>
  );
}
