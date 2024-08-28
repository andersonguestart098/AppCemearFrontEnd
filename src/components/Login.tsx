import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "Login successful, token and tipoUsuario received:",
          data.token,
          data.tipoUsuario
        );

        // Armazena o token e tipoUsuario no localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("tipoUsuario", data.tipoUsuario);

        // Redireciona com base no tipoUsuario
        if (data.tipoUsuario === "admin") {
          navigate("/main");
        } else {
          navigate("/main");
        }
      } else {
        console.log("Login failed, response status:", response.status);
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("An error occurred:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Usuário"
          variant="outlined"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            display: "block",
            width: "300px",
            margin: "auto",
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            marginBottom: "10px",
            display: "block",
            width: "300px",
            margin: "auto",
          }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
