import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Snackbar,
  IconButton,
} from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import axios from "axios";
import { useUserContext } from "./UserContext";

interface SuggestionFormProps {
  closeModal: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ closeModal }) => {
  const [nomeUsuario, setNomeUsuario] = useState<string | null>("");
  const [titulo, setTitulo] = useState<string>("");
  const [conteudo, setConteudo] = useState<string>("");
  const [isAnonimo, setIsAnonimo] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false); // Controla a abertura do Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState<string>(""); // Mensagem do Snackbar
  const { userId } = useUserContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo || !conteudo) {
      setError("Título e conteúdo são obrigatórios.");
      return;
    }

    setLoading(true);

    const suggestionData = {
      nomeUsuario: isAnonimo ? "Anônimo" : nomeUsuario,
      titulo,
      conteudo,
      userId: isAnonimo ? null : userId, // Se for anônimo, userId será null
    };

    try {
      await axios.post("/suggestions", suggestionData);

      // Exibe o Snackbar de sucesso
      setSnackbarMessage("Sugestão enviada com sucesso!");
      setOpenSnackbar(true); // Abre o Snackbar

      // Reseta o formulário após o envio
      setTitulo("");
      setConteudo("");
      setNomeUsuario("");
      setIsAnonimo(false);

      // Aguarda um pequeno atraso para garantir que o formulário seja limpo
      setTimeout(() => {
        closeModal(); // Fecha o modal após o envio e reset
      }, 500); // Dá um delay de 500ms para garantir que os campos foram limpos antes do modal fechar
    } catch (error) {
      setError("Ocorreu um erro ao enviar a sugestão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Fecha o Snackbar
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
        Deixe sua Sugestão
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box marginBottom={2}>
          <TextField
            label="Nome"
            variant="outlined"
            value={nomeUsuario || ""}
            onChange={(e) => setNomeUsuario(e.target.value)}
            fullWidth
            disabled={isAnonimo}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAnonimo}
              onChange={(e) => setIsAnonimo(e.target.checked)}
            />
          }
          label="Enviar como anônimo"
        />
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
            label="Conteúdo"
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
          justifyContent="space-between"
          alignItems="center"
        >
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
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              <LightbulbIcon sx={{ fontSize: 28, color: "#fff" }} />
            )}
          </Button>
        </Box>
        {error && (
          <Box marginBottom={2} color="red">
            {error}
          </Box>
        )}
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <LightbulbIcon />
          </IconButton>
        }
      />
    </Box>
  );
};

export default SuggestionForm;
