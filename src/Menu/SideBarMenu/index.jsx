import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { ContextProvider } from "../../Context/contextProvider";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";
import * as Gfunc from "../../helpers/Gfunc";
import { NavLink } from "react-router-dom";
import "../../assets/styles/sidebar.css";
import UserDialog from "../../Pages/Utilisateurs/editUserInfo";

const SideBar = ({ isSidebarOpen, isMobile, setIsSidebarOpen }) => {
  const { routes, lang } = useContext(ContextProvider);
  const enhancedRoutes = routes;

  return (
    <div className={isSidebarOpen ? "sidebar" : "sidebarSmall"}>
      <UserDialog isSidebarOpen={isSidebarOpen} />
      <nav>
        <ul>
          {enhancedRoutes?.map((item, index) => {
            return (
              <li key={index} onClick={() => setIsSidebarOpen(false)}>
                <NavLink
                  to={Gfunc.firstToLower(item?.path)}
                  style={({ isActive }) => ({
                    fontWeight: isActive && "bold",
                    color: isActive && "white",
                    textAlign: isActive && "start",
                    fontSize: isActive && "17px",
                  })}
                >
                  <Icon
                    path={icons[Gfunc?.getIcon(Gfunc.firstToLower(item.path))]}
                    size={1.2}
                    title={item.path}
                  />
                  {isSidebarOpen && (
                    <p>{lang?.[item?.path?.replace(/ /g, "_")]}</p>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

// Validation des props avec PropTypes
SideBar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default SideBar;
