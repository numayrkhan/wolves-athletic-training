import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../hooks/useBooking";
import DateSelector from "../components/DateSelector";
import TimeSlotSelector from "../components/TimeSlotSelector";
import LocationPicker from "../components/LocationPicker";

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState("scheduling");
  const [zipCode, setZipCode] = useState("");
  const [isZipValid, setIsZipValid] = useState(false);
  const [zipMessage, setZipMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [services, setServices] = useState([]);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [viewedDate, setViewedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [priceTiers, setPriceTiers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "1-on-1 Soccer Coaching",
    "description": "Personalized, one-on-one soccer training sessions designed to improve technical skills, tactical awareness, and overall athletic performance.",
    "provider": {
      "@type": "Organization",
      "name": "Wolves Athletic Training"
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Mercer County"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Middlesex County"
      }
    ],
    "serviceType": "Soccer Training"
  };


  const navigate = useNavigate();
  const {
    booking,
    startNewBooking,
    addSlot,
    removeSlot,
    clearSlots,
    setBookingLocation,
  } = useBooking();
  const { slots: selectedSlots } = booking;
  const requiredSlots = sessionCount;

  // This useEffect now fetches all initial data using the environment variable
  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesApiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/services`;
        const servicesResponse = await fetch(servicesApiUrl);
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

        const pricingApiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/pricing-tiers`;
        const pricingResponse = await fetch(pricingApiUrl);
        const pricingData = await pricingResponse.json();

        const tiersObject = pricingData.reduce((acc, tier) => {
          acc[tier.sessionCount] = tier.pricePerSession;
          return acc;
        }, {});
        setPriceTiers(tiersObject);
      } catch (error) {
        console.error("Failed to fetch initial page data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch available time slots when a date is selected for an expanded service
  useEffect(() => {
    if (!viewedDate || !expandedServiceId) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlotsForDate = async () => {
      setIsLoadingSlots(true);
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/availability?date=${viewedDate}`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setAvailableSlots(data);
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlotsForDate();
  }, [viewedDate, expandedServiceId]);

  const handleZipCodeChange = async (e) => {
    const newZip = e.target.value.replace(/\D/g, "");
    setZipCode(newZip);
    setShowRequestForm(false);

    if (newZip.length === 5) {
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/validate-zipcode/${newZip}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        setIsZipValid(data.isValid);
        setZipMessage(data.message);
        if (!data.isValid) {
          setShowRequestForm(true);
        }
      } catch (error) {
        console.error("ZIP validation error:", error);
        setZipMessage(
          "Could not validate ZIP code. Please check your connection."
        );
      }
    } else {
      setIsZipValid(false);
      setZipMessage("");
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");

    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/request-service-area`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, name, email }),
      });
      const data = await response.json();
      setZipMessage(data.message);
      setShowRequestForm(false);
    } catch (error) {
      console.error("Service area request error:", error);
      setZipMessage("Failed to submit your request. Please try again later.");
    }
  };

  const handleQuantityChange = (amount) => {
    setSessionCount((prev) => {
      const newCount = prev + amount;
      if (newCount < 1 || newCount > 6) return prev;
      if (selectedSlots.length > 0) clearSlots();
      return newCount;
    });
  };

  const handleSelectService = (serviceId) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
      clearSlots();
      setViewedDate(null);
    } else {
      setExpandedServiceId(serviceId);
      startNewBooking(serviceId, null);
    }
  };

  const handleSlotSelect = (slotInfo) => {
    const isAlreadySelected = selectedSlots.some((s) => s.id === slotInfo.id);
    if (isAlreadySelected) {
      removeSlot(slotInfo.id);
    } else {
      if (selectedSlots.length < requiredSlots) {
        addSlot(slotInfo);
      } else {
        setErrorMessage(`You can only select ${requiredSlots} session(s).`);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const handleConfirmSlots = async () => {
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/bookings/validate`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: selectedSlots }),
      });
      const validationResult = await response.json();

      if (validationResult.isValid) {
        clearSlots();
        validationResult.slots.forEach((slot) => addSlot(slot));
        setCurrentStep("location");
      } else {
        setErrorMessage(validationResult.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error during slot validation:", error);
      setErrorMessage(
        "An error occurred while confirming slots. Please try again."
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleLocationConfirmed = (location) => {
    setBookingLocation(location);
    navigate("/checkout");
  };

  return (
    <div
      style={{
        padding: "100px 20px",
        color: "white",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <Helmet>
        <title>Book a Session - Wolves Athletic Training</title>
        <meta
          name="description"
          content="Schedule your private soccer training session online. Select a package and book a time with our expert coaches in our New Jersey service area."
        />
         <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1>Book Your Sessions</h1>
        <div className="zip-gate-container">
          <p>
            We travel to you! Please enter your ZIP code to unlock scheduling.
          </p>
          <input
            type="text"
            maxLength="5"
            placeholder="Enter 5-digit ZIP Code"
            className="zip-input"
            value={zipCode}
            onChange={handleZipCodeChange}
          />
          {zipMessage && (
            <p
              style={{
                color: isZipValid ? "#a3d9a5" : "#f39f5a",
                marginTop: "10px",
              }}
            >
              {zipMessage}
            </p>
          )}
          {showRequestForm && (
            <form onSubmit={handleRequestSubmit} className="request-form">
              <p
                style={{
                  marginTop: "15px",
                  marginBottom: "10px",
                  fontSize: "0.9rem",
                }}
              >
                Let us know you're interested! We'll email you when we expand to
                your area.
              </p>
              <input
                type="text"
                name="name"
                placeholder="Your Name (Optional)"
                className="zip-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="zip-input"
              />
              <button type="submit" className="checkout-button">
                Request Service
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="service-accordion">
        {services.map((service) => (
          <div className="service-item" key={service.id}>
            <div
              className={`service-header ${!isZipValid ? "disabled" : ""}`}
              onClick={
                isZipValid ? () => handleSelectService(service.id) : undefined
              }
            >
              <span>{service.name}</span>
              <span style={{ flexGrow: 1 }}></span>
              <button className="select-button" disabled={!isZipValid}>
                {expandedServiceId === service.id ? "Close" : "Select"}
              </button>
            </div>

            {expandedServiceId === service.id && (
              <div className="service-body">
                {currentStep === "scheduling" ? (
                  <>
                    <div className="quantity-selector-container">
                      <div className="quantity-selector">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={sessionCount <= 1}
                        >
                          -
                        </button>
                        <span>{sessionCount} Session(s)</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={sessionCount >= 6}
                        >
                          +
                        </button>
                      </div>
                      <div className="price-display">
                        Total Price:{" "}
                        <span style={{ color: "var(--secondary-color)" }}>
                          {priceTiers[sessionCount]
                            ? `$${(
                                priceTiers[sessionCount] * sessionCount
                              ).toFixed(2)}`
                            : "..."}
                        </span>
                        {priceTiers[sessionCount] && (
                          <em> (${priceTiers[sessionCount]}/session)</em>
                        )}
                      </div>
                    </div>
                    <div className="scheduler-container">
                      {errorMessage && (
                        <p style={{ color: "#f39f5a", textAlign: "center" }}>
                          {errorMessage}
                        </p>
                      )}
                      <div className="service-body-split">
                        <DateSelector
                          onDateSelect={setViewedDate}
                          selectedDate={viewedDate}
                        />
                        <div className="time-slot-wrapper">
                          {isLoadingSlots ? (
                            <p>Loading times...</p>
                          ) : (
                            <TimeSlotSelector
                              availableSlots={availableSlots}
                              onSlotSelect={handleSlotSelect}
                              selectedSlots={selectedSlots}
                              serviceDuration={60}
                              viewedDate={viewedDate}
                            />
                          )}
                          <div className="selected-sessions-summary">
                            <h3>
                              Your Selected Sessions ({selectedSlots.length} /{" "}
                              {requiredSlots})
                            </h3>
                            <ul>
                              {selectedSlots.map((slot) => (
                                <li key={slot.id}>
                                  {new Date(slot.start).toLocaleString([], {
                                    weekday: "short",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={clearSlots}
                              className="checkout-button change-selection-btn"
                            >
                              Clear Selections
                            </button>
                            <button
                              onClick={handleConfirmSlots}
                              disabled={selectedSlots.length !== requiredSlots}
                              className="checkout-button"
                            >
                              Confirm and Proceed
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="location-container">
                    <LocationPicker
                      zipCode={zipCode}
                      onConfirm={handleLocationConfirmed}
                    />
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button
                        onClick={() => setCurrentStep("scheduling")}
                        className="checkout-button change-selection-btn"
                      >
                        Back to Change Times
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="service-item">
          <div className="service-header disabled">
            <span>Camps</span>
            <button className="select-button" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
