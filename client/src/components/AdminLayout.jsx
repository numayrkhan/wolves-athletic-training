// in client/src/components/AdminLayout.jsx

import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        color: "white",
        background: "var(--primary-color)",
      }}
    >
      {/* 1. REMOVE the flex properties from this aside element */}
      <aside
        style={{
          width: "220px",
          background: "#0a2c33",
          padding: "20px",
        }}
      >
        <h2 style={{ color: "var(--secondary-color)" }}>Admin</h2>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link
            to="/admin/bookings"
            style={{ color: "white", textDecoration: "none" }}
          >
            Bookings
          </Link>
          <Link
            to="/admin/users"
            style={{ color: "white", textDecoration: "none" }}
          >
            Users
          </Link>
          <Link
            to="/admin/forms"
            style={{ color: "white", textDecoration: "none" }}
          >
            Forms
          </Link>
          <Link
            to="/admin/coaches"
            style={{ color: "white", textDecoration: "none" }}
          >
            Coaches
          </Link>
          <Link
            to="/admin/availability"
            style={{ color: "white", textDecoration: "none" }}
          >
            Availability
          </Link>
          <Link
            to="/admin/service-areas"
            style={{ color: "white", textDecoration: "none" }}
          >
            Service Areas
          </Link>
          <Link
            to="/admin/pricing"
            style={{ color: "white", textDecoration: "none" }}
          >
            Pricing
          </Link>
          <Link
            to="/admin/settings"
            style={{ color: "white", textDecoration: "none" }}
          >
            Settings
          </Link>
        </nav>
        {/* 2. CHANGE the marginTop on this button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop:
              "30px" /* <-- CHANGE this from 'auto' to a specific value */,
            background: "none",
            border: "1px solid #555",
            color: "#ccc",
            padding: "8px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: "40px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
