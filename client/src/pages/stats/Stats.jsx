import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * MODULE THỐNG KÊ — phụ trách: TV2
 * TODO: vẽ biểu đồ tròn theo trạng thái và biểu đồ cột theo thành viên bằng thư viện recharts.
 */
export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/projects/${id}/stats`).then((r) => { setStats(r.data.data); setError(''); })
      .catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <p className="text-sm text-ink-500">Đang tải thống kê…</p>;
  if (error) return <div><Alert>{error}</Alert><button className="btn-ghost mt-4" onClick={load}>Tải lại</button></div>;

  const cards = [
    ['Tổng công việc', stats.total],
    ['Đã hoàn thành', stats.byStatus.done],
    ['Tỉ lệ hoàn thành', `${Math.round(stats.completionRate * 100)}%`],
    ['Quá hạn', stats.overdue],
  ];
  const statusData = [
    { name: 'Chưa làm', value: stats.byStatus.todo, color: '#64748b' },
    { name: 'Đang làm', value: stats.byStatus.in_progress, color: '#2563eb' },
    { name: 'Chờ duyệt', value: stats.byStatus.review, color: '#d97706' },
    { name: 'Hoàn thành', value: stats.byStatus.done, color: '#16a34a' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Thống kê tiến độ</h1>
        <button className="btn-ghost" onClick={load}>Tải lại</button></div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {stats.total === 0 ? <div className="card mt-6 p-10 text-center text-sm text-ink-500">Chưa có công việc để thống kê.</div> : <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-semibold">Theo trạng thái</h2><div className="h-72">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
            {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
        </div></div>
        <div className="card p-5"><h2 className="font-semibold">Theo người thực hiện</h2><div className="h-72">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={stats.byAssignee} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="fullName" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={55} />
            <YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="count" name="Tổng số" fill="#1e293b" radius={[4, 4, 0, 0]} /><Bar dataKey="done" name="Đã xong" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer>
        </div></div>
      </div>}
    </div>
  );
}
