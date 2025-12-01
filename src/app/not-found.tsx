"use client";
import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bgcolor: "#ffffffff",
        p: 3,
      }}
    >
      {/* HÌNH ẢNH LỖI */}
      <Image
        src="/user/404-not-found.jpg" // tự bỏ hình vào /public/images/
        alt="404 Not Found"
        width={800}
        height={400}
        style={{ marginBottom: "24px" }}
      />

      {/* TIÊU ĐỀ */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        Oops! Trang bạn tìm không tồn tại 😢
      </Typography>

      {/* MÔ TẢ */}
      <Typography variant="body1" sx={{ color: "gray", mb: 3, maxWidth: 400 }}>
        Có thể đường dẫn đã bị thay đổi, hoặc trang này đã bị xóa. Hãy kiểm tra
        lại hoặc quay về trang chủ nhé!
      </Typography>

      {/* NÚT TRỞ VỀ TRANG CHỦ */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          sx={{
            px: 4,
            py: 1.2,
            borderRadius: 50,
            textTransform: "none",
            fontWeight: "bold",
            bgcolor: "#1976d2",
            ":hover": { bgcolor: "#0b5dbb" },
          }}
        >
          ⬅ Quay về trang chủ
        </Button>
      </Link>
    </Box>
  );
}
