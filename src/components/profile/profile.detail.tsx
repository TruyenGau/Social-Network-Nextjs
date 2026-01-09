"use client";

import { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Drawer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { IUser } from "@/types/next-auth";
import { UserContext } from "@/lib/track.wrapper";
import PostCard from "./profile.post";
import ProfileInfomation from "@/components/profile/profile.info";
import JoinedGroupsMock from "@/components/profile/profile.joinedgroupsmock";
import { sendRequest } from "@/utils/api";

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
  const [openMobileInfo, setOpenMobileInfo] = useState(false);
  const [openFollow, setOpenFollow] = useState(false);
  const [followType, setFollowType] = useState<"followers" | "following">(
    "followers"
  );
  const [followList, setFollowList] = useState<any[]>([]);

  useEffect(() => {
    setUserInfoId(userId);
  }, [userId]);

  if (!users) return null;

  const user = users;
  const fetchFollowers = async () => {
    const res = await sendRequest<IBackendRes<any[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/followers/${userId}`,
      method: "GET",
    });

    setFollowList(res?.data ?? []);
    setFollowType("followers");
    setOpenFollow(true);
    console.log("followers:", res);
  };

  const fetchFollowing = async () => {
    const res = await sendRequest<IBackendRes<any[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/following/${userId}`,
      method: "GET",
    });

    setFollowList(res?.data ?? []);
    setFollowType("following");
    setOpenFollow(true);
    console.log("fetchFollowing:", res);
  };

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
          src={
            user.coverPhoto
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.coverPhoto}`
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
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.avatar}`
              : "/user/default-user.png"
          }
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

      {/* Mobile: floating icon to open profile info */}
      <Box
        sx={{
          position: "fixed",
          top: 88,
          right: 12,
          zIndex: 1400,
          display: { xs: "block", sm: "none" },
        }}
      >
        <IconButton
          aria-label="Thông tin"
          onClick={() => setOpenMobileInfo(true)}
          size="small"
          sx={{
            bgcolor: "background.paper",
            boxShadow: 3,
            width: 40,
            height: 40,
            p: 0.6,
            borderRadius: 1,
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      </Box>

      <Drawer
        open={openMobileInfo}
        onClose={() => setOpenMobileInfo(false)}
        anchor="right"
        PaperProps={{ sx: { width: { xs: "100%", sm: 340 } } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Thông tin
          </Typography>
          <IconButton onClick={() => setOpenMobileInfo(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <ProfileInfomation />
          <Box mt={2}>{/* <JoinedGroupsMock /> */}</Box>
        </Box>
      </Drawer>

      <Box
        sx={{
          mt: { xs: 8, sm: 11 },
          textAlign: "center",
        }}
      >
        {/* NAME */}
        <Typography
          sx={{
            fontSize: { xs: 20, sm: 24, md: 28 },
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {user.name}
        </Typography>

        {/* USERNAME */}
        <Typography
          sx={{
            fontSize: { xs: 12, sm: 14 },
            color: "text.secondary",
            mt: 0.5,
          }}
        >
          @{user.email.split("@")[0]}
        </Typography>

        {/* STATS */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          spacing={{ xs: 2.5, sm: 6 }}
          mt={3}
        >
          <StatItem label="Bài viết" value={posts?.length || 0} />
          <Box onClick={fetchFollowers} sx={{ cursor: "pointer" }}>
            <StatItem label="Người theo dõi" value={user.followersCount || 0} />
          </Box>

          <Box onClick={fetchFollowing} sx={{ cursor: "pointer" }}>
            <StatItem label="Đang theo dõi" value={user.followingCount || 0} />
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ================= POSTS FEED ================= */}
      <Box sx={{ maxWidth: { xs: "100%", sm: 640, md: 760 }, mx: "auto" }}>
        <Typography
          sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: 700, mb: 2 }}
        >
          Bài viết
        </Typography>

        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <Typography color="text.secondary">
            Bạn chưa có bài viết nào.
          </Typography>
        )}
      </Box>
      <Dialog
        open={openFollow}
        onClose={() => setOpenFollow(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {followType === "followers" ? "Người theo dõi" : "Đang theo dõi"}
          <IconButton onClick={() => setOpenFollow(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {followList.map((item) => {
            const u =
              followType === "followers" ? item.follower : item.following;

            if (!u) return null;

            return (
              <Box
                key={u._id}
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{
                  py: 1,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f0f2f5" },
                }}
                // onClick={() => route.push(`/profile/${u._id}`)}
              >
                <Avatar
                  src={
                    u.avatar
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${u.avatar}`
                      : "/user/default-user.png"
                  }
                />
                <Typography fontWeight={600}>{u.name}</Typography>
              </Box>
            );
          })}

          {followList.length === 0 && (
            <Typography color="text.secondary" textAlign="center">
              Chưa có dữ liệu
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfileDetail;
