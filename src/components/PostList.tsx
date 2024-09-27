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
import { toast, ToastContainer } from "react-toastify";
import { debounce } from "lodash";

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

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`${baseURL}/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar comentários", error);
      return [];
    }
  };

  const fetchPostsWithComments = async () => {
    setLoadingPosts(true);
    try {
      const response = await axios.get(`${baseURL}/posts`);
      const postsData = await Promise.all(
        response.data.map(async (post: any) => {
          const comments = await fetchComments(post.id);
          return { ...post, comments };
        })
      );
      setPosts(postsData);
    } catch (error) {
      console.error("Erro ao buscar postagens", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPostsWithComments();

    // WebSocket listeners
    socket.on("new-post", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      toast.info("Novo post adicionado!");
    });

    socket.on("post-reaction-updated", (updatedPost) => {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        );
        return updatedPosts;
      });
    });

    return () => {
      socket.off("new-post");
      socket.off("post-reaction-updated");
    };
  }, []);

  const handleCloseReactionMenu = () => {
    setReactionMenuAnchorEl(null);
    setSelectedReactionPost(null);
  };

  const debouncedHandleReaction = useCallback(
    debounce(async (reactionType: string) => {
      if (!selectedReactionPost) return;
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `${baseURL}/posts/${selectedReactionPost.id}/reaction`,
          { type: reactionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Reagiu com ${reactionType}!`);
        handleCloseReactionMenu();
      } catch (error) {
        toast.error("Erro ao adicionar reação.");
      }
    }, 300),
    [selectedReactionPost] // Limita a execução a cada 300ms
  );

  // Função para adicionar uma reação ao post
  // Função para adicionar uma reação ao post
  const handleReaction = useCallback(
    async (reactionType: string) => {
      if (!selectedReactionPost) return;
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `${baseURL}/posts/${selectedReactionPost.id}/reaction`,
          { type: reactionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Reagiu com ${reactionType}!`);
        handleCloseReactionMenu();
      } catch (error) {
        toast.error("Erro ao adicionar reação.");
      }
    },
    [selectedReactionPost]
  ); // Only re-create the function if selectedReactionPost changes

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

        // Após adicionar o comentário, buscar novamente os comentários atualizados
        const updatedComments = await fetchComments(selectedPostId);

        // Atualizar os comentários do post
        setPosts((prevPosts) => {
          const updatedPosts = prevPosts.map((post) =>
            post.id === selectedPostId
              ? { ...post, comments: updatedComments }
              : post
          );
          return updatedPosts;
        });

        setNewComment(""); // Limpar o campo de comentário após sucesso
      } catch (error) {
        console.error("Erro ao adicionar comentário", error);
      }
    }
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
      toast.success("Post editado com sucesso!");
    } catch (error) {
      toast.error("Erro ao editar post");
    }
  };

  const handleDelete = async () => {
    if (selectedPost) {
      try {
        await axios.delete(`${baseURL}/posts/${selectedPost}`);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== selectedPost)
        );
        toast.success("Post deletado com sucesso!");
        handleClose();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Erro ao deletar post";
        toast.error(errorMessage);
      }
    }
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

  return (
    <Box padding={2}>
      <Typography variant="h6" sx={{ color: "#0B68A9", fontWeight: "bold" }}>
        Postagens
      </Typography>

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
                      }}
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
                    Último comentário:{" "}
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
                      <TextsmsSharpIcon
                        sx={{ fontSize: 34.5, color: "#0B68A9" }}
                      />
                    </IconButton>

                    {post.comments && post.comments.length > 0 && (
                      <IconButton
                        onClick={(event) => handleShowComments(event, post)}
                      >
                        <RemoveRedEyeIcon
                          sx={{ fontSize: 34.5, color: "#0B68A9" }}
                        />
                      </IconButton>
                    )}

                    <IconButton
                      onClick={(event) => {
                        setSelectedReactionPost(post);
                        setReactionAnchorEl(event.currentTarget);
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 34.5, color: "#0B68A9" }} />
                    </IconButton>
                  </Box>

                  <IconButton
                    onClick={(event) => {
                      setSelectedReactionPost(post);
                      setReactionMenuAnchorEl(event.currentTarget);
                    }}
                  >
                    <ThumbUpIcon sx={{ fontSize: 48, color: "#0095FF" }} />
                  </IconButton>
                </Box>

                {selectedPostId === post.id && (
                  <CommentSection
                    postId={post.id}
                    newComment={newComment}
                    handleCommentChange={(e) => setNewComment(e.target.value)}
                    handleAddComment={handleAddComment}
                  />
                )}

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
      )}

      <ReactionMenu
        anchorEl={reactionMenuAnchorEl}
        handleClose={handleCloseReactionMenu}
        handleReaction={debouncedHandleReaction}
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
      />

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
            backgroundColor: "#000",
          }}
        >
          {openImageDialog && (
            <img
              src={openImageDialog}
              alt="Fullscreen"
              style={{
                maxWidth: "100%",
                maxHeight: "380px",
                objectFit: "contain",
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
