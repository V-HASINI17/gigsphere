import "./SignUp.css";
import { Link } from "react-router-dom";

function SignUp() {
  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account 🚀</h2>
        <p className="subtitle">Join GigHub and start earning today</p>

        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email Address" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />

        <button className="signup-btn">Create Account</button>

        <p className="signin-text">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;