import React, { useState, useEffect } from "react";
import { Button, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PostForm from "../components/PostForm";
import PostList from "../components/PostList";
import CalendarComponent from "../components/Calendar";
import FileUploadComponent from "../components/FileUpload";
import FileDownloadComponent from "../components/FileDownlod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Register from "../components/RegisterUser";
import { useUserContext } from "../components/UserContext"; // Importando o UserContext

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
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const navigate = useNavigate();
  const { tipoUsuario } = useUserContext();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);

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
    setIsAuthenticated(false);
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null; // Opcionalmente, um spinner ou algo semelhante aqui
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h1" gutterBottom>
        Post's
      </Typography>

      <div>
        {/* Renderização condicional baseada no tipo de usuário */}
        {tipoUsuario === "admin" && (
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
        )}

        {tipoUsuario === "user" && (
          <IconButton
            style={buttonStyle}
            color="secondary"
            onClick={openCalendarModal}
          >
            <CalendarTodayIcon />
          </IconButton>
        )}
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
            Upload de Arquivos
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
            Download de Arquivos
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
          <Register closeModal={closeRegisterModal} />
        </Box>
      </Modal>

      <Button onClick={handleLogout} variant="contained" color="secondary">
        Logout
      </Button>
    </div>
  );
};

export default App;
