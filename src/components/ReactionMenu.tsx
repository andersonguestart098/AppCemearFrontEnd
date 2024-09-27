import React from "react";
import { Box, IconButton, Popover } from "@mui/material";

interface ReactionMenuProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  handleReaction: (type: string) => void;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({
  anchorEl,
  handleClose,
  handleReaction,
}) => (
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
      <IconButton onClick={() => handleReaction("like")}>
        👍
      </IconButton>
      <IconButton onClick={() => handleReaction("love")}>
        ❤️
      </IconButton>
      <IconButton onClick={() => handleReaction("haha")}>
        😂
      </IconButton>
    </Box>
  </Popover>
);

export default ReactionMenu;
