import { Box, IconButton, Popover } from "@mui/material";
import React from "react";

interface ReactionMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  handleReaction: (type: string) => void; // Passando o tipo de reação
}

const ReactionMenu: React.FC<ReactionMenuProps> = React.memo(
  ({ anchorEl, handleClose, handleReaction }) => (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", p: 1 }}>
        <IconButton
          sx={{ fontSize: 30, color: "#f1c40f" }} // Cor viva para o 'like'
          onClick={() => handleReaction("like")}
        >
          👍
        </IconButton>
        <IconButton
          sx={{ fontSize: 30, color: "#e74c3c" }} // Cor viva para o 'love'
          onClick={() => handleReaction("love")}
        >
          ❤️
        </IconButton>
        <IconButton
          sx={{ fontSize: 30, color: "#f39c12" }} // Cor viva para o 'haha'
          onClick={() => handleReaction("haha")}
        >
          😂
        </IconButton>
      </Box>
    </Popover>
  )
);

export default ReactionMenu;
