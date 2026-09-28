import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../../lib/api';
import Alert from '../../components/Alert';

/** MODULE DỰ ÁN — phụ trách: TV2. TODO: mời và gỡ thành viên. */
export default function Members() {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/members`);
      setMembers(data.data);
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { load(); }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Thành viên dự án</h1>
      <div className="mt-4"><Alert>{error}</Alert></div>

      {/* TODO (TV2): form nhập email và chọn vai trò để mời thành viên */}

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Họ và tên</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">{m.user?.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{m.user?.email}</td>
                <td className="px-4 py-3">{m.role === 'manager' ? 'Quản trị dự án' : 'Thành viên'}</td>
                <td className="px-4 py-3 text-right">
                  {/* TODO (TV2): nút gỡ thành viên */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
