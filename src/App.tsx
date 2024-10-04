import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./components/UserContext";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import CalendarAniversario from "./components/CalendarAniversario";
import CalendarFeria from "./components/CalendarFerias";
import CalendarComponent from "./components/Calendar";
import FileUploadComponent from "./components/FileUpload";
import FileDownloadComponent from "./components/FileDownlod";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NavBar from "./components/NavBar";
import Register from "./components/RegisterUser";
import Groups2Icon from "@mui/icons-material/Groups2";
import PlaylistAddCircleIcon from "@mui/icons-material/PlaylistAddCircle";
import axios from "axios";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";

interface Suggestion {
  nomeUsuario: string;
  titulo: string;
  conteudo: string;
  createdAt: string;
}

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
  margin: "-1.2px",
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isFileDownloadOpen, setIsFileDownloadOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openSuggestionForm, setOpenSuggestionForm] = useState(false);
  const [openSuggestionList, setOpenSuggestionList] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionData, setSuggestionData] = useState({
    nomeUsuario: "",
    titulo: "",
    conteudo: "",
  });

  const { tipoUsuario, setTipoUsuario } = useUserContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarType, setCalendarType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const storedTipoUsuario = localStorage.getItem("tipoUsuario");

      if (storedTipoUsuario) {
        setTipoUsuario(storedTipoUsuario);
        navigate("/main");
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

  const handleSubmitSuggestion = async () => {
    try {
      await axios.post(`${baseURL}/suggestions`, {
        nomeUsuario: suggestionData.nomeUsuario || "Anônimo",
        titulo: suggestionData.titulo,
        conteudo: suggestionData.conteudo,
        userId: localStorage.getItem("userId") || null,
      });
      setOpenSuggestionForm(false);
    } catch (error) {
      console.error("Erro ao enviar sugestão", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${baseURL}/suggestions`);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Erro ao buscar sugestões", error);
    }
  };

  useEffect(() => {
    if (openSuggestionList && tipoUsuario === "admin") {
      fetchSuggestions();
    }
  }, [openSuggestionList, tipoUsuario]);

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
              <PostAddIcon style={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="success"
              onClick={() => setIsFileUploadOpen(true)}
            >
              <UploadFileIcon style={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="warning"
              onClick={() => setIsFileDownloadOpen(true)}
            >
              <DownloadForOfflineIcon style={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="info"
              onClick={() => setIsRegisterOpen(true)}
            >
              <PersonAddIcon style={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              color="secondary"
              onClick={handleCalendarClick}
            >
              <CalendarTodayIcon style={{ fontSize: 32 }} />
            </IconButton>
            <IconButton
              style={buttonStyle}
              onClick={() => setOpenSuggestionList(true)}
            >
              <Groups2Icon sx={{ fontSize: 37, color: "#FFB900" }} />
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
            <IconButton
              style={buttonStyle}
              onClick={() => setOpenSuggestionForm(true)}
            >
              <PlaylistAddCircleIcon sx={{ fontSize: 36, color: "#FFB900" }} />
            </IconButton>
          </>
        ) : null}
      </div>

      <PostList />

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

      {/* Modal para formulário de sugestões */}
      <Dialog
        open={openSuggestionForm}
        onClose={() => setOpenSuggestionForm(false)}
      >
        <DialogContent>
          <Typography variant="h6" sx={{ paddingBottom: 5, color: "#0B68A9" }}>
            Deixe sua sugestão para a empresa!
          </Typography>
          <TextField
            label="Nome (Opcional)"
            fullWidth
            value={suggestionData.nomeUsuario}
            onChange={(e) =>
              setSuggestionData({
                ...suggestionData,
                nomeUsuario: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Título da Sugestão"
            fullWidth
            value={suggestionData.titulo}
            onChange={(e) =>
              setSuggestionData({
                ...suggestionData,
                titulo: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Conteúdo"
            fullWidth
            multiline
            rows={4}
            value={suggestionData.conteudo}
            onChange={(e) =>
              setSuggestionData({
                ...suggestionData,
                conteudo: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuggestionForm(false)}>Cancelar</Button>
          <Button onClick={handleSubmitSuggestion} color="primary">
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para exibir sugestões (somente admin) */}
      <Dialog
        open={openSuggestionList}
        onClose={() => setOpenSuggestionList(false)}
      >
        <DialogContent>
          <Typography variant="h6">Sugestões dos Colaboradores</Typography>
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1">{suggestion.titulo}</Typography>
                <Typography variant="body2">{suggestion.conteudo}</Typography>
                <Typography variant="caption">
                  Sugestão de: {suggestion.nomeUsuario || "Anônimo"} -{" "}
                  {new Date(suggestion.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>Nenhuma sugestão disponível</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuggestionList(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
