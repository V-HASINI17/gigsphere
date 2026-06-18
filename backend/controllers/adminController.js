const User = require("../models/User");
const Job = require("../models/Job");

// 1. Get Unverified Users
exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      role: { $in: ["student", "employer"] },
      verificationStatus: "pending"
    }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Verify User Account (Approve / Reject)
exports.verifyUser = async (req, res) => {
  try {
    const { status } = req.body; // "verified" or "rejected"
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status value" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationStatus = status;
    user.isVerified = status === "verified";
    
    // Set baseline trust score (verified gets full 20 points baseline, rejected gets 0)
    user.trustScore = status === "verified" ? 100 : 80;

    await user.save();
    res.json({ message: `User account is now ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Suspend / Unsuspend User
exports.toggleUserSuspension = async (req, res) => {
  try {
    const { isSuspended } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isSuspended = isSuspended;
    await user.save();
    res.json({ message: `User suspension status updated to ${isSuspended}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Reported Gigs
exports.getReportedGigs = async (req, res) => {
  try {
    const jobs = await Job.find({ "reports.0": { $exists: true } })
      .populate("employer", "name email businessName trustScore")
      .populate("reports.reporter", "name email role");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Moderate / Delete Reported Gig
exports.deleteGig = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Gig deleted by administrator moderation" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Clear Reports on Gig
exports.clearGigReports = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }
    job.reports = [];
    await job.save();
    res.json({ message: "Reports cleared for this gig", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Get All Users (for User Management)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Platform Analytics & KPIs
exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalVerified = await User.countDocuments({ isVerified: true, role: { $ne: "admin" } });
    const totalUnverified = await User.countDocuments({ isVerified: false, role: { $ne: "admin" } });
    
    const totalGigs = await Job.countDocuments();
    const completedGigs = await Job.countDocuments({ status: "completed" });
    const activeGigs = await Job.countDocuments({ status: "in_progress" });
    const openGigs = await Job.countDocuments({ status: "published" });
    const reportedGigs = await Job.countDocuments({ "reports.0": { $exists: true } });
    
    // Calculate total payouts
    const gigsEarningsResult = await User.aggregate([
      { $unwind: "$earningsHistory" },
      { $group: { _id: null, total: { $sum: "$earningsHistory.amount" } } }
    ]);
    const totalPayouts = gigsEarningsResult[0]?.total || 0;

    res.json({
      users: {
        students: totalStudents,
        employers: totalEmployers,
        verified: totalVerified,
        unverified: totalUnverified,
      },
      gigs: {
        total: totalGigs,
        open: openGigs,
        active: activeGigs,
        completed: completedGigs,
        reported: reportedGigs
      },
      financials: {
        totalPayouts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
