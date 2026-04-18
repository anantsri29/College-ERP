import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { subadminApi } from "../../api/subadminApi";
import SectionCard from "../../components/common/SectionCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import AppButton from "../../components/common/AppButton";
import AppTable from "../../components/common/AppTable";

const SubAdminDashboardPage = ({ initialTab = "teachers", showTabs = true }) => {
  const [tab, setTab] = useState(initialTab);
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ["subadmin-dashboard"], queryFn: subadminApi.getDashboard });
  const teachers = useQuery({ queryKey: ["subadmin-teachers"], queryFn: () => subadminApi.getTeachers({ limit: 50 }) });
  const students = useQuery({ queryKey: ["subadmin-students"], queryFn: () => subadminApi.getStudents({ limit: 50 }) });
  const subjects = useQuery({ queryKey: ["subadmin-subjects"], queryFn: subadminApi.getSubjects });
  const leaves = useQuery({ queryKey: ["subadmin-leaves"], queryFn: () => subadminApi.getLeaveRequests({ status: "pending" }) });
  const attendanceReport = useQuery({ queryKey: ["subadmin-attendance-report"], queryFn: () => subadminApi.getAttendanceReport({}) });

  const { register: registerTeacher, handleSubmit: submitTeacher, reset: resetTeacher } = useForm({
    defaultValues: { name: "", email: "", password: "Teacher@123", employeeId: "" },
  });
  const { register: registerStudent, handleSubmit: submitStudent, reset: resetStudent } = useForm({
    defaultValues: { name: "", email: "", password: "Student@123", rollNumber: "", semester: 1 },
  });
  const { register: registerSubject, handleSubmit: submitSubject, reset: resetSubject } = useForm({
    defaultValues: { name: "", code: "", semester: 1, credits: 4, type: "theory" },
  });
  const { register: registerTimetable, handleSubmit: submitTimetable, reset: resetTimetable } = useForm({
    defaultValues: { semester: 1, academicYear: "2024-25", section: "A" },
  });

  const addTeacher = useMutation({
    mutationFn: subadminApi.createTeacher,
    onSuccess: () => {
      toast.success("Teacher created");
      queryClient.invalidateQueries({ queryKey: ["subadmin-teachers"] });
      resetTeacher();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create teacher"),
  });

  const addStudent = useMutation({
    mutationFn: subadminApi.createStudent,
    onSuccess: () => {
      toast.success("Student created");
      queryClient.invalidateQueries({ queryKey: ["subadmin-students"] });
      resetStudent();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create student"),
  });

  const addSubject = useMutation({
    mutationFn: subadminApi.createSubject,
    onSuccess: () => {
      toast.success("Subject created");
      queryClient.invalidateQueries({ queryKey: ["subadmin-subjects"] });
      resetSubject();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create subject"),
  });

  const reviewLeave = useMutation({
    mutationFn: subadminApi.reviewLeaveRequest,
    onSuccess: () => {
      toast.success("Leave reviewed");
      queryClient.invalidateQueries({ queryKey: ["subadmin-leaves"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to review leave"),
  });

  const saveTimetable = useMutation({
    mutationFn: subadminApi.saveTimetable,
    onSuccess: () => {
      toast.success("Timetable saved");
      resetTimetable();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to save timetable"),
  });

  const stats = dashboard.data?.data?.stats || {};

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Subadmin Workspace"
        subtitle="Department-focused operations for staff, students, subjects, attendance analytics, timetable, and leave reviews."
      >
        <p className="text-sm text-slate-600">
          Department-focused operations for staff, students, subjects, attendance analytics, timetable, and leave reviews.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
            <p className="text-xs text-slate-500">Students</p>
            <p className="text-lg font-semibold">{stats.students || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
            <p className="text-xs text-slate-500">Teachers</p>
            <p className="text-lg font-semibold">{stats.teachers || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
            <p className="text-xs text-slate-500">Subjects</p>
            <p className="text-lg font-semibold">{stats.subjects || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
            <p className="text-xs text-slate-500">Pending Leaves</p>
            <p className="text-lg font-semibold">{stats.pendingLeaves || 0}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Manage Department">
        {showTabs && <div className="flex flex-wrap gap-2 mb-5">
          {[
            { id: "teachers", label: "Teachers" },
            { id: "students", label: "Students" },
            { id: "subjects", label: "Subjects" },
            { id: "leaves", label: "Leaves" },
            { id: "attendance", label: "Attendance" },
            { id: "timetable", label: "Timetable" },
          ].map((t) => (
            <AppButton
              key={t.id}
              variant={tab === t.id ? "primary" : "secondary"}
              className="px-3 py-1.5"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </AppButton>
          ))}
        </div>}

        {tab === "teachers" && (
          <div className="space-y-4">
            <form className="grid md:grid-cols-5 gap-3" onSubmit={submitTeacher((v) => addTeacher.mutate(v))}>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Name" {...registerTeacher("name")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" type="email" {...registerTeacher("email")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Password" {...registerTeacher("password")} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Employee ID" {...registerTeacher("employeeId")} required />
              <AppButton type="submit" disabled={addTeacher.isPending}>
                {addTeacher.isPending ? "Adding..." : "Add Teacher"}
              </AppButton>
            </form>
            {teachers.isLoading && <LoadingState label="Loading teachers..." />}
            {!teachers.isLoading && (teachers.data?.data || []).length === 0 && <EmptyState label="No teachers found." />}
            {!teachers.isLoading && (teachers.data?.data || []).length > 0 && (
              <AppTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "employeeId", label: "Employee ID" },
                ]}
                rows={(teachers.data?.data || []).map((t) => ({
                  id: t._id,
                  name: t.name,
                  email: t.email,
                  employeeId: t.employeeId,
                }))}
              />
            )}
          </div>
        )}

        {tab === "students" && (
          <div className="space-y-4">
            <form className="grid md:grid-cols-6 gap-3" onSubmit={submitStudent((v) => addStudent.mutate({ ...v, semester: Number(v.semester) }))}>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Name" {...registerStudent("name")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Email" type="email" {...registerStudent("email")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Password" {...registerStudent("password")} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Roll Number" {...registerStudent("rollNumber")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="8" {...registerStudent("semester")} />
              <AppButton type="submit" disabled={addStudent.isPending}>
                {addStudent.isPending ? "Adding..." : "Add Student"}
              </AppButton>
            </form>
            {students.isLoading && <LoadingState label="Loading students..." />}
            {!students.isLoading && (students.data?.data || []).length === 0 && <EmptyState label="No students found." />}
            {!students.isLoading && (students.data?.data || []).length > 0 && (
              <AppTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "rollNumber", label: "Roll" },
                  { key: "semester", label: "Semester" },
                ]}
                rows={(students.data?.data || []).map((s) => ({
                  id: s._id,
                  name: s.name,
                  email: s.email,
                  rollNumber: s.rollNumber,
                  semester: s.semester,
                }))}
              />
            )}
          </div>
        )}

        {tab === "subjects" && (
          <div className="space-y-4">
            <form className="grid md:grid-cols-6 gap-3" onSubmit={submitSubject((v) => addSubject.mutate({ ...v, semester: Number(v.semester), credits: Number(v.credits) }))}>
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Subject Name" {...registerSubject("name")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Code" {...registerSubject("code")} required />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="8" {...registerSubject("semester")} />
              <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="6" {...registerSubject("credits")} />
              <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerSubject("type")}>
                <option value="theory">theory</option><option value="practical">practical</option><option value="elective">elective</option>
              </select>
              <AppButton type="submit" disabled={addSubject.isPending}>
                {addSubject.isPending ? "Adding..." : "Add Subject"}
              </AppButton>
            </form>
            {subjects.isLoading && <LoadingState label="Loading subjects..." />}
            {!subjects.isLoading && (subjects.data?.data || []).length === 0 && <EmptyState label="No subjects found." />}
            {!subjects.isLoading && (subjects.data?.data || []).length > 0 && (
              <AppTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "code", label: "Code" },
                  { key: "semester", label: "Semester" },
                  { key: "teacher", label: "Teacher" },
                ]}
                rows={(subjects.data?.data || []).map((s) => ({
                  id: s._id,
                  name: s.name,
                  code: s.code,
                  semester: s.semester,
                  teacher: s.teacher?.name || "-",
                }))}
              />
            )}
          </div>
        )}

        {tab === "leaves" && (
          <div className="space-y-2">
            {leaves.isLoading && <LoadingState label="Loading leave requests..." />}
            {!leaves.isLoading && (leaves.data?.data || []).length === 0 && <EmptyState label="No pending leave requests." />}
            {(leaves.data?.data || []).map((l) => (
              <div key={l._id} className="app-card p-4 bg-slate-50/60">
                <p className="text-sm font-medium">{l.applicant?.name} - {l.type}</p>
                <p className="text-xs text-slate-500 mb-2">{new Date(l.fromDate).toLocaleDateString()} to {new Date(l.toDate).toLocaleDateString()}</p>
                <p className="text-sm mb-2">{l.reason}</p>
                <div className="flex gap-2">
                  <AppButton variant="primary" className="bg-emerald-600 border-emerald-600 hover:bg-emerald-700" onClick={() => reviewLeave.mutate({ id: l._id, payload: { status: "approved", reviewRemarks: "Approved" } })}>
                    Approve
                  </AppButton>
                  <AppButton variant="danger" onClick={() => reviewLeave.mutate({ id: l._id, payload: { status: "rejected", reviewRemarks: "Rejected" } })}>
                    Reject
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "attendance" && (
          <div className="space-y-2">
            {attendanceReport.isLoading && <LoadingState label="Loading attendance report..." />}
            {!attendanceReport.isLoading && (attendanceReport.data?.data || []).length === 0 && <EmptyState label="No attendance report data." />}
            {(attendanceReport.data?.data || []).slice(0, 25).map((r, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-3 flex justify-between bg-white">
                <span className="text-sm">{r.student?.name || "Student"} - {r.subject?.name || "Subject"}</span>
                <span className="text-sm font-medium">{r.percentage}%</span>
              </div>
            ))}
          </div>
        )}

        {tab === "timetable" && (
          <form className="grid md:grid-cols-4 gap-3" onSubmit={submitTimetable((v) => saveTimetable.mutate({ ...v, semester: Number(v.semester), schedule: [] }))}>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="8" placeholder="Semester" {...registerTimetable("semester")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Academic Year" {...registerTimetable("academicYear")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Section" {...registerTimetable("section")} />
            <AppButton type="submit" disabled={saveTimetable.isPending}>
              {saveTimetable.isPending ? "Saving..." : "Save Empty Timetable"}
            </AppButton>
          </form>
        )}
      </SectionCard>
    </div>
  );
};

export default SubAdminDashboardPage;
