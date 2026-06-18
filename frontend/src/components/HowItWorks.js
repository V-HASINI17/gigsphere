function HowItWorks() {
  const steps = [
    "1. Post or Find a Gig",
    "2. Connect & Chat",
    "3. Complete Work & Get Paid",
  ];

  return (
    <section className="section">
      <h2>How It Works</h2>
      <div className="card-grid">
        {steps.map((step, index) => (
          <div key={index} className="card">
            <h3>{step}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;