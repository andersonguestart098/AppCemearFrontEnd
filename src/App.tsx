import React, { useEffect } from "react";
import { Button, IconButton, Modal, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./components/UserContext";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import CalendarComponent from "./components/Calendar";
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
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
  const [isPostFormOpen, setIsPostFormOpen] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = React.useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = React.useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
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

  const openPostFormModal = () => setIsPostFormOpen(true);
  const closePostFormModal = () => setIsPostFormOpen(false);

  const openCalendarModal = () => setIsCalendarOpen(true);
  const closeCalendarModal = () => setIsCalendarOpen(false);

  const openFileUploadModal = () => setIsFileUploadOpen(true);
  const closeFileUploadModal = () => setIsFileUploadOpen(false);

  const openFileDownloadModal = () => setIsFileDownloadOpen(true);
  const closeFileDownloadModal = () => setIsFileDownloadOpen(false);

  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);

  const handleLogout = () => {
    console.log("Logout chamado");
    localStorage.removeItem("token");
    setTipoUsuario(""); // Limpar o estado do tipo de usuário no contexto
    navigate("/login"); // Redirecionar para a página de login
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
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
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
            </IconButton>
          </>
        ) : tipoUsuario === "user" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarTodayIcon style={{ fontSize: 36 }} /> {/* Ícone maior */}
            </IconButton>
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
      <Modal open={isPostFormOpen} onClose={closePostFormModal}>
        <Box sx={style}>
          <PostForm closeModal={closePostFormModal} />
        </Box>
      </Modal>

      <Modal open={isCalendarOpen} onClose={closeCalendarModal}>
        <Box sx={style}>
          <CalendarComponent />
          <Button
            variant="outlined"
            onClick={closeCalendarModal}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={isFileUploadOpen} onClose={closeFileUploadModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Upload de Arquivos:
          </Typography>
          <FileUploadComponent />
          <Button
            variant="outlined"
            onClick={closeFileUploadModal}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={isFileDownloadOpen} onClose={closeFileDownloadModal}>
        <Box sx={style}>
          <FileDownloadComponent />
          <Button
            variant="outlined"
            onClick={closeFileDownloadModal}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={isRegisterOpen} onClose={closeRegisterModal}>
        <Box sx={style}>
          <Register />
        </Box>
      </Modal>
    </div>
  );
};

export default App;
