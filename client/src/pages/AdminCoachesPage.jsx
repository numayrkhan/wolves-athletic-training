// in client/src/pages/AdminCoachesPage.jsx

import React, { useState, useEffect } from "react";
import "./AdminBookingsPage.css"; // Reuse the table styles

const AdminCoachesPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the "Add New Coach" form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoach, setNewCoach] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
  });

  const fetchCoaches = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/coaches`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch coaches.");
      const data = await response.json();
      setCoaches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoach((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddCoachSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("authToken");
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/coaches`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCoach),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add coach.");
      }
      // Reset form, hide it, and refetch the list of coaches
      setNewCoach({ name: "", email: "", password: "", bio: "" });
      setShowAddForm(false);
      fetchCoaches();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (coachId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "reactivate" : "deactivate";

    if (window.confirm(`Are you sure you want to ${action} this coach?`)) {
      const token = localStorage.getItem("authToken");
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/coaches/${coachId}/status`;
        const response = await fetch(apiUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: newStatus }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} coach.`);
        }

        // Refresh the coach list to show the updated status
        fetchCoaches();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading) return <p>Loading coaches...</p>;

  return (
    <div className="admin-table-container">
      <div className="admin-page-header">
        <h2>Coach Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-new-button"
        >
          {showAddForm ? "Cancel" : "＋ Add New Coach"}
        </button>
      </div>

      {error && <p className="form-error-message">Error: {error}</p>}

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddCoachSubmit}>
            <div className="form-grid">
              {/* This group will contain the side-by-side fields */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={newCoach.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={newCoach.email}
                  onChange={handleInputChange}
                  placeholder="coach@example.com"
                  required
                />
              </div>
            </div>
            {/* These fields will be full-width */}
            <div className="form-group">
              <label htmlFor="password">Temporary Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={newCoach.password}
                onChange={handleInputChange}
                placeholder="Create a strong initial password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Coach Bio (Optional)</label>
              <textarea
                id="bio"
                name="bio"
                value={newCoach.bio}
                onChange={handleInputChange}
                placeholder="Write a short bio for the coach..."
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              Save Coach
            </button>
          </form>
        </div>
      )}

      <div className="table-wrapper" style={{ marginTop: "20px" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th> {/* <-- ADD 'Actions' HEADER */}
            </tr>
          </thead>
          <tbody>
            {coaches.map((coach) => (
              <tr key={coach.id}>
                <td>{coach.user.name}</td>
                <td>{coach.user.email}</td>
                {/* --- ADD 'Status' CELL --- */}
                <td>
                  <span
                    className={`status-badge ${
                      coach.isActive ? "active" : "inactive"
                    }`}
                  >
                    {coach.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {/* --- ADD 'Actions' CELL WITH THE BUTTON --- */}
                <td>
                  <button
                    onClick={() => handleToggleStatus(coach.id, coach.isActive)}
                    className={`action-button ${
                      coach.isActive ? "deactivate" : "reactivate"
                    }`}
                  >
                    {coach.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoachesPage;
