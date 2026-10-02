import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';
import { useAuth } from '../../store/auth';
import TaskForm from './TaskForm';

/**
 * MODULE CÔNG VIỆC — phụ trách: TV3
 *
 * Bảng Kanban bốn cột, hỗ trợ kéo thả đổi trạng thái và lọc công việc.
 * Bộ lọc được gửi lên máy chủ chứ không lọc tại trình duyệt, để kiểm tra đúng API.
 */

const COLUMNS = [
  { key: 'todo', label: 'Cần làm', color: 'bg-todo' },
  { key: 'in_progress', label: 'Đang làm', color: 'bg-doing' },
  { key: 'review', label: 'Chờ duyệt', color: 'bg-review' },
  { key: 'done', label: 'Hoàn thành', color: 'bg-done' },
];

const PRIORITY_LABEL = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };

const EMPTY_FILTERS = { keyword: '', assignee: '', priority: '', status: '', overdue: false };

/** Lấy định danh người dùng, chấp nhận cả dạng _id lẫn id. */
const uid = (u) => String(u?._id || u?.id || '');

const byOrder = (a, b) => {
  const diff = (Number(a.order) || 0) - (Number(b.order) || 0);
  if (diff !== 0) return diff;
  return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
};

/**
 * Tính thứ tự mới cho công việc được thả vào giữa hai thẻ.
 * Dùng giá trị trung bình để chỉ phải cập nhật đúng một công việc,
 * tránh phải sửa thứ tự của những công việc do người khác phụ trách.
 */
