import axiosInstance from "./axiosInstance";

export const notificationApi = {
  getMine: async (params) => (await axiosInstance.get("/notifications", { params })).data,
  markRead: async (id) => (await axiosInstance.put(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await axiosInstance.put("/notifications/read-all")).data,
  create: async (payload) => (await axiosInstance.post("/notifications", payload)).data,
  remove: async (id) => (await axiosInstance.delete(`/notifications/${id}`)).data,
};
