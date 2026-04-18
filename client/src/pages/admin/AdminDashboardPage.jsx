import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import SectionCard from "../../components/common/SectionCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import AppButton from "../../components/common/AppButton";
import AppTable from "../../components/common/AppTable";

const AdminDashboardPage = ({ initialTab = "users", showTabs = true }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminApi.getDashboard });
  const usersQuery = useQuery({
    queryKey: ["admin-users", userSearch],
    queryFn: () => adminApi.getUsers({ limit: 50, search: userSearch || undefined }),
  });
  const deptQuery = useQuery({ queryKey: ["admin-departments"], queryFn: adminApi.getDepartments });
  const yearsQuery = useQuery({ queryKey: ["admin-years"], queryFn: adminApi.getAcademicYears });
  const attendanceReportQuery = useQuery({
    queryKey: ["admin-attendance-report"],
    queryFn: () => adminApi.getAttendanceReport({}),
  });
  const performanceReportQuery = useQuery({
    queryKey: ["admin-performance-report"],
    queryFn: () => adminApi.getPerformanceReport({}),
  });

  const users = usersQuery.data?.data || [];
  const departments = deptQuery.data?.data || [];
  const stats = dashboardQuery.data?.data?.stats;

  const {
    register: registerUser,
    handleSubmit: submitUser,
    reset: resetUserForm,
  } = useForm({
    defaultValues: { name: "", email: "", password: "College@123", role: "student", department: "", semester: 1 },
  });

  const {
    register: registerDepartment,
    handleSubmit: submitDepartment,
    reset: resetDepartmentForm,
  } = useForm({
    defaultValues: { name: "", code: "", description: "", totalSeats: 60 },
  });

  const {
    register: registerYear,
    handleSubmit: submitYear,
    reset: resetYearForm,
  } = useForm({
    defaultValues: {
      year: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      description: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      resetUserForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create user"),
  });

  const updateUserMutation = useMutation({
    mutationFn: adminApi.updateUser,
    onSuccess: () => {
      toast.success("User updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update user"),
  });

  const deactivateUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success("User deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to deactivate user"),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: adminApi.createDepartment,
    onSuccess: () => {
      toast.success("Department created");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      resetDepartmentForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create department"),
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: adminApi.updateDepartment,
    onSuccess: () => {
      toast.success("Department updated");
      setEditingDepartment(null);
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update department"),
  });

  const deactivateDepartmentMutation = useMutation({
    mutationFn: adminApi.deleteDepartment,
    onSuccess: () => {
      toast.success("Department deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-departments"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to deactivate department"),
  });

  const createYearMutation = useMutation({
    mutationFn: adminApi.createAcademicYear,
    onSuccess: () => {
      toast.success("Academic year created");
      queryClient.invalidateQueries({ queryKey: ["admin-years"] });
      resetYearForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create academic year"),
  });

  const updateYearMutation = useMutation({
    mutationFn: adminApi.updateAcademicYear,
    onSuccess: () => {
      toast.success("Academic year updated");
      queryClient.invalidateQueries({ queryKey: ["admin-years"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update academic year"),
  });

  const compactStats = useMemo(
    () => [
      { label: "Students", value: stats?.totalStudents ?? 0 },
      { label: "Teachers", value: stats?.totalTeachers ?? 0 },
      { label: "Departments", value: stats?.totalDepartments ?? 0 },
      { label: "Subjects", value: stats?.totalSubjects ?? 0 },
    ],
    [stats],
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <SectionCard title="Admin Control Center" subtitle="Core platform operations and institutional metrics.">
        <p className="text-sm text-slate-600">
          Production-style user and department management connected to backend CRUD APIs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {compactStats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Manage Data">
        {showTabs && <div className="flex flex-wrap gap-2 mb-5">
          {[
            { id: "users", label: "Users" },
            { id: "departments", label: "Departments" },
            { id: "academic", label: "Academic Years" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <AppButton
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "secondary"}
              className="px-3 py-1.5"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </AppButton>
          ))}
        </div>}

        {activeTab === "users" && (
          <div className="space-y-4">
            <form
              className="grid md:grid-cols-6 gap-3"
              onSubmit={submitUser((values) => {
                createUserMutation.mutate({ ...values, semester: Number(values.semester) || undefined });
              })}
            >
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Name" {...registerUser("name")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" type="email" {...registerUser("email")} required />
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerUser("role")}>
                <option value="student">student</option>
                <option value="teacher">teacher</option>
                <option value="subadmin">subadmin</option>
                <option value="admin">admin</option>
              </select>
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerUser("department")}>
                <option value="">Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Semester" type="number" min="1" max="8" {...registerUser("semester")} />
              <AppButton type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </AppButton>
            </form>

            <div className="flex gap-2">
              <input
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-full"
                placeholder="Search users by name/email/roll/employee..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <AppButton onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>
                Refresh
              </AppButton>
            </div>

            {usersQuery.isLoading && <LoadingState label="Loading users..." />}
            {!usersQuery.isLoading && users.length === 0 && <EmptyState label="No users found." />}
            {!usersQuery.isLoading && users.length > 0 && (
              <AppTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "role", label: "Role" },
                  { key: "department", label: "Department" },
                  { key: "status", label: "Status" },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                      <div className="flex items-center gap-2">
                        <button className="text-indigo-600 text-xs font-medium" onClick={row.onEdit}>
                          Edit
                        </button>
                        <button className="text-rose-600 text-xs font-medium" onClick={row.onDeactivate}>
                          Deactivate
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={users.map((u) => ({
                  id: u._id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  department: u.department?.name || "-",
                  status: u.isActive ? "Active" : "Inactive",
                  onEdit: () =>
                    setEditingUser({
                      id: u._id,
                      name: u.name,
                      phone: u.phone || "",
                      semester: u.semester || "",
                    }),
                  onDeactivate: () => deactivateUserMutation.mutate(u._id),
                }))}
              />
            )}

            {editingUser && (
              <div className="app-card p-4 bg-slate-50/60 space-y-3">
                <h3 className="font-semibold text-sm">Edit User</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser((p) => ({ ...p, name: e.target.value }))}
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone"
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    type="number"
                    value={editingUser.semester}
                    onChange={(e) => setEditingUser((p) => ({ ...p, semester: Number(e.target.value) || "" }))}
                    placeholder="Semester"
                  />
                </div>
                <div className="flex gap-2">
                  <AppButton
                    onClick={() =>
                      updateUserMutation.mutate({
                        id: editingUser.id,
                        payload: {
                          name: editingUser.name,
                          phone: editingUser.phone,
                          semester: editingUser.semester || undefined,
                        },
                      })
                    }
                  >
                    Save
                  </AppButton>
                  <AppButton variant="secondary" onClick={() => setEditingUser(null)}>
                    Cancel
                  </AppButton>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "departments" && (
          <div className="space-y-4">
            <form className="grid md:grid-cols-5 gap-3" onSubmit={submitDepartment((values) => createDepartmentMutation.mutate({ ...values, totalSeats: Number(values.totalSeats) }))}>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Department Name" {...registerDepartment("name")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Code (CSE)" {...registerDepartment("code")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Description" {...registerDepartment("description")} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" placeholder="Total Seats" {...registerDepartment("totalSeats")} />
              <AppButton type="submit" disabled={createDepartmentMutation.isPending}>
                {createDepartmentMutation.isPending ? "Creating..." : "Create Department"}
              </AppButton>
            </form>
            {deptQuery.isLoading && <LoadingState label="Loading departments..." />}
            {!deptQuery.isLoading && departments.length === 0 && <EmptyState label="No departments found." />}

            <div className="overflow-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Code</th>
                    <th className="text-left px-3 py-2">Seats</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((d) => (
                    <tr key={d._id} className="border-t">
                      <td className="px-3 py-2">{d.name}</td>
                      <td className="px-3 py-2">{d.code}</td>
                      <td className="px-3 py-2">{d.totalSeats}</td>
                      <td className="px-3 py-2">{d.isActive ? "Active" : "Inactive"}</td>
                      <td className="px-3 py-2 space-x-2">
                        <button
                          className="text-indigo-600"
                          onClick={() => setEditingDepartment({ id: d._id, name: d.name, description: d.description || "", totalSeats: d.totalSeats })}
                        >
                          Edit
                        </button>
                        <button className="text-red-600" onClick={() => deactivateDepartmentMutation.mutate(d._id)}>
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingDepartment && (
              <div className="app-card p-4 bg-slate-50/60 space-y-2">
                <h3 className="font-semibold text-sm">Edit Department</h3>
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    value={editingDepartment.name}
                    onChange={(e) => setEditingDepartment((p) => ({ ...p, name: e.target.value }))}
                  />
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    value={editingDepartment.description}
                    onChange={(e) => setEditingDepartment((p) => ({ ...p, description: e.target.value }))}
                  />
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    type="number"
                    value={editingDepartment.totalSeats}
                    onChange={(e) => setEditingDepartment((p) => ({ ...p, totalSeats: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex gap-2">
                  <AppButton
                    onClick={() =>
                      updateDepartmentMutation.mutate({
                        id: editingDepartment.id,
                        payload: {
                          name: editingDepartment.name,
                          description: editingDepartment.description,
                          totalSeats: editingDepartment.totalSeats,
                        },
                      })
                    }
                  >
                    Save
                  </AppButton>
                  <AppButton variant="secondary" onClick={() => setEditingDepartment(null)}>
                    Cancel
                  </AppButton>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "academic" && (
          <div className="space-y-4">
            <form
              className="grid md:grid-cols-6 gap-3"
              onSubmit={submitYear((values) =>
                createYearMutation.mutate({
                  ...values,
                  startDate: new Date(values.startDate),
                  endDate: new Date(values.endDate),
                  semesters: [],
                }),
              )}
            >
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Year (2026-27)" {...registerYear("year")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerYear("startDate")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerYear("endDate")} required />
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerYear("isCurrent")}>
                <option value="true">Current</option>
                <option value="false">Not Current</option>
              </select>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Description" {...registerYear("description")} />
              <AppButton type="submit" disabled={createYearMutation.isPending}>
                {createYearMutation.isPending ? "Creating..." : "Create Year"}
              </AppButton>
            </form>
            {yearsQuery.isLoading && <LoadingState label="Loading academic years..." />}
            {!yearsQuery.isLoading && (yearsQuery.data?.data || []).length === 0 && <EmptyState label="No academic years found." />}

            <div className="overflow-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Year</th>
                    <th className="text-left px-3 py-2">Start</th>
                    <th className="text-left px-3 py-2">End</th>
                    <th className="text-left px-3 py-2">Current</th>
                    <th className="text-left px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(yearsQuery.data?.data || []).map((y) => (
                    <tr key={y._id} className="border-t">
                      <td className="px-3 py-2">{y.year}</td>
                      <td className="px-3 py-2">{new Date(y.startDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{new Date(y.endDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{y.isCurrent ? "Yes" : "No"}</td>
                      <td className="px-3 py-2">
                        {!y.isCurrent && (
                          <button
                            className="text-indigo-600"
                            onClick={() => updateYearMutation.mutate({ id: y._id, payload: { isCurrent: true } })}
                          >
                            Set Current
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 bg-slate-50">
              <h3 className="font-semibold text-sm mb-2">Attendance Report</h3>
              <p className="text-xs text-slate-500 mb-2">
                Students in low-attendance order.
              </p>
              <div className="space-y-2 max-h-80 overflow-auto">
                {(attendanceReportQuery.data?.data || []).slice(0, 20).map((row, idx) => (
                  <div key={idx} className="border rounded p-2 bg-white">
                    <p className="text-sm font-medium">{row.student?.name}</p>
                    <p className="text-xs text-slate-500">
                      {row.present}/{row.totalClasses} ({row.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-slate-50">
              <h3 className="font-semibold text-sm mb-2">Performance Report</h3>
              <p className="text-xs text-slate-500 mb-2">Grade distribution.</p>
              <div className="space-y-2">
                {(performanceReportQuery.data?.data || []).map((row) => (
                  <div key={row._id} className="border rounded p-2 bg-white flex justify-between">
                    <span className="text-sm">Grade {row._id}</span>
                    <span className="text-sm font-medium">
                      {row.count} ({Number(row.avgPercentage || 0).toFixed(2)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminDashboardPage;
