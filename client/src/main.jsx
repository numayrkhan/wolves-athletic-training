// In client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // This might already be here
import "./style.css"; // Import your global styles
import { BookingProvider } from "./Context/BookingContext";
import ReactGA from "react-ga4"; // Import the library
import { HelmetProvider } from "react-helmet-async";

// --- ADD THIS INITIALIZATION ---
// Use your actual Measurement ID here
ReactGA.initialize("G-FH61JV2XQX");

// Render the App component wrapped in BookingProvider
// This allows all components within App to access the booking context
// and manage booking state globally

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Wrap your entire app with the BookingProvider */}
    <BookingProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BookingProvider>
  </React.StrictMode>
);
