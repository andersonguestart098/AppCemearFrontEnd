import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const YoloDetectionComponent: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Função para lidar com a mudança de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setImageURL(URL.createObjectURL(e.target.files[0]));
      setError(null); // Limpar qualquer erro anterior
    }
  };

  // Função para fazer o upload da imagem e obter as detecções
  const handleUpload = async () => {
    if (!selectedImage) {
      setError("Por favor, selecione uma imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Faz o upload da imagem e captura os resultados
      const response = await axios.post(
        "http://localhost:5000/yolo-detection",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Imagem enviada com sucesso!");
      setSelectedImage(null); // Limpa a seleção da imagem após o upload
      setDetections(response.data); // Armazena os resultados da detecção
      drawBoundingBoxes(response.data); // Desenha as caixas na imagem
    } catch (err) {
      console.error("Erro ao enviar a imagem", err);
      setError("Erro ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
      setOpenSnackbar(true);
    }
  };

  // Função para desenhar as caixas delimitadoras na imagem
  const drawBoundingBoxes = (detections: any[]) => {
    const canvas = canvasRef.current;
    const image = new Image();

    if (!canvas || !imageURL) return;

    const context = canvas.getContext("2d");

    image.src = imageURL;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;

      // Desenhar a imagem no canvas
      context?.drawImage(image, 0, 0, image.width, image.height);

      // Desenhar as bounding boxes
      detections.forEach((detection) => {
        const { xmin, ymin, xmax, ymax, name } = detection;
        context!.strokeStyle = "red"; // Cor da caixa
        context!.lineWidth = 2;
        context!.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin); // Desenha a caixa

        // Desenhar o nome do objeto detectado
        context!.fillStyle = "red";
        context!.font = "18px Arial";
        context!.fillText(name, xmin, ymin > 10 ? ymin - 5 : ymin + 15); // Posicionar o texto acima da caixa
      });
    };
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Capturar Imagem para Processamento YOLO
      </Typography>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button variant="outlined" component="span">
          {selectedImage ? selectedImage.name : "Selecionar Imagem"}
        </Button>
      </label>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading}
        sx={{ ml: 2 }}
      >
        {uploading ? <CircularProgress size={24} /> : "Enviar"}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Exibir imagem e caixas delimitadoras */}
      {imageURL && (
        <Box sx={{ mt: 4, position: "relative", textAlign: "center" }}>
          <img
            src={imageURL}
            alt="Imagem Selecionada"
            style={{ maxWidth: "100%" }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              maxWidth: "100%",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default YoloDetectionComponent;
