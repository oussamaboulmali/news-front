/**
 * @fileoverview Global Context Provider
 * 
 * Provides global application state and functions to all components
 * Uses React Context API for state management
 * 
 * @module Context/contextProvider
 */

import { createContext } from "react";

/**
 * Global context for sharing state across the application
 * 
 * @typedef {Object} ContextValue
 * @property {Function} handleValidateLogin - Function to set user as logged in
 * @property {Function} handleDisconnect - Function to logout user
 * @property {string} baseUrl - Base URL for API requests
 * @property {string} emptyData - Default message for empty data states
 * @property {Array} routes - Dynamic routes based on user permissions
 * @property {string} ImageUrl - Base URL for image assets
 * @property {Object} lang - Current language translations object
 * @property {string} prefixe - Prefix for localStorage keys
 * @property {string} secretKey - Encryption key for localStorage
 * @property {Function} updateRoutes - Function to refresh routes
 * 
 * @example
 * // Using the context in a component
 * const { baseUrl, lang, handleDisconnect } = useContext(ContextProvider);
 */
const ContextProvider = createContext();

export { ContextProvider };
