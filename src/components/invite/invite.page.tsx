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
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Lời mời vào nhóm
      </Typography>

      {loading && <Typography>Đang tải...</Typography>}

      {!loading && groups.length === 0 && (
        <Typography color="text.secondary">Bạn không có lời mời nào</Typography>
      )}

      {!loading &&
        groups.map((g) => (
          <Card
            key={g._id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={
                  g.avatar
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${g.avatar}`
                    : "/group/default-group.png"
                }
                sx={{ width: 56, height: 56 }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{g.name}</Typography>
                <Typography fontSize={13} color="text.secondary">
                  {g.membersCount} thành viên
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleAction(g._id, "reject")}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
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
