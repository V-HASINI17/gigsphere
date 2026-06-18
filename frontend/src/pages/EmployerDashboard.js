import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  PlusCircle, 
  List, 
  MessageSquare, 
  LogOut, 
  Moon, 
  Sun, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Award, 
  Clock, 
  User, 
  Send,
  Star,
  XCircle,
  Play,
  CheckSquare
} from "lucide-react";

// Fix Leaflet marker icons using custom DivIcon
const createEmployerIcon = () => {
  return new L.DivIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    </div>`,
    className: "employer-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createSelectedIcon = () => {
  return new L.DivIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 custom-pin-glow text-white shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: "selected-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Location picker component to capture map click coordinates
function MapClickEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const getUserId = (userRef) => {
  if (!userRef) return "";
  return typeof userRef === "object" ? userRef._id : userRef;
};

function EmployerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("my-gigs"); // "post-gig", "my-gigs"
  const [myGigs, setMyGigs] = useState([]);
  const [selectedGigApplicants, setSelectedGigApplicants] = useState([]);
  const [activeGigDetails, setActiveGigDetails] = useState(null); // Displays applicants or progress of a specific gig
  
  // Post Gig Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [salary, setSalary] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [priority, setPriority] = useState("normal");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Review Dialog states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetUserId, setReviewTargetUserId] = useState(null);
  const [reviewGigId, setReviewGigId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const employerCoords = user?.location?.coordinates?.length === 2 && user.location.coordinates[0] !== 0
    ? [user.location.coordinates[1], user.location.coordinates[0]] // [lat, lon]
    : [51.5074, -0.1278]; // Fallback London

  // Autofill coords on mount
  useEffect(() => {
    if (employerCoords) {
      setLatitude(employerCoords[0]);
      setLongitude(employerCoords[1]);
    }
  }, [user]);

  // Fetch employer's posted gigs
  const fetchMyGigs = async () => {
    setLoading(true);
    try {
      const employerJobs = await api.get("/jobs/employer/mine");
      setMyGigs(employerJobs);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isVerified && !user.isSuspended) {
      fetchMyGigs();
    }
  }, [user, activeTab]);

  // Handle map click
  const handleMapClick = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  // Submit Post Gig
  const handlePostGig = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!latitude || !longitude) {
      setErrorMessage("Please click on the map to pin the gig's exact location.");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description,
      category,
      salary: Number(salary),
      skillsRequired,
      longitude,
      latitude,
      priority
    };

    try {
      await api.post("/jobs", payload);
      setSuccessMessage("Gig published successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setSalary("");
      setSkillsRequired("");
      setPriority("normal");
      setTimeout(() => {
        setSuccessMessage("");
        setActiveTab("my-gigs");
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || "Could not publish gig.");
    } finally {
      setLoading(false);
    }
  };

  // View Applicants for a specific gig
  const handleViewApplicants = async (gig) => {
    setActiveGigDetails(gig);
    try {
      const data = await api.get(`/applications/${gig._id}`);
      setSelectedGigApplicants(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Manage Applicant Status (Accept/Reject)
  const handleApplicantStatus = async (appId, status) => {
    try {
      const data = await api.put(`/applications/${appId}`, { status });
      setSuccessMessage(`Applicant has been ${status}!`);

      if (data.job) {
        setActiveGigDetails(data.job);
      }

      // Refresh applicants list
      if (activeGigDetails && status !== "accepted") {
        handleViewApplicants(data.job || activeGigDetails);
      }
      fetchMyGigs();
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Action failed.");
    }
  };

  // Start Gig
  const handleStartGig = async (gigId) => {
    try {
      await api.put(`/applications/${gigId}/start`, {});
      setSuccessMessage("Gig status updated to In Progress!");
      fetchMyGigs();
      if (activeGigDetails) {
        const updated = { ...activeGigDetails, status: "in_progress" };
        setActiveGigDetails(updated);
      }
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to start gig");
    }
  };

  // Complete Gig
  const handleCompleteGig = async (gigId, studentId) => {
    try {
      await api.put(`/applications/${gigId}/complete`, {});
      setSuccessMessage("Gig marked completed! Payout sent to student.");
      fetchMyGigs();
      
      // Trigger Review Modal
      setReviewGigId(gigId);
      setReviewTargetUserId(getUserId(studentId));
      setShowReviewModal(true);
      
      if (activeGigDetails) {
        const updated = { ...activeGigDetails, status: "completed" };
        setActiveGigDetails(updated);
      }
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to complete gig");
    }
  };

  // Cancel Gig
  const handleCancelGig = async (gigId) => {
    if (!window.confirm("Are you sure you want to cancel this gig? Cancelling an active gig carries a -10 Trust Score penalty.")) {
      return;
    }
    try {
      await api.put(`/applications/${gigId}/cancel`, {});
      setSuccessMessage("Gig cancelled successfully.");
      fetchMyGigs();
      if (activeGigDetails) {
        const updated = { ...activeGigDetails, status: "cancelled" };
        setActiveGigDetails(updated);
      }
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to cancel gig");
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews", {
        gigId: reviewGigId,
        reviewedUserId: reviewTargetUserId,
        rating: Number(reviewRating),
        comment: reviewComment
      });
      setShowReviewModal(false);
      setReviewComment("");
      setReviewRating(5);
      alert("Review submitted successfully! Student trust score updated.");
    } catch (err) {
      alert(err.message || "Failed to submit review");
    }
  };

  // Render Verification Screen if unverified
  if (user && !user.isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="h-16 w-16 mx-auto bg-indigo-500/10 text-indigo-650 flex items-center justify-center rounded-2xl animate-pulse">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Verification Pending</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Welcome, <strong>{user.name}</strong>! Your employer profile for <strong>{user.businessName}</strong> is pending verification review.
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs text-left">
            <strong>Platform Restriction:</strong> Unverified employers are blocked from publishing new gigs or managing students. Review completed in 1-2 hours.
          </div>
          <button 
            onClick={logout}
            className="w-full py-3.5 rounded-xl bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-slate-850 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">GS</div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              GigSphere
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center border border-indigo-500/20">
                {user?.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900">
                <CheckCircle size={10} className="fill-indigo-500 text-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate flex items-center gap-1.5">
                {user?.businessName}
              </div>
              <div className="text-[10px] text-indigo-550 dark:text-indigo-400 font-bold">Verified Employer</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => { setActiveTab("my-gigs"); setActiveGigDetails(null); }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "my-gigs" 
                  ? "bg-indigo-650 text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <List size={16} />
              Manage Posted Gigs
            </button>

            <button 
              onClick={() => setActiveTab("post-gig")}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "post-gig" 
                  ? "bg-indigo-650 text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <PlusCircle size={16} />
              Publish New Gig
            </button>

            <button 
              onClick={() => navigate("/chat")}
              className="w-full px-4 py-3 rounded-xl font-semibold text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-3 transition-all"
            >
              <MessageSquare size={16} />
              Messenger Chat
            </button>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base tracking-tight capitalize">{activeTab.replace("-", " ")} Panel</h2>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* POST GIG TAB */}
          {activeTab === "post-gig" && (
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Form details */}
              <form onSubmit={handlePostGig} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-500">Gig Specifications</h3>
                  <p className="text-xs text-slate-400 font-semibold">Enter the requirements and pay details</p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{errorMessage}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gig Title</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event Security Guard / Waiter Staff needed..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <input 
                      type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Retail, Catering, Tutoring" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary ($ / hour)</label>
                    <input 
                      type="number" required value={salary} onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 18" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills Required (Comma-separated)</label>
                  <input 
                    type="text" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)}
                    placeholder="e.g. Catering, Heavy Lifting, Customer Service" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea 
                    required value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                    placeholder="Outline details, shifts, timing, and requirements..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority / Urgency</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    >
                      <option value="normal">Normal Gig</option>
                      <option value="urgent">Urgent (Instant Notification)</option>
                    </select>
                  </div>

                  <div className="pt-5 text-right">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      Publish Active Gig
                    </button>
                  </div>
                </div>

              </form>

              {/* Location Picker Map */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-500 flex items-center gap-2">
                    <MapPin size={16} />
                    Location Picker
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">Click on the map to pin where workers should report</p>
                </div>

                <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                  <MapContainer center={employerCoords} zoom={13} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickEvents onMapClick={handleMapClick} />
                    
                    {latitude && longitude && (
                      <Marker position={[latitude, longitude]} icon={createSelectedIcon()}>
                        <Popup>
                          <div className="text-[10px] font-bold">Selected Gig Location</div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                {latitude && longitude ? (
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>Coordinates selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-xl font-bold flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>No location coordinates pinned. Click the map!</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* MANAGE GIGS TAB */}
          {activeTab === "my-gigs" && !activeGigDetails && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-indigo-500">Your Posted Gigs</h3>
                <p className="text-xs text-slate-400">Review status, edit specifications, or evaluate candidates</p>
              </div>

              {myGigs.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                  No active gigs published. Go to "Publish New Gig" to list opportunities.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myGigs.map((gig) => (
                    <div 
                      key={gig._id}
                      onClick={() => handleViewApplicants(gig)}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          gig.priority === "urgent" ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-indigo-500/10 text-indigo-550"
                        }`}>
                          {gig.priority}
                        </span>

                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          gig.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                          gig.status === "cancelled" ? "bg-slate-100 text-slate-400" : "bg-indigo-500/10 text-indigo-500"
                        }`}>
                          {gig.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm truncate">{gig.title}</h4>
                        <div className="text-xs text-slate-400 font-semibold">{gig.category}</div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850">
                        <span className="text-sm font-extrabold text-emerald-500 font-mono">${gig.salary}/hr</span>
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/5 px-2.5 py-1.5 rounded-lg">Manage Gig</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE GIG DETAILS / CANDIDATE MANAGEMENT */}
          {activeTab === "my-gigs" && activeGigDetails && (
            <div className="space-y-6">
              
              {/* Back button */}
              <button 
                onClick={() => { setActiveGigDetails(null); setSelectedGigApplicants([]); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Gigs List
              </button>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                      {activeGigDetails.status}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded">
                      {activeGigDetails.priority} priority
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold mt-1">{activeGigDetails.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{activeGigDetails.description}</p>
                </div>
                
                {/* Lifecycle Controls */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {activeGigDetails.status === "assigned" && (
                    <button
                      onClick={() => handleStartGig(activeGigDetails._id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/10"
                    >
                      <Play size={12} />
                      Start Gig Work
                    </button>
                  )}

                  {activeGigDetails.status === "in_progress" && (
                    <button
                      onClick={() => handleCompleteGig(activeGigDetails._id, getUserId(activeGigDetails.assignedStudent))}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <CheckSquare size={12} />
                      Mark Work Completed
                    </button>
                  )}

                  {["published", "applied", "assigned", "in_progress"].includes(activeGigDetails.status) && (
                    <button
                      onClick={() => handleCancelGig(activeGigDetails._id)}
                      className="px-4 py-2 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      Cancel Gig
                    </button>
                  )}
                </div>
              </div>

              {/* Candidates section */}
              {activeGigDetails.status === "published" || activeGigDetails.status === "applied" ? (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm flex items-center gap-2 text-indigo-550">
                    <User size={16} />
                    Candidate Applicants
                  </h4>

                  {selectedGigApplicants.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                      No applications received yet. Students will discover your gig on their radius map.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedGigApplicants.map((app) => (
                        <div key={app._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center rounded-full">
                                {app.student?.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-sm flex items-center gap-2">
                                  {app.student?.name}
                                  {app.student?.isVerified && (
                                    <span className="bg-indigo-500 text-white rounded-full p-0.5 border border-white">
                                      <CheckCircle size={10} className="fill-indigo-500 text-white" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">Roll: {app.student?.studentRollNumber} • Trust Score: {app.student?.trustScore}/100</div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">{app.student?.bio}</p>
                            
                            <div className="flex flex-wrap gap-1">
                              {app.student?.skills?.map((skill, idx) => (
                                <span key={idx} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            {/* Chat option */}
                            <button
                              onClick={() => navigate(`/chat?otherUserId=${app.student._id}&gigId=${activeGigDetails._id}`)}
                              className="p-3 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-650 rounded-xl"
                            >
                              <MessageSquare size={16} />
                            </button>

                            <button
                              onClick={() => handleApplicantStatus(app._id, "accepted")}
                              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10"
                            >
                              Accept Student
                            </button>

                            <button
                              onClick={() => handleApplicantStatus(app._id, "rejected")}
                              className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-indigo-500">Assigned Gig Worker</h4>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center rounded-full">
                        {(typeof activeGigDetails.assignedStudent === "object" ? activeGigDetails.assignedStudent?.name : "W")?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-sm">
                          {typeof activeGigDetails.assignedStudent === "object" ? activeGigDetails.assignedStudent?.name : "Assigned Candidate"}
                        </span>
                        <div className="text-[10px] text-slate-400">Worker profile loaded. Chat open.</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/chat?otherUserId=${getUserId(activeGigDetails.assignedStudent)}&gigId=${activeGigDetails._id}`)}
                      className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-650 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      Chat with Student
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* RATING & EVALUATION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4">
          <motion.div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold tracking-tight">Evaluate Worker</h3>
              <p className="text-xs text-slate-400">Rate the student performance to complete ratings logs</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating Score</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={30} className={star <= reviewRating ? "fill-amber-400" : "text-slate-200"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Written Feedback</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Excellent performance, punctual, and completed all tasks on time..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/10"
              >
                Submit Rating & Feedback
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Inline SVG arrow helper
function ArrowLeft({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}

export default EmployerDashboard;