function computeOrder(prev, next) {
  const p = prev ? Number(prev.order) || 0 : null;
  const n = next ? Number(next.order) || 0 : null;

  if (p === null && n === null) return 0;
  if (p === null) return n > 0 ? n / 2 : 0;
  if (n === null) return p + 1;
  if (n > p) return (p + n) / 2;
  return p + 1;
}

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busy, setBusy] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [dragTask, setDragTask] = useState(null);
  const [dropHint, setDropHint] = useState(null);

  const isManager = project?.myRole === 'manager';
  const filterActive = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS),
    [filters],
  );

  /** Thành viên chỉ được kéo công việc của mình, quản trị dự án kéo được mọi công việc. */
  const canDrag = useCallback(
    (t) => isManager || (t.assignee && uid(t.assignee) === uid(currentUser)),
    [isManager, currentUser],
  );

  // ----- Nạp dữ liệu -----
  const loadMeta = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(p.data.data);
      setMembers(m.data.data);
    } catch (e) { setError(errMsg(e)); }
  }, [id]);

  const loadTasks = useCallback(async (f = filters) => {
    const params = {};
    if (f.keyword.trim()) params.keyword = f.keyword.trim();
    if (f.assignee) params.assignee = f.assignee;
    if (f.priority) params.priority = f.priority;
    if (f.status) params.status = f.status;
    if (f.overdue) params.overdue = 'true';

    try {
      const { data } = await api.get(`/projects/${id}/tasks`, { params });
      setTasks(data.data);
      setError('');
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, [id, filters]);

  useEffect(() => { loadMeta(); }, [loadMeta]);

  // Chờ 350ms sau lần gõ cuối rồi mới gọi API, tránh gọi liên tục khi đang nhập
  const firstRun = useRef(true);
  useEffect(() => {
    const delay = firstRun.current ? 0 : 350;
    firstRun.current = false;
    const timer = setTimeout(() => loadTasks(filters), delay);
    return () => clearTimeout(timer);
  }, [filters, loadTasks]);

  // ----- Tạo, sửa, xoá công việc -----
  const submitTask = async (data) => {
    setBusy(true); setError('');
    try {
      if (editingTask) await api.put(`/tasks/${editingTask._id}`, data);
      else await api.post(`/projects/${id}/tasks`, data);

      setShowForm(false);
      setEditingTask(null);
      await loadTasks(filters);
    } catch (e) { setError(errMsg(e)); }
    finally { setBusy(false); }
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Xoá công việc "${task.title}"? Mọi bình luận trong công việc cũng bị xoá.`)) return;

    setError('');
    try {
      await api.delete(`/tasks/${task._id}`);
      await loadTasks(filters);
    } catch (e) { setError(errMsg(e)); }
  };

  // ----- Kéo thả -----
  const handleDragStart = (e, task) => {
    if (!canDrag(task)) { e.preventDefault(); return; }
    setDragTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox chỉ bắt đầu kéo khi dataTransfer có dữ liệu
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDragEnd = () => { setDragTask(null); setDropHint(null); };

  /** Chỉ cập nhật khi vị trí thả thực sự đổi, tránh vẽ lại liên tục lúc rê chuột. */
  const showDropHint = useCallback((status, index) => {
    setDropHint((prev) => (
      prev && prev.status === status && prev.index === index ? prev : { status, index }
    ));
  }, []);

  const handleDrop = async (status, index) => {
    const task = dragTask;
    setDragTask(null);
    setDropHint(null);
    if (!task) return;

    if (!canDrag(task)) {
      setError('Bạn chỉ được đổi trạng thái công việc được giao cho mình');
      return;
    }

    const column = tasks
      .filter((t) => t.status === status && t._id !== task._id)
      .sort(byOrder);

    const at = index === null || index === undefined
      ? column.length
      : Math.max(0, Math.min(index, column.length));
    const newOrder = computeOrder(column[at - 1], column[at]);

    // Không có gì thay đổi thì bỏ qua, khỏi gọi API
    if (task.status === status && Math.abs((Number(task.order) || 0) - newOrder) < 1e-9) return;

    const snapshot = tasks;
    setTasks((prev) => prev.map((t) => (
      t._id === task._id ? { ...t, status, order: newOrder } : t
    )));
    setError('');

    try {
      await api.patch(`/tasks/${task._id}/status`, { status, order: newOrder });
    } catch (e) {
      setTasks(snapshot); // khôi phục vị trí cũ khi máy chủ từ chối
      setError(errMsg(e));
    }
  };

  // ----- Giao diện -----
  const openCreate = () => { setEditingTask(null); setShowForm(true); };
  const openEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const setFilter = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters((prev) => ({ ...prev, [k]: value }));
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
          {isManager && (
            <button className="btn-primary" onClick={openCreate}>Thêm công việc</button>
          )}
        </div>
      </div>

      <div className="mt-4"><Alert>{error}</Alert></div>

      {showForm && (
        <TaskForm
          members={members}
          task={editingTask}
          busy={busy}
          onSubmit={submitTask}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {/* Thanh bộ lọc */}
      <div className="card mt-4 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="label" htmlFor="f-keyword">Tìm kiếm</label>
          <input id="f-keyword" className="field" value={filters.keyword}
            onChange={setFilter('keyword')} placeholder="Tìm theo tiêu đề công việc" />
        </div>

        <div>
          <label className="label" htmlFor="f-assignee">Người thực hiện</label>
          <select id="f-assignee" className="field" value={filters.assignee} onChange={setFilter('assignee')}>
            <option value="">Tất cả</option>
            {members.map((m) => (
              <option key={m._id} value={m.user?._id}>{m.user?.fullName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-priority">Độ ưu tiên</label>
          <select id="f-priority" className="field" value={filters.priority} onChange={setFilter('priority')}>
            <option value="">Tất cả</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-status">Trạng thái</label>
          <select id="f-status" className="field" value={filters.status} onChange={setFilter('status')}>
            <option value="">Tất cả</option>
            {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm" htmlFor="f-overdue">
          <input id="f-overdue" type="checkbox" className="h-4 w-4 accent-signal"
            checked={filters.overdue} onChange={setFilter('overdue')} />
          Chỉ hiện việc quá hạn
        </label>

        {filterActive && (
          <button className="btn-ghost mb-0.5" onClick={() => setFilters(EMPTY_FILTERS)}>
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Bảng Kanban */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key).sort(byOrder);
          const hintHere = dropHint?.status === col.key;

          return (
            <section
              key={col.key}
              className={`rounded-xl p-3 transition ${
                dragTask && hintHere ? 'bg-signal-soft ring-1 ring-signal/30' : 'bg-white/60'
              }`}
              onDragOver={(e) => {
                if (!dragTask) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                showDropHint(col.key, null);
              }}
              onDrop={(e) => { e.preventDefault(); handleDrop(col.key, dropHint?.index ?? null); }}
            >
              <header className="flex items-center gap-2 px-1 pb-3">
                <span className={`h-2 w-2 rounded-full ${col.color}`} />
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <span className="font-mono text-xs text-ink-300">{items.length}</span>
              </header>

              <div className="space-y-2">
                {items.map((t, index) => {
                  const draggable = canDrag(t);
                  const showLine = hintHere && dropHint?.index === index;

                  return (
                    <div key={t._id}>
                      {showLine && <div className="mb-2 h-0.5 rounded-full bg-signal" />}

                      <div
                        role="button"
                        tabIndex={0}
                        draggable={draggable}
                        onDragStart={(e) => handleDragStart(e, t)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => {
                          if (!dragTask) return;
                          e.preventDefault();
                          e.stopPropagation();
                          showDropHint(col.key, index);
                        }}
                        onClick={() => navigate(`/cong-viec/${t._id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/cong-viec/${t._id}`);
                          }
                        }}
                        className={`card block p-3 text-left transition hover:border-ink-300 ${
                          draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                        } ${dragTask?._id === t._id ? 'opacity-40' : ''}`}
                      >
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
                          <p className={`mt-1.5 font-mono text-[11px] ${
                            isOverdue(t) ? 'text-signal' : 'text-ink-300'}`}>
                            {isOverdue(t) ? 'Quá hạn ' : 'Hạn '}
                            {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}

                        {isManager && (
                          <div className="mt-3 flex gap-3 border-t border-ink-100 pt-2">
                            <button type="button"
                              className="text-xs font-medium text-ink-500 hover:text-ink-900"
                              onClick={(e) => { e.stopPropagation(); openEdit(t); }}>
                              Sửa
                            </button>
                            <button type="button"
                              className="text-xs font-medium text-signal hover:brightness-90"
                              onClick={(e) => { e.stopPropagation(); removeTask(t); }}>
                              Xoá
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Vùng thả ở cuối cột */}
                {hintHere && dropHint?.index === null && items.length > 0 && (
                  <div className="h-0.5 rounded-full bg-signal" />
                )}

                {items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-ink-300">
                    {loading ? 'Đang tải…' : dragTask ? 'Thả vào đây' : 'Chưa có công việc'}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {!loading && tasks.length === 0 && filterActive && (
        <p className="mt-6 text-center text-sm text-ink-500">
          Không tìm thấy công việc nào phù hợp với bộ lọc.
        </p>
      )}
    </div>
  );
}
