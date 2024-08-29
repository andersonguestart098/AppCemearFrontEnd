import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

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
      await axios.post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      <Typography variant="h6" gutterBottom></Typography>
      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          onChange={onFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span">
            Selecionar Arquivo
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {file.name}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={onUpload}
        disabled={uploading}
        sx={{ display: "block", mb: 2 }}
      >
        {uploading ? <CircularProgress size={24} /> : "Enviar Arquivo"}
      </Button>
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
