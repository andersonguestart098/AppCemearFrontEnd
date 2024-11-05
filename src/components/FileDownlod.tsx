import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";

// Função para retornar o ícone apropriado para o arquivo
const renderFileIcon = (type: string) => {
  if (type.includes("pdf")) {
    return <PictureAsPdfIcon sx={{ fontSize: 60, color: "#D32F2F" }} />;
  } else if (type.includes("image")) {
    return <ImageIcon sx={{ fontSize: 60, color: "#1976D2" }} />;
  } else {
    return <InsertDriveFileIcon sx={{ fontSize: 60, color: "#757575" }} />;
  }
};

const FileList: React.FC = () => {
  const [files, setFiles] = useState<
    {
      filename: string;
      path: string;
      type: string;
      size: string;
      createdAt: string;
    }[] // Inclui o campo 'createdAt' (ou equivalente) com a data de criação
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "https://cemear-testes-443a098c8bb8.herokuapp.com/files"
        );

        // Ordena os arquivos pela data (createdAt) do mais recente para o mais antigo
        const sortedFiles = response.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setFiles(sortedFiles);
      } catch (error) {
        console.error("Erro ao carregar arquivos", error);
        setError("Erro ao carregar arquivos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Arquivos:
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box
          sx={{
            height: 350, // Limita a altura da lista
            overflowY: "auto", // Habilita o scroll vertical
          }}
        >
          <List>
            {files.map((file) => (
              <ListItem key={file.filename} sx={{ mb: 2 }}>
                <Card sx={{ display: "flex", width: "100%" }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", padding: 2 }}
                  >
                    {renderFileIcon(file.type)}
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        <Link
                          href={file.path} // Use o caminho absoluto fornecido pelo Cloudinary
                          download={file.filename} // Garante o download do arquivo
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                          underline="hover"
                        >
                          {file.filename}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {file.type} • {file.size}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(file.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {/* Formata a data */}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileList;
