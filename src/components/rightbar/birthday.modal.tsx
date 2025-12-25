"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function BirthdayWishModal({
  open,
  user,
  onClose,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [content, setContent] = useState(
    `Chúc mừng sinh nhật ${user.name} 🎂🎉`
  );
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/birthday`,
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          content,
          targetUserId: user._id,
        },
      });

      toast.success("Đã đăng lời chúc");
      onSuccess();
      onClose();
      router.refresh();
    } catch (e) {
      toast.error("Chúc mừng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        🎂 Chúc mừng sinh nhật
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* USER */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar
            src={
              user.avatar
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.avatar}`
                : "/user/default-user.png"
            }
          />
          <Typography fontWeight={600}>{user.name}</Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết lời chúc sinh nhật..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          Đăng chúc mừng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
