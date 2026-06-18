const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  applyJob, 
  getApplicants, 
  updateApplicationStatus,
  startGig,
  completeGig,
  cancelGig,
  getStudentApplications
} = require("../controllers/applicationController");

// IMPORTANT: Specific named routes must come BEFORE parameterized routes
// to prevent Express from matching /:jobId for /student/applications, /start, /complete, /cancel

// Get student's own applications list (Student only)
router.get("/student/applications", protect, authorize("student"), getStudentApplications);

// Gig Lifecycle State Controls — must be before plain /:jobId/  /:applicationId routes
router.put("/:jobId/start", protect, authorize("employer"), startGig);
router.put("/:jobId/complete", protect, authorize("employer"), completeGig);
router.put("/:jobId/cancel", protect, cancelGig);

// Apply for a gig (Student only)
router.post("/:jobId", protect, authorize("student"), applyJob);

// View gig applicants (Employer only)
router.get("/:jobId", protect, authorize("employer"), getApplicants);

// Accept/Reject an applicant (Employer only)
router.put("/:applicationId", protect, authorize("employer"), updateApplicationStatus);

module.exports = router;