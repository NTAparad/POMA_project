import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';
import Users from './pages/admin/Users';
import ProjectList from './pages/projects/ProjectList';
import Members from './pages/projects/Members';
import Board from './pages/board/Board';
import TaskDetail from './pages/task/TaskDetail';
import Stats from './pages/stats/Stats';

const guard = (el, adminOnly = false) => <ProtectedRoute adminOnly={adminOnly}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />

          <Route path="/doi-mat-khau" element={guard(<ChangePassword />)} />
          <Route path="/quan-tri" element={guard(<Users />, true)} />
          <Route path="/du-an" element={guard(<ProjectList />)} />
          <Route path="/du-an/:id" element={guard(<Board />)} />
          <Route path="/du-an/:id/thanh-vien" element={guard(<Members />)} />
          <Route path="/du-an/:id/thong-ke" element={guard(<Stats />)} />
          <Route path="/cong-viec/:id" element={guard(<TaskDetail />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
