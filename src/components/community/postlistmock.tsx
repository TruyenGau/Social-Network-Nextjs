"use client";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
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

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CommunityPostDetailModal from "./community.post.detail";
import { useToast } from "@/utils/toast";

interface IProps {
  groupId: string | "";
  reloadFlag: boolean;
  adminId: string;
}

const PostListMock = ({ groupId, reloadFlag, adminId }: IProps) => {
  const [openCommentBox, setOpenCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const { data: session } = useSession();
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const route = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState<
    string | null
  >(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const isMenuOpen = Boolean(anchorEl);
  const toast = useToast();

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostIdForMenu(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const fetchPosts = async () => {
    const res = await sendRequest<IBackendRes<IModelPaginate<IPost>>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/group/${groupId}`,
      method: "GET",
      queryParams: { current: 1, pageSize: 20, sort: "-createdAt" },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.data) {
      setPosts(res.data.result);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [groupId, session, reloadFlag, selectedPostId]);

  if (!posts || posts.length === 0) {
    return (
      <Typography textAlign="center" mt={3} color="gray">
        Nhóm chưa có bài viết nào.
      </Typography>
    );
  }
  const handleLikes = async (postId: string) => {
    if (!session) return alert("Bạn cần đăng nhập!");
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${postId}/toggle`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    fetchPosts();
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
    fetchPosts();
  };
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
                  src={
                    post.userId.avatar
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${post.userId.avatar}`
                      : "/user/default-user.png"
                  }
                  sx={{ cursor: "pointer" }}
                />
              </Link>
            }
            action={
              (session?.user._id === post.userId._id ||
                session?.user._id === adminId) && (
                <IconButton
                  onClick={(e) => {
                    handleProfileMenuOpen(e, post._id);
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

          {/* IMAGE */}
          {post.images && post.images.length > 0 && (
            <Box
              onClick={() => setSelectedPostId(post._id)}
              sx={{
                display: "grid",
                gridTemplateColumns:
                  post.images.length === 1
                    ? "1fr"
                    : post.images.length === 2
                    ? "1fr 1fr"
                    : "1fr 1fr", // 3 ảnh trở lên sẽ grid 2 cột
                gap: 1,
                backgroundColor: "#fafafa",
                p: 1,
                borderRadius: "8px",
              }}
            >
              {post.images.slice(0, 4).map((img, idx) => (
                <Box key={idx} sx={{ position: "relative" }}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                    style={{
                      width: "100%",
                      height: post.images.length === 1 ? "auto" : "220px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  {/* Nếu nhiều hơn 4 ảnh → overlay " + x ảnh " */}
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
          )}

          {/* VIDEO */}
          {post.videos && post.videos.length > 0 && (
            <Box sx={{ width: "100%", bgcolor: "#000" }}>
              <video
                controls
                style={{ width: "100%", maxHeight: 600 }}
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

          {/* ACTION BUTTONS */}
          <CardActions
            disableSpacing
            sx={{
              display: "flex",
              justifyContent: "space-around",
              borderTop: "1px solid #eee",
              paddingY: 1,
            }}
          >
            {/* LIKE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
                checked={post.isLiked}
                onClick={() => handleLikes(post._id)}
              />
              <Typography variant="body2">{post.likesCount} Likes</Typography>
            </Box>

            {/* COMMENT */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
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

            {/* SHARE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="small">
                <Share />
              </IconButton>
              <Typography variant="body2">Share</Typography>
            </Box>
          </CardActions>

          {/* COMMENT BOX */}
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
                onSubmit={(e) => e.preventDefault()}
              >
                <TextField
                  variant="standard"
                  placeholder="Viết bình luận..."
                  sx={{ flex: 1 }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton color="primary">
                  <Send />
                </IconButton>
              </Paper>
            </Box>
          )}
        </Card>
      ))}

      {/* MENU EDIT / DELETE */}
      <Menu
        anchorEl={anchorEl}
        id="post-menu"
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { boxShadow: "none", border: "1px solid #ddd", borderRadius: 2 },
        }}
      >
        <MenuItem>
          <Edit sx={{ mr: 1 }} /> Chỉnh sửa bài viết
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

      {selectedPostId && (
        <CommunityPostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId("")}
          session={session}
          refresh={() => route.refresh()}
        />
      )}
    </>
  );
};

export default PostListMock;
