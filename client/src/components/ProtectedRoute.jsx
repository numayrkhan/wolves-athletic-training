// in client/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A simple function to decode the JWT and check its payload
const getUserFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    // The token is in three parts: header, payload, signature
    // We only need the payload (the middle part)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const user = getUserFromToken();

  // If there's no user or the user is not an admin, redirect to login page
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // If the user is an admin, render the requested component
  // <Outlet /> is used for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;