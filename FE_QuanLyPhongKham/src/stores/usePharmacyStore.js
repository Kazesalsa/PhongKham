import { create } from 'zustand';
import { pharmacyService } from '../services/pharmacyService';
import { showSuccess } from '../utils/notificationUtil';

export const usePharmacyStore = create((set, get) => ({
  drugPage: {
    items: [],
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  alertList: [],
  priceHistoryList: [],
  priceHistoryLoading: false,
  isLoading: false,
  isSubmitting: false,
  searchKeyword: '',
  statusFilter: 'all',

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  // Lấy danh mục kho thuốc có phân trang, tìm kiếm và lọc trạng thái
  fetchInventory: async (page = 1, size = 10, q = '', status = 'all') => {
    set({ isLoading: true });
    try {
      const data = await pharmacyService.getInventory(page, size, q, status);
      set({
        drugPage: {
          items: data?.items || [],
          page: data?.page || 1,
          size: data?.size || 10,
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Lấy danh sách thuốc cận hạn / tồn kho thấp
  fetchAlerts: async () => {
    set({ isLoading: true });
    try {
      const data = await pharmacyService.getAlerts();
      set({ alertList: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Nhập thêm hàng vào kho
  restockDrug: async (maThuoc, soLuongNhap) => {
    set({ isSubmitting: true });
    try {
      await pharmacyService.restockDrug(maThuoc, soLuongNhap);
      showSuccess(`Nhập thêm ${soLuongNhap} đơn vị thuốc vào kho thành công!`);
      const { drugPage, searchKeyword, statusFilter } = get();
      get().fetchInventory(drugPage.page, drugPage.size, searchKeyword, statusFilter);
      get().fetchAlerts();
      set({ isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Khai báo thuốc mới (Create Drug)
  createDrug: async (data) => {
    set({ isSubmitting: true });
    try {
      const res = await pharmacyService.createDrug(data);
      showSuccess(`Khai báo thuốc mới "${data.tenThuoc}" thành công! (Mã: ${res?.maThuoc || ''})`);
      const { drugPage, searchKeyword, statusFilter } = get();
      get().fetchInventory(1, drugPage.size, searchKeyword, statusFilter);
      get().fetchAlerts();
      set({ isSubmitting: false });
      return res;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Cập nhật thông tin thuốc (Update Drug)
  updateDrug: async (data) => {
    set({ isSubmitting: true });
    try {
      await pharmacyService.updateDrug(data);
      showSuccess(`Cập nhật thông tin thuốc ${data.maThuoc} thành công!`);
      const { drugPage, searchKeyword, statusFilter } = get();
      get().fetchInventory(drugPage.page, drugPage.size, searchKeyword, statusFilter);
      get().fetchAlerts();
      set({ isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Xóa hoặc chuyển trạng thái thuốc (Delete / Deactivate)
  deleteDrug: async (maThuoc) => {
    set({ isSubmitting: true });
    try {
      const res = await pharmacyService.deleteDrug(maThuoc);
      showSuccess(res?.message || `Thao tác thành công trên thuốc ${maThuoc}!`);
      const { drugPage, searchKeyword, statusFilter } = get();
      get().fetchInventory(drugPage.page, drugPage.size, searchKeyword, statusFilter);
      get().fetchAlerts();
      set({ isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Tra cứu nhật ký biến động giá của thuốc (ghi nhận bởi trigger)
  fetchPriceHistory: async (maThuoc) => {
    set({ priceHistoryLoading: true });
    try {
      const data = await pharmacyService.getPriceHistory(maThuoc);
      set({
        priceHistoryList: Array.isArray(data) ? data : [],
        priceHistoryLoading: false,
      });
    } catch {
      set({ priceHistoryList: [], priceHistoryLoading: false });
    }
  },
}));
