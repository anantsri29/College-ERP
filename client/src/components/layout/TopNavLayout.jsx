import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaBars, FaBell, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { ROLE_NAV } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";

const cx = (...parts) => parts.filter(Boolean).join(" ");

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const useOutsideClose = (open, onClose) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open, onClose]);
  return ref;
};

const TopNavLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = useMemo(() => ROLE_NAV[user?.role] || [], [user?.role]);
  const notifRef = useOutsideClose(notifOpen, () => setNotifOpen(false));
  const profileRef = useOutsideClose(profileOpen, () => setProfileOpen(false));

  const unreadCount = notifications?.length || 0;

  const onLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              type="button"
              aria-label="Open menu"
              className="md:hidden text-slate-700"
              onClick={() => setMobileOpen((p) => !p)}
            >
              <FaBars />
            </button>
            <button
              type="button"
              className="font-bold text-slate-900 text-lg"
              onClick={() => navigate("/")}
            >
              College ERP
            </button>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 min-w-[200px]">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-700"
                onClick={() => setNotifOpen((p) => !p)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[320px] app-card shadow-md border border-slate-200">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-500">Real-time updates</p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 font-medium"
                      onClick={() => clearNotifications()}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-80 overflow-auto border-t border-slate-100">
                    {(notifications || []).slice(0, 10).map((n, idx) => (
                      <div key={n._id || idx} className="p-4 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{n.title || "Notification"}</p>
                        <p className="text-xs text-slate-500 mt-1">{n.message || ""}</p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                        </p>
                      </div>
                    ))}
                    {(notifications || []).length === 0 && (
                      <div className="p-6 text-sm text-slate-500 text-center">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Profile menu"
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <span className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    getInitials(user?.name || "U")
                  )}
                </span>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-900 leading-4">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <FaChevronDown className="text-slate-500 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 app-card shadow-md border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/change-password");
                    }}
                  >
                    Change Password
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      "px-3 py-2 rounded-xl text-sm font-medium",
                      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-[1440px] mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TopNavLayout;

