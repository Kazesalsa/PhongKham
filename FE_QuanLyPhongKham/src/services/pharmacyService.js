import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const pharmacyService = {
  // Xem toàn bộ kho thuốc có phân trang, tìm kiếm và lọc trạng thái
  getInventory: async (page = 1, size = 10, q = '', status = 'all') => {
    return await axiosClient.get(API_ENDPOINTS.PHARMACY.INVENTORY, {
      params: { page, size, q, status },
    });
  },

  // Xem cảnh báo thuốc cận hạn hoặc sắp hết tồn kho
  getAlerts: async () => {
    return await axiosClient.get(API_ENDPOINTS.PHARMACY.ALERTS);
  },

  // Cập nhật nhập thêm số lượng kho thuốc
  restockDrug: async (maThuoc, soLuongNhap) => {
    return await axiosClient.post(API_ENDPOINTS.PHARMACY.RESTOCK, {
      maThuoc,
      soLuongNhap,
    });
  },

  // Khai báo thuốc mới (Create Drug)
  createDrug: async (data) => {
    return await axiosClient.post(API_ENDPOINTS.PHARMACY.DRUG_MANAGEMENT, data);
  },

  // Chỉnh sửa thông tin thuốc (Update Drug)
  updateDrug: async (data) => {
    return await axiosClient.put(API_ENDPOINTS.PHARMACY.DRUG_MANAGEMENT, data);
  },

  // Xóa / Ngừng kinh doanh thuốc (Delete / Deactivate)
  deleteDrug: async (maThuoc) => {
    return await axiosClient.delete(API_ENDPOINTS.PHARMACY.DRUG_MANAGEMENT, {
      params: { maThuoc },
    });
  },

  // Tra cứu nhật ký biến động giá thuốc
  getPriceHistory: async (maThuoc) => {
    return await axiosClient.get(API_ENDPOINTS.PHARMACY.PRICE_HISTORY, {
      params: { maThuoc },
    });
  },
};
