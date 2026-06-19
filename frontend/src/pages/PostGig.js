import { useState } from "react";
import axios from "axios";

function PostGig() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    await axios.post(`${API_URL}/gigs`, {
      title,
      description
    });

    alert("Gig Posted!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Gig Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Post Gig</button>
    </form>
  );
}

export default PostGig;