import styled from "@emotion/styled";
import { Card } from "@mui/material";

// Personnalisation de la carte
export const StyledCard = styled(Card)(({ bgColor, display }) => ({
  backgroundColor: bgColor?.light || "#c8e6c9", // Couleur de fond verte pâle
  borderRadius: "8px", // Coins arrondis
  display: display || "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  minWidth: "240px", // Largeur de la carte
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Ombre légère
  //color: bgColor?.dark || "gray",
}));
