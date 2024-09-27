import { Box, IconButton, Popover } from "@mui/material";
import React from "react";

interface ReactionMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  handleReaction: (type: string) => void;
}

// Wrap the component with React.memo to prevent unnecessary re-renders
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
        <IconButton onClick={() => handleReaction("like")}>👍</IconButton>
        <IconButton onClick={() => handleReaction("love")}>❤️</IconButton>
        <IconButton onClick={() => handleReaction("haha")}>😂</IconButton>
      </Box>
    </Popover>
  )
);

export default ReactionMenu;
