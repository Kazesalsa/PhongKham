import { create } from 'zustand';
import { adminService } from '../services/adminService';
import { message } from 'antd';

export const useAdminStore = create((set, get) => ({
  dailyReport: null,
  dailyReportList: [],
  dateRangeRevenue: [],
  doctorProductivity: [],
  userList: [],
  invoiceList: [],
  selectedInvoice: null,
  isLoading: false,
  isSubmitting: false,
  isLoadingInvoiceDetail: false,

  // Báo cáo ngày
  fetchDailyReport: async () => {
    set({ isLoading: true });
    try {
      const data = await adminService.getDailyReport();
      if (Array.isArray(data)) {
        set({
          dailyReportList: data,
          dailyReport: data.length > 0 ? data[0] : null,
          isLoading: false,
        });
      } else {
        set({
          dailyReport: data,
          dailyReportList: data ? [data] : [],
          isLoading: false,
        });
      }
    } catch {
      set({ dailyReport: null, dailyReportList: [], isLoading: false });
    }
  },

  // Thống kê doanh thu theo khoảng ngày
  fetchDateRangeRevenue: async (tuNgay, denNgay) => {
    set({ isLoading: true });
    try {
      const data = await adminService.getDateRangeRevenue(tuNgay, denNgay);
      set({ dateRangeRevenue: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ dateRangeRevenue: [], isLoading: false });
    }
  },

  // Đánh giá năng suất bác sĩ
  fetchDoctorProductivity: async () => {
    set({ isLoading: true });
    try {
      const data = await adminService.getDoctorProductivity();
      set({ doctorProductivity: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ doctorProductivity: [], isLoading: false });
    }
  },

  // Danh sách người dùng & nhân sự
  fetchUsers: async (role = 'ALL', q = '') => {
    set({ isLoading: true });
    try {
      const data = await adminService.getUsers(role, q);
      set({ userList: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ userList: [], isLoading: false });
    }
  },

  // Thêm nhân viên / bác sĩ mới
  createUser: async (userData) => {
    set({ isSubmitting: true });
    try {
      const res = await adminService.createUser(userData);
      message.success('Thêm nhân viên mới thành công!');
      set({ isSubmitting: false });
      get().fetchUsers();
      return res;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Cập nhật nhân viên / bác sĩ
  updateUser: async (userData) => {
    set({ isSubmitting: true });
    try {
      await adminService.updateUser(userData);
      message.success('Cập nhật thông tin nhân viên thành công!');
      set({ isSubmitting: false });
      get().fetchUsers();
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Đổi trạng thái khóa / kích hoạt
  toggleUserStatus: async (maNguoiDung, hoatDong) => {
    set({ isSubmitting: true });
    try {
      await adminService.toggleUserStatus(maNguoiDung, hoatDong);
      message.success(hoatDong ? 'Đã kích hoạt lại tài khoản!' : 'Đã khóa tài khoản nhân viên!');
      set({ isSubmitting: false });
      get().fetchUsers();
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Đặt lại mật khẩu
  resetUserPassword: async (maNguoiDung, matKhauMoi) => {
    set({ isSubmitting: true });
    try {
      await adminService.resetUserPassword(maNguoiDung, matKhauMoi);
      message.success('Đã đặt lại mật khẩu nhân viên thành công!');
      set({ isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Tra cứu lịch sử hóa đơn viện phí
  fetchInvoices: async (keyword = '') => {
    set({ isLoading: true });
    try {
      const data = await adminService.getInvoices(keyword);
      set({ invoiceList: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ invoiceList: [], isLoading: false });
    }
  },

  // Chi tiết hóa đơn viện phí kèm chỉ định & đơn thuốc
  fetchInvoiceDetail: async (maHoaDon) => {
    set({ isLoadingInvoiceDetail: true });
    try {
      const data = await adminService.getInvoiceDetail(maHoaDon);
      set({ selectedInvoice: data, isLoadingInvoiceDetail: false });
      return data;
    } catch {
      set({ selectedInvoice: null, isLoadingInvoiceDetail: false });
      return null;
    }
  },

  clearSelectedInvoice: () => {
    set({ selectedInvoice: null });
  },
}));

