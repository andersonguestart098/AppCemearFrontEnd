import React from "react";
import { Box, Popover, Typography } from "@mui/material";

interface CommentListProps {
  anchorEl: HTMLElement | null;
  selectedPost: any; // Ajuste conforme necessário
  handleClose: () => void;
}

const CommentList: React.FC<CommentListProps> = ({
  anchorEl,
  selectedPost,
  handleClose,
}) => {
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
        <Typography variant="h6">Comentários</Typography>
        {selectedPost?.comments?.length > 0 ? (
          selectedPost.comments.map((comment: any, index: any) => (
            <Typography key={index}>
              {comment.user
                ? `${comment.user.usuario}: ${comment.content}`
                : "Usuário desconhecido"}
            </Typography>
          ))
        ) : (
          <Typography>Nenhum comentário disponível</Typography>
        )}
      </Box>
    </Popover>
  );
};

export default CommentList;
