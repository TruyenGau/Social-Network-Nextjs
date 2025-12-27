"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

export default function ResetPasswordPage() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }

    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/reset-password`,
      method: "POST",
      body: { token, password },
    });

    setLoading(false);

    if (res?.data?.success) {
      toast.success("Đổi mật khẩu thành công");
      router.push("/auth/signin");
    } else {
      toast.error("Link không hợp lệ hoặc đã hết hạn");
    }
  };

  if (!token) {
    return (
      <Typography align="center" mt={10}>
        Link không hợp lệ
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Đặt lại mật khẩu
        </Typography>

        <TextField
          fullWidth
          type="password"
          label="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          label="Xác nhận mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </Paper>
    </Box>
  );
}
