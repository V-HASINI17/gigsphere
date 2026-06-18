const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");

const OPEN_JOB_STATUSES = ["published", "applied"];

// 1. Create Gig / Job (Employer only)
exports.createJob = async (req, res) => {
  try {
    const { title, description, category, salary, skillsRequired, longitude, latitude, priority } = req.body;

    // Check employer verification
    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: "Your account is not verified yet. Unverified employers cannot post gigs." 
      });
    }

    if (!title || !description || !category || !salary || !longitude || !latitude) {
      return res.status(400).json({ message: "All fields except skills and priority are required" });
    }

    const job = await Job.create({
      title,
      description,
      category,
      salary,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : []),
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      priority: priority || "normal",
      employer: req.user._id,
      status: "published"
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $in: OPEN_JOB_STATUSES } })
      .populate("employer", "name email businessName trustScore isVerified")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Nearby Jobs with Radius Filter (5, 10, 25 km)
exports.getNearbyJobs = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Coordinates are required for nearby search" });
    }

    const radiusInKm = parseInt(radius) || 10; // Default 10km

    // Mongoose GeoNear aggregation
    const jobs = await Job.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: "distance", // Distance in meters
          maxDistance: radiusInKm * 1000,
          spherical: true,
          query: { status: { $in: OPEN_JOB_STATUSES } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "employer",
          foreignField: "_id",
          as: "employerDetails"
        }
      },
      {
        $unwind: "$employerDetails"
      },
      {
        // Reshape output to match standard JSON structures
        $project: {
          title: 1,
          description: 1,
          category: 1,
          salary: 1,
          skillsRequired: 1,
          location: 1,
          status: 1,
          priority: 1,
          createdAt: 1,
          distance: { $divide: ["$distance", 1000] }, // Convert meters to km
          employer: {
            _id: "$employerDetails._id",
            name: "$employerDetails.name",
            email: "$employerDetails.email",
            businessName: "$employerDetails.businessName",
            trustScore: "$employerDetails.trustScore",
            isVerified: "$employerDetails.isVerified"
          }
        }
      },
      {
        // Prioritize urgent gigs and then sort by distance
        $sort: { priority: -1, distance: 1 }
      }
    ]);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Employer's Own Gigs Across Lifecycle States
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate("employer", "name email businessName trustScore isVerified")
      .populate("assignedStudent", "name email phone trustScore ratings isVerified skills bio studentRollNumber")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Gig Status / Details
exports.updateJob = async (req, res) => {
  try {
    const { title, description, category, salary, skillsRequired, priority, status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Verify ownership
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this gig" });
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (category) job.category = category;
    if (salary) job.salary = salary;
    if (skillsRequired) job.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(",").map(s => s.trim());
    if (priority) job.priority = priority;
    if (status) job.status = status;

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Delete Gig
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this gig" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Gig deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Report Gig for Fraud
exports.reportJob = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Reporting reason is required" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Add report
    job.reports.push({
      reporter: req.user._id,
      reason
    });

    await job.save();
    res.json({ message: "Gig reported successfully. Admin will review your report." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Recommendation Engine for Students
exports.getRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentSkills = student.skills || [];
    const studentCoordinates = student.location?.coordinates || [0, 0];

    // Get categories of previous applications to recommend similar ones
    const previousApps = await Application.find({ student: studentId }).populate("job");
    const preferredCategories = previousApps.map(app => app.job?.category).filter(Boolean);

    // Fetch open jobs that are still accepting applicants
    const jobs = await Job.find({ status: { $in: OPEN_JOB_STATUSES } }).populate("employer", "name businessName trustScore isVerified");

    // Score jobs
    const scoredJobs = jobs.map(job => {
      let score = 0;

      // 1. Skill Match (+40 points per match)
      if (job.skillsRequired && studentSkills.length > 0) {
        const matches = job.skillsRequired.filter(skill => 
          studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        score += matches.length * 40;
      }

      // 2. Proximity Match (using distance helper)
      if (job.location?.coordinates) {
        const [lon1, lat1] = studentCoordinates;
        const [lon2, lat2] = job.location.coordinates;
        // Simple Haversine approximation
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance <= 5) score += 30;
        else if (distance <= 10) score += 10;
        job._doc.distance = parseFloat(distance.toFixed(2));
      }

      // 3. Category Match (+20 points)
      if (preferredCategories.includes(job.category)) {
        score += 20;
      }

      // 4. Urgent Boost (+15 points)
      if (job.priority === "urgent") {
        score += 15;
      }

      return {
        ...job._doc,
        recommendationScore: score
      };
    });

    // Sort by recommendationScore descending
    scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Return top 10 recommended jobs
    res.json(scoredJobs.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
