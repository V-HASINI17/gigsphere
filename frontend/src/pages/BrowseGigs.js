import { useState, useEffect } from "react";

function BrowseGigs() {

  const [loading, setLoading] = useState(true);

  const [gigs] = useState([
    { _id: 1, title: "Math Tutor", location: "Hyderabad" },
    { _id: 2, title: "Delivery Helper", location: "Chennai" },
    { _id: 3, title: "Event Volunteer", location: "Hyderabad" }
  ]);

  const [location, setLocation] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔄 Loading gigs...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      <h2 style={styles.heading}>🚀 Browse Gigs</h2>

      {/* Filter Section */}
      <div style={styles.filterBox}>
        <label style={{ marginRight: "10px" }}>Filter by Location:</label>
        <select 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.select}
        >
          <option value="">All Locations</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Chennai">Chennai</option>
        </select>
      </div>

      {/* Gig Cards */}
      <div style={styles.grid}>
        {gigs
          .filter(gig =>
            location ? gig.location === location : true
          )
          .map(gig => (
            <div key={gig._id} style={styles.card}>
              <h3>{gig.title}</h3>
              <p>📍 {gig.location}</p>
              <button style={styles.button}>Apply Now</button>
            </div>
          ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "#f4f6f9",
    minHeight: "100vh"
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px"
  },
  filterBox: {
    textAlign: "center",
    marginBottom: "30px"
  },
  select: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: "0.3s"
  },
  button: {
    marginTop: "10px",
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    background: "#4CAF50",
    color: "white",
    cursor: "pointer"
  }
};

export default BrowseGigs;