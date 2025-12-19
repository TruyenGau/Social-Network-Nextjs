"use client";

import {
  Box,
  Card,
  Avatar,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

export default function InvitedGroups() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<IInvitedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  const fetchInvites = async () => {
    if (!session) return;

    setLoading(true);
    const res = await sendRequest<IBackendRes<IInvitedGroup[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/invited/getall`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setGroups(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, [session]);

  const handleAction = async (groupId: string, type: "accept" | "reject") => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/${type}-invite`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    toast.success(
      type === "accept" ? "Bạn đã tham gia nhóm" : "Bạn đã từ chối lời mời"
    );

    if (type === "accept") {
      router.push(`/community/${groupId}`); // ✅ SẼ NHẢY NGAY
      return;
    }

    // reject thì chỉ reload danh sách
    fetchInvites();
  };

  return (
    <Box
      sx={{
        maxWidth: 720,
        mx: "auto",
        mt: "90px",
        px: 2,
      }}
    >
      {/* TITLE */}
      <Typography
        variant="h5"
        fontWeight={700}
        mb={3}
        sx={{ textAlign: "center" }}
      >
        Lời mời vào nhóm
      </Typography>

      {loading && (
        <Typography textAlign="center" color="text.secondary">
          Đang tải lời mời...
        </Typography>
      )}

      {!loading && groups.length === 0 && (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Bạn không có lời mời nào
        </Typography>
      )}

      {!loading &&
        groups.map((g) => (
          <Card
            key={g._id}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              background: "#fff",
              border: "1px solid #eee",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* INFO */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={
                  g.avatar
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${g.avatar}`
                    : "/group/default-group.png"
                }
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700} fontSize={16}>
                  {g.name}
                </Typography>
                <Typography fontSize={13} color="text.secondary">
                  👥 {g.membersCount} thành viên
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* ACTIONS */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
                onClick={() => handleAction(g._id, "reject")}
              >
                Từ chối
              </Button>

              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background:
                    "linear-gradient(135deg, #1877f2 0%, #4f9cff 100%)",
                }}
                onClick={() => handleAction(g._id, "accept")}
              >
                Chấp nhận
              </Button>
            </Stack>
          </Card>
        ))}
    </Box>
  );
}
