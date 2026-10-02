import { useEffect, useState } from 'react';

/**
 * MODULE CÔNG VIỆC — phụ trách: TV3
 *
 * Biểu mẫu dùng chung cho hai việc:
 * - Tạo công việc mới và giao cho thành viên (không truyền prop task).
 * - Chỉnh sửa công việc đã có (truyền prop task).
 */

/** Chuyển ngày từ API sang định dạng YYYY-MM-DD mà ô chọn ngày hiểu được. */
function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function TaskForm({ members = [], task = null, onSubmit, onCancel, busy }) {
  const isEdit = Boolean(task);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee?._id || task?.assignee || '',
    priority: task?.priority || 'medium',
    dueDate: toDateInput(task?.dueDate),
  });
  const [errors, setErrors] = useState({});

  // Cho phép đóng biểu mẫu bằng phím Esc
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel, busy]);

  const set = (k) => (e) => {
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};

    const title = form.title.trim();
    if (!title) err.title = 'Tiêu đề công việc không được để trống';
    else if (title.length > 300) err.title = 'Tiêu đề không được vượt quá 300 ký tự';

    if (form.description.length > 5000) {
      err.description = 'Mô tả không được vượt quá 5000 ký tự';
    }
    if (form.assignee && !members.some((m) => m.user?._id === form.assignee)) {
      err.assignee = 'Người được giao không thuộc dự án';
    }
    if (Object.keys(err).length) return setErrors(err);

    // Cảnh báo khi hạn hoàn thành nằm trong quá khứ
    if (form.dueDate && new Date(form.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      const message = isEdit
        ? 'Hạn hoàn thành đã qua. Bạn vẫn muốn lưu thay đổi?'
        : 'Hạn hoàn thành đã qua. Bạn vẫn muốn tạo công việc này?';
      if (!window.confirm(message)) return;
    }

    onSubmit({
      title,
      description: form.description,
      assignee: form.assignee || null,
      priority: form.priority,
      dueDate: form.dueDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
    >
      <div className="card max-h-full w-full max-w-lg overflow-y-auto p-6">
        <h2 className="text-lg font-semibold">
          {isEdit ? 'Sửa công việc' : 'Thêm công việc'}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {isEdit
            ? 'Cập nhật thông tin và người thực hiện của công việc.'
            : 'Tạo công việc mới và giao cho thành viên trong dự án.'}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="t-title">
              Tiêu đề công việc <span className="text-signal">*</span>
            </label>
            <input id="t-title" className="field" value={form.title} onChange={set('title')}
              maxLength={300} placeholder="Ví dụ: Thiết kế giao diện trang chủ" />
            {errors.title && <p className="mt-1 text-xs text-signal">{errors.title}</p>}
          </div>

          <div>
            <label className="label" htmlFor="t-desc">Mô tả</label>
            <textarea id="t-desc" rows={3} className="field" value={form.description}
              onChange={set('description')} maxLength={5000}
              placeholder="Mô tả chi tiết yêu cầu của công việc" />
            {errors.description && <p className="mt-1 text-xs text-signal">{errors.description}</p>}
          </div>

          <div>
            <label className="label" htmlFor="t-assignee">Người thực hiện</label>
            <select id="t-assignee" className="field" value={form.assignee} onChange={set('assignee')}>
              <option value="">Chưa giao cho ai</option>
              {members.map((m) => (
                <option key={m._id} value={m.user?._id}>
                  {m.user?.fullName}{m.role === 'manager' ? ' (Quản trị dự án)' : ''}
                </option>
              ))}
            </select>
            {errors.assignee && <p className="mt-1 text-xs text-signal">{errors.assignee}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="t-priority">Độ ưu tiên</label>
              <select id="t-priority" className="field" value={form.priority} onChange={set('priority')}>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="t-due">Hạn hoàn thành</label>
              <input id="t-due" type="date" className="field" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>Huỷ</button>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Lưu công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
