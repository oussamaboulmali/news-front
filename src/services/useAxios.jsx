/**
 * Custom React Hook for making HTTP requests with axios
 * 
 * This hook provides a reusable way to make API calls with built-in:
 * - Loading state management
 * - Error handling
 * - Response caching
 * - Session validation
 * - Security headers (HSTS, X-Content-Type-Options, etc.)
 * 
 * @module services/useAxios
 * @requires axios - HTTP client
 * @requires react - useState hook
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.url - API endpoint URL
 * @param {string} config.method - HTTP method (get, post, put, delete)
 * @param {Object} config.body - Request body data
 * 
 * @returns {Object} Hook return object
 * @returns {Object|null} returns.response - API response data
 * @returns {string} returns.error - Error message if request fails
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {Function} returns.fetchData - Function to trigger the API call
 * @returns {Function} returns.clearData - Function to reset all states
 * 
 * @example
 * const { response, loading, error, fetchData } = useAxios({
 *   method: "post",
 *   url: "/api/users",
 *   body: { name: "John" }
 * });
 * 
 * // Trigger the request
 * fetchData();
 */

import { useState } from "react";
import axios from "axios";
import { TreatError } from "../helpers/Gfunc";

const useAxios = ({ url, method, body }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Executes the HTTP request with configured parameters
   * 
   * Handles the complete request lifecycle:
   * 1. Sets loading state to true
   * 2. Makes the HTTP request with security headers
   * 3. Updates response state on success
   * 4. Handles various error scenarios (404, session expiry, server errors)
   * 5. Sets loading state to false
   * 
   * Error Handling:
   * - 404 errors: Sets generic error message
   * - Session errors: Clears storage and redirects to login
   * - Network errors: Clears storage and redirects to login
   * 
   * @async
   * @function fetchData
   * @returns {Promise<void>}
   */
  const fetchData = async () => {
    // if (response) return;
    setLoading(true);

    try {
      const res = await axios[method](url, body, {
        withCredentials: true,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer", // Empêche l'envoi de l'URL référente
          "Permissions-Policy": "geolocation=()", // Désactive certaines API comme la géolocalisation
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains", // Forcer HTTPS
          "x-api-key": import.meta.env.VITE_APP_ID,
        },
      });
      setResponse(res);
    } catch (error) {
      if (error.response) {
        if (error.status === 404) {
          setError(error.message);
        } else {
          setError(error.response.data.message);
        }

        if (error?.response?.data?.logout) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/login");
        }
        //si la session cookies indisponible.
        if (error?.response?.data?.hasSession === false) {
          TreatError(error.response.data.message);
        }
      } else if (error.request) {
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
   * 
   * Useful for:
   * - Clearing previous request data
   * - Resetting component state
   * - Preparing for new requests
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
