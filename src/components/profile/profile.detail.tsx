"use client";

import { useContext, useEffect } from "react";
import { Avatar, Box, Typography, Divider, Paper, Stack } from "@mui/material";
import { IUser } from "@/types/next-auth";
import { UserContext } from "@/lib/track.wrapper";
import PostCard from "./profile.post";

interface IProps {
  userId: string;
  users: IUser | null;
  posts: IPost[] | null;
}

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <Box textAlign="center">
    <Typography fontWeight={700} fontSize={16}>
      {value}
    </Typography>
    <Typography fontSize={13} color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const ProfileDetail = ({ userId, users, posts }: IProps) => {
  const { setUserInfoId } = useContext(UserContext) as IContext;

  useEffect(() => {
    setUserInfoId(userId);
  }, [userId]);

  if (!users) return null;

  const user = users;

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        px: 2,
        pb: 6,
      }}
    >
      {/* ================= COVER ================= */}
      <Box
        sx={{
          height: 320,
          borderRadius: 2,
          position: "relative",
          backgroundColor: "#e4e6eb",
        }}
      >
        <img
          src={
            user.coverPhoto
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.coverPhoto}`
              : "/default-cover.jpg"
          }
          alt="cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* AVATAR */}
        <Avatar
          src={
            user.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
              : "/user/default-user.png"
          }
          sx={{
            width: 180, // 👈 TO HƠN
            height: 180, // 👈 TO HƠN
            borderRadius: "50%", // 👈 TRÒN TUYỆT ĐỐI
            border: "6px solid white", // 👈 viền trắng dày như FB
            position: "absolute",
            bottom: -90, // 👈 đẩy xuống cho cân
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)", // 👈 nổi khối
            zIndex: 10,
          }}
        />
      </Box>

      <Box
        sx={{
          mt: 11,
          textAlign: "center",
        }}
      >
        {/* NAME */}
        <Typography fontSize={28} fontWeight={700} lineHeight={1.2}>
          {user.name}
        </Typography>

        {/* USERNAME */}
        <Typography fontSize={14} color="text.secondary" sx={{ mt: 0.5 }}>
          @{user.email.split("@")[0]}
        </Typography>

        {/* STATS */}
        <Stack direction="row" justifyContent="center" spacing={6} mt={3}>
          <StatItem label="Bài viết" value={posts?.length || 0} />
          <StatItem label="Người theo dõi" value={user.followersCount || 0} />
          <StatItem label="Đang theo dõi" value={user.followingCount || 0} />
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ================= POSTS FEED ================= */}
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Typography fontSize={18} fontWeight={700} mb={2}>
          Bài viết
        </Typography>

        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              session={null} // profile xem công khai
            />
          ))
        ) : (
          <Typography color="text.secondary">
            Bạn chưa có bài viết nào.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProfileDetail;
