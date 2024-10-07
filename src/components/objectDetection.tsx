import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const ObjectDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  // Carrega o modelo YOLO ou MobileNet
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await tf.loadGraphModel('/path_to_yolo_model/model.json'); // Coloque o caminho correto para o seu modelo
        setModel(model);
      } catch (error) {
        console.error('Erro ao carregar o modelo:', error);
      }
    };
    loadModel();
  }, []);

  // Inicia o stream da câmera
  useEffect(() => {
    const startVideo = async () => {
      if (navigator.mediaDevices && videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    };
    startVideo();
  }, []);

  // Executa a detecção de objetos
  const detectObjects = async () => {
    if (model && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const tensor = tf.browser.fromPixels(video).expandDims(0);

      try {
        // Faz a predição (detecção)
        const predictions = await model.predict(tensor) as any;  // Ajustar o tipo baseado no modelo

        // Desenha as caixas delimitadoras
        const context = canvasRef.current?.getContext('2d');
        if (context && predictions) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          predictions.forEach((prediction: any) => {
            const [x, y, width, height] = prediction.bbox;
            context.strokeStyle = '#00FF00';
            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
          });
        }
      } catch (error) {
        console.error('Erro na detecção:', error);
      }
    }
  };

  // Loop de detecção contínua
  useEffect(() => {
    const intervalId = setInterval(() => {
      detectObjects();
    }, 100);  // Intervalo para detecção em tempo real

    return () => clearInterval(intervalId);
  }, [model]);

  return (
    <div style={{ position: 'relative' }}>
      <video ref={videoRef} autoPlay style={{ display: 'block', width: '100%' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default ObjectDetection;
