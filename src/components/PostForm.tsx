import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography } from "@mui/material";

interface PostFormProps {
  closeModal: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ closeModal }) => {
  const [conteudo, setContent] = useState("");
  const [titulo, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/posts", { conteudo, titulo });
      setContent(""); // Limpa o conteúdo após o envio
      setTitle(""); // Limpa o título após o envio
      closeModal(); // Fecha o modal após o envio
    } catch (error) {
      console.error("Erro ao enviar postagem", error);
    }
  };

  return (
    <Box padding={2}>
      <form onSubmit={handleSubmit}>
        <Box marginBottom={2}>
          <TextField
            label="Título"
            variant="outlined"
            value={titulo}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
        </Box>
        <Box marginBottom={2}>
          <TextField
            label="Digite sua postagem..."
            variant="outlined"
            value={conteudo}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button type="submit" variant="contained" color="primary">
            Postar
          </Button>
          <Button
            type="button"
            onClick={closeModal}
            variant="outlined"
            color="secondary"
          >
            Fechar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PostForm;
