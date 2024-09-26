import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  List,
  ListItem,
  Card,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Popover,
  Menu,
  MenuItem,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Ícone para mostrar todos os comentários
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import PeopleIcon from "@mui/icons-material/People"; // Ícone de pessoas para mostrar as reações
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [newComment, setNewComment] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Para o Popover de comentários
  const [popoverPost, setPopoverPost] = useState<any>(null); // Guarda os comentários do post no Popover
  const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(
    null
  ); // Para o popover das reações
  const [selectedReactionPost, setSelectedReactionPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${baseURL}/posts`);
        setPosts(response.data);
        // Busca comentários para todos os posts
        response.data.forEach((post: any) => fetchComments(post.id));
      } catch (error) {
        toast.error("Erro ao buscar postagens");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${baseURL}/posts/${postId}/comments`);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data,
      }));
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    }
  };

  const handleCommentIconClick = (postId: string) => {
    setSelectedPostId(postId === selectedPostId ? null : postId);
  };

  const handleAddComment = async (postId: string) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${baseURL}/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchComments(postId); // Atualiza os comentários após adicionar
      setNewComment(""); // Limpa o campo de comentário
      toast.success("Comentário adicionado com sucesso!");
      setSelectedPostId(null); // Fecha o campo de comentário após adicionar
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error("Erro ao adicionar comentário.");
    }
  };

  const handleShowAllComments = (
    event: React.MouseEvent<HTMLElement>,
    post: any
  ) => {
    setAnchorEl(event.currentTarget); // Mostra o Popover ao clicar no ícone de "+"
    setPopoverPost(post); // Guarda os comentários do post no Popover
  };

  const handleClosePopover = () => {
    setAnchorEl(null); // Fecha o Popover
    setPopoverPost(null);
  };

  const handleReactionClick = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setSelectedPostId(postId);
    setReactionAnchorEl(event.currentTarget);
    localStorage.setItem("selectedPostId", postId);
  };

  const handleReaction = async (type: string) => {
    const postId = localStorage.getItem("selectedPostId");
    if (!postId) {
      toast.error("Post não selecionado para reação.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${baseURL}/posts/${postId}/reaction`,
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Reação ${type} adicionada com sucesso!`);
    } catch (error) {
      toast.error("Erro ao processar reação.");
    }
  };

  const countReactions = (postReactions: any[], type: string) => {
    if (!postReactions) return 0;
    return postReactions.filter((reaction) => reaction.type === type).length;
  };

  const handleCloseReactionPopover = () => {
    setReactionAnchorEl(null);
    setSelectedReactionPost(null);
  };

  return (
    <Box padding={2}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#0B68A9", fontWeight: "bold" }}
      >
        Postagens
      </Typography>
      <List>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          posts.map((post) => {
            const postComments = comments[post.id] || [];

            return (
              <ListItem key={post.id} sx={{ padding: "20px" }}>
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "2px solid #FF9D12",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    padding: "16px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "#0B68A9",
                      padding: "10px",
                    }}
                  >
                    {post.titulo}
                  </Typography>

                  {/* Exibe a imagem do post, se houver */}
                  {post.imagePath && (
                    <Box
                      sx={{
                        marginBottom: "16px",
                        cursor: "pointer",
                        textAlign: "center",
                        height: "350px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={post.imagePath}
                        alt={post.titulo}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxHeight: "350px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
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

                  {/* Exibe o último comentário diretamente no card */}
                  <Box mt={2}>
                    <Typography variant="subtitle2">
                      Último comentário:
                      {postComments.length > 0
                        ? `${
                            postComments[postComments.length - 1].user.usuario
                          }: ${postComments[postComments.length - 1].content}`
                        : " Sem comentários ainda"}
                    </Typography>
                    {/* Ícone "+" para mostrar todos os comentários */}
                    {postComments.length > 0 && (
                      <IconButton
                        onClick={(event) => handleShowAllComments(event, post)}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Ícone para abrir o campo de comentário */}
                  <IconButton onClick={() => handleCommentIconClick(post.id)}>
                    <CommentIcon />
                  </IconButton>

                  {/* Campo para adicionar comentário, visível apenas para o post selecionado */}
                  {selectedPostId === post.id && (
                    <Box mt={2}>
                      <TextField
                        label="Adicionar comentário"
                        fullWidth
                        multiline
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddComment(post.id)}
                        sx={{ marginTop: "10px" }}
                      >
                        Comentar
                      </Button>
                    </Box>
                  )}

                  {/* Ícone de pessoas para mostrar reações */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", marginTop: 2 }}
                  >
                    <IconButton
                      onClick={(event) => handleReactionClick(event, post.id)}
                    >
                      <PeopleIcon sx={{ color: "#FF9D12" }} />
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{ marginLeft: "8px", color: "#333" }}
                    >
                      👍 {countReactions(post.reactions, "like")} ❤️{" "}
                      {countReactions(post.reactions, "love")} 😂{" "}
                      {countReactions(post.reactions, "haha")}
                    </Typography>
                  </Box>
                </Card>
              </ListItem>
            );
          })
        )}
      </List>

      {/* Popover para exibir todos os comentários */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Todos os comentários</Typography>
          {popoverPost &&
          popoverPost.id &&
          comments[popoverPost.id].length > 0 ? (
            comments[popoverPost.id].map((comment: any, index: any) => (
              <Typography key={index}>
                {comment.user
                  ? `${comment.user.usuario}: ${comment.content}`
                  : "Usuário desconhecido"}
              </Typography>
            ))
          ) : (
            <Typography>Nenhum comentário disponível</Typography>
          )}
        </Box>
      </Popover>

      {/* Popover para exibir quem reagiu */}
      <Popover
        open={Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        onClose={handleCloseReactionPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">Reações</Typography>
          {selectedReactionPost && selectedReactionPost.reactions.length > 0 ? (
            selectedReactionPost.reactions.map((reaction: any, index: any) => (
              <Typography key={index}>
                {reaction.user
                  ? `${reaction.user.usuario} reagiu com ${reaction.type}`
                  : "Usuário desconhecido"}
              </Typography>
            ))
          ) : (
            <Typography>Nenhuma reação</Typography>
          )}
        </Box>
      </Popover>

      <ToastContainer />
    </Box>
  );
};

export default PostList;
