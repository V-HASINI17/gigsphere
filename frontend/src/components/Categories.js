function Categories() {
  const categories = [
    "Event Helper",
    "Tutoring",
    "Tech Support",
    "Design Work",
    "House Help",
  ];

  return (
    <section className="section">
      <h2>Browse by Category</h2>
      <div className="card-grid">
        {categories.map((cat, index) => (
          <div key={index} className="card">
            <h3>{cat}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;