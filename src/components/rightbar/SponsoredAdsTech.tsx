"use client";

import { Box, Typography, Paper, Avatar, Button } from "@mui/material";

const SponsoredAdsTech = () => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "none",
        border: "1px solid #e4e6eb",
      }}
    >
      {/* TITLE */}
      <Typography fontSize={13} fontWeight={600} color="#65676B" sx={{ mb: 1 }}>
        Quảng cáo được tài trợ
      </Typography>

      {/* ADS IMAGE */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
        alt="ads-tech"
        sx={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          borderRadius: 2,
          mb: 1.2,
        }}
      />

      {/* PAGE INFO */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar
          src="https://images.unsplash.com/photo-1611162617213-7c1c35c8c1b2"
          sx={{ width: 35, height: 35 }}
        />
        <Box>
          <Typography fontWeight={600} fontSize={14}>
            TigerStudy Academy
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            tigerstudy.vn
          </Typography>
        </Box>
      </Box>

      {/* ADS TEXT */}
      <Typography fontSize={13} color="text.secondary" mb={2}>
        Học lập trình, AI và công nghệ hiện đại với lộ trình rõ ràng, dự án thực
        tế và mentor hỗ trợ 1–1 dành cho sinh viên và người đi làm.
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
        Xem khóa học
      </Button>
    </Paper>
  );
};

export default SponsoredAdsTech;
