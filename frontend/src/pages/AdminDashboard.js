import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  ShieldAlert,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Trash2,
  Ban,
  RotateCcw,
  Eye,
  Search,
  BarChart3,
  ClipboardList,
  Flag,
  UserCheck,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-extrabold">{value ?? "—"}</div>
        <div className="text-xs font-semibold text-slate-400 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

// ─── College ID Preview Modal ─────────────────────────────────────────────────
function IDPreviewModal({ user, onClose, onApprove, onReject }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-lg">{user.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {user.role === "student"
                ? `Roll Number: ${user.studentRollNumber || "N/A"}`
                : `Business: ${user.businessName || "N/A"}`}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
              user.role === "student"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-indigo-500/10 text-indigo-500"
            }`}
          >
            {user.role}
          </span>
        </div>

        {/* Document Preview */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 min-h-[200px] flex items-center justify-center">
          {user.collegeIdUrl || user.businessLicenseUrl ? (
            <img
              src={user.collegeIdUrl || user.businessLicenseUrl}
              alt="ID Document"
              className="max-w-full max-h-[280px] object-contain"
            />
          ) : (
            <div className="text-center text-slate-400 p-8">
              <Eye size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No document uploaded</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => onReject(user._id)}
            className="py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle size={14} />
            Reject
          </button>
          <button
            onClick={() => onApprove(user._id)}
            className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={14} />
            Approve
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [reportedGigs, setReportedGigs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUser, setPreviewUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Data Fetchers ──
  const fetchAnalytics = async () => {
    try {
      const data = await api.get("/admin/analytics");
      setAnalytics(data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/users/unverified");
      setPendingUsers(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportedGigs = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/gigs/reported");
      setReportedGigs(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/users");
      setAllUsers(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "verifications") fetchPendingUsers();
    if (activeTab === "reports") fetchReportedGigs();
    if (activeTab === "users") fetchAllUsers();
  }, [activeTab]);

  // ── Actions ──
  const flash = (msg, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleVerify = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { status });
      flash(`User ${status === "verified" ? "approved" : "rejected"} successfully.`);
      setPreviewUser(null);
      fetchPendingUsers();
      fetchAnalytics();
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleToggleSuspension = async (userId, currentState) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`, {
        isSuspended: !currentState,
      });
      flash(`User ${!currentState ? "suspended" : "unsuspended"} successfully.`);
      fetchAllUsers();
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm("Permanently delete this reported gig?")) return;
    try {
      await api.delete(`/admin/gigs/${gigId}`);
      flash("Gig removed by moderation.");
      fetchReportedGigs();
      fetchAnalytics();
    } catch (err) {
      flash(err.message, true);
    }
  };

  const handleClearReports = async (gigId) => {
    try {
      await api.put(`/admin/gigs/${gigId}/reports/clear`, {});
      flash("Reports cleared — gig is clean.");
      fetchReportedGigs();
      fetchAnalytics();
    } catch (err) {
      flash(err.message, true);
    }
  };

  // ── Nav items ──
  const navItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "verifications", label: "Verifications", icon: UserCheck },
    { id: "reports", label: "Fraud Reports", icon: Flag },
    { id: "users", label: "User Management", icon: Users },
  ];

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
              GS
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              GigSphere
            </span>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center border border-amber-500/20 text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-xs truncate">{user?.name}</div>
              <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                <ShieldAlert size={10} />
                Administrator
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                  activeTab === id
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                {label}
                {id === "verifications" && pendingUsers.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {pendingUsers.length}
                  </span>
                )}
                {id === "reports" && reportedGigs.length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {reportedGigs.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-200/50 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Dark Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/40 transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
          <h2 className="font-extrabold text-base tracking-tight capitalize">
            {navItems.find((n) => n.id === activeTab)?.label} Panel
          </h2>
          <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldAlert size={12} />
            Admin Mode
          </div>
        </header>

        {/* Feedback banners */}
        <div className="px-6 pt-4">
          <AnimatePresence>
            {successMsg && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle size={14} />
                {successMsg}
              </motion.div>
            )}
            {errorMsg && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 text-xs font-semibold flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && analytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <StatCard icon={GraduationCap} label="Total Students" value={analytics.users.students} color="bg-emerald-500/10 text-emerald-500" />
                <StatCard icon={Briefcase} label="Total Employers" value={analytics.users.employers} color="bg-indigo-500/10 text-indigo-500" />
                <StatCard icon={CheckCircle} label="Verified Users" value={analytics.users.verified} color="bg-violet-500/10 text-violet-500" />
                <StatCard icon={AlertTriangle} label="Pending Reviews" value={analytics.users.unverified} color="bg-amber-500/10 text-amber-500" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Total Gigs" value={analytics.gigs.total} color="bg-sky-500/10 text-sky-500" />
                <StatCard icon={TrendingUp} label="Active Gigs" value={analytics.gigs.active} color="bg-indigo-500/10 text-indigo-500" />
                <StatCard icon={CheckCircle} label="Completed Gigs" value={analytics.gigs.completed} color="bg-emerald-500/10 text-emerald-500" />
                <StatCard icon={Flag} label="Reported Gigs" value={analytics.gigs.reported} color="bg-rose-500/10 text-rose-500" />
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                  <DollarSign size={28} />
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-mono text-violet-500">
                    ${analytics.financials.totalPayouts.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-1">
                    Total Platform Payouts (all time)
                  </div>
                </div>
              </div>

              {/* Completion Rate Bar */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Gig Completion Rate</span>
                  <span className="text-emerald-500">
                    {analytics.gigs.total
                      ? Math.round((analytics.gigs.completed / analytics.gigs.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: analytics.gigs.total
                        ? `${(analytics.gigs.completed / analytics.gigs.total) * 100}%`
                        : "0%",
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── VERIFICATIONS ── */}
          {activeTab === "verifications" && (
            <div className="space-y-6 mt-2">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-amber-500 flex items-center gap-2">
                  <UserCheck size={16} />
                  Pending Verification Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Review uploaded documents and approve or reject each account
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                  <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400 opacity-50" />
                  All caught up — no pending verification requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((u) => (
                    <div
                      key={u._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-11 w-11 rounded-full font-bold flex items-center justify-center border text-sm shrink-0 ${
                            u.role === "student"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                          }`}
                        >
                          {u.name?.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm flex items-center gap-2">
                            {u.name}
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                u.role === "student"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-indigo-500/10 text-indigo-500"
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                          <div className="text-[10px] text-slate-400">
                            {u.role === "student"
                              ? `Roll: ${u.studentRollNumber || "N/A"}`
                              : `Business: ${u.businessName || "N/A"}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setPreviewUser(u)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-500 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={13} />
                          View ID
                        </button>
                        <button
                          onClick={() => handleVerify(u._id, "rejected")}
                          className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(u._id, "verified")}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FRAUD REPORTS ── */}
          {activeTab === "reports" && (
            <div className="space-y-6 mt-2">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-rose-500 flex items-center gap-2">
                  <Flag size={16} />
                  Reported Gigs Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Review fraud complaints and take moderation action
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
                </div>
              ) : reportedGigs.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                  <Flag size={36} className="mx-auto mb-3 opacity-30" />
                  No reported gigs at this time.
                </div>
              ) : (
                <div className="space-y-5">
                  {reportedGigs.map((gig) => (
                    <div
                      key={gig._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      {/* Gig header */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm">{gig.title}</h4>
                          <p className="text-xs text-slate-400">
                            Posted by:{" "}
                            <strong>
                              {gig.employer?.businessName || gig.employer?.name}
                            </strong>{" "}
                            — {gig.employer?.email}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full uppercase">
                          {gig.reports?.length} report{gig.reports?.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Reports list */}
                      <div className="space-y-2">
                        {gig.reports?.map((report, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/20 text-xs text-rose-700 dark:text-rose-400"
                          >
                            <span className="font-bold">
                              {report.reporter?.name || "Unknown"} ({report.reporter?.role}):
                            </span>{" "}
                            {report.reason}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-850">
                        <button
                          onClick={() => handleClearReports(gig._id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
                        >
                          <RotateCcw size={12} />
                          Mark Safe & Clear
                        </button>
                        <button
                          onClick={() => handleDeleteGig(gig._id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <Trash2 size={12} />
                          Remove Gig
                        </button>
                        {/* Suspend employer */}
                        <button
                          onClick={() =>
                            handleToggleSuspension(
                              gig.employer?._id,
                              gig.employer?.isSuspended
                            )
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs font-bold transition-all"
                        >
                          <Ban size={12} />
                          Suspend Employer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── USER MANAGEMENT ── */}
          {activeTab === "users" && (
            <div className="space-y-6 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-500 flex items-center gap-2">
                    <Users size={16} />
                    All Users
                  </h3>
                  <p className="text-xs text-slate-400">Search, verify, and suspend platform accounts</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800">
                        <th className="px-5 py-3.5">User</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Trust Score</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-bold">{u.name}</div>
                            <div className="text-slate-400 text-[10px]">{u.email}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                u.role === "student"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : u.role === "employer"
                                  ? "bg-indigo-500/10 text-indigo-500"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {u.isSuspended ? (
                                <span className="text-[9px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                                  Suspended
                                </span>
                              ) : u.isVerified ? (
                                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                                  Verified
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                                  Pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-indigo-500">
                            {u.trustScore ?? "—"}/100
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!u.isVerified && u.role !== "admin" && (
                                <button
                                  onClick={() => setPreviewUser(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 text-[10px] font-bold hover:bg-indigo-100 transition-all"
                                >
                                  Review
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  onClick={() =>
                                    handleToggleSuspension(u._id, u.isSuspended)
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                    u.isSuspended
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 hover:bg-emerald-100"
                                      : "bg-rose-50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-100"
                                  }`}
                                >
                                  {u.isSuspended ? "Unsuspend" : "Suspend"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No users match your search.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── ID Preview Modal ── */}
      <AnimatePresence>
        {previewUser && (
          <IDPreviewModal
            user={previewUser}
            onClose={() => setPreviewUser(null)}
            onApprove={(id) => handleVerify(id, "verified")}
            onReject={(id) => handleVerify(id, "rejected")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
