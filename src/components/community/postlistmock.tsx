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
  const [activePostTab, setActivePostTab] = useState<"APPROVED" | "PENDING">(
    "APPROVED"
  );

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
        : {
            current: 1,
            pageSize: 20,
            sort: "-createdAt",
            status: activePostTab,
          },
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
  }, [groupId, session, reloadFlag, selectedPostId, activePostTab]);

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

  const handleApprovePost = async (postId: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/approve`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    toast.success("Đã duyệt bài viết");

    handleMenuClose();

    // ✅ CHUYỂN SANG TAB ĐÃ DUYỆT
    setActivePostTab("APPROVED");
  };

  const handleRejectPost = async (postId: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/reject`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    toast.success("Đã từ chối bài viết");
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
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, sm: 3 },
          mb: { xs: 1.5, sm: 2 },
          borderBottom: "1px solid #eee",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography
          onClick={() => setActivePostTab("APPROVED")}
          sx={{
            cursor: "pointer",
            pb: 1,
            fontSize: { xs: 14, sm: 15, md: 16 },
            fontWeight: activePostTab === "APPROVED" ? 700 : 500,
            borderBottom:
              activePostTab === "APPROVED" ? "3px solid #1877f2" : "none",
            color: activePostTab === "APPROVED" ? "#1877f2" : "#555",
          }}
        >
          Bài viết
        </Typography>

        <Typography
          onClick={() => setActivePostTab("PENDING")}
          sx={{
            cursor: "pointer",
            pb: 1,
            fontSize: { xs: 14, sm: 15, md: 16 },
            fontWeight: activePostTab === "PENDING" ? 700 : 500,
            borderBottom:
              activePostTab === "PENDING" ? "3px solid #f59e0b" : "none",
            color: activePostTab === "PENDING" ? "#f59e0b" : "#555",
          }}
        >
          Chờ duyệt
        </Typography>
      </Box>

      {posts.map((post) => {
        const isAdmin = session?.user._id === adminId;

        return (
          <Card
            key={post._id}
            sx={{
              margin: { xs: "12px 8px", sm: "20px auto", md: "28px auto" },
              maxWidth: { xs: "100%", sm: 620, md: 720, lg: 820, xl: 920 },
              width: "100%", // ⬅️ đảm bảo full trong container
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
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
                    sx={{
                      width: { xs: 36, sm: 44 },
                      height: { xs: 36, sm: 44 },
                    }}
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
                    <Typography
                      sx={{ fontSize: { xs: 12, sm: 13 } }}
                      color="primary"
                    >
                      📌 Đã ghim
                    </Typography>
                  )}

                  {post.status === "PENDING" && (
                    <Typography
                      sx={{
                        fontSize: { xs: 11, sm: 12 },
                        px: 1,
                        borderRadius: 1,
                        bgcolor: "#fef3c7",
                        color: "#b45309",
                        fontWeight: 600,
                      }}
                    >
                      Chờ duyệt
                    </Typography>
                  )}
                </Box>
              }
              subheader={new Date(post.createdAt).toLocaleDateString()}
            />

            {/* CONTENT */}
            <CardContent>
              <Typography
                variant="body1"
                onClick={() => setSelectedPostId(post._id)}
                sx={{ fontSize: { xs: 14, sm: 16, md: 18 }, lineHeight: 1.45 }}
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
                  <Box
                    key={idx}
                    component="img"
                    src={img}
                    sx={{
                      width: "100%",
                      height:
                        post.images.length === 1
                          ? { xs: 220, sm: 320, md: 420 }
                          : { xs: 120, sm: 160, md: 220 },
                      maxHeight:
                        post.images.length === 1
                          ? { xs: "40vh", md: "60vh" }
                          : { md: 320 },
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
            )}
            {post.videos?.length > 0 && (
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
            {/* ACTIONS */}
            <CardActions
              sx={{
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
                <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>
                  {post.likesCount} Likes
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                onClick={() =>
                  setOpenCommentBox(
                    openCommentBox === post._id ? null : post._id
                  )
                }
              >
                <Comment />
                <Typography sx={{ fontSize: { xs: 13, sm: 14 } }}>
                  {post.commentsCount} Comments
                </Typography>
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
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: { xs: 13, sm: 14 } },
                    }}
                  />
                  <IconButton size="small">
                    <Send fontSize="small" />
                  </IconButton>
                </Paper>
              </Box>
            )}
          </Card>
        );
      })}

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
        {/* ADMIN APPROVE / REJECT (CHỈ TAB CHỜ DUYỆT) */}
        {isAdminMenu && activePostTab === "PENDING" && (
          <>
            <MenuItem onClick={() => handleApprovePost(selectedPostIdForMenu!)}>
              ✅ Duyệt bài viết
            </MenuItem>

            <MenuItem
              onClick={() => handleRejectPost(selectedPostIdForMenu!)}
              sx={{ color: "error.main" }}
            >
              ❌ Từ chối bài viết
            </MenuItem>

            <Divider />
          </>
        )}

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
