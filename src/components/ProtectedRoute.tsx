import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, useUserContext } from "../components/UserContext";
import Login from "../components/Login";
import App from "../App";
import "./index.css";
import * as serviceWorkerRegistration from "../serviceWorkerRegistration";

// Componente para proteger rotas privadas
const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { tipoUsuario } = useUserContext();
  const isAuthenticated = !!localStorage.getItem("token");

  if (tipoUsuario === null) {
    return <div>Loading...</div>; // Ou um spinner de carregamento
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
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
