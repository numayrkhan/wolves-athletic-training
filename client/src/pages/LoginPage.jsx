// in client/src/pages/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      // On successful login, save the token and redirect
      localStorage.setItem("authToken", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
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
      <h1 style={{ textAlign: "center" }}>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && (
          <p style={{ color: "#f39f5a", marginBottom: "15px" }}>{error}</p>
        )}
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/forgot-password" style={{ color: "var(--secondary-color)" }}>
          Forgot Password?
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
