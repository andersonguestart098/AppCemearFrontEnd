import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrigido: jwt_decode deve ser importado corretamente
import { subscribeUserToPush } from "../serviceWorkerRegistration"; // Certifique-se de importar corretamente

// Exemplo de logo simples para simular o estilo do Trello
const Logo = () => (
  <Box
    component="img"
    src="logo.png" // Altere para o caminho da sua logo
    alt="Logo"
    sx={{
      width: "150px",
      marginBottom: "20px",
    }}
  />
);

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // Estado para controle da Snackbar
  const navigate = useNavigate();

  // Verifica se o usuário está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Verificando se o token está armazenado:", token);
    if (token) {
      try {
        const decodedToken = jwtDecode<any>(token); // Decodifica corretamente o token

        if (decodedToken) {
          // Calcula a data de expiração para 100 anos a partir de agora
          const expirationDate = new Date();
          expirationDate.setFullYear(expirationDate.getFullYear() + 100);
          console.log(
            "Data de expiração definida para daqui a 100 anos:",
            expirationDate
          );

          // Se precisar de mais informações do token, use-as aqui
          console.log("Dados do token decodificado:", decodedToken);
        }
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
      navigate("/main"); // Redireciona para o componente principal
    }
  }, [navigate]);

  // Lógica para bloquear o botão de voltar
  useEffect(() => {
    const handleBackButton = (event: PopStateEvent) => {
      const token = localStorage.getItem("token");
      console.log("Evento de voltar detectado. Token presente:", token);

      if (token) {
        event.preventDefault();
        console.log("Bloqueando botão de voltar, redirecionando para main");
        navigate("/main"); // Se o usuário estiver autenticado, redireciona de volta ao componente principal
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      console.log("Removendo o listener do botão de voltar");
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentativa de login iniciada...");
    setLoading(true); // Ativa o spinner
    setError(null); // Limpa o erro antes do envio

    try {
      const response = await fetch(
        "https://cemear-b549eb196d7c.herokuapp.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario, password }),
        }
      );

      console.log("Resposta do servidor recebida:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Login bem-sucedido. Dados recebidos:", data);

        // Armazena o token, tipo de usuário e ID do usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("tipoUsuario", data.tipoUsuario);
        localStorage.setItem("userId", data.userId || data._id); // Armazena o ID do usuário
        console.log(
          "Token, tipo de usuário e userId armazenados no localStorage."
        );

        // Decodifica o token e exibe a data de expiração
        try {
          const decodedToken = jwtDecode<any>(data.token);
          const expirationDate = new Date(decodedToken.exp * 1000);
          console.log("Data de expiração do token:", expirationDate);
        } catch (error) {
          console.error("Erro ao decodificar o token:", error);
        }

        // Solicita permissão para notificações
        askNotificationPermission();

        // Após login bem-sucedido, registra e inscreve o usuário para notificações push
        const registration = await navigator.serviceWorker.ready;
        console.log(
          "ServiceWorker pronto, inscrevendo o usuário para notificações push."
        );
        subscribeUserToPush(registration);

        // Redireciona para a página principal
        navigate("/main");
      } else {
        const errorMsg = await response.json(); // Pega a mensagem de erro do servidor
        console.error("Erro na resposta do login:", errorMsg);
        setError(errorMsg.msg || "Credenciais inválidas."); // Mensagem padrão caso o erro não tenha msg
        setOpenSnackbar(true); // Abre a Snackbar quando houver erro
      }
    } catch (err) {
      console.error("Erro no processo de login:", err);
      setError("Ocorreu um erro. Tente novamente.");
      setOpenSnackbar(true); // Abre a Snackbar para erro de rede ou outro
    } finally {
      setLoading(false); // Desativa o spinner
      console.log("Finalizando a tentativa de login.");
    }
  };

  // Solicita permissão para notificações após o login
  const askNotificationPermission = () => {
    console.log("Verificando permissão para notificações...");
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notificações permitidas");
        } else {
          console.log("Notificações negadas");
        }
      });
    } else {
      console.log("Permissões já concedidas ou notificações não suportadas.");
    }
  };

  // Função para fechar a Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", // Preenche a altura total da tela
        backgroundColor: "#f5f5f5", // Fundo cinza claro
      }}
    >
      {/* Logo */}
      <Logo />

      {/* Texto de orientação */}
      <Typography variant="h6" gutterBottom sx={{ marginBottom: "20px" }}>
        Entre para continuar
      </Typography>

      {/* Formulário */}
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: "100%",
          maxWidth: "400px", // Limita a largura máxima do formulário
          backgroundColor: "#ffffff", // Fundo branco para o formulário
          padding: "30px", // Espaçamento interno no formulário
          borderRadius: "8px", // Borda arredondada
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Sombra leve
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          label="Insira seu usuário"
          variant="outlined"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          sx={{
            marginBottom: "16px",
            width: "100%", // Faz o input preencher 100% da largura do container
          }}
        />
        <TextField
          label="Senha"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{
            marginBottom: "16px",
            width: "100%", // Faz o input preencher 100% da largura do container
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
          }}
          disabled={loading} // Desativa o botão enquanto carrega
        >
          {loading ? <CircularProgress size={24} /> : "Continuar"}
        </Button>
      </Box>

      {/* Snackbar para exibir erros */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Posição no topo da tela
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Link para criar uma nova conta */}
      <Typography variant="body2" sx={{ marginTop: "20px" }}>
        <a href="/signup" style={{ textDecoration: "none", color: "#0079bf" }}>
          CEMEAR COMERCIO E REPRESENTACAO LTDA
        </a>
      </Typography>
    </Box>
  );
};

export default Login;
