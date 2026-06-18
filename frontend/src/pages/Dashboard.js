import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>

      <div style={{ marginTop: "20px" }}>
        
        <Link to="/browse">
          <button style={buttonStyle}>Browse Gigs</button>
        </Link>

        <Link to="/post">
          <button style={buttonStyle}>Post a Gig</button>
        </Link>

        <Link to="/profile">
          <button style={buttonStyle}>View Profile</button>
        </Link>

      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  cursor: "pointer"
};

export default Dashboard;