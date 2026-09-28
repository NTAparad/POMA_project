import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Đính kèm token vào mọi yêu cầu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('poma_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token hết hạn thì đưa về trang đăng nhập
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.startsWith('/dang-nhap')) {
      localStorage.removeItem('poma_token');
      location.href = '/dang-nhap';
    }
    return Promise.reject(err);
  },
);

/** Lấy thông điệp lỗi từ phản hồi của máy chủ. */
export const errMsg = (e) => e?.response?.data?.message || 'Không kết nối được máy chủ';

export default api;
