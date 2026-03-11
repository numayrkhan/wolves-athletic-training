// in client/src/components/TimeSlotSelector.jsx

import React from "react";
import { format as formatDate, parseISO } from "date-fns";

const TimeSlotSelector = ({
  availableSlots,
  onSlotSelect,
  selectedSlots,
  serviceDuration,
  viewedDate,
}) => {
  if (!viewedDate) {
    return (
      <div className="time-slot-placeholder">
        Select a date to see available times.
      </div>
    );
  }

  // --- FIX: Compare dates in a more reliable, timezone-agnostic way ---
  const selectionOnThisDay = selectedSlots.find(
    (s) => new Date(s.start).toISOString().split("T")[0] === viewedDate
  );

  return (
    <div className="time-slot-container">
      <h3 className="time-slot-header">
        {formatDate(parseISO(viewedDate), "eeee, MMMM d")}
      </h3>
      <div className="time-slot-grid">
        {selectionOnThisDay ? (
          <>
            <button
              key={selectionOnThisDay.id}
              className="time-slot-button selected"
              onClick={() => onSlotSelect(selectionOnThisDay)}
            >
              {formatDate(new Date(selectionOnThisDay.start), "p")}
            </button>
            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                fontStyle: "italic",
                color: "#ccc",
              }}
            >
              Please select another day for your next session.
            </p>
          </>
        ) : availableSlots.length > 0 ? (
          availableSlots.map((slot) => {
            const slotId = new Date(slot.startTime).toISOString();
            return (
              <button
                key={slotId}
                className="time-slot-button"
                onClick={() =>
                  onSlotSelect({
                    id: slotId,
                    start: new Date(slot.startTime),
                    end: new Date(
                      new Date(slot.startTime).getTime() +
                        (serviceDuration || 60) * 60000
                    ),
                  })
                }
              >
                {formatDate(new Date(slot.startTime), "p")}
              </button>
            );
          })
        ) : (
          <p className="time-slot-placeholder">
            No available times for this date.
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
