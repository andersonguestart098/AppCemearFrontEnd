import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, CircularProgress, Input } from "@mui/material";

interface PostFormProps {
  closeModal: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ closeModal }) => {
  const [conteudo, setConteudo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo || !conteudo) {
      setError("Título e conteúdo são obrigatórios.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("conteudo", conteudo);
    if (image) {
      formData.append("image", image); // Adiciona a imagem ao FormData
    }

    try {
      console.log("Enviando dados:", { titulo, conteudo, image });
      await axios.post(
        "https://cemear-b549eb196d7c.herokuapp.com/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setConteudo("");
      setTitulo("");
      setImage(null); // Reseta a imagem após o envio
      closeModal();
    } catch (error) {
      console.error("Erro ao enviar postagem:", error);
      setError("Ocorreu um erro ao enviar a postagem. Tente novamente.");
    } finally {
      setLoading(false);
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
            onChange={(e) => setTitulo(e.target.value)}
            fullWidth
            required
          />
        </Box>
        <Box marginBottom={2}>
          <TextField
            label="Digite sua postagem..."
            variant="outlined"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />
        </Box>
        <Box marginBottom={2}>
          <Input
            type="file"
            onChange={handleImageChange}
            inputProps={{ accept: "image/*" }}
          />
        </Box>
        {error && (
          <Box marginBottom={2} color="red">
            {error}
          </Box>
        )}
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Postar"}
          </Button>
          <Button
            type="button"
            onClick={closeModal}
            variant="outlined"
            color="secondary"
            disabled={loading}
          >
            Fechar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PostForm;
