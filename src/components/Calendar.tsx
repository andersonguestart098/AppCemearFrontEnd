import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Importa o CSS do calendário
import axios from "axios";

interface Event {
  id: number;
  date: string;
  descricao: string;
}

const CalendarComponent: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [descricao, setDescricao] = useState<string>("");

  // Função para adicionar um evento
  const handleAddEvent = async () => {
    if (date && descricao.trim() !== "") {
      const newEvent = { date: date.toISOString().split("T")[0], descricao };
      try {
        const response = await axios.post(
          "http://localhost:3001/events",
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
      <div className="event-description">
        <span>{event.descricao}</span>
      </div>
    ) : null;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3001/events");
        setEvents(response.data); // Atualiza o estado com os eventos carregados
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Calendário Personalizado</h2>
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
      />
      <div>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do evento"
        />
        <button onClick={handleAddEvent}>Adicionar Evento</button>
      </div>
    </div>
  );
};

export default CalendarComponent;
