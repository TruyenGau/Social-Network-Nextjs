"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Checkbox,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { IUser } from "@/types/next-auth";
import { message } from "antd";

const InviteFriendsDialog = ({
  open,
  onClose,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
}) => {
  const { data: session } = useSession();

  const [friends, setFriends] = useState<IUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !session) return;

    setLoading(true);
    sendRequest<IBackendRes<IUser[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/invite-friends`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => {
        setFriends(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [open, session, groupId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleInvite = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    const res = await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/invite`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { userIds: selectedIds },
    });
    if (res) {
      message.success("Gửi lời mời thành công!");
    }

    setLoading(false);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 18,
          pb: 1,
        }}
      >
        Mời bạn vào nhóm
      </DialogTitle>

      <Divider />

      {/* CONTENT */}
      <DialogContent
        sx={{
          maxHeight: 360,
          px: 2,
        }}
      >
        {loading && (
          <Typography sx={{ py: 2 }} color="text.secondary">
            Đang tải danh sách bạn bè...
          </Typography>
        )}

        {!loading && friends.length === 0 && (
          <Typography sx={{ py: 2 }} color="text.secondary">
            Không có bạn bè để mời
          </Typography>
        )}

        {!loading &&
          friends.map((u) => {
            const checked = selectedIds.includes(u._id);

            return (
              <Box
                key={u._id}
                onClick={() => toggleSelect(u._id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                  py: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "#f5f7fa",
                  },
                }}
              >
                {/* LEFT */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={
                      u.avatar
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${u.avatar}`
                        : "/user/default-user.png"
                    }
                    sx={{ width: 42, height: 42 }}
                  />
                  <Typography fontWeight={500}>{u.name}</Typography>
                </Box>

                {/* RIGHT */}
                <Checkbox
                  checked={checked}
                  onChange={() => toggleSelect(u._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            );
          })}
      </DialogContent>

      <Divider />

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography fontSize={13} color="text.secondary">
          Đã chọn {selectedIds.length} người
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} sx={{ fontWeight: 600 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={selectedIds.length === 0 || loading}
            onClick={handleInvite}
            sx={{
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
            }}
          >
            Gửi lời mời
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default InviteFriendsDialog;
