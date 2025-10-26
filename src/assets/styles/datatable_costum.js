import theme from "./theme";

const customStyles = {
  table: {
    style: {
      //border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "10px",
      width: "100%",
      height: "100%",
      margin: "0 auto",
      overflow: "auto !important",
      backgroundColor: theme.palette.white.primary,
    },
  },
  rows: {
    style: {
      minHeight: "50px", // Hauteur minimale des lignes
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.secondary.main, // Couleur de fond alternée
      },
      "&:nth-of-type(even)": {
        backgroundColor: theme.palette.white.main,
      },
    },
    highlightOnHoverStyle: {
      color: theme.palette.white.main,
      backgroundColor: theme.palette.secondary.light,
      fontWeight: "bold",
      transition: "background-color 0.3s ease",
      cursor: "pointer",
    },
  },
  headCells: {
    style: {
      fontSize: "17px",
      fontWeight: "600",
      textAlign: "center !important",
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.white.main,
      padding: "10px",
    },
  },
  headRow: {
    style: {
      backgroundColor: theme.palette.secondary.light,
    },
  },
  cells: {
    style: {
      textAlign: "start",
      fontSize: "14px",
      color: theme.palette.primary.main,
      padding: "10px",
      wordBreak: "break-word",
    },
  },
  pagination: {
    style: {
      color: theme.palette.primary.main,
      fontSize: "14px",
      height: "50px",
      width: "100%",
      margin: "0 auto",
      //backgroundColor: theme.palette.white.main,
      borderTop: `1px solid ${theme.palette.secondary.main}`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    pageButtonsStyle: {
      borderRadius: "50%",
      height: "40px",
      width: "40px",
      padding: "5px",
      margin: "0 5px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      color: theme.palette.primary.main,
      "&:disabled": {
        cursor: "not-allowed",
        color: theme.palette.error.main,
        //backgroundColor: theme.palette.secondary.main,
      },
    },
  },
};

export { customStyles };
