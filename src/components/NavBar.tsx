import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings"; // Ícone de configuração
import CircularProgress from "@mui/material/CircularProgress";
import Popover from "@mui/material/Popover";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";

const logoSrc = "/logo.png";

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    Notification.permission === "granted"
  ); // Verificar se as notificações já foram permitidas
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = () => {
    console.log("Logout chamado");
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/login");
    }, 1500);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const askNotificationPermission = () => {
    console.log("Verificando permissão para notificações...");
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notificações permitidas");
          setNotificationsEnabled(true); // Atualiza para permitir notificações
        } else {
          console.log("Notificações negadas");
          setNotificationsEnabled(false); // Não permitiu notificações
        }
      });
    } else {
      console.log("Permissões já concedidas ou notificações não suportadas.");
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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
          backgroundColor: "#0B68A9",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            {/* Logo alinhada à esquerda */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src={logoSrc} alt="Logo" style={{ width: 125 }} />
            </Box>

            {/* Saudação, ícone de configuração e logout alinhados à direita */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={handleSettingsClick}
                sx={{ color: "white", marginRight: "16px" }}
              >
                <SettingsIcon />
              </IconButton>

              <IconButton onClick={handleLogout} sx={{ color: "white" }}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Popover de Configurações */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box p={2}>
          <Typography variant="h6">Configurações</Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <Typography>Permitir Notificações</Typography>
            <Switch
              checked={notificationsEnabled}
              onChange={askNotificationPermission}
              color="primary"
              sx={{ marginLeft: "8px" }}
            />
          </Box>
        </Box>
      </Popover>

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
