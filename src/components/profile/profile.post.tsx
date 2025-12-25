"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  IconButton,
  Typography,
  Divider,
  Paper,
  TextField,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  Send,
} from "@mui/icons-material";
import Link from "next/link";
import { sendRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/toast";
import { useSession } from "next-auth/react";
import PostDetailModal from "./profile.post.detail";

interface Props {
  post: IPost;
}

const PostCard = ({ post }: Props) => {
  const route = useRouter();
  const toast = useToast();

  const [openComment, setOpenComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const { data: session } = useSession();
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  const handleLike = async () => {
    if (!session?.access_token) {
      toast.error("Bạn cần đăng nhập");
      return;
    }

    try {
      setLoadingLike(true);
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/likes/${post._id}/toggle`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      route.refresh();
    } catch (err) {
      toast.error("Lỗi khi like bài viết");
    } finally {
      setLoadingLike(false);
    }
  };

  /* =========================
   * 💬 COMMENT
   * ========================= */
  const handleComment = async () => {
    if (!session?.access_token) {
      toast.error("Bạn cần đăng nhập");
      return;
    }

    if (!commentText.trim()) return;

    try {
      setLoadingComment(true);
      const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          content: commentText,
          postId: post._id,
        },
      });

      if (res?.data?.success) {
        toast.success("Bình luận thành công");
        setCommentText("");
        setOpenComment(false);
        route.refresh();
      } else {
        toast.error(res?.data?.message || "Không thể bình luận");
      }
    } catch (err) {
      toast.error("Lỗi khi gửi bình luận");
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        {/* ================= HEADER ================= */}
        <CardHeader
          avatar={
            <Link href={`/profile/${post.userId._id}`}>
              <Avatar
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                  post.userId.avatar || "/user/default-user.png"
                }`}
              />
            </Link>
          }
          title={
            <Link
              href={`/profile/${post.userId._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography fontWeight={600}>{post.userId.name}</Typography>
            </Link>
          }
          subheader={new Date(post.createdAt).toLocaleDateString()}
          action={
            session?.user?._id === post.userId._id && (
              <IconButton>
                <MoreVert />
              </IconButton>
            )
          }
        />

        {/* ================= CONTENT ================= */}
        <CardContent>
          {post.content && (
            <Typography
              sx={{ mb: 1 }}
              onClick={() => setSelectedPostId(post._id)}
            >
              {post.content}
            </Typography>
          )}
        </CardContent>

        {/* ================= IMAGES ================= */}
        {post.images?.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: post.images.length === 1 ? "1fr" : "1fr 1fr",
              gap: "4px",
              bgcolor: "#f0f2f5",
            }}
          >
            {post.images.slice(0, 4).map((img, idx) => (
              <Box
                key={idx}
                sx={{
                  height:
                    post.images.length === 1
                      ? { xs: 280, sm: 420 }
                      : { xs: 140, sm: 220 },
                }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${img}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
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
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.videos[0]}`}
            />
          </Box>
        )}
        {/* ================= ACTIONS ================= */}
        <Divider />
        <CardActions
          sx={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {/* ❤️ LIKE */}
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
              checked={post.isLiked}
              onClick={(e) => {
                e.stopPropagation(); // ⭐ BẮT BUỘC
                handleLike();
              }}
              disabled={loadingLike}
              sx={{
                color: post.isLiked ? "red" : "inherit", // ⭐ GIỮ MÀU
                "&.Mui-checked": {
                  color: "red",
                },
              }}
            />

            <Typography fontSize={13}>{post.likesCount}</Typography>
          </Box>

          {/* 💬 COMMENT */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: "pointer" }}
            onClick={() => setOpenComment(!openComment)}
          >
            <Comment fontSize="small" />
            <Typography fontSize={13}>{post.commentsCount}</Typography>
          </Box>

          {/* 🔁 SHARE (để sau) */}
          <Box display="flex" alignItems="center" gap={1}>
            <Share fontSize="small" />
            <Typography fontSize={13}>Chia sẻ</Typography>
          </Box>
        </CardActions>

        {/* ================= COMMENT INPUT ================= */}
        {openComment && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Paper
              sx={{
                p: "6px 12px",
                display: "flex",
                alignItems: "center",
                borderRadius: 3,
                border: "1px solid #ccc",
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
              <IconButton
                color="primary"
                size="small"
                disabled={loadingComment}
                onClick={handleComment}
              >
                <Send fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        )}
        {selectedPostId && (
          <PostDetailModal
            postId={selectedPostId}
            onClose={() => setSelectedPostId("")}
            session={session}
            refresh={() => route.refresh()}
          />
        )}
      </Card>
    </>
  );
};

export default PostCard;
