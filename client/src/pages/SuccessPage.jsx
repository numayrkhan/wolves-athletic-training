// in client/src/pages/SuccessPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../hooks/useBooking";
import ReactGA from "react-ga4";

import ParqForm from "../components/ParqForm";
import WaiverForm from "../components/WaiverForm";
import "../Forms.css";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { clearSlots } = useBooking();

  const [needsParq, setNeedsParq] = useState(false);
  const [needsWaiver, setNeedsWaiver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const checkFormStatus = useCallback(async (id) => {
    if (!id) return;
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/users/${id}/form-status`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch status");

      setNeedsParq(!data.hasCompletedParq);
      setNeedsWaiver(!data.hasCompletedWaiver);
    } catch (error) {
      console.error("Error checking form status:", error);
      setNeedsParq(true);
      setNeedsWaiver(true);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get("payment_intent");

      if (!paymentIntentId) {
        console.error("Payment Intent ID not found in URL.");
        setIsLoading(false);
        return;
      }

      let orderData = null;
      const maxRetries = 5;
      for (let i = 0; i < maxRetries; i++) {
        try {
          const apiUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/order-by-pi/${paymentIntentId}`;
          const response = await fetch(apiUrl);

          if (response.ok) {
            orderData = await response.json();
            break;
          }

          if (response.status === 404) {
            console.log(`Order not found, attempt ${i + 1}. Retrying...`);
            await new Promise((res) => setTimeout(res, 1000));
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "An unexpected error occurred.");
          }
        } catch (error) {
          console.error("Error fetching order data:", error);
          break;
        }
      }

      if (orderData && orderData.userId) {
        // --- 2. ADD THIS EVENT TRACKING ---
        // This tells Google Analytics a purchase was successful
        ReactGA.event({
          category: "Ecommerce",
          action: "Purchase",
          label: "Coaching Session Booking",
        });

        const currentUserId = orderData.userId;
        setUserId(currentUserId);
        await checkFormStatus(currentUserId);
      } else {
        // ...
      }
      setIsLoading(false);
    };

    initializePage();
    clearSlots();
  }, [clearSlots, checkFormStatus]);

  const handleFormSubmit = async (e, formType) => {
    e.preventDefault();
    if (!userId) {
      alert("User session not found. Please refresh and try again.");
      return;
    }

    const formData = Object.fromEntries(new FormData(e.target));

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/forms/submit`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          formType: formType,
          formData: formData,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || `Failed to submit ${formType}`);

      console.log(`${formType} submitted successfully!`);
      await checkFormStatus(userId);
    } catch (error) {
      console.error(`Error submitting ${formType}:`, error);
      alert(`There was an error submitting the ${formType}. Please try again.`);
    }
  };

  const allFormsComplete = !needsParq && !needsWaiver;

  if (isLoading) {
    return (
      <div
        style={{ padding: "100px 20px", textAlign: "center", color: "white" }}
      >
        <h2>Loading Your Information...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "100px 20px",
        color: "white",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        className="order-summary"
        style={{
          background: "linear-gradient(145deg, #0f3d46, #0a2c33)",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid rgba(243, 159, 90, 0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "var(--secondary-color)",
            marginBottom: "20px",
            fontWeight: 600,
          }}
        >
          {allFormsComplete ? "Thank You!" : "Your Booking is Confirmed!"}
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "30px" }}>
          {allFormsComplete
            ? "Your registration is complete. We look forward to seeing you!"
            : "A confirmation has been sent to your email. Please complete the required forms below."}
        </p>
      </div>

      <div className="forms-container" style={{ marginTop: "40px" }}>
        {/* --- FIX: Display both forms if both are needed --- */}
        {needsParq && (
          <ParqForm onSubmit={(e) => handleFormSubmit(e, "PARQ")} />
        )}
        {needsWaiver && (
          <WaiverForm onSubmit={(e) => handleFormSubmit(e, "WAIVER")} />
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={() => navigate("/services")}
          className="checkout-button"
        >
          Book More Sessions
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
