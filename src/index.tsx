import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import Login from "./components/Login";
import App from "./App";
import "./index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Função para verificar se o usuário está autenticado
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// Componente de proteção de rota
const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function AppRouting() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<ProtectedRoute element={<App />} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <UserProvider>
      <AppRouting />
    </UserProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// Registrar o Service Worker
serviceWorkerRegistration.register();
