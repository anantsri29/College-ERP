import axiosInstance from "./axiosInstance";

export const leaveApi = {
  getMyLeaves: async (role, params) => (await axiosInstance.get(`/${role}/leave`, { params })).data,
  createLeave: async (role, payload) => (await axiosInstance.post(`/${role}/leave`, payload)).data,
  cancelLeave: async (role, id) => (await axiosInstance.put(`/${role}/leave/${id}/cancel`)).data,
};
