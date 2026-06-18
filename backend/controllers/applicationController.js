const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const { updateRatingsAndTrustScore } = require("./reviewController");

const OPEN_APPLICATION_STATUSES = ["published", "applied"];

// 1. Student apply for job
exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Check student verification status
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: "Your account is not verified yet. Unverified students cannot apply for gigs." 
      });
    }

    if (!OPEN_APPLICATION_STATUSES.includes(job.status)) {
      return res.status(400).json({ message: "This gig is no longer accepting applications" });
    }

    const alreadyApplied = await Application.findOne({
      job: req.params.jobId,
      student: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied for this gig" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      student: req.user._id,
    });

    // Update job status to show it has applicants (optional visual state, e.g. "applied")
    if (job.status === "published") {
      job.status = "applied";
      await job.save();
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Employer view applicants for a job
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants for this gig" });
    }

    const applications = await Application.find({
      job: job._id,
    })
      .populate("student", "name email phone trustScore ratings isVerified skills bio studentRollNumber")
      .populate("job", "title status");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Employer update application status (Accept/Reject) -> Transitions gig to "assigned"
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure the requester is the employer who posted the gig
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to manage this application" });
    }

    const job = await Job.findById(application.job._id);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (status === "accepted" && !OPEN_APPLICATION_STATUSES.includes(job.status)) {
      return res.status(400).json({ message: "This gig is no longer accepting applicant selection" });
    }

    application.status = status;
    await application.save();

    let updatedJob = null;

    if (status === "accepted") {
      // Update job to Assigned and assign student
      job.status = "assigned";
      job.assignedStudent = application.student;
      await job.save();

      // Reject all other applications for this job
      await Application.updateMany(
        { job: job._id, _id: { $ne: application._id } },
        { status: "rejected" }
      );

      updatedJob = await Job.findById(job._id)
        .populate("employer", "name email businessName trustScore isVerified")
        .populate("assignedStudent", "name email phone trustScore ratings isVerified skills bio studentRollNumber");
    } else if (status === "rejected") {
      const hasPendingApplications = await Application.exists({
        job: job._id,
        status: "pending"
      });

      if (job.status === "applied" && !hasPendingApplications) {
        job.status = "published";
        await job.save();
      }

      updatedJob = await Job.findById(job._id)
        .populate("employer", "name email businessName trustScore isVerified")
        .populate("assignedStudent", "name email phone trustScore ratings isVerified skills bio studentRollNumber");
    }

    res.json({ message: "Application status updated successfully", application, job: updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Start Gig (Employer updates status to "in_progress")
exports.startGig = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to start this gig" });
    }

    if (job.status !== "assigned") {
      return res.status(400).json({ message: "Gig must be in assigned state to start" });
    }

    job.status = "in_progress";
    await job.save();

    res.json({ message: "Gig is now in progress", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Complete Gig (Employer updates status to "completed", updates student earnings history and recalculates trust scores)
exports.completeGig = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this gig" });
    }

    if (job.status !== "in_progress") {
      return res.status(400).json({ message: "Gig must be in progress to complete" });
    }

    job.status = "completed";
    await job.save();

    // Add to student's earnings history
    const student = await User.findById(job.assignedStudent);
    if (student) {
      student.earningsHistory.push({
        gigId: job._id,
        title: job.title,
        amount: job.salary,
        date: new Date()
      });
      await student.save();
      
      // Recalculate student trust score
      await updateRatingsAndTrustScore(student._id);
    }

    // Recalculate employer trust score (adds to active completions)
    await updateRatingsAndTrustScore(req.user._id);

    res.json({ message: "Gig completed successfully! Payout credited to student.", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Cancel Gig (Either student or employer can cancel, applies -10 trust score penalty)
exports.cancelGig = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const isEmployer = job.employer.toString() === req.user._id.toString();
    const isStudent = job.assignedStudent && job.assignedStudent.toString() === req.user._id.toString();

    if (!isEmployer && !isStudent) {
      return res.status(403).json({ message: "Not authorized to cancel this gig" });
    }

    if (["completed", "cancelled"].includes(job.status)) {
      return res.status(400).json({ message: "Gig is already finished or cancelled" });
    }

    // Apply -10 Trust Score Penalty to the party who cancelled (if assigned)
    if (job.status === "assigned" || job.status === "in_progress") {
      const penaltyUserId = req.user._id;
      const penaltyUser = await User.findById(penaltyUserId);
      if (penaltyUser) {
        penaltyUser.trustScore = Math.max(0, penaltyUser.trustScore - 10);
        await penaltyUser.save();
        
        // Recalculate full score with penalty
        await updateRatingsAndTrustScore(penaltyUserId);
      }
    }

    job.status = "cancelled";
    await job.save();

    res.json({ message: "Gig cancelled successfully. Trust score penalty applied if active.", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Student view their own applications
exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: "job",
        populate: {
          path: "employer",
          select: "name email businessName phone trustScore isVerified"
        }
      })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
