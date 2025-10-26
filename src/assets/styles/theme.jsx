import { createTheme } from "@mui/material";
import * as Gfunc from "../../helpers/Gfunc";

const getDirection = () => {
  //const langId = localStorage.getItem("langId" + import.meta.env.VITE_PREF);
  const langId = Gfunc.useDecryptedLocalStorage(
    "langId" + import.meta.env.VITE_PREF,
    import.meta.env.VITE_KEY
  );
  return langId === "1" ? "rtl" : "ltr";
};

const theme = createTheme({
  direction: getDirection(),
  palette: {
    primary: { light: "#4f6781", main: "#263949", dark: "#1b2a38" },
    secondary: { light: "#f5f5f5", main: "#eee9e9", dark: "#d6cfcf" },
    white: { main: "#fff" },
    error: { main: "#e53935" },
    success: { main: "#388e3c" },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          color: "#263949",
          fontSize: "15px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 20px",
          fontWeight: "bold",
          margin: "5px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "20px 24px",
        },
      },
    },
  },
});
export default theme;
