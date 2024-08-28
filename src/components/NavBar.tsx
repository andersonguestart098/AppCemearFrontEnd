import * as React from "react";
import { useNavigate } from "react-router-dom"; // Certifique-se de que está usando react-router-dom
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton"; // Importando o IconButton do Material-UI
import LogoutIcon from "@mui/icons-material/Logout"; // Importando o ícone de Logout

const logoSrc = "/logo.png"; // Caminho para a logo

function ResponsiveAppBar() {
  const navigate = useNavigate(); // Hook para navegação
  const userName = "Anderson"; // Nome do usuário logado

  const handleLogout = () => {
    console.log("Logout chamado");
    localStorage.removeItem("token");
    // Presumindo que setTipoUsuario é uma função vinda de um contexto ou estado
    // Limpar o estado do tipo de usuário
    navigate("/login"); // Redirecionar para a página de login
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          {/* Logo alinhada à esquerda */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={logoSrc} alt="Logo" style={{ height: 20 }} />
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
  );
}

export default ResponsiveAppBar;
