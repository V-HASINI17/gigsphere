import React from "react";
import "./Features.css";

function Features() {
  return (
    <div className="features">
      <div className="feature-card">
        <h3>Find Flexible Gigs</h3>
        <p>Browse local part-time and short-term gigs near your campus.</p>
      </div>

      <div className="feature-card">
        <h3>Gain Experience</h3>
        <p>Build real-world skills and strengthen your resume.</p>
      </div>

      <div className="feature-card">
        <h3>Secure Payments</h3>
        <p>Safe and trusted payments for every completed gig.</p>
      </div>
    </div>
  );
}

export default Features;