import { useParams } from "react-router-dom";

function GigDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2>Gig Details</h2>
      <p>Gig ID: {id}</p>
      <p>Title: Part-time Tutor</p>
      <p>Description: Teach math for 2 hours</p>
      <button>Apply Now</button>
    </div>
  );
}

export default GigDetails;