import { useState } from 'react';

/**
 * MODULE CÔNG VIỆC — phụ trách: TV3
 * Biểu mẫu tạo công việc mới và giao cho thành viên trong dự án.
 */
export default function TaskForm({ members, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    title: '', description: '', assignee: '', priority: 'medium', dueDate: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: null });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};

    if (!form.title.trim()) err.title = 'Tiêu đề công việc không được để trống';
    if (form.assignee && !members.some((m) => m.user?._id === form.assignee)) {
      err.assignee = 'Người được giao không thuộc dự án';
    }
    if (Object.keys(err).length) return setErrors(err);

    // Cảnh báo khi hạn hoàn thành nằm trong quá khứ
    if (form.dueDate && new Date(form.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      const ok = window.confirm('Hạn hoàn thành đã qua. Bạn vẫn muốn tạo công việc này?');
      if (!ok) return;
    }

    onSubmit({ ...form, assignee: form.assignee || null });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold">Thêm công việc</h2>
        <p className="mt-1 text-sm text-ink-500">Tạo công việc mới và giao cho thành viên trong dự án.</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="t-title">
              Tiêu đề công việc <span className="text-signal">*</span>
            </label>
            <input id="t-title" className="field" value={form.title} onChange={set('title')}
              placeholder="Ví dụ: Thiết kế giao diện trang chủ" />
            {errors.title && <p className="mt-1 text-xs text-signal">{errors.title}</p>}
          </div>

          <div>
            <label className="label" htmlFor="t-desc">Mô tả</label>
            <textarea id="t-desc" rows={3} className="field" value={form.description}
              onChange={set('description')} placeholder="Mô tả chi tiết yêu cầu của công việc" />
          </div>

          <div>
            <label className="label" htmlFor="t-assignee">Người thực hiện</label>
            <select id="t-assignee" className="field" value={form.assignee} onChange={set('assignee')}>
              <option value="">Chưa giao cho ai</option>
              {members.map((m) => (
                <option key={m._id} value={m.user?._id}>
                  {m.user?.fullName} {m.role === 'manager' ? '(Quản trị dự án)' : ''}
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
            <button type="button" className="btn-ghost" onClick={onCancel}>Huỷ</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu công việc'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
