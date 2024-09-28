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
import CalendarAniversario from "./components/CalendarAniversario"; // Importando o calendário de aniversários
import CalendarFeria from "./components/CalendarFerias"; // Importando o calendário de férias
import CalendarComponent from "./components/Calendar"; // Importando o calendário de eventos
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NavBar from "./components/NavBar";
import Register from "./components/RegisterUser"; // Certifique-se de que este caminho esteja correto

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
  width: "55px",
  height: "55px",
  margin: "3px",
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarType, setCalendarType] = useState<string | null>(null); // Tipo de calendário

  const { tipoUsuario, setTipoUsuario } = useUserContext();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const storedTipoUsuario = localStorage.getItem("tipoUsuario");

      if (storedTipoUsuario) {
        setTipoUsuario(storedTipoUsuario);
        navigate("/main"); // Redireciona diretamente para o componente principal se já estiver autenticado
      }
    } else {
      navigate("/login");
    }
  }, [navigate, setTipoUsuario]);

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const openCalendarModal = (type: string) => {
    setCalendarType(type);
    setIsCalendarOpen(true);
    handleCloseMenu();
  };

  const closeCalendarModal = () => {
    setIsCalendarOpen(false);
    setCalendarType(null);
  };

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#F1F2F4",
        minHeight: "100vh",
      }}
    >
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
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={handleCalendarClick}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => openCalendarModal("Eventos")}>
                Calendário de Eventos
              </MenuItem>
              <MenuItem onClick={() => openCalendarModal("Férias")}>
                Calendário de Férias
              </MenuItem>
              <MenuItem onClick={() => openCalendarModal("Aniversários")}>
                Calendário de Aniversários
              </MenuItem>
            </Menu>
          </>
        ) : tipoUsuario === "user" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={handleCalendarClick}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => openCalendarModal("Eventos")}>
                Calendário de Eventos
              </MenuItem>
              <MenuItem onClick={() => openCalendarModal("Férias")}>
                Calendário de Férias
              </MenuItem>
              <MenuItem onClick={() => openCalendarModal("Aniversários")}>
                Calendário de Aniversários
              </MenuItem>
            </Menu>
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

      <Modal open={isCalendarOpen} onClose={closeCalendarModal}>
        <Box sx={style}>
          {calendarType === "Aniversários" && (
            <CalendarAniversario closeCalendarModal={closeCalendarModal} />
          )}
          {calendarType === "Férias" && (
            <CalendarFeria closeCalendarModal={closeCalendarModal} />
          )}
          {calendarType === "Eventos" && (
            <CalendarComponent closeCalendarModal={closeCalendarModal} />
          )}
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
