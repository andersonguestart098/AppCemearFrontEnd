import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { CloudUpload, Send } from "@mui/icons-material"; // Ícones do Material UI

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
      await axios.post("http://localhost:3001/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
    <Box
      padding={2}
      sx={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Título centralizado */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        style={{ color: "#0B68A9" }}
      >
        Adicionar Post
      </Typography>

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
        <Box
          marginBottom={2}
          display="flex"
          justifyContent="space-between" // Isso garante que os ícones fiquem nas extremidades opostas
          alignItems="center"
        >
          {/* Botão de upload com ícone de nuvem e texto "Anexo" */}
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="icon-button-file"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="icon-button-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
            >
              {image ? image.name : "Anexo"}
            </Button>
          </label>

          {/* Espaçamento flexível para separar os ícones */}
          <Box flexGrow={1} />

          {/* Botão de enviar com ícone de avião de papel à direita */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#2196f3",
              "&:hover": {
                backgroundColor: "#1976d2",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} /> // Spinner branco
            ) : (
              <Send sx={{ fontSize: 28, color: "#fff" }} />
            )}
          </Button>
        </Box>
        {error && (
          <Box marginBottom={2} color="red">
            {error}
          </Box>
        )}
      </form>
    </Box>
  );
};

export default PostForm;
