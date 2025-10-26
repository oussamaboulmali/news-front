/**
 * React Context Provider for Global Application State
 * 
 * This context provides application-wide state and functionality including:
 * - Authentication state (handleValidateLogin, handleDisconnect)
 * - API configuration (baseUrl, ImageUrl)
 * - User preferences (language, routes)
 * - Security settings (prefixe, secretKey)
 * 
 * @module Context/contextProvider
 * @requires react - createContext
 * 
 * @example
 * // Consuming the context
 * import { ContextProvider } from './Context/contextProvider';
 * import { useContext } from 'react';
 * 
 * function MyComponent() {
 *   const { baseUrl, lang, handleDisconnect } = useContext(ContextProvider);
 *   // Use context values...
 * }
 */

import { createContext } from "react";

// Créez un contexte
const ContextProvider = createContext();

export { ContextProvider };
