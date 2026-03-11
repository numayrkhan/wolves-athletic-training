// in client/src/context/BookingContext.jsx

import React, { useState, useCallback } from "react"; // Import useCallback
import { BookingContext } from "../context/BookingContextDefinition";

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState({
    serviceId: null,
    slots: [],
    location: null,
    coachId: null,
  });

  // Wrap all functions that modify state with useCallback
  const startNewBooking = useCallback((serviceId, coachId) => {
    setBooking({
      serviceId: serviceId,
      slots: [],
      location: null,
      coachId: coachId,
    });
  }, []); // Empty dependency array means this function will never be re-created

  const addSlot = useCallback((slot) => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      slots: [...currentBooking.slots, slot],
    }));
  }, []);

  const removeSlot = useCallback((slotId) => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      slots: currentBooking.slots.filter((s) => s.id !== slotId),
    }));
  }, []);

  const clearSlots = useCallback(() => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      slots: [],
    }));
  }, []);

  const setBookingLocation = useCallback((location) => {
    setBooking((currentBooking) => ({
      ...currentBooking,
      location: location,
    }));
  }, []);

  // The value object now provides stable functions
  const value = {
    booking,
    startNewBooking,
    addSlot,
    removeSlot,
    clearSlots,
    setBookingLocation,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
