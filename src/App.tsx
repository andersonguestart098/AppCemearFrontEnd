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
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
import CalendarAniversario from "./components/CalendarAniversario"; // Importando o calendário de aniversários
import CalendarFeria from "./components/CalendarFerias"; // Importando o calendário de férias
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Register from "./components/RegisterUser";
import NavBar from "./components/NavBar";

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
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarType, setCalendarType] = useState<string | null>(null); // Tipo de calendário

  const { tipoUsuario, setTipoUsuario } = useUserContext();

  useEffect(() => {
    const storedTipoUsuario = localStorage.getItem("tipoUsuario");
    if (storedTipoUsuario) {
      setTipoUsuario(storedTipoUsuario);
    } else {
      navigate("/login"); // Redireciona para o login se o usuário não estiver autenticado
    }
  }, [navigate, setTipoUsuario]);

  if (!tipoUsuario) {
    return <div>Carregando...</div>; // Tela de carregamento
  }

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const openCalendarModal = (type: string) => {
    setCalendarType(type);
    setIsCalendarOpen(true);
    handleCloseMenu(); // Fechar o menu após escolher o calendário
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
        backgroundColor: "#f2f2f2", // Fundo cinza
        minHeight: "100vh", // Garante que cubra a tela toda
      }}
    >
      <NavBar />

      <div
        style={{
          paddingTop: "40px",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap", // Se necessário, permite que os botões se reagrupem em outra linha
        }}
      >
        {tipoUsuario === "admin" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="primary"
              onClick={() => setIsPostFormOpen(true)}
            >
              <PostAddIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="success"
              onClick={() => setIsFileUploadOpen(true)}
            >
              <UploadFileIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="warning"
              onClick={() => setIsFileDownloadOpen(true)}
            >
              <DownloadForOfflineIcon style={{ fontSize: 36 }} />{" "}
              {/* Ícone maior */}
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="info"
              onClick={() => setIsRegisterOpen(true)}
            >
              <PersonAddIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
            </IconButton>
            {/* Botão com menu dropdown para selecionar os calendários */}
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
              <CalendarTodayIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
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
              <DownloadForOfflineIcon style={{ fontSize: 36 }} />{" "}
              {/* Ícone maior */}
            </IconButton>
          </>
        ) : null}
      </div>

      {/* Renderizar a lista de posts para todos os usuários */}
      <PostList />

      {/* Modals */}
      <Modal open={isPostFormOpen} onClose={() => setIsPostFormOpen(false)}>
        <Box sx={style}>
          <PostForm closeModal={() => setIsPostFormOpen(false)} />
        </Box>
      </Modal>

      {/* Modal para os calendários com base na opção selecionada */}
      <Modal open={isCalendarOpen} onClose={closeCalendarModal}>
        <Box sx={style}>
          {calendarType === "Eventos" && <CalendarComponent />}
          {calendarType === "Férias" && <CalendarFeria />}
          {calendarType === "Aniversários" && <CalendarAniversario />}
          <Button
            variant="outlined"
            onClick={closeCalendarModal}
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
