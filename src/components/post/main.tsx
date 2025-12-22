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
} from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import PostDetailModal from "./post.detail";
import Link from "next/link";
import { useToast } from "@/utils/toast";
import UpdatePostModal from "./post.update";
import SharePostModal from "./post.share";
import SharedPostCard from "./post.shared";
import ReportPostModal from "../report/report.post.modal";

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
  const toast = useToast();
  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState<
    string | null
  >(null);
  const [posts, setPosts] = useState<IPost[]>([]);

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const route = useRouter();
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState("");
  const [reportPostId, setReportPostId] = useState<string | null>(null);

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

  const handlePostComment = async (postId: string) => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!commentText.trim()) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { content: commentText, postId: postId },
    });

    if (res?.data?.success === true) {
      toast.success("Bình luận thành công");
    }
    if (res?.data?.success === false) {
      toast.error(res?.data?.message);
    }

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
      toast.success("Xóa Bài Post Thành Công");
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
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
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
      {/* ===== CHỦ BÀI VIẾT ===== */}
      {selectedPostIdForMenu &&
        posts.find((p) => p._id === selectedPostIdForMenu)?.userId._id ===
          session.user._id && (
          <>
            <MenuItem
              onClick={() => {
                setEditPostId(selectedPostIdForMenu);
                handleMenuClose();
              }}
            >
              <IconButton size="small">
                <Edit />
              </IconButton>
              Chỉnh sửa bài viết
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleDeletePost(selectedPostIdForMenu);
              }}
            >
              <IconButton size="small">
                <Delete />
              </IconButton>
              Xóa bài viết
            </MenuItem>
          </>
        )}

      {/* ===== KHÔNG PHẢI CHỦ BÀI VIẾT ===== */}
      {selectedPostIdForMenu &&
        posts.find((p) => p._id === selectedPostIdForMenu)?.userId._id !==
          session.user._id && (
          <MenuItem
            onClick={() => {
              setReportPostId(selectedPostIdForMenu);
              handleMenuClose();
            }}
          >
            <IconButton size="small">🚩</IconButton>
            Báo cáo bài viết
          </MenuItem>
        )}
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
            margin: { xs: "10px 8px", sm: "18px auto", md: "24px auto" },
            maxWidth: { xs: "100%", sm: 620, md: 720, lg: 820, xl: 920 },
            width: "100%",
            borderRadius: { xs: 1.5, sm: 3 },
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
                  src={
                    post.userId.avatar
                      ? post.userId.avatar
                      : "/user/default-user.png"
                  }
                  sx={{ cursor: "pointer", width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 } }} // responsive avatar
                />
              </Link>
            }
            action={
              session && (
                <IconButton
                  onClick={(e) => {
                    handleProfileMenuOpen(e);
                    setSelectedPostIdForMenu(post._id);
                  }}
                >
                  <MoreVert />
                </IconButton>
              )
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

          {/* CONTENT */}
          <CardContent>
            {/* ===== SHARE LABEL ===== */}
            {/* {post.sharedPostId && (
              <Typography
                fontSize={13}
                color="text.secondary"
                sx={{
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                🔁 <strong>{post.userId?.name}</strong> đã chia sẻ một bài viết
              </Typography>
            )} */}

            {/* ===== BIRTHDAY CARD ===== */}
            {post.content && (
              <Typography
                variant="body1"
                fontWeight="700"
                sx={{ mb: 1.25, fontSize: { xs: 14, sm: 16, md: 18 }, lineHeight: 1.45 }}
                onClick={() => setSelectedPostId(post._id)}
              >
                {post.content}
              </Typography>
            )}
            {post.postType === "BIRTHDAY" && post.taggedUserIds?.length > 0 && (
              <Box
                sx={{
                  mb: 1.8,
                  p: 2,
                  borderRadius: 2.5,
                  background:
                    "linear-gradient(135deg, #fff5f7 0%, #ffeef3 100%)",
                  border: "1px solid #f8bbd0",
                }}
              >
                {/* HEADER */}

                {/* USER */}
                <Box display="flex" alignItems="center" gap={1.2}>
                  <Avatar
                    src={
                      post.taggedUserIds[0].avatar
                        ? post.taggedUserIds[0].avatar
                        : "/user/default-user.png"
                    }
                    sx={{
                      width: 44,
                      height: 44,
                      border: "2px solid #f06292",
                    }}
                  />

                  <Box>
                    <Link
                      href={`/profile/${post.taggedUserIds[0]._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        fontWeight={700}
                        sx={{
                          color: "#d81b60",
                          lineHeight: 1.2,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {post.taggedUserIds[0].name}
                      </Typography>
                    </Link>

                    <Typography fontSize={12} color="text.secondary">
                      🎉 Hôm nay là sinh nhật của bạn ấy
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ===== CAPTION ===== */}

            {/* ===== SHARED POST ===== */}
            {post.sharedPostId && <SharedPostCard post={post.sharedPostId} />}
          </CardContent>

          {/* 📸 HIỂN THỊ ẢNH */}
          {/* 📸 HIỂN THỊ NHIỀU ẢNH */}
          {post.images && post.images.length > 0 && (
            <Box
              onClick={() => setSelectedPostId(post._id)}
              sx={{
                display: "grid",
                gridTemplateColumns:
                  post.images.length === 1 ? "1fr" : "1fr 1fr",
                gap: "4px",
                bgcolor: "#f0f2f5",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {post.images.slice(0, 4).map((img, idx) => {
                const isSingle = post.images.length === 1;

                return (
                  <Box
                    key={idx}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: isSingle
                        ? { xs: 220, sm: 320, md: 420 }
                        : { xs: 120, sm: 180, md: 240 }, // responsive heights for single vs multi
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    {/* Overlay +x */}
                    {idx === 3 && post.images.length > 4 && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: { xs: 18, sm: 26, md: 32 },
                          fontWeight: 700,
                        }}
                      >
                        +{post.images.length - 4}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
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
                src={post.videos[0]}
              />
            </Box>
          )}

          {/* LIKE / COMMENT / SHARE */}
          <CardActions
            disableSpacing
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #eee",
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              flexWrap: "wrap",
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
                checked={post.isLiked}
                onClick={() => handleLikes(post._id)}
              />
              <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>{post.likesCount} Likes</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
              onClick={() =>
                setOpenCommentBox(openCommentBox === post._id ? null : post._id)
              }
            >
              <IconButton size="small">
                <Comment fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>{post.commentsCount} Comments</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
              onClick={() => setSharePostId(post._id)}
            >
              <IconButton size="small">
                <Share fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>Share</Typography>
            </Box>
          </CardActions>

          {/* COMMENT INPUT */}
          {openCommentBox === post._id && (
            <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.75, sm: 1 } }}>
              <Divider sx={{ mb: 1 }} />
              <Paper
                component="form"
                sx={{
                  p: { xs: "6px 8px", sm: "6px 12px" },
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 3,
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
                  InputProps={{ disableUnderline: true, sx: { fontSize: { xs: 13, sm: 14 } } }}
                />
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handlePostComment(post._id)}
                >
                  <Send fontSize="small" />
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
      {editPostId && (
        <UpdatePostModal
          postId={editPostId}
          open={!!editPostId}
          onClose={() => setEditPostId(null)}
          session={session}
          onUpdated={() => {
            setEditPostId(null);
            route.refresh();
          }}
        />
      )}
      {sharePostId && (
        <SharePostModal
          open={!!sharePostId}
          postId={sharePostId}
          session={session}
          onClose={() => setSharePostId(null)}
          onShared={() => {
            setSharePostId(null);
            route.refresh();
          }}
        />
      )}
      {reportPostId && (
        <ReportPostModal
          postId={reportPostId}
          open={!!reportPostId}
          onClose={() => setReportPostId(null)}
          session={session}
        />
      )}
    </>
  );
};

export default PostList;
