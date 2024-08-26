import React, { useState, useEffect } from "react";
import axios from "axios";

const FileList: React.FC = () => {
  const [files, setFiles] = useState<{ filename: string; path: string }[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:3001/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Erro ao carregar arquivos", error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h2>Arquivos Disponíveis para Download</h2>
      <ul>
        {files.map((file) => (
          <li key={file.filename}>
            <a
              href={`http://localhost:3001${file.path}`}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.filename}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
