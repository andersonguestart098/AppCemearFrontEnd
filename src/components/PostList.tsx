import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  List,
  ListItem,
  Card,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download"; // Ícone para download
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useNewPostChecker from "../useNewPostChecker";
import { useUserContext } from "./UserContext"; // Supondo que você esteja utilizando um contexto para identificar o tipo de usuário

// URL base do Heroku
const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";

// Conectar ao Socket.IO
const socket = io(baseURL, {
  path: "/socket.io",
});

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitulo, setEditedTitulo] = useState<string>("");
  const [editedConteudo, setEditedConteudo] = useState<string>("");
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null);

  const { tipoUsuario } = useUserContext(); // Usando o contexto para obter o tipo de usuário

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  useNewPostChecker(setPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${baseURL}/posts`);
        setPosts(response.data);
      } catch (error) {
        toast.error("Erro ao buscar postagens");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Configuração de Socket.IO para novos posts
    socket.on("new-post", (newPost) => {
      if (newPost && newPost.titulo && newPost.conteudo) {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        toast.info(`Novo post adicionado: ${newPost.titulo}`);
      }
    });

    return () => {
      socket.off("new-post");
    };
  }, []);

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
        setPosts(posts.filter((post) => post.id !== selectedPost));
        toast.success("Post deletado com sucesso!");
        handleClose();
      } catch (error) {
        toast.error("Erro ao deletar post");
      }
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    if (currentPage * postsPerPage < posts.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleImageClick = (imagePath: string) => {
    setOpenImageDialog(imagePath);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(null);
  };

  return (
    <Box padding={2} sx={{ backgroundColor: "#F3F3F3" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#0B68A9", fontWeight: "bold" }}
      >
        Postagens
      </Typography>
      <List>
        {loading
          ? Array.from(new Array(postsPerPage)).map((_, index) => (
              <ListItem key={index} sx={{ padding: "20px" }}>
                <Card
                  variant="outlined"
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "2px solid #e0e0e0",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    padding: "16px",
                    position: "relative",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ marginY: 2 }}
                  />
                  <Skeleton variant="text" width="60%" />
                </Card>
              </ListItem>
            ))
          : currentPosts.map((post) => {
              if (!post || !post.titulo || !post.conteudo) {
                return null;
              }

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
                        onClick={() => handleImageClick(post.imagePath)}
                      >
                        <img
                          src={`${post.imagePath}`}
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

                    {/* O menu de edição e exclusão só aparecerá para administradores */}
                    {tipoUsuario === "admin" && (
                      <>
                        <IconButton
                          onClick={(event) => handleClick(event, post.id)}
                          sx={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                          }}
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
                      </>
                    )}

                    {/* Edição in-line */}
                    {editingPostId === post.id && (
                      <Box sx={{ marginTop: "16px" }}>
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
                      </Box>
                    )}
                  </Card>
                </ListItem>
              );
            })}
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
              padding: 0, // Remove o padding do conteúdo
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
      </List>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          sx={{ borderColor: "#0B68A9", color: "#0B68A9" }}
        >
          Anterior
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={currentPage * postsPerPage >= posts.length}
          sx={{ borderColor: "#0B68A9", color: "#0B68A9" }}
        >
          Próximo
        </Button>
      </Box>

      <ToastContainer />
    </Box>
  );
};

export default PostList;
