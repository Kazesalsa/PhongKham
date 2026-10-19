import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const authService = {
  login: async (username, password) => {
    return await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
  },
};
