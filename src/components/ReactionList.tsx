import React from "react";
import { Box, Popover, Typography } from "@mui/material";

interface ReactionListProps {
  anchorEl: HTMLElement | null;
  selectedReactionPost: any;
  handleClose: () => void;
}

const ReactionList: React.FC<ReactionListProps> = ({
  anchorEl,
  selectedReactionPost,
  handleClose,
}) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={handleClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
  >
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Reações</Typography>
      {selectedReactionPost?.reactions?.length > 0 ? (
        selectedReactionPost.reactions.map((reaction: any, index: any) => (
          <Typography key={index}>
            {reaction.user
              ? `${reaction.user.usuario} reagiu com ${reaction.type}`
              : "Usuário desconhecido"}
          </Typography>
        ))
      ) : (
        <Typography>Nenhuma reação disponível</Typography>
      )}
    </Box>
  </Popover>
);

export default ReactionList;
