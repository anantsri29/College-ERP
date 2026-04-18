import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { studentApi } from "../../api/studentApi";
import { notificationApi } from "../../api/notificationApi";
import { leaveApi } from "../../api/leaveApi";
import SectionCard from "../../components/common/SectionCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import AppButton from "../../components/common/AppButton";
import AppTable from "../../components/common/AppTable";

const StudentDashboardPage = ({ initialTab = "overview", showTabs = true }) => {
  const [tab, setTab] = useState(initialTab);
  const [assignmentFiles, setAssignmentFiles] = useState({});
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ["student-dashboard"], queryFn: studentApi.getDashboard });
  const attendance = useQuery({ queryKey: ["student-attendance"], queryFn: studentApi.getAttendance });
  const assignments = useQuery({ queryKey: ["student-assignments"], queryFn: studentApi.getAssignments });
  const results = useQuery({ queryKey: ["student-results"], queryFn: studentApi.getResults });
  const timetable = useQuery({ queryKey: ["student-timetable"], queryFn: studentApi.getTimetable });
  const notifications = useQuery({ queryKey: ["student-notifications"], queryFn: notificationApi.getMine });
  const leaves = useQuery({ queryKey: ["student-leaves"], queryFn: () => leaveApi.getMyLeaves("student") });

  const { register: registerLeave, handleSubmit: submitLeave, reset: resetLeave } = useForm({
    defaultValues: { type: "casual", fromDate: "", toDate: "", reason: "" },
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: studentApi.submitAssignment,
    onSuccess: () => {
      toast.success("Assignment submitted");
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to submit assignment"),
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      toast.success("Notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
  });

  const createLeave = useMutation({
    mutationFn: (payload) => leaveApi.createLeave("student", payload),
    onSuccess: () => {
      toast.success("Leave requested");
      queryClient.invalidateQueries({ queryKey: ["student-leaves"] });
      resetLeave();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to request leave"),
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Student Workspace"
        subtitle="Access attendance, assignments, results, timetable, notifications, and leave from one workspace."
      >
        <p className="text-sm text-slate-600">
          Access attendance, assignments, results, timetable, notifications, and leave from one workspace.
        </p>
        {showTabs && <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "attendance", label: "Attendance" },
            { id: "assignments", label: "Assignments" },
            { id: "results", label: "Results" },
            { id: "timetable", label: "Timetable" },
            { id: "notifications", label: "Notifications" },
            { id: "leave", label: "Leave" },
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
      </SectionCard>

      {tab === "overview" && (
        <SectionCard title="Overview">
          {dashboard.isLoading && <LoadingState label="Loading overview..." />}
          {!dashboard.isLoading && (dashboard.data?.data?.attendanceSummary || []).length === 0 && (
            <EmptyState label="No overview data yet." />
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {(dashboard.data?.data?.attendanceSummary || []).map((a) => (
              <div key={a.subject._id} className="rounded-xl border border-slate-200 bg-white p-4 flex justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.subject.name}</p>
                  <p className="text-xs text-slate-500">Attendance</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{a.percentage}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "attendance" && (
        <SectionCard title="Attendance Detail">
          {attendance.isLoading && <LoadingState label="Loading attendance..." />}
          {!attendance.isLoading && (attendance.data?.data || []).length === 0 && (
            <EmptyState label="No attendance records found." />
          )}
          {!attendance.isLoading && (attendance.data?.data || []).length > 0 && (
            <AppTable
              columns={[
                { key: "subject", label: "Subject" },
                { key: "present", label: "Present" },
                { key: "total", label: "Total" },
                { key: "percentage", label: "Percentage" },
              ]}
              rows={(attendance.data?.data || []).map((a) => ({
                id: a.subject?._id,
                subject: a.subject?.name,
                present: a.present,
                total: a.total,
                percentage: `${a.percentage}%`,
              }))}
            />
          )}
        </SectionCard>
      )}

      {tab === "assignments" && (
        <SectionCard title="Assignments">
          <div className="space-y-2">
            {(assignments.data?.data || []).map((a) => (
              <div key={a._id} className="rounded-xl border border-slate-200 p-3 bg-white flex justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    Due {new Date(a.dueDate).toLocaleDateString()} | {a.submissionStatus}
                  </p>
                </div>
                {a.submissionStatus === "not_submitted" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      className="text-xs"
                      onChange={(e) =>
                        setAssignmentFiles((prev) => ({
                          ...prev,
                          [a._id]: Array.from(e.target.files || []),
                        }))
                      }
                    />
                    <AppButton
                      className="text-xs px-3 py-1.5"
                      disabled={submitAssignmentMutation.isPending}
                      onClick={() =>
                        submitAssignmentMutation.mutate({
                          id: a._id,
                          payload: { files: assignmentFiles[a._id] || [] },
                        })
                      }
                    >
                      {submitAssignmentMutation.isPending ? "Submitting..." : "Submit"}
                    </AppButton>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!assignments.isLoading && (assignments.data?.data || []).length === 0 && (
            <EmptyState label="No assignments available." />
          )}
        </SectionCard>
      )}

      {tab === "results" && (
        <SectionCard title="Results">
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              <p className="text-xs text-slate-500">CGPA</p>
              <p className="text-xl font-semibold text-slate-900">{results.data?.data?.cgpa ?? 0}</p>
            </div>
          </div>
          {(results.data?.data?.semesterSummaries || []).length === 0 ? (
            <EmptyState label="No results published yet." />
          ) : (
            <AppTable
              columns={[
                { key: "semester", label: "Semester" },
                { key: "sgpa", label: "SGPA" },
              ]}
              rows={(results.data?.data?.semesterSummaries || []).map((s) => ({
                id: s.semester,
                semester: `Semester ${s.semester}`,
                sgpa: s.sgpa,
              }))}
            />
          )}
        </SectionCard>
      )}

      {tab === "timetable" && (
        <SectionCard title="Timetable">
          {timetable.isLoading && <LoadingState label="Loading timetable..." />}
          {!timetable.isLoading && (timetable.data?.data?.schedule || []).length === 0 && (
            <EmptyState label="No timetable published yet." />
          )}
          <div className="space-y-2">
            {(timetable.data?.data?.schedule || []).map((d) => (
              <div key={d.day} className="rounded-xl border border-slate-200 p-3 bg-white">
                <p className="text-sm font-medium">{d.day}</p>
                <p className="text-xs text-slate-500">{(d.slots || []).length} slots</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "notifications" && (
        <SectionCard
          title="Notifications"
          right={
            <AppButton className="text-xs px-3 py-1.5" onClick={() => markAllRead.mutate()}>
              {markAllRead.isPending ? "Updating..." : "Mark All Read"}
            </AppButton>
          }
        >
          {notifications.isLoading && <LoadingState label="Loading notifications..." />}
          {!notifications.isLoading && (notifications.data?.data?.notifications || []).length === 0 && (
            <EmptyState label="No notifications." />
          )}
          <div className="space-y-2">
            {(notifications.data?.data?.notifications || []).map((n) => (
              <div key={n._id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-slate-500">{n.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "leave" && (
        <SectionCard title="Leave Requests">
          <form
            className="grid md:grid-cols-5 gap-3 mb-4"
            onSubmit={submitLeave((v) =>
              createLeave.mutate({
                ...v,
                fromDate: new Date(v.fromDate),
                toDate: new Date(v.toDate),
              }),
            )}
          >
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerLeave("type")}>
              <option value="casual">casual</option>
              <option value="medical">medical</option>
              <option value="emergency">emergency</option>
              <option value="study">study</option>
            </select>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerLeave("fromDate")} required />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerLeave("toDate")} required />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Reason" {...registerLeave("reason")} required />
            <AppButton type="submit" disabled={createLeave.isPending}>
              {createLeave.isPending ? "Applying..." : "Apply"}
            </AppButton>
          </form>
          {leaves.isLoading && <LoadingState label="Loading leave requests..." />}
          {!leaves.isLoading && (leaves.data?.data || []).length === 0 && <EmptyState label="No leave requests yet." />}
          {!leaves.isLoading && (leaves.data?.data || []).length > 0 && (
            <AppTable
              columns={[
                { key: "type", label: "Type" },
                { key: "from", label: "From" },
                { key: "to", label: "To" },
                { key: "status", label: "Status" },
              ]}
              rows={(leaves.data?.data || []).map((l) => ({
                id: l._id,
                type: l.type,
                from: new Date(l.fromDate).toLocaleDateString(),
                to: new Date(l.toDate).toLocaleDateString(),
                status: l.status,
              }))}
            />
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default StudentDashboardPage;
