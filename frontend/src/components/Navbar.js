import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Hyperlocal Student Gig Marketplace</div>

      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-link">Home</Link>
        </li>

        <li>
          <Link to="/how-it-works" className="nav-link">How It Works</Link>
        </li>

        <li className="login-btn">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>

        <li className="signup-btn">
          <Link to="/signup" className="nav-link">
            Sign Up
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;