"use client";
import { Box, Avatar, Typography } from "@mui/material";
import Link from "next/link";

export default function SharedPostCard({ post }: { post: any }) {
  if (!post) return null;

  return (
    <Box
      sx={{
        border: "1px solid #e4e6eb",
        borderRadius: { xs: 1.5, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        mt: { xs: 1, sm: 1.5 },
        bgcolor: "#f0f2f5",
      }}
    >
      {/* HEADER: USER GỐC */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar
          src={
            post.userId?.avatar ? post.userId.avatar : "/user/default-user.png"
          }
          sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 } }}
        />

        <Box>
          <Link
            href={`/profile/${post.userId?._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>
              {post.userId?.name}
            </Typography>
          </Link>
          <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: "text.secondary" }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* CONTENT BÀI GỐC */}
      {post.content && (
        <Typography sx={{ fontSize: { xs: 13, sm: 14 }, mb: 1.2 }}>
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
              <Box
                component="img"
                src={img}
                sx={{
                  width: "100%",
                  height: post.images.length === 1 ? { xs: 220, sm: 320 } : { xs: 100, sm: 160 },
                  objectFit: "cover",
                  display: "block",
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
                    fontSize: { xs: 16, sm: 22, md: 24 },
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
          <Box
            component="video"
            controls
            src={post.videos[0]}
            sx={{ width: "100%", borderRadius: 1, maxHeight: { xs: 240, sm: 400 } }}
          />
        </Box>
      )}
    </Box>
  );
}
