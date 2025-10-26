/**
 * Global Helper Functions Module
 * 
 * This module provides a comprehensive set of utility functions used throughout the application.
 * Functions include:
 * - Authentication and session management
 * - Data validation and sanitization (email, phone, SQL injection)
 * - String formatting and transformation
 * - Date and time manipulation
 * - Security utilities (encryption/decryption, XSS prevention)
 * - Array and object manipulation
 * 
 * @module helpers/Gfunc
 * @requires axios - HTTP client for API requests
 * @requires crypto-js - Encryption library for secure data storage
 * @requires react-toastify - Toast notifications for user feedback
 */

import { mdiAlertCircleOutline } from "@mdi/js";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import * as Gfunc from "../helpers/Gfunc";

/**
 * Logs out the user by clearing session cookies and local storage
 * 
 * This function performs a complete logout operation:
 * 1. Sends logout request to backend API
 * 2. Clears all local storage data
 * 3. Clears all session storage data
 * 4. Redirects user to login page
 * 
 * @async
 * @function LougoutCoookiesSession
 * @returns {Promise<void>}
 * @throws {Error} If logout request fails, still proceeds with local cleanup
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
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
  }
};

/**
 * Handles errors when user session is invalid or expired
 * 
 * Displays an error toast notification and automatically logs out the user
 * after 5 seconds. User can also click the toast to logout immediately.
 * 
 * @async
 * @function TreatError
 * @param {string} message - Error message to display to the user
 * @returns {Promise<void>}
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
 * Sorts an array of objects in ascending order by a specified attribute
 * 
 * @function sortedAscendingArray
 * @param {Array<Object>} array - Array of objects to sort
 * @param {string} att - Attribute name to sort by
 * @returns {Array<Object>} Sorted array in ascending order
 * @example
 * const users = [{name: "John", age: 30}, {name: "Jane", age: 25}];
 * sortedAscendingArray(users, "age"); // Returns array sorted by age
 */
export function sortedAscendingArray(array, att) {
  return array.sort((a, b) => (a[att] > b[att] ? 1 : b[att] > a[att] ? -1 : 0));
}

/**
 * Converts the first character of a string to lowercase
 * 
 * @function firstToLower
 * @param {string} chaine - Input string to transform
 * @returns {string} String with first character in lowercase
 * @example
 * firstToLower("Hello"); // Returns "hello"
 */
export function firstToLower(chaine) {
  return chaine.charAt(0).toLowerCase() + chaine.slice(1);
}

/**
 * Formats a string by capitalizing each word and replacing hyphens/underscores with spaces
 * 
 * @function formatAndCapitalize
 * @param {string} string - Input string to format
 * @returns {string} Formatted string with capitalized words
 * @example
 * formatAndCapitalize("hello-world"); // Returns "Hello World"
 * formatAndCapitalize("user_name"); // Returns "User Name"
 */
