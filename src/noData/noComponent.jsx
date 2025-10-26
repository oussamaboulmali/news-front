import React, { useContext } from "react";
import { Box, Typography, Button } from "@mui/material";
import { mdiEmoticonSadOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useNavigate } from "react-router-dom";
import { ContextProvider } from "../Context/contextProvider";

const Error404 = () => {
  const navigate = useNavigate();
  const { lang, updateRoutes } = useContext(ContextProvider);

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        bgcolor: "background.default",
        color: "text.primary",
        px: 2,
      }}
    >
      <Icon path={mdiEmoticonSadOutline} size={8} color="gray" />
      <Typography
        variant="h1"
        sx={{ fontSize: { xs: "3rem", md: "6rem" }, mt: 2 }}
      >
        404
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {lang?.noRoute || "Aucune routes"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          updateRoutes(), navigate("/");
        }}
        sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 2 }}
      >
        {lang?.back_home || "Retour à l'acceuil "}
      </Button>
    </Box>
  );
};

export default Error404;
