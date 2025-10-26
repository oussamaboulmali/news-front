import PropTypes from "prop-types";
import { useContext } from "react";
import { ContextProvider } from "../../Context/contextProvider";

const Footer = ({ isSidebarOpen }) => {
  const { lang } = useContext(ContextProvider);

  return (
    <div className={isSidebarOpen ? "footer" : "footerSmall"}>
      <p>{lang?.copyright}</p>
    </div>
  );
};

// Validation des props avec PropTypes
Footer.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Footer;
