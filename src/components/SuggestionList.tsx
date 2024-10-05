import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import axios from "axios";

const SuggestionList: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get("/suggestions");
        setSuggestions(response.data);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setLoading(false); // Para o loading quando os dados são carregados
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          marginBottom: 4,
          color: "#0B68A9",
          fontWeight: "bold",
          textAlign: "center",
          letterSpacing: "0.5px",
        }}
      >
        Sugestões dos Colaboradores
      </Typography>

      <Grid container spacing={3}>
        {suggestions.map((suggestion) => (
          <Grid item xs={12} sm={6} md={4} key={suggestion.id}>
            <Card
              sx={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)", // Pequeno efeito de hover para dar dinamismo
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#0B68A9", mb: 2 }}
                >
                  {suggestion.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {suggestion.nomeUsuario === "Anônimo"
                    ? "Enviado de forma anônima"
                    : `Enviado por: ${suggestion.nomeUsuario}`}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    lineHeight: 1.6,
                    height: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {suggestion.conteudo}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" sx={{ color: "#0B68A9" }}>
                  Ver mais
                </Button>
                <Typography
                  variant="caption"
                  sx={{ marginLeft: "auto", paddingRight: 2 }}
                  color="text.secondary"
                >
                  {new Date(suggestion.createdAt).toLocaleString()}
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SuggestionList;
