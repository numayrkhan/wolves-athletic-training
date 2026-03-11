// in client/src/pages/AdminPricingPage.jsx

import React, { useState, useEffect } from "react";
import "./AdminPricingPage.css"; // We will create this file next

const AdminPricingPage = () => {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newTier, setNewTier] = useState({
    sessionCount: "",
    pricePerSession: "",
  });

  const fetchTiers = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/admin/pricing-tiers`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch pricing tiers.");
      const data = await response.json();
      setTiers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handlePriceChange = (sessionCount, value) => {
    setTiers((currentTiers) =>
      currentTiers.map((tier) =>
        tier.sessionCount === sessionCount
          ? { ...tier, pricePerSession: value }
          : tier
      )
    );
  };

  const handleSavePrice = async (sessionCount) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("authToken");
    const tierToUpdate = tiers.find((t) => t.sessionCount === sessionCount);

    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/admin/pricing-tiers/${sessionCount}`;
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pricePerSession: tierToUpdate.pricePerSession }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update price.");
      }
      setSuccess(`Successfully updated price for ${sessionCount} session(s).`);
      setTimeout(() => setSuccess(""), 3000); // Clear message after 3 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  // --- NEW: Handler for the "Add New Tier" form inputs ---
  const handleNewTierInputChange = (e) => {
    const { name, value } = e.target;
    setNewTier((prevState) => ({ ...prevState, [name]: value }));
  };

  // --- NEW: Handler to submit the new tier ---
  const handleAddNewTier = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("authToken");
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/admin/pricing-tiers`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTier),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add tier.");
      }
      setSuccess("New tier added successfully!");
      setNewTier({ sessionCount: "", pricePerSession: "" }); // Reset form
      fetchTiers(); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- NEW: Handler to delete a tier ---
  const handleDeleteTier = async (sessionCount) => {
    if (
      window.confirm(
        `Are you sure you want to delete the tier for ${sessionCount} sessions?`
      )
    ) {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("authToken");
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/pricing-tiers/${sessionCount}`;
        const response = await fetch(apiUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to delete tier.");
        setSuccess("Tier deleted successfully.");
        fetchTiers(); // Refresh list
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading) return <p>Loading pricing tiers...</p>;

  return (
    <div className="admin-pricing-container">
      <h2>Pricing Management</h2>
      <p>Update, add, or remove pricing tiers for session packages.</p>

      {error && <p className="form-error-message">Error: {error}</p>}
      {success && <p className="form-success-message">{success}</p>}

      {/* This section for displaying/editing existing tiers is updated with a Delete button */}
      <div className="pricing-list">
        {tiers.map((tier) => (
          <div key={tier.sessionCount} className="pricing-tier-row">
            <div className="tier-label">
              {tier.sessionCount} Session{tier.sessionCount > 1 ? "s" : ""}
            </div>
            <div className="tier-input">
              <span>$</span>
              <input
                type="number"
                value={tier.pricePerSession}
                onChange={(e) =>
                  handlePriceChange(tier.sessionCount, e.target.value)
                }
                step="0.01"
              />
              <span className="tier-slash">/</span>
              <span>session</span>
            </div>
            <div className="tier-actions">
              <button
                onClick={() => handleSavePrice(tier.sessionCount)}
                className="save-button"
              >
                Save
              </button>
              <button
                onClick={() => handleDeleteTier(tier.sessionCount)}
                className="delete-button"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* This is the new form for adding a tier */}
      <div
        className="add-form-container"
        style={{ maxWidth: "700px", marginTop: "40px" }}
      >
        <h3>Add New Pricing Tier</h3>
        <form onSubmit={handleAddNewTier}>
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "1fr 1fr auto" }}
          >
            <div className="form-group">
              <label htmlFor="sessionCount">Session Count</label>
              <input
                id="sessionCount"
                name="sessionCount"
                type="number"
                value={newTier.sessionCount}
                onChange={handleNewTierInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pricePerSession">Price Per Session</label>
              <input
                id="pricePerSession"
                name="pricePerSession"
                type="number"
                value={newTier.pricePerSession}
                onChange={handleNewTierInputChange}
                step="0.01"
                required
              />
            </div>
            <button
              type="submit"
              className="submit-button"
              style={{ alignSelf: "end", height: "47px" }}
            >
              Add Tier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPricingPage;
