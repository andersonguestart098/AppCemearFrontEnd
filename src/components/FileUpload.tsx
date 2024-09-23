import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Ícone de nuvem para upload
import SendIcon from "@mui/icons-material/Send"; // Ícone de avião de papel para envio

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Limpa erros ao selecionar um novo arquivo
    }
  };

  const onUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "https://cemear-b549eb196d7c.herokuapp.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Arquivo enviado com sucesso!");
      setFile(null); // Limpa o arquivo após o upload
    } catch (err) {
      console.error("Erro ao enviar arquivo", err);
      setError("Erro ao enviar arquivo. Tente novamente.");
    } finally {
      setUploading(false);
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <input
          type="file"
          onChange={onFileChange}
          style={{ display: "none" }}
          accept=".jpg,.jpeg,.png,.pdf,.csv,.xls,.xlsx" // Permite múltiplos tipos de arquivos
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />} // Ícone de nuvem
            sx={{
              display: "flex",
              alignItems: "center",
              width: "200px", // Largura do botão
              height: "60px", // Altura do botão
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              fontSize: "12px", // Diminui o tamanho da fonte
              justifyContent: "flex-start", // Alinha o texto à esquerda
            }}
          >
            {file ? file.name : "Selecionar Arquivo"}
          </Button>
        </label>

        {/* Botão de envio com formato circular e spinner */}
        <IconButton
          color="primary"
          onClick={onUpload}
          disabled={uploading}
          sx={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {uploading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            <SendIcon sx={{ fontSize: 28, color: "#fff" }} />
          )}
        </IconButton>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUploadComponent;
