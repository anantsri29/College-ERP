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

export const teacherApi = {
  getDashboard: async () => (await axiosInstance.get("/teacher/dashboard")).data,
  getSubjects: async () => (await axiosInstance.get("/teacher/subjects")).data,
  getSubjectStudents: async (subjectId) => (await axiosInstance.get(`/teacher/subjects/${subjectId}/students`)).data,
  markAttendance: async (payload) => (await axiosInstance.post("/teacher/attendance", payload)).data,
  updateAttendance: async ({ id, payload }) => (await axiosInstance.put(`/teacher/attendance/${id}`, payload)).data,
  getAttendanceBySubject: async ({ subjectId, params }) =>
    (await axiosInstance.get(`/teacher/attendance/subject/${subjectId}`, { params })).data,
  getAssignments: async () => (await axiosInstance.get("/teacher/assignments")).data,
  createAssignment: async (payload) =>
    (
      await axiosInstance.post("/teacher/assignments", toFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,
  updateAssignment: async ({ id, payload }) => (await axiosInstance.put(`/teacher/assignments/${id}`, payload)).data,
  deleteAssignment: async (id) => (await axiosInstance.delete(`/teacher/assignments/${id}`)).data,
  getAssignmentSubmissions: async (id) => (await axiosInstance.get(`/teacher/assignments/${id}/submissions`)).data,
  gradeSubmission: async ({ assignmentId, studentId, payload }) =>
    (await axiosInstance.put(`/teacher/assignments/${assignmentId}/grade/${studentId}`, payload)).data,
  getResults: async (params) => (await axiosInstance.get("/teacher/results", { params })).data,
  saveResult: async (payload) => (await axiosInstance.post("/teacher/results", payload)).data,
  bulkResults: async (results) => (await axiosInstance.post("/teacher/results/bulk", { results })).data,
  publishResults: async (payload) => (await axiosInstance.post("/teacher/results/publish", payload)).data,
  sendAnnouncement: async (payload) => (await axiosInstance.post("/teacher/announcements", payload)).data,
};
