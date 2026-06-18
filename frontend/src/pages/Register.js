function Register() {
  return (
    <div className="form-container">
      <h2>Sign Up</h2>

      <input type="text" placeholder="Enter Name" />
      <input type="email" placeholder="Enter Email" />
      <input type="password" placeholder="Enter Password" />

      <button className="form-btn">Register</button>
    </div>
  );
}

export default Register;