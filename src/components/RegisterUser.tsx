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
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/auth/register", {
        usuario,
        password,
        tipoUsuario,
      });

      if (response.status === 200) {
        console.log("User registered successfully");
        navigate("/main"); // Redireciona para a página principal
        if (closeModal) closeModal(); // Verifica se closeModal existe antes de chamá-lo
      }
    } catch (err) {
      setError("Failed to register user. Please try again.");
      console.error("Registration error:", err);
    }
  };

  return (
    <Container maxWidth="sm" style={{ padding: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Register User
      </Typography>
      <form onSubmit={handleRegister}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password"
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
                <MenuItem value="admin">Adiministrador</MenuItem>
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
              Register
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default RegisterUser;
