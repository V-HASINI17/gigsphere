const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    skillsRequired: [{
      type: String
    }],
    
    // Geolocation
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    assignedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    // State Tracking
    status: {
      type: String,
      enum: ["draft", "published", "applied", "assigned", "in_progress", "completed", "cancelled"],
      default: "published"
    },
    
    // Urgent priority toggle
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal"
    },
    
    // Fraud safety reports
    reports: [{
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Enable Geo search
jobSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Job", jobSchema);