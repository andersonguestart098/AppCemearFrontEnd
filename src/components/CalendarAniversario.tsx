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
import { useUserContext } from "./UserContext";
import BalloonIcon from "@mui/icons-material/Cake"; // Ícone de balão
import CelebrationIcon from "@mui/icons-material/Celebration"; // Ícone de celebração (parece um balão)

interface Birthday {
  id: number;
  date: string;
  name: string;
}

const BirthdayCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [name, setName] = useState<string>(""); // Nome do aniversariante
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(
    null
  );

  const { tipoUsuario } = useUserContext();

  // Função para adicionar um aniversariante
  const handleAddBirthday = async () => {
    if (date && name.trim() !== "") {
      const newBirthday = { date: date.toISOString().split("T")[0], name };
      try {
        const response = await axios.post(
          "https://cemear-b549eb196d7c.herokuapp.com/aniversarios", // Endpoint de aniversariantes
          newBirthday
        );
        setBirthdays([...birthdays, { ...newBirthday, id: response.data.id }]);
        setName("");
      } catch (error) {
        console.error("Erro ao adicionar aniversariante:", error);
      }
    }
  };

  // Função para truncar o nome do aniversariante
  const truncateName = (name: string) => {
    return name.length > 3 ? name.substring(0, 3) + "..." : name;
  };

  // Função para marcar datas com aniversariantes
  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    return birthdays.some((birthday) => birthday.date === dateString)
      ? "highlight"
      : "";
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    const birthday = birthdays.find((birthday) => birthday.date === dateString);
    return birthday ? (
      <div
        onClick={(e) => handleClick(e, birthday)}
        style={{
          cursor: "pointer",
          color: "#000", // Texto preto
          backgroundColor: "#FFCDD2", // Vermelho fraquinho
          padding: "6px 6px", // Ajustar o padding para caber melhor
          borderRadius: "8px",
          fontSize: "12px",
          height: "100%", // Aumentar a altura da célula
          width: "100%", // Garantir que o ícone e o nome se ajustem ao tamanho da célula
          display: "flex",
          flexDirection: "column", // Colocar ícone e nome em colunas
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <BalloonIcon sx={{ color: "red", fontSize: "20px" }} />{" "}
        {/* Ícone de balão */}
        <span>{truncateName(birthday.name)}</span>
      </div>
    ) : null;
  };

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedBirthday: Birthday
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBirthday(selectedBirthday);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedBirthday(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await axios.get(
          "https://cemear-b549eb196d7c.herokuapp.com/aniversarios" // Endpoint de aniversariantes
        );
        setBirthdays(response.data);
      } catch (error) {
        console.error("Erro ao carregar aniversariantes:", error);
      }
    };
    fetchBirthdays();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ color: "#1565c0" }}>
          Calendário de Aniversariantes
        </Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mb={4}
        sx={{
          border: "2px solid #FFCDD2", // Borda vermelha fraquinha
          borderRadius: "12px",
          padding: "16px",
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
          tileDisabled={({ date }) => date.getDate() === 0} // Desativar as células de datas inválidas
        />
      </Box>
      {tipoUsuario === "admin" && (
        <Box mb={4}>
          <TextField
            label="Nome do aniversariante"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ marginBottom: "16px" }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1565c0",
              "&:hover": { backgroundColor: "#003c8f" },
            }}
            onClick={handleAddBirthday}
            fullWidth
          >
            Adicionar Aniversariante
          </Button>
        </Box>
      )}

      {/* Popover para mostrar o nome completo do aniversariante */}
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
            {selectedBirthday?.name || "Nenhum nome disponível."}
          </Typography>
        </Box>
      </Popover>
    </Container>
  );
};

export default BirthdayCalendar;
