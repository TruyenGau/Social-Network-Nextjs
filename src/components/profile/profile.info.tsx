"use client";
import {
  Avatar,
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { UserContext } from "@/lib/track.wrapper";
import { IUser } from "@/types/next-auth";
import ProfileUpdateModal from "./profile.update.modal";
import { useRouter } from "next/navigation";

const ProfileInfomation = () => {
  const { userInfoId } = useContext(UserContext) as IContext;
  const [user, setUser] = useState<IUser | null>(null);

  // 🆕 STATE CHECK FOLLOW
  const [isFollowed, setIsFollowed] = useState<boolean>(false);
  const [loadingFollow, setLoadingFollow] = useState<boolean>(false);

  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const route = useRouter();

  useEffect(() => {
    if (!userInfoId) return;

    const fetchProfile = async () => {
      const res = await sendRequest<IBackendRes<IUser>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${userInfoId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.data) setUser(res.data);
    };

    fetchProfile();
  }, [userInfoId, session?.access_token, openModal]);

  useEffect(() => {
    if (!session?.access_token || !userInfoId) return;

    const checkFollow = async () => {
      const res = await sendRequest<IBackendRes<{ isFollowed: boolean }>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/check/${userInfoId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      setIsFollowed(res?.data?.isFollowed || false);
    };

    checkFollow();
  }, [session?.access_token, userInfoId]);

  if (!user) return null;

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, borderRadius: 3, width: "100%", maxWidth: 400, mx: "auto" }}
    >
      {/* TITLE */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          Thông tin chi tiết
        </Typography>

        {session?.user._id === userInfoId && (
          <Typography
            sx={{ cursor: "pointer", color: "red" }}
            fontWeight={600}
            onClick={() => setOpenModal(true)}
          >
            Cập nhật
          </Typography>
        )}
      </Box>

      {/* NAME */}
      <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
        <Typography variant="h6" fontWeight={600}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          @{user.email.split("@")[0]}
        </Typography>
      </Box>

      {/* DESCRIPTION */}
      {user?.description && (
        <Typography
          variant="body2"
          sx={{ textAlign: "center", fontStyle: "italic", mt: 1 }}
        >
          "{user.description}"
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* INFO LIST */}
      <Stack spacing={1.2}>
        {user?.address && (
          <Typography variant="body2">
            📍 <b>{user.address}</b>
          </Typography>
        )}
        {user?.age && (
          <Typography variant="body2">
            🎂 Tuổi: <b>{user.age}</b>
          </Typography>
        )}
        {user?.gender && (
          <Typography variant="body2">
            🧬 Giới tính: <b>{user.gender}</b>
          </Typography>
        )}
        {user?.school && (
          <Typography variant="body2">
            🎓 Học tại <b>{user.school}</b>
          </Typography>
        )}
        {user?.work && (
          <Typography variant="body2">
            💼 Công việc: <b>{user.work}</b>
          </Typography>
        )}
        {user?.phoneNumber && (
          <Typography variant="body2">
            📞 Phone: <b>{user.phoneNumber}</b>
          </Typography>
        )}
        {user?.createdAt && (
          <Typography variant="body2">
            🗓 Tham gia từ:{" "}
            <b>{new Date(user.createdAt).toLocaleDateString()}</b>
          </Typography>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {session?.user._id !== userInfoId && (
        <>
          <Button
            variant={isFollowed ? "outlined" : "contained"}
            color={isFollowed ? "primary" : "success"}
            fullWidth
            disabled={loadingFollow}
            sx={{ borderRadius: 2, fontWeight: 600 }}
            onClick={async () => {
              if (!session) return alert("Bạn phải đăng nhập!");

              setLoadingFollow(true);

              try {
                if (isFollowed) {
                  await sendRequest({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/${userInfoId}`,
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${session?.access_token}`,
                    },
                  });
                  setIsFollowed(false);
                  await sendRequest<IBackendRes<any>>({
                    url: "/api/revalidate",
                    method: "POST",
                    queryParams: {
                      tag: "fetch-profile-info",
                      secret: "levantruyen",
                    },
                  });
                  route.refresh();
                } else {
                  await sendRequest({
                    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/${userInfoId}`,
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${session?.access_token}`,
                    },
                  });
                  await sendRequest<IBackendRes<any>>({
                    url: "/api/revalidate",
                    method: "POST",
                    queryParams: {
                      tag: "fetch-profile-info",
                      secret: "levantruyen",
                    },
                  });

                  route.refresh();
                  setIsFollowed(true);
                }
              } catch (err) {
                console.log("Follow error:", err);
              }

              setLoadingFollow(false);
            }}
          >
            {isFollowed ? "Đang theo dõi ✓" : "Theo dõi"}
          </Button>

          <Typography
            variant="body2"
            color="error"
            textAlign="right"
            sx={{ cursor: "pointer", marginTop: "10px" }}
          >
            Chặn người dùng
          </Typography>
        </>
      )}

      {/* MODAL UPDATE */}
      {openModal && (
        <ProfileUpdateModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          user={user}
          token={session?.access_token!}
          route={route}
        />
      )}
    </Paper>
  );
};

export default ProfileInfomation;
