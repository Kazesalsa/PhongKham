import { create } from 'zustand';
import { doctorService } from '../services/doctorService';
import { showSuccess } from '../utils/notificationUtil';

export const useDoctorStore = create((set, get) => ({
  doctorQueue: [],
  activePatient: null,
  patientHistory: [],
  availableDrugsPage: {
    items: [],
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  prescriptions: [], // Array of { maThuoc, tenThuoc, donViTinh, donGia, soLuong, cachDung, huongDan }
  serviceOrders: [], // Array of { maDichVu, tenDichVu, donGia, soLuong }
  availableServices: [], // Array of { maDichVu, tenDichVu, donGia, moTa }
  isLoading: false,
  isSubmitting: false,

  // Lấy danh sách hàng chờ của bác sĩ
  fetchDoctorQueue: async () => {
    set({ isLoading: true });
    try {
      const data = await doctorService.getDoctorQueue();
      set({ doctorQueue: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Chọn bệnh nhân vào khám
  setActivePatient: (patient) => {
    set({
      activePatient: patient,
      prescriptions: [],
      serviceOrders: [],
      patientHistory: [],
    });
    if (patient?.maBenhNhan) {
      get().fetchPatientHistory(patient.maBenhNhan);
    }
  },

  // Tra cứu tiền sử bệnh án
  fetchPatientHistory: async (patientId) => {
    try {
      const data = await doctorService.getPatientHistory(patientId);
      set({ patientHistory: Array.isArray(data) ? data : [] });
    } catch {
      set({ patientHistory: [] });
    }
  },

  // Tra cứu thuốc khả dụng có phân trang
  fetchAvailableDrugs: async (q = '', page = 1, size = 10) => {
    try {
      const data = await doctorService.getAvailableDrugs(q, page, size);
      set({
        availableDrugsPage: {
          items: data?.items || [],
          page: data?.page || 1,
          size: data?.size || 10,
          totalElements: data?.totalElements || 0,
          totalPages: data?.totalPages || 0,
        },
      });
    } catch {
      set({
        availableDrugsPage: { items: [], page: 1, size: 10, totalElements: 0, totalPages: 0 },
      });
    }
  },

  // Lấy danh mục dịch vụ cận lâm sàng từ CSDL
  fetchAvailableServices: async () => {
    try {
      const data = await doctorService.getAvailableServices();
      set({ availableServices: Array.isArray(data) ? data : [] });
      return data;
    } catch {
      set({ availableServices: [] });
    }
  },

  // Thêm thuốc vào đơn đang kê
  addPrescription: (item) => {
    const list = [...get().prescriptions];
    const existingIndex = list.findIndex((p) => p.maThuoc === item.maThuoc);
    if (existingIndex > -1) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      list.push(item);
    }
    set({ prescriptions: list });
    showSuccess(`Đã thêm ${item.tenThuoc} vào đơn thuốc.`);
  },

  // Xóa thuốc khỏi đơn đang kê
  removePrescription: (index) => {
    const list = get().prescriptions.filter((_, i) => i !== index);
    set({ prescriptions: list });
  },

  // Thêm chỉ định dịch vụ
  addServiceOrder: (item) => {
    const list = [...get().serviceOrders];
    const existingIndex = list.findIndex((s) => s.maDichVu === item.maDichVu);
    if (existingIndex > -1) {
      list[existingIndex].soLuong += item.soLuong || 1;
    } else {
      list.push(item);
    }
    set({ serviceOrders: list });
    showSuccess(`Đã thêm chỉ định ${item.tenDichVu}.`);
  },

  // Xóa chỉ định dịch vụ
  removeServiceOrder: (index) => {
    const list = get().serviceOrders.filter((_, i) => i !== index);
    set({ serviceOrders: list });
  },

  // Hoàn tất ca khám
  completeExamination: async (formData) => {
    set({ isSubmitting: true });
    try {
      const result = await doctorService.completeExamination(formData);
      showSuccess(`Hoàn tất khám bệnh! Mã hồ sơ: ${result?.maHoSo || ''}`);
      set({
        activePatient: null,
        prescriptions: [],
        serviceOrders: [],
        isSubmitting: false,
      });
      get().fetchDoctorQueue();
      return result;
    } catch (err) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  // Hủy ca khám hiện tại
  resetConsultation: () => {
    set({
      activePatient: null,
      prescriptions: [],
      serviceOrders: [],
      patientHistory: [],
    });
  },
}));
