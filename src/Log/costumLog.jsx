import log from "loglevel";
import axios from "axios";
import * as Gfunc from "../helpers/Gfunc";

// Configuration de loglevel pour émettre des journaux au format JSON et l'envoyer vers api
log.methodFactory = (methodName) => {
  return (message, folder, action, code, api) => {
    const logObject = {
      level: methodName,
      message: message,
      folder: folder,
      action: action,
    };
    axios
      .post(
        (import.meta.env.VITE_APP_STATUS === "prod"
          ? "/api/v1/"
          : import.meta.env.VITE_BASE_URL) + "logs/front",
        logObject,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_APP_ID,
          },
        }
      )
      .then((response) => {
        if (code === 220) {
          Gfunc.BloquerUser(code, api);
        }
      })
      .catch((error) => {
        //console.error("Erreur lors de l'envoi des logs à l'API:", error);
      });
  };
};

log.enableAll();

export default log;
