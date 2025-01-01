import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation to Home page
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();

  // State to hold form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/api/auth/signup", {  // Changed to correct endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",  // Include credentials for session management
    });

    const result = await response.json();

    if (response.status === 201) {  // Check for successful status code
      // On successful sign-up, redirect to the homepage
      navigate("/home");
    } else {
      alert(result.message || "Something went wrong"); // Show error message if any
    }
  };

  const navigateToSignIn = () => {
    navigate("/signin");  // Navigate to SignInPage
  };

  return (
    <div className="signup-container">
      {/* Left Panel */}
      <div className="signup-left-panel">
        <div className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="microphone-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 1v14m5.36-6.36a5 5 0 1 1-10.72 0M18 9a7 7 0 1 0-12 0m6 14v-4m-4 0h8"
            />
          </svg>
        </div>
        <h1>Feelings are valid</h1>
      </div>

      {/* Right Panel */}
      <div className="signup-right-panel">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <p>
            Already have an account? <a onClick={navigateToSignIn}>Log In</a>
          </p>
          <button type="submit" className="signup-button">Sign Up</button>
          {/* <div className="social-buttons">
            <button type="button" className="social-button google">
              Sign up with Google
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;