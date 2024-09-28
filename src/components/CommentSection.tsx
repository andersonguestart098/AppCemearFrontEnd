import React from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send } from "@mui/icons-material";

interface CommentSectionProps {
  postId: string;
  newComment: string;
  handleCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddComment: (postId: string) => void;
  loading: boolean; // Adiciona a prop "loading" para indicar se está carregando
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  newComment,
  handleCommentChange,
  handleAddComment,
  loading, // Recebe o estado de carregamento
}) => {
  return (
    <Box mt={2}>
      <TextField
        sx={{ paddingBottom: 1 }}
        label="Adicionar comentário"
        fullWidth
        multiline
        rows={2}
        value={newComment}
        onChange={handleCommentChange}
      />
      <IconButton
        color="primary"
        onClick={() => handleAddComment(postId)}
        disabled={loading} // Desativa o botão enquanto está carregando
        sx={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#0B68A9",
          "&:hover": {
            backgroundColor: "#005086",
          },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "#fff" }} /> // Spinner enquanto carrega
        ) : (
          <Send sx={{ fontSize: 24, color: "#fff" }} /> // Ícone de enviar quando não está carregando
        )}
      </IconButton>
    </Box>
  );
};

export default CommentSection;
