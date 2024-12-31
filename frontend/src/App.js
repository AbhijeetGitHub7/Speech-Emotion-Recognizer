import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import HomePage from "./pages/HomePage";  // Create a HomePage component for the homepage
import ProtectedRoute from './components/ProtectedRoute'
function App() {
  return (
    <div className="App">
    <Router>
      <Routes>
        
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/" element={<SignInPage />} /> {/* Default route to sign-in page */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } /> {/* Home page route */}
      </Routes>
    </Router>
    </div>
  );
}

export default App;