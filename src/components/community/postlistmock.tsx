"use client";

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
  Comment,
  Send,
  Delete,
  Edit,
  Bookmark,
  BookmarkBorder,
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
  isSavedMode?: boolean;
}

const PostListMock = ({
  groupId,
  reloadFlag,
  adminId,
  isSavedMode,
}: IProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [openCommentBox, setOpenCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState<
    string | null
  >(null);

  const isMenuOpen = Boolean(anchorEl);

  /* ================= FETCH POSTS ================= */

  const fetchPosts = async () => {
    if (!session) return;

    const isSaved = isSavedMode === true;

    const url = isSaved
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/saved`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/group/${groupId}`;

    const res = await sendRequest<IBackendRes<any>>({
      url,
      method: isSaved ? "PUT" : "GET",
      queryParams: isSaved
        ? {}
        : { current: 1, pageSize: 20, sort: "-createdAt" },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res?.data) return;

    if (isSaved) {
      setPosts(Array.isArray(res.data) ? res.data : []);
    } else {
      setPosts(Array.isArray(res.data.result) ? res.data.result : []);
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

  /* ================= ACTIONS ================= */

  const handleLikes = async (postId: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${postId}/toggle`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    fetchPosts();
  };

  const handleSavePost = async (postId: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/save`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    fetchPosts();
  };

  const handleDeletePost = async (postId: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    toast.success("Xóa bài viết thành công");
    handleMenuClose();
    fetchPosts();
  };

  /* ===== PIN / UNPIN (ADMIN) ===== */

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    if (!session) return;

    const url = `${
      process.env.NEXT_PUBLIC_BACKEND_URL
    }/api/v1/communities/${groupId}/posts/${postId}/${
      isPinned ? "unpin" : "pin"
    }`;

    await sendRequest({
      url,
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    toast.success(isPinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết");
    handleMenuClose();
    fetchPosts();
  };

  /* ================= MENU ================= */

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, postId: string) => {
    setAnchorEl(e.currentTarget);
    setSelectedPostIdForMenu(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostIdForMenu(null);
  };

  const selectedPost = posts.find((p) => p._id === selectedPostIdForMenu);
  const isOwnerMenu = session?.user._id === selectedPost?.userId._id;
  const isAdminMenu = session?.user._id === adminId;

  /* ================= RENDER ================= */

  return (
    <>
      {posts.map((post) => {
        const isAdmin = session?.user._id === adminId;

        return (
          <Card
            key={post._id}
            sx={{
              margin: "24px auto",
              maxWidth: 600,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
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
                  />
                </Link>
              }
              action={
                session && (
                  <IconButton onClick={(e) => handleMenuOpen(e, post._id)}>
                    <MoreVert />
                  </IconButton>
                )
              }
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Link
                    href={`/profile/${post.userId._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {post.userId.name}
                  </Link>

                  {post.isPinned && (
                    <Typography fontSize={13} color="primary">
                      📌 Đã ghim
                    </Typography>
                  )}
                </Box>
              }
              subheader={new Date(post.createdAt).toLocaleDateString()}
            />

            {/* CONTENT */}
            <CardContent>
              <Typography
                variant="h6"
                onClick={() => setSelectedPostId(post._id)}
              >
                {post.content}
              </Typography>
            </CardContent>

            {/* IMAGES */}
            {post.images?.length > 0 && (
              <Box
                onClick={() => setSelectedPostId(post._id)}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    post.images.length === 1 ? "1fr" : "1fr 1fr",
                  gap: 1,
                  p: 1,
                }}
              >
                {post.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                    style={{
                      width: "100%",
                      height: post.images.length === 1 ? 400 : 220,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </Box>
            )}

            {/* ACTIONS */}
            <CardActions
              sx={{
                justifyContent: "space-around",
                borderTop: "1px solid #eee",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Checkbox
                  icon={<FavoriteBorder />}
                  checkedIcon={<Favorite sx={{ color: "red" }} />}
                  checked={post.isLiked}
                  onClick={() => handleLikes(post._id)}
                />
                <Typography>{post.likesCount} Likes</Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                onClick={() =>
                  setOpenCommentBox(
                    openCommentBox === post._id ? null : post._id
                  )
                }
              >
                <Comment />
                <Typography>{post.commentsCount} Comments</Typography>
              </Box>

              <IconButton onClick={() => handleSavePost(post._id)}>
                {post.isSaved ? (
                  <Bookmark color="primary" />
                ) : (
                  <BookmarkBorder />
                )}
              </IconButton>
            </CardActions>

            {/* COMMENT BOX */}
            {openCommentBox === post._id && (
              <Box sx={{ px: 2, py: 1 }}>
                <Divider />
                <Paper sx={{ display: "flex", alignItems: "center", p: 1 }}>
                  <TextField
                    variant="standard"
                    placeholder="Viết bình luận..."
                    sx={{ flex: 1 }}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                  />
                  <IconButton>
                    <Send />
                  </IconButton>
                </Paper>
              </Box>
            )}
          </Card>
        );
      })}

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        {isAdminMenu && (
          <MenuItem
            onClick={() =>
              handlePinPost(
                selectedPostIdForMenu!,
                selectedPost?.isPinned ?? false
              )
            }
          >
            {selectedPost?.isPinned
              ? "📌 Bỏ ghim bài viết"
              : "📌 Ghim bài viết"}
          </MenuItem>
        )}

        {(isOwnerMenu || isAdminMenu) && (
          <MenuItem>
            <Edit sx={{ mr: 1 }} /> Chỉnh sửa bài viết
          </MenuItem>
        )}

        <MenuItem onClick={() => handleSavePost(selectedPostIdForMenu!)}>
          {selectedPost?.isSaved ? (
            <>
              <Bookmark sx={{ mr: 1 }} /> Bỏ lưu bài viết
            </>
          ) : (
            <>
              <BookmarkBorder sx={{ mr: 1 }} /> Lưu bài viết
            </>
          )}
        </MenuItem>

        {(isOwnerMenu || isAdminMenu) && (
          <MenuItem onClick={() => handleDeletePost(selectedPostIdForMenu!)}>
            <Delete sx={{ mr: 1 }} /> Xóa bài viết
          </MenuItem>
        )}
      </Menu>

      {selectedPostId && (
        <CommunityPostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId("")}
          session={session}
          refresh={() => router.refresh()}
        />
      )}
    </>
  );
};

export default PostListMock;
