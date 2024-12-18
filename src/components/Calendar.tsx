import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Popover,
} from "@mui/material";
import { useUserContext } from "./UserContext"; // Importe o hook do UserContext

interface Event {
  id: number;
  date: string;
  descricao: string;
}

interface EventCalendarProps {
  closeCalendarModal: () => void; // Prop para fechar o modal
}

const CalendarComponent: React.FC<EventCalendarProps> = ({
  closeCalendarModal,
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [descricao, setDescricao] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { tipoUsuario } = useUserContext(); // Obtenha o tipo de usuário do contexto

  // Função para adicionar um evento
  const handleAddEvent = async () => {
    if (date && descricao.trim() !== "") {
      const newEvent = { date: date.toISOString().split("T")[0], descricao };
      try {
        const response = await axios.post(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/events",
          newEvent
        );
        setEvents([...events, { ...newEvent, id: response.data.id }]);
        setDescricao("");
      } catch (error) {
        console.error("Erro ao adicionar evento:", error);
      }
    }
  };

  // Função para marcar datas com eventos
  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    return events.some((event) => event.date === dateString) ? "highlight" : "";
  };

  // Função para truncar descrições longas
  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    const event = events.find((event) => event.date === dateString);
    return event ? (
      <div
        onClick={(e) => handleClick(e, event)}
        style={{
          cursor: "pointer",
          color: "#ffffff",
          backgroundColor: "#f57c00",
          padding: "4px 8px",
          borderRadius: "8px",
          fontSize: "12px",
          width: "100%", // Garantir que o texto preencha a célula
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <span>{truncateText(event.descricao, 3)}</span>
      </div>
    ) : null;
  };

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedEvent: Event
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(selectedEvent);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/events"
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflowY: "auto",
        padding: "10px",
      }}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ color: "#1565c0" }}>
          Calendário Cemear
        </Typography>
      </Box>
      <Box
        sx={{
          border: "2px solid #f57c00",
          borderRadius: "12px",
          padding: "16px",
          width: "100%", // Certificar-se de que o calendário use 100% da largura disponível
        }}
      >
        <Calendar
          onChange={(newValue) => {
            if (Array.isArray(newValue)) {
              setDate(newValue[0] || null);
            } else {
              setDate(newValue);
            }
          }}
          value={date}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="responsive-calendar"
        />
      </Box>
      {tipoUsuario === "admin" && (
        <Box mb={4}>
          <TextField
            label="Descrição do evento"
            variant="outlined"
            fullWidth
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={{ marginBottom: "16px" }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1565c0",
              "&:hover": { backgroundColor: "#003c8f" },
            }}
            onClick={handleAddEvent}
            fullWidth
          >
            Adicionar Evento
          </Button>
        </Box>
      )}
      {/* Botão de fechar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "16px",
        }}
      >
        <Button
          variant="outlined"
          onClick={closeCalendarModal}
          sx={{
            width: "100%",
            maxWidth: "200px",
          }}
        >
          Fechar
        </Button>
      </Box>
      {/* Popover para mostrar a descrição completa do evento */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2}>
          <Typography variant="body1">
            {selectedEvent?.descricao || "Nenhuma descrição disponível."}
          </Typography>
        </Box>
      </Popover>
    </Container>
  );
};

export default CalendarComponent;
