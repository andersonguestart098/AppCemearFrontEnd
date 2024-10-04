import React from "react";
import { Box, Popover, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface CommentListProps {
  anchorEl: HTMLElement | null;
  selectedPost: any;
  handleClose: () => void;
  handleDeleteComment: (commentId: string) => void;
  tipoUsuario: string; // Assegura que será sempre uma string
}

const CommentList: React.FC<CommentListProps> = ({
  anchorEl,
  selectedPost,
  handleClose,
  handleDeleteComment,
  tipoUsuario, // Nova prop
}) => {
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
          comments
            .slice(0)
            .reverse()
            .map((comment: any, index: number) => (
              <Box key={index} display="flex" alignItems="center" mt={1}>
                <Typography sx={{ flexGrow: 1 }}>
                  {comment.user
                    ? `${comment.user.usuario}: ${comment.content}`
                    : "Usuário desconhecido"}
                </Typography>
                {tipoUsuario === "admin" && ( // Condição para mostrar o botão de delete
                  <IconButton
                    onClick={() => handleDeleteComment(comment.id)}
                    sx={{ color: "red" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))
        ) : (
          <Typography>Nenhum comentário disponível</Typography>
        )}
      </Box>
    </Popover>
  );
};

export default CommentList;
