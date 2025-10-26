/**
 * @fileoverview Global Helper Functions for News Dashboard Application
 * 
 * This file contains utility functions used throughout the application including:
 * - Authentication and session management
 * - Data validation and sanitization (SQL injection, XSS prevention)
 * - String manipulation and formatting
 * - Date/time operations
 * - Encryption/decryption utilities
 * - Array and object operations
 * - Security and error handling
 * 
 * @module helpers/Gfunc
 * @author Algeria Press Service (APS)
 * @version 1.0.0
 */

import { mdiAlertCircleOutline } from "@mdi/js";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import * as Gfunc from "../helpers/Gfunc";

/**
 * Logs out the user by clearing session cookies and redirecting to login page
 * Called when session is invalid or expired
 * 
 * @async
 * @function LougoutCoookiesSession
 * @returns {Promise<void>}
 * 
 * @example
 * await LougoutCoookiesSession();
 */
const LougoutCoookiesSession = async () => {
  try {
    await axios.post(
      import.meta.env.VITE_BASE_URL + "auth/logout",
      {
        username:
          Gfunc.useDecryptedLocalStorage(
            "username" + import.meta.env.VITE_PREF,
            import.meta.env.VITE_KEY
          ) || "",
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_APP_ID,
        },
      }
    );

    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  } catch (error) {
    // Even if logout API fails, clear local data and redirect
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  }
};

/**
 * Displays an error toast notification and automatically logs out user after 5 seconds
 * Used when user session is invalid or expired
 * 
 * @async
 * @function TreatError
 * @param {string} message - Error message to display to the user
 * @returns {Promise<void>}
 * 
 * @example
 * TreatError("Your session has expired. Please login again.");
 */
