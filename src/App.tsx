import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import CalendarComponent from "./components/Calendar";
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { Button } from "@mui/material";

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

  const openPostFormModal = () => setIsPostFormOpen(true);
  const closePostFormModal = () => setIsPostFormOpen(false);

  const openCalendarModal = () => setIsCalendarOpen(true);
  const closeCalendarModal = () => setIsCalendarOpen(false);

  const openFileUploadModal = () => setIsFileUploadOpen(true);
  const closeFileUploadModal = () => setIsFileUploadOpen(false);

  const openFileDownloadModal = () => setIsFileDownloadOpen(true);
  const closeFileDownloadModal = () => setIsFileDownloadOpen(false);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <Typography variant="h1" gutterBottom>
        Mural de Postagens
      </Typography>

      <div>
        {/* Botões circulares com ícones */}
        <IconButton
          style={buttonStyle}
          color="primary"
          onClick={openPostFormModal}
        >
          <PostAddIcon />
        </IconButton>
        <IconButton
          style={buttonStyle}
          color="secondary"
          onClick={openCalendarModal}
        >
          <CalendarTodayIcon />
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
      </div>

      <PostList />

      {/* Modal para o formulário de postagem */}
      <Modal open={isPostFormOpen} onClose={closePostFormModal}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Formulário de Postagem
          </Typography>
          <PostForm closeModal={closePostFormModal} />
          <Button
            variant="outlined"
            onClick={closePostFormModal}
            style={{ marginTop: "10px" }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Modal para o Calendário */}
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

      {/* Modal para Upload de Arquivos */}
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

      {/* Modal para Download de Arquivos */}
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
    </div>
  );
};

export default App;
