import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client"; // Importar o Socket.IO
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
  Dialog,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PeopleIcon from "@mui/icons-material/People";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"; // Ícone para abrir o menu de reações
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// URL base do Heroku
const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";

// Conectar ao Socket.IO usando a URL do Heroku
const socket = io(baseURL, {
  path: "/socket.io", // Caminho correto para o Socket.IO
});

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [newComment, setNewComment] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Para o Popover de comentários
  const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(
    null
  ); // Para o popover de reações
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] =
    useState<null | HTMLElement>(null); // Para o menu de reações
  const [selectedPostForReaction, setSelectedPostForReaction] =
    useState<any>(null); // Post selecionado para a reação
  const [loading, setLoading] = useState(true);
  const [popoverPost, setPopoverPost] = useState<any>(null); // Declarar popoverPost corretamente
  const [reactions, setReactions] = useState<any[]>([]); // Reações para o popover

  // Função para buscar os posts
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts`);
      setPosts(response.data);
      response.data.forEach((post: any) => fetchComments(post.id));
    } catch (error) {
      toast.error("Erro ao buscar postagens");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar posts e conectar o Socket.IO
  useEffect(() => {
    fetchPosts();

    // Configura a conexão ao Socket.IO para ouvir por novos posts
    socket.on("new-post", (newPost) => {
      if (newPost.imagePath) {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        toast.info("Novo post com imagem adicionado!");
      } else {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        toast.info("Novo post sem imagem adicionado!");
      }
    });

    // Limpeza da conexão do Socket.IO ao desmontar o componente
    return () => {
      socket.off("new-post");
    };
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

  const handleReactionClick = async (
    event: React.MouseEvent<HTMLElement>,
    post: any
  ) => {
    setReactionAnchorEl(event.currentTarget);
    setSelectedPostForReaction(post);

    try {
      const response = await axios.get(`${baseURL}/posts/${post.id}/reactions`);
      setReactions(response.data);
    } catch (error) {
      console.error("Erro ao buscar reações:", error);
      toast.error("Erro ao buscar reações.");
    }
  };

  const handleCloseReactionPopover = () => {
    setReactionAnchorEl(null);
    setSelectedPostForReaction(null);
  };

  const countReactions = (postReactions: any[], type: string) => {
    if (!postReactions) return 0;
    return postReactions.filter((reaction) => reaction.type === type).length;
  };

  const handleImageClick = (imagePath: string) => {
    setOpenImageDialog(imagePath); // Armazena a URL da imagem ao clicar
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(null); // Fecha o Dialog ao clicar fora ou no botão de fechar
  };

  const handleOpenReactionMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    post: any
  ) => {
    setReactionMenuAnchorEl(event.currentTarget);
    setSelectedPostForReaction(post);
  };

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setSelectedPostForReaction(null);
  };

  const handleReaction = async (reactionType: string) => {
    if (!selectedPostForReaction) return;
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${baseURL}/posts/${selectedPostForReaction.id}/reactions`,
        { type: reactionType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Reagiu com ${reactionType}!`);
      handleCloseReactionMenu();
    } catch (error) {
      toast.error("Erro ao adicionar reação.");
    }
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
                      onClick={() => handleImageClick(post.imagePath)} // Ao clicar na imagem, abre o Dialog
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

                  {/* Alinhando todos os ícones na horizontal */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-around", // Para alinhar os ícones na horizontal
                      marginTop: 2,
                    }}
                  >
                    {/* Ícone "+" para mostrar todos os comentários */}
                    {postComments.length > 0 && (
                      <IconButton
                        onClick={(event) => handleShowAllComments(event, post)}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    )}

                    {/* Ícone para abrir o campo de comentário */}
                    <IconButton onClick={() => handleCommentIconClick(post.id)}>
                      <CommentIcon />
                    </IconButton>

                    {/* Ícone de pessoas para mostrar reações */}
                    <IconButton
                      onClick={(event) => handleReactionClick(event, post)}
                    >
                      <PeopleIcon sx={{ color: "#FF9D12" }} />
                    </IconButton>

                    {/* Botão para abrir o menu de reações */}
                    <IconButton
                      onClick={(event) => handleOpenReactionMenu(event, post)}
                    >
                      <EmojiEmotionsIcon sx={{ color: "#FF9D12" }} />
                    </IconButton>

                    {/* Contagem de reações organizadas */}
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      👍 {countReactions(post.reactions, "like")} ❤️{" "}
                      {countReactions(post.reactions, "love")} 😂{" "}
                      {countReactions(post.reactions, "haha")}
                    </Typography>
                  </Box>

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
          {reactions.length > 0 ? (
            reactions.map((reaction: any, index: any) => (
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

      {/* Menu para adicionar reações */}
      <Menu
        anchorEl={reactionMenuAnchorEl}
        open={Boolean(reactionMenuAnchorEl)}
        onClose={handleCloseReactionMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleReaction("like")}>
          <ThumbUpIcon sx={{ marginRight: "8px" }} /> Curtir
        </MenuItem>
        <MenuItem onClick={() => handleReaction("love")}>
          <FavoriteIcon sx={{ marginRight: "8px" }} /> Amar
        </MenuItem>
        <MenuItem onClick={() => handleReaction("haha")}>
          <SentimentSatisfiedAltIcon sx={{ marginRight: "8px" }} /> Haha
        </MenuItem>
      </Menu>

      {/* Dialog para imagem em tela cheia */}
      <Dialog
        open={Boolean(openImageDialog)}
        onClose={handleCloseImageDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            backgroundColor: "#000", // Define um fundo escuro para destacar a imagem
          }}
        >
          {openImageDialog && (
            <img
              src={openImageDialog}
              alt="Fullscreen"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh", // Limita a altura para caber na tela
                objectFit: "contain", // Mantém a proporção da imagem
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
