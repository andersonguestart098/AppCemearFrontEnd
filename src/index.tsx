// src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Permissão para notificações concedida.");
        } else {
          console.log("Permissão para notificações negada.");
        }
      })
      .catch((error) => {
        console.error("Erro ao solicitar permissão para notificações:", error);
      });
  } else {
    console.warn("Este navegador não suporta notificações.");
  }
}

// Chame essa função quando apropriado, como em um botão ou ao carregar o site
requestNotificationPermission();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Registrar o Service Worker
serviceWorkerRegistration.register();
