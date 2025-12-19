"use client";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  CardMedia,
  Avatar,
  TextField,
  Paper,
  Button,
  Checkbox,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import Comment from "@mui/icons-material/Comment";
import Share from "@mui/icons-material/Share";
import SendIcon from "@mui/icons-material/Send";

import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import ImageViewer from "./image.view";
import { useToast } from "@/utils/toast";

export default function PostDetailModal({
  postId,
  onClose,
  session,
  refresh,
}: any) {
  const [commentText, setCommentText] = useState("");
  const [post, setPost] = useState<IPostDetail | null>(null);

  const [replyText, setReplyText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const toast = useToast();
  const router = useRouter();

  if (postId === "") return null;

  const fetchData = async () => {
    const data = await sendRequest<IBackendRes<IPostDetail>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      nextOption: {
        next: { tags: ["fetch-post"] },
      },
    });

    if (data?.data) setPost(data?.data);
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  // ========== DELETE COMMENT ==========
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn chắc chắn muốn xoá bình luận này?")) return;

    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments/${commentId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    fetchData();
    refresh();
  };

  // ========== COMMENT CẤP 1 ==========
  const handlePostComment = async () => {
    if (!session) return alert("Bạn phải đăng nhập!");
    if (!commentText.trim()) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { content: commentText, postId },
    });

    if (res?.data?.success === true) {
      toast.success("Bình luận thành công");
    }
    if (res?.data?.success === false) {
      toast.error(res?.data?.message);
    }

    setCommentText("");
    fetchData();
    refresh();
  };

  // ========== REPLY COMMENT ==========
  const handleReplyComment = async (parentId: string) => {
    if (!replyText.trim()) return;

    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { content: replyText, postId, parentId },
    });

    setReplyText("");
    setReplyToCommentId(null);
    fetchData();
    refresh();
  };

  // ========== LIKE ==========
  const handleLikes = async () => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${post?._id}/toggle`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    fetchData();
    refresh();
  };

  // ========== RENDER COMMENTS ==========
  const renderComments = (comments: IComment[], level = 0) =>
    comments.map((c: IComment) => (
      <Box
        key={c._id}
        sx={{
          ml: level * 3,
          mb: 2,
          p: 1.2,
          borderRadius: 2,
          backgroundColor: level === 0 ? "#f9f9f9" : "#fafafa",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Avatar
            sx={{ mr: 2, width: 34, height: 34 }}
            src={
              c.user.avatar
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${c.user.avatar}`
                : "/user/default-user.png"
            }
          />

          <Box sx={{ flex: 1 }}>
            <Typography fontWeight="bold" sx={{ fontSize: "0.9rem" }}>
              {c.user.name}
            </Typography>

            <Typography sx={{ fontSize: "0.85rem", color: "#444" }}>
              {c.content}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Button
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "#1976d2",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setReplyToCommentId(c._id)}
              >
                Reply
              </Button>

              {/* === DELETE COMMENT BUTTON === */}
              {(session.user._id === c.userId ||
                session.user._id === post?.author?._id) && (
                <Button
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    color: "#d32f2f",
                    ml: 1,
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => handleDeleteComment(c._id)}
                >
                  Delete
                </Button>
              )}
            </Box>

            {replyToCommentId === c._id && (
              <Box sx={{ display: "flex", mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Viết phản hồi..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  sx={{
                    flex: 1,
                    mr: 1,
                    backgroundColor: "white",
                    borderRadius: 2,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleReplyComment(c._id)}
                >
                  Gửi
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {c.children &&
          c.children.length > 0 &&
          renderComments(c.children, level + 1)}
      </Box>
    ));

  return (
    <Modal
      open={!!post}
      onClose={() => {
        onClose();
        router.replace("/", { scroll: false });
      }}
      sx={{
        backdropFilter: "blur(3px)",
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 24,

          width: "92%", // 👈 chiếm gần full
          maxWidth: 760, // 👈 CHUẨN FB
          height: "92vh", // 👈 cao hơn
          maxHeight: "92vh",

          overflowY: "auto",
          p: 2.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={() => {
              onClose();
              router.replace("/", { scroll: false });
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{ bgcolor: "#c0c9d3ff" }}
            src={
              post?.author?.avatar
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${post.author.avatar}`
                : "/user/default-user.png"
            }
          />

          <Typography variant="h6" fontWeight="bold">
            {post?.author?.name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {new Date(post?.createdAt + "").toLocaleString()}
        </Typography>
        <Divider sx={{ my: 1 }} />
        {/* ===== HÌNH POST ===== */}
        {/* ⭐ HIỂN THỊ NHIỀU ẢNH THEO GRID GIỐNG FACEBOOK ⭐ */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          {post?.content}
        </Typography>
        {post?.images && post.images.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                post.images.length === 1
                  ? "1fr"
                  : post.images.length === 2
                  ? "1fr 1fr"
                  : "1fr 1fr",
              gap: 1,
              mt: 2,
            }}
          >
            {post.images.slice(0, 4).map((img, idx) => (
              <Box
                key={idx}
                sx={{ position: "relative", cursor: "pointer" }}
                onClick={() => {
                  setViewerIndex(idx);
                  setViewerOpen(true);
                }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                  style={{
                    width: "100%",
                    height: post.images.length === 1 ? "auto" : "260px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                {idx === 3 && post.images.length > 4 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0,0,0,0.55)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    +{post.images.length - 4}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}{" "}
        {viewerOpen && (
          <ImageViewer
            images={post?.images.map(
              (i) => `${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${i}`
            )}
            index={viewerIndex}
            onClose={() => setViewerOpen(false)}
          />
        )}
        {/* ===== Video post ===== */}
        {Array.isArray(post?.videos) && post!.videos!.length > 0 && (
          <video
            controls
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/videos/${post?.videos?.[0]}`}
            style={{ width: "100%", maxHeight: "600px", borderRadius: "8px" }}
          />
        )}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              onClick={handleLikes}
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite sx={{ color: "red" }} />}
              checked={post?.isLiked}
            />
            <Typography>{post?.likesCount} Likes</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Comment />
            <Typography>{post?.commentsCount} Comments</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Share />
            <Typography>Share</Typography>
          </Box>
        </Box>
        <Divider />
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          Bình luận
        </Typography>
        <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
          {post?.comments && renderComments(post.comments)}
        </Box>
        <Paper
          sx={{ mt: 2, display: "flex", alignItems: "center", p: 1 }}
          component="form"
          onSubmit={(e) => e.preventDefault()}
        >
          <Avatar
            sx={{ mr: 1 }}
            src={
              session.user.avatar
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${session.user.avatar}`
                : "/user/default-user.png"
            }
          />

          <TextField
            fullWidth
            variant="standard"
            placeholder="Viết bình luận công khai..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />

          <IconButton color="primary" onClick={handlePostComment}>
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Modal>
  );
}
