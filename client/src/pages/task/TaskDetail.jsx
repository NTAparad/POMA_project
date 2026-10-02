
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';
import { useAuth } from '../../store/auth';
import TaskForm from '../board/TaskForm';

const STATUS_LABEL = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  review: 'Chờ duyệt',
  done: 'Hoàn thành',
};

/**
 * Chi tiết công việc — TV3 phụ trách phần thông tin, TV1 phụ trách khung bình luận.
 */
export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [task, setTask] = useState(null);

  // =========================
  // THÔNG TIN CÔNG VIỆC — TV3
  // =========================
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskError, setTaskError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [taskBusy, setTaskBusy] = useState(false);

  // =========================
  // MODULE BÌNH LUẬN — TV1
  // =========================
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentError, setCommentError] = useState('');
  const [sendLoading, setSendLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  /*
   * currentUser được lấy từ API task.
   *
   * Nếu project của bạn đã có cơ chế auth/context riêng,
   * có thể thay phần này bằng currentUser từ AuthContext.
   */
  

  const loadComments = async () => {
    setCommentLoading(true);
    setCommentError('');

    try {
      const response = await api.get(`/tasks/${id}/comments`);
      console.log('COMMENTS DATA:', response.data.data);
      setComments(response.data.data || []);
    } catch (e) {
      setCommentError(errMsg(e));
    } finally {
      setCommentLoading(false);
    }
  };

  const load = async () => {
    try {
      const t = await api.get(`/tasks/${id}`);
      const loaded = t.data.data;
      setTask(loaded);

      // Lấy thêm dự án và danh sách thành viên để biết quyền và để sửa công việc
      const projectId = loaded.project?._id || loaded.project;
      if (projectId) {
        const [p, m] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/members`),
        ]);
        setProject(p.data.data);
        setMembers(m.data.data);
      }
    } catch (e) {
      setTaskError(errMsg(e));
    }
  };

  // =========================
  // SỬA VÀ XOÁ CÔNG VIỆC — TV3
  // =========================
  const isProjectManager = project?.myRole === 'manager';

  const saveTask = async (data) => {
    setTaskBusy(true);
    setTaskError('');

    try {
      const { data: res } = await api.put(`/tasks/${id}`, data);
      setTask((prev) => ({ ...prev, ...res.data }));
      setShowForm(false);
    } catch (e) {
      setTaskError(errMsg(e));
    } finally {
      setTaskBusy(false);
    }
  };

  const removeTask = async () => {
    if (!window.confirm(
      `Xoá công việc "${task.title}"? Mọi bình luận trong công việc cũng bị xoá.`
    )) return;

    setTaskError('');

    try {
      await api.delete(`/tasks/${id}`);
      const projectId = task.project?._id || task.project;
      navigate(projectId ? `/du-an/${projectId}` : '/du-an');
    } catch (e) {
      setTaskError(errMsg(e));
    }
  };

  useEffect(() => {
    const loadTaskAndComments = async () => {
      await load();
      await loadComments();
    };

    loadTaskAndComments();
  }, [id]);

  // =========================
  // GỬI BÌNH LUẬN
  // =========================
  const send = async (e) => {
    e.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    if (trimmedContent.length > 1000) {
      setCommentError('Nội dung bình luận không được vượt quá 1000 ký tự');
      return;
    }

    setSendLoading(true);
    setCommentError('');

    try {
      const response = await api.post(`/tasks/${id}/comments`, {
        content: trimmedContent,
      });

      const newComment = response.data.data;

      setComments((prev) => [...prev, newComment]);
      setContent('');
    } catch (err) {
      setCommentError(errMsg(err));
    } finally {
      setSendLoading(false);
    }
  };

  // =========================
  // BẮT ĐẦU SỬA
  // =========================
  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditingContent(comment.content);
    setCommentError('');
  };

  // =========================
  // HỦY SỬA
  // =========================
  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
    setCommentError('');
  };

  // =========================
  // LƯU BÌNH LUẬN
  // =========================
  const saveEdit = async (commentId) => {
    const trimmedContent = editingContent.trim();

    if (!trimmedContent) {
      setCommentError('Nội dung bình luận không được để trống');
      return;
    }

    if (trimmedContent.length > 1000) {
      setCommentError('Nội dung bình luận không được vượt quá 1000 ký tự');
      return;
    }

    setEditLoading(true);
    setCommentError('');

    try {
      const response = await api.put(`/comments/${commentId}`, {
        content: trimmedContent,
      });

      const updatedComment = response.data.data;

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? updatedComment : comment
        )
      );

      setEditingId(null);
      setEditingContent('');
    } catch (err) {
      setCommentError(errMsg(err));
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // XÓA BÌNH LUẬN
  // =========================
  const removeComment = async (commentId) => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xoá bình luận này không?'
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoadingId(commentId);
    setCommentError('');

    try {
      await api.delete(`/comments/${commentId}`);

      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      setCommentError(errMsg(err));
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // =========================
  // KIỂM TRA QUYỀN
  // =========================
  const getUserId = (user) => {
    if (!user) return null;
    return String(user._id || user.id || '');
  };

  const isAuthor = (comment) => {
    if (!currentUser || !comment.author) {
      return false;
    }

    return getUserId(currentUser) === getUserId(comment.author);
  };

  const isManager = () => {
    if (!currentUser) {
      return false;
    }

    return (
      currentUser.role === 'manager' ||
      currentUser.projectRole === 'manager'
    );
  };

  const canDelete = (comment) => {
    return isAuthor(comment) || isManager();
  };

  if (!task) {
    return <p className="text-sm text-ink-500">Đang tải…</p>;
  }

  const projectId = task.project?._id || task.project;
  const overdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="max-w-3xl">
      {projectId && (
        <Link to={`/du-an/${projectId}`} className="text-sm text-ink-500 hover:text-ink-900">
          ← Quay lại bảng công việc
        </Link>
      )}

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{task.title}</h1>

        {isProjectManager && (
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(true)}>
              Sửa công việc
            </button>
            <button type="button" className="btn-danger" onClick={removeTask}>
              Xoá công việc
            </button>
          </div>
        )}
      </div>

      {taskError && (
        <div className="mt-3">
          <Alert>{taskError}</Alert>
        </div>
      )}

      {showForm && (
        <TaskForm
          members={members}
          task={task}
          busy={taskBusy}
          onSubmit={saveTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Trạng thái', STATUS_LABEL[task.status] || task.status],
          ['Người thực hiện', task.assignee?.fullName || 'Chưa giao'],
          [
            'Độ ưu tiên',
            { low: 'Thấp', medium: 'Trung bình', high: 'Cao' }[
              task.priority
            ],
          ],
          [
            'Hạn hoàn thành',
            task.dueDate
              ? `${overdue ? 'Quá hạn ' : ''}${new Date(task.dueDate).toLocaleDateString('vi-VN')}`
              : 'Không đặt',
          ],
        ].map(([k, v]) => (
          <div key={k} className="card p-3">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-300">
              {k}
            </dt>
            <dd className="mt-1 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {task.description && (
        <div className="card mt-4 p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* MODULE BÌNH LUẬN — phụ trách: TV1 */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Trao đổi</h2>

        {commentError && (
          <div className="mt-3">
            <Alert>{commentError}</Alert>
          </div>
        )}

        {/* Loading */}
        {commentLoading ? (
          <p className="py-6 text-center text-sm text-ink-300">
            Đang tải bình luận…
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Danh sách bình luận */}
            {comments.map((comment) => {
              const editing = editingId === comment._id;
              const author = comment.author;

              return (
                <article key={comment._id} className="card p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {author?.fullName || 'Người dùng'}
                    </span>

                    <span className="font-mono text-[11px] text-ink-300">
                      {new Date(comment.createdAt).toLocaleString('vi-VN')}
                    </span>

                    {comment.isEdited && (
                      <span className="text-[11px] text-ink-300">
                        đã sửa
                      </span>
                    )}
                  </div>

                  {/* Chế độ sửa */}
                  {editing ? (
                    <div className="mt-3">
                      <textarea
                        rows={3}
                        maxLength={1000}
                        className="field"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        disabled={editLoading}
                      />

                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={
                            editLoading || !editingContent.trim()
                          }
                          onClick={() => saveEdit(comment._id)}
                        >
                          {editLoading ? 'Đang lưu…' : 'Lưu'}
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          disabled={editLoading}
                          onClick={cancelEdit}
                        >
                          Hủy
                        </button>

                        <span className="font-mono text-xs text-ink-300">
                          {editingContent.length}/1000
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Nội dung bình luận */}
                      <p className="mt-2 whitespace-pre-line text-sm">
                        {comment.content}
                      </p>

                      {/* Nút thao tác */}
                      <div className="mt-3 flex items-center gap-3">
                        {isAuthor(comment) && (
                          <button
                            type="button"
                            className="text-xs font-medium text-ink-500 hover:text-ink-900"
                            onClick={() => startEdit(comment)}
                          >
                            Sửa
                          </button>
                        )}

                        {canDelete(comment) && (
                          <button
                            type="button"
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                            disabled={deleteLoadingId === comment._id}
                            onClick={() => removeComment(comment._id)}
                          >
                            {deleteLoadingId === comment._id
                              ? 'Đang xoá…'
                              : 'Xóa'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </article>
              );
            })}

            {/* Không có bình luận */}
            {comments.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-300">
                Chưa có trao đổi nào.
              </p>
            )}
          </div>
        )}

        {/* Form gửi bình luận */}
        <form onSubmit={send} className="mt-4">
          <label className="label" htmlFor="cmt">
            Viết bình luận
          </label>

          <textarea
            id="cmt"
            rows={3}
            maxLength={1000}
            className="field"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);

              if (commentError) {
                setCommentError('');
              }
            }}
            placeholder="Trao đổi về công việc này…"
            disabled={sendLoading}
          />

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={sendLoading || !content.trim()}
            >
              {sendLoading ? 'Đang gửi…' : 'Gửi'}
            </button>

            <span className="font-mono text-xs text-ink-300">
              {content.length}/1000
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}

