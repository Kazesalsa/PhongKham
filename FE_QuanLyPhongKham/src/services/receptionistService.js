import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const receptionistService = {
  // Lấy hàng chờ khám hôm nay
  getWaitingQueue: async () => {
    return await axiosClient.get(API_ENDPOINTS.RECEPTIONIST.QUEUE);
  },

  // Tìm kiếm bệnh nhân có phân trang
  searchPatients: async (keyword = '', page = 1, size = 10) => {
    return await axiosClient.get(API_ENDPOINTS.RECEPTIONIST.PATIENTS_SEARCH, {
      params: { keyword, page, size },
    });
  },

  // Tiếp nhận bệnh nhân mới
  checkInPatient: async (data) => {
    return await axiosClient.post(API_ENDPOINTS.RECEPTIONIST.CHECK_IN, data);
  },

  // Danh sách các ca chờ thanh toán viện phí
  getPendingCheckoutList: async (keyword = '') => {
    return await axiosClient.get(API_ENDPOINTS.RECEPTIONIST.PENDING_CHECKOUT, {
      params: { keyword },
    });
  },

  // Chi tiết bảng kê viện phí (dịch vụ & thuốc)
  getCheckoutDetail: async (maHoSo) => {
    return await axiosClient.get(API_ENDPOINTS.RECEPTIONIST.CHECKOUT_DETAIL, {
      params: { maHoSo },
    });
  },

  // Thanh toán hóa đơn viện phí
  checkoutInvoice: async (data) => {
    return await axiosClient.post(API_ENDPOINTS.RECEPTIONIST.PAYMENT, data);
  },

  // Hủy lịch hẹn
  cancelAppointment: async (data) => {
    return await axiosClient.put(API_ENDPOINTS.RECEPTIONIST.CANCEL_APPOINTMENT, data);
  },

  // Lấy danh sách lịch hẹn tái khám của bệnh nhân
  getFollowUpAppointments: async (maBenhNhan) => {
    return await axiosClient.get(API_ENDPOINTS.RECEPTIONIST.FOLLOW_UP_APPOINTMENTS, {
      params: { maBenhNhan },
    });
  },

  // Tiếp nhận bệnh nhân tái khám (Check-in 1-Click)
  checkInFollowUp: async (maLichHen) => {
    return await axiosClient.post(API_ENDPOINTS.RECEPTIONIST.CHECK_IN_FOLLOW_UP, {
      maLichHen,
    });
  },
};
