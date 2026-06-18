import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== "admin") {
        throw new Error("Access Denied. Not an administrator account.");
      }
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Invalid admin credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col justify-center items-center p-6 transition-colors duration-300">
      
      {/* Floating Logo */}
      <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/")}>
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
          GS
        </div>
        <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
          GigSphere
        </span>
      </div>

      <motion.div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button 
          onClick={() => navigate("/login")}
          className="absolute top-6 left-6 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft size={12} />
          Back
        </button>

        <div className="flex flex-col items-center text-center mt-6 mb-8 space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShieldAlert size={22} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-400">Verify user documents and moderate reported gigs</p>
        </div>

        {error && (
          <motion.div 
            className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gigsphere.com" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-white font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 text-xs text-slate-400 font-medium">
          Need Moderator credentials?{" "}
          <span onClick={() => navigate("/signup-admin")} className="text-amber-500 hover:underline cursor-pointer">
            Register Admin account
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLogin;