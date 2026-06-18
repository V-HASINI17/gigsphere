const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "employer", "admin"],
    required: true
  },
  
  // Admin Roles
  adminRole: {
    type: String,
    enum: ["super_admin", "moderator"],
    default: "moderator"
  },
  
  // Verification System
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ["unverified", "pending", "verified", "rejected"],
    default: "unverified"
  },
  
  // Student Specific Fields
  studentRollNumber: {
    type: String
  },
  collegeIdUrl: {
    type: String // Base64 or mock link
  },
  skills: [{
    type: String
  }],
  bio: {
    type: String
  },
  
  // Employer Specific Fields
  businessName: {
    type: String
  },
  businessLicenseUrl: {
    type: String
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Safety / Moderation
  isSuspended: {
    type: Boolean,
    default: false
  },
  
  // Geolocation (GeoJSON Point)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  
  // Trust Score & Ratings
  trustScore: {
    type: Number,
    default: 100
  },
  ratings: {
    average: { type: Number, default: 5 },
    count: { type: Number, default: 0 }
  },
  
  // Student Earnings History
  earningsHistory: [{
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    title: { type: String },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.index({ location: "2dsphere" }, { sparse: true }); // sparse: skips docs without a location field

module.exports = mongoose.model("User", userSchema);
