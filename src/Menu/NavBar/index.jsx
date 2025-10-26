import Logo from "../../assets/images/Logos/Logo-news-bgw.png";
import "../../assets/styles/navbar.css";
import PropTypes from "prop-types";
import Icon from "@mdi/react";
import {
  mdiAlertCircleOutline,
  mdiLogout,
  mdiMenuClose,
  mdiMenuOpen,
} from "@mdi/js";
import { Button } from "@mui/material";
import { ContextProvider } from "../../Context/contextProvider";
import { useContext, useEffect } from "react";
import { useAxios } from "../../services/useAxios";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as Gfunc from "../../helpers/Gfunc";
import * as icons from "@mdi/js";
import { useMediaQuery } from "react-responsive";

const NavBar = ({ toggleSidebar, isSidebarOpen, isMobileView }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const splitPath = location?.pathname.split("/")?.slice(1);
  const { baseUrl, handleDisconnect, lang, prefixe, secretKey } =
    useContext(ContextProvider);

  const ligne =
    (location?.state?.ligne && JSON.parse(location?.state?.ligne)) ||
    Gfunc.useDecryptedUrl(searchParams.get("n"), secretKey)?.ligne;
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  //useAxios pour recuperer la liste de menu des utilisateurs
  const { response, loading, error, fetchData, clearData } = useAxios({
    method: "post",
    url: baseUrl + "auth/logout",
    body: {
      username:
        Gfunc.useDecryptedLocalStorage("username" + prefixe, secretKey) || "",
    },
  });

  //track l'affichage de home page
  useEffect(() => {
    if (response && response?.data?.success) {
      localStorage.clear();
      handleDisconnect();
    }
  }, [response]);

  //track l'affichage de home page
  useEffect(() => {
    if (error) {
      toast.error(error, {
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
  }, [error]);

  const handleLogOut = () => {
    localStorage.clear();
    fetchData();
  };

  const handleNavigate = (str) => {
    navigate(`/${str}`);
  };

  const BackHome = () => {
    navigate("/");
  };

  // Le conteneur principal de la barre de navigation adapté selon le mode
  const navbarContainerClass = isMobile
    ? "navbar-mobile"
    : isSidebarOpen
    ? "navbar"
    : "navbarSmall";

  return (
    <>
      {/* Navbar principale */}
      <div className={navbarContainerClass}>
        <div
          style={{
            display: "flex",
            gridGap: "20px",
            alignItems: "center",
            marginLeft: !isMobile ? "10px" : "5px",
            cursor: "pointer",
          }}
        >
          <Icon
            path={isSidebarOpen ? mdiMenuClose : mdiMenuOpen}
            size={1.8}
            style={{ color: "#55b4e5" }}
            onClick={toggleSidebar}
            className="menu-toggle-icon"
          />

          <div onClick={BackHome}>
            <img
              src={Logo}
              alt="logo Aps"
              style={{ width: !isMobile ? "220px" : "200px" }}
            />
          </div>
        </div>
        <div className="disconnct">
          <Button onClick={handleLogOut}>
            <Icon path={mdiLogout} size={1.2} title="Déconnexion" />
            {!isMobile && <p>{lang?.logout}</p>}
          </Button>
        </div>
      </div>

      {/* UnderNavbar adapté selon la vue */}
      {!isMobile && (
        <div className={isSidebarOpen ? "underNavBar" : "underNavBarSmall"}>
          <div
            style={{
              display: "flex",
              gridGap: "5px",
              alignItems: "center",
              marginRight: "25px",
              cursor: "pointer",
            }}
            className={splitPath.length > 1 ? "locationLink" : ""}
            onClick={() => handleNavigate(splitPath[0])}
          >
            <Icon
              path={icons[Gfunc.getIcon(splitPath[0].toLocaleLowerCase())]}
              size={1}
            />
            <p>{lang?.[Gfunc.formatString(splitPath[0])]}</p>
          </div>
          {splitPath.length > 1 &&
            splitPath[0].toLocaleLowerCase() !== "agences" &&
            splitPath.map((el, index) => {
              if (index) {
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gridGap: "10px",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ marginRight: "15px" }}>/</span>
                    <Icon path={icons[Gfunc.getIcon(el)]} size={0.9} />

                    <p>
                      {el === "erreurs_connexion"
                        ? lang[el]
                        : lang[Gfunc.formatAndCapitalize(el)]}
                    </p>
                  </div>
                );
              }
            })}
          {splitPath?.length > 1 &&
            splitPath[0].toLocaleLowerCase() === "agences" && (
              <div
                style={{
                  display: "flex",
                  gridGap: "10px",
                  alignItems: "center",
                  cursor: splitPath.length > 2 && "pointer",
                }}
                className={splitPath.length > 2 ? "locationLink" : ""}
                onClick={() =>
                  splitPath.length > 2 &&
                  handleNavigate(splitPath?.[0] + "/" + splitPath?.[1])
                }
              >
                <span style={{ marginRight: "15px" }}>/</span>

                <Icon path={icons[Gfunc.getIcon("agences")]} size={1} />
                <p>
                  {(Gfunc.useDecryptedLocalStorage(
                    "langId" + prefixe,
                    secretKey
                  ) === "1"
                    ? ligne?.name_ar
                    : ligne?.name) || Gfunc?.transformString(splitPath[1])}
                </p>
                {splitPath[2] && (
                  <div
                    title={ligne?.title}
                    style={{
                      display: "flex",
                      gridGap: "10px",
                      alignItems: "center",
                      cursor: "none",
                    }}
                  >
                    <span style={{ marginRight: "15px" }}>/</span>
                    <Icon path={icons.mdiListBox} size={1} />
                    <p>
                      {ligne?.title?.length > 50
                        ? ligne?.title?.substring(0, 50) + "..."
                        : ligne?.title}
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </>
  );
};

// Validation des props avec PropTypes
NavBar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isMobileView: PropTypes.bool,
};

export default NavBar;
