"use client";

import { Box, Typography, Divider, Button, Paper, Stack } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";

import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { UserContext } from "@/lib/track.wrapper";
import { IUser } from "@/types/next-auth";
import ProfileUpdateModal from "./profile.update.modal";
import { useRouter } from "next/navigation";
import ReportUserModal from "../report/report.user.modal";

/* ================= INFO ROW ================= */
const InfoRow = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    <Box sx={{ color: "#65676B", display: "flex" }}>{icon}</Box>
    <Typography fontSize={14} color="#050505">
      {text}
    </Typography>
  </Box>
);

/* ================= MAIN ================= */
const ProfileInfomation = () => {
  const { userInfoId } = useContext(UserContext) as IContext;
  const [user, setUser] = useState<IUser | null>(null);

  const [isFollowed, setIsFollowed] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const { data: session } = useSession();
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const [openReport, setOpenReport] = useState(false);

  /* FETCH USER */
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

  /* CHECK FOLLOW */
  useEffect(() => {
    if (!session?.access_token || !userInfoId) return;

    sendRequest<IBackendRes<{ isFollowed: boolean }>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/check/${userInfoId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }).then((res) => setIsFollowed(res?.data?.isFollowed || false));
  }, [session?.access_token, userInfoId]);

  if (!user) return null;

  return (
    <Box
      sx={{
        p: 2.5,
        maxWidth: 360,
        borderRadius: 3,
        backgroundColor: "#f7f8fa", // 👈 nền xám rất nhẹ
        border: "1px solid #e4e6eb",
      }}
    >
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={15} fontWeight={700}>
          Giới thiệu
        </Typography>

        {session?.user._id === userInfoId && (
          <Typography
            fontSize={14}
            color="#1877F2"
            fontWeight={600}
            sx={{ cursor: "pointer" }}
            onClick={() => setOpenModal(true)}
          >
            Cập nhật
          </Typography>
        )}
      </Box>

      {/* NAME */}
      <Box textAlign="center" mt={1.5}>
        <Typography fontSize={18} fontWeight={700}>
          {user.name}
        </Typography>
        <Typography fontSize={14} color="#65676B">
          @{user.email.split("@")[0]}
        </Typography>
      </Box>

      {/* BIO */}
      {user.description && (
        <Typography
          fontSize={14}
          color="#65676B"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          “{user.description}”
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* INFO */}
      <Stack spacing={1.6}>
        {user.address && (
          <InfoRow
            icon={<LocationOnIcon fontSize="small" />}
            text={
              <>
                Sống tại <b>{user.address}</b>
              </>
            }
          />
        )}

        {user.age && (
          <InfoRow
            icon={<CakeIcon fontSize="small" />}
            text={
              <>
                Tuổi <b>{user.age}</b>
              </>
            }
          />
        )}

        {user.gender && (
          <InfoRow
            icon={<WcIcon fontSize="small" />}
            text={
              <>
                Giới tính <b>{user.gender}</b>
              </>
            }
          />
        )}

        {user.school && (
          <InfoRow
            icon={<SchoolIcon fontSize="small" />}
            text={
              <>
                Học tại <b>{user.school}</b>
              </>
            }
          />
        )}

        {user.work && (
          <InfoRow
            icon={<WorkIcon fontSize="small" />}
            text={
              <>
                Công việc <b>{user.work}</b>
              </>
            }
          />
        )}

        {user.phoneNumber && (
          <InfoRow
            icon={<PhoneIcon fontSize="small" />}
            text={
              <>
                Phone <b>{user.phoneNumber}</b>
              </>
            }
          />
        )}

        {user.createdAt && (
          <InfoRow
            icon={<EventIcon fontSize="small" />}
            text={
              <>
                Tham gia <b>{new Date(user.createdAt).toLocaleDateString()}</b>
              </>
            }
          />
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* ACTION */}
      {session?.user._id !== userInfoId && (
        <>
          <Button
            fullWidth
            variant={isFollowed ? "outlined" : "contained"}
            color="primary"
            disabled={loadingFollow}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
            }}
            onClick={async () => {
              setLoadingFollow(true);
              await sendRequest({
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/${userInfoId}`,
                method: isFollowed ? "DELETE" : "POST",
                headers: {
                  Authorization: `Bearer ${session?.access_token}`,
                },
              });
              setIsFollowed(!isFollowed);
              router.refresh();
              setLoadingFollow(false);
            }}
          >
            {isFollowed ? "Đang theo dõi" : "Theo dõi"}
          </Button>

          <Typography
            fontSize={13}
            color="#e41e3f"
            textAlign="right"
            sx={{ mt: 1, cursor: "pointer" }}
            onClick={() => setOpenReport(true)}
          >
            Báo cáo người dùng
          </Typography>
        </>
      )}

      {openModal && (
        <ProfileUpdateModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          user={user}
          token={session?.access_token!}
          route={router}
        />
      )}

      {openReport && (
        <ReportUserModal
          open={openReport}
          onClose={() => setOpenReport(false)}
          userId={userInfoId + ""}
        />
      )}
    </Box>
  );
};

export default ProfileInfomation;
