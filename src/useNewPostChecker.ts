import { useEffect } from "react";

const useNewPostChecker = (
  fetchPostsWithComments: (page: number) => Promise<void>,
  openSnackbar: (message: string) => void,
  currentPage: number // Inclui o currentPage
) => {
  const fetchNewPosts = async () => {
    try {
      // Chama diretamente a função que busca posts
      await fetchPostsWithComments(currentPage);
      openSnackbar("Post's Atualizados!");
    } catch (error) {
      console.error("Erro ao buscar novos posts:", error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNewPosts(); // Atualiza os posts quando a aba volta ao foco
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentPage, fetchPostsWithComments]);

  return null; // O hook não retorna nada visualmente
};

export default useNewPostChecker;
