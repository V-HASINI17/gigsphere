const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  createJob, 
  getAllJobs, 
  getNearbyJobs,
  getEmployerJobs,
  updateJob,
  deleteJob,
  reportJob,
  getRecommendations
} = require("../controllers/jobController");

// IMPORTANT: All named sub-routes must come BEFORE generic /:id routes
// to prevent Express from treating "recommendations", "nearby", "employer" as IDs.

// Recommendations (Student only)
router.get("/recommendations", protect, authorize("student"), getRecommendations);

// Employer-owned gig lifecycle list
router.get("/employer/mine", protect, authorize("employer"), getEmployerJobs);

// Hyperlocal queries
router.get("/nearby", protect, getNearbyJobs);

// Get all open jobs (any authenticated user)
router.get("/", protect, getAllJobs);

// Post gig (Employer only)
router.post("/", protect, authorize("employer"), createJob);

// Report Fraud — must be before /:id to avoid ambiguity
router.post("/:id/report", protect, reportJob);

// Edit/Delete gig (Employer only)
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer"), deleteJob);

module.exports = router;
