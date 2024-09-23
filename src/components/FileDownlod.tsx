import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  List,
  ListItem,
  Link,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";

const FileList: React.FC = () => {
  const [files, setFiles] = useState<
    { filename: string; path: string; type: string; size: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:3001/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Erro ao carregar arquivos", error);
        setError("Erro ao carregar arquivos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

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
                          onClick={(e) => {
                            e.preventDefault(); // Previne a abertura da nova página
                            const link = document.createElement("a");
                            link.href = file.path; // URL completa do arquivo
                            link.setAttribute("download", file.filename); // Define o nome do arquivo para download
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          }}
                        >
                          {file.filename}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {file.type} • {file.size}
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
