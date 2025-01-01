import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation to Home page
import "./SignInPage.css";

function SignInPage() {
  const navigate = useNavigate();

  // State to hold form data
  const [formData, setFormData] = useState({
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

    const response = await fetch("http://localhost:4000/api/auth/signin", {  // Corrected API endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",  // Ensure cookies (session) are included
    });

    const result = await response.json();

    if (response.status === 200) {  // Check for successful status code
      // On successful sign-in, redirect to the homepage
      navigate("/home");
    } else {
      alert(result.message || "Something went wrong"); // Show error message if any
    }
  };

  const navigateToSignUp = () => {
    navigate("/signup");  // Navigate to SignUpPage
  };

  return (
    <div className="signin-container">
      {/* Left Panel */}
      <div className="signin-left-panel">
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
      <div className="signin-right-panel">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
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
            Don't have an account? <a onClick={navigateToSignUp}>Sign Up</a>
          </p>
          <button type="submit" className="signin-button">Sign In</button>
          {/* <div className="social-buttons">
            <button type="button" className="social-button google">
              Sign in with Google
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default SignInPage;