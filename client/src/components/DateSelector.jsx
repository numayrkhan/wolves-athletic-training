// in client/src/components/DateSelector.jsx

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// We no longer need the date-fns library here

const DateSelector = ({ onDateSelect, selectedDate }) => {
  const handleDateClick = (arg) => {
    // --- FIX: Use the UTC date string from FullCalendar ---
    // The 'arg.dateStr' from FullCalendar provides the date in a clean
    // 'YYYY-MM-DD' format, without any timezone conversions. This is exactly
    // what our backend API expects.
    onDateSelect(arg.dateStr);
  };

  return (
    <div className="date-selector-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{ left: "prev", center: "title", right: "next" }}
        validRange={{ start: new Date() }}
        selectMirror={true}
        selectable={true}
        events={
          selectedDate
            ? [{
                start: selectedDate,
                display: "background",
                backgroundColor: "var(--secondary-color)",
              }]
            : []
        }
      />
    </div>
  );
};

export default DateSelector;