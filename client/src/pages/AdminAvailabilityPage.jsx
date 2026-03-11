// in client/src/pages/AdminAvailabilityPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./AdminAvailabilityPage.css";

const AdminAvailabilityPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [viewedDate, setViewedDate] = useState(null); // To store the selected date string 'YYYY-MM-DD'
  const [dailyAvailability, setDailyAvailability] = useState([]); // To store availability for the selected day
  const [error, setError] = useState("");

  // State for the "Add New" form
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");

  const headers = useMemo(() => {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Fetch all coaches for the dropdown
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/coaches`,
          { headers }
        );
        if (!response.ok) throw new Error("Could not fetch coaches.");
        const data = await response.json();
        setCoaches(data);
        if (data.length > 0) {
          setSelectedCoachId(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCoaches();
  }, [headers]);

  // Fetch availability for the selected coach AND date
  const fetchDailyAvailability = useCallback(async () => {
    if (!selectedCoachId || !viewedDate) {
      setDailyAvailability([]);
      return;
    }
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/availability?coachId=${selectedCoachId}`,
        { headers }
      );
      if (!response.ok) throw new Error("Could not fetch availability.");
      const data = await response.json();

      // Filter the results to only include blocks for the selected day
      const dailyData = data.filter((avail) =>
        new Date(avail.startTime).toISOString().startsWith(viewedDate)
      );
      setDailyAvailability(dailyData);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedCoachId, viewedDate, headers]);

  // Re-fetch when coach or date changes
  useEffect(() => {
    fetchDailyAvailability();
  }, [fetchDailyAvailability]);

  // Handler for when a date is clicked on the calendar
  const handleDateClick = (arg) => {
    setViewedDate(arg.dateStr);
  };

  // Handler for submitting the "Add New" form
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    const start = new Date(`${viewedDate}T${newStartTime}:00`);
    const end = new Date(`${viewedDate}T${newEndTime}:00`);

    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/availability`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ coachId: selectedCoachId, start, end }),
        }
      );
      if (!response.ok) throw new Error("Failed to save availability.");
      fetchDailyAvailability(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  // Handler for deleting an existing availability block
  const handleDeleteAvailability = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this availability block?")
    ) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/availability/${id}`,
          {
            method: "DELETE",
            headers,
          }
        );
        if (!response.ok) throw new Error("Failed to delete availability.");
        fetchDailyAvailability(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Generate time options for the dropdowns
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    timeOptions.push(`${hour}:00`);
  }

  // 1. Format the availability for the selected day into FullCalendar event objects
  const formattedEvents = dailyAvailability.map((avail) => ({
    id: avail.id,
    title: "Available",
    start: new Date(avail.startTime),
    end: new Date(avail.endTime),
  }));

  // 2. Create the final array for the calendar, starting with our formatted events
  const calendarEvents = [...formattedEvents];

  // 3. If a date is selected, add the background highlight event
  if (viewedDate) {
    calendarEvents.push({
      start: viewedDate,
      display: "background",
      backgroundColor: "rgba(243, 159, 90, 0.3)",
    });
  }

  return (
    <div className="availability-container">
      <h2>Manage Coach Availability</h2>
      <div className="availability-controls">
        <label htmlFor="coach-select">Select Coach:</label>
        <select
          id="coach-select"
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value)}
        >
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="availability-layout">
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            dateClick={handleDateClick}
            events={calendarEvents}
            height="auto"
          />
        </div>

        <div className="times-panel">
          <h3>
            Manage Times for{" "}
            {viewedDate
              ? new Date(viewedDate + "T00:00:00Z").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "..."}
          </h3>

          {!viewedDate ? (
            <p>Please select a date on the calendar to begin.</p>
          ) : (
            <>
              {error && <p className="form-error-message">Error: {error}</p>}
              <div className="existing-availability">
                <h4>Existing Availability</h4>
                {dailyAvailability.length === 0 ? (
                  <p>No availability set for this day.</p>
                ) : (
                  <ul>
                    {dailyAvailability.map((avail) => (
                      <li key={avail.id}>
                        <span>
                          {new Date(avail.startTime).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(avail.endTime).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteAvailability(avail.id)}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form
                className="add-availability-form"
                onSubmit={handleAddAvailability}
              >
                <h4>Add New Availability</h4>
                <div className="time-inputs">
                  <div>
                    <label htmlFor="start-time">Start Time</label>
                    <select
                      id="start-time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`1970-01-01T${time}`).toLocaleTimeString(
                            [],
                            { hour: "numeric", minute: "2-digit" }
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="end-time">End Time</label>
                    <select
                      id="end-time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`1970-01-01T${time}`).toLocaleTimeString(
                            [],
                            { hour: "numeric", minute: "2-digit" }
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="add-new-button">
                  Add Availability
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAvailabilityPage;
