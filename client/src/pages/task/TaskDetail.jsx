import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

/**
 * Chi tiết công việc — TV3 phụ trách phần thông tin, TV1 phụ trách khung bình luận.
 */
export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [t, c] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/comments`),
      ]);
      setTask(t.data.data);
      setComments(c.data.data);
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { load(); }, [id]);

  const send = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post(`/tasks/${id}/comments`, { content });
      setContent('');
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  if (!task) return <p className="text-sm text-ink-500">Đang tải…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">{task.title}</h1>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ['Người thực hiện', task.assignee?.fullName || 'Chưa giao'],
          ['Độ ưu tiên', { low: 'Thấp', medium: 'Trung bình', high: 'Cao' }[task.priority]],
          ['Hạn hoàn thành', task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không đặt'],
        ].map(([k, v]) => (
          <div key={k} className="card p-3">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-300">{k}</dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {task.description && (
        <div className="card mt-4 p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed">{task.description}</p>
        </div>
      )}

      {/* MODULE BÌNH LUẬN — phụ trách: TV1 */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Trao đổi</h2>
        <div className="mt-3"><Alert>{error}</Alert></div>

        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <article key={c._id} className="card p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{c.author?.fullName}</span>
                <span className="font-mono text-[11px] text-ink-300">
                  {new Date(c.createdAt).toLocaleString('vi-VN')}
                </span>
                {c.isEdited && <span className="text-[11px] text-ink-300">đã sửa</span>}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{c.content}</p>
              {/* TODO (TV1): nút sửa và xoá cho bình luận của chính mình */}
            </article>
          ))}

          {comments.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-300">Chưa có trao đổi nào.</p>
          )}
        </div>

        <form onSubmit={send} className="mt-4">
          <label className="label" htmlFor="cmt">Viết bình luận</label>
          <textarea id="cmt" rows={3} maxLength={1000} className="field"
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Trao đổi về công việc này…" />
          <div className="mt-2 flex items-center gap-3">
            <button className="btn-primary" disabled={!content.trim()}>Gửi</button>
            <span className="font-mono text-xs text-ink-300">{content.length}/1000</span>
          </div>
        </form>
      </section>
    </div>
  );
}
