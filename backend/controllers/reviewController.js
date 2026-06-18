const Review = require("../models/Review");
const User = require("../models/User");
const Job = require("../models/Job");

// Helper function to recalculate and update user's ratings and trust score
const updateRatingsAndTrustScore = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  // 1. Recalculate Rating Average
  const reviews = await Review.find({ reviewedUserId: userId });
  let averageRating = 5;
  let ratingCount = reviews.length;

  if (ratingCount > 0) {
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    averageRating = sum / ratingCount;
  }

  user.ratings.average = parseFloat(averageRating.toFixed(2));
  user.ratings.count = ratingCount;

  // 2. Trust Score Components
  // A. 40% User Rating
  const ratingScore = (averageRating / 5) * 40;

  // B. 30% Completion Rate
  let completionScore = 30; // Default if no gigs
  if (user.role === "student") {
    const totalAssigned = await Job.countDocuments({ assignedStudent: userId });
    const completed = await Job.countDocuments({ assignedStudent: userId, status: "completed" });
    if (totalAssigned > 0) {
      completionScore = (completed / totalAssigned) * 30;
    }
  } else if (user.role === "employer") {
    const totalPosted = await Job.countDocuments({ employer: userId });
    const completed = await Job.countDocuments({ employer: userId, status: "completed" });
    if (totalPosted > 0) {
      completionScore = (completed / totalPosted) * 30;
    }
  }

  // C. 20% Verification Status
  const verificationScore = user.isVerified ? 20 : 0;

  // D. 10% Platform Activity
  let activityCount = 0;
  if (user.role === "student") {
    activityCount = await Job.countDocuments({ assignedStudent: userId });
  } else if (user.role === "employer") {
    activityCount = await Job.countDocuments({ employer: userId });
  }
  const activityScore = Math.min(activityCount * 2, 10);

  // E. Final Trust Score Out of 100
  let finalTrustScore = Math.round(ratingScore + completionScore + verificationScore + activityScore);
  
  // Constrain trust score between 0 and 100
  user.trustScore = Math.max(0, Math.min(finalTrustScore, 100));

  await user.save();
};

exports.createReview = async (req, res) => {
  try {
    const { gigId, reviewedUserId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    if (!gigId || !reviewedUserId || !rating) {
      return res.status(400).json({ message: "gigId, reviewedUserId, and rating are required" });
    }

    const job = await Job.findById(gigId);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Verify gig is completed before rating
    if (job.status !== "completed") {
      return res.status(400).json({ message: "Reviews can only be submitted for completed gigs" });
    }

    // Verify reviewer is part of the gig
    const isEmployer = job.employer.toString() === reviewerId.toString();
    const isStudent = job.assignedStudent && job.assignedStudent.toString() === reviewerId.toString();

    if (!isEmployer && !isStudent) {
      return res.status(403).json({ message: "You are not authorized to review this gig" });
    }

    // Prevent reviewing oneself
    if (reviewerId.toString() === reviewedUserId.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ gigId, reviewerId, reviewedUserId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this user for this gig" });
    }

    const review = await Review.create({
      gigId,
      reviewerId,
      reviewedUserId,
      rating,
      comment
    });

    // Update target user's ratings & trust score
    await updateRatingsAndTrustScore(reviewedUserId);

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate("reviewerId", "name email role isVerified")
      .populate("gigId", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export internal helper in case other controllers need to trigger trust score updates
exports.updateRatingsAndTrustScore = updateRatingsAndTrustScore;
