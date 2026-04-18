import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { teacherApi } from "../../api/teacherApi";
import SectionCard from "../../components/common/SectionCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import AppButton from "../../components/common/AppButton";
import AppTable from "../../components/common/AppTable";

const TeacherDashboardPage = ({ initialTab = "overview", showTabs = true }) => {
  const [tab, setTab] = useState(initialTab);
  const [selectedAttendanceSubjectId, setSelectedAttendanceSubjectId] = useState("");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceSubjectId, setAttendanceSubjectId] = useState("");
  const [submissionAssignmentId, setSubmissionAssignmentId] = useState("");
  const [gradePayload, setGradePayload] = useState({ marks: "", feedback: "" });
  const [resultRows, setResultRows] = useState([]);
  const queryClient = useQueryClient();
  const dashboard = useQuery({ queryKey: ["teacher-dashboard"], queryFn: teacherApi.getDashboard });
  const subjects = useQuery({ queryKey: ["teacher-subjects"], queryFn: teacherApi.getSubjects });
  const assignments = useQuery({ queryKey: ["teacher-assignments"], queryFn: teacherApi.getAssignments });
  const results = useQuery({ queryKey: ["teacher-results"], queryFn: () => teacherApi.getResults({ limit: 20 }) });
  const subjectStudents = useQuery({
    queryKey: ["teacher-subject-students", selectedAttendanceSubjectId],
    queryFn: () => teacherApi.getSubjectStudents(selectedAttendanceSubjectId),
    enabled: !!selectedAttendanceSubjectId,
  });
  const attendanceHistory = useQuery({
    queryKey: ["teacher-attendance-history", attendanceSubjectId],
    queryFn: () => teacherApi.getAttendanceBySubject({ subjectId: attendanceSubjectId }),
    enabled: !!attendanceSubjectId,
  });
  const assignmentSubmissions = useQuery({
    queryKey: ["teacher-assignment-submissions", submissionAssignmentId],
    queryFn: () => teacherApi.getAssignmentSubmissions(submissionAssignmentId),
    enabled: !!submissionAssignmentId,
  });

  const { register: registerAssignment, handleSubmit: submitAssignment, reset: resetAssignment } = useForm({
    defaultValues: { title: "", subject: "", dueDate: "", description: "", maxMarks: 10, academicYear: "2024-25" },
  });
  const { register: registerAttendance, handleSubmit: submitAttendance, reset: resetAttendance } = useForm({
    defaultValues: { subject: "", date: "", lectureType: "lecture", topic: "", semester: 1, academicYear: "2024-25" },
  });
  const { register: registerAnnouncement, handleSubmit: submitAnnouncement, reset: resetAnnouncement } = useForm({
    defaultValues: { title: "", message: "", subject: "", priority: "medium" },
  });
  const { register: registerResult, handleSubmit: submitResult, reset: resetResult } = useForm({
    defaultValues: {
      student: "",
      subject: "",
      semester: 1,
      academicYear: "2024-25",
      internalMarks: 0,
      externalMarks: 0,
      practicalMarks: 0,
      credits: 4,
    },
  });

  const createAssignment = useMutation({
    mutationFn: teacherApi.createAssignment,
    onSuccess: () => {
      toast.success("Assignment created");
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
      resetAssignment();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create assignment"),
  });

  const markAttendance = useMutation({
    mutationFn: teacherApi.markAttendance,
    onSuccess: () => {
      toast.success("Attendance marked");
      setAttendanceRows([]);
      resetAttendance();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to mark attendance"),
  });

  const sendAnnouncement = useMutation({
    mutationFn: teacherApi.sendAnnouncement,
    onSuccess: () => {
      toast.success("Announcement sent");
      resetAnnouncement();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to send announcement"),
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: teacherApi.gradeSubmission,
    onSuccess: () => {
      toast.success("Submission graded");
      queryClient.invalidateQueries({ queryKey: ["teacher-assignment-submissions", submissionAssignmentId] });
      setGradePayload({ marks: "", feedback: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to grade submission"),
  });

  const publish = useMutation({
    mutationFn: teacherApi.publishResults,
    onSuccess: () => toast.success("Results published"),
    onError: (e) => toast.error(e.response?.data?.message || "Provide valid subject/semester/year"),
  });

  const saveResult = useMutation({
    mutationFn: teacherApi.saveResult,
    onSuccess: () => {
      toast.success("Result saved");
      queryClient.invalidateQueries({ queryKey: ["teacher-results"] });
      resetResult();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to save result"),
  });

  const saveBulkResults = useMutation({
    mutationFn: teacherApi.bulkResults,
    onSuccess: () => {
      toast.success("Bulk results saved");
      queryClient.invalidateQueries({ queryKey: ["teacher-results"] });
      setResultRows([]);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to save bulk results"),
  });

  const syncAttendanceRows = (subjectId) => {
    setSelectedAttendanceSubjectId(subjectId);
    const list = subjectStudents.data?.data || [];
    setAttendanceRows(
      list.map((s) => ({
        student: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        status: "present",
        remarks: "",
      })),
    );
  };

  const updateAttendanceRow = (studentId, field, value) => {
    setAttendanceRows((prev) => prev.map((r) => (r.student === studentId ? { ...r, [field]: value } : r)));
  };

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Teacher Workspace"
        subtitle="Manage classes, attendance, assignments, results publishing, and announcements from one place."
      >
        <p className="text-sm text-slate-600">
          Manage classes, attendance, assignments, results publishing, and announcements from one place.
        </p>
        {showTabs && <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "attendance", label: "Attendance" },
            { id: "assignments", label: "Assignments" },
            { id: "announcements", label: "Announcements" },
            { id: "results", label: "Results" },
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
          {dashboard.isLoading && <LoadingState label="Loading teacher overview..." />}
          {!dashboard.isLoading && (dashboard.data?.data?.subjects || []).length === 0 && (
            <EmptyState label="No assigned subjects yet." />
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {(dashboard.data?.data?.subjects || []).map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-slate-500">{s.department?.name}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "attendance" && (
        <SectionCard title="Mark Attendance">
          <form
            className="grid md:grid-cols-6 gap-3"
            onSubmit={submitAttendance((v) =>
              markAttendance.mutate({
                ...v,
                semester: Number(v.semester),
                records: attendanceRows.map((r) => ({ student: r.student, status: r.status, remarks: r.remarks })),
                date: new Date(v.date),
              }),
            )}
          >
            <select
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
              {...registerAttendance("subject")}
              onChange={(e) => syncAttendanceRows(e.target.value)}
              required
            >
              <option value="">Subject</option>
              {(subjects.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerAttendance("date")} required />
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerAttendance("lectureType")}>
              <option value="lecture">lecture</option>
              <option value="lab">lab</option>
              <option value="tutorial">tutorial</option>
            </select>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Topic" {...registerAttendance("topic")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="8" {...registerAttendance("semester")} />
            <AppButton type="submit" disabled={markAttendance.isPending}>
              {markAttendance.isPending ? "Saving..." : "Mark"}
            </AppButton>
          </form>
          {attendanceRows.length > 0 && (
            <div className="mt-4 overflow-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Student</th>
                    <th className="text-left px-3 py-2">Roll</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((r) => (
                    <tr key={r.student} className="border-t">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.rollNumber || "-"}</td>
                      <td className="px-3 py-2">
                        <select
                          className="border border-slate-200 rounded-lg px-2 py-1"
                          value={r.status}
                          onChange={(e) => updateAttendanceRow(r.student, "status", e.target.value)}
                        >
                          <option value="present">present</option>
                          <option value="absent">absent</option>
                          <option value="late">late</option>
                          <option value="excused">excused</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="border border-slate-200 rounded-lg px-2 py-1 w-full"
                          value={r.remarks}
                          onChange={(e) => updateAttendanceRow(r.student, "remarks", e.target.value)}
                          placeholder="Optional"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 grid md:grid-cols-4 gap-3">
            <select
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm md:col-span-3"
              value={attendanceSubjectId}
              onChange={(e) => setAttendanceSubjectId(e.target.value)}
            >
              <option value="">Select subject to view attendance history</option>
              {(subjects.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <AppButton
              variant="secondary"
              type="button"
              onClick={() =>
                attendanceSubjectId &&
                queryClient.invalidateQueries({ queryKey: ["teacher-attendance-history", attendanceSubjectId] })
              }
            >
              Refresh
            </AppButton>
          </div>
          {attendanceHistory.isLoading && <LoadingState label="Loading attendance history..." />}
          {!attendanceHistory.isLoading && attendanceSubjectId && (attendanceHistory.data?.data || []).length === 0 && (
            <EmptyState label="No attendance history for selected subject." />
          )}
          <div className="space-y-2 mt-3 max-h-60 overflow-auto">
            {(attendanceHistory.data?.data || []).map((row) => (
              <div key={row._id} className="rounded-xl border border-slate-200 p-3 bg-white">
                <p className="text-sm font-medium">{new Date(row.date).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">{row.topic || "No topic"} | Present: {row.totalPresent}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "assignments" && (
        <SectionCard title="Assignment Manager">
          <form
            className="grid md:grid-cols-6 gap-3 mb-4"
            onSubmit={submitAssignment((v) =>
              createAssignment.mutate({
                ...v,
                dueDate: new Date(v.dueDate),
                maxMarks: Number(v.maxMarks),
              }),
            )}
          >
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Title" {...registerAssignment("title")} required />
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerAssignment("subject")} required>
              <option value="">Subject</option>
              {(subjects.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="date" {...registerAssignment("dueDate")} required />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Description" {...registerAssignment("description")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" {...registerAssignment("maxMarks")} />
            <AppButton type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? "Creating..." : "Create"}
            </AppButton>
          </form>
          {assignments.isLoading && <LoadingState label="Loading assignments..." />}
          {!assignments.isLoading && (assignments.data?.data || []).length === 0 && <EmptyState label="No assignments created yet." />}
          <div className="space-y-2">
            {(assignments.data?.data || []).map((a) => (
              <div key={a._id} className="rounded-xl border border-slate-200 p-3 bg-white flex justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.subject?.name} | Due {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
                <AppButton className="px-3 py-1.5" onClick={() => setSubmissionAssignmentId(a._id)}>
                  Submissions
                </AppButton>
              </div>
            ))}
          </div>
          {submissionAssignmentId && (
            <div className="mt-4 app-card p-4 bg-slate-50/60">
              <h3 className="text-sm font-semibold mb-2">Submission Grading</h3>
              <div className="space-y-2 max-h-56 overflow-auto">
                {(assignmentSubmissions.data?.data?.submissions || []).map((s) => (
                  <div key={s.student?._id || s._id} className="rounded-xl border border-slate-200 p-3 bg-white">
                    <p className="text-sm font-medium">{s.student?.name || "Student"}</p>
                    <p className="text-xs text-slate-500 mb-2">Status: {s.status}</p>
                    <div className="grid md:grid-cols-3 gap-2">
                      <input
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                        type="number"
                        placeholder="Marks"
                        value={gradePayload.marks}
                        onChange={(e) => setGradePayload((p) => ({ ...p, marks: e.target.value }))}
                      />
                      <input
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
                        placeholder="Feedback"
                        value={gradePayload.feedback}
                        onChange={(e) => setGradePayload((p) => ({ ...p, feedback: e.target.value }))}
                      />
                      <AppButton
                        type="button"
                        disabled={gradeSubmissionMutation.isPending}
                        onClick={() =>
                          gradeSubmissionMutation.mutate({
                            assignmentId: submissionAssignmentId,
                            studentId: s.student?._id,
                            payload: {
                              marks: Number(gradePayload.marks),
                              feedback: gradePayload.feedback,
                            },
                          })
                        }
                      >
                        {gradeSubmissionMutation.isPending ? "Grading..." : "Grade"}
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {tab === "announcements" && (
        <SectionCard title="Send Announcement">
          <form className="grid md:grid-cols-5 gap-3" onSubmit={submitAnnouncement((v) => sendAnnouncement.mutate(v))}>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Title" {...registerAnnouncement("title")} required />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Message" {...registerAnnouncement("message")} required />
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerAnnouncement("subject")} required>
              <option value="">Subject</option>
              {(subjects.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerAnnouncement("priority")}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <AppButton type="submit" disabled={sendAnnouncement.isPending}>
              {sendAnnouncement.isPending ? "Sending..." : "Send"}
            </AppButton>
          </form>
        </SectionCard>
      )}

      {tab === "results" && (
        <SectionCard
          title="Result Entry & Publish"
          right={
            <AppButton
              variant="secondary"
              className="text-xs px-3 py-1.5 bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              disabled={publish.isPending}
              onClick={() => publish.mutate({ subject: "", semester: 1, academicYear: "2024-25" })}
            >
              {publish.isPending ? "Publishing..." : "Publish (sample payload)"}
            </AppButton>
          }
        >
          <form
            className="grid md:grid-cols-8 gap-3 mb-4"
            onSubmit={submitResult((v) =>
              saveResult.mutate({
                ...v,
                semester: Number(v.semester),
                internalMarks: Number(v.internalMarks),
                externalMarks: Number(v.externalMarks),
                practicalMarks: Number(v.practicalMarks),
                credits: Number(v.credits),
              }),
            )}
          >
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerResult("student")} required>
              <option value="">Student</option>
              {(subjectStudents.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerResult("subject")} required>
              <option value="">Subject</option>
              {(subjects.data?.data || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" min="1" max="8" {...registerResult("semester")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" {...registerResult("academicYear")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" placeholder="Internal" {...registerResult("internalMarks")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" placeholder="External" {...registerResult("externalMarks")} />
            <input className="border border-slate-200 rounded-xl px-3 py-2 text-sm" type="number" placeholder="Practical" {...registerResult("practicalMarks")} />
            <AppButton type="submit" disabled={saveResult.isPending}>
              {saveResult.isPending ? "Saving..." : "Save Result"}
            </AppButton>
          </form>

          <div className="mb-3 flex gap-2">
            <AppButton
              className="text-xs px-3 py-1.5"
              type="button"
              onClick={() =>
                setResultRows((prev) => [
                  ...prev,
                  { student: "", subject: "", semester: 1, academicYear: "2024-25", internalMarks: 0, externalMarks: 0, practicalMarks: 0, credits: 4 },
                ])
              }
            >
              Add Bulk Row
            </AppButton>
            <AppButton
              variant="secondary"
              className="text-xs px-3 py-1.5 bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              type="button"
              onClick={() => saveBulkResults.mutate(resultRows)}
              disabled={resultRows.length === 0 || saveBulkResults.isPending}
            >
              {saveBulkResults.isPending ? "Saving..." : "Save Bulk"}
            </AppButton>
          </div>

          {resultRows.length > 0 && (
            <div className="space-y-2 mb-4">
              {resultRows.map((row, idx) => (
                <div key={idx} className="grid md:grid-cols-8 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <select
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    value={row.student}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, student: e.target.value } : r)))
                    }
                  >
                    <option value="">Student</option>
                    {(subjectStudents.data?.data || []).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    value={row.subject}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, subject: e.target.value } : r)))
                    }
                  >
                    <option value="">Subject</option>
                    {(subjects.data?.data || []).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    type="number"
                    value={row.semester}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, semester: Number(e.target.value) } : r)))
                    }
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    value={row.academicYear}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, academicYear: e.target.value } : r)))
                    }
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    type="number"
                    value={row.internalMarks}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, internalMarks: Number(e.target.value) } : r)))
                    }
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    type="number"
                    value={row.externalMarks}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, externalMarks: Number(e.target.value) } : r)))
                    }
                  />
                  <input
                    className="border border-slate-200 rounded-xl px-2 py-1 text-sm"
                    type="number"
                    value={row.practicalMarks}
                    onChange={(e) =>
                      setResultRows((prev) => prev.map((r, i) => (i === idx ? { ...r, practicalMarks: Number(e.target.value) } : r)))
                    }
                  />
                  <button
                    className="text-xs bg-rose-50 text-rose-700 rounded-xl px-2 py-1 border border-rose-100"
                    onClick={() => setResultRows((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.isLoading && <LoadingState label="Loading results..." />}
          {!results.isLoading && (results.data?.data || []).length === 0 && <EmptyState label="No results entered yet." />}
          {!results.isLoading && (results.data?.data || []).length > 0 && (
            <AppTable
              columns={[
                { key: "student", label: "Student" },
                { key: "subject", label: "Subject" },
                { key: "totalMarks", label: "Total" },
              ]}
              rows={(results.data?.data || []).map((r) => ({
                id: r._id,
                student: r.student?.name,
                subject: r.subject?.name,
                totalMarks: r.totalMarks,
              }))}
            />
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default TeacherDashboardPage;
