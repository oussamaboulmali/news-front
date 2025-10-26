import React, { useContext } from "react";
import { mdiDatabaseOffOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { ContextProvider } from "../Context/contextProvider";

const NoDataFound = () => {
  const { lang } = useContext(ContextProvider);

  return (
    <div style={styles.container}>
      <Icon path={mdiDatabaseOffOutline} size={5} color="gray" />
      <p style={styles.text}>{lang?.noData}</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "250px",
    borderRadius: "8px",
    marginTop: "20px",
  },
  text: {
    fontSize: "16px",
    color: "gray",
    marginTop: "10px",
  },
};

export default NoDataFound;
