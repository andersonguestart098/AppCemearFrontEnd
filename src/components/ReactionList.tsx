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
}) => {
  // Função para mapear o tipo de reação para o emoji correspondente
  const getEmojiForReaction = (reactionType: string) => {
    switch (reactionType) {
      case "like":
        return "👍"; // Emoji para "like"
      case "love":
        return "❤️"; // Emoji para "love"
      case "haha":
        return "😂"; // Emoji para "haha"
      default:
        return ""; // Caso não haja reação correspondente
    }
  };

  return (
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
                ? `${reaction.user.usuario} reagiu com ${getEmojiForReaction(
                    reaction.type
                  )}`
                : "Usuário desconhecido"}{" "}
              {/* Verifica se user é null */}
            </Typography>
          ))
        ) : (
          <Typography>Nenhuma reação disponível</Typography>
        )}
      </Box>
    </Popover>
  );
};

export default ReactionList;