export const TreatError = async (message) => {
  toast.error(message, {
    icon: mdiAlertCircleOutline,
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    onClick: () => {
      LougoutCoookiesSession();
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  LougoutCoookiesSession();
};

/**
 * Sorts an array of objects in ascending order based on a specified attribute
 * 
 * @function sortedAscendingArray
 * @param {Array<Object>} array - Array of objects to sort
 * @param {string} att - Attribute name to sort by
 * @returns {Array<Object>} Sorted array
 * 
 * @example
 * const users = [{name: "Bob"}, {name: "Alice"}];
 * const sorted = sortedAscendingArray(users, "name");
 * // Returns: [{name: "Alice"}, {name: "Bob"}]
 */
export function sortedAscendingArray(array, att) {
  return array.sort((a, b) => (a[att] > b[att] ? 1 : b[att] > a[att] ? -1 : 0));
}

/**
 * Converts the first letter of a string to lowercase
 * Useful for converting PascalCase to camelCase
 * 
 * @function firstToLower
 * @param {string} chaine - String to convert
 * @returns {string} String with first letter in lowercase
 * 
 * @example
 * firstToLower("UserProfile"); // Returns: "userProfile"
 */
export function firstToLower(chaine) {
  return chaine.charAt(0).toLowerCase() + chaine.slice(1);
}

/**
 * Formats a string by replacing underscores/hyphens with spaces and capitalizing each word
 * 
 * @function formatAndCapitalize
 * @param {string} string - String to format (kebab-case or snake_case)
 * @returns {string} Formatted string with capital first letters
 * 
 * @example
 * formatAndCapitalize("user-profile"); // Returns: "User Profile"
 * formatAndCapitalize("user_name");    // Returns: "User Name"
 */
export function formatAndCapitalize(string) {
  if (!string) return "";

  return string
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Returns the appropriate Material Design Icon name based on menu item
 * Maps menu identifiers to their corresponding icon names
 * 
 * @function getIcon
 * @param {string} str - Menu item identifier
 * @returns {string|undefined} MDI icon name or undefined if no match
 * 
 * @example
 * getIcon("acceuil");      // Returns: "mdiHome"
 * getIcon("utilisateurs"); // Returns: "mdiAccount"
 * getIcon("agences");      // Returns: "mdiBank"
 */
export function getIcon(str) {
  switch (str) {
    case "acceuil":
      return "mdiHome";
    case "fils_de_presse":
      return "mdiPost";
    case "configuration":
      return "mdiCogOutline";
    case "utilisateurs":
      return "mdiAccount";
    case "users":
      return "mdiAccount";
    case "sessions":
      return "mdiAlphaS";
    case "agences":
      return "mdiBank";
    case "settings":
      return "mdiCogs";
    case "rôles":
      return "mdiBadgeAccountHorizontal";
    case "blocage":
      return "mdiBlockHelper";
    case "erreurs_connexion":
      return "mdiFileDocumentAlert";
    default:
      if (str.includes("log")) {
        return "mdiTextBoxSearch";
      }
      if (str.includes("afp")) {
        return "mdiTextBoxSearch";
      }
  }
}

/**
 * Validates an email address format
 * 
 * @function validateEmail
 * @param {string} value - Email address to validate
 * @returns {boolean} True if valid email format, false otherwise
 * 
 * @example
 * validateEmail("user@example.com"); // Returns: true
 * validateEmail("invalid-email");    // Returns: false
 */
export const validateEmail = (value) => {
  // Regular expression to check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates a phone number (expects exactly 10 digits)
 * 
 * @function validatePhone
 * @param {string} value - Phone number to validate
 * @returns {boolean} True if valid phone format (10 digits), false otherwise
 * 
 * @example
 * validatePhone("0123456789"); // Returns: true
 * validatePhone("123");        // Returns: false
 */
export const validatePhone = (value) => {
  // Verify that the number contains exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(value);
};

/**
 * Formats an ISO date string to French locale format (DD.MM.YYYY - HH:MM)
 * 
 * @function formaterDate
 * @param {string} dateISO - ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns {string|null} Formatted date string or null if input is falsy
 * 
 * @example
 * formaterDate("2024-01-15T10:30:00Z");
 * // Returns: "15.01.2024 - 10:30"
 */
export function formaterDate(dateISO) {
  const date = new Date(dateISO);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return dateISO
    ? date
        .toLocaleString("fr-FR", options)
        .replace(" ", " - ")
        .replace(/\//g, ".")
    : null;
}

/**
 * Removes an element from an array of objects by its ID
 * 
 * @function DeleteElementfromArray
 * @param {Array<Object>} array - Array to filter
 * @param {*} idElement - ID value to match
 * @param {string} idName - Property name containing the ID
 * @returns {Array<Object>} New array without the element
 * 
 * @example
 * const users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}];
 * DeleteElementfromArray(users, 1, "id");
 * // Returns: [{id: 2, name: "Bob"}]
 */
export function DeleteElementfromArray(array, idElement, idName) {
  const newTable = array.filter((element) => element[idName] !== idElement);
  return newTable;
}

/**
 * Compares two strings for equality (locale-aware comparison)
 * 
 * @function TwoEqualeString
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {boolean} True if strings are equal, false otherwise
 * 
 * @example
 * TwoEqualeString("hello", "hello"); // Returns: true
 * TwoEqualeString("hello", "world"); // Returns: false
 */
export const TwoEqualeString = (str1, str2) => {
  if (str1.localeCompare(str2) === 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Converts agency name to route path format
 * Handles special cases like "APS AR"
 * 
 * @function getPathRoute
 * @param {string} str - Agency name
 * @returns {string} Path-formatted string
 * 
 * @example
 * getPathRoute("APS AR"); // Returns: "Aps-ar"
 * getPathRoute("Other");  // Returns: "Other"
 */
export function getPathRoute(str) {
  switch (str) {
    case "APS AR":
      return "Aps-ar";
    default:
      return str;
  }
}

/**
 * Formats a kebab-case string to Title Case
 * 
 * @function formatString
 * @param {string} input - Kebab-case string (e.g., "user-profile")
 * @returns {string} Title cased string
 * 
 * @example
 * formatString("user-profile"); // Returns: "User Profile"
 */
export function formatString(input) {
  return input
    .split("-") // Split string into parts using "-" as separator
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter, rest lowercase
    )
    .join(" "); // Join words with spaces
}

/**
 * Converts a date string to ISO format (YYYY-MM-DD)
 * 
 * @function stringToDate
 * @param {string} dateString - Date string to convert
 * @returns {string} ISO formatted date (YYYY-MM-DD)
 * 
 * @example
 * stringToDate("2024-01-15T10:30:00.000Z");
 * // Returns: "2024-01-15"
 */
export const stringToDate = (dateString) => {
  const formattedDateString = dateString.slice(0, -4);
  const [year, month, day] = formattedDateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().split("T")[0];
};

/**
 * Maps display names to API endpoint paths
 * 
 * @function getPathName
 * @param {string} str - Display name
 * @returns {string} API path name
 * 
 * @example
 * getPathName("erreurs connexion"); // Returns: "login_erreurs"
 * getPathName("Agences");           // Returns: "agences"
 */
export const getPathName = (str) => {
  switch (str) {
    case "erreurs connexion":
      return "login_erreurs";
    case "Agences":
      return "agences";
    case "rôles":
      return "roles";
    case "utilisateurs":
      return "users";
    default:
      return str;
  }
};

/**
 * Extracts IPv4 address from an IPv6 address
 * Handles IPv6-mapped IPv4 addresses (::ffff:x.x.x.x)
 * 
 * @function ipv6ToIpv4
 * @param {string} ipv6 - IPv6 address
 * @returns {string} IPv4 address if found, otherwise returns original input
 * 
 * @example
 * ipv6ToIpv4("::ffff:192.168.1.1"); // Returns: "192.168.1.1"
 * ipv6ToIpv4("192.168.1.1");        // Returns: "192.168.1.1"
 */
export function ipv6ToIpv4(ipv6) {
  if (ipv6?.includes("::ffff:")) {
    const ipv4Part = ipv6.split("::ffff:")[1];
    return ipv4Part;
  } else {
    return ipv6;
  }
}

/**
 * Processes text content for proper paragraph formatting
 * Wraps text blocks in <p> tags and converts newlines to <br/> tags
 * 
 * @function TraitText
 * @param {string} input - Text input to process
 * @returns {string} HTML formatted text with proper paragraph tags
 * 
 * @example
 * TraitText("Line 1\nLine 2");
 * // Returns: "<p>Line 1<br/>Line 2</p>"
 */
export function TraitText(input) {
  const containsParagraph = /<p>.*<\/p>/s.test(input);
  if (containsParagraph) {
    return input.replace(/\n/g, "<br/>");
  } else {
    const blocks = input?.split?.("\n");
    const wrappedBlocks = blocks
      ?.filter((block) => block?.trim() !== "")
      .map((block) => `<p>${block?.replace(/\n/g, "<br/>")}</p>`);
    return wrappedBlocks?.join("\n");
  }
}

/**
 * Converts HTML formatted text back to plain text
 * Removes <p> tags and converts <br> tags to newlines
 * 
 * @function TransformText
 * @param {string} input - HTML formatted text
 * @returns {string} Plain text with newlines
 * 
 * @example
 * TransformText("<p>Line 1<br/>Line 2</p>");
 * // Returns: "Line 1\nLine 2"
 */
export function TransformText(input) {
  if (!input) return "";

  // Replace all <br> tags (with or without /) with \n
  let transformed = input.replace(/<br\s*\/?>/gi, "\n");

  // Remove all <p> and </p> tags
  transformed = transformed.replace(/<\/?p>/gi, "");

  // Remove unnecessary spaces around transformed text
  return transformed.trim();
}

/**
 * Sorts an array of objects by date in ascending order
 * 
 * @function sortByDateAscending
 * @param {Array<Object>} array - Array of objects with date properties
 * @param {string} dateKey - Property name containing the date
 * @returns {Array<Object>} Sorted array (oldest to newest)
 * 
 * @example
 * const items = [{date: "2024-02-01"}, {date: "2024-01-01"}];
 * sortByDateAscending(items, "date");
 * // Returns items sorted from oldest to newest
 */
export function sortByDateAscending(array, dateKey) {
  return array?.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));
}

/**
 * Calculates time duration from a given date until now
 * Returns formatted string with hours and minutes
 * 
 * @function getDurationFromNow
 * @param {string} inputDate - ISO date string
 * @param {Object} lang - Language object containing translations
 * @param {string} lang.heure - Translation for "hour(s)"
 * @param {string} lang.minute - Translation for "minute(s)"
 * @returns {string} Formatted duration string
 * 
 * @example
 * getDurationFromNow("2024-01-15T10:00:00Z", {heure: "hour(s)", minute: "minute(s)"});
 * // Returns: "2 hour(s), 30 minute(s)" (if 2.5 hours have passed)
 */
export function getDurationFromNow(inputDate, lang) {
  const now = new Date();
  const date = new Date(inputDate);

  // Check if date is valid
  if (isNaN(date)) {
    return "Date invalide";
  }

  const diffMilliseconds = now - date;

  // Calculate durations
  const minutes = Math.floor(diffMilliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(diffMilliseconds / (1000 * 60 * 60)) % 24;
  // Return formatted duration
  return hours
    ? `${hours} ${lang?.heure}, ${minutes} ${lang?.minute}`
    : ` ${minutes} ${lang?.minute}`;
}

/**
 * Checks if a string contains two words separated by underscore, space, or hyphen
 * and transforms it to UPPERCASE with underscores
 * 
 * @function hasTwoWordsSeparatedAndTransform
 * @param {string} str - String to check and transform
 * @returns {string|null} Transformed string or null if pattern doesn't match
 * 
 * @example
 * hasTwoWordsSeparatedAndTransform("user-profile"); // Returns: "USER_PROFILE"
 * hasTwoWordsSeparatedAndTransform("user profile"); // Returns: "USER_PROFILE"
 * hasTwoWordsSeparatedAndTransform("user");         // Returns: null
 */
export function hasTwoWordsSeparatedAndTransform(str) {
  const regex = /^(\w+)[_\s-](\w+)$/;

  if (regex.test(str)) {
    // Replace spaces with underscores and convert to uppercase
    return str
      .replace(/[\s-]/g, "_") // Replace spaces or hyphens with underscores
      .split("_") // Split string into words
      .map((word) => word.toUpperCase()) // Convert each word to uppercase
      .join("_"); // Join words with underscores
  }

  return null;
}

/**
 * Detects potential SQL injection attempts in user input
 * Checks for common SQL keywords, patterns, and malicious constructs
 * 
 * @function detectSQLInjection
 * @param {string} input - User input to validate
 * @returns {boolean} True if injection detected, false otherwise
 * 
 * @security This function helps prevent SQL injection attacks by detecting:
 * - SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP, UNION, etc.)
 * - Malicious comparison patterns (OR/AND statements)
 * - SQL comments (-- and /* */)
 * - Table manipulation attempts
 * 
 * @example
 * detectSQLInjection("SELECT * FROM users"); // Returns: true
 * detectSQLInjection("' OR '1'='1");         // Returns: true
 * detectSQLInjection("normal text");         // Returns: false
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== "string" || !input.trim()) return false; // Also check if string is empty

  // SQL injection detection patterns
  const sqlInjectionPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|LIMIT)\b.*\b(FROM|TABLE|DATABASE|INTO|VALUES|SET)\b/i, // Suspicious SQL query
    /('|")\s*(OR|AND)\s*('|")?\s*=\s*('|")/i, // Suspicious comparison with OR/AND
    /;\s*(DROP|TRUNCATE|ALTER)\s+\w+/i, // Table deletion or modification
    /--[^\n]*$/m, // SQL comment to hide rest of query
    /\/\*[\s\S]*?\*\//m, // Injection attempt via multi-line comment
  ];

  return sqlInjectionPatterns.some((pattern) => pattern.test(input));
};

/**
 * Blocks a user account and logs them out
 * Called when suspicious activity is detected (SQL injection, XSS, etc.)
 * 
 * @async
 * @function BloquerUser
 * @param {string} code - Block code/reason for the block
 * @param {string} [api] - Optional API endpoint override
 * @returns {Promise<void>}
 * 
 * @example
 * BloquerUser("SQL_INJECTION_DETECTED");
 * BloquerUser("XSS_ATTEMPT", "users/block-custom");
 */
export const BloquerUser = async (code, api) => {
  try {
    if (!api) {
      await axios.put(
        import.meta.env.VITE_BASE_URL + "users/block",
        { blockCode: code },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_ID,
          },
        }
      );
    } else {
      await axios.put(
        import.meta.env.VITE_BASE_URL + "users/" + api,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_ID,
          },
        }
      );
    }

    toast.error(
      "Votre compte est bloqué suite à une violation des conditions d'utilisation.",
      {
        icon: mdiAlertCircleOutline,
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  } catch (error) {
    toast.error(error.message, {
      icon: mdiAlertCircleOutline,
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }
};

/**
 * Transforms a hyphenated string with language codes to readable format
 * Converts language codes: ar -> Arabe, fr -> Français
 * Capitalizes first word completely, others with first letter only
 * 
 * @function transformString
 * @param {string} input - String to transform
 * @returns {string} Transformed string
 * 
 * @example
 * transformString("agence-ar"); // Returns: "AGENCE Arabe"
 * transformString("news-fr");   // Returns: "NEWS Français"
 */
export function transformString(input) {
  let result = input.replace(/-/g, " ");

  // Specific replacements with matches for separate words
  result = result
    .replace(/\bar\b/g, "Arabe") // Matches exactly "ar"
    .replace(/\bfr\b/g, "Français") // Matches exactly "fr"
    .replace(/\bl\b/g, "Français") // Matches exactly "l"
    .replace(/gle/g, "Globale"); // Matches occurrences of "gle"

  // Capitalize first letter of each word
  result = result
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        return word.toUpperCase(); // First word completely uppercase
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Initial capital for other words
    })
    .join(" ");

  return result;
}

