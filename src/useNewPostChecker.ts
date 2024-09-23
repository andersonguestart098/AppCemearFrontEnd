import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const baseURL = "http://localhost:3001"; // URL da API

const useNewPostChecker = (setPosts: (posts: any[]) => void) => {
  const fetchNewPosts = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts`);
      setPosts(response.data);
      toast.info("Atualizando Post's...");
    } catch (error) {
      console.error("Erro ao buscar novos posts:", error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // O app foi reaberto
        fetchNewPosts();
      }
    };

    // Escuta o evento de visibilidade da aba
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Limpa o evento quando o componente é desmontado
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // Este hook não retorna nada visualmente
};

export default useNewPostChecker;
