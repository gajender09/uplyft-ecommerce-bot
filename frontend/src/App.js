// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Chatbot from "./components/Chatbot";
import History from "./components/History";
import "./App.css";

// Protected route wrapper
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chatbot />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <History />
            </RequireAuth>
          }
        />

        <Route
          path="*"
          element={
            <h1 style={{ textAlign: "center", color: "white" }}>404 Not Found</h1>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