/**
 * Validates and cleans a string by removing HTML tags
 * Checks for presence of special characters
 * 
 * @function validateAndCleanString
 * @param {string} input - String to validate and clean
 * @returns {Object} Result object
 * @returns {boolean} Object.isValid - True if string doesn't contain special chars
 * @returns {string} Object.cleanedString - String with HTML tags removed
 * 
 * @example
 * validateAndCleanString("<p>Hello</p>");
 * // Returns: {isValid: true, cleanedString: "Hello"}
 * 
 * validateAndCleanString("test/file.txt");
 * // Returns: {isValid: false, cleanedString: "testfile.txt"}
 */
export function validateAndCleanString(input) {
  // Remove HTML tags
  const cleanedString = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Define regex for special characters
  const specialCharsRegex = /[./_\-]/;

  // Check if cleaned string contains special characters
  const isValid = !specialCharsRegex.test(cleanedString);

  return { isValid, cleanedString };
}

/**
 * Retrieves and decrypts a value from localStorage
 * Uses AES encryption with a secret key
 * 
 * @function useDecryptedLocalStorage
 * @param {string} key - localStorage key
 * @param {string} secretKey - Decryption key
 * @returns {string|null} Decrypted value or null if key doesn't exist
 * 
 * @security Uses AES encryption for storing sensitive data in localStorage
 * 
 * @example
 * const username = useDecryptedLocalStorage("username_app", "secret123");
 */
export const useDecryptedLocalStorage = (key, secretKey) => {
  var value = null;
  const encryptedValue = localStorage.getItem(key);
  if (encryptedValue) {
    const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, secretKey);

    value = decryptedValue.toString(CryptoJS.enc.Utf8);
  }
  return value;
};

/**
 * Decrypts a URL-encoded encrypted value
 * Used for passing encrypted data in URLs
 * 
 * @function useDecryptedUrl
 * @param {string} key - Encrypted URL parameter value
 * @param {string} secretKey - Decryption key
 * @returns {Object} Decrypted object or empty object if key is falsy
 * 
 * @security Uses AES encryption for passing sensitive data in URLs
 * 
 * @example
 * const data = useDecryptedUrl(encryptedParam, "secret123");
 */
export const useDecryptedUrl = (key, secretKey) => {
  var value = {};

  if (key) {
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(key), secretKey);
    value = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }

  return value;
};
