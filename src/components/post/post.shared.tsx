"use client";
import { Box, Avatar, Typography } from "@mui/material";
import Link from "next/link";

export default function SharedPostCard({ post }: { post: any }) {
  if (!post) return null;

  return (
    <Box
      sx={{
        border: "1px solid #e4e6eb",
        borderRadius: 2,
        p: 1.5,
        mt: 1.5,
        bgcolor: "#f0f2f5",
      }}
    >
      {/* HEADER: USER GỐC */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar
          src={
            post.userId?.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${post.userId.avatar}`
              : "/user/default-user.png"
          }
          sx={{ width: 36, height: 36 }}
        />

        <Box>
          <Link
            href={`/profile/${post.userId?._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography fontWeight={600} fontSize={14}>
              {post.userId?.name}
            </Typography>
          </Link>
          <Typography fontSize={12} color="text.secondary">
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* CONTENT BÀI GỐC */}
      {post.content && (
        <Typography fontSize={14} sx={{ mb: 1.2 }}>
          {post.content}
        </Typography>
      )}

      {/* IMAGES */}
      {post.images?.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: post.images.length === 1 ? "1fr" : "1fr 1fr",
            gap: 0.5,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {post.images.slice(0, 4).map((img: string, i: number) => (
            <Box key={i} sx={{ position: "relative" }}>
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                style={{
                  width: "100%",
                  height: post.images.length === 1 ? "350" : "160px",
                  objectFit: "contain",
                }}
              />

              {/* Overlay +x ảnh */}
              {i === 3 && post.images.length > 4 && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 24,
                    fontWeight: 700,
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
      {post.videos?.length > 0 && (
        <Box mt={1}>
          <video
            controls
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/videos/${post.videos[0]}`}
            style={{
              width: "100%",
              borderRadius: 8,
              maxHeight: 400,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
