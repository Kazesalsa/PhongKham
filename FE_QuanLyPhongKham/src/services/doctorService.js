import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const doctorService = {
  // Lấy danh sách bệnh nhân chờ phòng khám của bác sĩ
  getDoctorQueue: async () => {
    return await axiosClient.get(API_ENDPOINTS.DOCTOR.QUEUE);
  },

  // Tra cứu tiền sử bệnh án của bệnh nhân
  getPatientHistory: async (patientId) => {
    return await axiosClient.get(API_ENDPOINTS.DOCTOR.PATIENT_HISTORY, {
      params: { patientId },
    });
  },

  // Tra cứu danh mục thuốc khả dụng có phân trang
  getAvailableDrugs: async (q = '', page = 1, size = 10) => {
    return await axiosClient.get(API_ENDPOINTS.DOCTOR.AVAILABLE_DRUGS, {
      params: { q, page, size },
    });
  },

  // Lấy danh mục dịch vụ cận lâm sàng khả dụng từ CSDL
  getAvailableServices: async () => {
    return await axiosClient.get(API_ENDPOINTS.DOCTOR.ORDER_SERVICE);
  },

  // Chỉ định dịch vụ cận lâm sàng
  orderService: async (data) => {
    return await axiosClient.post(API_ENDPOINTS.DOCTOR.ORDER_SERVICE, data);
  },

  // Hoàn tất khám: Tạo hồ sơ & kê đơn thuốc
  completeExamination: async (data) => {
    return await axiosClient.post(API_ENDPOINTS.DOCTOR.COMPLETE_EXAMINATION, data);
  },

  // Lấy danh sách các bác sĩ đang hoạt động (dùng cho tiếp nhận khám bệnh)
  getActiveDoctors: async () => {
    return await axiosClient.get(API_ENDPOINTS.DOCTOR.ACTIVE_DOCTORS);
  },
};
