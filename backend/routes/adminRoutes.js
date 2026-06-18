const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getUnverifiedUsers,
  verifyUser,
  toggleUserSuspension,
  getReportedGigs,
  deleteGig,
  clearGigReports,
  getAllUsers,
  getAnalytics
} = require("../controllers/adminController");

// Secure all admin routes
router.use(protect);
router.use(authorize("admin"));

// Platform Analytics Route
router.get("/analytics", getAnalytics);

// User Management Routes — specific routes MUST come before base routes
router.get("/users/unverified", getUnverifiedUsers);
router.get("/users", getAllUsers);
router.put("/users/:id/verify", verifyUser);
router.put("/users/:id/suspend", toggleUserSuspension);

// Gig Moderation Routes — specific before parameterized
router.get("/gigs/reported", getReportedGigs);
router.put("/gigs/:id/reports/clear", clearGigReports);
router.delete("/gigs/:id", deleteGig);

module.exports = router;
