export const roleDefaultPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "subadmin") return "/subadmin/dashboard";
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "student") return "/student/dashboard";
  return "/login";
};
