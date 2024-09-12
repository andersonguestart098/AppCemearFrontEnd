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

const CalendarComponent: React.FC = () => {
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
          "https://cemear-b549eb196d7c.herokuapp.com/events",
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

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    const event = events.find((event) => event.date === dateString);
    return event ? (
      <div
        className="event-description"
        onClick={(e) => handleClick(e, event)}
        style={{ cursor: "pointer" }}
      >
        <span>{event.descricao}</span>
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
          "https://cemear-b549eb196d7c.herokuapp.com/events"
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom>
          Calendário Cemear
        </Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mb={4}
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
            style={{ marginBottom: 16 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddEvent}
            fullWidth
          >
            Adicionar Evento
          </Button>
        </Box>
      )}

      {/* Popover para mostrar a descrição do evento */}
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
