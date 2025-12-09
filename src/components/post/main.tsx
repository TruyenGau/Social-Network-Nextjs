"use client";
import React, { useEffect, useState } from "react";
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
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  IconButton,
  Typography,
  Divider,
  TextField,
  Paper,
  Menu,
  MenuItem,
  Modal,
  Button,
} from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import PostDetailModal from "./post.detail";
import Link from "next/link";

interface IProps {
  session: any;
  initPostId: any;
}

const PostList = ({ session, initPostId }: IProps) => {
  const [openCommentBox, setOpenCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [shareTitle, setShareTitle] = useState<string>("");

  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState<
    string | null
  >(null);
  const [posts, setPosts] = useState<IPost[]>([]);

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const route = useRouter();

  useEffect(() => {
    if (initPostId) {
      setSelectedPostId(initPostId);
    } else {
      setSelectedPostId(""); // ⬅ đảm bảo không mở modal khi reload
    }
  }, [initPostId]);

  useEffect(() => {
    if (!session?.access_token) return;

    const fetchData = async () => {
      const res = await sendRequest<IBackendRes<IModelPaginate<IPost>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`,
        method: "GET",
        queryParams: { current: 1, pageSize: 20, sort: "-createdAt" },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      setPosts(res.data?.result ?? []);
      setIsLoaded(true);
    };

    fetchData();
  }, [session]); // fetch lại khi session thay đổi

  const handleLikes = async (postId: string) => {
    if (!session) return alert("Bạn cần đăng nhập!");
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${postId}/toggle`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    route.refresh();
  };

  // ===== SHARE POST (CONFIRM) =====
  const handleShareConfirm = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!sharePostId) return;

    // 1. Gọi API share
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${sharePostId}/share`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { namePost: shareTitle }, // tiêu đề bạn nhập trong modal
    });

    // 2. Đóng modal + clear input
    setSharePostId(null);
    setShareTitle("");

    // 3. Giống hệt PostForm: refresh page để list post reload
    route.refresh();
  };


  const handlePostComment = async (postId: string) => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!commentText.trim()) return;

    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { content: commentText, postId: postId },
    });

    setCommentText("");
    setOpenCommentBox(null);
    route.refresh();
  };

  const handleDeletePost = async (postId: string) => {
    const res = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res) {
      alert("Xóa Bài Post Thành Công");
      handleMenuClose();
    }
    route.refresh();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          boxShadow: "none",
          border: "1px solid #ddd",
          borderRadius: 2,
        },
      }}
    >
      <MenuItem>
        <Link
          style={{ color: "unset", textDecoration: "unset" }}
          href={`/profile/${session?.user._id}`}
        >
          <IconButton size="small">
            <Edit />
          </IconButton>
          Chỉnh Sửa Bài Viết
        </Link>
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleDeletePost(selectedPostIdForMenu!);
        }}
      >
        <IconButton size="small">
          <Delete />
        </IconButton>
        Xóa Bài Viết
      </MenuItem>
    </Menu>
  );
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  return (
    <>
      {posts.map((post) => (
        <Card
          key={post._id}
          sx={{
            margin: "24px auto",
            maxWidth: 600,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* HEADER */}

          <CardHeader
            avatar={
              <Link href={`/profile/${post.userId._id}`}>
                <Avatar
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${post.userId.avatar}`}
                  sx={{ cursor: "pointer" }} // 👈 THÊM ĐỂ BIẾT LÀ CLICK ĐƯỢC
                />
              </Link>
            }
            action={
              <IconButton onClick={handleProfileMenuOpen}>
                <MoreVert
                  onClick={(e) => {
                    setSelectedPostIdForMenu(post._id);
                  }}
                />
              </IconButton>
            }
            title={
              <Link
                href={`/profile/${post.userId._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {post.userId?.name}
              </Link>
            }
            subheader={new Date(post.createdAt).toLocaleDateString()}
          />

          {/* 📸 HIỂN THỊ ẢNH */}
          {post.images && post.images.length > 0 && (
            <CardMedia
              component="img"
              onClick={() => setSelectedPostId(post._id)}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${post.images[0]}`}
              sx={{
                width: "100%",
                maxHeight: "600px",
                objectFit: "contain",
                backgroundColor: "#fafafa",
              }}
            />
          )}

          {/* 🎬 HIỂN THỊ VIDEO */}
          {post.videos && post.videos.length > 0 && (
            <Box
              sx={{ width: "100%", bgcolor: "#000" }}
              onClick={() => setSelectedPostId(post._id)}
            >
              <video
                controls
                style={{
                  width: "100%",
                  maxHeight: "600px",
                  borderRadius: "8px",
                }}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/videos/${post.videos[0]}`}
              />
            </Box>
          )}

          {/* CONTENT */}
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {post.content}
            </Typography>
          </CardContent>

          {/* LIKE / COMMENT / SHARE */}
          <CardActions
            disableSpacing
            sx={{
              display: "flex",
              justifyContent: "space-around",
              borderTop: "1px solid #eee",
              paddingY: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
                checked={post.isLiked}
                onClick={() => handleLikes(post._id)}
              />
              <Typography variant="body2">{post.likesCount} Likes</Typography>
            </Box>

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
              <IconButton size="small">
                <Comment />
              </IconButton>
              <Typography variant="body2">
                {post.commentsCount} Comments
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={() => {
                setSharePostId(post._id);  // mở modal
                setShareTitle("");
              }}
            >
              <IconButton size="small">
                <Share />
              </IconButton>
              <Typography variant="body2">Share</Typography>
            </Box>
          </CardActions>

          {/* COMMENT INPUT */}
          {openCommentBox === post._id && (
            <Box sx={{ px: 2, py: 1 }}>
              <Divider sx={{ mb: 1 }} />
              <Paper
                component="form"
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                onSubmit={(e) => e.preventDefault()} // tránh reload trang
              >
                <TextField
                  variant="standard"
                  placeholder="Viết bình luận..."
                  sx={{ flex: 1 }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton
                  color="primary"
                  onClick={() => handlePostComment(post._id)}
                >
                  <Send />
                </IconButton>
              </Paper>
            </Box>
          )}
          {renderMenu}
        </Card>
      ))}
      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId("")}
          session={session}
          refresh={() => route.refresh()}
        />
      )}

      {/* 🔥 MODAL CHIA SẺ BÀI VIẾT */}
      <Modal
        open={!!sharePostId}
        onClose={() => setSharePostId(null)}
        sx={{
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,0,0.2)",
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
            p: 2,
            width: "90%",
            maxWidth: 500,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Chia sẻ
          </Typography>

          {/* Thông tin user đang share */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
            <Avatar
              src={
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${session?.user?.avatar}` ||
                ""
              }
            />
            <Box>
              <Typography fontWeight="bold">
                {session?.user?.name || "Bạn"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bảng feed • Chỉ mình tôi
              </Typography>
            </Box>
          </Box>

          {/* Ô nhập tiêu đề / cảm nghĩ */}
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Hãy nói gì đó về nội dung này..."
            value={shareTitle}
            onChange={(e) => setShareTitle(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => setSharePostId(null)}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleShareConfirm}>
              CHIA SẺ NGAY
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PostList;
