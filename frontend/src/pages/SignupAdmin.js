import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function SignupAdmin() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role: "admin",
      adminSecret
    };

    try {
      await register(payload);
      setSuccess("Moderator account registered successfully!");
      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col justify-center items-center py-12 px-6 transition-colors duration-300">
      
      {/* Floating Logo */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/")}>
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
          onClick={() => navigate("/signup")}
          className="absolute top-6 left-6 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft size={12} />
          Back
        </button>

        <div className="flex flex-col items-center text-center mt-4 mb-6 space-y-1">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShieldAlert size={22} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Register Moderator</h2>
          <p className="text-xs text-slate-400">Create a platform administrator or moderator credentials</p>
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

        {success && (
          <motion.div 
            className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-3"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moderator Name</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Admin Officer" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="mod@gigsphere.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
            <input 
              type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0199" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secret Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Creation Secret</label>
            <input 
              type="password" required value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Provided by platform owner" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-white font-bold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Register Moderator"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Already registered?{" "}
          <span onClick={() => navigate("/admin-login")} className="text-amber-500 hover:underline cursor-pointer">
            Login here
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupAdmin;