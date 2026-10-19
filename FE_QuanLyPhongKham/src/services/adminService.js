import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const adminService = {
  // Báo cáo tổng hợp doanh thu theo ngày
  getDailyReport: async () => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.DAILY_REPORT);
  },

  // Thống kê doanh thu theo khoảng ngày
  getDateRangeRevenue: async (tuNgay, denNgay) => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.DATE_RANGE_REVENUE, {
      params: { tuNgay, denNgay },
    });
  },

  // Đánh giá năng suất bác sĩ
  getDoctorProductivity: async () => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.DOCTOR_PRODUCTIVITY);
  },

  // Quản lý người dùng & nhân sự
  getUsers: async (role, q) => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.USERS, {
      params: { role, q },
    });
  },

  createUser: async (userData) => {
    return await axiosClient.post(API_ENDPOINTS.ADMIN.USERS, userData);
  },

  updateUser: async (userData) => {
    return await axiosClient.put(API_ENDPOINTS.ADMIN.USERS, userData);
  },

  toggleUserStatus: async (maNguoiDung, hoatDong) => {
    return await axiosClient.post(API_ENDPOINTS.ADMIN.USER_STATUS, {
      maNguoiDung,
      hoatDong,
    });
  },

  resetUserPassword: async (maNguoiDung, matKhauMoi) => {
    return await axiosClient.post(API_ENDPOINTS.ADMIN.USER_RESET_PASSWORD, {
      maNguoiDung,
      matKhauMoi,
    });
  },

  // Quản lý và tra cứu hóa đơn viện phí
  getInvoices: async (keyword) => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.INVOICES, {
      params: { keyword },
    });
  },

  getInvoiceDetail: async (maHoaDon) => {
    return await axiosClient.get(API_ENDPOINTS.ADMIN.INVOICES, {
      params: { maHoaDon },
    });
  },
};

