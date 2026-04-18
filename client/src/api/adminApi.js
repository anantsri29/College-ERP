import axiosInstance from "./axiosInstance";

export const adminApi = {
  getDashboard: async () => (await axiosInstance.get("/admin/dashboard")).data,
  getUsers: async (params) => (await axiosInstance.get("/admin/users", { params })).data,
  createUser: async (payload) => (await axiosInstance.post("/admin/users", payload)).data,
  updateUser: async ({ id, payload }) => (await axiosInstance.put(`/admin/users/${id}`, payload)).data,
  deleteUser: async (id) => (await axiosInstance.delete(`/admin/users/${id}`)).data,
  bulkUsers: async (users) => (await axiosInstance.post("/admin/users/bulk", { users })).data,
  getDepartments: async () => (await axiosInstance.get("/admin/departments")).data,
  createDepartment: async (payload) => (await axiosInstance.post("/admin/departments", payload)).data,
  updateDepartment: async ({ id, payload }) => (await axiosInstance.put(`/admin/departments/${id}`, payload)).data,
  deleteDepartment: async (id) => (await axiosInstance.delete(`/admin/departments/${id}`)).data,
  getAcademicYears: async () => (await axiosInstance.get("/admin/academic-years")).data,
  createAcademicYear: async (payload) => (await axiosInstance.post("/admin/academic-years", payload)).data,
  updateAcademicYear: async ({ id, payload }) => (await axiosInstance.put(`/admin/academic-years/${id}`, payload)).data,
  getAttendanceReport: async (params) => (await axiosInstance.get("/admin/reports/attendance", { params })).data,
  getPerformanceReport: async (params) => (await axiosInstance.get("/admin/reports/performance", { params })).data,
};
