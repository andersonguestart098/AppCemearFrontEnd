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
  Grid,
  Popover,
} from "@mui/material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { useUserContext } from "./UserContext";

interface Vacation {
  id: number;
  name: string;
  startDate: string;
  returnDate: string;
}

interface VacationCalendarProps {
  closeCalendarModal: () => void; // Prop para fechar o modal
}

const VacationCalendar: React.FC<VacationCalendarProps> = ({
  closeCalendarModal,
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(
    null
  );
  const { tipoUsuario } = useUserContext();

  const handleAddVacation = async () => {
    if (name.trim() !== "" && startDate !== "" && returnDate !== "") {
      const newVacation = { name, startDate, returnDate };
      try {
        const response = await axios.post(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/ferias",
          newVacation
        );
        setVacations([...vacations, { ...newVacation, id: response.data.id }]);
        setName("");
        setStartDate("");
        setReturnDate("");
      } catch (error) {
        console.error("Erro ao adicionar registro de férias:", error);
      }
    }
  };

  const truncateName = (name: string) => {
    return name.length > 3 ? name.substring(0, 3) + "..." : name;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    return vacations.some(
      (vacation) =>
        formatDate(vacation.startDate) === dateString ||
        formatDate(vacation.returnDate) === dateString
    )
      ? "highlight"
      : "";
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split("T")[0];
    const vacation = vacations.find(
      (vacation) =>
        formatDate(vacation.startDate) === dateString ||
        formatDate(vacation.returnDate) === dateString
    );
    return vacation ? (
      <div
        onClick={(e) => handleClick(e, vacation)}
        style={{
          cursor: "pointer",
          color: "#ffffff",
          backgroundColor:
            formatDate(vacation.startDate) === dateString
              ? "#00C853"
              : "#FF5252",
          padding: "4px 8px",
          borderRadius: "8px",
          fontSize: "12px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <BeachAccessIcon sx={{ color: "#fff", fontSize: "20px" }} />
        <span>{truncateName(vacation.name)}</span>
      </div>
    ) : null;
  };

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectedVacation: Vacation
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVacation(selectedVacation);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedVacation(null);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchVacations = async () => {
      try {
        const response = await axios.get(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/ferias"
        );
        const formattedVacations = response.data.map((vacation: any) => ({
          ...vacation,
          startDate: formatDate(vacation.startDate),
          returnDate: formatDate(vacation.returnDate),
        }));
        setVacations(formattedVacations);
      } catch (error) {
        console.error("Erro ao carregar registros de férias:", error);
      }
    };
    fetchVacations();
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
          Calendário de Férias
        </Typography>
      </Box>

      <Box
        sx={{
          border: "2px solid #64b5f6",
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome do Colaborador"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Data de Início"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Data de Retorno"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1565c0",
              marginTop: "16px",
              "&:hover": { backgroundColor: "#003c8f" },
            }}
            fullWidth
            onClick={handleAddVacation}
          >
            Adicionar Férias
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
          onClick={closeCalendarModal} // Passando a prop closeCalendarModal
          sx={{
            width: "100%",
            maxWidth: "200px",
          }}
        >
          Fechar
        </Button>
      </Box>

      <Popover
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
            {selectedVacation
              ? `${selectedVacation.name}: Início em ${selectedVacation.startDate}, Retorno em ${selectedVacation.returnDate}`
              : "Nenhuma informação disponível."}
          </Typography>
        </Box>
      </Popover>
    </Container>
  );
};

export default VacationCalendar;
