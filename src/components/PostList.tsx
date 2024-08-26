import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:3001");

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar postagens", error);
        toast.error("Erro ao buscar postagens");
      }
    };

    fetchPosts();

    socket.on("new-post", async () => {
      try {
        const response = await axios.get("http://localhost:3001/posts");
        setPosts(response.data);
        toast.info("Nova postagem foi adicionada!");
      } catch (error) {
        console.error("Erro ao buscar novas postagens", error);
        toast.error("Erro ao atualizar postagens");
      }
    });

    return () => {
      socket.off("new-post");
    };
  }, []);

  return (
    <Box padding={2}>
      <Typography variant="h6" gutterBottom>
        Mural de Postagens
      </Typography>
      <List>
        {posts.map((post) => (
          <ListItem key={post.id}>
            <Card variant="outlined" sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {post.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.conteudo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
      <ToastContainer />
    </Box>
  );
};

export default PostList;
