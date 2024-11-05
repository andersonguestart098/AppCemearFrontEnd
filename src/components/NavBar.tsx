import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings"; // Ícone de configuração
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"; // Ícone de notificações (sininho)
import CircularProgress from "@mui/material/CircularProgress";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const logoSrc = "/logo.png";

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

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

  const askNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notificações ativadas!");
        await registerPushSubscription(); // Função para registrar a assinatura no backend
      } else {
        console.log("Permissão de notificações negada.");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificações:", error);
    }
  };

  // Função para registrar a assinatura no backend após a permissão
  const registerPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BDFt6_CYV5ca61PV7V3_ULiIjsNnikV5wxeU-4fHiFYrAeGlJ6U99C8lWSxz3aPgPe7PClp23wa2rgH25tDhj2Q", // Chave pública VAPID
      });

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Usuário não autenticado.");
      }

      // Decodificar o token JWT para verificar se está válido
      const decodedToken = jwtDecode<any>(token);
      if (!decodedToken || Date.now() / 1000 > decodedToken.exp) {
        console.error("Token JWT expirado ou inválido.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const p256dhKey = subscription.getKey("p256dh");
      const authKey = subscription.getKey("auth");

      if (!p256dhKey || !authKey) {
        throw new Error("Chaves de criptografia ausentes.");
      }

      // Usar Array.from() para converter Uint8Array em um array normal antes de convertê-lo para base64
      const p256dhBase64 = btoa(
        String.fromCharCode(...Array.from(new Uint8Array(p256dhKey)))
      );
      const authBase64 = btoa(
        String.fromCharCode(...Array.from(new Uint8Array(authKey)))
      );

      // Enviar a assinatura para o backend
      await axios.post(
        "https://cemear-testes-443a098c8bb8.herokuapp.com/subscribe",
        {
          userId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: p256dhBase64,
              auth: authBase64,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificationsEnabled(true);
      console.log("Assinatura de notificações salva com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar assinatura de notificações:", error);
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

            {/* Ícones de configuração e logout alinhados à direita */}
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
          <Typography variant="h6">Ativar notificações</Typography>
          {/* Ícone de sininho para notificações */}
          <IconButton
            onClick={askNotificationPermission}
            sx={{ color: "#0B68A9", marginTop: "8px" }}
          >
            <NotificationsActiveRoundedIcon />
          </IconButton>
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
