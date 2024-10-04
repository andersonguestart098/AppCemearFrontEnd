import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const SuggestionList: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get("/api/suggestions");
        setSuggestions(response.data);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f0f4f8",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 4,
          color: "#0B68A9",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Sugestões dos Colaboradores
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#0B68A9", fontWeight: "bold" }}>
                Título
              </TableCell>
              <TableCell sx={{ color: "#0B68A9", fontWeight: "bold" }}>
                Nome do Usuário
              </TableCell>
              <TableCell sx={{ color: "#0B68A9", fontWeight: "bold" }}>
                Conteúdo
              </TableCell>
              <TableCell sx={{ color: "#0B68A9", fontWeight: "bold" }}>
                Data de Envio
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions.map((suggestion) => (
              <TableRow key={suggestion.id}>
                <TableCell>{suggestion.titulo}</TableCell>
                <TableCell>
                  {suggestion.nomeUsuario === "Anônimo"
                    ? "Enviado de forma anônima"
                    : suggestion.nomeUsuario}
                </TableCell>
                <TableCell>{suggestion.conteudo}</TableCell>
                <TableCell>
                  {new Date(suggestion.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SuggestionList;
