"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";
import { useSession } from "next-auth/react";
import CommunityPostDetailModal from "./community.post.detail";

const PostList = () => {
  const { data: session } = useSession();
  const toast = useToast();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [openCommentBox, setOpenCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState<
    string | null
  >(null);
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  const isMenuOpen = Boolean(anchorEl);

  // ---------------- FETCH FEED POSTS ---------------- //
  const fetchFeedPosts = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/listCommunityIdWithPosts`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.data?.posts) {
      setPosts(res.data.posts);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, [session]);

  // ---------------- LIKE POST ---------------- //
  const handleLikes = async (postId: string) => {
    if (!session) return alert("Bạn cần đăng nhập!");

    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${postId}/toggle`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    fetchFeedPosts();
  };

  // ---------------- MENU ---------------- //
  const handleProfileMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setAnchorEl(e.currentTarget);
    setSelectedPostIdForMenu(postId);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // ---------------- DELETE POST ---------------- //
  const handleDeletePost = async (postId: string) => {
    const res = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res) toast.success("Xóa bài viết thành công!");

    handleMenuClose();
    fetchFeedPosts();
  };

  if (!posts.length) {
    return (
      <Typography textAlign="center" mt={3}>
        Không có bài viết nào.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ fontSize: 20, fontWeight: 700, mt: 2, mb: 2 }}>
        Hoạt động mới đây
      </Box>

      {posts.map((post) => (
        <Card
          key={post._id}
          sx={{
            margin: "20px auto",
            maxWidth: 650,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {/* ---------------- HEADER ---------------- */}
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
              session?.user._id === post.userId._id && (
                <IconButton onClick={(e) => handleProfileMenuOpen(e, post._id)}>
                  <MoreVert />
                </IconButton>
              )
            }
            title={
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {/* User name */}
                <Typography fontWeight={600}>{post.userId.name}</Typography>

                {/* Group info */}
                {post.communityId && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.3 }}>
                    <Avatar
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${post.communityId.avatar}`}
                      sx={{ width: 22, height: 22, mr: 1 }}
                    />

                    <Typography sx={{ fontSize: 13, color: "#65676b" }}>
                      Đăng trong nhóm <b>{post.communityId.name}</b>
                    </Typography>
                  </Box>
                )}
              </Box>
            }
            subheader={new Date(post.createdAt).toLocaleString()}
          />
          {/* ---------------- CONTENT ---------------- */}
          <CardContent>
            <Typography variant="h6">{post.content}</Typography>
          </CardContent>

          {/* ---------------- IMAGE GRID ---------------- */}
          {post.images?.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  post.images.length === 1 ? "1fr" : "1fr 1fr",
                gap: 1,
                p: 1,
              }}
              onClick={() => setSelectedPostId(post._id)}
            >
              {post.images.slice(0, 4).map((img, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                  {index === 3 && post.images.length > 4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 2,
                        color: "#fff",
                        fontSize: 32,
                      }}
                    >
                      +{post.images.length - 4}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* ---------------- VIDEO ---------------- */}
          {post.videos?.length > 0 && (
            <video
              controls
              style={{ width: "100%", maxHeight: 600 }}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/videos/${post.videos[0]}`}
            />
          )}

          {/* ---------------- ACTIONS ---------------- */}
          <CardActions sx={{ justifyContent: "space-around" }}>
            <Box>
              <Checkbox
                checked={post.isLiked}
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: "red" }} />}
                onClick={() => handleLikes(post._id)}
              />
              {post.likesCount}
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() =>
                setOpenCommentBox(openCommentBox === post._id ? null : post._id)
              }
            >
              <Comment />
              <Typography sx={{ ml: 1 }}>{post.commentsCount}</Typography>
            </Box>

            <Box>
              <Share />
            </Box>
          </CardActions>

          {/* COMMENT BOX */}
          {openCommentBox === post._id && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Divider sx={{ mb: 1 }} />
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              >
                <TextField
                  placeholder="Viết bình luận..."
                  variant="standard"
                  sx={{ flex: 1 }}
                  InputProps={{ disableUnderline: true }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <IconButton>
                  <Send />
                </IconButton>
              </Paper>
            </Box>
          )}
        </Card>
      ))}

      {/* ---------------- MENU ---------------- */}
      <Menu open={isMenuOpen} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuItem>
          <Edit sx={{ mr: 1 }} /> Chỉnh sửa
        </MenuItem>

        <MenuItem
          onClick={() =>
            selectedPostIdForMenu && handleDeletePost(selectedPostIdForMenu)
          }
        >
          <Delete sx={{ mr: 1 }} /> Xóa bài viết
        </MenuItem>
      </Menu>

      {selectedPostId && (
        <CommunityPostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId("")}
          session={session}
        />
      )}
    </>
  );
};

export default PostList;
