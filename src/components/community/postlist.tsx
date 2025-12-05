"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  IconButton,
  Paper,
  TextField,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  MoreVert,
  Share,
  Comment,
  Send,
  Delete,
  Edit,
} from "@mui/icons-material";

// ---------------------- MOCK DATA DEMO ---------------------- //
const mockPosts = [
  {
    _id: "p1",
    content: "Ảnh chụp hoàng hôn siêu đẹp 😍",
    images: ["https://images.unsplash.com/photo-1501973801540-537f08ccae7b"],
    videos: [],
    isLiked: false,
    likesCount: 12,
    commentsCount: 5,
    createdAt: "2025-02-12",
    userId: {
      _id: "u1",
      name: "Im Truyền Lê",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    _id: "p2",
    content: "Đi phượt cuối tuần cùng bạn bè 😁🔥",
    images: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"],
    videos: [],
    isLiked: true,
    likesCount: 45,
    commentsCount: 12,
    createdAt: "2025-02-10",
    userId: {
      _id: "u2",
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    _id: "p3",
    content: "Clip vui hôm qua 😂😂",
    images: [],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    isLiked: false,
    likesCount: 9,
    commentsCount: 3,
    createdAt: "2025-02-09",
    userId: {
      _id: "u3",
      name: "Lê Phương",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  },
];

const PostList = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [openCommentBox, setOpenCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const isMenuOpen = Boolean(anchorEl);

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePostComment = (postId: string) => {
    if (!commentText.trim()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );

    setCommentText("");
    setOpenCommentBox(null);
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem>
        <IconButton size="small">
          <Edit />
        </IconButton>
        Chỉnh sửa bài viết
      </MenuItem>
      <MenuItem>
        <IconButton size="small">
          <Delete />
        </IconButton>
        Xóa bài viết
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <Box
        sx={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#1c1e21",
          mb: 2,
          mt: 1,
          px: 1,
          marginLeft: "10%",
        }}
      >
        Hoạt động mới đây
      </Box>

      {posts.map((post) => (
        <Card
          key={post._id}
          sx={{
            margin: "20px auto",
            maxWidth: 600,
            borderRadius: "12px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            background: "#fff",
          }}
        >
          {/* ----------------- HEADER ----------------- */}
          <Box sx={{ display: "flex", alignItems: "center", p: "12px 16px" }}>
            <Avatar
              src={post.userId.avatar}
              sx={{ width: 45, height: 45, cursor: "pointer" }}
            />

            <Box sx={{ ml: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {post.userId.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#65676b" }}>
                {post.createdAt}
              </Typography>
            </Box>

            <Box sx={{ marginLeft: "auto" }}>
              <IconButton onClick={(e) => handleProfileMenuOpen(e, post._id)}>
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* ----------------- CONTENT TEXT ----------------- */}
          {post.content && (
            <Typography sx={{ px: 2, pb: 1, fontSize: 15 }}>
              {post.content}
            </Typography>
          )}

          {/* ----------------- IMAGE ----------------- */}
          {post.images.length > 0 && (
            <Box sx={{ width: "100%", background: "#000" }}>
              <img
                src={post.images[0]}
                style={{
                  width: "100%",
                  maxHeight: "600px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          {/* ----------------- VIDEO ----------------- */}
          {post.videos.length > 0 && (
            <Box sx={{ width: "100%", background: "#000" }}>
              <video
                controls
                style={{
                  width: "100%",
                  maxHeight: "600px",
                }}
                src={post.videos[0]}
              />
            </Box>
          )}

          {/* ----------------- ACTION BAR ----------------- */}
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "space-around",
              borderTop: "1px solid #e4e6eb",
              borderBottom: "1px solid #e4e6eb",
              paddingY: 1,
            }}
          >
            {/* LIKE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
                checked={post.isLiked}
                onClick={() => handleLike(post._id)}
              />
              <Typography sx={{ fontSize: 14 }}>{post.likesCount}</Typography>
            </Box>

            {/* COMMENT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={() =>
                setOpenCommentBox(openCommentBox === post._id ? null : post._id)
              }
            >
              <Comment />
              <Typography sx={{ fontSize: 14 }}>
                {post.commentsCount}
              </Typography>
            </Box>

            {/* SHARE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Share />
              <Typography sx={{ fontSize: 14 }}>Share</Typography>
            </Box>
          </CardActions>

          {/* ----------------- COMMENT BOX ----------------- */}
          {openCommentBox === post._id && (
            <Box sx={{ px: 2, py: 1 }}>
              <Paper
                sx={{
                  p: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "20px",
                  border: "1px solid #ddd",
                }}
              >
                <TextField
                  variant="standard"
                  placeholder="Viết bình luận..."
                  sx={{ flex: 1 }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton onClick={() => handlePostComment(post._id)}>
                  <Send />
                </IconButton>
              </Paper>
            </Box>
          )}
        </Card>
      ))}

      {renderMenu}
    </>
  );
};

export default PostList;
