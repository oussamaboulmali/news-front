import { useState } from "react";
import axios from "axios";
import { TreatError } from "../helpers/Gfunc";

const useAxios = ({ url, method, body }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  const clearData = () => {
    setResponse(null);
    setLoading(false);
    setError("");
  };

  return { response, loading, error, fetchData, clearData };
};

export { useAxios };
