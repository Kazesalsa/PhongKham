import { create } from 'zustand';
import { authService } from '../services/authService';
import { showSuccess } from '../utils/notificationUtil';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('access_token') || null,
  user: JSON.parse(localStorage.getItem('user_info') || 'null'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  // Login action
  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(username, password);
      const { token, maNguoiDung, tenDangNhap, hoTen, vaiTro } = data;

      const userInfo = {
        userId: maNguoiDung,
        username: tenDangNhap,
        fullName: hoTen,
        role: vaiTro,
      };

      localStorage.setItem('access_token', token);
      localStorage.setItem('user_info', JSON.stringify(userInfo));

      set({
        token,
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
      });

      showSuccess(`Xin chào, ${hoTen}! Đăng nhập thành công.`);
      return userInfo;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Rehydrate auth state on mount
  initAuth: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user_info');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
}));
