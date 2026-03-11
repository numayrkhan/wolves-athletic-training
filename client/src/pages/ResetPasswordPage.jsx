import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setMessage("");

    const apiUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/api/auth/reset-password/${token}`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
    } else {
      setMessage(data.message + " Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
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
      <h1 style={{ textAlign: "center" }}>Choose a New Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          required
          className="form-input"
          style={{ marginBottom: "15px" }}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          required
          className="form-input"
        />
        {error && (
          <p style={{ color: "#f39f5a", marginTop: "15px" }}>{error}</p>
        )}
        {message && (
          <p style={{ color: "#2ecc71", marginTop: "15px" }}>{message}</p>
        )}
        <button
          type="submit"
          className="submit-button"
          style={{ marginTop: "20px" }}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};
export default ResetPasswordPage;
