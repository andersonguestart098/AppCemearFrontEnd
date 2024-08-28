// App.tsx
import React from "react";
import { Button, IconButton, Modal, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importando useNavigate
import { useUserContext } from "./components/UserContext"; // Importando o UserContext
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
  width: "56px",
  height: "56px",
  margin: "5px",
};

const App: React.FC = () => {
  const navigate = useNavigate(); // Hook para navegação programática
  const [isPostFormOpen, setIsPostFormOpen] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = React.useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = React.useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const { tipoUsuario, setTipoUsuario } = useUserContext(); // Usando o UserContext

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
    localStorage.removeItem("token");
    setTipoUsuario(""); // Limpar o estado do tipo de usuário no contexto
    navigate("/login"); // Redirecionar para a página de login
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h1" gutterBottom>
        Post's
      </Typography>

      <div>
        {/* Renderização condicional baseada no tipo de usuário */}
        {tipoUsuario === "admin" ? (
          <>
            <IconButton
              style={buttonStyle}
              color="primary"
              onClick={openPostFormModal}
            >
              <PostAddIcon />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="success"
              onClick={openFileUploadModal}
            >
              <UploadFileIcon />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="warning"
              onClick={openFileDownloadModal}
            >
              <DownloadForOfflineIcon />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="info"
              onClick={openRegisterModal}
            >
              <PersonAddIcon />
            </IconButton>
          </>
        ) : tipoUsuario === "user" ? (
          <IconButton
            style={buttonStyle}
            color="secondary"
            onClick={openCalendarModal}
          >
            <CalendarTodayIcon />
          </IconButton>
        ) : null}
      </div>

      {/* Renderizar a lista de posts para todos os usuários */}
      <PostList />

      {/* Modals */}
      <Modal open={isPostFormOpen} onClose={closePostFormModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" sx={{ alignItems: "center" }}>
            Adicionar Post:
          </Typography>
          <PostForm closeModal={closePostFormModal} />
        </Box>
      </Modal>

      <Modal open={isCalendarOpen} onClose={closeCalendarModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Calendário
          </Typography>
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
            Upload
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
          <Typography variant="h6" component="h2">
            Download
          </Typography>
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
          <Typography variant="h6" component="h2">
            Registrar Novo Usuário
          </Typography>
          <Register />
          <Button
            variant="outlined"
            onClick={closeRegisterModal}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Botão de Logout */}
      <Button onClick={handleLogout} variant="contained" color="secondary">
        Logout
      </Button>
    </div>
  );
};

export default App;
