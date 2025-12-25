"use client";

import { Box, Typography, Paper, Avatar, Button } from "@mui/material";

/* =======================
 * REUSABLE AD CARD
 * ======================= */
interface AdProps {
  image: string;
  avatar: string;
  title: string;
  subtitle?: string;
  description: string;
  buttonText: string;
}

const SponsoredAdCard = ({
  image,
  avatar,
  title,
  subtitle,
  description,
  buttonText,
}: AdProps) => {
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

      {/* IMAGE */}
      <Box
        component="img"
        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${image}`}
        alt="ads"
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
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${avatar}`}
          sx={{ width: 35, height: 35 }}
        />
        <Box>
          <Typography fontWeight={600} fontSize={14}>
            {title}
          </Typography>
          {subtitle && (
            <Typography fontSize={12} color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* DESCRIPTION */}
      <Typography fontSize={13} color="text.secondary" mb={2}>
        {description}
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
        {buttonText}
      </Button>
    </Paper>
  );
};

/* =======================
 * GROUP COMPONENT
 * ======================= */
const SponsoredAdsGroup = () => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* TRAVEL AD */}
      <SponsoredAdCard
        image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
        avatar="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
        title="GoTrip Vietnam"
        subtitle="gotrip.vn"
        description="Khám phá những điểm đến tuyệt đẹp khắp Việt Nam với các tour trọn gói, giá ưu đãi và trải nghiệm đáng nhớ."
        buttonText="Đặt tour ngay"
      />

      {/* TECH / EDUCATION AD */}
      <SponsoredAdCard
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
        avatar="https://images.unsplash.com/photo-1611162617213-7c1c35c8c1b2"
        title="TigerStudy Academy"
        subtitle="tigerstudy.vn"
        description="Học lập trình, AI và công nghệ hiện đại với lộ trình rõ ràng, dự án thực tế và mentor hỗ trợ 1–1."
        buttonText="Xem khóa học"
      />
    </Box>
  );
};

export default SponsoredAdsGroup;
