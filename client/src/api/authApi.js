import axiosInstance from "./axiosInstance";

export const authApi = {
  login: async (payload) => {
    const { data } = await axiosInstance.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await axiosInstance.get("/auth/me");
    return data;
  },
  logout: async () => {
    const { data } = await axiosInstance.post("/auth/logout");
    return data;
  },
  changePassword: async (payload) => {
    const { data } = await axiosInstance.put("/auth/change-password", payload);
    return data;
  },
  forgotPassword: async (payload) => {
    const { data } = await axiosInstance.post("/auth/forgot-password", payload);
    return data;
  },
  resetPassword: async ({ token, payload }) => {
    const { data } = await axiosInstance.post(`/auth/reset-password/${token}`, payload);
    return data;
  },
};
