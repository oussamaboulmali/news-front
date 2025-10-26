import { useState } from "react";
import axios from "axios";
import { TreatError } from "../helpers/Gfunc";

/**
 * Custom React hook for making HTTP requests with axios
 * Provides state management for API calls including loading, response, and error states
 * Automatically handles authentication, security headers, and session management
 * 
 * @param {Object} config - Configuration object for the axios request
 * @param {string} config.url - The API endpoint URL to call
 * @param {string} config.method - HTTP method (get, post, put, delete, etc.)
 * @param {Object} config.body - Request body/payload for POST/PUT requests
 * 
 * @returns {Object} Hook state and methods
 * @returns {Object|null} response - The axios response object when request succeeds
 * @returns {string} error - Error message if request fails
 * @returns {boolean} loading - Loading state indicator
 * @returns {Function} fetchData - Function to trigger the API call
 * @returns {Function} clearData - Function to reset all states to initial values
 * 
 * @example
 * const { response, loading, error, fetchData } = useAxios({
 *   method: "post",
 *   url: "/api/users",
 *   body: { username: "test" }
 * });
 * 
 * useEffect(() => {
 *   fetchData();
 * }, []);
 * 
 * @security
 * - Includes X-Content-Type-Options header for MIME sniffing protection
 * - Includes Referrer-Policy header
 * - Includes Permissions-Policy header
 * - Includes Strict-Transport-Security header for HTTPS enforcement
 * - Automatically handles session expiration and redirects to login
 * - Uses withCredentials for cookie-based authentication
 */
const useAxios = ({ url, method, body }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Executes the HTTP request with configured parameters
   * Handles security headers, error cases, and authentication flow
   * 
   * @async
   * @function fetchData
   * @returns {Promise<void>}
   * 
   * @throws Will handle errors internally and set error state
   */
  const fetchData = async () => {
    // Prevent redundant calls if response already exists (commented out for flexibility)
    // if (response) return;
    
    setLoading(true);

    try {
      // Execute the HTTP request with security headers
      const res = await axios[method](url, body, {
        withCredentials: true, // Include cookies for session management
        headers: {
          "X-Content-Type-Options": "nosniff", // Prevent MIME sniffing attacks
          "Referrer-Policy": "no-referrer", // Prevent sending referrer URL
          "Permissions-Policy": "geolocation=()", // Disable geolocation and other sensitive APIs
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains", // Force HTTPS for 1 year
          "x-api-key": import.meta.env.VITE_APP_ID, // Custom API key for request authentication
        },
      });
      setResponse(res);
    } catch (error) {
      // Handle HTTP response errors
      if (error.response) {
        if (error.status === 404) {
          setError(error.message);
        } else {
          setError(error.response.data.message);
        }

        // Handle forced logout from server (e.g., account blocked, token expired)
        if (error?.response?.data?.logout) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/login");
        }
        
        // Handle missing or invalid session cookie
        if (error?.response?.data?.hasSession === false) {
          TreatError(error.response.data.message);
        }
      } else if (error.request) {
        // Handle network errors (no response from server)
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/login");
        setError("Aucune réponse du serveur");
      }
    }
    setLoading(false);
  };
  
  /**
   * Resets all hook states to initial values
   * Useful for cleanup or when preparing for a new request
   * 
   * @function clearData
   * @returns {void}
   */
  const clearData = () => {
    setResponse(null);
    setLoading(false);
    setError("");
  };

  return { response, loading, error, fetchData, clearData };
};

export { useAxios };
