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
    <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "text.secondary" }}>
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
        maxWidth: { xs: "100%", sm: 760, md: 1000, lg: 1100, xl: 1200 },
        mx: "auto",
        px: { xs: 2, sm: 3 },
        pb: { xs: 6, sm: 8 },
      }}
    >
      {/* ================= COVER ================= */}
      <Box
        sx={{
          height: { xs: 180, sm: 320, md: 380, lg: 420 },
          borderRadius: 2,
          position: "relative",
          backgroundColor: "#e4e6eb",
        }}
      >
        <img
          src={user.coverPhoto ? user.coverPhoto : "/default-cover.jpg"}
          alt="cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* AVATAR */}
        <Avatar
          src={user.avatar ? user.avatar : "/user/default-user.png"}
          sx={{
            width: { xs: 88, sm: 120, md: 160, lg: 180 },
            height: { xs: 88, sm: 120, md: 160, lg: 180 },
            borderRadius: "50%",
            border: { xs: "4px solid white", sm: "6px solid white" },
            position: "absolute",
            bottom: { xs: -44, sm: -60, md: -72, lg: -90 },
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 10,
          }}
        />
      </Box>

      <Box
        sx={{
          mt: { xs: 8, sm: 11 },
          textAlign: "center",
        }}
      >
        {/* NAME */}
        <Typography sx={{ fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 700, lineHeight: 1.2 }}>
          {user.name}
        </Typography>

        {/* USERNAME */}
        <Typography sx={{ fontSize: { xs: 12, sm: 14 }, color: "text.secondary", mt: 0.5 }}>
          @{user.email.split("@")[0]}
        </Typography>

        {/* STATS */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center" spacing={{ xs: 2.5, sm: 6 }} mt={3}>
          <StatItem label="Bài viết" value={posts?.length || 0} />
          <StatItem label="Người theo dõi" value={user.followersCount || 0} />
          <StatItem label="Đang theo dõi" value={user.followingCount || 0} />
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ================= POSTS FEED ================= */}
      <Box sx={{ maxWidth: { xs: "100%", sm: 640, md: 760 }, mx: "auto" }}>
        <Typography sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 700, mb: 2 }}>
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
