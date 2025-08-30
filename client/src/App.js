import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import JewelleryCatalogue from "./pages/JewelleryCatalogue";
import UserCatalogue from "./pages/UserCatalogue";   // make sure file exists
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Dashboard (public) */}
        <Route path="/" element={<Dashboard />} />

        {/* User route (no login needed) */}
        <Route path="/user" element={<UserCatalogue />} />

        {/* Admin login */}
        <Route path="/admin" element={<Login />} />

        {/* Admin protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogue"
          element={
            <ProtectedRoute>
              <JewelleryCatalogue />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
