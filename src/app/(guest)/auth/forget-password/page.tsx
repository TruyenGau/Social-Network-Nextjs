"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

export default function ForgetPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);

    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/forgot-password`,
      method: "POST",
      body: { email },
    });

    setLoading(false);

    if (res?.data?.success) {
      toast.success("Đã gửi email khôi phục mật khẩu");
      setEmail("");
    } else {
      toast.error(res?.message || "Không tìm thấy email");
    }
  };

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
          Quên mật khẩu
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Nhập email đã đăng ký để nhận link đặt lại mật khẩu
        </Typography>

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Gửi email"}
        </Button>
      </Paper>
    </Box>
  );
}
