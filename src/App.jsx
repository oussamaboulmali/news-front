/**
 * @fileoverview Main Application Component
 * 
 * This is the root component of the News Dashboard application.
 * It handles:
 * - Authentication and session management
 * - Dynamic route generation based on user permissions
 * - Multi-language support (Arabic RTL, French, English)
 * - Theme provider setup
 * - Global context provider
 * 
 * @module App
 * @requires react-router-dom
 * @requires @mui/material
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../src/Pages/Auth/index";
import Main from "./Pages";
import { useEffect, useState } from "react";
import { ContextProvider } from "./Context/contextProvider";
import { CircularProgress, ThemeProvider } from "@mui/material";
import theme from "./assets/styles/theme";
import { ToastContainer } from "react-toastify";
import { useAxios } from "./services/useAxios";
import * as Gfunc from "./helpers/Gfunc";
import "./App.css";
import AgencyContent from "./Pages/Agences/agencyContent";
import AgencyParent from "./Pages/Agences/agencyParent";
import AgencyList from "./Pages/Agences/agencyList";
import ItemContent from "./Pages/Agences/itemContent";
import HomeParent from "./Pages/Acceuil/indexParent";
import ConfigParent from "./Pages/Configuration/indexParent";
import UserParent from "./Pages/Utilisateurs/indexParent";
import Log_List from "./Pages/Logs/logs_list";
import Log_Item from "./Pages/Logs/log_item";
import Sessions from "./Pages/Logs/sessions";
import translations from "./Locales/translations";
import Error404 from "./noData/noComponent";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

/**
 * Cache configuration for RTL (Right-to-Left) language support
 * Used for Arabic language interface
 */
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

/**
 * Cache configuration for LTR (Left-to-Right) language support
 * Used for French and English interfaces
 */
const cacheLtr = createCache({
  key: "muiltr",
  stylisPlugins: [],
});

/**
 * Main Application Component
 * 
 * Manages the entire application lifecycle including:
 * - User authentication state
 * - Dynamic menu/route generation based on user permissions
 * - Language switching (AR/FR/EN) with RTL/LTR support
 * - API calls for user menu permissions
 * - Global context management
 * 
 * @component
 * @returns {JSX.Element} The main application with routing
 */
