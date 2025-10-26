import { Box, Typography } from "@mui/material";
import Icon from "@mdi/react";
import { mdiDatabaseRemove } from "@mdi/js";
import { useContext } from "react";
import { ContextProvider } from "../Context/contextProvider";
import { useMediaQuery } from "react-responsive";

const NoDataMessage = () => {
  const { lang } = useContext(ContextProvider);
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  return (
    <Box
      sx={{
        position: "relative",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: isMobile ? "200px" : "600px",
        padding: 4,
        borderRadius: 2,
        boxShadow: 0,
        bgcolor: "none",
        textAlign: "center",
        height: "300px", // Gardez ou ajustez selon vos besoins
      }}
    >
      <Icon path={mdiDatabaseRemove} size={3} color="#1b2a38" />
      <Typography variant="h6" color="textSecondary" sx={{ marginTop: 2 }}>
        {lang?.noStat}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
        {lang?.noStatSec}
      </Typography>
    </Box>
  );
};

export default NoDataMessage;
