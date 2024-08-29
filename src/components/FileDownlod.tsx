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
} from "@mui/material";

const FileList: React.FC = () => {
  const [files, setFiles] = useState<{ filename: string; path: string }[]>([]);
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

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
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
        <List>
          {files.map((file) => (
            <ListItem key={file.filename}>
              <ListItemText
                primary={
                  <Link
                    href={`http://localhost:3001${file.path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                  >
                    {file.filename}
                  </Link>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileList;
