import React from "react";
import "./Hero.css";

function Hero() {
  return (
    <div className="hero">
      <div className="hero-left">
        <h1>Earn. Learn. Grow.</h1>
        <h2>Connect with Local Campus Gigs</h2>
      </div>

      <div className="hero-right">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
          alt="Students working"
          style={{ width: "350px" }}
        />
      </div>
    </div>
  );
}

export default Hero;