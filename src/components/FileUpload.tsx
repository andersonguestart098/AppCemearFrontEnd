// src/components/FileUploadComponent.tsx
import React, { useState } from "react";
import axios from "axios";

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Limpa erros ao selecionar um novo arquivo
    }
  };

  const onUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Arquivo enviado com sucesso!");
      setFile(null); // Limpa o arquivo após o upload
    } catch (err) {
      console.error("Erro ao enviar arquivo", err);
      setError("Erro ao enviar arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload de Arquivos</h2>
      <input type="file" onChange={onFileChange} />
      <button onClick={onUpload} disabled={uploading}>
        {uploading ? "Enviando..." : "Enviar Arquivo"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default FileUploadComponent;
