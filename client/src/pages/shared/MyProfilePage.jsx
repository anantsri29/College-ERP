import SectionCard from "../../components/common/SectionCard";
import { useAuth } from "../../hooks/useAuth";

const MyProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <SectionCard title="My Profile" subtitle="Your account details">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{user?.name || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{user?.email || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Role</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{user?.role || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Department</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{user?.department?.name || user?.department || "-"}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default MyProfilePage;

