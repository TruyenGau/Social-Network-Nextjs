"use client";
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
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
} from "@mui/icons-material";
import Link from "next/link";

interface Props {
  post: IPost;
  session?: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const PostCard = ({ post, session, onLike, onComment, onShare }: Props) => {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        overflow: "hidden",
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

      {/* CONTENT */}
      <CardContent>
        {post.content && <Typography sx={{ mb: 1 }}>{post.content}</Typography>}
      </CardContent>

      {/* IMAGES */}
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
              sx={{ height: post.images.length === 1 ? 480 : 240 }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
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

      {/* ACTIONS */}
      <Divider />
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite sx={{ color: "red" }} />}
            checked={post.isLiked}
            onClick={onLike}
          />
          <Typography fontSize={13}>{post.likesCount}</Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer" }}
          onClick={onComment}
        >
          <Comment fontSize="small" />
          <Typography fontSize={13}>{post.commentsCount}</Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: "pointer" }}
          onClick={onShare}
        >
          <Share fontSize="small" />
          <Typography fontSize={13}>Chia sẻ</Typography>
        </Box>
      </CardActions>
    </Card>
  );
};

export default PostCard;
