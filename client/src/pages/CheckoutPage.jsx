import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useBooking } from "../hooks/useBooking";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// The actual form component
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success`,
        payment_method_data: {
          billing_details: {
            email: customerEmail,
          },
        },
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="email-input"
          style={{ display: "block", marginBottom: "5px" }}
        >
          Email
        </label>
        <input
          id="email-input"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #555",
            background: "var(--primary-color)",
            color: "white",
          }}
        />
      </div>

      <AddressElement options={{ mode: "billing" }} />

      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="checkout-button"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {message && (
        <div
          id="payment-message"
          style={{ color: "#df1b41", marginTop: "15px" }}
        >
          {message}
        </div>
      )}
    </form>
  );
};

const CheckoutPage = () => {
  const { booking } = useBooking();
  const [clientSecret, setClientSecret] = useState("");
  // --- NEW: Add state to hold the dynamic pricing tiers ---
  const [priceTiers, setPriceTiers] = useState({});

  // --- NEW: useEffect to fetch pricing tiers once on load ---
  useEffect(() => {
    const fetchPricing = async () => {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/pricing-tiers`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const tiersObject = data.reduce((acc, tier) => {
          acc[tier.sessionCount] = tier.pricePerSession;
          return acc;
        }, {});
        setPriceTiers(tiersObject);
      } catch (error) {
        console.error("Failed to fetch pricing tiers:", error);
      }
    };
    fetchPricing();
  }, []);

  // useEffect to create the payment intent
  useEffect(() => {
    if (booking.slots.length > 0) {
      // --- FIX: Use the environment variable for the API URL ---
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/create-payment-intent`;
      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking: booking }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [booking]);

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#f39f5a",
      colorBackground: "#05161a",
      colorText: "#ffffff",
      borderRadius: "10px",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // --- FIX: Logic now uses the dynamic priceTiers state ---
  const sessionCount = booking.slots.length;
  const pricePerSession = priceTiers[sessionCount] || 0;
  const totalAmount = (pricePerSession * sessionCount).toFixed(2);

  if (!booking || booking.slots.length === 0) {
    return (
      <div
        style={{ padding: "100px 20px", color: "white", textAlign: "center" }}
      >
        <h2>Your booking is empty. Please select a session first.</h2>
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
      <h1>Complete Your Booking</h1>

      <div
        className="order-summary"
        style={{
          background: "#0a2c33",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid rgba(243, 159, 90, 0.2)",
        }}
      >
        <h3
          style={{
            color: "var(--secondary-color)",
            borderBottom: "1px solid #f39f5a",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          Order Summary
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          {/* Add a check to ensure price is loaded before displaying */}
          {pricePerSession > 0 ? (
            <>
              <span>
                {sessionCount}x Coaching Session(s) at ${pricePerSession}/ea
              </span>
              <span>${totalAmount}</span>
            </>
          ) : (
            <span>Loading price...</span>
          )}
        </div>
        {booking.location && (
          <div style={{ marginBottom: "10px" }}>
            <strong>Location:</strong>{" "}
            {typeof booking.location === "string"
              ? booking.location
              : booking.location.name}
          </div>
        )}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(243, 159, 90, 0.2)",
            margin: "15px 0",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          <span>Total</span>
          <span style={{ color: "var(--secondary-color)" }}>
            {pricePerSession > 0 ? `$${totalAmount}` : "..."}
          </span>
        </div>
      </div>

      <div className="checkout-form-container">
        {clientSecret && (
          <Elements key={clientSecret} options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
