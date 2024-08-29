import React from "react";

interface UserContextType {
  tipoUsuario: string | null;
  setTipoUsuario: (tipo: string | null) => void;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode; // Adicione o tipo para children
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [tipoUsuario, setTipoUsuario] = React.useState<string | null>(null);

  return (
    <UserContext.Provider value={{ tipoUsuario, setTipoUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
