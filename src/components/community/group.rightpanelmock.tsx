"use client";

import { Box, Card, Typography, Avatar } from "@mui/material";

const cardStyle = {
  p: 2.5,
  borderRadius: 3,
  backgroundColor: "#F8FAFC",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  border: "1px solid #eef1f5",
  mb: 2,
};

const mockMembers = [
  "/user/default-user.png",
  "/user/default-user.png",
  "/user/default-user.png",
  "/user/default-user.png",
  "/user/default-user.png",
  "/user/default-user.png",
];

const GroupRightPanelMock = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 16,
        width: 320,
        display: { xs: "none", lg: "block" },
      }}
    >
      {/* GIỚI THIỆU */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16}>
          Giới thiệu
        </Typography>

        <Typography fontSize={14} color="#444" mt={1}>
          Nhóm chia sẻ kiến thức, học tập và trao đổi kinh nghiệm.
        </Typography>

        <Box mt={2}>
          <Typography fontSize={13}>
            🌐 <b>PUBLIC</b>
          </Typography>
          <Typography fontSize={13}>👁️ Hiển thị công khai</Typography>
          <Typography fontSize={13}>📍 Việt Nam</Typography>
        </Box>
      </Card>

      {/* THÀNH VIÊN NỔI BẬT */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1}>
          Thành viên nổi bật
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {mockMembers.map((src, i) => (
            <Avatar
              key={i}
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${src}`}
              sx={{ width: 40, height: 40 }}
            />
          ))}
        </Box>

        <Typography
          mt={1.5}
          fontSize={13}
          color="#1877f2"
          sx={{ cursor: "pointer" }}
        >
          Xem tất cả
        </Typography>
      </Card>

      {/* HOẠT ĐỘNG GẦN ĐÂY */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1}>
          Hoạt động gần đây
        </Typography>

        <Typography fontSize={13} color="text.secondary">
          • Admin đã đăng bài mới
        </Typography>
        <Typography fontSize={13} color="text.secondary">
          • Có thành viên mới tham gia
        </Typography>
        <Typography fontSize={13} color="text.secondary">
          • Bài viết được ghim
        </Typography>
      </Card>

      {/* NỘI QUY */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1}>
          Nội quy nhóm
        </Typography>

        <Typography fontSize={13}>✔️ Tôn trọng thành viên</Typography>
        <Typography fontSize={13}>✔️ Không spam, quảng cáo</Typography>
        <Typography fontSize={13}>✔️ Nội dung phù hợp</Typography>
      </Card>

      {/* THỐNG KÊ */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1}>
          Thống kê
        </Typography>

        <Typography fontSize={13}>👥 1 thành viên</Typography>
        <Typography fontSize={13}>📝 2 bài viết</Typography>
        <Typography fontSize={13}>📅 Tạo ngày 18/12/2025</Typography>
      </Card>
    </Box>
  );
};

export default GroupRightPanelMock;
