import axiosInstance from "./axiosInstance";

export const subadminApi = {
  getDashboard: async () => (await axiosInstance.get("/subadmin/dashboard")).data,
  getTeachers: async (params) => (await axiosInstance.get("/subadmin/teachers", { params })).data,
  createTeacher: async (payload) => (await axiosInstance.post("/subadmin/teachers", payload)).data,
  updateTeacher: async ({ id, payload }) => (await axiosInstance.put(`/subadmin/teachers/${id}`, payload)).data,
  deleteTeacher: async (id) => (await axiosInstance.delete(`/subadmin/teachers/${id}`)).data,
  getStudents: async (params) => (await axiosInstance.get("/subadmin/students", { params })).data,
  createStudent: async (payload) => (await axiosInstance.post("/subadmin/students", payload)).data,
  updateStudent: async ({ id, payload }) => (await axiosInstance.put(`/subadmin/students/${id}`, payload)).data,
  deleteStudent: async (id) => (await axiosInstance.delete(`/subadmin/students/${id}`)).data,
  getSubjects: async (params) => (await axiosInstance.get("/subadmin/subjects", { params })).data,
  createSubject: async (payload) => (await axiosInstance.post("/subadmin/subjects", payload)).data,
  updateSubject: async ({ id, payload }) => (await axiosInstance.put(`/subadmin/subjects/${id}`, payload)).data,
  deleteSubject: async (id) => (await axiosInstance.delete(`/subadmin/subjects/${id}`)).data,
  getTimetable: async (params) => (await axiosInstance.get("/subadmin/timetable", { params })).data,
  saveTimetable: async (payload) => (await axiosInstance.post("/subadmin/timetable", payload)).data,
  getAttendanceReport: async (params) => (await axiosInstance.get("/subadmin/attendance/report", { params })).data,
  getLeaveRequests: async (params) => (await axiosInstance.get("/subadmin/leave-requests", { params })).data,
  reviewLeaveRequest: async ({ id, payload }) => (await axiosInstance.put(`/subadmin/leave-requests/${id}/review`, payload)).data,
};
