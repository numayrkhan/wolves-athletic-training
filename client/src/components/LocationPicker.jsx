import React, { useState, useEffect, useRef } from "react";
// +++ Import the Google Maps components +++
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const LocationPicker = ({ zipCode, onConfirm }) => {
  const [parks, setParks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPark, setSelectedPark] = useState(null);

  // +++ State and refs for the map +++
  const [mapCenter, setMapCenter] = useState({ lat: 40.348, lng: -74.659 }); // Default center (e.g., Princeton, NJ)
  const mapRef = useRef(null);

  // +++ Load the Google Maps script using the API key from .env +++
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY,
  });

  useEffect(() => {
    if (!zipCode) return;

    const fetchParks = async () => {
      // ... (existing fetchParks logic remains the same)
      setIsLoading(true);
      setError("");
      setSelectedPark(null);
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_BASE_URL
        }/api/locations/nearby-parks?zip=${zipCode}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
          if (data.length > 0) {
            setParks(data);
            // +++ Set the map center to the first park found +++
            setMapCenter(data[0].location);
          } else {
            setError(
              "We couldn't automatically find a suitable park in your area. Please proceed to checkout, and we will contact you directly to arrange a convenient location."
            );
          }
        } else {
          throw new Error(data.error || "Failed to fetch parks.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParks();
  }, [zipCode]);

  const handleConfirmClick = () => {
    if (selectedPark) {
      onConfirm(selectedPark);
    } else if (error && parks.length === 0) {
      onConfirm("MANUAL_SELECTION_REQUIRED");
    }
  };

  // +++ When a park in the list is clicked, select it AND pan the map +++
  const handleParkSelect = (park) => {
    setSelectedPark(park);
    if (mapRef.current) {
      mapRef.current.panTo(park.location);
      mapRef.current.setZoom(14);
    }
  };

  return (
    <div className="location-picker-container">
      <h2>Select a Training Location</h2>

      {isLoading && <p>Searching for nearby parks...</p>}
      {error && <p className="location-error">{error}</p>}

      <div className="location-picker-layout">
        {/* --- Left Column: Park List --- */}
        <div className="park-list-container">
          {!isLoading && !error && parks.length > 0 && (
            <div className="park-list">
              {parks.map((park) => (
                <button
                  key={park.place_id}
                  onClick={() => handleParkSelect(park)} // Use the new handler
                  className={`park-option ${
                    selectedPark?.place_id === park.place_id ? "selected" : ""
                  }`}
                >
                  <strong>{park.name}</strong>
                  <span>{park.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Right Column: Map --- */}
        <div className="map-container">
          {isLoaded ? (
            <GoogleMap
              mapContainerClassName="map-element"
              center={mapCenter}
              zoom={12}
              onLoad={(map) => {
                mapRef.current = map;
              }} // Store map instance in ref
            >
              {parks.map((park) => (
                <MarkerF
                  key={park.place_id}
                  position={park.location}
                  onClick={() => handleParkSelect(park)} // Clicking a marker also selects it
                />
              ))}
            </GoogleMap>
          ) : (
            <div>Loading Map...</div>
          )}
        </div>
      </div>

      {!isLoading && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            className="checkout-button"
            disabled={!selectedPark && !error}
            onClick={handleConfirmClick}
          >
            Confirm Location and Proceed
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
