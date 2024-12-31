import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); // `null` indicates loading state.

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:4000/api/auth/home', { withCredentials: true });
        setIsAuthenticated(true); // If the request is successful, the user is authenticated.
      } catch (error) {
        setIsAuthenticated(false); // If there's an error, the user is not authenticated.
      }
    };

    checkAuth();
  }, []);

  // Show a loading spinner or message while checking authentication.
  if (isAuthenticated === null) return <p>Loading...</p>;

  // Redirect to `/signin` if the user is not authenticated.
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

  export default ProtectedRoute;