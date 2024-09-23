import * as React from "react";
import { useNavigate } from "react-router-dom"; // Certifique-se de que está usando react-router-dom
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton"; // Importando o IconButton do Material-UI
import LogoutIcon from "@mui/icons-material/Logout"; // Importando o ícone de Logout
import CircularProgress from "@mui/material/CircularProgress"; // Importando o spinner de carregamento

const logoSrc = "/logo.png"; // Caminho para a logo

function ResponsiveAppBar() {
  const navigate = useNavigate(); // Hook para navegação
  const [loading, setLoading] = React.useState(false); // Estado para controlar o spinner

  const handleLogout = () => {
    console.log("Logout chamado");
    setLoading(true); // Ativa o spinner

    // Simula uma espera antes de fazer o logout para uma transição mais suave
    setTimeout(() => {
      localStorage.removeItem("token");
      // Limpar qualquer estado relacionado ao usuário, se aplicável
      navigate("/login"); // Redirecionar para a página de login
    }, 1500); // 1,5 segundos para simular uma transição suave
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          width: "100%",
          margin: 0,
          border: "none",
          zIndex: 1000,
          boxShadow: "none",
          backgroundColor: "#0B68A9", // Usando o azul principal
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            {/* Logo alinhada à esquerda */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src={logoSrc} alt="Logo" style={{ width: 120 }} />
            </Box>

            {/* Saudação e ícone de logout alinhados à direita */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={handleLogout} sx={{ color: "white" }}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Exibir o spinner centralizado quando o estado de loading estiver ativo */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Fundo com transparência
          }}
        >
          <CircularProgress size={80} />
        </Box>
      )}
    </>
  );
}

export default ResponsiveAppBar;
