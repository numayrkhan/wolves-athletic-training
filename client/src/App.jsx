import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import ContactPage from "./pages/ContactPage";
import "./components/Header.css";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
// added for admin login
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout"; // Import the new layout
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminFormsPage from "./pages/AdminFormsPage";
import "./pages/AdminDashboard.css";
import AdminCoachesPage from "./pages/AdminCoachesPage";
import AdminAvailabilityPage from "./pages/AdminAvailabilityPage";
import AdminServiceAreaPage from "./pages/AdminServiceAreaPage";
import AdminPricingPage from "./pages/AdminPricingPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RouteChangeTracker from "./components/RouteChangeTracker";
// --- Reusable Layout Components ---

// --- Replace your existing Header component with this one ---
const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* --- ADD THIS WRAPPER DIV --- */}
      <div className="header-container">
        <header>
          <Link to="/" onClick={handleMobileLinkClick}>
            <img
              src="/Logo.jpg"
              alt="Wolves Athletic Training Logo"
              id="logo"
            />
          </Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <div className="desktop-header-button">
            <Link to="/contact">
              <button id="navJoin">Contact us</button>
            </Link>
          </div>
          <button
            className="hamburger-menu"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            &#9776;
          </button>
        </header>

        <div className="demo-banner">
          This is a demo App. Payments are processed using Stripe's test mode.
        </div>
      </div>
      {/* --- END OF WRAPPER DIV --- */}

      {/* The mobile nav overlay remains outside the wrapper */}
      <div className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}>
        <button
          className="close-menu-btn"
          onClick={() => setMobileMenuOpen(false)}
        >
          &times; {/* This is a common 'X' character entity */}
        </button>
        <Link to="/" onClick={handleMobileLinkClick}>
          Home
        </Link>
        <Link to="/services" onClick={handleMobileLinkClick}>
          Services
        </Link>
        <Link to="/contact" onClick={handleMobileLinkClick}>
          Contact
        </Link>
      </div>
    </>
  );
};
// Your Footer, converted to a React component
const Footer = () => (
  <footer>
    <div className="image">
      <img src="images/logo2.jpeg" alt="logo2" id="logo2" />
    </div>
    <div className="contact">
      <h4>Contact</h4>
      <ul>
        <li>wolfathletic@contact.com</li>
        <li>
          <a href="tel:609-349-2036">609-999-2034</a>
        </li>
      </ul>
    </div>
    <div className="socials">
      <a href="#" aria-label="Facebook">
        <i className="fa-brands fa-facebook"></i>
      </a>
      <a href="https://instagram.com/wolvesathletictraining?igshid=YzAwZjE1ZTI0Zg==">
        <i className="fa-brands fa-instagram"></i>
      </a>
      <a href="#" aria-label="TikTok">
        <i className="fa-brands fa-tiktok"></i>
      </a>

      <a href="#" aria-label="YouTube">
        <i className="fa-brands fa-youtube"></i>
      </a>
    </div>

    <div className="copyRight">
      <p>© 2023 WOLVES ATHLETIC.</p>
      <p>
        <a href="#">Terms & Conditions</a> Apply ,<a href="#">Privacy Policy</a>
        .
      </p>
    </div>
  </footer>
);

// A Layout component to wrap every page
const AppLayout = () => (
  <div id="main-container">
    <Header />
    <main>
      {/* Outlet is a placeholder where the current page's content will be rendered */}
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Admin dashboard pages
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [statsRes, chartRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard-stats`,
            { headers }
          ),
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/bookings-over-time`,
            { headers }
          ),
        ]);

        if (!statsRes.ok || !chartRes.ok)
          throw new Error("Failed to fetch dashboard data.");

        const statsData = await statsRes.json();
        const rawChartData = await chartRes.json();

        setStats(statsData);
        // Format the date for the chart
        const formattedChartData = rawChartData.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          bookings: Number(item.count),
        }));
        setChartData(formattedChartData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Upcoming Sessions (7 Days)</h3>
          <p>{stats?.upcomingSessions}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats?.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats?.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>New Users (30 Days)</h3>
          <p>{stats?.newUsers}</p>
        </div>
      </div>
      <div className="chart-container">
        <h3>Bookings Over Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a2c33",
                border: "1px solid #555",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="var(--secondary-color)"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RouteChangeTracker />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* The index route is the default page for the parent route '/' */}
          <Route index element={<HomePage />} />
          <Route path="services" element={<BookingPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="/booking/success" element={<SuccessPage />} />
        </Route>

        {/* --- Auth Route --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* --- Protected Admin Routes --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* You can create a new AdminLayout component later if you want a sidebar */}
          {/* For now, it will just render the dashboard component */}
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="forms" element={<AdminFormsPage />} />
          <Route path="coaches" element={<AdminCoachesPage />} />
          <Route path="availability" element={<AdminAvailabilityPage />} />
          <Route path="service-areas" element={<AdminServiceAreaPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
