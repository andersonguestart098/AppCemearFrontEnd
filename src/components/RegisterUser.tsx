import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface RegisterUserProps {
  closeModal?: () => void; // Propriedade opcional
}

const RegisterUser: React.FC<RegisterUserProps> = ({ closeModal }) => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("user");
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado para controlar o Snackbar
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpar o erro antes do envio

    try {
      const response = await axios.post(
        "https://cemear-b549eb196d7c.herokuapp.com/auth/register",
        {
          usuario,
          password,
          tipoUsuario,
        }
      );

      if (response.status === 200) {
        console.log("Usuário registrado com sucesso");

        // Exibe o Snackbar
        setSnackbarOpen(true);

        // Limpa os campos do formulário
        setUsuario("");
        setPassword("");
        setTipoUsuario("user");

        // Fecha o modal se a função `closeModal` foi passada
        if (closeModal) closeModal();

        // Redireciona para a página principal (opcional)
        navigate("/main");
      }
    } catch (err) {
      setError("Falha ao registrar o usuário. Tente novamente.");
      console.error("Erro no registro:", err);
    }
  };

  // Função para fechar o Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" style={{ padding: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Registrar Novo Usuário
      </Typography>
      <form onSubmit={handleRegister}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Usuário"
              variant="outlined"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tipo de Usuário</InputLabel>
              <Select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                label="Tipo de Usuário"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="user" defaultChecked>
                  Usuário
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Registrar
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar para exibir notificação */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Localização do Snackbar
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Usuário {usuario} registrado com sucesso!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterUser;
