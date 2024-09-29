import { useEffect } from "react";
import axios from "axios";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com"; // URL da API

// Agora, também recebemos um controle do Snackbar via props
const useNewPostChecker = (
  setPosts: (posts: any[]) => void,
  openSnackbar: (message: string) => void
) => {
  const fetchNewPosts = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts`);
      const postsArray = Array.isArray(response.data.posts) ? response.data.posts : [];
      setPosts(postsArray); // Garante que `setPosts` sempre recebe um array
      openSnackbar("Atualizando Post's..."); // Aqui você abre o Snackbar com a mensagem
    } catch (error) {
      console.error("Erro ao buscar novos posts:", error);
      setPosts([]); // Define posts como array vazio em caso de erro
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNewPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // Este hook não retorna nada visualmente
};

export default useNewPostChecker;
