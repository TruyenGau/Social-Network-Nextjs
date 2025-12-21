"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

interface Props {
  open: boolean;
  postId: string;
  session: any;
  onClose: () => void;
  onShared: () => void;
}

export default function SharePostModal({
  open,
  postId,
  session,
  onClose,
  onShared,
}: Props) {
  const toast = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}/share`,
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { content },
      });

      toast.success("Đã chia sẻ bài viết");
      setContent("");
      onShared();
      onClose();
    } catch (err) {
      toast.error("Chia sẻ thất bại");
    } finally {
      setLoading(false);
    }
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
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* ===== HEADER ===== */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          borderBottom: "1px solid #eee",
        }}
      >
        Chia sẻ bài viết
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            bgcolor: "#f0f2f5",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ===== CONTENT ===== */}
      <DialogContent sx={{ pt: 2 }}>
        {/* USER INFO */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar
            src={
              session?.user?.avatar
                ? session.user.avatar
                : "/user/default-user.png"
            }
          />
          <Box>
            <Typography fontWeight="bold" fontSize={14}>
              {session?.user?.name || "Bạn"}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              Chia sẻ lên bảng tin
            </Typography>
          </Box>
        </Box>

        {/* TEXTAREA */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Hãy nói điều gì đó về bài viết này..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "15px",
              bgcolor: "#f7f7f7",
            },
          }}
        />
      </DialogContent>

      {/* ===== ACTIONS ===== */}
      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleShare}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            borderRadius: 2,
            backgroundColor: "#1877F2",
          }}
        >
          {loading ? "Đang chia sẻ..." : "Chia sẻ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
