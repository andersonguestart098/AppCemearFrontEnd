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
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TextsmsSharpIcon from "@mui/icons-material/TextsmsSharp";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CommentSection from "./CommentSection"; // Para adicionar novos comentários
import ReactionMenu from "./ReactionMenu";
import ReactionList from "./ReactionList";
import CommentList from "./Comment"; // Para listar todos os comentários
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";
const socket = io(baseURL, { path: "/socket.io" });

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>(""); // Para o novo comentário
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); // Para adicionar comentários
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedReactionPost, setSelectedReactionPost] = useState<any>(null);
  const [commentListAnchorEl, setCommentListAnchorEl] =
    useState<null | HTMLElement>(null); // Para o Popover dos comentários
  const [selectedCommentPost, setSelectedCommentPost] = useState<any>(null); // Post selecionado para exibir comentários
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null); // Para o Dialog de imagem em fullscreen
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitulo, setEditedTitulo] = useState<string>("");
  const [editedConteudo, setEditedConteudo] = useState<string>("");

  // Função para buscar os comentários de um post
  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${baseURL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar comentários", error);
      return [];
    }
  };

  // Função para buscar os posts com seus comentários
  const fetchPostsWithComments = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts`);
      const postsData = await Promise.all(
        response.data.map(async (post: any) => {
          const comments = await fetchComments(post.id); // Buscar os comentários de cada post
          return { ...post, comments };
        })
      );
      setPosts(postsData);
    } catch (error) {
      console.error("Erro ao buscar postagens", error);
    }
  };

  useEffect(() => {
    fetchPostsWithComments();

    socket.on("new-post", (newPost) => {
      fetchComments(newPost.id).then((comments) => {
        setPosts((prev) => [{ ...newPost, comments }, ...prev]);
      });
    });

    socket.on("post-reaction-updated", (updatedPost) =>
      setPosts((prev) =>
        prev.map((post) =>
          post.id === updatedPost.id ? { ...updatedPost } : post
        )
      )
    );

    return () => {
      socket.off("new-post");
      socket.off("post-reaction-updated");
    };
  }, []);

  // Função para adicionar uma reação ao post
  const handleReaction = useCallback(
    async (reactionType: string) => {
      const token = localStorage.getItem("token");
      if (selectedReactionPost?.id) {
        try {
          const response = await axios.post(
            `${baseURL}/posts/${selectedReactionPost.id}/reaction`,
            { type: reactionType },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Atualizar o post localmente após a reação
          setPosts((prev) =>
            prev.map((post) =>
              post.id === selectedReactionPost.id ? response.data : post
            )
          );
          // Fechar o menu de reações
          setReactionMenuAnchorEl(null);
          console.log("Reação adicionada com sucesso!");
        } catch (error) {
          console.error("Erro ao adicionar reação", error);
        }
      }
    },
    [selectedReactionPost]
  );

  // Função para adicionar um comentário
  const handleAddComment = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (selectedPostId && newComment.trim()) {
      try {
        await axios.post(
          `${baseURL}/posts/${selectedPostId}/comments`,
          { content: newComment },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Buscar e atualizar os comentários do post após adicionar um novo
        const updatedComments = await fetchComments(selectedPostId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === selectedPostId
              ? { ...post, comments: updatedComments }
              : post
          )
        );
        setNewComment(""); // Limpar o campo de comentário após adicionar
        console.log("Comentário adicionado com sucesso!");
      } catch (error) {
        console.error("Erro ao adicionar comentário", error);
      }
    }
  }, [selectedPostId, newComment]);

  // Função para exibir a lista de comentários
  const handleShowComments = (
    event: React.MouseEvent<HTMLElement>,
    post: any
  ) => {
    setSelectedCommentPost(post); // Definir o post que será exibido
    setCommentListAnchorEl(event.currentTarget); // Definir o ancoramento do Popover
  };

  // Função para contar as reações de um tipo específico
  const countReactions = (reactions: any[], type: string) => {
    return reactions?.filter((reaction) => reaction.type === type).length || 0;
  };

  // Função para abrir/fechar o campo de comentário
  const toggleCommentSection = (postId: string) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null); // Fechar se já estiver aberto
    } else {
      setSelectedPostId(postId); // Abrir
    }
  };

  // Função para abrir a imagem em fullscreen
  const handleImageClick = (imagePath: string) => {
    setOpenImageDialog(imagePath); // Abrir o dialog com a imagem
  };

  // Função para fechar o dialog de imagem
  const handleCloseImageDialog = () => {
    setOpenImageDialog(null);
  };

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
    try {
      await axios.put(`${baseURL}/posts/${postId}`, {
        titulo: editedTitulo,
        conteudo: editedConteudo,
      });

      // Atualiza a lista de posts localmente
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, titulo: editedTitulo, conteudo: editedConteudo }
            : post
        )
      );
      setEditingPostId(null);
      toast.success("Post editado com sucesso!");
    } catch (error) {
      toast.error("Erro ao editar post");
    }
  };

  const handleDelete = async () => {
    if (selectedPost) {
      try {
        await axios.delete(`${baseURL}/posts/${selectedPost}`);
        setPosts(posts.filter((post) => post.id !== selectedPost));
        toast.success("Post deletado com sucesso!");
        handleClose();
      } catch (error: any) {
        console.error("Erro ao deletar post:", error); // Log detalhado do erro
        // Verifique se o objeto error tem uma resposta
        if (error.response) {
          console.error("Detalhes do erro:", error.response.data);
        }
        const errorMessage =
          error.response?.data?.message || "Erro ao deletar post";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Box padding={2}>
      <Typography variant="h6" sx={{ color: "#0B68A9", fontWeight: "bold" }}>
        Postagens
      </Typography>
      <List>
        {posts.map((post) => (
          <ListItem key={post.id} sx={{ padding: "20px" }}>
            <Card
              sx={{
                width: "100%",
                borderRadius: "12px",
                border: "2px solid #FF9D12", // Borda laranja
                padding: "16px",
              }}
            >
              <IconButton
                onClick={(event) => handleClick(event, post.id)}
                sx={{ position: "absolute", top: "16px", right: "16px" }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedPost === post.id}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() =>
                    handleEdit(post.id, post.titulo, post.conteudo)
                  }
                >
                  <EditIcon sx={{ marginRight: "8px" }} />
                  Editar
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                  <DeleteIcon sx={{ marginRight: "8px" }} />
                  Excluir
                </MenuItem>
              </Menu>

              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#0B68A9" }}
              >
                {post.titulo}
              </Typography>

              {/* Exibir imagem do post */}
              {post.imagePath && (
                <Box
                  sx={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => handleImageClick(post.imagePath)}
                >
                  <img
                    src={post.imagePath}
                    alt={post.titulo}
                    style={{
                      width: "100%",
                      maxHeight: "380px",
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

              {/* Exibir o último comentário */}
              <Box mt={2}>
                <Typography variant="subtitle2">
                  Último comentário:{" "}
                  {post.comments && post.comments.length > 0
                    ? `${
                        post.comments[post.comments.length - 1].user.usuario
                      }: ${post.comments[post.comments.length - 1].content}`
                    : "Sem comentários"}
                </Typography>
              </Box>

              {/* Ícones de reações e comentários */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <Box>
                  {/* Abrir/fechar campo de comentário */}
                  <IconButton onClick={() => toggleCommentSection(post.id)}>
                    <TextsmsSharpIcon sx={{ color: "#0B68A9" }} />
                  </IconButton>

                  {/* Ícone para abrir a lista de todos os comentários */}
                  {post.comments && post.comments.length > 0 && (
                    <IconButton
                      onClick={(event) => handleShowComments(event, post)}
                    >
                      <RemoveRedEyeIcon sx={{ color: "#0B68A9" }} />
                    </IconButton>
                  )}

                  {/* Ícone para ver quem reagiu */}
                  <IconButton
                    onClick={(event) => {
                      setSelectedReactionPost(post);
                      setReactionAnchorEl(event.currentTarget);
                    }}
                  >
                    <PeopleIcon sx={{ color: "#0B68A9" }} />
                  </IconButton>
                </Box>

                {/* Botão para abrir o menu de reações */}
                <IconButton
                  onClick={(event) => {
                    setSelectedReactionPost(post);
                    setReactionMenuAnchorEl(event.currentTarget);
                  }}
                >
                  <ThumbUpIcon sx={{ fontSize: 48, color: "#0095FF" }} />
                </IconButton>
              </Box>

              {/* Campo de comentário */}
              {selectedPostId === post.id && (
                <CommentSection
                  postId={post.id}
                  newComment={newComment}
                  handleCommentChange={(e) => setNewComment(e.target.value)}
                  handleAddComment={handleAddComment}
                />
              )}

              {/* Exibir contagem de reações com emojis */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  marginTop: "8px",
                }}
              >
                <Typography variant="body2">
                  👍 {countReactions(post.reactions, "like")} ❤️{" "}
                  {countReactions(post.reactions, "love")} 😂{" "}
                  {countReactions(post.reactions, "haha")}
                </Typography>
              </Box>

              {/* Seção de edição do post */}
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

      {/* Popover para o menu de reações */}
      <ReactionMenu
        anchorEl={reactionMenuAnchorEl}
        handleClose={() => setReactionMenuAnchorEl(null)}
        handleReaction={handleReaction}
      />

      {/* Popover para mostrar quem reagiu */}
      <ReactionList
        anchorEl={reactionAnchorEl}
        selectedReactionPost={selectedReactionPost}
        handleClose={() => setReactionAnchorEl(null)}
      />

      {/* Popover para mostrar todos os comentários */}
      <CommentList
        anchorEl={commentListAnchorEl}
        selectedPost={selectedCommentPost}
        handleClose={() => setCommentListAnchorEl(null)}
      />

      {/* Dialog para exibir a imagem em fullscreen */}
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
            backgroundColor: "#000", // Fundo escuro para destacar a imagem
          }}
        >
          {openImageDialog && (
            <img
              src={openImageDialog}
              alt="Fullscreen"
              style={{
                maxWidth: "100%",
                maxHeight: "380px", // Limitar a altura para caber na tela
                objectFit: "contain", // Manter a proporção da imagem
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
    </Box>
  );
};

export default PostList;
