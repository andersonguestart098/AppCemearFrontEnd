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
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TextsmsSharpIcon from "@mui/icons-material/TextsmsSharp";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CommentSection from "./Comment";
import ReactionMenu from "./ReactionMenu";
import ReactionList from "./ReactionList";

const baseURL = "https://cemear-b549eb196d7c.herokuapp.com";
const socket = io(baseURL, { path: "/socket.io" });

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReactionPost, setSelectedReactionPost] = useState<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${baseURL}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar postagens", error);
      }
    };

    fetchPosts();

    socket.on("new-post", (newPost) => setPosts((prev) => [newPost, ...prev]));
    
    socket.on("post-reaction-updated", (updatedPost) =>
      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      )
    );

    return () => {
      socket.off("new-post");
      socket.off("post-reaction-updated");
    };
  }, []);

  // Função para adicionar uma reação ao post
  const handleReaction = useCallback(async (reactionType: string) => {
    const token = localStorage.getItem("token");
    if (selectedReactionPost?.id) {
      try {
        await axios.post(
          `${baseURL}/posts/${selectedReactionPost.id}/reaction`,
          { type: reactionType },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Após a reação ser enviada com sucesso, feche o menu
        setReactionMenuAnchorEl(null);
      } catch (error) {
        console.error("Erro ao adicionar reação", error);
      }
    }
  }, [selectedReactionPost]);

  return (
    <Box padding={2}>
      <Typography variant="h6" sx={{ color: "#0B68A9", fontWeight: "bold" }}>
        Postagens
      </Typography>
      <List>
        {posts.map((post) => (
          <ListItem key={post.id} sx={{ padding: "20px" }}>
            <Card sx={{ width: "100%", borderRadius: "12px", padding: "16px" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0B68A9" }}>
                {post.titulo}
              </Typography>

              {/* Exibir imagem do post */}
              {post.imagePath && (
                <Box sx={{ cursor: "pointer", textAlign: "center" }}>
                  <img
                    src={post.imagePath}
                    alt={post.titulo}
                    style={{ width: "100%", maxHeight: "350px", objectFit: "cover" }}
                  />
                </Box>
              )}

              <Typography variant="body1" sx={{ color: "#555", marginTop: "8px" }}>
                {post.conteudo}
              </Typography>
              <Typography variant="caption" sx={{ color: "#333", marginTop: "8px", fontSize: "14px" }}>
                {new Date(post.created_at).toLocaleString()}
              </Typography>

              {/* Exibir o último comentário */}
              <Box mt={2}>
                <Typography variant="subtitle2">
                  Último comentário: {post.comments && post.comments.length > 0 ? `${post.comments[post.comments.length - 1].user.usuario}: ${post.comments[post.comments.length - 1].content}` : "Sem comentários"}
                </Typography>
              </Box>

              {/* Ícones de reações e comentários */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <Box>
                  <IconButton onClick={() => setSelectedPostId(post.id)}>
                    <TextsmsSharpIcon />
                  </IconButton>

                  {post.comments && post.comments.length > 0 && (
                    <IconButton onClick={() => setReactionAnchorEl(null)}>
                      <RemoveRedEyeIcon />
                    </IconButton>
                  )}

                  <IconButton onClick={(event) => {
                    setSelectedReactionPost(post);
                    setReactionAnchorEl(event.currentTarget);
                  }}>
                    <PeopleIcon />
                  </IconButton>
                </Box>

                {/* Botão para abrir o menu de reações */}
                <IconButton onClick={(event) => {
                  setSelectedReactionPost(post);
                  setReactionMenuAnchorEl(event.currentTarget);
                }}>
                  <ThumbUpIcon sx={{ fontSize: 48, color: "#0095FF" }} />
                </IconButton>
              </Box>

              {/* Campo de comentário */}
              {selectedPostId === post.id && (
                <CommentSection
                  postId={post.id}
                  newComment={newComment}
                  handleCommentChange={(e) => setNewComment(e.target.value)}
                  handleAddComment={() => { /* Implementar o handleAddComment */ }}
                />
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
    </Box>
  );
};

export default PostList;
