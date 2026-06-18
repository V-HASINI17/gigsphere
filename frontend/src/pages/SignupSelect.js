import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as m } from "framer-motion";
import { GraduationCap, Briefcase, ShieldAlert, ArrowLeft } from "lucide-react";

function SignupSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Floating Logo */}
      <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/")}>
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20">
          GS
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
          GigSphere
        </span>
      </div>

      <m.div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>

        <div className="text-center space-y-3 mb-12 mt-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose your path to get started on GigSphere</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student Card */}
          <m.div 
            onClick={() => navigate("/signup-student")}
            className="group cursor-pointer p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/55 dark:hover:border-emerald-500/55 bg-slate-50/50 dark:bg-slate-850 hover:bg-emerald-500/[0.02] flex flex-col justify-between items-center text-center aspect-square shadow-sm transition-all"
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <GraduationCap size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">Student</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">Upload college credentials, verify status, and start earning</p>
            </div>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-all">
              Register as Student
            </span>
          </m.div>

          {/* Employer Card */}
          <m.div 
            onClick={() => navigate("/signup-employer")}
            className="group cursor-pointer p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/55 dark:hover:border-indigo-500/55 bg-slate-50/50 dark:bg-slate-850 hover:bg-indigo-500/[0.02] flex flex-col justify-between items-center text-center aspect-square shadow-sm transition-all"
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              <Briefcase size={30} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">Employer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">Register your business details, post gigs, and verify credentials</p>
            </div>
            <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
              Register as Employer
            </span>
          </m.div>

          {/* Admin Card */}
          <m.div 
            onClick={() => navigate("/signup-admin")}
            className="group cursor-pointer p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/55 dark:hover:border-amber-500/55 bg-slate-50/50 dark:bg-slate-850 hover:bg-amber-500/[0.02] flex flex-col justify-between items-center text-center aspect-square shadow-sm transition-all"
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <ShieldAlert size={30} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-amber-500 transition-colors">Moderator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">Register as a platform moderator to verify IDs and manage safety</p>
            </div>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-all">
              Register as Admin
            </span>
          </m.div>
        </div>

        <div className="text-center mt-10 text-xs text-slate-400 font-medium">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-indigo-500 hover:underline cursor-pointer">
            Login here
          </span>
        </div>
      </m.div>
    </div>
  );
}

export default SignupSelect;