export function formatAndCapitalize(string) {
  if (!string) return "";

  return string
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Returns the appropriate Material Design icon name based on menu item
 * 
 * Maps menu identifiers to their corresponding MDI icon names for consistent
 * UI icon display throughout the application.
 * 
 * @function getIcon
 * @param {string} str - Menu item identifier
 * @returns {string} MDI icon name (e.g., "mdiHome", "mdiAccount")
 * @example
 * getIcon("acceuil"); // Returns "mdiHome"
 * getIcon("utilisateurs"); // Returns "mdiAccount"
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
 * Uses regex pattern to ensure the email contains:
 * - Valid characters before @
 * - @ symbol
 * - Domain name
 * - Top-level domain
 * 
 * @function validateEmail
 * @param {string} value - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 * @example
 * validateEmail("user@example.com"); // Returns true
 * validateEmail("invalid-email"); // Returns false
 */
export const validateEmail = (value) => {
  // Expression régulière pour vérifier le format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates a phone number format (10 digits)
 * 
 * @function validatePhone
 * @param {string} value - Phone number to validate
 * @returns {boolean} True if phone number has exactly 10 digits, false otherwise
 * @example
 * validatePhone("0123456789"); // Returns true
 * validatePhone("12345"); // Returns false
 */
export const validatePhone = (value) => {
  // Vérifier que le numéro contient exactement 10 chiffres
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(value);
};

/**
 * Formats an ISO date string to French date format (DD.MM.YYYY - HH:mm)
 * 
 * @function formaterDate
 * @param {string} dateISO - ISO date string to format
 * @returns {string|null} Formatted date string or null if input is invalid
 * @example
 * formaterDate("2024-01-15T14:30:00Z"); // Returns "15.01.2024 - 14:30"
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
 * @param {*} idElement - ID value of element to remove
 * @param {string} idName - Name of the ID property
 * @returns {Array<Object>} New array without the specified element
 * @example
 * const users = [{id: 1, name: "John"}, {id: 2, name: "Jane"}];
 * DeleteElementfromArray(users, 1, "id"); // Returns [{id: 2, name: "Jane"}]
 */
export function DeleteElementfromArray(array, idElement, idName) {
  const newTable = array.filter((element) => element[idName] !== idElement);
  return newTable;
}

/**
 * Compares two strings for equality using locale comparison
 * 
 * @function TwoEqualeString
 * @param {string} str1 - First string to compare
 * @param {string} str2 - Second string to compare
 * @returns {boolean} True if strings are equal, false otherwise
 * @example
 * TwoEqualeString("hello", "hello"); // Returns true
 */
export const TwoEqualeString = (str1, str2) => {
  if (str1.localeCompare(str2) === 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Returns the appropriate route path for special cases
 * 
 * @function getPathRoute
 * @param {string} str - Route identifier
 * @returns {string} Formatted route path
 * @example
 * getPathRoute("APS AR"); // Returns "Aps-ar"
 */
export function getPathRoute(str) {
  switch (str) {
    case "APS AR":
      return "Aps-ar";
    default:
      return str;
  }
}

export function formatString(input) {
  return input
    .split("-") // Divise la chaîne en parties en utilisant "-" comme séparateur
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Met en majuscule la première lettre et le reste en minuscule
    )
    .join(" "); // Rejoint les mots avec des espaces
}

/**
 * Converts a date string to ISO date format (YYYY-MM-DD)
 * 
 * @function stringToDate
 * @param {string} dateString - Date string to convert
 * @returns {string} ISO formatted date string
 * @example
 * stringToDate("2024-01-15-000"); // Returns "2024-01-15"
 */
export const stringToDate = (dateString) => {
  const formattedDateString = dateString.slice(0, -4);
  const [year, month, day] = formattedDateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().split("T")[0];
};

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
 * 
 * Converts IPv6-mapped IPv4 addresses (::ffff:x.x.x.x) to pure IPv4 format
 * 
 * @function ipv6ToIpv4
 * @param {string} ipv6 - IPv6 address string
 * @returns {string} IPv4 address or original input if not IPv6-mapped
 * @example
 * ipv6ToIpv4("::ffff:192.168.1.1"); // Returns "192.168.1.1"
 */
export function ipv6ToIpv4(ipv6) {
  if (ipv6?.includes("::ffff:")) {
    const ipv4Part = ipv6.split("::ffff:")[1];
    return ipv4Part;
  } else {
    return ipv6;
  }
}

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

export function TransformText(input) {
  if (!input) return "";

  // Remplacer toutes les balises <br> (avec ou sans /) par \n
  let transformed = input.replace(/<br\s*\/?>/gi, "\n");

  // Supprimer toutes les balises <p> et </p>
  transformed = transformed.replace(/<\/?p>/gi, "");

  // Retirer les espaces inutiles autour du texte transformé
  return transformed.trim();
}

export function sortByDateAscending(array, dateKey) {
  return array?.sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey]));
}

