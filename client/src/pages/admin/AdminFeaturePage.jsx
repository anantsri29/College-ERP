import { useLocation } from "react-router-dom";
import AdminDashboardPage from "./AdminDashboardPage";

const tabByPath = {
  "/admin/dashboard": "users",
  "/admin/users": "users",
  "/admin/departments": "departments",
  "/admin/academic-years": "academic",
  "/admin/reports": "reports",
};

const AdminFeaturePage = () => {
  const { pathname } = useLocation();
  return <AdminDashboardPage initialTab={tabByPath[pathname] || "users"} showTabs={false} />;
};

export default AdminFeaturePage;
