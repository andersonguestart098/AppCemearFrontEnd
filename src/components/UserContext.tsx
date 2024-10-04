import React from "react";

// Atualize a interface do contexto para incluir o userId e setUserId
interface UserContextType {
  tipoUsuario: string | null;
  setTipoUsuario: (tipo: string | null) => void;
  userId: string | null; // Adiciona o userId
  setUserId: (id: string | null) => void; // Função para atualizar o userId
}

// Cria o contexto
const UserContext = React.createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [tipoUsuario, setTipoUsuario] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null); // Adiciona o estado para userId

  return (
    <UserContext.Provider
      value={{ tipoUsuario, setTipoUsuario, userId, setUserId }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar o contexto
export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
