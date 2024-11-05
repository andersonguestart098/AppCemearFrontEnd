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
import YoloDetection from "./components/YoloDetectionComponent";
import PowerBIReport from "./components/PowerBIReports";

const baseURL = "https://cemear-testes-443a098c8bb8.herokuapp.com";

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
    const fetchPowerBIAccessToken = async () => {
      try {
        // Chama o endpoint no backend para obter o token de autenticação do Power BI
        const response = await axios.get(`${baseURL}/auth/powerbi`);
        return response.data.accessToken; // Retorna o token de acesso
      } catch (error) {
        console.error("Erro ao obter token de acesso do Power BI", error);
        return null; // Retorna null em caso de erro
      }
    };

    const token = localStorage.getItem("token");

    if (token) {
      const storedTipoUsuario = localStorage.getItem("tipoUsuario");

      if (storedTipoUsuario) {
        setTipoUsuario(storedTipoUsuario);
        // Busca o token do Power BI após autenticação
        fetchPowerBIAccessToken().then((powerBIToken) => {
          if (powerBIToken) {
            // Armazena o token do Power BI no localStorage para uso futuro
            localStorage.setItem("powerBIToken", powerBIToken);
            navigate("/main"); // Navega para a página principal após salvar o token
          } else {
            console.error("Erro ao obter token do Power BI");
          }
        });
      }
    } else {
      navigate("/login"); // Redireciona para o login se não houver token
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

  const reportId = "7a202127-a5d0-48b7-b256-5b5f66be4f3c";

  const getPowerBIToken = async () => {
    try {
      console.log("Fazendo requisição para obter o token do Power BI...");

      // Fazendo a requisição para o backend
      const response = await axios.post(
        "https://cemear-testes-443a098c8bb8.herokuapp.com/getPowerBIToken"
      );

      console.log("Resposta recebida do backend:", response);

      if (response.data && response.data.token) {
        // Armazenando o token no localStorage
        localStorage.setItem("powerBIToken", response.data.token);
        console.log("Token do Power BI armazenado:", response.data.token);

        return response.data.token;
      } else {
        console.error("Erro: Token não encontrado na resposta");
        return null;
      }
    } catch (error: any) {
      console.error("Erro ao obter token do Power BI:", error);
      if (error.response) {
        console.error("Status do erro:", error.response.status);
        console.error("Detalhes do erro:", error.response.data);
      }
      return null;
    }
  };

  const getReports = async () => {
    const token = await getPowerBIToken(); // Obtendo o token do Power BI

    if (!token) {
      console.error("Token inválido ou não obtido");
      return;
    }

    try {
      console.log("Buscando relatórios do Power BI...");

      const response = await fetch(
        "https://api.powerbi.com/v1.0/myorg/reports",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Usando o token no header da requisição
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        console.error("Token inválido ou expirado. Erro 401 Unauthorized.");
        return;
      }

      const reports = await response.json();
      console.log("Relatórios do Power BI:", reports);
    } catch (error: any) {
      console.error("Erro ao buscar relatórios do Power BI:", error);
      if (error.response) {
        console.error("Status do erro:", error.response.status);
        console.error("Detalhes do erro:", error.response.data);
      }
    }
  };

  useEffect(() => {
    getReports(); // Chamando a função para buscar os relatórios ao montar o componente
  }, []);

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
            <PowerBIReport reportId={reportId} />
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