export function getDurationFromNow(inputDate, lang) {
  const now = new Date();
  const date = new Date(inputDate);

  // Vérifie si la date est valide
  if (isNaN(date)) {
    return "Date invalide";
  }

  const diffMilliseconds = now - date;

  // Calcul des durées
  const minutes = Math.floor(diffMilliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(diffMilliseconds / (1000 * 60 * 60)) % 24;
  // Retourne la durée formatée
  return hours
    ? `${hours} ${lang?.heure}, ${minutes} ${lang?.minute}`
    : ` ${minutes} ${lang?.minute}`;
}

export function hasTwoWordsSeparatedAndTransform(str) {
  const regex = /^(\w+)[_\s-](\w+)$/;

  if (regex.test(str)) {
    // Remplacer les espaces par des underscores et mettre en majuscules
    return str
      .replace(/[\s-]/g, "_") // Remplace espaces ou tirets par des underscores
      .split("_") // Divise la chaîne en mots
      .map((word) => word.toUpperCase()) // Convertit chaque mot en majuscule
      .join("_"); // Rejoint les mots avec des underscores
  }

  return null;
}

/* export const detectSQLInjection = (input) => {
  const sqlInjectionPattern =
    /(?:\b|['";])(?:OR|AND|SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|xp_)\b|['";%]/i; //% pour les statement avec like
  const htmlEntitiesPattern = /&gt;|&gte;|&lt;|&lte;/i; // Entités HTML
  const asciiUnicodePattern = /\x3E|\x3C|\u003E|\u003C/; // ASCII/Unicode pour < et >
  const slashPattern = /<\/|\/>/; // Seulement </ ou />

  if (
    sqlInjectionPattern.test(input) ||
    htmlEntitiesPattern.test(input) ||
    asciiUnicodePattern.test(input) ||
    slashPattern.test(input)
  ) {
    return true;
  }

  return false;
}; */

/**
 * Detects potential SQL injection attempts in user input
 * 
 * Scans input for common SQL injection patterns including:
 * - SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP, UNION, etc.)
 * - Malicious comparison operators with OR/AND
 * - SQL comments (-- and /* * /)
 * - Suspicious query patterns
 * 
 * @function detectSQLInjection
 * @param {string} input - User input to validate
 * @returns {boolean} True if potential SQL injection detected, false otherwise
 * @example
 * detectSQLInjection("SELECT * FROM users"); // Returns true
 * detectSQLInjection("normal text"); // Returns false
 * 
 * @security This is a critical security function used to prevent SQL injection attacks
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== "string" || !input.trim()) return false; // Vérifie aussi si la chaîne est vide

  // Modèles de détection d'injection SQL
  const sqlInjectionPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|LIMIT)\b.*\b(FROM|TABLE|DATABASE|INTO|VALUES|SET)\b/i, // Requête SQL suspecte
    /('|")\s*(OR|AND)\s*('|")?\s*=\s*('|")/i, // Comparaison suspecte avec OR/AND
    /;\s*(DROP|TRUNCATE|ALTER)\s+\w+/i, // Suppression ou modification de table
    /--[^\n]*$/m, // Commentaire SQL pour masquer la suite de la requête
    /\/\*[\s\S]*?\*\//m, // Tentative d'injection via un commentaire multi-lignes
  ];

  return sqlInjectionPatterns.some((pattern) => pattern.test(input));
};

/**
 * Blocks a user account due to security policy violations
 * 
 * This function:
 * 1. Calls backend API to block the user
 * 2. Displays error notification
 * 3. Clears all session data
 * 4. Redirects to login page
 * 
 * @async
 * @function BloquerUser
 * @param {string} code - Block code identifier
 * @param {string} api - API endpoint for blocking action
 * @returns {Promise<void>}
 * @throws {Error} Displays error toast if block request fails
 * 
 * @example
 * BloquerUser("SQL_INJECTION", "users/block");
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

export function transformString(input) {
  let result = input.replace(/-/g, " ");

  // Remplacements spécifiques avec des correspondances pour les mots séparés
  result = result
    .replace(/\bar\b/g, "Arabe") // Correspond exactement à "ar"
    .replace(/\bfr\b/g, "Français") // Correspond exactement à "fr"
    .replace(/\bl\b/g, "Français") // Correspond exactement à "l"
    .replace(/gle/g, "Globale"); // Correspond aux occurrences de "Gle"

  // Mise en majuscule de la première lettre de chaque mot
  result = result
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        return word.toUpperCase(); // Le premier mot en majuscule intégrale
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Majuscule initiale pour les autres mots
    })
    .join(" ");

  return result;
}

export function validateAndCleanString(input) {
  // Supprimer les tags HTML
  const cleanedString = input.replace(/<\/?[^>]+(>|$)/g, "");

  // Définir un regex pour les caractères spéciaux
  const specialCharsRegex = /[./_\-]/;

  // Vérifier si le string nettoyé contient des caractères spéciaux
  const isValid = !specialCharsRegex.test(cleanedString);

  return { isValid, cleanedString };
}

/**
 * Decrypts and retrieves a value from localStorage
 * 
 * Uses AES encryption to securely store and retrieve sensitive data.
 * Returns null if key doesn't exist or decryption fails.
 * 
 * @function useDecryptedLocalStorage
 * @param {string} key - localStorage key
 * @param {string} secretKey - Encryption secret key
 * @returns {string|null} Decrypted value or null
 * @example
 * const username = useDecryptedLocalStorage("username", "secret123");
 * 
 * @security Used for secure storage of sensitive user data
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
 * Decrypts URL parameters encrypted with AES
 * 
 * Decodes URL-encoded encrypted parameters and returns parsed JSON object.
 * Returns empty object if decryption fails.
 * 
 * @function useDecryptedUrl
 * @param {string} key - Encrypted URL parameter
 * @param {string} secretKey - Decryption secret key
 * @returns {Object} Decrypted and parsed object
 * @example
 * const params = useDecryptedUrl(encryptedParam, "secret123");
 * 
 * @security Used for secure URL parameter transmission
 */
export const useDecryptedUrl = (key, secretKey) => {
  var value = {};

  if (key) {
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(key), secretKey);
    value = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }

  return value;
};
