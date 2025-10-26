/**
 * @fileoverview Pagination Component
 * 
 * A reusable pagination component that provides navigation between pages
 * with RTL/LTR support based on the selected language
 * 
 * @module UI/Pagination
 */

import React, { useContext } from "react";
import { Icon } from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { Box, IconButton, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { ContextProvider } from "../../Context/contextProvider";
import * as Gfunc from "../../helpers/Gfunc";

/**
 * Pagination component for navigating between pages
 * Supports RTL (Arabic) and LTR (French/English) layouts
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPrev - Callback function when previous button is clicked
 * @param {Function} props.onNext - Callback function when next button is clicked
 * 
 * @returns {JSX.Element} Pagination component
 * 
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPrev={() => setPage(page - 1)}
 *   onNext={() => setPage(page + 1)}
 * />
 */
const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  const { lang, prefixe, secretKey } = useContext(ContextProvider);
  const isRTL =
    Gfunc.useDecryptedLocalStorage("langId" + prefixe, secretKey) === "1";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        marginTop: 2,
        padding: 1,
        flexDirection: isRTL ? "row-reverse" : "row",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: "bold",
          color: currentPage === 1 ? "#bbb" : "#000",
        }}
      >
        {lang?.avant}
      </Typography>
      <IconButton
        onClick={onPrev}
        disabled={currentPage === 1}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          "&:hover": { backgroundColor: "#e0e0e0" },
          "&:disabled": { backgroundColor: "#dcdcdc" },
          gap: 1,
        }}
      >
        <Icon
          path={isRTL ? mdiChevronRight : mdiChevronLeft}
          size={1}
          color={currentPage === 1 ? "#bbb" : "#000"}
        />
      </IconButton>

      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
        {lang?.page} {currentPage} {lang?.sur} {totalPages}
      </Typography>

      <IconButton
        onClick={onNext}
        disabled={currentPage === totalPages}
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          "&:hover": { backgroundColor: "#e0e0e0" },
          "&:disabled": { backgroundColor: "#dcdcdc" },
          gap: 1,
        }}
      >
        <Icon
          path={isRTL ? mdiChevronLeft : mdiChevronRight}
          size={1}
          color={currentPage === totalPages ? "#bbb" : "#000"}
        />
      </IconButton>
      <Typography
        variant="body1"
        sx={{
          fontWeight: "bold",
          color: currentPage === totalPages ? "#bbb" : "#000",
        }}
      >
        {lang?.suivant}
      </Typography>
    </Box>
  );
};

// Validation des props avec PropTypes
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default Pagination;
