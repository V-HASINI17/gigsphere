import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Briefcase, ArrowLeft, Loader2, AlertCircle, CheckCircle, MapPin, Upload } from "lucide-react";

function SignupEmployer() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [licenseBase64, setLicenseBase64] = useState("");
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

  // Convert file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicenseBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
      role: "employer",
      businessName,
      businessLicenseUrl: licenseBase64,
      bio,
      latitude,
      longitude
    };

    try {
      await register(payload);
      setSuccess("Employer profile created successfully! Please wait for admin approval.");
      setTimeout(() => {
        navigate("/employer-login");
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
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Briefcase size={22} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Employer Registration</h2>
          <p className="text-xs text-slate-400">Hire verified student workers hyperlocal to your business</p>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business / Company Name</label>
              <input 
                type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Fashion Hub Inc." 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Contact Name</label>
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Email</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="hiring@fashionhub.com" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Verification Number</label>
              <input 
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">About Business / Description</label>
            <textarea 
              value={bio} onChange={(e) => setBio(e.target.value)} rows="2"
              placeholder="Describe your boutique, events organization, or business operations..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Business license upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Business Proof / License (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
              <input 
                type="file" accept="image/*" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {licenseBase64 ? (
                <div className="flex items-center gap-2 text-indigo-500 font-semibold text-xs">
                  <CheckCircle size={16} />
                  <span>Business proof image loaded!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5 text-slate-400 text-xs">
                  <Upload size={20} className="text-slate-400" />
                  <span className="font-semibold text-slate-500">Click to upload business license/proof</span>
                  <span>JPG, PNG, or SVG format</span>
                </div>
              )}
            </div>
          </div>

          {/* Location info */}
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center gap-3">
            <MapPin size={18} className="text-indigo-500 animate-bounce" />
            <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {latitude && longitude ? (
                <span className="text-indigo-500 font-semibold">
                  Business Location coordinates captured: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              ) : (
                <span>Accept geolocation permission so students can locate your gigs locally on the map.</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Complete Registration"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Already registered?{" "}
          <span onClick={() => navigate("/employer-login")} className="text-indigo-500 hover:underline cursor-pointer">
            Login here
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupEmployer;