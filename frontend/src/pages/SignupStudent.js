import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, ArrowLeft, Loader2, AlertCircle, CheckCircle, MapPin, Upload } from "lucide-react";

function SignupStudent() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [collegeIdBase64, setCollegeIdBase64] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Request geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => {
          console.warn("Location permission denied. Defaulting to profile coordinates.", err);
        }
      );
    }
  }, []);

  // Convert uploaded file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollegeIdBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!collegeIdBase64) {
      setError("Please upload a scan of your College ID Card for verification.");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role: "student",
      studentRollNumber: rollNumber,
      collegeIdUrl: collegeIdBase64,
      skills,
      bio,
      latitude,
      longitude
    };

    try {
      await register(payload);
      setSuccess("Student profile created successfully! Please wait for admin approval.");
      setTimeout(() => {
        navigate("/student-login");
      }, 3000);
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
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative"
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
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Student Registration</h2>
          <p className="text-xs text-slate-400">Join verified students finding gigs nearby</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Alex Carter" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Roll Number</label>
              <input 
                type="text" required value={rollNumber} onChange={(e) => setRollNumber(e.target.value)}
                placeholder="ST-849302" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email (University Preferred)</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@college.edu" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills (Comma-separated)</label>
            <input 
              type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
              placeholder="Retail, Writing, Graphic Design, Event Management" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Bio</label>
            <textarea 
              value={bio} onChange={(e) => setBio(e.target.value)} rows="2"
              placeholder="Describe your schedule, background, and previous experience..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
            />
          </div>

          {/* College ID upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload College ID Card Scan</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
              <input 
                type="file" accept="image/*" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {collegeIdBase64 ? (
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs">
                  <CheckCircle size={16} />
                  <span>College ID Loaded successfully!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5 text-slate-400 text-xs">
                  <Upload size={20} />
                  <span className="font-semibold text-slate-500">Click to upload image file</span>
                  <span>JPG, PNG, or SVG format</span>
                </div>
              )}
            </div>
          </div>

          {/* Hyperlocal location status feedback */}
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3">
            <MapPin size={18} className="text-indigo-500 animate-bounce" />
            <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {latitude && longitude ? (
                <span className="text-emerald-500 font-semibold">
                  Hyperlocal Coordinates locked: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              ) : (
                <span>Locking location via browser... please accept the browser geolocation prompt.</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Complete Registration"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Already registered?{" "}
          <span onClick={() => navigate("/student-login")} className="text-emerald-500 hover:underline cursor-pointer">
            Login here
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupStudent;