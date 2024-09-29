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
  // Verifique se selectedPost existe e se comments não está indefinido ou nulo
  const comments = selectedPost?.comments || [];

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
      <Box mt={2} sx={{ padding: 2 }}>
        <Typography variant="h6">Comentários</Typography>
        {comments.length > 0 ? (
          comments.slice(0).reverse().map((comment: any, index: number) => (
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
