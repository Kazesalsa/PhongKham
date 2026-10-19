import { create } from 'zustand';
import { receptionistService } from '../services/receptionistService';
import { showSuccess } from '../utils/notificationUtil';

export const useReceptionistStore = create((set, get) => ({
  queueList: [],
  pendingCheckoutList: [],
  selectedCheckoutDetail: null,
  lastCompletedInvoice: null,
  isReceiptOpen: false,
  isLoadingPending: false,
  isLoadingDetail: false,
  patientPage: {
    items: [],
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  isLoading: false,
  isSubmitting: false,

  // Lấy danh sách ca chờ thanh toán
  fetchPendingCheckout: async (keyword = '') => {
    set({ isLoadingPending: true });
    try {
      const data = await receptionistService.getPendingCheckoutList(keyword);
      set({ pendingCheckoutList: Array.isArray(data) ? data : [], isLoadingPending: false });
    } catch {
      set({ isLoadingPending: false });
    }
  },

  // Lấy chi tiết bảng kê viện phí của ca khám
  fetchCheckoutDetail: async (maHoSo) => {
    set({ isLoadingDetail: true });
    try {
      const data = await receptionistService.getCheckoutDetail(maHoSo);
      set({ selectedCheckoutDetail: data, isLoadingDetail: false });
      return data;
    } catch (err) {
      set({ isLoadingDetail: false });
      throw err;
    }
  },

  clearSelectedCheckoutDetail: () => {
    set({ selectedCheckoutDetail: null });
  },

  closeReceiptModal: () => {
    set({ isReceiptOpen: false, lastCompletedInvoice: null });
  },

  // Lấy danh sách hàng chờ khám hôm nay
  fetchQueue: async () => {
    set({ isLoading: true });
    try {
      const data = await receptionistService.getWaitingQueue();
      set({ queueList: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Tìm kiếm bệnh nhân có phân trang
  searchPatients: async (keyword = '', page = 1, size = 10) => {
    set({ isLoading: true });
    try {
      const data = await receptionistService.searchPatients(keyword, page, size);
      set({
        patientPage: {
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

  // Tiếp nhận bệnh nhân
  admitPatient: async (formData) => {
    set({ isSubmitting: true });
    try {
      const result = await receptionistService.checkInPatient(formData);
      showSuccess(`Tiếp nhận thành công! Mã lịch hẹn: ${result?.maLichHen || ''}`);
      get().fetchQueue();
      set({ isSubmitting: false });
      return result;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Thanh toán hóa đơn viện phí
  checkoutInvoice: async (checkoutData) => {
    set({ isSubmitting: true });
    try {
      const invoiceResult = await receptionistService.checkoutInvoice(checkoutData);
      showSuccess('Thanh toán hóa đơn viện phí thành công!');
      
      // Ghép chi tiết vào receipt nếu có selectedCheckoutDetail
      const fullReceipt = {
        ...invoiceResult,
        patientInfo: get().selectedCheckoutDetail,
      };
      set({ 
        lastCompletedInvoice: fullReceipt, 
        isReceiptOpen: true,
        selectedCheckoutDetail: null,
        isSubmitting: false 
      });

      get().fetchPendingCheckout();
      get().fetchQueue();
      return invoiceResult;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Hủy lịch hẹn
  cancelAppointment: async (cancelData) => {
    set({ isSubmitting: true });
    try {
      await receptionistService.cancelAppointment(cancelData);
      showSuccess('Hủy lịch hẹn thành công!');
      get().fetchQueue();
      set({ isSubmitting: false });
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },
}));
