// UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface UserContextType {
  tipoUsuario: string;
  setTipoUsuario: (tipo: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [tipoUsuario, setTipoUsuario] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Simulação de decodificação do token. Ajuste conforme necessário.
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setTipoUsuario(decodedToken.user.tipoUsuario); // Ajuste conforme a estrutura do token
    }
  }, []);

  return (
    <UserContext.Provider value={{ tipoUsuario, setTipoUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
