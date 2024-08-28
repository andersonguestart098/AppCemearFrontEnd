// Routing.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import App from "../App";
import { useUserContext } from "./UserContext";

// Função para verificar se o usuário está autenticado
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Componente para proteger rotas privadas
const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const Routing: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<ProtectedRoute element={<App />} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default Routing;
