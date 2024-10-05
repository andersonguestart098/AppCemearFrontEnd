import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  List,
  ListItem,
  Card,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  TextField,
  CircularProgress,
  Pagination,
  LinearProgress,
} from "@mui/material";
import SentimentVerySatisfiedSharpIcon from "@mui/icons-material/SentimentVerySatisfiedSharp";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AddCommentSharpIcon from "@mui/icons-material/AddCommentSharp";
import MarkUnreadChatAltSharpIcon from "@mui/icons-material/MarkUnreadChatAltSharp";
import CommentSection from "./CommentSection";
import ReactionMenu from "./ReactionMenu";
import ReactionList from "./ReactionList";
import CommentList from "./Comment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { debounce } from "lodash";
import { Snackbar } from "@mui/material";
import MarkChatReadSharpIcon from "@mui/icons-material/MarkChatReadSharp";
import useNewPostChecker from "../useNewPostChecker";
import PublishedWithChangesSharpIcon from "@mui/icons-material/PublishedWithChangesSharp";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./UserContext";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";
const socket = io(baseURL, { path: "/socket.io" });

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [newComment, setNewComment] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedReactionPost, setSelectedReactionPost] = useState<any>(null);
  const [commentListAnchorEl, setCommentListAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedCommentPost, setSelectedCommentPost] = useState<any>(null);
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitulo, setEditedTitulo] = useState<string>("");
  const [editedConteudo, setEditedConteudo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [reactionEmoji, setReactionEmoji] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { tipoUsuario, setTipoUsuario } = useUserContext();
  const navigate = useNavigate();
  const [openSuggestionForm, setOpenSuggestionForm] = useState(false);
  const [suggestionData, setSuggestionData] = useState({
    nomeUsuario: "",
    titulo: "",
    conteudo: "",
  });
  const postsPerPage = 10;

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${baseURL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar comentários", error);
      return [];
    }
  };

  const fetchPostsWithComments = useCallback(
    async (page: number) => {
      setLoadingPosts(true);
      console.log(`Fetching posts for page: ${page}`); // Verificar qual página está sendo solicitada

      try {
        // Faz a requisição para buscar os posts da página atual
        const response = await axios.get(`${baseURL}/posts`, {
          params: {
            page: page, // Página atual
            limit: postsPerPage, // Limite de posts por página
          },
        });

        // Verificar se a estrutura de resposta contém 'posts' diretamente ou dentro de um objeto
        const postsArray = Array.isArray(response.data.posts)
          ? response.data.posts
          : response.data;

        if (!postsArray || postsArray.length === 0) {
          console.warn("Nenhum post encontrado ou estrutura inesperada.");
          setPosts([]); // Define a lista como vazia se não houver posts
          return;
        }

        // Atualiza os posts preservando comentários de posts já existentes no estado
        setPosts((prevPosts) => {
          // Verifica e mantém os comentários já carregados
          const updatedPosts = postsArray.map((post: any) => {
            const existingPost = prevPosts.find((p) => p.id === post.id);
            if (existingPost) {
              // Mantém os comentários já carregados
              return { ...post, comments: existingPost.comments || [] };
            } else {
              // Retorna o post sem comentários, comentários serão buscados depois
              return { ...post, comments: [] };
            }
          });
          return updatedPosts;
        });

        // Agora, buscar comentários para posts que ainda não têm comentários carregados
        await Promise.all(
          postsArray.map(async (post: any) => {
            const existingPost = postsArray.find((p: any) => p.id === post.id);
            if (!existingPost.comments || existingPost.comments.length === 0) {
              try {
                const commentsResponse = await axios.get(
                  `${baseURL}/posts/${post.id}/comments`
                );
                const comments = commentsResponse.data;

                // Atualiza o post com os comentários obtidos
                setPosts((prevPosts) =>
                  prevPosts.map((p) =>
                    p.id === post.id ? { ...p, comments } : p
                  )
                );
              } catch (error) {
                console.error(
                  `Erro ao buscar comentários para o Post ${post.id}`,
                  error
                );
              }
            }
          })
        );

        setTotalPages(Math.ceil(response.data.total / postsPerPage)); // Total de páginas com base na resposta da API
      } catch (error) {
        console.error("Erro ao buscar postagens", error);
      } finally {
        setLoadingPosts(false);
        console.log("Carregamento de posts finalizado");
      }
    },
    [postsPerPage]
  );

  // useEffect para buscar os posts ao carregar a página
  useEffect(() => {
    fetchPostsWithComments(currentPage);

    // Socket para novos posts
    socket.on("new-post", (newPost) => {
      console.log("Novo post recebido via socket:", newPost);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      handleOpenSnackbar("Novo post adicionado!", "🆕");
    });

    // Socket para atualizações de reações
    socket.on("post-reaction-updated", (updatedPost) => {
      console.log("Reação de post atualizada via socket:", updatedPost);
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) =>
          post.id === updatedPost.id
            ? { ...post, reactions: updatedPost.reactions }
            : post
        );
        return updatedPosts;
      });
    });

    // Socket para deleção de posts
    socket.on("delete-post", () => {
      console.log("Post deletado via socket");
      fetchPostsWithComments(currentPage); // Atualiza os posts após a deleção
      handleOpenSnackbar("Post deletado!", "🗑️");
    });

    return () => {
      socket.off("new-post");
      socket.off("post-reaction-updated");
      socket.off("delete-post");
    };
  }, [currentPage, fetchPostsWithComments]);

  // Função para abrir o Snackbar com emoji
  // Função para abrir o Snackbar com emoji opcional
  // Função para abrir o Snackbar com emoji opcional
  const handleOpenSnackbar = (message: string, emoji: string = "") => {
    setSnackbarMessage(message);
    setReactionEmoji(emoji); // Define o emoji, pode ser vazio
    setOpenSnackbar(true);
  };

  // Função para fechar o Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Função de handleReaction adaptada para incluir o emoji
  const handleReaction = useCallback(
    async (reactionType: string) => {
      const start = performance.now();

      if (!selectedReactionPost) return;

      const token = localStorage.getItem("token");

      // Verifica se o token está presente e é válido
      if (!token) {
        handleOpenSnackbar("Token não encontrado, faça login novamente.", "❌");
        navigate("/login"); // Redireciona para a página de login
        return;
      }

      try {
        // Decodifica o token para verificar sua validade
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Se o token estiver expirado, redireciona para login
        if (decodedToken.exp < currentTime) {
          handleOpenSnackbar("Sessão expirada, faça login novamente.", "❌");
          localStorage.removeItem("token"); // Remove o token expirado
          navigate("/login"); // Redireciona para a página de login
          return;
        }

        const response = await axios.post(
          `${baseURL}/posts/${selectedReactionPost.id}/reaction`,
          { type: reactionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedReactionPost.id
              ? {
                  ...post,
                  reactions: response.data.reactions,
                  comments: post.comments,
                }
              : post
          )
        );

        // Define o emoji correspondente à reação
        const reactionEmoji =
          reactionType === "like"
            ? "👍"
            : reactionType === "love"
            ? "❤️"
            : reactionType === "haha"
            ? "😂"
            : "";

        handleOpenSnackbar(`Reagiu com ${reactionType}!`, reactionEmoji); // Exibe a mensagem com o emoji
        handleCloseReactionMenu();
      } catch (error) {
        handleOpenSnackbar("Erro ao adicionar reação.", "❌");
        console.error("Erro ao adicionar reação:", error);
      }

      const end = performance.now();
      console.log(`handleReaction levou ${end - start} ms`);
    },
    [selectedReactionPost, navigate]
  );

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setSelectedReactionPost(null);
  };
  // Only re-create the function if selectedReactionPost changes

  // Função para adicionar um comentário
  const handleAddComment = useCallback(async () => {
    const start = performance.now(); // Início da medição

    const token = localStorage.getItem("token");

    if (selectedPostId && newComment.trim()) {
      setLoading(true); // Ativa o loading antes de começar a requisição
      try {
        await axios.post(
          `${baseURL}/posts/${selectedPostId}/comments`,
          { content: newComment },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedComments = await fetchComments(selectedPostId);

        setPosts((prevPosts) => {
          const updatedPosts = prevPosts.map((post) =>
            post.id === selectedPostId
              ? { ...post, comments: updatedComments }
              : post
          );
          return updatedPosts;
        });

        // Limpa o comentário após envio bem-sucedido
        setNewComment("");
        setSelectedPostId(null); // Fecha o campo de comentário

        // Atualizar para exibir um Snackbar de sucesso ao invés de Toast
        setSnackbarMessage("Comentário adicionado com sucesso!");
        setReactionEmoji(""); // Nenhum emoji
        setOpenSnackbar(true); // Abrir o Snackbar
      } catch (error) {
        console.error("Erro ao adicionar comentário", error);
        toast.error("Erro ao adicionar comentário"); // Adiciona o toast de erro
      } finally {
        setLoading(false); // Desativa o loading após o término da requisição
      }
    }

    const end = performance.now(); // Fim da medição
    console.log(`handleAddComment levou ${end - start} ms`);
  }, [selectedPostId, newComment]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(postId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };
  const handleEdit = (postId: string, titulo: string, conteudo: string) => {
    setEditingPostId(postId);
    setEditedTitulo(titulo);
    setEditedConteudo(conteudo);
    handleClose();
  };

  const handleSaveEdit = async (postId: string) => {
    const start = performance.now(); // Início da medição

    try {
      await axios.put(`${baseURL}/posts/${postId}`, {
        titulo: editedTitulo,
        conteudo: editedConteudo,
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, titulo: editedTitulo, conteudo: editedConteudo }
            : post
        )
      );
      setEditingPostId(null);

      // Substitui o toast por um snackbar
      handleOpenSnackbar("Post editado com sucesso!", "✏️");
    } catch (error) {
      // Substitui o toast por um snackbar
      handleOpenSnackbar("Erro ao editar post", "❌");
      console.error("Erro ao editar post:", error);
    }

    const end = performance.now(); // Fim da medição
    console.log(`handleSaveEdit levou ${end - start} ms`);
  };

  const handleDelete = async () => {
    const start = performance.now(); // Início da medição

    if (!selectedPost) {
      handleOpenSnackbar("Nenhum post selecionado para deletar", "❌");
      return;
    }
    try {
      await axios.delete(`${baseURL}/posts/${selectedPost}`);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== selectedPost)
      );

      // Substitui o toast por um snackbar
      handleOpenSnackbar("Post deletado com sucesso!", "🗑️");
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao deletar post";

      // Substitui o toast por um snackbar
      handleOpenSnackbar(errorMessage, "❌");
    }

    const end = performance.now(); // Fim da medição
    console.log(`handleDelete levou ${end - start} ms`);
  };

  const handleImageLoad = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const handleImageError = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(null);
  };

  const toggleCommentSection = (postId: string) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    } else {
      setSelectedPostId(postId);
    }
  };

  const handleShowComments = (
    event: React.MouseEvent<HTMLElement>,
    post: any
  ) => {
    setSelectedCommentPost(post);
    setCommentListAnchorEl(event.currentTarget);
  };

  const countReactions = (reactions: any[], type: string) => {
    return reactions?.filter((reaction) => reaction.type === type).length || 0;
  };

  const handleOpenImageDialog = (imagePath: string) => {
    setOpenImageDialog(imagePath);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Faça a requisição DELETE para deletar o comentário
      await axios.delete(`${baseURL}/comments/${commentId}`);

      // Atualize a lista de posts após a deleção
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedCommentPost.id
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment: any) => comment.id !== commentId
                ),
              }
            : post
        )
      );

      // Exiba uma mensagem de sucesso
      handleOpenSnackbar("Comentário deletado com sucesso!", "🗑️");
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      handleOpenSnackbar("Erro ao deletar comentário", "❌");
    }
  };

  const handleSubmitSuggestion = async () => {
    try {
      await axios.post(`${baseURL}/suggestions`, {
        nomeUsuario: suggestionData.nomeUsuario || "Anônimo",
        titulo: suggestionData.titulo,
        conteudo: suggestionData.conteudo,
        userId: localStorage.getItem("userId") || null, // se o userId existir
      });
      handleOpenSnackbar("Sugestão enviada com sucesso!", "💡");
      setOpenSuggestionForm(false); // Fechar o modal após o envio
    } catch (error) {
      handleOpenSnackbar("Erro ao enviar sugestão", "❌");
    }
  };

  useNewPostChecker(fetchPostsWithComments, handleOpenSnackbar, currentPage);

  return (
    <Box padding={2}>
      <ToastContainer
        position="top-right" // Posição do toast na tela
        autoClose={3000} // Tempo para fechar automaticamente
        hideProgressBar // Oculta a barra de progresso
        newestOnTop // Exibe o toast mais novo no topo
        closeOnClick // Fecha ao clicar
        rtl={false} // Direção esquerda para direita
        pauseOnFocusLoss // Pausa quando a aba perde o foco
        draggable // Permite arrastar o toast
        pauseOnHover // Pausa quando o mouse passa por cima
      />

      <Typography variant="h6" sx={{ color: "#0B68A9", fontWeight: "bold" }}>
        Postagens
      </Typography>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // O Snackbar fecha automaticamente após 3 segundos
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Alinha no topo
        message={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            {/* Verifica se é uma reação ou uma mensagem geral */}
            {reactionEmoji ? (
              <span>
                {reactionEmoji} {snackbarMessage}
              </span> // Exibe o emoji para reações
            ) : (
              <Box display="flex" alignItems="center">
                {snackbarMessage === "Post's Atualizados!" ? (
                  <PublishedWithChangesSharpIcon
                    sx={{ marginRight: "10px", color: "#4caf50" }}
                  /> // Ícone para atualizações de posts
                ) : snackbarMessage.includes("editado") ? (
                  <EditIcon sx={{ marginRight: "10px", color: "#4caf50" }} /> // Ícone para edição de posts
                ) : snackbarMessage.includes("deletado") ? (
                  <DeleteIcon sx={{ marginRight: "10px", color: "#f44336" }} /> // Ícone para exclusão de posts
                ) : (
                  <MarkChatReadSharpIcon
                    sx={{ marginRight: "10px", color: "#4caf50" }}
                  /> // Ícone para comentários ou outras mensagens
                )}
                <span>{snackbarMessage}</span>
              </Box>
            )}
            <LinearProgress
              variant="determinate"
              value={100} // Valor inicial 100%
              sx={{
                flexGrow: 1,
                height: "5px", // Cor do fundo da barra
                marginLeft: "10px", // Espaço entre texto e barra
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#1976d2", // Cor da barra que diminui
                  animationDuration: "3s", // Define a animação para 3 segundos
                  animationTimingFunction: "linear",
                },
              }}
            />
          </Box>
        }
        sx={{
          color: "#333", // Texto em cinza escuro
          borderRadius: "8px",
          boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)", // Sombra leve
          padding: "10px 20px", // Espaçamento interno
        }}
      />

      {loadingPosts ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <List>
            {posts.map((post) => (
              <ListItem key={post.id} sx={{ padding: "20px" }}>
                <Card
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "2px solid #FF9D12",
                    padding: "16px",
                  }}
                >
                  <IconButton
                    onClick={(event) => handleClick(event, post.id)}
                    sx={{ position: "absolute", top: "16px", right: "16px" }}
                  >
                    {tipoUsuario === "admin" && <MoreVertIcon />}
                  </IconButton>

                  {tipoUsuario === "admin" && ( // Verificação se tipoUsuario é 'admin'
                    <IconButton
                      onClick={(event) => handleClick(event, post.id)}
                      sx={{ position: "absolute", top: "16px", right: "16px" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedPost === post.id}
                    onClose={handleClose}
                  >
                    {tipoUsuario === "admin" && [
                      <MenuItem
                        key="edit"
                        onClick={() =>
                          handleEdit(post.id, post.titulo, post.conteudo)
                        }
                      >
                        <EditIcon sx={{ marginRight: "8px" }} />
                        Editar
                      </MenuItem>,
                      <MenuItem key="delete" onClick={handleDelete}>
                        <DeleteIcon sx={{ marginRight: "8px" }} />
                        Excluir
                      </MenuItem>,
                    ]}
                  </Menu>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#0B68A9" }}
                  >
                    {post.titulo}
                  </Typography>

                  {post.imagePath && (
                    <Box sx={{ position: "relative", textAlign: "center" }}>
                      {imageLoading[post.id] && (
                        <CircularProgress
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      )}
                      <img
                        src={post.imagePath}
                        alt={post.titulo}
                        style={{
                          width: "100%",
                          maxHeight: "380px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          display: post.imagePath ? "block" : "none",
                          cursor: "pointer", // Isso dá o feedback visual de que a imagem é clicável
                        }}
                        onClick={() => handleOpenImageDialog(post.imagePath)} // Adicione o evento onClick aqui
                        onLoad={() => handleImageLoad(post.id)}
                        onError={() => handleImageError(post.id)}
                      />
                    </Box>
                  )}

                  <Typography
                    variant="body1"
                    sx={{ color: "#555", marginTop: "8px" }}
                  >
                    {post.conteudo}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#333", marginTop: "8px", fontSize: "14px" }}
                  >
                    {new Date(post.created_at).toLocaleString()}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="subtitle2">
                      Comentário:{" "}
                      {post.comments && post.comments.length > 0
                        ? `${
                            post.comments[post.comments.length - 1].user.usuario
                          }: ${post.comments[post.comments.length - 1].content}`
                        : "Sem comentários"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                    }}
                  >
                    <Box>
                      <IconButton onClick={() => toggleCommentSection(post.id)}>
                        <AddCommentSharpIcon
                          sx={{ fontSize: 35, color: "#0B68A9" }}
                        />
                      </IconButton>
                    </Box>

                    {post.comments && post.comments.length > 0 && (
                      <IconButton
                        onClick={(event) => handleShowComments(event, post)}
                      >
                        <MarkUnreadChatAltSharpIcon
                          sx={{ fontSize: 35, color: "#0B68A9" }}
                        />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={(event) => {
                        setSelectedReactionPost(post);
                        setReactionAnchorEl(event.currentTarget);
                      }}
                    >
                      <SentimentVerySatisfiedSharpIcon
                        sx={{
                          fontSize: 35,
                          color: post.reactions && post.reactions.length > 0 ? "#FFB900" : "#0B68A9", // Cor condicional
                        }}
                      />
                    </IconButton>


                    <IconButton
                      onClick={(event) => {
                        setSelectedReactionPost(post);
                        setReactionMenuAnchorEl(event.currentTarget);
                      }}
                    >
                      <ThumbUpIcon sx={{ fontSize: 55, color: "#0095FF" }} />
                    </IconButton>
                  </Box>

                  {selectedPostId === post.id && (
                    <CommentSection
                      postId={post.id}
                      newComment={newComment}
                      handleCommentChange={(e) => setNewComment(e.target.value)}
                      handleAddComment={handleAddComment} // Remove o argumento aqui
                      loading={loading} // Passa o estado de loading
                    />
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "start",
                      marginTop: "8px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "1rem" }} // Aumenta o tamanho dos emojis e do texto
                    >
                      👍 {countReactions(post.reactions, "like")} ❤️{" "}
                      {countReactions(post.reactions, "love")} 😂{" "}
                      {countReactions(post.reactions, "haha")}
                    </Typography>
                  </Box>

                  {editingPostId === post.id && (
                    <>
                      <TextField
                        label="Título"
                        variant="outlined"
                        fullWidth
                        value={editedTitulo}
                        onChange={(e) => setEditedTitulo(e.target.value)}
                        sx={{ marginBottom: "10px" }}
                      />
                      <TextField
                        label="Conteúdo"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={editedConteudo}
                        onChange={(e) => setEditedConteudo(e.target.value)}
                        sx={{ marginBottom: "10px" }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSaveEdit(post.id)}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setEditingPostId(null)}
                        sx={{ marginLeft: "10px" }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </Card>
              </ListItem>
            ))}
          </List>
          <Pagination
            count={totalPages} // Total de páginas
            page={currentPage} // Página atual
            onChange={(event, value) => setCurrentPage(value)} // Atualiza a página ao mudar
            color="primary"
          />
        </>
      )}

      <ReactionMenu
        anchorEl={reactionMenuAnchorEl}
        handleClose={handleCloseReactionMenu}
        handleReaction={(reactionType) => handleReaction(reactionType)} // Passando a função handleReaction
      />

      <ReactionList
        anchorEl={reactionAnchorEl}
        selectedReactionPost={selectedReactionPost}
        handleClose={() => setReactionAnchorEl(null)}
      />

      <CommentList
        anchorEl={commentListAnchorEl}
        selectedPost={selectedCommentPost}
        handleClose={() => setCommentListAnchorEl(null)}
        handleDeleteComment={handleDeleteComment}
        tipoUsuario={tipoUsuario || ""} // Garante que seja uma string, mesmo que `null`
      />

      <Dialog
        open={Boolean(openImageDialog)}
        onClose={handleCloseImageDialog}
        fullScreen // Adiciona esta propriedade para tela cheia
        PaperProps={{
          style: {
            backgroundColor: "black", // Fundo preto para a experiência de visualização
          },
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
          }}
        >
          {openImageDialog && (
            <img
              src={openImageDialog}
              alt="Fullscreen"
              style={{
                width: "100%", // Ocupa 100% da largura da tela
                height: "100%", // Ocupa 100% da altura da tela
                objectFit: "contain", // Garante que a imagem seja dimensionada proporcionalmente
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default PostList;
