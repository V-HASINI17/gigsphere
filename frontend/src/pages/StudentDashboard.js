import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Award, 
  DollarSign, 
  LogOut, 
  Moon, 
  Sun, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  CheckCircle,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";

// Fix Leaflet marker icons using custom DivIcon with Lucide elements
const createMarkerIcon = (priority) => {
  return new L.DivIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full ${
      priority === "urgent" ? "bg-rose-500 custom-pin-glow animate-pulse" : "bg-indigo-600"
    } text-white shadow-md border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createStudentIcon = () => {
  return new L.DivIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><path d="M12 2v2"/></svg>
    </div>`,
    className: "student-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Map helper to automatically center map when coords change
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] !== 0) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateProfileState } = useAuth();
  
  const [activeTab, setActiveTab] = useState("map"); // "map", "recommendations", "applications", "stats"
  const [radius, setRadius] = useState(10); // 5km, 10km, 25km
  const [gigs, setGigs] = useState([]);
  const [recommendedGigs, setRecommendedGigs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  
  const [selectedGig, setSelectedGig] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const studentCoords = user?.location?.coordinates?.length === 2 && user.location.coordinates[0] !== 0
    ? [user.location.coordinates[1], user.location.coordinates[0]] // Leaflet takes [lat, lon]
    : [51.5074, -0.1278]; // Fallback London

  // Fetch Gigs based on location & radius
  const fetchNearbyGigs = async () => {
    setLoading(true);
    try {
      const lon = user?.location?.coordinates[0] || studentCoords[1];
      const lat = user?.location?.coordinates[1] || studentCoords[0];
      const data = await api.get(`/jobs/nearby?longitude=${lon}&latitude=${lat}&radius=${radius}`);
      setGigs(data);
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch gigs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recommended Gigs
  const fetchRecommendations = async () => {
    try {
      const data = await api.get("/jobs/recommendations");
      setRecommendedGigs(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Fetch applications
  const fetchMyApplications = async () => {
    try {
      const data = await api.get("/applications/student/applications");
      setMyApplications(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Refresh profile from server — syncs earningsHistory/trustScore after employer marks gig complete
  const fetchFreshProfile = async () => {
    try {
      const data = await api.get("/auth/me");
      if (data?.user) updateProfileState(data.user);
    } catch (err) {
      console.error("Failed to refresh profile:", err.message);
    }
  };

  useEffect(() => {
    if (user?.isVerified && !user.isSuspended) {
      fetchNearbyGigs();
      fetchRecommendations();
    }
  }, [radius, user]);

  const handleApply = async (gigId) => {
    setApplying(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await api.post(`/applications/${gigId}`);
      setSuccessMessage("Application submitted successfully!");
      fetchNearbyGigs();
      fetchRecommendations();
      setTimeout(() => {
        setSuccessMessage("");
        setSelectedGig(null);
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message || "Could not apply.");
    } finally {
      setApplying(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    setReporting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await api.post(`/jobs/${selectedGig._id}/report`, { reason: reportReason });
      setSuccessMessage("Fraud report submitted. Admin moderation team notified.");
      setReportReason("");
      setTimeout(() => {
        setSuccessMessage("");
        setSelectedGig(null);
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit report.");
    } finally {
      setReporting(false);
    }
  };

  // Render Verification Screen if unverified
  if (user && !user.isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="h-16 w-16 mx-auto bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-2xl animate-pulse">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Verification Pending</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Welcome, <strong>{user.name}</strong>! Your roll number <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{user.studentRollNumber}</code> and College ID scan have been submitted for review.
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs text-left">
            <strong>Platform Restriction:</strong> Unverified students cannot view hyperlocal coordinates or apply for active gigs. Accounts are typically reviewed within 1-2 hours.
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
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center border border-emerald-500/20">
                {user?.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900">
                <CheckCircle2 size={10} className="fill-indigo-500 text-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate flex items-center gap-1.5">
                {user?.name}
              </div>
              <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold">Verified Student</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab("map")}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "map" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Navigation size={16} />
              Nearby Gigs Map
            </button>

            <button 
              onClick={() => { setActiveTab("recommendations"); fetchRecommendations(); }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "recommendations" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles size={16} />
              Recommended Gigs
            </button>

            <button 
              onClick={() => { setActiveTab("stats"); fetchFreshProfile(); }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "stats" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Award size={16} />
              Trust Score & Earnings
            </button>

            <button 
              onClick={() => { setActiveTab("applications"); fetchMyApplications(); }}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-xs flex items-center gap-3 transition-all ${
                activeTab === "applications" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText size={16} />
              My Applications
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
            <h2 className="font-extrabold text-base tracking-tight capitalize">{activeTab} Panel</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Trust Score: {user?.trustScore}/100
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Panels */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* MAP PANEL */}
          {activeTab === "map" && (
            <div className="h-full flex flex-col space-y-6">
              
              {/* Radius Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm gap-4 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-500">
                    <MapPin size={16} />
                    Hyperlocal Radius Matcher
                  </h3>
                  <p className="text-xs text-slate-400">Discover short-term gigs within your local perimeter</p>
                </div>
                <div className="flex gap-2">
                  {[5, 10, 25].map((km) => (
                    <button
                      key={km}
                      onClick={() => setRadius(km)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        radius === km 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      {km} km radius
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Container */}
              <div className="flex-1 min-h-[350px] relative rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800 bg-slate-100 dark:bg-slate-850">
                <MapContainer center={studentCoords} zoom={13} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <ChangeMapView coords={studentCoords} />
                  
                  {/* Current Student Marker */}
                  <Marker position={studentCoords} icon={createStudentIcon()}>
                    <Popup>
                      <div className="text-xs font-bold">You (Your Locked Location)</div>
                    </Popup>
                  </Marker>

                  {/* Radius Overlay circle */}
                  <Circle
                    center={studentCoords}
                    radius={radius * 1000}
                    pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.08 }}
                  />

                  {/* Gig Markers */}
                  {gigs.map((gig) => {
                    const gigLat = gig.location.coordinates[1];
                    const gigLon = gig.location.coordinates[0];
                    return (
                      <Marker 
                        key={gig._id} 
                        position={[gigLat, gigLon]} 
                        icon={createMarkerIcon(gig.priority)}
                      >
                        <Popup>
                          <div className="p-1 space-y-2 text-slate-800">
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                gig.priority === "urgent" ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"
                              }`}>
                                {gig.priority}
                              </span>
                              <span className="text-xs font-bold text-emerald-500 font-mono">${gig.salary}/hr</span>
                            </div>
                            <h4 className="font-extrabold text-xs leading-tight">{gig.title}</h4>
                            <p className="text-[10px] text-slate-400">{gig.employer?.businessName || gig.employer?.name}</p>
                            <div className="text-[9px] font-bold text-indigo-600">{gig.distance?.toFixed(1)} km away</div>
                            <button 
                              onClick={() => setSelectedGig(gig)}
                              className="w-full text-center text-[9px] font-bold text-white bg-indigo-600 py-1 rounded-md mt-1"
                            >
                              View & Apply
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          )}

          {/* RECOMMENDATIONS TAB */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-indigo-500 flex items-center gap-2">
                  <Sparkles size={16} />
                  Recommended Gigs
                </h3>
                <p className="text-xs text-slate-400">Match score based on your skills, location proximity, and category preference</p>
              </div>

              {recommendedGigs.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                  No gigs recommended at the moment. Try adding more skills to your profile!
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedGigs.map((gig) => (
                    <div 
                      key={gig._id}
                      onClick={() => setSelectedGig(gig)}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 cursor-pointer space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Priority Tag ribbon */}
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          gig.priority === "urgent" ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"
                        }`}>
                          {gig.priority}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-indigo-500 font-extrabold text-[11px] bg-indigo-500/5 px-2 py-0.5 rounded-lg">
                          <Sparkles size={10} className="fill-indigo-500" />
                          <span>{gig.recommendationScore}% Match</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-sm truncate">{gig.title}</h4>
                        <div className="text-xs font-semibold text-slate-400">{gig.employer?.businessName || gig.employer?.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <MapPin size={12} />
                          <span>{gig.distance ? `${gig.distance} km away` : "Nearby"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850">
                        <div className="text-sm font-extrabold text-emerald-500 font-mono">${gig.salary}/hr</div>
                        <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/5 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition-all">View Details</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-indigo-500 flex items-center gap-2">
                  <FileText size={16} />
                  Application Tracker
                </h3>
                <p className="text-xs text-slate-400">Track and manage statuses for your gig requests</p>
              </div>

              {myApplications.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-400 font-medium">
                  You haven't applied to any gigs yet. Explore the map to find nearby opportunities.
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div 
                      key={app._id} 
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">{app.job?.title}</h4>
                        <div className="text-xs text-slate-400 font-semibold">{app.job?.employer?.businessName || app.job?.employer?.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
                          <Clock size={10} />
                          <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          app.status === "accepted" ? "bg-emerald-500/10 text-emerald-500" :
                          app.status === "rejected" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          App Status: {app.status}
                        </span>
                        
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-500`}>
                          Gig Status: {app.job?.status}
                        </span>
                        
                        {app.status === "accepted" && (
                          <button 
                            onClick={() => navigate(`/chat?otherUserId=${app.job.employer._id}&gigId=${app.job._id}`)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-650 rounded-xl"
                          >
                            <MessageSquare size={14} />
                          </button>
                        )}

                        {["published", "applied", "assigned", "in_progress"].includes(app.job?.status) && (
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to cancel this gig? If it is active, a -10 trust score penalty will be applied.")) {
                                try {
                                  await api.put(`/applications/${app.job._id}/cancel`, {});
                                  fetchMyApplications();
                                } catch (err) {
                                  alert(err.message || "Failed to cancel gig");
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 text-[10px] font-bold"
                          >
                            Cancel Gig
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATS & EARNINGS TAB */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              
              {/* Trust & Rating Summary */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Trust Score Panel */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Trust Index</span>
                    <h4 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{user?.trustScore}/100</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Based on ratings (40%), gig completion rate (30%), verification status (20%), and account activity (10%). Keep it high to build employer confidence.
                  </p>
                </div>

                {/* Rating Average Panel */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Rating Average</span>
                    <h4 className="text-3xl font-extrabold text-emerald-500">{user?.ratings?.average} ★</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Accumulated rating score across {user?.ratings?.count || 0} completions. High ratings directly improve your marketplace priority ranking.
                  </p>
                </div>

                {/* Lifetime Earnings Panel */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Earnings</span>
                    <h4 className="text-3xl font-extrabold text-violet-500 font-mono">
                      ${user?.earningsHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Paid directly to your bank account upon gig confirmation. Verification document audits ensure safe transactions.
                  </p>
                </div>

              </div>

              {/* Earnings History table */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Earnings History</h3>
                {(!user?.earningsHistory || user.earningsHistory.length === 0) ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    No payment logs recorded. Apply for gigs and complete assignments to start earning.
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800">
                          <th className="p-4">Gig Title</th>
                          <th className="p-4">Amount Credited</th>
                          <th className="p-4">Credited Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.earningsHistory.map((log) => (
                          <tr key={log._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                            <td className="p-4 font-bold">{log.title}</td>
                            <td className="p-4 font-mono text-emerald-500 font-bold">+${log.amount}</td>
                            <td className="p-4 text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* GIG DETAILS & ACTION MODAL */}
      {selectedGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <motion.div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-2xl relative space-y-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  selectedGig.priority === "urgent" ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"
                }`}>
                  {selectedGig.priority} Gig
                </span>
                <h3 className="text-lg font-extrabold mt-2 leading-tight">{selectedGig.title}</h3>
                <span className="text-xs text-slate-400 font-semibold">{selectedGig.employer?.businessName || selectedGig.employer?.name}</span>
              </div>
              <span className="text-lg font-extrabold text-emerald-500 font-mono">${selectedGig.salary}/hr</span>
            </div>

            {/* General descriptions */}
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-4 rounded-xl">
                {selectedGig.description}
              </div>

              {/* Skills checklist */}
              {selectedGig.skillsRequired && selectedGig.skillsRequired.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGig.skillsRequired.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location display */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={14} className="text-slate-400" />
                <span>Located approximately {selectedGig.distance?.toFixed(1) || "?"} km away</span>
              </div>
            </div>

            {/* Error / Success Feedback */}
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

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedGig(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Close View
              </button>

              <button
                onClick={() => handleApply(selectedGig._id)}
                disabled={applying}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {applying ? "Submitting..." : "Apply for Gig"}
              </button>
            </div>

            {/* Fraud Reporting Footer */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Report Scam or Fraud</span>
              <form onSubmit={handleReport} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason (e.g. fake business, unpaid work request)..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px]"
                >
                  {reporting ? "Reporting..." : "Report"}
                </button>
              </form>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;
