import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"; // Ícone de notificações (sininho)
import CircularProgress from "@mui/material/CircularProgress";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import axios from "axios";

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
        const registration = await navigator.serviceWorker.ready;

        // Registrar a assinatura no PushManager
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array("BDFt6_CYV5ca61PV7V3_ULiIjsNnikV5wxeU-4fHiFYrAeGlJ6U99C8lWSxz3aPgPe7PClp23wa2rgH25tDhj2Q"),
        });

        console.log("Assinatura de notificações obtida:", subscription);

        // Extrair chaves de criptografia
        const p256dh = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');

        // Verifique se as chaves foram geradas corretamente
        if (!p256dh || !auth) {
          console.error("Chaves de criptografia ausentes.");
          return;
        }

        // Converter para Base64
        const p256dhKey = arrayBufferToBase64(p256dh);
        const authKey = arrayBufferToBase64(auth);

        // Exibir as chaves e endpoint para debug
        console.log("p256dhKey (Base64):", p256dhKey);
        console.log("authKey (Base64):", authKey);
        console.log("Endpoint:", subscription.endpoint);

        // Armazenar no localStorage (opcional)
        localStorage.setItem('subscriptionEndpoint', subscription.endpoint);
        localStorage.setItem('subscriptionP256dh', p256dhKey);
        localStorage.setItem('subscriptionAuth', authKey);

        // Enviar a assinatura para o servidor
        await sendSubscriptionToServer(subscription.endpoint, p256dhKey, authKey);
      } else {
        console.log("Permissão de notificações negada.");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificações:", error);
    }
  };

  const sendSubscriptionToServer = async (endpoint: any, p256dhKey: any, authKey: any) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("Token ou User ID ausentes.");
        return;
      }

      // Enviar a assinatura para o servidor
      const response = await axios.post(
        'https://cemear-b549eb196d7c.herokuapp.com/subscribe',
        {
          userId,
          endpoint,
          keys: {
            p256dh: p256dhKey,
            auth: authKey,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Assinatura enviada com sucesso:", response.data);
    } catch (error) {
      console.error("Erroo ao enviar a assinatura para o servidor:", error);
    }
  };

  // Converter ArrayBuffer para Base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
  }

  // Função utilitária para converter a chave VAPID de base64 para Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

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
