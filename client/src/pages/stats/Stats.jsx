import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

/**
 * MODULE THỐNG KÊ — phụ trách: TV2
 * TODO: vẽ biểu đồ tròn theo trạng thái và biểu đồ cột theo thành viên bằng thư viện recharts.
 */
export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/projects/${id}/stats`)
      .then((r) => setStats(r.data.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <p className="text-sm text-ink-500">Đang tải…</p>;

  const cards = [
    ['Tổng công việc', stats.total],
    ['Đã hoàn thành', stats.byStatus.done],
    ['Tỉ lệ hoàn thành', `${Math.round(stats.completionRate * 100)}%`],
    ['Quá hạn', stats.overdue],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Thống kê tiến độ</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-10 text-center text-sm text-ink-500">
        Biểu đồ sẽ hiển thị ở đây sau khi hoàn thiện module thống kê.
      </div>
    </div>
  );
}
