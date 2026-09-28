import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';
import TaskForm from './TaskForm';

/**
 * MODULE CÔNG VIỆC — phụ trách: TV3
 *
 * Đã có: tải bảng bốn cột, tạo công việc và giao cho thành viên.
 * TODO: kéo thả đổi trạng thái, thanh bộ lọc nâng cao.
 */

const COLUMNS = [
  { key: 'todo', label: 'Cần làm', color: 'bg-todo' },
  { key: 'in_progress', label: 'Đang làm', color: 'bg-doing' },
  { key: 'review', label: 'Chờ duyệt', color: 'bg-review' },
  { key: 'done', label: 'Hoàn thành', color: 'bg-done' },
];

const PRIORITY_LABEL = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };

export default function Board() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [p, t, m] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(p.data.data);
      setTasks(t.data.data);
      setMembers(m.data.data);
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { load(); }, [id]);

  /** Giao việc: gửi công việc mới lên máy chủ rồi nạp lại bảng. */
  const createTask = async (data) => {
    setBusy(true); setError('');
    try {
      await api.post(`/projects/${id}/tasks`, data);
      setShowForm(false);
      await load();
    } catch (e) { setError(errMsg(e)); }
    finally { setBusy(false); }
  };

  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project?.name || 'Đang tải…'}</h1>
          {project?.description && <p className="mt-1 text-sm text-ink-500">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/du-an/${id}/thanh-vien`} className="btn-ghost">Thành viên</Link>
          <Link to={`/du-an/${id}/thong-ke`} className="btn-ghost">Thống kê</Link>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Thêm công việc</button>
        </div>
      </div>

      <div className="mt-4"><Alert>{error}</Alert></div>

      {showForm && (
        <TaskForm members={members} busy={busy}
          onSubmit={createTask} onCancel={() => setShowForm(false)} />
      )}

      {/* TODO (TV3): thanh bộ lọc theo người thực hiện, độ ưu tiên, quá hạn */}

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <section key={col.key} className="rounded-xl bg-white/60 p-3">
              <header className="flex items-center gap-2 px-1 pb-3">
                <span className={`h-2 w-2 rounded-full ${col.color}`} />
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <span className="font-mono text-xs text-ink-300">{items.length}</span>
              </header>

              <div className="space-y-2">
                {items.map((t) => (
                  <Link key={t._id} to={`/cong-viec/${t._id}`}
                    className="card block p-3 transition hover:border-ink-300">
                    <p className="text-sm font-medium leading-snug">{t.title}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-ink-500">
                        {t.assignee?.fullName || 'Chưa giao'}
                      </span>
                      <span className={`font-mono text-[10px] uppercase ${
                        t.priority === 'high' ? 'text-signal' : 'text-ink-300'}`}>
                        {PRIORITY_LABEL[t.priority]}
                      </span>
                    </div>

                    {t.dueDate && (
                      <p className={`mt-1.5 font-mono text-[11px] ${isOverdue(t) ? 'text-signal' : 'text-ink-300'}`}>
                        {isOverdue(t) ? 'Quá hạn ' : 'Hạn '}
                        {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </Link>
                ))}

                {items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-ink-300">Chưa có công việc</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
