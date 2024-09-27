import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  handlePreviousPage,
  handleNextPage,
}) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
      <IconButton onClick={handlePreviousPage} disabled={currentPage === 1}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="body1">
        Página {currentPage} de {totalPages}
      </Typography>

      <IconButton
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <ArrowForwardIcon />
      </IconButton>
    </Box>
  );
};

export default Pagination;