function App() {
  const baseUrl =
    import.meta.env.VITE_APP_STATUS === "prod"
      ? "/api/v1/"
      : import.meta.env.VITE_BASE_URL;
  const ImageUrl =
    import.meta.env.VITE_APP_STATUS === "prod"
      ? ""
      : import.meta.env.VITE_IMAGE_URL;
  const emptyData = import.meta.env.VITE_EMPTY_DATA;
  const prefixe = import.meta.env.VITE_PREF;
  const secretKey = import.meta.env.VITE_KEY;
  const [isLogged, setIsLogged] = useState(
    JSON.parse(Gfunc.useDecryptedLocalStorage("isLogged" + prefixe, secretKey))
  );
  const [routes, setRoutes] = useState([]);
  const [lang, setLang] = useState();

  //useAxios pour recuperer la liste de menu des utilisateurs
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "users/menu",
    body: {},
  });

  /**
   * Handles language switching and sets document direction (RTL/LTR)
   * Retrieves language preference from encrypted localStorage
   * 
   * Language codes:
   * - "1": Arabic (RTL)
   * - "2": French (LTR)
   * - "3": English (LTR)
   * 
   * @function handleChangeLanguage
   * @returns {void}
   */
  const handleChangeLanguage = () => {
    const lang = Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey);
    document.documentElement.setAttribute("dir", lang === "1" ? "rtl" : "ltr");
    setLang(
      lang === "1"
        ? translations["ar"]
        : lang === "2"
        ? translations["fr"]
        : translations["en"]
    );
  };

  /**
   * Effect hook to fetch user menu and initialize language on login
   * Runs when user logs in and menu data hasn't been loaded yet
   */
  useEffect(() => {
    if (isLogged && !response) {
      fetchData();
      handleChangeLanguage();
    }
  }, [isLogged, response]);

  /**
   * Callback to update login state after successful authentication
   * 
   * @function handleValidateLogin
   * @returns {void}
   */
  const handleValidateLogin = () => {
    setIsLogged(true);
  };

  /**
   * Handles user logout by clearing states and cached data
   * 
   * @function handleDisconnect
   * @returns {void}
   */
  const handleDisconnect = () => {
    setIsLogged(false);
    clearData();
  };

  /**
   * Effect hook to build dynamic routes based on user permissions
   * Processes the menu response from API and creates route configurations
   * Handles different menu item types (simple pages vs. agency-based pages)
   */
  useEffect(() => {
    const fetchRoutes = async () => {
      if (response && response?.data?.success) {
        const obj = response?.data?.data;
        const array = [];
        for (const key of Object.keys(obj)) {
          // Vérifie si obj[key] est une chaîne ou un objet
          if (typeof obj[key] === "string") {
            const compo = await DynamicComponent(obj[key]);
            const routeObject = {
              path: obj[key].replace(/ /g, "_"),
              compo: compo,
            };

            if (obj[key] === "Acceuil") {
              routeObject.agencies = [
                { alias: "", childCompo: <HomeParent />, index: true },
              ];
            }
            if (obj[key] === "Configuration") {
              routeObject.agencies = [
                { alias: "", childCompo: <ConfigParent />, index: true },
              ];
            }
            if (obj[key] === "Utilisateurs") {
              routeObject.agencies = [
                { alias: "", childCompo: <UserParent />, index: true },
              ];
            }
            // Si obj[key] est "Logs", ajoute un tableau de child
            if (obj[key] === "Logs") {
              routeObject.agencies = [
                { alias: "", childCompo: <Log_List />, index: true },
                {
                  alias: "agences",
                  childCompo: <Log_Item />,
                  index: false,
                },
                //{ alias: "roles", childCompo: <Log_Item />, index: false },
                { alias: "users", childCompo: <Log_Item />, index: false },
                {
                  alias: "blocage",
                  childCompo: <Log_Item />,
                  index: false,
                },
                {
                  alias: "erreurs_connexion",
                  childCompo: <Log_Item />,
                  index: false,
                },
                { alias: "sessions", childCompo: <Sessions />, index: false },
              ];
            }

            // Ajoute l'objet à l'array
            array.push(routeObject);
          } else if (typeof obj[key] === "object") {
            // Si c'est un objet

            const object = obj[key];
            const cle = Object.keys(obj[key])[0];
            const value = object[cle];
            const updatedValue = [
              ...value.map((child) => ({
                ...child,
                index: false,
                childCompo: <AgencyParent />,
                display: true,
                childElem: [
                  {
                    //name: "",
                    id_agency: null,
                    index: true,
                    alias: "",
                    childCompo: <AgencyContent />,
                  },
                  {
                    // name: "",
                    id_agency: null,
                    index: false,
                    alias: ":id",
                    childCompo: <ItemContent />,
                  },
                ],
              })),
              {
                //name: "",
                id_agency: null,
                index: true,
                alias: "",
                childCompo: <AgencyList />,
              },
            ];
            const compo = await DynamicComponent(cle);
            array.push({
              path: cle,
              agencies: updatedValue,
              compo: compo,
            });
          }
        }
        const SortedArray = Gfunc.sortedAscendingArray(array, "path");
        const modifiedData = SortedArray.map((item) => {
          return item;
        });
        setRoutes(modifiedData);
      }
    };
    fetchRoutes();
  }, [response]);

  /**
   * Dynamically imports and returns a page component based on key
   * Uses dynamic imports for code splitting
   * 
   * @async
   * @function DynamicComponent
   * @param {string} key - Page/component key (matches folder name in Pages directory)
   * @returns {Promise<JSX.Element|null>} React component or null if import fails
   * 
   * @example
   * const component = await DynamicComponent("Utilisateurs");
   */
  const DynamicComponent = async (key) => {
    try {
      const module = await import(`./Pages/${key}/index.jsx`);
      const AnotherComponent = module.default;
      return <AnotherComponent />;
    } catch (error) {
      return null;
    }
  };

  /**
   * Clears route cache to force menu reload
   * Used when user permissions change
   * 
   * @function updateRoutes
   * @returns {void}
   */
  const updateRoutes = () => {
    clearData();
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "80vh",
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <CacheProvider
      value={
        Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey) === "1"
          ? cacheRtl
          : cacheLtr
      }
    >
      <ThemeProvider theme={theme}>
        <ContextProvider.Provider
          value={{
            handleValidateLogin,
            handleDisconnect,
            baseUrl,
            emptyData,
            routes,
            ImageUrl,
            lang,
            prefixe,
            secretKey,
            updateRoutes,
          }}
        >
          <Router>
            <Routes>
              <Route
                path="/login"
                element={!isLogged ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/"
                element={isLogged ? <Main /> : <Navigate to="/login" />}
              >
                <Route index element={<Navigate to={routes[0]?.path} />} />
                {routes?.map((route, index) => {
                  return (
                    <Route
                      key={index}
                      path={Gfunc.firstToLower(route?.path)}
                      element={route?.compo}
                    >
                      {route?.agencies?.map((subroute, subindex) => {
                        return (
                          <Route
                            key={subindex}
                            index={subroute?.index}
                            path={subroute?.alias}
                            element={subroute?.childCompo}
                          >
                            {!subroute?.index &&
                              subroute?.childElem?.map(
                                (elChild, indexChild) => {
                                  return (
                                    <Route
                                      key={indexChild}
                                      index={elChild?.index}
                                      path={elChild?.alias}
                                      element={elChild?.childCompo}
                                    />
                                  );
                                }
                              )}
                          </Route>
                        );
                      })}
                    </Route>
                  );
                })}
              </Route>
              <Route path="*" element={<Error404 />} />
            </Routes>
          </Router>
          <ToastContainer />
        </ContextProvider.Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
