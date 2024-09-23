import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./components/UserContext";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import CalendarComponent from "./components/Calendar";
import CalendarAniversario from "./components/CalendarAniversario"; // Novo calendário de aniversários
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NavBar from "./components/NavBar";
import Register from "./components/RegisterUser";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const buttonStyle = {
  borderRadius: "50%",
  width: "65px",
  height: "65px",
  margin: "3px",
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<
    "eventos" | "aniversarios" | "ferias" | null
  >(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { tipoUsuario, setTipoUsuario } = useUserContext();

  // Estado para controlar o menu dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const storedTipoUsuario = localStorage.getItem("tipoUsuario");
    if (storedTipoUsuario) {
      setTipoUsuario(storedTipoUsuario);
    } else {
      navigate("/login");
    }
  }, [navigate, setTipoUsuario]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setTipoUsuario("");
    navigate("/login");
  };

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const openSelectedCalendar = (
    calendar: "eventos" | "aniversarios" | "ferias"
  ) => {
    setSelectedCalendar(calendar);
    setIsCalendarOpen(true);
    closeMenu(); // Fecha o dropdown ao selecionar
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <NavBar />

      <div
        style={{
          paddingTop: "40px",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {tipoUsuario === "admin" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="primary"
              onClick={() => setIsPostFormOpen(true)}
            >
              <PostAddIcon style={{ fontSize: 36 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="success"
              onClick={() => setIsFileUploadOpen(true)}
            >
              <UploadFileIcon style={{ fontSize: 36 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="warning"
              onClick={() => setIsFileDownloadOpen(true)}
            >
              <DownloadForOfflineIcon style={{ fontSize: 36 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="info"
              onClick={() => setIsRegisterOpen(true)}
            >
              <PersonAddIcon style={{ fontSize: 36 }} />
            </IconButton>

            {/* Botão que abre o menu de seleção de calendários */}
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={openMenu}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} />
            </IconButton>

            {/* Menu de seleção de calendários */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
            >
              <MenuItem onClick={() => openSelectedCalendar("eventos")}>
                Calendário Eventos
              </MenuItem>
              <MenuItem onClick={() => openSelectedCalendar("ferias")}>
                Calendário Férias
              </MenuItem>
              <MenuItem onClick={() => openSelectedCalendar("aniversarios")}>
                Calendário Aniversários
              </MenuItem>
            </Menu>
          </>
        ) : tipoUsuario === "user" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={() => openMenu}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="warning"
              onClick={() => setIsFileDownloadOpen(true)}
            >
              <DownloadForOfflineIcon style={{ fontSize: 36 }} />
            </IconButton>
          </>
        ) : null}
      </div>

      <PostList />

      {/* Modals */}
      <Modal open={isPostFormOpen} onClose={() => setIsPostFormOpen(false)}>
        <Box sx={style}>
          <PostForm closeModal={() => setIsPostFormOpen(false)} />
        </Box>
      </Modal>

      {/* Modal de calendário com base na seleção */}
      <Modal open={isCalendarOpen} onClose={() => setIsCalendarOpen(false)}>
        <Box sx={style}>
          {selectedCalendar === "eventos" && <CalendarComponent />}
          {selectedCalendar === "aniversarios" && <CalendarAniversario />}
          {/* Vamos adicionar o componente do calendário de férias quando criarmos */}
          <Button
            variant="outlined"
            onClick={() => setIsCalendarOpen(false)}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={isFileUploadOpen} onClose={() => setIsFileUploadOpen(false)}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Upload de Arquivos:
          </Typography>
          <FileUploadComponent />
          <Button
            variant="outlined"
            onClick={() => setIsFileUploadOpen(false)}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal
        open={isFileDownloadOpen}
        onClose={() => setIsFileDownloadOpen(false)}
      >
        <Box sx={style}>
          <FileDownloadComponent />
          <Button
            variant="outlined"
            onClick={() => setIsFileDownloadOpen(false)}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
        <Box sx={style}>
          <Register />
        </Box>
      </Modal>
    </div>
  );
};

export default App;
