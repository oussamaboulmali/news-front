import { mdiAlertCircleOutline } from "@mdi/js";
import axios from "axios";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import * as Gfunc from "../helpers/Gfunc";

//une fonction local pour la deconnexion .
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

//une fonction pour traiter si l'utilisateur n'a pas session
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

export function sortedAscendingArray(array, att) {
  return array.sort((a, b) => (a[att] > b[att] ? 1 : b[att] > a[att] ? -1 : 0));
}

//first lettre lowerCase
export function firstToLower(chaine) {
  return chaine.charAt(0).toLowerCase() + chaine.slice(1);
}

//first lettre upperCase and replace _ par space blank
export function formatAndCapitalize(string) {
  if (!string) return "";

  return string
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

//fonction qui return les nom des icons selons le menu item cliquer
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

export const validateEmail = (value) => {
  // Expression régulière pour vérifier le format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validatePhone = (value) => {
  // Vérifier que le numéro contient exactement 10 chiffres
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(value);
};

//formater la date en format francais
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

// Supprimer un élément d'un tableau d'objets en utilisant son ID
export function DeleteElementfromArray(array, idElement, idName) {
  const newTable = array.filter((element) => element[idName] !== idElement);
  return newTable;
}

//verifier si deux chaine de caractere sont equivalante
export const TwoEqualeString = (str1, str2) => {
  if (str1.localeCompare(str2) === 0) {
    return true;
  } else {
    return false;
  }
};

//fonction qui return les path
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

//transformer une date de chaine de caractere a yne formats date
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

//extraire la partie @ ipv4 d'une @ ipv6
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

export const useDecryptedLocalStorage = (key, secretKey) => {
  var value = null;
  const encryptedValue = localStorage.getItem(key);
  if (encryptedValue) {
    const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, secretKey);

    value = decryptedValue.toString(CryptoJS.enc.Utf8);
  }
  return value;
};

export const useDecryptedUrl = (key, secretKey) => {
  var value = {};

  if (key) {
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(key), secretKey);
    value = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }

  return value;
};
