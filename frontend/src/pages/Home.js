import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  MessageSquare, 
  ShieldCheck, 
  Award, 
  Zap, 
  ArrowRight, 
  Moon, 
  Sun, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark transition-colors duration-300 text-slate-800 dark:text-slate-100">
      
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30">
              GS
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              GigSphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#trust" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Trust & Safety</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link 
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-medium transition-all"
            >
              Login
            </Link>

            <Link 
              to="/signup"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="md:col-span-7 space-y-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
              <Zap size={14} className="fill-indigo-600 dark:fill-indigo-400" />
              Verified Hyperlocal Marketplace
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Hyperlocal Gigs for{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-emerald-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-emerald-400">
                Verified Students
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Connect directly with verified local businesses for short-term, flexible jobs. Fast verification, real-time map matching, built-in chat, and secure payouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => navigate("/signup?role=student")}
                className="group px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                Find Gigs as Student
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate("/signup?role=employer")}
                className="px-7 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                Post Gigs as Employer
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">5k+</div>
                <div className="text-sm text-slate-500 dark:text-slate-500 font-medium mt-1">Verified Students</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">98%</div>
                <div className="text-sm text-slate-500 dark:text-slate-500 font-medium mt-1">Completion Rate</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-violet-500 dark:text-violet-400">&lt; 1 hr</div>
                <div className="text-sm text-slate-500 dark:text-slate-500 font-medium mt-1">Average Match Time</div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Card Mockup */}
          <motion.div 
            className="md:col-span-5 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full max-w-[400px] aspect-[4/5] bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[3rem] p-4 shadow-2xl shadow-indigo-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
              
              {/* Inner screen mock */}
              <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-5 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-slate-400">Nearby Matches</span>
                  </div>
                  <div className="h-6 px-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-extrabold uppercase tracking-wide flex items-center">
                    Urgent
                  </div>
                </div>

                {/* Job Card mockup */}
                <div className="my-auto space-y-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 shadow-md border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Retail & Ops</span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Boutique Store Assistant</h4>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">$18/hr</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={12} />
                      <span>Fashion Hub • 1.4 km away</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex items-center gap-1.5">
                        <Award size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-400">Trust Score: 95+</span>
                      </div>
                      <button className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg">Apply Now</button>
                    </div>
                  </div>

                  {/* Trust indicator mockup */}
                  <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-500">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Alex Carter</div>
                        <div className="text-[9px] text-slate-400">Verified Student • Oxford</div>
                      </div>
                    </div>
                    <div className="h-5 px-2 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold flex items-center">
                      98/100 TS
                    </div>
                  </div>
                </div>

                {/* Map Mockup background style */}
                <div className="h-20 w-full rounded-2xl bg-indigo-500/5 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-400 text-xs font-semibold relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:8px_8px]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full custom-pin-glow"></div>
                  </div>
                  <span className="z-10 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded-md">Hyperlocal Map View</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50 dark:bg-slate-900/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How GigSphere Operates</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Our 4-step secure workflow ensures trusted connections between students and employers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="font-bold text-lg">Verify Accounts</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Students upload college IDs, and employers submit business detail proof. Admin validates roles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="font-bold text-lg">Map Match Gigs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Employers post urgent or normal gigs. Nearby verified students discover matches on Leaflet maps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="font-bold text-lg">Chat & Collaborate</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Chat in real-time. Discuss gig specs, timings, and agree on assignment milestones safely.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-bold text-lg">4</div>
              <h3 className="font-bold text-lg">Earn & Rate</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Mark job completed. Transfer payout instantly. Exchange ratings to update platform trust scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Built for Hyperlocal Speed & Safety</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Our advanced full-stack engine supports safety checks and matches.
            </p>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Feature 1 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold">Geospatial matching</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                MongoDB 2dsphere geolocation indexes calculate exact distances in real-time. Students filter matches in 5, 10, or 25 km circles.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold">Mandatory Verification</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                College ID and business verification queues ensure safety. Verified checkmarks are added to profiles.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold">Dynamic Trust Score</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Scores recalculated out of 100 based on job ratings, completion rates, account activity, and ID verifications.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Zap size={24} className="fill-rose-500" />
              </div>
              <h3 className="text-xl font-bold">Emergency Gigs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Urgent tags allow employers to pin jobs immediately. Urgent posts broadcast instant socket updates to nearby students.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold">Real-time WebSockets</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time messaging via Socket.io with typing indicators, online status dots, read receipts, and gig-specific chat rooms.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm hover:-translate-y-1 transition-all" variants={itemVariants}>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold">Admin Scam Dashboards</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Moderators edit listings, review fraud reports, suspend accounts, and view platform metrics.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section id="trust" className="py-20 px-6 bg-slate-50 dark:bg-slate-900/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Zero Tolerance for Fraud</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We prioritze student safety and business reputation. GigSphere implements several layers of active defense to block bad actors.
            </p>
            
            <ul className="space-y-3 font-semibold text-slate-700 dark:text-slate-200">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Encrypted JWT Sessions & Security Headers</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Automatic Trust Score penalty of -10 on gig cancellation</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Fraud reporting queues on every gig page</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>Instant session block upon administrator suspension</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl space-y-6">
            <h3 className="text-xl font-bold">Did you know?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Our recommendation engine scores gigs based on candidate skills and proximity. This reduces application spam and helps students find jobs faster.
            </p>
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm flex gap-3">
              <HelpCircle size={24} className="shrink-0" />
              <span>
                <strong>Need help?</strong> Read our FAQ or submit a ticket to the Moderator support team directly from the user dashboard.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">GS</div>
            <span className="font-bold text-white text-lg">GigSphere</span>
          </div>
          
          <div className="flex gap-8 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Register</Link>
            <span className="cursor-default">© 2026 GigSphere Inc.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;