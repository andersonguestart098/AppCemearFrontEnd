import React from "react";
import { Box, TextField, Button } from "@mui/material";

interface CommentSectionProps {
  postId: string;
  newComment: string;
  handleCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddComment: (postId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  newComment,
  handleCommentChange,
  handleAddComment,
}) => {
  return (
    <Box mt={2}>
      <TextField
        label="Adicionar comentário"
        fullWidth
        multiline
        rows={2}
        value={newComment}
        onChange={handleCommentChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAddComment(postId)}
        sx={{ marginTop: "10px" }}
      >
        Comentar
      </Button>
    </Box>
  );
};

export default CommentSection;
