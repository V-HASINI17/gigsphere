const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role, 
      longitude, 
      latitude,
      studentRollNumber,
      collegeIdUrl,
      skills,
      bio,
      businessName,
      businessLicenseUrl,
      adminSecret
    } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Secure admin creation
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin creation secret." });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create base user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      bio: bio || "",
      isVerified: false,
      verificationStatus: role === "admin" ? "verified" : "pending"
    };

    // If Admin role, set details
    if (role === "admin") {
      userData.isVerified = true;
      userData.adminRole = "moderator"; // Default to moderator, can be configured in DB
    }

    // Student fields
    if (role === "student") {
      if (!studentRollNumber || !collegeIdUrl) {
        return res.status(400).json({ message: "Roll number and College ID are required for student verification." });
      }
      userData.studentRollNumber = studentRollNumber;
      userData.collegeIdUrl = collegeIdUrl;
      userData.skills = Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()) : []);
    }

    // Employer fields
    if (role === "employer") {
      if (!businessName) {
        return res.status(400).json({ message: "Business name is required for employer verification." });
      }
      userData.businessName = businessName;
      userData.businessLicenseUrl = businessLicenseUrl || ""; // Optional proof
    }

    // Only store location if real coordinates were captured by the browser.
    // Omitting the field entirely is safe — the 2dsphere index is sparse.
    // Never fall back to [0, 0] (Gulf of Guinea) which would corrupt geo queries.
    if (longitude && latitude) {
      const lon = Number(longitude);
      const lat = Number(latitude);
      if (lon !== 0 || lat !== 0) {
        userData.location = {
          type: "Point",
          coordinates: [lon, lat],
        };
      }
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: "Registration successful. Your account is pending admin verification.",
      verificationStatus: user.verificationStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account is suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminRole: user.adminRole,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        location: user.location,
        skills: user.skills,
        bio: user.bio,
        trustScore: user.trustScore,
        studentRollNumber: user.studentRollNumber,
        businessName: user.businessName,
        ratings: user.ratings
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me — returns fresh profile for the logged-in user
exports.getMe = async (req, res) => {
  try {
    // req.user is already populated (minus password) by authMiddleware.protect
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        adminRole: req.user.adminRole,
        isVerified: req.user.isVerified,
        verificationStatus: req.user.verificationStatus,
        location: req.user.location,
        skills: req.user.skills,
        bio: req.user.bio,
        trustScore: req.user.trustScore,
        studentRollNumber: req.user.studentRollNumber,
        businessName: req.user.businessName,
        ratings: req.user.ratings,
        earningsHistory: req.user.earningsHistory,
        isSuspended: req.user.isSuspended
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};