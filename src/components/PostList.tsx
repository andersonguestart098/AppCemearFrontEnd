import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client"; // Importar o Socket.IO
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
  Dialog,
  DialogContent,
  DialogActions,
  Skeleton, // Importando o componente Skeleton
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// URL base do Heroku
const baseURL = "http://localhost:3001";

// Conectar ao Socket.IO usando a URL do Heroku
const socket = io(baseURL, {
  path: "/socket.io", // Caminho correto para o Socket.IO
});

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${baseURL}/posts`);
        console.log("Posts recebidos da API: ", response.data);
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar postagens:", error);
        toast.error("Erro ao buscar postagens");
      } finally {
        setLoading(false); // Define o estado de carregamento como falso após os dados serem carregados
      }
    };

    fetchPosts();

    // Log de conexão de Socket.IO
    socket.on("connect", () => {
      console.log("Conectado ao Socket.IO:", socket.id);
    });

    // Log de desconexão de Socket.IO
    socket.on("disconnect", () => {
      console.log("Desconectado do Socket.IO");
    });

    // Escuta o evento de novo post via Socket.IO
    socket.on("new-post", (newPost) => {
      console.log("Evento new-post recebido:", newPost); // Log para verificar a recepção do evento

      // Verifique se o novo post contém as informações necessárias antes de atualizá-lo na lista de posts
      if (newPost && newPost.titulo && newPost.conteudo) {
        setPosts((prevPosts) => [newPost, ...prevPosts]);

        // Exibe notificação local usando toast
        toast.info(`Novo post adicionado: ${newPost.titulo}`);
      } else {
        console.error("Novo post recebido, mas faltam dados: ", newPost);
      }
    });

    // Desconectar ao desmontar o componente
    return () => {
      socket.off("new-post");
      socket.off("connect");
      socket.off("disconnect");
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
                      <MenuItem onClick={handleDelete}>
                        <DeleteIcon sx={{ marginRight: "8px" }} />
                        Excluir
                      </MenuItem>
                    </Menu>
                  </Card>
                </ListItem>
              );
            })}
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
