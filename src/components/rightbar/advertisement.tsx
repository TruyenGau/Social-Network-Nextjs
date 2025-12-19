"use client";

import { Box, Typography, Paper, Avatar, Button } from "@mui/material";

const SponsoredAds = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3, // ~12px
        backgroundColor: "#fff",
        boxShadow: "none",
        border: "1px solid #e4e6eb",
      }}
    >
      {/* TITLE */}
      <Typography
        fontSize={13}
        fontWeight={600}
        color="#65676B"
        sx={{ mb: 1 }} // 👈 thêm khoảng cách
      >
        Quảng cáo được tài trợ
      </Typography>

      {/* ADS IMAGE */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1600891964092-4316c288032e"
        alt="ads"
        sx={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          borderRadius: 2,
          mb: 1.2, // 👈 cách avatar giống FB
        }}
      />

      {/* PAGE INFO */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar
          src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
          sx={{ width: 35, height: 35 }}
        />
        <Typography fontWeight={600} fontSize={14}>
          BigChef Lounge
        </Typography>
      </Box>

      {/* ADS TEXT */}
      <Typography fontSize={13} color="text.secondary" mb={2}>
        Thèm món ngon và một không gian thư giãn? BigChef Lounge mang đến ẩm
        thực cao cấp trong môi trường thoải mái và tinh tế.
      </Typography>

      {/* BUTTON */}
      <Button
        fullWidth
        sx={{
          textTransform: "none",
          fontSize: 13,
          fontWeight: 600,
          bgcolor: "#e4e6eb",
          color: "#050505",
          boxShadow: "none",
          "&:hover": { bgcolor: "#d8dadd" },
        }}
      >
        Tìm hiểu thêm
      </Button>
    </Paper>
  );
};

export default SponsoredAds;
