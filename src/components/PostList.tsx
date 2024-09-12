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
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Conectar ao Socket.IO
const socket = io("http://localhost:3001", {
  path: "/socket.io", // Caminho correto para o Socket.IO
});

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitulo, setEditedTitulo] = useState<string>("");
  const [editedConteudo, setEditedConteudo] = useState<string>("");
  const [openImageDialog, setOpenImageDialog] = useState<string | null>(null);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          "https://cemear-b549eb196d7c.herokuapp.com/posts"
        );
        setPosts(response.data);
      } catch (error) {
        toast.error("Erro ao buscar postagens");
      }
    };
    fetchPosts();

    // Escuta o evento de novo post via Socket.IO
    socket.on("new-post", async () => {
      try {
        const response = await axios.get(
          "https://cemear-b549eb196d7c.herokuapp.com/posts"
        );
        setPosts(response.data);
        toast.info("Novo post adicionado!");
      } catch (error) {
        toast.error("Erro ao atualizar postagens");
      }
    });

    // Desconectar ao desmontar o componente
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
      await axios.put(
        `https://cemear-b549eb196d7c.herokuapp.com/posts/${postId}`,
        {
          titulo: editedTitulo,
          conteudo: editedConteudo,
        }
      );

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
        await axios.delete(
          `https://cemear-b549eb196d7c.herokuapp.com/posts/${selectedPost}`
        );
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
    <Box padding={2}>
      <Typography variant="h6" gutterBottom>
        Postagens
      </Typography>
      <List>
        {currentPosts.map((post) => (
          <ListItem key={post.id} sx={{ padding: "20px" }}>
            <Card
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#333", padding: "10px" }}
              >
                {post.titulo}
              </Typography>

              {post.imagePath && (
                <Box
                  sx={{
                    marginBottom: "16px",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() => handleImageClick(post.imagePath)}
                >
                  <img
                    src={`https://cemear-b549eb196d7c.herokuapp.com${post.imagePath}`}
                    alt={post.titulo}
                    style={{
                      width: "260px", // Largura fixa para todas as miniaturas
                      height: "260px", // Altura fixa para todas as miniaturas
                      objectFit: "cover", // Mantém a proporção da imagem, mas pode cortar se necessário
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
        >
          Anterior
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={currentPage * postsPerPage >= posts.length}
        >
          Próximo
        </Button>
      </Box>

      {/* Dialog para imagem em tela cheia com botão de fechar */}
      <Dialog open={Boolean(openImageDialog)} onClose={handleCloseImageDialog}>
        <DialogActions sx={{ justifyContent: "flex-end", padding: "8px" }}>
          <IconButton onClick={handleCloseImageDialog}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            padding: 0,
          }}
        >
          <img
            src={`https://cemear-b549eb196d7c.herokuapp.com${openImageDialog}`}
            alt="Imagem em tela cheia"
            style={{
              maxWidth: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default PostList;
