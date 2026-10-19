import axios from 'axios';
import { BASE_API_URL } from '../constants/apiEndpoints';
import { ROUTE_PATHS } from '../constants/routePaths';
import { showError, showDbErrorNotification } from '../utils/notificationUtil';
import { sanitizeDataPayload } from '../utils/cleanText';

const axiosClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// Request Interceptor: Attach JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap data & centralize error handling
axiosClient.interceptors.response.use(
  (response) => {
    // Automatically sanitize any mojibake in incoming JSON payload
    const res = sanitizeDataPayload(response.data);
    // Standard ApiResponse format check
    if (res && typeof res.success === 'boolean' && !res.success) {
      const errorMsg = res.message || 'Thao tác không thành công!';
      if (res.errorCode === 'FORBIDDEN_DB') {
        showDbErrorNotification(errorMsg);
      } else {
        showError(errorMsg);
      }
      return Promise.reject(new Error(errorMsg));
    }
    // Return the inner payload data if wrapped in ApiResponse
    return res && res.data !== undefined ? res.data : res;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || 'Lỗi kết nối máy chủ!';

      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        if (window.location.pathname !== ROUTE_PATHS.LOGIN) {
          showError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
          window.location.href = ROUTE_PATHS.LOGIN;
        }
      } else if (status === 403 || data?.errorCode === 'FORBIDDEN_DB') {
        showDbErrorNotification(message);
      } else {
        showError(message);
      }
    } else {
      showError('Không thể kết nối đến máy chủ Backend! Vui lòng kiểm tra lại dịch vụ Tomcat.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
