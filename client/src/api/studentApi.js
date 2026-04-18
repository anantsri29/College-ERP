import axiosInstance from "./axiosInstance";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "files" && Array.isArray(value)) {
      value.forEach((file) => formData.append("files", file));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

export const studentApi = {
  getDashboard: async () => (await axiosInstance.get("/student/dashboard")).data,
  getAttendance: async () => (await axiosInstance.get("/student/attendance")).data,
  getAssignments: async () => (await axiosInstance.get("/student/assignments")).data,
  submitAssignment: async ({ id, payload }) =>
    (
      await axiosInstance.post(`/student/assignments/${id}/submit`, toFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,
  getResults: async (params) => (await axiosInstance.get("/student/results", { params })).data,
  getTimetable: async () => (await axiosInstance.get("/student/timetable")).data,
};
