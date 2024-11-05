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

interface Birthday {
  id: number;
  date: string;
  name: string;
}

interface BirthdayCalendarProps {
  closeCalendarModal: () => void; // Prop para fechar o modal
}

const BirthdayCalendar: React.FC<BirthdayCalendarProps> = ({
  closeCalendarModal,
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [name, setName] = useState<string>(""); // Nome do aniversariante
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(
    null
  );

  const { tipoUsuario } = useUserContext();

  const handleAddBirthday = async () => {
    if (date && name.trim() !== "") {
      const newBirthday = { date: date.toISOString().split("T")[0], name };
      try {
        const response = await axios.post(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/aniversarios", // Endpoint de aniversariantes
          newBirthday
        );
        setBirthdays([...birthdays, { ...newBirthday, id: response.data.id }]);
        setName("");
      } catch (error) {
        console.error("Erro ao adicionar aniversariante:", error);
      }
    }
  };

  const truncateName = (name: string) => {
    return name.length > 3 ? name.substring(0, 3) + "..." : name;
  };

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
          color: "#000",
          backgroundColor: "#FFCDD2",
          padding: "4px 6px",
          borderRadius: "3px",
          fontSize: "12px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <BalloonIcon sx={{ color: "red", fontSize: "20px" }} />
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

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedBirthday(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await axios.get(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/aniversarios"
        );
        setBirthdays(response.data);
      } catch (error) {
        console.error("Erro ao carregar aniversariantes:", error);
      }
    };
    fetchBirthdays();
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
      <Box textAlign="center" mb={2}>
        <Typography variant="h4" gutterBottom sx={{ color: "#1565c0" }}>
          Calendário de Aniversariantes
        </Typography>
      </Box>

      <Box
        sx={{
          border: "2px solid #FFCDD2",
          borderRadius: "12px",
          padding: "16px",
          width: "100%",
          flexGrow: 1,
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
        <Box mb={4} mt={2}>
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

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
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
