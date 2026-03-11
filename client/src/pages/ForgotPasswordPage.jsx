import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/api/auth/forgot-password`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div
      style={{
        padding: "100px 20px",
        color: "white",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Reset Password</h1>
      <p style={{ textAlign: "center", color: "#ccc", margin: "15px 0" }}>
        Enter your email address and we will send you a link to reset your
        password.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
        {message && (
          <p style={{ color: "#2ecc71", marginTop: "15px" }}>{message}</p>
        )}
        <button
          type="submit"
          className="submit-button"
          style={{ marginTop: "20px" }}
        >
          Send Reset Link
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/login" style={{ color: "var(--secondary-color)" }}>
          &larr; Go back to log in
        </Link>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
